from __main__ import *
import markdown

@app.template_filter("datetime")
def filter_datetime(value, format="full"):
    dt = datetime.utcfromtimestamp(int(value))
    str = f"Unknown format {format}"
    if format == "time":
        str = format_datetime(dt, "HH:mm:ss")
    elif format == "date":
        str = format_datetime(dt, "EE, d. MMMM yyyy")
    elif format == "full":
        str = format_datetime(dt, "EEEE, d. MMMM yyyy HH:mm:ss")
    return str

@app.template_filter("markdown")
def filter_markdown(value):
    return markdown.markdown(value, output_format='html5')