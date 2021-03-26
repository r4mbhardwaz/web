#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#

import time
from jarvis import Database, Security
from .Slot import Slot
from functools import total_ordering, wraps


def benchmark(func):
    @wraps(func)
    def wrap(*args, **kwargs):
        start = time.time()
        res = func(*args, **kwargs)
        end = time.time()
        print(f"Intent::{func.__name__} took {end-start}s")
        return res
    return wrap


class Intent:
    @benchmark
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
                self._update_slots()
                self._update_quality()
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
    @benchmark
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

    @benchmark
    def add_slot(self, name: str, slot: Slot, only_keep_reference: bool = True):
        self.intent["modified-at"] = int(time.time())
        if name in self.intent["slots"]:
            return False
        self.intent["slots"][name] = slot["id"] if only_keep_reference else slot
        return True

    @benchmark
    def change_slot(self, name: str, slot: Slot, only_keep_reference: bool = True):
        self.intent["modified-at"] = int(time.time())
        self.intent["slots"][name] = slot["id"] if only_keep_reference else slot
        return True

    # PRIVATE FUNCTIONS
    @benchmark
    def _update_slots(self) -> None:
        for slotname in self.intent["slots"]:
            slot = self.intent["slots"][slotname]
            if not isinstance(slot, Slot) and not isinstance(slot, dict):
                self.intent["slots"][slotname] = Slot(slot).__dict__()
                del self.intent["slots"][slotname]["_id"]
                del self.intent["slots"][slotname]["_rev"]

    @benchmark
    def _reverse_slots(self, only_keep_reference: bool = True) -> None:
        for slotname in self.intent["slots"]:
            slot = self.intent["slots"][slotname]
            if isinstance(slot, Slot) or isinstance(slot, dict):
                self.intent["slots"][slotname] = slot["id"] if only_keep_reference else slot.__dict__()

    @benchmark
    def _update_quality(self) -> None:
        quality = 0
        if len(self.intent["utterances"]) == 0:
            quality = 0
        elif len(self.intent["utterances"]) < 5:
            quality = 0.1
        for i in [5, 10, 15, 20, 25, 30]:
            if len(self.intent["utterances"]) > i:
                quality += 0.1
        # ^ MAX 0.6

        slot_count = len(self.intent["slots"])
        for i in [1, 2, 3, 4]:
            if len(self.intent["utterances"]) >= i:
                quality += 0.1
        
        # ^ MAX 1
        total_entity_count = 0
        for utt in self.intent["utterances"]:
            for ds in utt["data"]:
                if "slot" in ds:
                    total_entity_count += 1

        if len(self.intent["slots"]) > 0:
            entity_quote = total_entity_count / len(self.intent["utterances"])
            for i in [0.5, 0.75, 0.9, 1, 1.2]:
                if entity_quote < i:
                    quality -= 0.04

        if quality < 0:
            quality = 0

        self.intent["quality"] = quality
