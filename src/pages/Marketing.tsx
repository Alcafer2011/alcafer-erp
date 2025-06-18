import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Target, BarChart2, Share2, 
  Award, Globe, Mail, MessageSquare, Zap, Download,
  Smartphone, Briefcase, CheckCircle, AlertTriangle,
  Sparkles, Send, RefreshCw, FileText, Loader
} from 'lucide-react';
import { motion } from 'framer-motion';
import HelpTooltip from '../components/common/HelpTooltip';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Marketing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'strategie' | 'clienti' | 'report'>('strategie');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportType, setReportType] = useState<'cliente' | 'fornitore' | null>(null);
  const [reportQuery, setReportQuery] = useState('');
  
  // AI Strategy Generator
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [strategyType, setStrategyType] = useState<'email' | 'social' | 'seo' | 'custom'>('email');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedStrategy, setGeneratedStrategy] = useState<string | null>(null);

  // Strategie predefinite
  const strategyTemplates = {
    email: `# Strategia Email Marketing per Alcafer & Gabifer

## Obiettivi
- Aumentare la visibilità del brand
- Generare nuovi lead qualificati
- Mantenere i clienti esistenti informati

## Piano d'Azione
1. **Creazione Lista Contatti**
   - Segmentare i contatti per settore (automotive, edilizia, ecc.)
   - Implementare form di iscrizione sul sito web
   - Importare contatti da fiere e eventi di settore

2. **Contenuti Email**
   - Newsletter mensile con novità del settore
   - Case study di progetti completati
   - Offerte speciali e promozioni stagionali
   - Aggiornamenti su nuovi macchinari e capacità produttive

3. **Automazioni**
   - Sequenza di benvenuto per nuovi iscritti
   - Follow-up automatici dopo preventivi
   - Promemoria per manutenzioni periodiche
   - Email di auguri per festività e anniversari

4. **Metriche da Monitorare**
   - Tasso di apertura (target: >25%)
   - Tasso di click (target: >3%)
   - Tasso di conversione (target: >1%)
   - Tasso di disiscrizione (target: <0.5%)

## Calendario Editoriale
- **Gennaio**: Novità e trend del settore per il nuovo anno
- **Aprile**: Promozione primaverile per progetti esterni
- **Settembre**: Preparazione per progetti invernali
- **Dicembre**: Auguri e retrospettiva dell'anno

## Strumenti Consigliati
- Brevo (ex Sendinblue) - Piano gratuito fino a 300 email/giorno
- MailerLite - Piano gratuito fino a 1.000 contatti
- Integrazione con CRM aziendale per tracciamento lead

## Budget Stimato
- €0/mese con strumenti gratuiti
- €15-30/mese per funzionalità avanzate (opzionale)`,

    social: `# Strategia Social Media per Alcafer & Gabifer

## Piattaforme Prioritarie
1. **LinkedIn** - Focus B2B e networking professionale
2. **Instagram** - Showcase visivo dei progetti
3. **YouTube** - Video tutorial e presentazioni tecniche

## Strategia per Piattaforma

### LinkedIn
- **Contenuti**: Articoli tecnici, case study, aggiornamenti aziendali
- **Frequenza**: 2-3 post settimanali
- **Obiettivo**: Generare lead B2B e rafforzare la reputazione professionale
- **Azioni specifiche**:
  - Ottimizzare la pagina aziendale con parole chiave di settore
  - Coinvolgere i dipendenti nella condivisione dei contenuti
  - Partecipare attivamente a gruppi di settore

### Instagram
- **Contenuti**: Foto di progetti, time-lapse di lavorazioni, "dietro le quinte"
- **Frequenza**: 3-4 post settimanali + stories quotidiane
- **Obiettivo**: Mostrare la qualità delle lavorazioni e l'expertise tecnica
- **Azioni specifiche**:
  - Utilizzare hashtag di settore (#MetalWorking, #SteelFabrication)
  - Creare highlight per categorie di progetti
  - Condividere testimonianze visive dei clienti

### YouTube
- **Contenuti**: Video tutorial, presentazioni di macchinari, case study
- **Frequenza**: 1-2 video mensili
- **Obiettivo**: Posizionarsi come esperti del settore
- **Azioni specifiche**:
  - Creare serie tematiche (es. "Tecniche di Saldatura", "Materiali Innovativi")
  - Ottimizzare i video per SEO con descrizioni dettagliate
  - Promuovere i video sulle altre piattaforme social

## Calendario Contenuti
- **Lunedì**: Post tecnico su LinkedIn
- **Mercoledì**: Showcase progetto su Instagram
- **Venerdì**: Condivisione novità di settore su tutte le piattaforme

## Metriche da Monitorare
- Crescita follower (target: +5%/mese)
- Engagement rate (target: >2%)
- Traffico al sito web dai social (target: +10%/mese)
- Lead generati (target: 5-10/mese)

## Strumenti Consigliati
- Canva - Per la creazione di grafiche (piano gratuito)
- Later - Per la programmazione dei post (piano gratuito)
- Google Analytics - Per il monitoraggio del traffico

## Budget Stimato
- €0/mese con strumenti gratuiti
- €50-100/mese per sponsorizzazioni mirate (opzionale)`,

    seo: `# Strategia SEO Locale per Alcafer & Gabifer

## Obiettivi
- Migliorare la visibilità nelle ricerche locali
- Aumentare il traffico organico al sito web
- Generare lead qualificati dalla zona di Pavia e provincia

## Analisi Keyword
### Keyword Primarie
- lavorazione metalli pavia
- carpenteria metallica lombardia
- costruzioni in ferro pavia
- lavorazione acciaio inox pavia

### Keyword Secondarie
- cancelli in ferro battuto
- strutture metalliche su misura
- saldatura acciaio certificata
- taglio laser metalli lombardia

## Ottimizzazioni On-Page
1. **Pagine da Ottimizzare**
   - Home page: focus su "lavorazione metalli pavia"
   - Servizi: pagine dedicate per ogni tipo di lavorazione
   - Portfolio: showcase progetti con descrizioni ottimizzate
   - Contatti: CTA chiare e form di richiesta preventivo

2. **Elementi da Ottimizzare**
   - Meta title e description con keyword primarie
   - Heading (H1, H2, H3) con keyword rilevanti
   - URL strutturati e descrittivi
   - Alt text per le immagini
   - Schema markup per attività locale

## Ottimizzazioni Tecniche
- Migliorare velocità di caricamento (target: <3s)
- Ottimizzare per mobile (design responsive)
- Implementare SSL (https)
- Creare sitemap XML
- Risolvere eventuali errori di crawling

## Strategia di Contenuti
- Blog aziendale con articoli su:
  - Guide tecniche sui materiali
  - Case study di progetti realizzati
  - FAQ sulle lavorazioni metalliche
  - Novità del settore

## Google My Business
- Completare e verificare il profilo
- Aggiungere foto di alta qualità dei progetti e dell'officina
- Sollecitare recensioni positive dai clienti
- Pubblicare post regolari con novità e offerte

## Link Building Locale
- Iscrizione a directory locali di qualità
- Collaborazioni con associazioni di categoria
- Partecipazione a eventi locali con copertura online
- Testimonianze e menzioni da clienti locali

## Monitoraggio e KPI
- Posizionamento per keyword target (controllo mensile)
- Traffico organico (target: +20% in 6 mesi)
- Tasso di conversione da organico (target: >2%)
- Visibilità locale su Google Maps

## Strumenti Consigliati
- Google Search Console (gratuito)
- Google Analytics (gratuito)
- Ubersuggest (piano gratuito)
- PageSpeed Insights (gratuito)

## Timeline
- Mese 1-2: Audit e ottimizzazioni tecniche
- Mese 2-3: Ottimizzazioni on-page e contenuti
- Mese 3-6: Link building e ottimizzazione GMB
- Mese 6+: Monitoraggio e ottimizzazione continua`
  };

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
  
  const handleGenerateStrategy = () => {
    if (strategyType === 'custom' && !customPrompt.trim()) {
      toast.error('Inserisci una descrizione per la strategia personalizzata');
      return;
    }
    
    setGeneratingStrategy(true);
    
    // Simula generazione con AI
    setTimeout(() => {
      let strategy = '';
      
      if (strategyType === 'custom') {
        // Genera una strategia personalizzata basata sul prompt
        strategy = `# Strategia Personalizzata: ${customPrompt}

## Obiettivi
- Aumentare la visibilità del brand Alcafer & Gabifer
- Generare nuovi lead qualificati nel settore metalmeccanico
- Migliorare la conversione dei contatti in clienti

## Analisi della Situazione Attuale
- Presenza online limitata ma con potenziale di crescita
- Expertise tecnica elevata da comunicare efficacemente
- Concorrenza locale presente ma non dominante

## Piano d'Azione
1. **Fase 1: Analisi e Preparazione** (1-2 mesi)
   - Analisi dettagliata del mercato target
   - Definizione del posizionamento distintivo
   - Preparazione degli asset di comunicazione

2. **Fase 2: Implementazione** (2-4 mesi)
   - Lancio delle iniziative di marketing selezionate
   - Monitoraggio iniziale e aggiustamenti
   - Formazione del personale coinvolto

3. **Fase 3: Ottimizzazione** (4-6 mesi)
   - Analisi dei risultati iniziali
   - Ottimizzazione delle azioni più efficaci
   - Abbandono delle iniziative meno performanti

## Canali e Tattiche
- **Online**: ${customPrompt.includes('online') || customPrompt.includes('digitale') ? 'Priorità alta' : 'Priorità media'}
- **Offline**: ${customPrompt.includes('offline') || customPrompt.includes('tradizionale') ? 'Priorità alta' : 'Priorità media'}
- **Networking**: ${customPrompt.includes('networking') || customPrompt.includes('relazioni') ? 'Priorità alta' : 'Priorità bassa'}

## Budget Consigliato
- Investimento iniziale: €1.000-2.000
- Costo mensile: €300-500
- ROI previsto: 3-5x nell'arco di 12 mesi

## Metriche di Successo
- Nuovi contatti qualificati: +20% in 6 mesi
- Tasso di conversione: miglioramento del 15%
- Valore medio commesse: +10%

## Prossimi Passi
1. Approvazione della strategia
2. Allocazione del budget
3. Definizione del calendario esecutivo
4. Assegnazione delle responsabilità
5. Implementazione e monitoraggio`;
      } else {
        // Usa uno dei template predefiniti
        strategy = strategyTemplates[strategyType];
      }
      
      setGeneratedStrategy(strategy);
      setGeneratingStrategy(false);
      toast.success('Strategia generata con successo!');
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
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('strategie')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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
      </div>

      {/* Strategie Marketing */}
      {activeTab === 'strategie' && (
        <div className="space-y-6">
          {/* AI Strategy Generator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Generatore Strategie AI</h3>
              </div>
              <HelpTooltip content="Genera strategie di marketing personalizzate con l'intelligenza artificiale" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo di Strategia
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setStrategyType('email')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        strategyType === 'email'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                      Email Marketing
                    </button>
                    <button
                      onClick={() => setStrategyType('social')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        strategyType === 'social'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Share2 className="h-4 w-4" />
                      Social Media
                    </button>
                    <button
                      onClick={() => setStrategyType('seo')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        strategyType === 'seo'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Globe className="h-4 w-4" />
                      SEO Locale
                    </button>
                    <button
                      onClick={() => setStrategyType('custom')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        strategyType === 'custom'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Zap className="h-4 w-4" />
                      Personalizzata
                    </button>
                  </div>
                </div>
                
                {strategyType === 'custom' && (
                  <div>
                    <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 mb-2">
                      Descrivi la Strategia Desiderata
                    </label>
                    <textarea
                      id="customPrompt"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Es. Voglio una strategia per aumentare la visibilità online nel settore metalmeccanico, con focus su clienti B2B in Lombardia..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={5}
                    />
                  </div>
                )}
                
                {strategyType !== 'custom' && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-800 mb-2">
                      {strategyType === 'email' && 'Strategia Email Marketing'}
                      {strategyType === 'social' && 'Strategia Social Media'}
                      {strategyType === 'seo' && 'Strategia SEO Locale'}
                    </h4>
                    <p className="text-sm text-purple-700">
                      {strategyType === 'email' && 'Genera una strategia completa di email marketing per acquisire e fidelizzare clienti nel settore metalmeccanico.'}
                      {strategyType === 'social' && 'Crea una strategia social media efficace per mostrare i progetti e l\'expertise tecnica dell\'azienda.'}
                      {strategyType === 'seo' && 'Ottimizza la presenza online locale per essere trovati dai clienti nella zona di Pavia e provincia.'}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={handleGenerateStrategy}
                  disabled={generatingStrategy || (strategyType === 'custom' && !customPrompt.trim())}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:bg-purple-300 flex items-center justify-center gap-2"
                >
                  {generatingStrategy ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Generazione in corso...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Genera Strategia con AI
                    </>
                  )}
                </button>
              </div>
              
              <div>
                {generatedStrategy ? (
                  <div className="bg-white border border-purple-200 rounded-lg p-4 h-full overflow-y-auto max-h-[500px]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-gray-900">Strategia Generata</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setGeneratedStrategy(null)}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([generatedStrategy], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `strategia-${strategyType}-alcafer.md`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            toast.success('Strategia scaricata come file Markdown');
                          }}
                          className="text-xs text-purple-600 hover:text-purple-800"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono bg-gray-50 p-4 rounded-lg">
                        {generatedStrategy}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 h-full flex flex-col items-center justify-center text-center">
                    <Sparkles className="h-12 w-12 text-purple-300 mb-4" />
                    <h4 className="text-lg font-medium text-gray-700 mb-2">Generatore Strategie AI</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Seleziona un tipo di strategia e clicca su "Genera Strategia" per creare un piano di marketing personalizzato con l'intelligenza artificiale.
                    </p>
                    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                      <div className="bg-white p-2 rounded-lg border border-gray-200">
                        <p className="text-xs font-medium text-gray-700">Completamente gratuito</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-200">
                        <p className="text-xs font-medium text-gray-700">Pronto all'uso</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-200">
                        <p className="text-xs font-medium text-gray-700">Personalizzabile</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-200">
                        <p className="text-xs font-medium text-gray-700">Esportabile</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

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
    </div>
  );
};

export default Marketing;