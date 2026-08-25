# Catalyst Production Deployment Guide

## Infrastructure Stack
- **Web App / API**: Next.js App Router deployed on Vercel or AWS ECS.
- **Rendering Engine**: Remotion Lambda (`us-east-1`) or headless Chromium worker.
- **Database**: Supabase PostgreSQL with RLS enabled.
- **Storage**: AWS S3 (`catalyst-videos-759433041913` in `us-east-1`).
- **AI / Services**: Anthropic Claude, OpenAI, Google Gemini, Firecrawl, Apify, Resend.

---

## Environment Variables Configuration
Set the following production environment variables in your deployment dashboard:

```bash
# Core AI Providers
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL_PRIMARY=claude-sonnet-4-5-20250929
ANTHROPIC_MODEL_FAST=claude-haiku-4-5-20251001

OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL_PRIMARY=gpt-4o-mini
OPENAI_TTS_MODEL=tts-1
OPENAI_TRANSCRIPTION_MODEL=whisper-1

GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
GEMINI_MODEL_PRIMARY=gemini-3.7-flash
GEMINI_MODEL_FAST=gemini-2.5-flash

# Research Providers
FIRECRAWL_API_KEY=fc-...
APIFY_API_TOKEN=apify_api_...

# Presenter & Voice
HEYGEN_API_KEY=sk_V2_...
HEYGEN_TEMPLATE_ID=ca65db63001f4ff98a09b156c1259b77
VAPI_API_KEY=376ffcb0-...

# Notifications & Automation
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_DEFAULT_RECIPIENT=pabbatek@gmail.com
N8N_API_KEY=eyJhbGci...

# Cloud Storage & Database
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_VIDEO_BUCKET=catalyst-videos-759433041913
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Health Check Verification
To verify subsystem health in production:
- **Provider Status**: `GET /api/providers/health`
- **System Subsystem Status**: `GET /api/system/health`
