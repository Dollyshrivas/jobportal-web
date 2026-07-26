#!/usr/bin/env python
import json
import sys


def get_reply(message):
    """A simple rule-based assistant that returns a reply and follow-up suggestions.

    This is intentionally lightweight so the app works without external APIs.
    Replace or extend this function to call an external LLM or custom service.
    """
    msg = (message or "").strip()
    lower = msg.lower()

    if not msg:
        return {
            "reply": "Hi — I'm your assistant. How can I help today?",
            "suggestions": ["Show job search tips", "Resume review", "How to apply"]
        }

    # Greetings
    if any(g in lower for g in ("hi", "hello", "hey")):
        return {
            "reply": "Hello! I can help with job search tips, resume advice, interview prep, and more.",
            "suggestions": ["How to write a resume", "Search jobs by location", "Interview tips"]
        }

    # Resume related
    if "resume" in lower or "cv" in lower:
        return {
            "reply": "For a strong resume, keep it concise (1 page for most), highlight measurable achievements, and tailor it to the job description.",
            "suggestions": ["Show resume template", "How to list achievements", "Cover letter tips"]
        }

    # Job application related
    if any(k in lower for k in ("job", "apply", "application", "position", "role")):
        return {
            "reply": "When applying, customize your application to the role, include keywords from the job posting, and follow the employer's submission instructions.",
            "suggestions": ["How to tailor a resume", "Follow-up email template", "Track applications effectively"]
        }

    # Interview related
    if any(k in lower for k in ("interview", "questions", "prepare")):
        return {
            "reply": "Practice common behavioral questions using the STAR method (Situation, Task, Action, Result). Also prepare role-specific technical examples.",
            "suggestions": ["STAR method example", "Common interview questions", "Technical interview tips"]
        }

    # Fallback: provide helpful guidance and ask for clarification
    return {
        "reply": f"I heard: '{msg}'. Could you tell me a bit more about what you want help with?",
        "suggestions": ["Give an example", "I'm looking for jobs", "I need resume help"]
    }


def main():
    try:
        request_data = json.load(sys.stdin)
        message = request_data.get("message", "")
        reply = get_reply(message)
        # Ensure we always return a JSON object with at least 'reply'
        if isinstance(reply, dict):
            print(json.dumps(reply))
        else:
            print(json.dumps({"reply": reply}))
    except Exception as exc:
        error_message = str(exc)
        print(json.dumps({"error": error_message}))
        sys.exit(1)


if __name__ == "__main__":
    main()
