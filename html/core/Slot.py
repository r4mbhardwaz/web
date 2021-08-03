#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#

import time
from jarvis import Database, Security
from functools import wraps


class Slot:
    DEFAULT = {
        "created-at": None,
        "modified-at": None,
        "name": "New Slot",
        "description": None,
        "data": [],
        "extensible": True,
        "use-synonyms": True,
        "strictness": 1,
    }

    def __init__(self, data: dict) -> None:
        self.slot = data
        self._update_quality()


    # OBJECT FUNCTIONS
    def __getitem__(self, key) -> any:
        return self.slot[key]

    def __setitem__(self, key, value) -> None:
        self.slot[key] = value

    def __dict__(self) -> str:
        return self.slot


    # PROPERTIES
    @property
    def found(self) -> bool:
        return self.slot is not None

    @property
    def id(self) -> str:
        return self.slot["_id"]


    # DATABASE OPERATIONS
    def save(self) -> None:
        self.slot["modified-at"] = int(time.time())
        Database().table("slots").insert(self.slot)


    @staticmethod
    def load(id):
        res = Database().table("slots").find({ "_id": { "$eq": id } })
        if res.found:
            return Slot(res[0])
        return None

    @staticmethod
    def new(data: dict = {}):
        new_data = {**Slot.DEFAULT, **data}
        assert not ("_id" in new_data or "id" in new_data), "No ID must be present when creating a new Slot"
        return Slot(new_data)

    # STATIC METHODS
    @staticmethod
    def all() -> any:
        slots_all = list(Database().table("slots").all())
        slots_good = []
        for slot in slots_all:
            if slot["created-at"] != slot["modified-at"]:
                slot["id"] = slot["_id"]
                del slot["_id"]
                del slot["_rev"]
                tmp_slot = Slot.new({})
                tmp_slot.slot = slot
                tmp_slot._update_quality()
                slot["quality"] = tmp_slot["quality"]
                slots_good.append(slot)
        return slots_good

    @staticmethod
    def new_but_unused_slot() -> any:
        already_existing_but_empty_slots = Database().table("slots").find({"name": { "$eq": "New Slot" }})
        id = None
        if already_existing_but_empty_slots.found:
            id = already_existing_but_empty_slots[0]["id"]
        return id

    
    # PRIVATE FUNCTIONS
    def _update_quality(self):
        quality = 0
        if len(self.slot["data"]) == 0:
            quality = 0
        elif len(self.slot["data"]) < 5:
            quality = 0.1
        for i in [5, 10, 15, 20, 25, 30]:
            if len(self.slot["data"]) > i:
                quality += 0.1
        # ^ MAX 0.6

        synonyms_per_data_quote = 0
        for i in self.slot["data"]:
            synonyms_per_data_quote += len(i["synonyms"])
        try:
            synonyms_per_data_quote /= len(self.slot["data"])
            for i in [1, 3, 5, 7]:
                if synonyms_per_data_quote > i:
                    quality += 0.1
        except ZeroDivisionError: # no data yet
            pass

        if quality < 0:
            quality = 0

        self.slot["quality"] = quality
