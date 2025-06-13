# 🔧 Configurazione Redirect URL Supabase

## ❌ **Problema Attuale**
Quando clicchi sul link di conferma email, Supabase ti rimanda alla sua pagina di default invece che alla tua applicazione.

## ✅ **Soluzione**

### 1. **Vai su Supabase Dashboard**
Link diretto: https://supabase.com/dashboard/project/wcntwbujilcyqjchlezx

### 2. **Configura i Redirect URLs**
1. Nel tuo progetto, vai su **Authentication** → **URL Configuration**
2. Nella sezione **Redirect URLs**, aggiungi questi URL:

```
http://localhost:5173
http://localhost:5173/auth/callback
https://localhost:5173
https://localhost:5173/auth/callback
```

### 3. **Configura Site URL**
Nella stessa pagina, imposta il **Site URL** su:
```
http://localhost:5173
```

### 4. **Salva le Modifiche**
Clicca su **Save** per salvare le configurazioni.

---

## 🔄 **Come Testare**

1. **Dopo aver configurato i redirect URLs**
2. **Registra un nuovo utente** con una email diversa
3. **Controlla la email** e clicca sul link di conferma
4. **Ora dovrebbe rimandarti alla tua applicazione** invece che alla pagina di Supabase

---

## 📧 **Configurazione Email Template (Opzionale)**

Se vuoi personalizzare l'email di conferma:

1. Vai su **Authentication** → **Email Templates**
2. Seleziona **Confirm signup**
3. Personalizza il template con il tuo branding

---

## ⚠️ **Importante**

- I redirect URLs devono essere configurati **PRIMA** di inviare le email di conferma
- Le email già inviate continueranno a usare i vecchi redirect URLs
- Per testare, usa sempre una **nuova email** dopo aver configurato i redirect

---

## 🚀 **Prossimi Passi**

1. **Configura i redirect URLs** come indicato sopra
2. **Testa con una nuova registrazione**
3. **Fammi sapere se funziona** o se hai bisogno di aiuto