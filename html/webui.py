#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#


import io
import json
import time
import tempfile
import traceback
from datetime import datetime

from core.Skill import Skill
from core.Slot import Slot
from core.Intent import Intent
from core.User import User
from functools import wraps
from jarvis import Database, Security, Config
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


# Decorator functions like @login_required
from backend.variables import *

# Decorator functions like @login_required
from backend.decorators import *

# Jinja filters
from backend.filters import *

# Default endpoints like assistant, login, etc...
import backend.defaults

# Backend endpoints, /skill/..., /intent/...
import backend.skill
import backend.slot
import backend.intent
import backend.logs

# API functions
import backend.api.train
import backend.api.skill
import backend.api.slot
import backend.api.intent
import backend.api.device
import backend.api.api


# Start the application
# app.run(host="0.0.0.0", port=443, ssl_context=context)
app.run(host="0.0.0.0", port=80)
