from __main__ import app, Skill, User
from flask import render_template, redirect, session, request
from .decorators import login_required
from jarvis import Config, Security, Database
import traceback


@app.route("/")
@login_required
def index():
    cnf = Config()
    version = cnf.get("version", None)
    return render_template("index.html", 
                            config_size=Database().table("assistant").size, 
                            logs_size=Database().table("logs").size,
                            log_entries_count=Database().table("logs").count,
                            version=version)


@app.route("/login", methods=['GET'])
def login_get():
    session["redirect_url"] = request.args.get("url", "/")

    if User.count() == 0:
        return redirect("/register", code=302)

    return render_template("pages/login.html")


@app.route("/login", methods=['POST'])
def login_post():
    username = request.form["username"]
    password = request.form["password"]

    url = session["redirect_url"] if "redirect_url" in session else "/"

    user_id = User.validate(username, password)
    if user_id:
        session["uid"] = user_id
        return redirect(url, code=302)

    return render_template("pages/login.html", success=False, url=url)


@app.route("/register", methods=['GET'])
def register_get():
    return render_template("pages/login.html", register=True, register_is_first=User.count()==0)


@app.route("/register", methods=['POST'])
def register_post():
    try:
        username = request.form["username"]
        password = request.form["password"]
        name = request.form["name"]

        settings = {}
        settings_keys_prefix = "privacy-"
        settings_keys = ["location", "contacts", "calendar"]
        for key in settings_keys:
            full_key = f"{settings_keys_prefix}{key}"
            if full_key in request.form:
                print(request.form[full_key])
                settings[key] = request.form[full_key] == "on"
            else:
                settings[key] = False

        Config().set("web-allow-registrations", "allow-registrations" in request.form and request.form["allow-registrations"] == "on")

        # ABOVE LINE WORKS

        url = session["redirect_url"] if "redirect_url" in session else "/"

        new_user = User.new(username, password, { "name": name, "privacy": settings })
        if new_user:
            session["uid"] = new_user.id
            return redirect(url, code=302)
        else:
            return redirect("/register?error", code=302)
    except Exception:
        print(traceback.format_exc())


@app.route("/assistant")
@login_required
def assistant():
    return render_template("pages/assistant.html", skills=Skill.all())


@app.route("/updates")
@login_required
def updates():
    cnf = Config()
    version = cnf.get("version", None)
    return render_template("pages/updates.html", version=version)


@app.route("/logs")
@login_required
def logs():
    return render_template("pages/logs.html")


@app.route("/privacy")
@login_required
def privacy_policy():
    return render_template("pages/privacy.html")


@app.route("/terms")
@login_required
def terms_of_service():
    return render_template("pages/terms.html")


@app.route("/talk")
@login_required
def talk():
    return render_template("pages/talk.html")


@app.route("/devices")
@login_required
def devices():
    return render_template("pages/devices.html")


@app.route("/device/<dev_id>")
@login_required
def device_info(dev_id: str):
    dev = Database().table("devices").find({ "_id": { "$eq" : dev_id } })
    if not dev.found:
        return redirect("/devices", code=302)
    dev = dev[0]
    dev["id"] = dev["_id"]
    del dev["_id"]
    del dev["_rev"]
    return render_template("devices/info.html", device=dev)


@app.route("/_session")
def show_session():
    return dict(session)