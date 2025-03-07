from fastapi import FastAPI
from flask import Flask, request, jsonify

app = Flask(__name__)
@app.route("/api/generate", methods=["POST"])
def generate_response():
    data = request.json
    text = data.get("text", "Hello, this is SECGPT.")
    return jsonify
{"essage": fastapi.generate_text(text)}
    

if __name__ == "__main__":
    app.run(debug=True)