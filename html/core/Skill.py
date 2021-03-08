#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#

import time
from jarvis import Database, Security
from .Slot import Slot
from .Intent import Intent
from .User import User


# decorators
def modify(f):
    def wrapper(*args):
        args[0].skill["modified-at"] = int(time.time())
        res = f(*args)
        # TODO: insert new data
        return res
    return wrapper

# Skill class
class Skill:
    def __init__(self, id: str = None, new: bool = False) -> None:
        if id is None:
            new = True
        if new:
            self.skill = {
                "created-at": int(time.time()),
                "modified-at": int(time.time()),
                "name": None,
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
                self._update_rating()
                self._update_quality()
                self._update_intents()
            else:
                self.skill = None
        self.new = new

    def __getitem__(self, key) -> any:
        return self.skill[key]

    @modify
    def __setitem__(self, key, value) -> None:
        self.skill[key] = value

    @modify
    def add_slot(self, slot: Slot) -> None:
        pass

    @modify
    def remove_slot(self, slot: Slot) -> None:
        pass

    @modify
    def add_intent(self, intent: Intent) -> None:
        pass

    @modify
    def remove_intent(self, intent: Intent) -> None:
        pass

    @modify
    def like(self, user: User) -> None:
        pass

    @modify
    def comment(self, user: User, rating: int, message: str) -> None:
        pass

    def save(self):
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
        for i in range(len(self.skill["intents"])):
            self.skill["intents"][i] = Intent(False, self.skill["intents"][i])


    @property
    def found(self):
        return self.skill is not None

    # TODO: implement all the necessary features!

