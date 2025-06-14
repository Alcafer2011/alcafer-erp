# 🔧 Configurazione Supabase Corretta

## ✅ Problemi Risolti

1. **Schema Database Completo**: Tutte le tabelle create correttamente
2. **Vincoli e Constraint**: Tutti i controlli di integrità implementati
3. **RLS e Security**: Row Level Security configurato su tutte le tabelle
4. **Trigger e Funzioni**: Numerazione automatica e audit trail
5. **Indici Performance**: Ottimizzazioni per query veloci
6. **Viste Helper**: Join comuni pre-calcolati

## 🔐 Configurazione Authentication

### 1. URL Configuration
Vai su: https://supabase.com/dashboard/project/wcntwbujilcyqjchlezx/auth/url-configuration

**Site URL**: `http://localhost:5173` (per sviluppo)
**Redirect URLs**: 
```
http://localhost:5173
http://localhost:5173/auth/callback
https://localhost:5173
https://localhost:5173/auth/callback
```

### 2. Email Templates
Vai su: https://supabase.com/dashboard/project/wcntwbujilcyqjchlezx/auth/templates

**Confirm signup**: Personalizza il template se necessario

### 3. Providers
Vai su: https://supabase.com/dashboard/project/wcntwbujilcyqjchlezx/auth/providers

**Email**: Abilitato ✅
**Confirm email**: Disabilitato (usiamo Brevo)

## 📊 Tabelle Create

1. **users** - Profili utenti con ruoli (alessandro, gabriel, hanna)
2. **clienti** - Gestione clienti
3. **preventivi** - Preventivi con numerazione automatica
4. **lavori** - Lavori con calcolo acconto automatico
5. **materiali_metallici** - Materiali metallici con calcolo totale
6. **materiali_vari** - Materiali vari con calcolo totale
7. **leasing_strumentali** - Costi attrezzature
8. **costi_utenze** - Costi utenze (elettricità, acqua, gas)
9. **prezzi_materiali** - Prezzi aggiornati materiali
10. **manovalanza** - Costi personale
11. **movimenti_contabili** - Movimenti finanziari
12. **tasse_iva** - Gestione tasse e IVA
13. **audit_log** - Log modifiche (solo admin)

## 🔑 API Keys

**Project URL**: `https://wcntwbujilcyqjchlezx.supabase.co`
**Anon Key**: Vai su Settings > API per ottenerla

## ✅ Test Database

Per testare che tutto funzioni:

1. **Connessione**: L'app dovrebbe connettersi senza errori
2. **Registrazione**: Nuovi utenti possono registrarsi
3. **Login**: Gli utenti possono fare login
4. **Permessi**: I ruoli funzionano correttamente
5. **CRUD**: Tutte le operazioni su clienti, preventivi, lavori funzionano

## 🚨 Importante

- **RLS abilitato** su tutte le tabelle per sicurezza
- **Audit trail**  per tracciare tutte le modifiche
- **Numerazione automatica** per preventivi e lavori
- **Calcolo automatico** per acconti e importi totali