"""
Copyright (c) 2021 Philipp Scheer
"""



from __main__ import app
from flask import render_template
from .decorators import login_required


@app.route("/logs")
@login_required
def logs():
    return render_template("logs.html")
