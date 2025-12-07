# Email Webhook Server - Python/Flask
# Install: pip install flask

from flask import Flask, request, jsonify, render_template_string
from datetime import datetime
import json
import os
from pymongo import MongoClient

app = Flask(__name__)

# Store emails in memory
emails = []

# MongoDB setup
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
MONGODB_DB = os.getenv('MONGODB_DB', 'email_webhook')
MONGODB_COLLECTION = os.getenv('MONGODB_COLLECTION', 'emails')

try:
    mongo_client = MongoClient(MONGODB_URI)
    mongo_db = mongo_client[MONGODB_DB]
    emails_collection = mongo_db[MONGODB_COLLECTION]
    print(f'✅ Connected to MongoDB: {MONGODB_URI} (DB: {MONGODB_DB}, Collection: {MONGODB_COLLECTION})')
except Exception as e:
    emails_collection = None
    print(f'❌ Failed to connect to MongoDB: {e}')

# Webhook endpoint - receives emails from Apps Script
@app.route('/webhook/email', methods=['POST'])
def receive_email():
    try:
        email_data = request.get_json()
        
        # Validate email data
        if not email_data.get('from') or not email_data.get('subject'):
            return jsonify({
                'success': False,
                'error': 'Missing required fields'
            }), 400
        
        # Add metadata
        email_data['receivedAt'] = datetime.now().isoformat()
        email_data['id'] = f"{int(datetime.now().timestamp())}-{os.urandom(4).hex()}"
        
        # Store email
        emails.append(email_data)
        
        # Log to console
        print('📧 New email received:')
        print(f"  Type: {email_data['type']}")
        print(f"  From: {email_data['from']}")
        print(f"  Subject: {email_data['subject']}")
        print(f"  Date: {email_data['date']}")
        print(f"  Body preview: {email_data['body'][:100]}...")
        print('---')
        
        # Optional: Save to file -> now saves to MongoDB
        save_email_to_db(email_data)
        
        # Optional: Process the email
        process_email(email_data)
        
        # Send success response
        return jsonify({
            'success': True,
            'message': 'Email received',
            'emailId': email_data['id']
        }), 200
        
    except Exception as e:
        print(f'Error processing webhook: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Get all received emails
@app.route('/emails', methods=['GET'])
def get_emails():
    return jsonify({
        'count': len(emails),
        'emails': emails
    })

# Get specific email by ID
@app.route('/emails/<email_id>', methods=['GET'])
def get_email(email_id):
    email = next((e for e in emails if e['id'] == email_id), None)
    if email:
        return jsonify(email)
    else:
        return jsonify({'error': 'Email not found'}), 404

# Get spam emails only
@app.route('/emails/type/spam', methods=['GET'])
def get_spam_emails():
    spam_emails = [e for e in emails if e['type'] == 'spam']
    return jsonify({
        'count': len(spam_emails),
        'emails': spam_emails
    })

# Get inbox emails only
@app.route('/emails/type/inbox', methods=['GET'])
def get_inbox_emails():
    inbox_emails = [e for e in emails if e['type'] == 'inbox']
    return jsonify({
        'count': len(inbox_emails),
        'emails': inbox_emails
    })

# Clear all emails
@app.route('/emails', methods=['DELETE'])
def clear_emails():
    count = len(emails)
    emails.clear()
    return jsonify({
        'success': True,
        'message': f'Deleted {count} emails'
    })

# Health check
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'emailsReceived': len(emails)
    })

# Root endpoint
@app.route('/', methods=['GET'])
def index():
    html = f'''
    <html>
      <head><title>Email Webhook Server</title></head>
      <body>
        <h1>📧 Email Webhook Server</h1>
        <p>Status: <strong>Running</strong></p>
        <p>Emails received: <strong>{len(emails)}</strong></p>
        <h2>Endpoints:</h2>
        <ul>
          <li><code>POST /webhook/email</code> - Receive emails</li>
          <li><code>GET /emails</code> - View all emails</li>
          <li><code>GET /emails/&lt;id&gt;</code> - View specific email</li>
          <li><code>GET /emails/type/spam</code> - View spam emails</li>
          <li><code>GET /emails/type/inbox</code> - View inbox emails</li>
          <li><code>DELETE /emails</code> - Clear all emails</li>
        </ul>
      </body>
    </html>
    '''
    return html

# Save email to MongoDB (replaces file-based storage)
def save_email_to_db(email_data):
    if emails_collection is None:
        print('⚠️ MongoDB collection not available; skipping DB save.')
        return

    try:
        # Make a shallow copy so we don't accidentally modify the in-memory object
        doc = email_data.copy()
        # Insert into MongoDB
        result = emails_collection.insert_one(doc)
        print(f'💾 Saved to MongoDB (_id={result.inserted_id})')
    except Exception as e:
        print(f'Error saving to MongoDB: {e}')

# Process emails (customize this!)
def process_email(email_data):
    # Example: Check for specific keywords
    if email_data['type'] == 'spam':
        body = email_data['body'].lower()
        
        if 'bitcoin' in body or 'crypto' in body:
            print('🚨 ALERT: Crypto spam detected!')
        
        if 'click here' in body or 'verify your account' in body:
            print('🚨 ALERT: Phishing attempt detected!')
    
    # Example: Flag high-priority emails
    if email_data['type'] == 'inbox' and 'URGENT' in email_data['subject']:
        print('⚡ HIGH PRIORITY EMAIL!')
    
    # Add your custom processing logic here:
    # - Save to database
    # - Send notification
    # - Analyze with AI
    # - Forward to another service
    # - etc.

if __name__ == '__main__':
    print('')
    print('🚀 Email Webhook Server started!')
    print('')
    print('📡 Listening on: http://localhost:5000')
    print('📬 Webhook URL: http://localhost:5000/webhook/email')
    print('')
    print('📊 View emails at: http://localhost:5000/emails')
    print('')
    print('Press Ctrl+C to stop')
    print('')
    
    app.run(host='0.0.0.0', port=5000, debug=True)
