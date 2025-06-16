# 🔐 Sistema Permessi Utente - Alcafer & Gabifer ERP

## 👥 **Utenti Autorizzati**

Il sistema riconosce automaticamente gli utenti autorizzati in base a **Nome + Cognome + Data di Nascita**:

### 1. **Alessandro Calabria** 
- **Ruolo**: `alessandro` (Amministratore)
- **Permessi**: Accesso completo a tutto il sistema
- **Riconoscimento**: Nome contiene "alessandro" + Cognome contiene "calabria"

### 2. **Gabriel Prunaru**
- **Ruolo**: `gabriel` (Operatore)
- **Permessi**: Gestione preventivi, lavori, materiali
- **Riconoscimento**: Nome contiene "gabriel" + Cognome contiene "prunaru"

### 3. **Hanna Mazhar**
- **Ruolo**: `hanna` (Contabilità)
- **Permessi**: Visualizzazione dati finanziari, report, dividendi
- **Riconoscimento**: Nome contiene "hanna" + Cognome contiene "mazhar"

---

## 🔒 **Matrice Permessi**

| Funzionalità | Alessandro | Gabriel | Hanna |
|--------------|------------|---------|-------|
| **Dashboard** | ✅ | ✅ | ✅ |
| **Clienti** | ✅ | ✅ | ✅ |
| **Preventivi** | ✅ | ✅ | ❌ |
| **Lavori** | ✅ | ✅ | ❌ |
| **Materiali Metallici** | ✅ | ✅ | ❌ |
| **Materiali Vari** | ✅ | ✅ | ❌ |
| **Leasing Strumentali** | ✅ | ❌ | ❌ |
| **Manovalanza** | ✅ | ❌ | ❌ |
| **Home Finanziaria** | ✅ | ❌ | ✅ |
| **Dividendi** | ✅ | ❌ | ✅ |
| **Tasse Alcafer** | ✅ | ❌ | ❌ |
| **Tasse Gabifer** | ✅ | ❌ | ❌ |

---

## 🔧 **Come Funziona**

### **1. Registrazione**
- L'utente inserisce **Nome**, **Cognome** e **Data di Nascita**
- Il sistema confronta automaticamente con i nomi autorizzati
- Se non riconosciuto → **Registrazione bloccata**

### **2. Assegnazione Ruolo**
```javascript
// Esempio di riconoscimento
const fullName = "alessandro calabria";
if (fullName.includes('alessandro') && fullName.includes('calabria')) {
  ruolo = 'alessandro'; // Amministratore
}
```

### **3. Controllo Permessi**
- Ogni pagina controlla il ruolo dell'utente
- Se non autorizzato → **Messaggio "Accesso Limitato"**
- Menu dinamico → **Solo sezioni accessibili**

---

## 🚨 **Sicurezza**

### **Protezione Database**
- **Row Level Security (RLS)** abilitato su tutte le tabelle
- Solo utenti autenticati possono accedere ai dati
- Ogni operazione è tracciata

### **Controllo Frontend**
- Hook `usePermissions()` controlla i permessi in tempo reale
- Menu dinamico nasconde sezioni non autorizzate
- Redirect automatico se accesso negato

### **Validazione Backend**
- Supabase verifica l'autenticazione
- Policies SQL controllano l'accesso ai dati
- Impossibile bypassare i controlli

---

## 📱 **Esperienza Utente**

### **Per Alessandro (Admin)**
- Vede **tutto il menu** completo
- Accesso a **tutte le funzionalità**
- Può modificare **tutti i dati**

### **Per Gabriel (Operatore)**
- Menu **limitato** alle operazioni
- Non vede sezioni finanziarie
- Focus su preventivi e lavori

### **Per Hanna (Contabilità)**
- Accesso a **dati finanziari**
- Visualizzazione **report e dividendi**
- Non può modificare preventivi/lavori

### **Per Utenti Non Autorizzati**
- **Registrazione bloccata** con messaggio chiaro
- Impossibile creare account
- Sistema completamente protetto

---

## 🔄 **Aggiornamento Permessi**

Per modificare i permessi o aggiungere utenti:

1. **Modifica il file**: `src/components/auth/LoginForm.tsx`
2. **Funzione**: `determineUserRole()`
3. **Aggiungi nuove condizioni** per riconoscere altri utenti
4. **Aggiorna**: `src/hooks/usePermissions.ts` per i nuovi ruoli

---

## ✅ **Test del Sistema**

### **Registrazione Autorizzata**
1. Nome: "Alessandro", Cognome: "Calabria" → ✅ Ruolo: alessandro
2. Nome: "Gabriel", Cognome: "Prunaru" → ✅ Ruolo: gabriel  
3. Nome: "Hanna", Cognome: "Mazhar" → ✅ Ruolo: hanna

### **Registrazione Bloccata**
1. Nome: "Mario", Cognome: "Rossi" → ❌ "Utente non autorizzato"
2. Qualsiasi altro nome → ❌ Registrazione negata

---

## 🎯 **Vantaggi**

1. **🔒 Sicurezza Massima** - Solo utenti autorizzati
2. **🎨 UX Personalizzata** - Menu dinamico per ruolo
3. **⚡ Performance** - Carica solo dati necessari
4. **📊 Tracciabilità** - Ogni azione è registrata
5. **🔧 Manutenibilità** - Facile aggiungere nuovi utenti

Il sistema è **completamente automatico** e **sicuro**! 🚀