"""
Copyright (c) 2021 Philipp Scheer
"""


from __main__ import app, API_endpoint
import json
import time
import traceback
from jarvis import Database, Config
from flask import request, session
from flask.wrappers import Response
from ..decorators import login_required
from ..variables import ICONS


@app.route("/api/db-stats")
@login_required
def api_dbstats():
    result = list(Database().table("analytics").find({
        "timestamp": {"$gt": time.time() - (60*60*24*7)}
    }).sort("timestamp"))
    return Response(json.dumps(result), content_type="application/json")


@app.route("/api/version")
@login_required
def api_jarvis_version():
    return Response(json.dumps(API_endpoint("update/status", {})), content_type="application/json")


@app.route("/api/host", methods=["POST"])
@login_required
def api_host_info():
    res = list(Database().table("analytics").find({
        "$and": [
            {
                "type": { "$eq": "system" } # only include statistics for the current system
            },
            {
                "timestamp": { "$gt": int(time.time()) - ( 60 * 60 * 2 ) } # include data from 2 hrs
                                                                            # the couchdb limit is 25, so 25 * 5 minutes = 2.08h are possible
            }
        ]
    }))
    def stripper(el):
        del el["_id"]
        del el["_rev"]
        del el["type"]
        return el
    res = list(map(stripper, res))
    return Response(json.dumps({"success": True, "data": res}), content_type="application/json")

@app.route("/api/search-icon")
@login_required
def api_iconsearch():
    # return non existing file if string is empty or none
    search = request.args.get("search", "xxyyzz")
    f = []
    max = 18
    if search.strip() == "":
        f = ICONS
    else:
        f = [x for x in ICONS if search in x]
    return Response(json.dumps(f), content_type="application/json")
