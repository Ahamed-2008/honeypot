from flask import Flask, request, jsonify
import os
import re
import uuid
import json
from datetime import datetime

app = Flask(__name__)

LOG_FILE = "attack_log.json"

# Personas and keywords for routing
PERSONAS = {
    "finance": {"keywords": ["invoice", "payment", "transfer", "vendor", "bank", "wire", "amount"]},
    "hr": {"keywords": ["resume", "cv", "candidate", "interview", "offer", "job"]},
    "it": {"keywords": ["password", "reset", "mfa", "vpn", "ticket", "account", "support"]},
    "employee": {"keywords": ["meeting", "proposal", "document", "link", "review", "schedule"]}
}

# Persona reply templates (simulated persona responses)
REPLY_TEMPLATES = {
    "finance": "Thanks for the invoice. We'll forward this to procurement and confirm before payment.",
    "hr": "Thanks for the resume. Please share your LinkedIn/profile link and preferred interview times.",
    "it": "Please submit this to IT helpdesk with system details so we can investigate.",
    "employee": "Thanks — I will check and get back to you."
}

# Behaviour detection rules -> tags
BEHAVIOUR_RULES = {
    "urgency": ["urgent", "immediately", "asap", "within 24", "right away"],
    "credential_harvest": ["reset your password", "verify your account", "login", "sign in", "enter credentials", "update your password"],
    "financial_fraud": ["invoice", "pay", "payment", "wire", "transfer", "bank"],
    "attachment_malware": [".exe", ".zip", ".scr", ".js", ".bat", ".docm", ".xlsm", "attachment"],
    "url_shortener": ["bit.ly", "tinyurl", "t.co", "goo.gl"],
    "fake_authority": ["from the CEO", "from payroll", "from admin", "it support", "hr department", "accounts payable"]
}

# helper: find urls
URL_REGEX = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')

def extract_urls(text):
    return URL_REGEX.findall(text or "")

def detect_behaviours(text):
    tags = set()
    tl = (text or "").lower()
    for tag, patterns in BEHAVIOUR_RULES.items():
        for p in patterns:
            if p in tl:
                tags.add(tag)
                break
    # also check for any URL presence
    if extract_urls(text):
        tags.add("contains_url")
    return sorted(list(tags))

def classify_persona(subject, body, keywords=None):
    text = (subject or "") + " " + (body or "") + " " + " ".join(keywords or [])
    tl = text.lower()
    scores = {}
    for persona, info in PERSONAS.items():
        cnt = sum(tl.count(k) for k in info["keywords"])
        scores[persona] = cnt
    # choose persona with max matches; default to 'employee'
    persona = max(scores, key=lambda p: scores[p])
    if scores[persona] == 0:
        persona = "employee"
    return persona

def simple_spoof_check(from_addr, from_display):
    # detect mismatch like display claims 'IT Support' but email domain is suspicious
    tl_display = (from_display or "").lower()
    tl_addr = (from_addr or "").lower()
    suspicious = []
    if "it" in tl_display and "support" in tl_display and ("support@" not in tl_addr and "it-" not in tl_addr and "it@" not in tl_addr):
        suspicious.append("display_name_mismatch")
    # suspicious domains (very basic)
    if any(x in tl_addr for x in ["-secure", "secure-", "account-", "verify-"]):
        suspicious.append("suspicious_domain_pattern")
    return suspicious

def log_attack(entry):
    try:
        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = []
    except Exception:
        data = []
    data.append(entry)
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

@app.route("/")
def home():
    return jsonify({"message": "Backend (rule-based) running!"})

@app.route("/analyze-email", methods=["POST"])
def analyze_email():
    payload = request.get_json(silent=True) or {}
    # Support both 'email_text' and structured email JSON from member1
    subject = payload.get("subject") or ""
    body = payload.get("body_text") or payload.get("email_text") or ""
    from_addr = payload.get("from") or payload.get("sender") or ""
    from_display = payload.get("from_display") or ""
    attachments = payload.get("attachments") or []
    urls = payload.get("urls") or extract_urls(body)
    provided_keywords = payload.get("suspicious_keywords") or []

    # Basic heuristics / score
    keywords_hit = [k for k in ["urgent","payment","invoice","password","verify","reset","bank","salary","suspend","click"] if k in (body + " " + subject).lower()]
    score = len(keywords_hit)
    # additional score for urls or attachments
    if urls:
        score += 1
    if attachments:
        score += 1

    # Persona classification
    persona = classify_persona(subject, body, provided_keywords)

    # Behaviour tags
    behaviour_tags = detect_behaviours(subject + " " + body)

    # Spoof checks
    spoof_flags = simple_spoof_check(from_addr, from_display)

    # Persona simulated reply
    persona_reply = REPLY_TEMPLATES.get(persona, REPLY_TEMPLATES["employee"])

    # Suggested actions based on tags
    suggested_actions = []
    if "credential_harvest" in behaviour_tags or "contains_url" in behaviour_tags:
        suggested_actions.append("block_url_and_alert")
    if "attachment_malware" in behaviour_tags or attachments:
        suggested_actions.append("sandbox_attachment")
    if "financial_fraud" in behaviour_tags:
        suggested_actions.append("verify_with_procurement")
    if "urgency" in behaviour_tags:
        suggested_actions.append("flag_for_training")
    if not suggested_actions:
        suggested_actions.append("monitor")

    result = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "from": from_addr,
        "from_display": from_display,
        "subject": subject,
        "body_excerpt": (body[:500] + "...") if len(body) > 500 else body,
        "urls": urls,
        "attachments": attachments,
        "suspicious_keywords_detected": keywords_hit,
        "score": score,
        "is_phishing": score >= 3 or ("credential_harvest" in behaviour_tags and score >= 2),
        "persona_target": persona,
        "behaviour_tags": behaviour_tags,
        "spoof_flags": spoof_flags,
        "persona_reply": persona_reply,
        "suggested_actions": suggested_actions
    }

    # Log the event locally for analytics/demo
    log_attack(result)

    return jsonify(result)

if __name__ == "__main__":
    print("Starting rule-based backend on http://127.0.0.1:5000")
    app.run(debug=True)
