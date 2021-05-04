"""
Copyright (c) 2021 Philipp Scheer
"""


from __main__ import app, render_template, login_required

@app.route("/logs")
@login_required
def logs():
    return render_template("logs.html")
