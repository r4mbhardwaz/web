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

    # BUILTIN_PREFIX = "@builtin/"

    # # slots which are commented can not be installed with snips-nlu
    # BUILTINS = [ 
    #             # { 'name': 'AmountOfMoney', 'slot_name': f"{BUILTIN_PREFIX}amountOfMoney", 'languages': ['de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pt_br', 'pt_pt'], 'code-samples': [['$10', 'six euros', 'around 5€', 'ten dollars and five cents'],                                                       [{'kind': 'AmountOfMoney', 'value': 10.05, 'precision': 'Approximate', 'unit': '€'}]], },
    #             # { 'name': 'Duration',      'slot_name': f"{BUILTIN_PREFIX}duration",      'languages': ['de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pt_br', 'pt_pt'], 'code-samples': [['1h', 'during two minutes', 'for 20 seconds', '3 months', 'half an hour', '8 years and two days'],                    [{'kind': 'Duration', 'years': 0, 'quarters': 0, 'months': 3, 'weeks': 0, 'days': 0, 'hours': 0, 'minutes': 0, 'seconds': 0, 'precision': 'Exact'}]], },
    #             # { 'name': 'Number',        'slot_name': f"{BUILTIN_PREFIX}number",        'languages': ['de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pt_br', 'pt_pt'], 'code-samples': [['2001', 'twenty one', 'three hundred and four'],                                                                      [{'kind': 'Number', 'value': 42}]], },
    #             # { 'name': 'Ordinal',       'slot_name': f"{BUILTIN_PREFIX}ordinal",       'languages': ['de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pt_br', 'pt_pt'], 'code-samples': [['1st', 'the second', 'the twenty third'],                                                                             [{'kind': 'Ordinal', 'value': 2}]], },
    #             # { 'name': 'Temperature',   'slot_name': f"{BUILTIN_PREFIX}temperature",   'languages': ['de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pt_br', 'pt_pt'], 'code-samples': [['70K', '3°C', 'Twenty three degrees', 'one hundred degrees fahrenheit'],                                              [{'kind': 'Temperature', 'value': 23, 'unit': 'celsius'}, {'kind': 'Temperature', 'value': 60, 'unit': 'fahrenheit'}]], },
    #             # { 'name': 'Datetime',      'slot_name': f"{BUILTIN_PREFIX}datetime",      'languages': ['de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pt_br', 'pt_pt'], 'code-samples': [['Today', 'at 8 a.m.', '4:30 pm', 'in 1 hour', 'the 3rd tuesday of June'],                                             [{'kind': 'InstantTime', 'value': '2017-06-13 18:00:00 +02:00', 'grain': 'Hour', 'precision': 'Exact'},  {'kind': 'TimeInterval', 'from': '2017-06-07 18:00:00 +02:00', 'to': '2017-06-08 00:00:00 +02:00'}]], },
    #             # { 'name': 'Date',          'slot_name': f"{BUILTIN_PREFIX}date",          'languages': ['en'],                                                       'code-samples': [['today', 'on Wednesday', 'March 26th', 'saturday january 19', 'monday 15th april 2019', 'the day after tomorrow'],    [{'kind': 'InstantTime', 'value': '2017-06-13 00:00:00 +02:00', 'grain': 'Day', 'precision': 'Exact'}]], },
    #             # { 'name': 'Time',          'slot_name': f"{BUILTIN_PREFIX}time",          'languages': ['en'],                                                       'code-samples': [['now', 'at noon', 'at 8 a.m.', '4:30 pm', 'in one hour', "for ten o'clock", 'at ten in the evening'],                 [{'kind': 'InstantTime', 'value': '2017-06-13 18:00:00 +02:00', 'grain': 'Hour', 'precision': 'Exact'}]], },
    #             # { 'name': 'DatePeriod',    'slot_name': f"{BUILTIN_PREFIX}datePeriod",    'languages': ['en'],                                                       'code-samples': [['january', '2019', 'from monday to friday', 'from wednesday 27th to saturday 30th', 'this week'],                     [{'kind': 'TimeInterval', 'from': '2017-06-07 00:00:00 +02:00', 'to': '2017-06-09 00:00:00 +02:00'}]], },
    #             # { 'name': 'TimePeriod',    'slot_name': f"{BUILTIN_PREFIX}timePeriod",    'languages': ['en'],                                                       'code-samples': [['until dinner', 'from five to ten', 'by the end of the day'],                                                         [{'kind': 'TimeInterval', 'from': '2017-06-07 18:00:00 +02:00', 'to': '2017-06-07 20:00:00 +02:00'}]], },
    #             # { 'name': 'Percentage',    'slot_name': f"{BUILTIN_PREFIX}percentage",    'languages': ['de', 'en', 'es', 'fr', 'it', 'ja', 'pt_br', 'pt_pt'],       'code-samples': [['25%', 'twenty percent', 'two hundred and fifty percents'],                                                           [{'kind': 'Percentage', 'value': 20}]], },
    #             { 'name': 'MusicAlbum',    'slot_name': f"{BUILTIN_PREFIX}musicAlbum",    'languages': ['de', 'en', 'es', 'fr', 'it', 'ja', 'pt_br', 'pt_pt'],       'code-samples': [['Discovery'],                                                                                                         [{'kind': 'MusicAlbum', 'value': 'Discovery'}]], },
    #             { 'name': 'MusicArtist',   'slot_name': f"{BUILTIN_PREFIX}musicArtist",   'languages': ['de', 'en', 'es', 'fr', 'it', 'ja', 'pt_br', 'pt_pt'],       'code-samples': [['Daft Punk'],                                                                                                         [{'kind': 'MusicArtist', 'value': 'Daft Punk'}]], },
    #             { 'name': 'MusicTrack',    'slot_name': f"{BUILTIN_PREFIX}musicTrack",    'languages': ['de', 'en', 'es', 'fr', 'it', 'ja', 'pt_br', 'pt_pt'],       'code-samples': [['Harder Better Faster Stronger'],                                                                                     [{'kind': 'MusicTrack', 'value': 'Harder Better Faster Stronger'}]], },
    #             { 'name': 'City',          'slot_name': f"{BUILTIN_PREFIX}city",          'languages': ['de', 'en', 'es', 'fr', 'it', 'ja', 'pt_br', 'pt_pt'],       'code-samples': [['San Francisco', 'Los Angeles', 'Beijing', 'Paris'],                                                                  [{'kind': 'City', 'value': 'Paris'}]], },
    #             { 'name': 'Country',       'slot_name': f"{BUILTIN_PREFIX}country",       'languages': ['de', 'en', 'es', 'fr', 'it', 'ja', 'pt_br', 'pt_pt'],       'code-samples': [['France'],                                                                                                            [{'kind': 'Country', 'value': 'France'}]], },
    #             { 'name': 'Region',        'slot_name': f"{BUILTIN_PREFIX}region",        'languages': ['de', 'en', 'es', 'fr', 'it', 'ja', 'pt_br', 'pt_pt'],       'code-samples': [['California', 'Washington'],                                                                                          [{'kind': 'Region', 'value': 'California'}]] }
    #         ]


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
        # if id.startswith(Slot.BUILTIN_PREFIX):
        #     slot_data = {}
        #     for s in Slot.BUILTINS:
        #         if s["slot_name"] == id:
        #             slot_data = s
        #     return Slot({
        #         **Slot.DEFAULT,
        #         **slot_data,
        #         "static": True,
        #         "_id": slot_data["slot_name"],
        #         "_rev": slot_data["slot_name"]
        #     })
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
        # if self.slot.get("static", None):
        #     self.slot["quality"] = 1

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
