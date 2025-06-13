# 🚀 Guida Setup Alcafer ERP - Nuovo Computer

## 📋 Requisiti Iniziali

### 1. Software Necessario
- **Node.js** (versione 18 o superiore) - [Scarica qui](https://nodejs.org)
- **Git** (opzionale, per clonare il repository)
- **Browser moderno** (Chrome, Firefox, Safari, Edge)

### 2. Account Necessari (già configurati)
- ✅ **Supabase** - Database e autenticazione
- ✅ **Cloudinary** - Gestione file e immagini
- ✅ **Brevo** - Servizio email
- ✅ **Twilio** - Notifiche WhatsApp
- ✅ **Cron-job.org** - Automazioni

## 🔧 Setup Passo-Passo

### Passo 1: Scarica il Progetto
```bash
# Opzione A: Se hai un repository GitHub
git clone [URL_DEL_TUO_REPO]
cd alcafer-erp

# Opzione B: Scarica come ZIP
# Estrai il file ZIP in una cartella e aprila nel terminale
```

### Passo 2: Installa le Dipendenze
```bash
npm install
```

### Passo 3: Configura le Variabili d'Ambiente
Crea un file `.env` nella cartella principale e copia questo contenuto:

```env
# Supabase - IMPORTANTE: Sostituisci con le tue credenziali reali
# Vai su https://supabase.com/dashboard > Il tuo progetto > Settings > API
VITE_SUPABASE_URL=https://wcntwbujilcyqjchlezx.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key_here

# Email Service (Brevo) - INSERISCI I TUOI DATI
VITE_BREVO_API_KEY=your_brevo_api_key_here

# WhatsApp Service (Twilio) - INSERISCI I TUOI DATI
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_PHONE_NUMBER=your_twilio_phone_number

# File Management (Cloudinary) - INSERISCI I TUOI DATI
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
VITE_CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Cron Job Configuration - INSERISCI I TUOI DATI
VITE_CRON_JOB_API_KEY=your_cron_job_api_key

# App Configuration (già configurato)
VITE_APP_URL=http://localhost:5173
VITE_ADMIN_EMAIL=info.alcafer@gmail.com
VITE_ADMIN_PHONE=+393391231150
```

### Passo 4: Avvia l'Applicazione
```bash
npm run dev
```

L'applicazione sarà disponibile su: `http://localhost:5173`

## 🔑 Come Ottenere le API Keys

### ⚠️ IMPORTANTE: Supabase API Key
1. Vai su [supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto **wcntwbujilcyqjchlezx**
3. Vai in **Settings > API**
4. Copia la **Project API key (anon public)** - NON la service_role key
5. Sostituisci `your_actual_supabase_anon_key_here` nel file `.env`

### Cloudinary
1. Vai su [cloudinary.com](https://cloudinary.com)
2. Accedi al tuo account
3. Nel Dashboard trovi:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Brevo (Email)
1. Vai su [brevo.com](https://brevo.com)
2. Accedi al tuo account
3. Vai in **Settings > API Keys**
4. Crea una nuova API Key

### Twilio (WhatsApp)
1. Vai su [twilio.com](https://twilio.com)
2. Accedi al tuo account
3. Nel Console Dashboard trovi:
   - **Account SID**
   - **Auth Token**
   - **Phone Number** (per WhatsApp)

### Cron-job.org
1. Vai su [cron-job.org](https://cron-job.org)
2. Accedi al tuo account
3. Vai in **Account > API**
4. Copia la tua API Key

## 📱 Accesso da Dispositivi Mobili

L'applicazione è completamente responsive e funziona su:
- **Smartphone** (Android/iOS)
- **Tablet** (Android/iOS)
- **Desktop** (Windows/Mac/Linux)

## 🔐 Sicurezza e Backup

- ✅ Tutti i dati sono su Supabase (cloud)
- ✅ File su Cloudinary (cloud)
- ✅ Backup automatici giornalieri
- ✅ Accesso limitato ai 3 utenti autorizzati
- ✅ Notifiche automatiche via email/WhatsApp

## 🚨 Risoluzione Problemi

### ❌ Errore: "Invalid API key" (Supabase)
1. Vai su [supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleziona il progetto **wcntwbujilcyqjchlezx**
3. Vai in **Settings > API**
4. Copia la **Project API key (anon public)**
5. Sostituisci nel file `.env` la variabile `VITE_SUPABASE_ANON_KEY`
6. Riavvia l'applicazione con `npm run dev`

### Errore: "npm install" fallisce
```bash
npm install --legacy-peer-deps
```

### Errore: "Port 5173 already in use"
```bash
npm run dev -- --port 3000
```

### L'app non si carica
1. Controlla che il file `.env` sia configurato correttamente
2. Verifica che tutte le API keys siano valide
3. Controlla la console del browser per errori

## 📞 Supporto

Se hai problemi:
1. Controlla la console del browser (F12)
2. Verifica che tutte le variabili d'ambiente siano configurate
3. Assicurati che Node.js sia installato correttamente

## 🎯 Prossimi Passi

Una volta configurato:
1. Testa il login con i tuoi dati
2. Verifica che tutte le sezioni siano accessibili
3. Controlla che le notifiche funzionino
4. Testa l'upload di file

---

**Nota**: Tutti i dati sono sincronizzati automaticamente tra i dispositivi. Non perderai mai nulla! 🚀