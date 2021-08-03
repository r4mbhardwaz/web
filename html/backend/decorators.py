from __main__ import app
from functools import wraps
from flask import session, redirect, request


def login_required(func):
    @wraps(func)
    def wrap(*args, **kwargs):
        if "username" in session:
            return func(*args, **kwargs)
        else:
            return redirect(f"/login?url={request.path}", code=302)
    return wrap

def retrain(func):
    @wraps(func)
    def wrap(*args, **kwargs):
        res = func(*args, **kwargs)
        app.view_functions["api_assistant_train"]()
        return res
    return wrap
