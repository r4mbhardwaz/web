#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#

import time
from jarvis import Database, Security

class Slot:
    def __init__(self, id: str = None, new: bool = True) -> None:
        if id is not None:
            new = False
        if new:
            ts = int(time.time())
            self.slot = {
                "created-at": ts,
                "modified-at": ts,
                "name": "New Slot",
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


    # DATABASE OPERATIONS
    def save(self) -> None:
        Database().table("slots").insert(self.slot)


    # STATIC METHODS
    @staticmethod
    def all() -> any:
        return list(Database().table("slots").all())

    @staticmethod
    def new_but_unused_slot() -> any:
        already_existing_but_empty_slots = Database().table("slots").find({"name": { "$eq": "New Slot" }})
        id = None
        if already_existing_but_empty_slots.found:
            id = already_existing_but_empty_slots[0]["id"]
        return id

