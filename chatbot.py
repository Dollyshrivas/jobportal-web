from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def get_reply(message):
    msg = (message or "").strip()
    lower = msg.lower()

    if not msg:
        return {
            "reply": "👋 Hello! I'm your Job Assistant. How can I help you today?",
            "suggestions": [
                "Resume Review",
                "Interview Tips",
                "Find Jobs"
            ]
        }

    if any(word in lower for word in ["hi", "hello", "hey"]):
        return {
            "reply": "Hello! 😊 How can I help you?",
            "suggestions": [
                "Resume Help",
                "Find Jobs",
                "Interview Questions"
            ]
        }

    if "resume" in lower:
        return {
            "reply": "Keep your resume one page long. Highlight your skills, projects and achievements.",
            "suggestions": [
                "Resume Template",
                "ATS Resume",
                "Projects"
            ]
        }

    if "job" in lower:
        return {
            "reply": "Customize your resume for every job application.",
            "suggestions": [
                "Find Jobs",
                "Apply Tips",
                "Cover Letter"
            ]
        }

    if "interview" in lower:
        return {
            "reply": "Practice HR and technical interview questions before your interview.",
            "suggestions": [
                "HR Questions",
                "Technical Questions",
                "Mock Interview"
            ]
        }

    return {
        "reply": f"You said: {message}",
        "suggestions": [
            "Resume Help",
            "Interview",
            "Jobs"
        ]
    }


@app.route("/")
def home():
    return "Chatbot API Running"


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()

    message = data.get("message", "")

    return jsonify(get_reply(message))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)