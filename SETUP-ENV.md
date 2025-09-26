# Setup Environment Variables

Per configurare l'applicazione, crea un file `.env.local` nella root del progetto con le seguenti variabili:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://wcntwbujilcyqjchlezx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbnR3YnVqaWxjeXFqY2hsZXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzA5MzMsImV4cCI6MjA2NTMwNjkzM30.j_wdgBQOAI9ZwPhhryFJ0dZA1GqGLHq0XFAMHmyv458
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbnR3YnVqaWxjeXFqY2hsZXp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczMDkzMywiZXhwIjoyMDY1MzA2OTMzfQ.TyZLLKLpLre7uSRe6ulEfiV8fZUxhJjprSju8k-4i9w
SUPABASE_PROJECT_ID=wcntwbujilcyqjchlezx

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=AC3179248a466196e5a1d56606bc960098
TWILIO_AUTH_TOKEN=f27d028baab94d9372189e0867d45c3f
TWILIO_PHONE_NUMBER=+19127158603
TWILIO_API_KEY=SK1820912c2bc9119849365b76efd2941d

# Brevo Email Configuration
BREVO_SMTP_SERVER=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=8f595b002@smtp-brevo.com
BREVO_SMTP_PASSWORD=QA19nIpm0xFz8kRd
BREVO_API_KEY=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

# Cron Job Configuration
CRON_JOB_API_KEY=NQxSDRWILpZUSXUXLvJ4tn9pCUBmzfjqwLp+wzSbqMw=

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dfcaepp3t
CLOUDINARY_API_KEY=2qN3qTiewQhOxWKfH9_mHpZKyyo

# GitHub Repository
VITE_GITHUB_REPOSITORY_URL=https://github.com/Alcafer2011/alcafer-erp.git

# Log Level
VITE_LOG_LEVEL=debug

# AI Provider API Keys (Add your keys here)
# OpenAI
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Anthropic Claude
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Groq
VITE_GROQ_API_KEY=your_groq_api_key_here

# Hugging Face
VITE_HF_API_KEY=your_huggingface_api_key_here

# Mistral
VITE_MISTRAL_API_KEY=your_mistral_api_key_here

# Cohere
VITE_COHERE_API_KEY=your_cohere_api_key_here

# OpenRouter
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

# xAI (Grok)
VITE_XAI_API_KEY=your_xai_api_key_here

# Perplexity
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key_here

# oLLAMA (Local)
VITE_OLLAMA_BASE_URL=http://localhost:11434

# Spotify (Optional)
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

## Note Importanti:

1. **Prefisso VITE_**: Le variabili che iniziano con `VITE_` sono accessibili dal client (browser)
2. **Sicurezza**: Non committare mai il file `.env.local` nel repository
3. **AI Providers**: Sostituisci `your_*_api_key_here` con le tue chiavi API reali
4. **Spotify**: Opzionale, per funzionalità avanzate di Spotify

## Avvio dell'Applicazione:

Dopo aver creato il file `.env.local`, puoi avviare l'applicazione con:

```bash
# Windows
start-app.bat

# Oppure manualmente
npm run dev:all
```

L'applicazione sarà disponibile su:
- **App principale**: http://localhost:5173
- **AI Assistant**: http://localhost:5174 (se bolt.diy è abilitato)


