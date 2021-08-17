import json
import time
from core.Skill import Skill
from __main__ import app, Intent, Skill, Slot, API_endpoint
from ..decorators import login_required, retrain
from flask import request
from flask.wrappers import Response
from jarvis import Security


@app.route("/api/conversation/write", methods=["POST"])
@login_required
def api_conversation_write():
    json_data = request.get_json(force=True)
    return Response(json.dumps(API_endpoint("conversation/write", json_data)), content_type="application/json")
