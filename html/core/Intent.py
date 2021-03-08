#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#

import time
from jarvis import Database, Security

class Intent:
    def __init__(self, new: bool, existing_data: dict = None) -> None:
        if existing_data:
            new = False
        if new:
            self.intent = {
                "name": None,
                "description": None,
                "slots": {},
                "quality": 0,
                "created-at": int(time.time()),
                "modified-at": int(time.time()),
                "utterances": [],
                "id": Security.id(16)
            }
        else:
            if existing_data:
                self.intent = existing_data
            else: 
                self.intent = None
        self.id = self.intent["id"]
        self.new = new

    def __getitem__(self, key) -> any:
        return self.intent[key]

    def get_slots(self):
        for slot_name in self.intent["slots"]:
            slot_id = self.intent["slots"][slot_name]
            if isinstance(slot_id, dict):
                break   # this function already got called and the slots were filled in
            result = Database().table("slots").find({"id": slot_id})
            if result.found:
                self.intent["slots"][slot_name] = result[0]
            else:
                self.intent["slots"][slot_name] = {}
        return self.intent["slots"]
