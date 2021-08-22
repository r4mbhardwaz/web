"""
Copyright (c) 2021 Philipp Scheer
"""


import os
import json
from __main__ import app, API_endpoint, Response
from flask import request
from ..decorators import login_required


app_directory = "/jarvis/server/satellite/apps"


@app.route("/api/devkit/folders", methods=["GET"])
@login_required
def api_devkit_folders():
    global app_directory

    def path_to_dict(path):
        d = {
            'name': os.path.basename(path),
            'path': os.path.abspath(path)
        }
        if os.path.isdir(path):
            d['type'] = "directory"
            d['children'] = [path_to_dict(os.path.join(path,x)) for x in os.listdir(path)]
        else:
            d['type'] = "file"
        return d

    listing = path_to_dict(app_directory)["children"]

    return Response(json.dumps({ "success": True, "result": listing }), content_type="application/json")


@app.route("/api/devkit/file", methods=["POST"])
@login_required
def api_devkit_get_file():
    json_data = request.get_json(force=True)
    if "path" not in json_data:
        return Response(json.dumps({ "success": False, "error": "A path is required" }), content_type="application/json")
    path = json_data["path"]
    if not path.startswith(app_directory):
        return Response(json.dumps({ "success": False, "error": "Permission denied. Only files inside the app directories are allowes" }), content_type="application/json")
    try:
        with open(path, "r") as f:
            contents = f.read()
            return Response(json.dumps({ "success": True, "result": contents }), content_type="application/json")
    except Exception as e:
            return Response(json.dumps({ "success": False, "error": "Unknown error while reading file" }), content_type="application/json")


@app.route("/api/devkit/file", methods=["PUT"])
def api_devkit_put_file():
    json_data = request.get_json(force=True)
    if "path" not in json_data or "content" not in json_data:
        return Response(json.dumps({ "success": False, "error": "Path and content are required" }), content_type="application/json")
    path    = json_data["path"]
    content = json_data["path"]
    if not path.startswith(app_directory):
        return Response(json.dumps({ "success": False, "error": "Permission denied. Only files inside the app directories are allowes" }), content_type="application/json")
    try:
        with open(path, "w") as f:
            f.write(content)
            return Response(json.dumps({ "success": True }), content_type="application/json")
    except Exception as e:
            return Response(json.dumps({ "success": False, "error": "Unknown error while writing file" }), content_type="application/json")
