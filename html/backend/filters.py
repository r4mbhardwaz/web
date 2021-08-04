"""
Copyright (c) 2021 Philipp Scheer
"""


from __main__ import app, datetime, format_datetime
import time
import datetime as dt
import markdown


@app.template_filter("datetime")
def filter_datetime(value, format="full"):
    dt = datetime.utcfromtimestamp(int(value))
    str = f"Unknown format {format}"
    if format in ["time", "short"]:
        str = format_datetime(dt, "HH:mm:ss")
    elif format in ["date"]:
        str = format_datetime(dt, "EE, d. MMMM yyyy")
    elif format in ["date-short"]:
        str = format_datetime(dt, "d.MM.yyyy")
    elif format in ["full", "long"]:
        str = format_datetime(dt, "EEEE, d. MMMM yyyy HH:mm:ss")
    return str

@app.template_filter("timediff")
def filter_timediff(value, max_depth: int = 5):
    diff  = time.time() - value
    delta = dt.timedelta(seconds=diff)
    res   = []

    d,h,m = delta.days, delta.seconds//3600, (delta.seconds//60)%60
    if d > 0:
        res.append(f"{delta.days} days")
    if h > 0:
        res.append(f"{delta.seconds//3600} hour" + "s" if h != 1 else "")
    if m > 0:
        res.append(f"{m} minutes")

    if len(res) == 0: # everything under 1 minute is considered just now
        return "Just now"
    return ", ".join(res[:max_depth]) + " ago"

@app.template_filter("markdown")
def filter_markdown(value):
    return markdown.markdown(value, output_format='html5')
