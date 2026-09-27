# AiAnimatedVideo

An AI-powered pipeline that turns a text prompt into a short animated video — casting characters, generating scenes, voicing them with text-to-speech, and rendering the final clip with Remotion.

## How it works

1. **Scene generation** — breaks a prompt into scenes and casts characters for them
2. **Voice generation** — converts scene dialogue to speech (TTS)
3. **AI video generation** — generates visuals per scene via the [Replicate](https://replicate.com) API
4. **Render** — composites scenes, audio, and visuals into a final video using [Remotion](https://www.remotion.dev)

## Tech stack

- **Backend**: Node.js, Express, Remotion (`@remotion/bundler`, `@remotion/renderer`)
- **Frontend**: React + Vite
- **AI video generation**: Replicate API

## Project structure

```
backend/
  src/
    routes/       Express API routes
    services/      Pipeline stages: scenes, casting, TTS, video gen, render
  remotion/        Remotion composition used for final rendering
frontend/
  src/              React UI to trigger and preview generated videos
```

## Getting started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # add your REPLICATE_API_TOKEN
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment variables

| Variable | Description |
| --- | --- |
| `REPLICATE_API_TOKEN` | API token for [Replicate](https://replicate.com), used for AI-generated video scenes |
