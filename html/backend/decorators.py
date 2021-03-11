from __main__ import *

def login_required(func):
    @wraps(func)
    def wrap(*args, **kwargs):
        if "login_user" in session:
            return func(*args, **kwargs)
        else:
            return redirect(f"/login?url={request.path}", code=302)
    return wrap

