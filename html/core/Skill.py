#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#

import time
from jarvis import Database, Security
from .Slot import Slot
from .Intent import Intent
from .User import User


class Skill:
    def __init__(self, id: str = None, new: bool = False) -> None:
        self._unused_intent = None
        if id is None:
            new = True
        if new:
            self.skill = {
                "created-at": int(time.time()),
                "modified-at": int(time.time()),
                "name": "New Skill",
                "icon": {
                    "icon": None,
                    "color": None
                },
                "social": {
                    "likes": [],
                    "comments": [],
                    "downloads": [],
                    "rating": 3.5
                },
                "intents": [],
                "quality": 0,
                "language": None,
                "description": None,
                "public": False,
                "id": Security.id(64)   # TODO: check that this id doesn't exist already!
            }
        else:
            result = Database().table("skills").find({"id": id})
            if result.found:
                self.skill = result[0]
                self._update_intents()
                self._update_rating()
                self._update_quality()
            else:
                self.skill = None
        self.new = new

    def __getitem__(self, key) -> any:
        return self.skill[key]

    def __setitem__(self, key, value) -> None:
        self.skill[key] = value

    def add_slot(self, slot: Slot) -> None:
        pass

    def remove_slot(self, slot: Slot) -> None:
        pass

    def like(self, user: User) -> None:
        pass

    def comment(self, user: User, rating: int, message: str) -> None:
        pass

    def add_intent(self, intent: Intent):
        self.skill["intents"].append(intent.__dict__())

    def update_intent(self, intent_id: str, new_intent: Intent):
        successful_insert = False
        for i in range(len(self.skill["intents"])):
            intent = self.skill["intents"][i]
            if intent["id"] == intent_id:
                self.skill["intents"][i] = dict(new_intent)
                successful_insert = True
        return successful_insert

    def get_intent(self, id: str):
        for intent in self.skill["intents"]:
            if intent["id"] == id:
                return Intent(False, intent).__dict__()
        if self._unused_intent and self._unused_intent["id"] == id:
            return Intent(False, self._unused_intent)
        return None

    def remove_intent(self, intent: Intent) -> None:
        pass

    def save(self):
        self.skill["modified-at"] = time.time()
        for i in range(len(self.skill["intents"])):
            intent = self.skill["intents"][i]
            if isinstance(intent, Intent):
                self.skill["intents"][i] = intent.__dict__()
        Database().table("skills").insert(self.skill)

    def delete(self):
        Database().table("skills").find({"id": self.skill["id"]}).delete()

    def _update_rating(self) -> None:
        rating = [3.5]
        weights = [1]
        for comment in self.skill["social"]["comments"]:
            rating.append(comment["rating"])
            weight = 1
            
            days_diff = (time.time() - comment["modified-at"]) / 60 / 60 / 24
            if days_diff > 365:
                weight -= 0.5
            elif days_diff > 365/2:
                weight -= 0.25
            elif days_diff > 60:
                weight -= 0.1

            message_length = len(comment["message"])
            if message_length < 10:
                weight -= 0.25
            if message_length < 50:
                weight -= 0.1
            if message_length > 100:
                weight += 0.2
            if message_length > 200:
                weight += 0.35

            weights.append(weight)

        final_rating = sum(rating[g] * weights[g] for g in range(len(rating))) / sum(weights)
        self.skill["social"]["rating"] = final_rating

    def _update_quality(self) -> None:
        intent_quality = 0
        for intent in self.skill["intents"]:
            intent_quality += intent["quality"]
        try:
            final_quality = intent_quality / len(self.skill["intents"])
        except ZeroDivisionError:
            final_quality = 0
        self.skill["quality"] = final_quality

    def _update_intents(self) -> None:
        new_intent_array = []
        for intent in self.skill["intents"]:
            if intent["created-at"] == intent["modified-at"]: # not modified yet
                self._unused_intent = Intent(False, intent)
            else:
                new_intent_array.append(Intent(False, intent))
        self.skill["intents"] = new_intent_array

    def unused_intent(self) -> dict:
        return self._unused_intent

    @property
    def found(self):
        return self.skill is not None

    # TODO: implement all the necessary features!

