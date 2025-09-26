# Alcafer ERP - Installer Windows

## Installazione Rapida

1. **Estrai tutti i file** in una cartella temporanea
2. **Esegui come Amministratore**: `setup.bat`
3. **Segui le istruzioni** a schermo
4. **Configura le API**: esegui `configure_apis.bat`
5. **Avvia il sistema**: esegui `start_alcafer_erp.bat`

## Requisiti Sistema

- Windows 10/11 (64-bit)
- 4GB RAM minimo (8GB consigliato)
- 2GB spazio libero su disco
- Connessione internet per il download delle dipendenze

## Componenti Installati

### 🏭 Alcafer ERP
- Sistema di gestione aziendale completo
- Gestione clienti, preventivi, lavori
- Contabilità e analisi finanziarie
- Connessione Supabase per database cloud

### 🤖 bolt.diy AI Assistant
- Assistente AI integrato per sviluppo
- Monitoraggio automatico errori
- Correzioni automatiche del codice
- Integrazione con Anthropic Claude

### 🔗 Integrazioni
- **Supabase**: Database cloud PostgreSQL
- **GitHub**: Versionamento e backup codice
- **Anthropic**: AI per correzioni automatiche
- **Servizi gratuiti**: Analytics, notifiche, backup

## Configurazione API Keys

### Supabase (Obbligatorio)
1. Vai su https://supabase.com
2. Crea un nuovo progetto
3. Vai in Settings > API
4. Copia URL e Anon Key

### Anthropic (Obbligatorio per AI)
1. Vai su https://console.anthropic.com
2. Crea un account
3. Genera una API Key
4. Inserisci nel configuratore

### GitHub (Opzionale)
1. Vai su https://github.com/settings/tokens
2. Genera un Personal Access Token
3. Seleziona scope: repo, read:user

## Utilizzo

### Avvio Sistema
```batch
start_alcafer_erp.bat
```

### Configurazione API
```batch
configure_apis.bat
```

### Aggiornamento
```batch
update_system.bat
```

## URL Applicazioni

- **Alcafer ERP**: http://localhost:5173
- **bolt.diy AI**: http://localhost:5174

## Funzionalità bolt.diy

### 🔍 Monitoraggio Automatico
- Rileva errori JavaScript in tempo reale
- Monitora performance dell'applicazione
- Controlla connessione database
- Verifica integrità del codice

### 🔧 Correzioni Automatiche
- Suggerisce fix per errori comuni
- Corregge problemi di sintassi
- Ottimizza query database
- Aggiorna dipendenze obsolete

### 🤖 AI Assistant
- Chat integrata con Claude
- Analisi codice avanzata
- Generazione automatica di codice
- Debugging intelligente

## Risoluzione Problemi

### Errore "command not found"
- Riavvia il terminale
- Controlla che Node.js sia nel PATH
- Riesegui l'installer come amministratore

### Errore connessione Supabase
- Verifica URL e API Key
- Controlla connessione internet
- Riesegui configure_apis.bat

### bolt.diy non si avvia
- Controlla che pnpm sia installato
- Verifica API Key Anthropic
- Controlla porta 5174 libera

### Errori di permessi
- Esegui sempre come Amministratore
- Disabilita temporaneamente antivirus
- Controlla Windows Defender

## Supporto

Per supporto tecnico:
- Email: assistenza.alcafer@gmail.com
- Telefono: +39 339 123 1150

## Licenza

MIT License - Uso libero per scopi commerciali e personali.

---

© 2025 Alcafer & Gabifer - Sistema ERP Integrato
