import requests
url = "http://127.0.0.1:5000/analyze-email"
data = {"email_text": "Urgent: Please pay invoice INV-123 for $5,000. Click http://bit.ly/pay123", "persona": "finance"}
print(requests.post(url, json=data).json())
