#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#


import io
import json
import time
import tempfile
import traceback
import requests
from datetime import datetime

from core.Skill import Skill
from core.Slot import Slot
from core.Intent import Intent
from functools import wraps
from jarvis import Database, Security, Config, Logger, Exiter, User
from flask import Flask, render_template, session, redirect, request
from flask.wrappers import Response
from flask_babel import Babel, format_datetime

# context = Security.ssh_context()

app = Flask(__name__, static_url_path="", static_folder="", template_folder="templates")
app.config['TEMPLATES_AUTO_RELOAD'] = True
# app.secret_key = Security.id(128)
app.secret_key = "abc"
babel = Babel(app)


import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)


http_api_port = Config().get("http-api", {
    "port": 5521
})["port"]
http_port = Config().get("http", {
    "port": 5520
})["port"]


def wait_for_database():
    try:
        running = Database.reachable()
        wait_index = 0
        wait_time  = [1, 3, 5, 10, 30, 60]
        while not running and Exiter.running:
            running = Database.reachable()
            Logger.e1("HealthCheck", "Error", f"Database is not running. Retrying in {wait_time[wait_index]}s", "")
            time.sleep(wait_time[wait_index])
            if not (wait_index + 1 >= len(wait_time)):
                wait_index += 1
    except Exception:
        Logger.e1("HealthCheck", "Error", "Failed to check Database availability", traceback.format_exc())

wait_for_database()

def API_endpoint(path, data):
    user = User.from_id(session["uid"])
    if user:
        x = requests.post(f"http://127.0.0.1:{http_api_port}/{path}", json={**data, **{ 
            "$username": user.username,
            "$password": user.password
        }}).json()
        return x
    else:
        return { "success": False, "error": "Invalid user" }



# Decorator functions like @login_required
from backend.variables import *

# Decorator functions like @login_required
from backend.decorators import *

# Jinja filters
from backend.filters import *

# Default endpoints like assistant, login, etc...
import backend.pages

# Backend endpoints, /skill/..., /intent/...
import backend.skill
import backend.slot
import backend.intent

# API functions
import backend.api


# Start the application
# app.run(host="0.0.0.0", port=443, ssl_context=context)
app.run(host="0.0.0.0", port=http_port) # default: 5520
