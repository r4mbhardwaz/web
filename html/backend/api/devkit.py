"""
Copyright (c) 2021 Philipp Scheer
"""


import os
import json
from __main__ import app, API_endpoint, Response
from ..decorators import login_required


@app.route("/api/devkit/folders", methods=["GET"])
@login_required
def api_devkit_folders():
    app_directory = "/jarvis/server/satellite/apps"


    def path_to_dict(path):
        d = {'name': os.path.basename(path)}
        if os.path.isdir(path):
            d['type'] = "directory"
            d['children'] = [path_to_dict(os.path.join(path,x)) for x in os.listdir(path)]
        else:
            d['type'] = "file"
        return d

    listing = path_to_dict(app_directory)["children"]

    # json_data = request.get_json(force=True)
    return Response(json.dumps({ "success": True, "result": listing }), content_type="application/json")
    # return Response(json.dumps(API_endpoint("devkit/folders", {})), content_type="application/json")