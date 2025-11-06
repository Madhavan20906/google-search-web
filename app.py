# app.py
from flask import Flask, request, jsonify, render_template, send_from_directory
import requests
import os

app = Flask(__name__, static_folder="static", template_folder="templates")

USER_AGENT = "Mozilla/5.0 (compatible; RenderApp/1.0)"
SUGGEST_URL = "http://suggestqueries.google.com/complete/search"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/suggest")
def suggest():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify([])

    params = {
        "client": "firefox",
        "q": q
    }
    try:
        headers = {"User-Agent": USER_AGENT}
        resp = requests.get(SUGGEST_URL, params=params, headers=headers, timeout=4.0)
        resp.raise_for_status()
        data = resp.json()
        # data is usually [query, [suggestions...], ...]
        suggestions = []
        if isinstance(data, list) and len(data) >= 2 and isinstance(data[1], list):
            suggestions = [str(x) for x in data[1]]
    except Exception:
        suggestions = []
    return jsonify(suggestions)

# static files served automatically by Flask, route kept for explicitness
@app.route("/static/<path:p>")
def static_files(p):
    return send_from_directory("static", p)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
