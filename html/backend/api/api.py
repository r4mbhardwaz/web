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


@app.route("/api/update/download", methods=["POST"])
@login_required
def api_update_download():
    return Response(json.dumps(API_endpoint("update/download", {})), content_type="application/json")


@app.route("/api/update/install", methods=["POST"])
@login_required
def api_update_install():
    return Response(json.dumps(API_endpoint("update/install", {})), content_type="application/json")


@app.route("/api/update/poll", methods=["POST"])
@login_required
def api_update_poll():
    return Response(json.dumps(API_endpoint("update/poll", {})), content_type="application/json")


@app.route("/api/update/schedule", methods=["POST"])
@login_required
def api_update_schedule():
    json_data = request.get_json(force=True)
    max_future_days = 30
    def set_schedule(key):
        if not isinstance(json_data[key], int):
            return Response(json.dumps({"success": False, "error": f"The given {key} timestamp is not an integer!"}), content_type="application/json")
        if json_data[key] < time.time():
            return Response(json.dumps({"success": False, "error": "The date has to be in the future!"}), content_type="application/json")
        if json_data[key] > time.time() + (60 * 60 * 24 * (max_future_days + 1)):
            return Response(json.dumps({"success": False, "error": f"The date has to be a maximum of {max_future_days} days in the future!"}), content_type="application/json")
        cnf = Config()
        cnf.set(f"schedule-{key}", json_data[key])
        return Response(json.dumps({"success": True}), content_type="application/json")
    if "install" in json_data:
        return set_schedule("install")
    if "download" in json_data:
        return set_schedule("download")
    return Response(json.dumps({"success": False, "error": "You can only schedule an installation or download!"}))


@app.route("/api/update/schedule/cancel", methods=["POST"])
@login_required
def api_cancel_scheduled_update():
    try:
        cnf = Config()
        cnf.set("schedule-install", False)
        return Response(json.dumps({"success": True}))
    except Exception:
        return Response(json.dumps({"success": False, "error": "Database connection failed"}))


@app.route("/api/test")
@app.route("/api/test/<id>")
def api_test(id=None):
    all_props = "accept_charsets accept_encodings accept_languages accept_mimetypes access_route args authorization base_url blueprint cache_control charset content_encoding content_length content_md5 content_type cookies data date disable_data_descriptor encoding_errors endpoint files form full_path headers host host_url if_match if_modified_since if_none_match if_range if_unmodified_since stream input_stream is_json is_multiprocess is_multithread is_run_once is_secure is_xhr json max_content_length max_form_memory_size max_forwards method mimetype mimetype_params module path pragma query_string range referrer remote_addr remote_user routing_exception scheme script_root trusted_hosts url url_charset url_root url_rule user_agent values view_args want_form_data_parsed".split(" ")
    obj = {}
    for prop in all_props:
        print(prop)
        try:
            print(getattr(request, prop))
            obj[prop] = str(getattr(request, prop))
        except Exception:
            traceback.print_exc()
    return json.dumps(obj)


@app.route("/api/logs/get", methods=["GET"])
@login_required
def api_get_all_logs():
    max_minutes = int(request.args.get("min", -1))
    min_severity = int(request.args.get("sev", 0))
    severities = ["S", "I", "W", "E", "C"]
    filter_severities = severities[min_severity:]
    try:
        logs = list(Database().table("logs").find({
                "timestamp": { "$gt": time.time() - max_minutes },
                "importance": { "$in": filter_severities }
            }).sort("timestamp").reverse()) # newest first
        for i in range(len(logs)):
            del logs[i]["_id"]
            del logs[i]["_rev"]
        return Response(json.dumps({"success": True, "logs": logs, "length": len(logs)}), content_type="application/json")
    except Exception:
        print(traceback.format_exc())
        return Response(json.dumps({"success": False, "error": "Database connection failed"}), content_type="application/json")


@app.route("/api/logs/delete", methods=["POST"])
@login_required
def api_delete_all_logs():
    try:
        Database().table("logs").all().delete()
        return Response(json.dumps({"success": True}))
    except Exception:
        return Response(json.dumps({"success": False, "error": "Database connection failed"}), content_type="application/json")


@app.route("/api/log/delete", methods=["POST"])
@login_required
def api_delete_one_log():
    json_data = request.get_json(force=True)
    if "timestamp" in json_data and "referrer" in json_data and "tag" in json_data:
        try:
            Database().table("logs").find({
                "timestamp": { "$eq": json_data["timestamp"] },
                "referrer":  { "$eq": json_data["referrer"]  },
                "tag":       { "$eq": json_data["tag"]       }
            }).delete()
            return Response(json.dumps({"success": True}))
        except Exception:
            return Response(json.dumps({"success": False, "error": "Database connection failed"}), content_type="application/json")
    else:
        return Response(json.dumps({"success": False, "error": "Need to provide fields 'timestamp', 'referrer' and 'tag'"}), content_type="application/json")


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
    return Response(json.dumps({"success": True, "data": res}))


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

