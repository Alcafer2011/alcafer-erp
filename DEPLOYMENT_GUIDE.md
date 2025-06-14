# 🚀 Guida Configurazione Post-Deployment

## 📋 Passaggi da Completare Manualmente

### 1. 🔧 Configurare Variabili d'Ambiente su Netlify

1. **Vai su Netlify Dashboard**: https://app.netlify.com
2. **Seleziona il tuo sito** dalla lista
3. **Vai su**: Site settings → Environment variables
4. **Aggiungi queste variabili** (una per una):

```
VITE_SUPABASE_URL=https://wcntwbujilcyqjchlezx.supabase.co
VITE_SUPABASE_ANON_KEY=[LA_TUA_CHIAVE_SUPABASE]
VITE_BREVO_API_KEY=[LA_TUA_CHIAVE_BREVO]
VITE_TWILIO_ACCOUNT_SID=[IL_TUO_SID_TWILIO]
VITE_TWILIO_AUTH_TOKEN=[IL_TUO_TOKEN_TWILIO]
VITE_TWILIO_PHONE_NUMBER=[IL_TUO_NUMERO_TWILIO]
VITE_CLOUDINARY_CLOUD_NAME=[IL_TUO_CLOUD_NAME]
VITE_CLOUDINARY_API_KEY=[LA_TUA_CHIAVE_CLOUDINARY]
VITE_CLOUDINARY_API_SECRET=[IL_TUO_SECRET_CLOUDINARY]
VITE_OCR_API_KEY=placeholder_ocr_key
VITE_MATERIAL_PRICES_API_KEY=placeholder_material_key
VITE_CRON_JOB_API_KEY=placeholder_cron_key
VITE_APP_URL=[URL_NETLIFY_GENERATO]
VITE_ADMIN_EMAIL=info.alcafer@gmail.com
VITE_ADMIN_PHONE=+393391231150
```

### 2. 🌐 Aggiornare URL dell'App

Dopo il deployment, Netlify ti darà un URL tipo:
`https://amazing-site-name-123456.netlify.app`

**Sostituisci** `VITE_APP_URL` con questo URL nelle variabili d'ambiente.

### 3. 🔐 Configurare Supabase Redirect URLs

1. **Vai su**: https://supabase.com/dashboard/project/wcntwbujilcyqjchlezx
2. **Vai su**: Authentication → URL Configuration
3. **Aggiungi questi URL** nella sezione "Redirect URLs":
   ```
   https://[IL_TUO_URL_NETLIFY].netlify.app
   https://[IL_TUO_URL_NETLIFY].netlify.app/auth/callback
   ```
4. **Imposta Site URL** su: `https://[IL_TUO_URL_NETLIFY].netlify.app`
5. **Clicca Save**

### 4. 🔄 Rideploy dopo la Configurazione

Dopo aver configurato le variabili d'ambiente:
1. **Torna su Netlify Dashboard**
2. **Vai su**: Deploys
3. **Clicca**: "Trigger deploy" → "Deploy site"

## ✅ Test Post-Deployment

1. **Apri il sito** dall'URL Netlify
2. **Prova la registrazione** con una nuova email
3. **Controlla** che le email di conferma arrivino
4. **Verifica** che il login funzioni

## 🚨 Troubleshooting

### Se il sito non si carica:
- Controlla che tutte le variabili d'ambiente siano configurate
- Verifica che non ci siano errori nel build log di Netlify

### Se la registrazione non funziona:
- Controlla i Redirect URLs in Supabase
- Verifica che `VITE_SUPABASE_ANON_KEY` sia corretta

### Se le email non arrivano:
- Controlla che `VITE_BREVO_API_KEY` sia corretta
- Verifica che l'account Brevo sia attivo

## 📞 Supporto

Se hai problemi, fammi sapere quale passaggio non funziona e ti aiuterò a risolverlo!