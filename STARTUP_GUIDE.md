# Honeypot - Email Phishing Detection System

## 🚀 Quick Start

### Start the Application
From the project root directory (`/home/dhanish/honeypot`), run:

```bash
.venv/bin/python server/main2.py
```

The application will start on **http://localhost:8000**

### Stop the Application
Press `Ctrl+C` in the terminal where the server is running, or run:

```bash
pkill -f "server/main2.py"
```

## 📋 What's Included

This is a **unified application** that includes:
- **Frontend**: React-based web interface
- **Backend**: FastAPI server for email analysis
- **AI Engine**: Gemini AI integration for phishing detection

All three components run as a single process!

## 🔧 Configuration

- **Port**: 8000
- **Gemini API**: Configured with your API key in `aiengine/utils/llm.py`
- **Model**: `gemini-flash-latest`

## 🧪 Testing

1. Open http://localhost:8000 in your browser
2. Click "Get Started"
3. Paste a suspicious email or upload an `.eml` file
4. Click "Analyze Email"
5. View the AI-powered risk assessment!

## 📝 Notes

- The frontend is built and served as static files from `dist/`
- If you make changes to the frontend (`src/`), rebuild with: `npm run build`
- The server will automatically detect the new build
