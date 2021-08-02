from __main__ import *
from flask import render_template, redirect, session, request
from .decorators import login_required
from jarvis import Config, Security, Database


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
    return render_template("login.html")


@app.route("/login", methods=['POST'])
def login_post():
    username = request.form["username"]
    password = request.form["password"]

    result = Database().table("users").find({
        "username": username,
        "password": Security.password_hash(password)
    })
    success = result.found
    url = session["redirect_url"] if "redirect_url" in session else "/"

    if success:
        session["login_user"] = result[0]["username"]
        return redirect(url, code=302)

    return render_template("login.html", success=False, url=url)


@app.route("/assistant")
@login_required
def assistant():
    return render_template("assistant.html", skills=Skill.all())


@app.route("/updates")
@login_required
def updates():
    cnf = Config()
    version = cnf.get("version", None)
    return render_template("updates.html", version=version)


@app.route("/devices")
@login_required
def devices():
    return render_template("devices.html")

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
        
@app.route("/people")
@login_required
def people():
    return render_template("people.html")
