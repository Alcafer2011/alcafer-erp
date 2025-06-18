import React, { useState } from 'react';
import { 
  TrendingUp, Users, Target, BarChart2, Share2, 
  Award, Globe, Mail, MessageSquare, Zap, Download,
  Smartphone, Briefcase, CheckCircle, AlertTriangle,
  Send, Sparkles, FileText, Lightbulb, PenTool
} from 'lucide-react';
import { motion } from 'framer-motion';
import HelpTooltip from '../components/common/HelpTooltip';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Marketing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'strategie' | 'clienti' | 'report' | 'aiGenerator'>('strategie');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportType, setReportType] = useState<'cliente' | 'fornitore' | null>(null);
  const [reportQuery, setReportQuery] = useState('');
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleGenerateReport = () => {
    if (!reportType || !reportQuery.trim()) {
      toast.error('Seleziona un tipo di report e inserisci un nome o partita IVA');
      return;
    }

    setGeneratingReport(true);
    
    // Simula generazione report
    setTimeout(() => {
      setGeneratingReport(false);
      toast.success(`Report ${reportType === 'cliente' ? 'cliente' : 'fornitore'} generato con successo`);
    }, 2500);
  };

  const downloadStrategy = (strategy: string) => {
    toast.success(`Strategia "${strategy}" scaricata come PDF`);
  };

  const handleGenerateAIStrategy = () => {
    if (!aiPrompt.trim() && !selectedTemplate) {
      toast.error('Inserisci una descrizione o seleziona un template');
      return;
    }

    setGeneratingStrategy(true);
    setAiResponse(null);
    
    // Simula generazione AI
    setTimeout(() => {
      let response = '';
      
      if (selectedTemplate === 'email_marketing') {
        response = `# Strategia Email Marketing per Alcafer & Gabifer

## Obiettivi
- Aumentare la visibilità del brand nel settore metalmeccanico
- Generare nuovi lead qualificati
- Mantenere relazioni con clienti esistenti
- Comunicare novità e promozioni

## Piano d'Azione

### 1. Segmentazione Database
- **Clienti attuali**: Suddivisi per volume d'acquisto e settore
- **Clienti potenziali**: Categorizzati per settore e dimensione azienda
- **Clienti inattivi**: Non hanno effettuato ordini negli ultimi 12 mesi

### 2. Tipi di Email da Implementare
- **Newsletter mensile**: Novità del settore, aggiornamenti aziendali
- **Email informative**: Nuovi servizi, aggiornamenti tecnologici
- **Offerte speciali**: Promozioni stagionali, sconti su materiali specifici
- **Follow-up post-preventivo**: Automatizzate 7 giorni dopo l'invio di un preventivo
- **Email di riattivazione**: Per clienti inattivi da più di 6 mesi

### 3. Contenuti Suggeriti
- Case study di progetti realizzati
- Aggiornamenti su nuovi macchinari o tecnologie
- Trend del mercato metalmeccanico
- Consigli tecnici e best practice
- Testimonianze di clienti soddisfatti

### 4. Calendario Editoriale
- **Settimana 1**: Newsletter mensile
- **Settimana 2**: Email informativa tecnica
- **Settimana 3**: Offerta speciale o promozione
- **Settimana 4**: Case study o testimonianza cliente

### 5. Metriche da Monitorare
- Tasso di apertura (target: >25%)
- Tasso di click (target: >3%)
- Tasso di conversione (target: >1%)
- Tasso di disiscrizione (target: <0.5%)

## Strumenti Consigliati
- Brevo (ex Sendinblue): Piattaforma completa con piano gratuito fino a 300 email/giorno
- MailerLite: Interfaccia intuitiva, automazioni avanzate
- HubSpot: CRM integrato per tracciare lead e conversioni

## Tempistiche di Implementazione
- Settimana 1-2: Setup piattaforma e importazione contatti
- Settimana 3-4: Creazione template e prime campagne
- Mese 2: Implementazione automazioni
- Mese 3: Analisi risultati e ottimizzazione`;
      } 
      else if (selectedTemplate === 'social_media') {
        response = `# Strategia Social Media per Alcafer & Gabifer

## Piattaforme Prioritarie
1. **LinkedIn** - Focus principale per B2B
2. **Instagram** - Contenuti visivi di progetti e lavorazioni
3. **YouTube** - Video tutorial e presentazioni tecniche

## Strategia LinkedIn

### Obiettivi
- Posizionarsi come esperti nel settore metalmeccanico
- Generare lead B2B qualificati
- Networking con potenziali clienti e partner

### Piano Editoriale
- **Lunedì**: Aggiornamenti di settore, news rilevanti
- **Mercoledì**: Showcase di progetti completati con dettagli tecnici
- **Venerdì**: Contenuti educativi, tips & tricks, best practice

### Contenuti Suggeriti
- Case study dettagliati di progetti complessi
- Articoli tecnici su materiali e lavorazioni
- Post su innovazioni tecnologiche nel settore
- Aggiornamenti su certificazioni e standard di qualità
- Contenuti "behind the scenes" del processo produttivo

## Strategia Instagram

### Obiettivi
- Mostrare la qualità delle lavorazioni
- Umanizzare il brand
- Attrarre talenti per potenziali assunzioni

### Contenuti Suggeriti
- Foto di alta qualità dei progetti completati
- Video time-lapse delle lavorazioni
- Stories dei macchinari in azione
- Presentazione del team e della cultura aziendale
- Reel con tecniche di lavorazione particolari

### Hashtag Strategici
#MetalworkingItaly #ItalianMetalcraft #CustomMetalwork #SteelFabrication #MetalworkingExcellence #MadeInItaly #IndustrialDesign

## Strategia YouTube

### Obiettivi
- Educare potenziali clienti
- Dimostrare competenza tecnica
- Migliorare SEO e visibilità online

### Contenuti Suggeriti
- Tutorial su manutenzione di strutture metalliche
- Video esplicativi su differenti tipi di materiali e loro applicazioni
- Tour virtuali dell'officina
- Interviste con esperti del settore
- Timelapse di progetti complessi dalla progettazione alla realizzazione

## Calendario di Pubblicazione
- LinkedIn: 3 post a settimana
- Instagram: 2 post a settimana + 3-5 stories
- YouTube: 1 video al mese

## Metriche da Monitorare
- Engagement rate (commenti, condivisioni, like)
- Crescita follower
- Traffico al sito web dai social
- Lead generati
- Tasso di conversione`;
      } 
      else if (selectedTemplate === 'seo_local') {
        response = `# Strategia SEO Locale per Alcafer & Gabifer

## Analisi Iniziale

### Keywords Target
- **Primarie**: carpenteria metallica lombardia, lavorazione metalli pavia, costruzioni in ferro lombardia
- **Secondarie**: cancelli in ferro battuto, strutture metalliche su misura, lavorazioni acciaio inox
- **Long-tail**: preventivo carpenteria metallica pavia, realizzazione strutture in ferro per capannoni lombardia

### Competitor Locali
- Analisi dei primi 5 competitor nei risultati di ricerca locali
- Valutazione dei loro punti di forza e debolezza SEO
- Identificazione opportunità di differenziazione

## Ottimizzazione Google My Business

### Azioni Immediate
1. Completare al 100% il profilo GMB con:
   - Orari precisi e aggiornati
   - Categoria principale e secondarie accurate
   - Descrizione ottimizzata con keywords locali
   - Servizi dettagliati con prezzi indicativi
   - Attributi rilevanti (es. preventivi gratuiti, consegna)

2. Piano Foto:
   - Caricamento 20+ foto professionali dell'officina
   - Foto dei macchinari in azione
   - Foto del team al lavoro
   - Esempi di progetti completati con didascalie ottimizzate

3. Recensioni:
   - Implementare sistema di richiesta recensioni post-lavoro
   - Rispondere a tutte le recensioni entro 24 ore
   - Obiettivo: 5 nuove recensioni positive al mese

## Ottimizzazione Sito Web

### Ottimizzazioni On-Page
1. Creazione pagine localizzate:
   - Landing page per ogni comune principale servito
   - Contenuti unici con riferimenti locali specifici
   - Ottimizzazione meta tag con keywords locali

2. Contenuti tecnici:
   - Blog con articoli su progetti locali realizzati
   - Guide tecniche per diversi settori (edilizia, arredamento, etc.)
   - FAQ ottimizzate per featured snippets

3. Ottimizzazioni tecniche:
   - Schema markup locale (LocalBusiness)
   - Ottimizzazione velocità caricamento mobile
   - Implementazione breadcrumbs con schema markup

## Link Building Locale

### Strategie
1. Directory locali:
   - Registrazione in 20+ directory di qualità
   - Associazioni di categoria locali
   - Camera di Commercio e portali istituzionali

2. Collaborazioni locali:
   - Articoli guest su blog di settore
   - Interviste con media locali
   - Sponsorizzazioni eventi locali con backlink

3. Creazione contenuti linkable:
   - Guida completa alle normative locali per strutture metalliche
   - Infografica sui benefici delle strutture in acciaio vs altri materiali
   - Case study dettagliati di progetti locali significativi

## Monitoraggio e KPI

### Metriche da Monitorare
- Posizionamento keywords locali (settimanale)
- Traffico organico da località target (mensile)
- Conversioni da ricerche locali (mensile)
- Impressioni e azioni su Google My Business (settimanale)
- Backlink da domini locali (mensile)

### Obiettivi a 6 Mesi
- Top 3 per 5 keywords primarie locali
- Aumento 50% traffico organico locale
- 30+ recensioni Google con media 4.8+
- 15+ backlink da domini locali di qualità`;
      }
      else {
        // Genera risposta basata sul prompt dell'utente
        const baseResponse = `# Strategia di Marketing Personalizzata: ${aiPrompt}

## Analisi Situazione Attuale

### Punti di Forza
- Esperienza consolidata nel settore metalmeccanico
- Capacità di realizzare lavorazioni complesse e personalizzate
- Macchinari all'avanguardia per lavorazioni di precisione
- Doppia struttura aziendale (Alcafer e Gabifer) che offre flessibilità

### Opportunità di Mercato
- Crescente domanda di componenti metallici personalizzati
- Trend positivo nel settore dell'edilizia sostenibile
- Possibilità di espansione in nicchie specializzate
- Digitalizzazione del settore ancora in fase iniziale

## Piano Strategico

### Obiettivi
- Aumentare la visibilità del brand nel territorio lombardo
- Incrementare il portfolio clienti del 20% nei prossimi 12 mesi
- Migliorare la percezione di qualità e affidabilità
- Ottimizzare il processo di acquisizione lead

### Azioni Concrete
1. **Presenza Online Migliorata**
   - Ottimizzazione SEO per keywords locali e di settore
   - Creazione contenuti tecnici di valore per il blog aziendale
   - Showcase progetti completati con dettagli tecnici e testimonianze

2. **Campagne Marketing Mirate**
   - Campagne Google Ads geolocalizzate (raggio 100km)
   - Remarketing per visitatori del sito che non hanno completato il form
   - LinkedIn Ads per decision maker B2B nel settore industriale

3. **Networking e Partnership**
   - Partecipazione a fiere di settore locali (MECSPE, Made in Steel)
   - Collaborazioni con studi di architettura e progettazione
   - Membership in associazioni di categoria con visibilità

## Implementazione e Timeline

### Fase 1: Preparazione (Mese 1-2)
- Audit completo presenza online
- Definizione buyer personas dettagliate
- Setup strumenti di analisi e tracking

### Fase 2: Lancio (Mese 3-4)
- Implementazione ottimizzazioni sito web
- Avvio prime campagne pubblicitarie
- Creazione materiale marketing

### Fase 3: Ottimizzazione (Mese 5-12)
- Analisi risultati e aggiustamenti strategia
- Scaling campagne performanti
- Implementazione programma referral clienti

## Metriche di Successo
- Incremento traffico qualificato al sito: target +40%
- Tasso conversione form contatto: target 3.5%
- Costo acquisizione cliente: target -15%
- ROI campagne marketing: target 300%`;

        response = baseResponse;
      }
      
      setAiResponse(response);
      setGeneratingStrategy(false);
      
      if (selectedTemplate) {
        toast.success(`Strategia ${selectedTemplate === 'email_marketing' ? 'Email Marketing' : selectedTemplate === 'social_media' ? 'Social Media' : 'SEO Locale'} generata con successo!`);
      } else {
        toast.success('Strategia personalizzata generata con successo!');
      }
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing e Acquisizione Clienti</h1>
          <p className="mt-2 text-gray-600">Strategie avanzate per la crescita aziendale</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('strategie')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'strategie' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Strategie Marketing
          </div>
        </button>
        <button
          onClick={() => setActiveTab('clienti')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'clienti' 
              ? 'border-green-600 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Acquisizione Clienti
          </div>
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'report' 
              ? 'border-purple-600 text-purple-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" />
            Report Affidabilità
          </div>
        </button>
        <button
          onClick={() => setActiveTab('aiGenerator')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'aiGenerator' 
              ? 'border-amber-600 text-amber-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            Generatore AI
          </div>
        </button>
      </div>

      {/* Strategie Marketing */}
      {activeTab === 'strategie' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Presenza Online</h3>
                </div>
                <HelpTooltip content="Strategie per migliorare la visibilità online dell'azienda" />
              </div>
              <ul className="space-y-2 text-sm text-blue-700 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Ottimizzazione SEO per il settore metalmeccanico</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Creazione portfolio lavori con galleria immagini</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Testimonianze clienti e case studies</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Google My Business ottimizzato per ricerche locali</span>
                </li>
              </ul>
              <button
                onClick={() => downloadStrategy('Presenza Online')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Scarica Strategia
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Email Marketing</h3>
                </div>
                <HelpTooltip content="Strategie di email marketing per il settore B2B" />
              </div>
              <ul className="space-y-2 text-sm text-green-700 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>Newsletter trimestrale con novità del settore</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>Sequenze email automatizzate per nuovi contatti</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>Offerte personalizzate per clienti esistenti</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>Follow-up automatici dopo preventivi</span>
                </li>
              </ul>
              <button
                onClick={() => downloadStrategy('Email Marketing')}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Scarica Strategia
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Social Media</h3>
                </div>
                <HelpTooltip content="Strategie social media per aziende metalmeccaniche" />
              </div>
              <ul className="space-y-2 text-sm text-purple-700 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-purple-500" />
                  <span>LinkedIn per networking B2B e lead generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-purple-500" />
                  <span>Instagram per mostrare progetti e lavorazioni</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-purple-500" />
                  <span>YouTube per video tutorial e presentazioni</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-purple-500" />
                  <span>Contenuti tecnici per posizionarsi come esperti</span>
                </li>
              </ul>
              <button
                onClick={() => downloadStrategy('Social Media')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Scarica Strategia
              </button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Differenziazione Competitiva</h3>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">Punti di Forza da Evidenziare</h4>
                  <ul className="space-y-2 text-sm text-amber-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-amber-600" />
                      <span>Esperienza e competenza tecnica nel settore</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-amber-600" />
                      <span>Macchinari all'avanguardia per lavorazioni precise</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-amber-600" />
                      <span>Flessibilità e capacità di personalizzazione</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-amber-600" />
                      <span>Tempi di consegna rapidi e affidabili</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-amber-600" />
                      <span>Certificazioni di qualità e sostenibilità</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Elementi da Evitare</h4>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-red-600" />
                      <span>Competere solo sul prezzo (margini ridotti)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-red-600" />
                      <span>Comunicazione generica senza focus tecnico</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-red-600" />
                      <span>Trascurare il servizio post-vendita</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Azioni Immediate</h3>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Azioni a Costo Zero</h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Ottimizzare Google My Business con foto e recensioni</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Creare profilo LinkedIn aziendale completo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Contattare clienti inattivi con offerte personalizzate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Implementare programma di referral con incentivi</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Investimenti Consigliati</h4>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                      <span>Campagne Google Ads mirate per settori specifici</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                      <span>Partecipazione a fiere di settore selezionate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                      <span>Software CRM per gestione lead e follow-up</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Acquisizione Clienti */}
      {activeTab === 'clienti' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Settori Target</h3>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Settori ad Alto Potenziale</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">Automotive</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">Edilizia</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">Arredamento</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">Agricoltura</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">Energia</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">Navale</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Approccio per Settore</h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li><span className="font-medium">Automotive:</span> Enfasi su precisione e certificazioni</li>
                    <li><span className="font-medium">Edilizia:</span> Focus su resistenza e tempi di consegna</li>
                    <li><span className="font-medium">Arredamento:</span> Qualità estetica e finiture</li>
                    <li><span className="font-medium">Agricoltura:</span> Durabilità e resistenza agli agenti atmosferici</li>
                    <li><span className="font-medium">Energia:</span> Conformità a standard specifici</li>
                    <li><span className="font-medium">Navale:</span> Resistenza alla corrosione</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Canali di Acquisizione</h3>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="text-sm font-medium text-indigo-800 mb-2">Online</h4>
                    <ul className="space-y-2 text-sm text-indigo-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-indigo-600" />
                        <span>Google Ads per ricerche specifiche</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-indigo-600" />
                        <span>LinkedIn per lead B2B qualificati</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-indigo-600" />
                        <span>Marketplace B2B di settore</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="text-sm font-medium text-indigo-800 mb-2">Offline</h4>
                    <ul className="space-y-2 text-sm text-indigo-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-indigo-600" />
                        <span>Fiere di settore (MECSPE, Made in Steel)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-indigo-600" />
                        <span>Networking associazioni di categoria</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-indigo-600" />
                        <span>Referral da clienti esistenti</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">Efficacia Canali (ROI)</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-amber-700">Referral Clienti</span>
                        <span className="text-xs font-medium text-amber-700">92%</span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-amber-700">LinkedIn B2B</span>
                        <span className="text-xs font-medium text-amber-700">78%</span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-amber-700">Fiere di Settore</span>
                        <span className="text-xs font-medium text-amber-700">65%</span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-amber-700">Google Ads</span>
                        <span className="text-xs font-medium text-amber-700">54%</span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '54%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Comunicazione Efficace</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-800 mb-2">Messaggio Chiave</h4>
                  <p className="text-sm text-purple-700">
                    "Alcafer & Gabifer: precisione e affidabilità nelle lavorazioni metalliche, dal progetto alla realizzazione."
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="p-2 bg-white rounded-lg">
                      <p className="text-xs font-medium text-purple-800">Valori da comunicare:</p>
                      <ul className="text-xs text-purple-700 list-disc list-inside">
                        <li>Precisione</li>
                        <li>Affidabilità</li>
                        <li>Esperienza</li>
                        <li>Flessibilità</li>
                      </ul>
                    </div>
                    <div className="p-2 bg-white rounded-lg">
                      <p className="text-xs font-medium text-purple-800">Tono di voce:</p>
                      <ul className="text-xs text-purple-700 list-disc list-inside">
                        <li>Professionale</li>
                        <li>Tecnico ma chiaro</li>
                        <li>Rassicurante</li>
                        <li>Orientato alle soluzioni</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-800 mb-2">Contenuti da Creare</h4>
                  <ul className="space-y-2 text-sm text-purple-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-purple-600" />
                      <span>Video dimostrativi dei processi di lavorazione</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-purple-600" />
                      <span>Case studies di progetti complessi realizzati</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-purple-600" />
                      <span>Guide tecniche sui materiali e le lavorazioni</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-purple-600" />
                      <span>Testimonianze video di clienti soddisfatti</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-800 mb-2">Canali di Comunicazione</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-purple-600" />
                        <h5 className="text-xs font-medium text-purple-800">Sito Web</h5>
                      </div>
                      <p className="text-xs text-purple-700">
                        Ottimizzato per conversioni con form preventivi e chat
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-4 w-4 text-purple-600" />
                        <h5 className="text-xs font-medium text-purple-800">LinkedIn</h5>
                      </div>
                      <p className="text-xs text-purple-700">
                        Post tecnici e networking B2B
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-purple-600" />
                        <h5 className="text-xs font-medium text-purple-800">Email</h5>
                      </div>
                      <p className="text-xs text-purple-700">
                        Newsletter e offerte personalizzate
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        <h5 className="text-xs font-medium text-purple-800">WhatsApp</h5>
                      </div>
                      <p className="text-xs text-purple-700">
                        Comunicazione diretta e preventivi rapidi
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-800 mb-2">Calendario Editoriale</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-white rounded-lg">
                      <p className="text-xs font-medium text-purple-800">Settimanale:</p>
                      <p className="text-xs text-purple-700">
                        1 post LinkedIn + 1 aggiornamento portfolio
                      </p>
                    </div>
                    <div className="p-2 bg-white rounded-lg">
                      <p className="text-xs font-medium text-purple-800">Mensile:</p>
                      <p className="text-xs text-purple-700">
                        1 case study + 1 video dimostrativo
                      </p>
                    </div>
                    <div className="p-2 bg-white rounded-lg">
                      <p className="text-xs font-medium text-purple-800">Trimestrale:</p>
                      <p className="text-xs text-purple-700">
                        Newsletter + offerta speciale stagionale
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Report Affidabilità */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Report Affidabilità</h3>
              </div>
              <HelpTooltip content="Genera report di affidabilità per clienti e fornitori utilizzando dati pubblici" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-800 mb-3">Genera Report</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-purple-700 mb-1">
                        Tipo di Report
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setReportType('cliente')}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                            reportType === 'cliente'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                          }`}
                        >
                          Cliente
                        </button>
                        <button
                          onClick={() => setReportType('fornitore')}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                            reportType === 'fornitore'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                          }`}
                        >
                          Fornitore
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="reportQuery" className="block text-xs font-medium text-purple-700 mb-1">
                        Nome o Partita IVA
                      </label>
                      <input
                        type="text"
                        id="reportQuery"
                        value={reportQuery}
                        onChange={(e) => setReportQuery(e.target.value)}
                        placeholder="Inserisci nome azienda o P.IVA"
                        className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <button
                      onClick={handleGenerateReport}
                      disabled={generatingReport}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-purple-400 flex items-center justify-center gap-2"
                    >
                      {generatingReport ? (
                        <>
                          <LoadingSpinner size="sm" color="text-white" />
                          Generazione in corso...
                        </>
                      ) : (
                        <>
                          <BarChart2 className="h-4 w-4" />
                          Genera Report
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Informazioni Incluse</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Dati anagrafici e fiscali</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Valutazione affidabilità creditizia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Storico pagamenti (se disponibile)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Eventuali protesti o pregiudizievoli</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Indicatori economico-finanziari</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Fonti Dati</h4>
                
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h5 className="text-xs font-medium text-gray-800">Registro Imprese</h5>
                    </div>
                    <p className="text-xs text-gray-600">
                      Dati ufficiali da Camera di Commercio
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h5 className="text-xs font-medium text-gray-800">Banca d'Italia</h5>
                    </div>
                    <p className="text-xs text-gray-600">
                      Centrale Rischi e dati finanziari
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <h5 className="text-xs font-medium text-gray-800">Agenzia delle Entrate</h5>
                    </div>
                    <p className="text-xs text-gray-600">
                      Verifica partita IVA e dati fiscali
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <h5 className="text-xs font-medium text-gray-800">Tribunali</h5>
                    </div>
                    <p className="text-xs text-gray-600">
                      Protesti, fallimenti e procedure concorsuali
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <h5 className="text-xs font-medium text-gray-800">Database Proprietari</h5>
                    </div>
                    <p className="text-xs text-gray-600">
                      Dati storici e analisi predittive
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <h5 className="text-xs font-medium text-yellow-800">Nota Importante</h5>
                  </div>
                  <p className="text-xs text-yellow-700">
                    I report sono generati utilizzando dati pubblici e hanno valore puramente informativo. Le decisioni commerciali dovrebbero basarsi anche su altre valutazioni.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Analisi Mercato Potenziale</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <h4 className="text-sm font-medium text-purple-800 mb-2">Lombardia</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-purple-600">Aziende Target</p>
                    <p className="text-xl font-bold text-purple-900">3,450+</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">Potenziale Annuo</p>
                    <p className="text-lg font-bold text-purple-900">€2.8M</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">Settori Principali</p>
                    <p className="text-sm text-purple-700">Automotive, Arredamento</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg">
                <h4 className="text-sm font-medium text-purple-800 mb-2">Piemonte</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-purple-600">Aziende Target</p>
                    <p className="text-xl font-bold text-purple-900">1,850+</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">Potenziale Annuo</p>
                    <p className="text-lg font-bold text-purple-900">€1.5M</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">Settori Principali</p>
                    <p className="text-sm text-purple-700">Automotive, Industriale</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg">
                <h4 className="text-sm font-medium text-purple-800 mb-2">Emilia Romagna</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-purple-600">Aziende Target</p>
                    <p className="text-xl font-bold text-purple-900">2,100+</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">Potenziale Annuo</p>
                    <p className="text-lg font-bold text-purple-900">€1.7M</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">Settori Principali</p>
                    <p className="text-sm text-purple-700">Packaging, Agricoltura</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-white rounded-lg">
              <h4 className="text-sm font-medium text-purple-800 mb-3">Strategie di Penetrazione Mercato</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-medium text-purple-700 mb-2">Approccio Geografico</h5>
                  <ul className="space-y-1 text-xs text-purple-600">
                    <li>• Priorità a clienti nel raggio di 100km (costi trasporto ridotti)</li>
                    <li>• Partecipazione a fiere locali per visibilità territoriale</li>
                    <li>• Collaborazioni con associazioni industriali regionali</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-purple-700 mb-2">Approccio Settoriale</h5>
                  <ul className="space-y-1 text-xs text-purple-600">
                    <li>• Focus iniziale su 2-3 settori con maggiore esperienza</li>
                    <li>• Creazione di materiale marketing specifico per settore</li>
                    <li>• Sviluppo referenze verticali per effetto domino</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Generator */}
      {activeTab === 'aiGenerator' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-gray-900">Generatore Strategie AI</h3>
              </div>
              <HelpTooltip content="Genera strategie di marketing personalizzate con l'intelligenza artificiale" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="text-sm font-medium text-amber-800 mb-3">Genera Strategia Personalizzata</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-amber-700 mb-1">
                        Template Predefiniti
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => setSelectedTemplate('email_marketing')}
                          className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                            selectedTemplate === 'email_marketing'
                              ? 'bg-amber-600 text-white'
                              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          Email Marketing
                        </button>
                        <button
                          onClick={() => setSelectedTemplate('social_media')}
                          className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                            selectedTemplate === 'social_media'
                              ? 'bg-amber-600 text-white'
                              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          Social Media
                        </button>
                        <button
                          onClick={() => setSelectedTemplate('seo_local')}
                          className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                            selectedTemplate === 'seo_local'
                              ? 'bg-amber-600 text-white'
                              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          SEO Locale
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="aiPrompt" className="block text-xs font-medium text-amber-700 mb-1">
                        Descrivi la tua esigenza
                      </label>
                      <textarea
                        id="aiPrompt"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Es. Voglio aumentare la visibilità online dell'azienda nel settore metalmeccanico..."
                        className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        rows={4}
                      />
                    </div>
                    
                    <button
                      onClick={handleGenerateAIStrategy}
                      disabled={generatingStrategy}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {generatingStrategy ? (
                        <>
                          <LoadingSpinner size="sm" color="text-white" />
                          Generazione in corso...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Genera Strategia
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Suggerimenti</h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Specifica il settore target (es. automotive, edilizia)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Indica il budget disponibile per il marketing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Menziona gli obiettivi specifici (es. +20% clienti)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 mt-0.5 text-blue-600" />
                      <span>Descrivi i punti di forza dell'azienda</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Cosa Include la Strategia</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-700">Analisi situazione</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-700">Obiettivi chiari</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-700">Azioni concrete</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-700">Timeline</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-700">Budget indicativo</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-700">KPI misurabili</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                {generatingStrategy ? (
                  <div className="h-full flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <LoadingSpinner size="lg" color="text-amber-600" />
                      <p className="mt-4 text-gray-600">Generazione strategia in corso...</p>
                      <p className="text-sm text-gray-500 mt-2">L'AI sta analizzando i dati e creando una strategia personalizzata</p>
                    </div>
                  </div>
                ) : aiResponse ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 h-full overflow-y-auto max-h-[600px]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-amber-600" />
                        <h4 className="font-medium text-gray-900">Strategia Generata</h4>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(aiResponse);
                            toast.success('Strategia copiata negli appunti');
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Copia negli appunti"
                        >
                          <PenTool className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([aiResponse], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'strategia-marketing.md';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            toast.success('Strategia scaricata come file');
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Scarica come file"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">{aiResponse}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                    <div className="text-center max-w-md">
                      <Sparkles className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Generatore AI di Strategie</h4>
                      <p className="text-gray-600 mb-4">
                        Utilizza l'intelligenza artificiale per creare strategie di marketing personalizzate per la tua azienda metalmeccanica.
                      </p>
                      <p className="text-sm text-gray-500">
                        Seleziona un template predefinito o descrivi le tue esigenze specifiche per ottenere una strategia su misura.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Marketing;