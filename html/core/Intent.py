#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#

import time
from jarvis import Database, Security
from .Slot import Slot


class Intent:
    def __init__(self, new: bool, existing_data: dict = None) -> None:
        if existing_data:
            new = False
        if new:
            self.intent = {
                "name": "New Intent",
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
                if isinstance(existing_data, Intent):
                    existing_data = existing_data.__dict__()
                self.intent = existing_data
            else: 
                self.intent = None
        self.id = self.intent["id"]
        self.new = new


    # OBJECT FUNCTIONS
    def __getitem__(self, key) -> any:
        return self.intent[key]

    def __setitem__(self, key, value) -> None:
        self.intent["modified-at"] = int(time.time())
        self.intent[key] = value

    def __dict__(self) -> dict:
        self._reverse_slots(True)
        return self.intent


    # USUAL FUNCTIONS
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

    def add_slot(self, name: str, slot: Slot, only_keep_reference: bool = True):
        if name in self.intent["slots"]:
            return False
        self.intent["slots"][name] = slot["id"] if only_keep_reference else slot
        return True

    # PRIVATE FUNCTIONS
    def _reverse_slots(self, only_keep_reference: bool = True) -> None:
        for slotname in self.intent["slots"]:
            slot = self.intent["slots"][slotname]
            self.intent["slots"][slotname] = slot["id"] if only_keep_reference else slot.__dict__()
