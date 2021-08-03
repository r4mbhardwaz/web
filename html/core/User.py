#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#


from jarvis import Database, Security


class User:
    @staticmethod
    def validate(username, password):
        result = Database().table("users").find({
            "username": username,
            "password": User.hash(password)
        })
        return result.found
    
    @staticmethod
    def hash(password):
        return Security.password_hash(password)
