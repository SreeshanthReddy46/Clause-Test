# Clause Test AI QA Swarm

Clause Test is an AI-powered multi-agent quality assurance platform designed to automate and enhance technical audits of websites, SRS documents, and source code. By orchestrating a swarm of specialized AI agents, it provides deep heuristic evaluations, security scans, and performance analysis.

## Features

- **Multi-Agent Orchestration**: Specialized agents for UI, Functional, API, Security, Performance, and Bug Reporting.
- **SRS & Requirement Mapping**: Cross-references technical documents against live artifacts.
- **Traffic Monitoring Simulation**: Detects potential API bottlenecks and race conditions.
- **Secure Audit Archives**: Persistent history of all AI scans stored in Firestore.
- **Google Authentication**: Secure user login and personalized history.
- **PDF Export**: Generate professional audit reports for stakeholders.

## Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, GSAP, Motion.
- **Backend**: Node.js, Express (with integrated Vite middleware).
- **AI**: Google Gemini API (Gemini-3-Flash).
- **Database/Auth**: Firebase Firestore & Firebase Auth.

## Getting Started

### Prerequisites

- Node.js (v18+)
- Firebase Project (Configured via `firebase-applet-config.json`)
- Google Gemini API Key

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file with:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   PORT=3000
   ```

### Development

Run the development server (Full-stack):
```bash
npm run dev
```

### Build & Deploy

Build the production assets and server:
```bash
npm run build
```

Start the production server:
```bash
npm run start
```

## Render Deployment Note

This app is configured as a full-stack Web Service.
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Publish Directory**: Not applicable (Web Service), but static assets are served from `./dist`.

-----------
