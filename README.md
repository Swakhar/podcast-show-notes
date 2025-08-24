## AI‑Powered Podcast Show Notes Generator

This repository contains a full‑stack project that lets users upload audio
files or provide a podcast URL and automatically generates show notes,
timestamps, summaries and social media snippets using OpenAI models and
modern tooling.  The application is split into two parts:

* **Frontend** – built with [Next.js](https://nextjs.org/) and styled with
  [Tailwind CSS](https://tailwindcss.com/).  It provides a simple interface
  for uploading audio or entering a podcast link, tracks processing
  progress, and displays the generated notes when ready.
* **Backend** – built with [FastAPI](https://fastapi.tiangolo.com/).  It
  handles uploads, downloads audio from remote URLs, runs speech
  transcription (via Whisper or AssemblyAI), calls OpenAI to summarise
  content, create show notes and social snippets, and returns the results
  asynchronously.  A lightweight in‑memory job queue is used for the sake
  of simplicity; a Celery example is included if you wish to deploy at
  scale.

> **Note**: The code in this repository is designed for local
> development and demonstration.  It includes placeholders for external
> services such as Whisper and OpenAI; you will need to provide your own
> API keys and configure a broker for Celery if you enable it.

### Quick Start

Clone the repository and install the dependencies for both the frontend
and backend.  The following commands assume you are in the root folder
(`podcast-show-notes`).  The backend runs on port `8000` by default and
the frontend on port `3000`.

```bash
# install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# copy environment variables (add your keys here)
cp .env.example .env

# run the FastAPI server
uvicorn main:app --reload

# in a new terminal, install frontend dependencies
cd ../frontend
npm install

# start Next.js server
npm run dev
```

Open `http://localhost:3000` in your browser and upload an MP3/WAV
file or paste a podcast URL.  The frontend will send the file to the
backend, which processes it in the background.  When finished, the
results will appear on the page.

### Directory Structure

```
podcast-show-notes/
├── backend/       # FastAPI application
│   ├── main.py    # entrypoint for FastAPI
│   ├── tasks.py   # optional Celery tasks (unused by default)
│   ├── celeryconfig.py  # Celery configuration (optional)
│   ├── requirements.txt # Python dependencies
│   └── .env.example    # template for environment variables
└── frontend/      # Next.js web client
    ├── pages/
    │   ├── _app.tsx    # customise Next.js App
    │   └── index.tsx   # main page
    ├── styles/
    │   └── globals.css # Tailwind base styles
    ├── components/     # React components (optional)
    ├── public/         # static assets
    ├── package.json    # Node dependencies and scripts
    ├── tsconfig.json   # TypeScript configuration
    ├── postcss.config.js  # PostCSS/Tailwind config
    └── tailwind.config.js  # Tailwind theme config
```

### Authentication & Deployment

This starter doesn’t include authentication out of the box, but
Next.js API routes make it straightforward to add user login and
authorization.  You can integrate with providers like Auth0, Google
OAuth or your own token based system.  For deployment, the backend can
be containerised and run on a platform such as AWS Fargate or Azure
Container Apps.  The frontend can be deployed to Vercel or Netlify; be
sure to update `NEXT_PUBLIC_API_BASE_URL` so it points at your hosted
FastAPI endpoint.