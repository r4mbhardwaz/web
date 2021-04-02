#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#

import time
from jarvis import Database, Security
from functools import wraps


def benchmark(func):
    @wraps(func)
    def wrap(*args, **kwargs):
        start = time.time()
        res = func(*args, **kwargs)
        end = time.time()
        print(f"Slot::{func.__name__} took {end-start}s")
        return res
    return wrap


class Slot:
    @benchmark
    def __init__(self, id: str = None, new: bool = True) -> None:
        if id is not None:
            new = False
        if new:
            ts = int(time.time())
            self.slot = {
                "created-at": ts,
                "modified-at": ts,
                "name": "New Slot",
                "description": None,
                "data": [],
                "extensible": True,
                "use-synonyms": True,
                "strictness": 1,
                "id": Security.id(64)   # TODO: check that this id doesn't exist already!
            }
        else:
            result = Database().table("slots").find({"id": id})
            if result.found:
                self.slot = result[0]
            else:
                self.slot = None
        if self.slot:
            self._update_quality()
        self.new = new


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
        return self.slot["id"]


    # DATABASE OPERATIONS
    @benchmark
    def save(self) -> None:
        self.slot["modified-at"] = int(time.time())
        Database().table("slots").insert(self.slot)


    # STATIC METHODS
    @staticmethod
    @benchmark
    def all() -> any:
        slots_all = list(Database().table("slots").all())
        slots_good = []
        for slot in slots_all:
            if slot["created-at"] != slot["modified-at"]:
                del slot["_id"]
                del slot["_rev"]
                tmp_slot = Slot()
                tmp_slot.slot = slot
                tmp_slot._update_quality()
                slot["quality"] = tmp_slot["quality"]
                slots_good.append(slot)
        return slots_good

    @staticmethod
    @benchmark
    def new_but_unused_slot() -> any:
        already_existing_but_empty_slots = Database().table("slots").find({"name": { "$eq": "New Slot" }})
        id = None
        if already_existing_but_empty_slots.found:
            id = already_existing_but_empty_slots[0]["id"]
        return id

    
    # PRIVATE FUNCTIONS
    @benchmark
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
