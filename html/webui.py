#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#


import json
import time
from functools import wraps
from jarvis import Database
from flask import Flask, render_template, session, redirect
from flask.wrappers import Response

app = Flask(__name__, static_url_path="",
            static_folder="", template_folder="templates")
app.config['TEMPLATES_AUTO_RELOAD'] = True


def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'login_user' in session:
            return f(*args, **kwargs)
        else:
            return redirect("/login", code=302)
    return wrap


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login")
def login():
    return render_template("pages/login.html")


# API requests
@app.route("/api/db-stats")
def api_dbstats():
    result = Database().table("analytics").filter(lambda y: "stats" in y and y["timestamp"] + (60*60*24*7) > time.time())
    return Response(json.dumps(result), content_type="application/json")


app.run(host="0.0.0.0", port=80)
