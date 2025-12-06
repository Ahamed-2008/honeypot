<<<<<<< HEAD
# honeypot
PersonaMimic
AI-Powered Social Engineering Honeypot

PersonaMimic is a deception-based cybersecurity honeypot designed to mimic real employees and safely engage social-engineering attackers. It captures attacker behavior, analyzes phishing tactics, and provides security teams with actionable intelligence — all without exposing real staff.

🚨 Problem Statement

Over 90% of data breaches stem from human-targeted attacks such as phishing and social engineering. Traditional honeypots focus only on technical intrusions and provide no visibility into attacker behavior directed at employees.

Organizations currently lack:

A safe environment to observe attacker–victim interactions

Behavioral insights into manipulation strategies

Data for training employees against real-world threats

Intelligence to predict evolving social engineering techniques

PersonaMimic solves this gap by simulating human-like communication and capturing attacker tactics at scale.

✅ Proposed Solution

PersonaMimic creates realistic virtual employee personas that interact with attackers through simulated email conversations.

Core capabilities:

Generate unique employee-style personas

Receive and respond to phishing attempts using an LLM engine

Analyze messages for threat indicators

Log attacker behavior, linguistic signatures, and escalation patterns

Provide dashboards for security teams to study attacks and improve defenses

This allows organizations to observe attackers in a controlled sandbox and enhance their threat intelligence.

🎯 Why Capture Attacker Behavior?

Understanding attacker strategies improves defense far beyond traditional filters.

Behavioral data enables:

Identification of recurring attacker methods

Creation of smarter phishing detection rules

Stronger, reality-based employee training

Attribution using linguistic or behavioral fingerprints

Better deception-based defensive strategies

Early prediction of new social-engineering trends

🏗️ Tech Stack
Backend

Python (Flask / FastAPI)

AI Engine

Local LLMs: GPT4All, Llama 3, Phi-3

Optional cloud models (OpenAI, Anthropic, etc.)

Frontend

HTML/CSS/JavaScript or React

Database

SQLite or PostgreSQL

Dashboard

Plotly or Chart.js visualizations

Optional

Dockerized microservices for modular deployment

🚀 Scope for 36-Hour Hackathon

The MVP focuses on delivering a functional, interactive honeypot system:

3–5 realistic employee personas with behavior profiles

Simulated inbox interface (receive + send emails)

LLM-powered auto-reply engine

Basic phishing detection (rule-based or lightweight ML)

Logging dashboard:

conversation timeline

extracted malicious URLs/IPs

attacker behavior metrics

This scope ensures a complete working prototype within hackathon constraints.

🔮 Future Improvements

PersonaMimic can expand significantly beyond the MVP:

Real SMTP/IMAP integration for live email monitoring

ML/NLP-based advanced phishing classifiers

Multi-agent persona collaboration

Threat intelligence enrichment (URL/IP scoring APIs)

Automated sandboxing for malicious attachments

TTS/STT-enabled voice-call honeypots

💸 Estimated Costs
Component	Cost
Local LLM inference	Free/Minimal
Cloud LLM usage (optional)	~$10–$50/month
Hosting (basic VM)	~$5–$10/month
Hardware	None required
⚠️ Current Limitations

LLM responses may occasionally sound artificial

Basic detection rules limit phishing classification accuracy

No real-time integration with corporate email systems (MVP)

Persona realism can improve with larger datasets

Skilled attackers may detect automated behavior over time


=======
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
>>>>>>> origin/kavin
