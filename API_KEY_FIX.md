# 🔑 **URGENT**: Gemini API Key Issue

## Problem
Your Gemini API key has been flagged as **leaked/compromised** by Google and is no longer working.

**Error**: `403 Your API key was reported as leaked`

## Solution

### Step 1: Get a New API Key
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy your new API key

### Step 2: Set the New API Key
Run this command in your terminal (replace with your actual key):

```bash
export GEMINI_API_KEY="your-new-api-key-here"
```

### Step 3: Start the Application
```bash
cd /home/dhanish/honeypot
.venv/bin/python server/main2.py
```

## Important Notes
- The old API key `AIzaSyC8zWDZWNEaZ_7dy8i9hJ8znRPEWA4g8iQ` no longer works
- **Never commit API keys to Git** or share them publicly
- The application now reads the key from the `GEMINI_API_KEY` environment variable

## Quick Test
After setting the key, test with:
```bash
echo $GEMINI_API_KEY
```
You should see your new API key printed.
