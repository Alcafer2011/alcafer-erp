/*
  # Creazione tabella fornitori

  1. Nuova Tabella
    - `fornitori`
      - `id` (uuid, primary key)
      - `nome` (text, nome/ragione sociale del fornitore)
      - `email` (text, email principale)
      - `telefono` (text, numero di telefono)
      - `indirizzo` (text, indirizzo completo)
      - `partita_iva` (text, P.IVA del fornitore)
      - `codice_fiscale` (text, codice fiscale)
      - `tipo_fornitore` (text, categoria del fornitore)
      - `settore_merceologico` (text, settore di specializzazione)
      - `condizioni_pagamento` (text, termini di pagamento standard)
      - `sconto_standard` (numeric, sconto percentuale standard)
      - `valutazione` (integer, valutazione da 1 a 5)
      - `note` (text, note aggiuntive)
      - `attivo` (boolean, se il fornitore è attivo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sicurezza
    - Abilitare RLS sulla tabella `fornitori`
    - Aggiungere policy per utenti autenticati

  3. Indici
    - Indice su nome per ricerche veloci
    - Indice su tipo_fornitore per filtraggio
    - Indice su partita_iva per unicità

  4. Trigger
    - Trigger per aggiornamento automatico di updated_at
    - Trigger per audit log