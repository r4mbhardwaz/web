"""
Copyright (c) 2021 Philipp Scheer
"""


import json
from __main__ import Skill, Intent, app
from flask.wrappers import Response
from flask import render_template, redirect
from .decorators import login_required


@app.route("/devkit", methods=["GET"])
@login_required
def devkit():
    return render_template("pages/devkit.html")