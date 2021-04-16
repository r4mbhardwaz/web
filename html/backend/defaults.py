from __main__ import *
from jarvis import Config, Security, Database

@app.route("/")
def index():
    cnf = Config()
    version = cnf.get("version", None)
    return render_template("index.html", 
                            config_size=Database().table("assistant").size, 
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
    return render_template("assistant.html", skills=list(Database().table("skills").all().sort("created-at").reverse()))


@app.route("/updates")
@login_required
def updates():
    cnf = Config()
    version = cnf.get("version", None)
    return render_template("updates.html", 
                            version=version)