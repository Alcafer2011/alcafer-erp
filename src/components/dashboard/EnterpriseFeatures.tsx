import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Cloud, Zap, Shield, BarChart3, 
  Webhook, MessageSquare, Database, 
  Settings, Play, Pause, CheckCircle,
  AlertTriangle, ExternalLink
} from 'lucide-react';
import { freeAIService } from '../../services/freeAIService';
import { freeAnalyticsService } from '../../services/freeAnalyticsService';
import { freeNotificationService } from '../../services/freeNotificationService';
import { freeBackupService } from '../../services/freeBackupService';
import { freeIntegrationsService } from '../../services/freeIntegrationsService';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const EnterpriseFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'analytics' | 'notifications' | 'backup' | 'integrations'>('ai');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [integrationStatus, setIntegrationStatus] = useState<any>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [analytics, integrations] = await Promise.all([
        freeAnalyticsService.getDashboardMetrics(),
        freeIntegrationsService.getIntegrationStatus()
      ]);
      
      setAnalyticsData(analytics);
      setIntegrationStatus(integrations);
    } catch (error) {
      console.error('Errore caricamento dati:', error);
    }
  };

  const handleAIQuery = async (query: string) => {
    setLoading(true);
    try {
      const response = await freeAIService.chatWithGemini(query, {
        userRole: 'admin',
        context: 'dashboard'
      });
      setAiResponse(response);
    } catch (error) {
      const fallbackResponse = await freeAIService.getLocalAIResponse(query, {});
      setAiResponse(fallbackResponse);
    } finally {
      setLoading(false);
    }
  };

  const testNotifications = async () => {
    setLoading(true);
    try {
      const results = await freeNotificationService.testAllChannels();
      const successCount = Object.values(results).filter(Boolean).length;
      toast.success(`${successCount}/4 canali di notifica funzionanti`);
    } catch (error) {
      toast.error('Errore test notifiche');
    } finally {
      setLoading(false);
    }
  };

  const performBackup = async () => {
    setLoading(true);
    try {
      await freeBackupService.performAutomaticBackup();
      toast.success('Backup completato con successo!');
    } catch (error) {
      toast.error('Errore durante il backup');
    } finally {
      setLoading(false);
    }
  };

  const testIntegrations = async () => {
    setLoading(true);
    try {
      const results = await freeIntegrationsService.testAllIntegrations();
      const successCount = Object.values(results).filter(Boolean).length;
      toast.success(`${successCount}/5 integrazioni funzionanti`);
    } catch (error) {
      toast.error('Errore test integrazioni');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'ai', label: 'AI Assistant', icon: Brain, color: 'purple' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'blue' },
    { id: 'notifications', label: 'Notifiche', icon: MessageSquare, color: 'green' },
    { id: 'backup', label: 'Backup', icon: Database, color: 'orange' },
    { id: 'integrations', label: 'Integrazioni', icon: Webhook, color: 'red' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">🚀 Funzionalità Enterprise</h3>
          <p className="text-gray-600">Servizi avanzati completamente gratuiti</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>100% Gratuito</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? `bg-${tab.color}-100 text-${tab.color}-700 border-2 border-${tab.color}-200`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'ai' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-6 w-6 text-purple-600" />
                <h4 className="text-lg font-semibold text-purple-900">AI Assistant Avanzato</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleAIQuery('Analizza i dati finanziari e dammi consigli')}
                  className="p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors text-left"
                  disabled={loading}
                >
                  <h5 className="font-medium text-gray-900 mb-2">📊 Analisi Finanziaria</h5>
                  <p className="text-sm text-gray-600">Ottieni insights sui dati aziendali</p>
                </button>
                
                <button
                  onClick={() => handleAIQuery('Prevedi i ricavi del prossimo trimestre')}
                  className="p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors text-left"
                  disabled={loading}
                >
                  <h5 className="font-medium text-gray-900 mb-2">🔮 Previsioni</h5>
                  <p className="text-sm text-gray-600">Previsioni di mercato e crescita</p>
                </button>
                
                <button
                  onClick={() => handleAIQuery('Suggerisci ottimizzazioni per i costi')}
                  className="p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors text-left"
                  disabled={loading}
                >
                  <h5 className="font-medium text-gray-900 mb-2">💡 Ottimizzazioni</h5>
                  <p className="text-sm text-gray-600">Consigli per ridurre i costi</p>
                </button>
                
                <button
                  onClick={() => handleAIQuery('Analizza i prezzi dei materiali')}
                  className="p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors text-left"
                  disabled={loading}
                >
                  <h5 className="font-medium text-gray-900 mb-2">🏗️ Materiali</h5>
                  <p className="text-sm text-gray-600">Analisi prezzi e trend</p>
                </button>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" color="text-purple-600" />
                </div>
              )}

              {aiResponse && !loading && (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h5 className="font-medium text-gray-900 mb-2">🤖 Risposta AI:</h5>
                  <p className="text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-2">🆓 Google Gemini</h5>
                <p className="text-sm text-blue-700">15 richieste/minuto gratuite</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h5 className="font-medium text-green-900 mb-2">🏠 Ollama Locale</h5>
                <p className="text-sm text-green-700">Completamente gratuito</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h5 className="font-medium text-orange-900 mb-2">🤗 Hugging Face</h5>
                <p className="text-sm text-orange-700">API gratuita disponibile</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h4 className="text-lg font-semibold text-blue-900">Analytics Avanzato</h4>
              </div>

              {analyticsData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="text-sm font-medium text-gray-600">Visualizzazioni</h5>
                    <p className="text-2xl font-bold text-blue-600">{analyticsData.pageViews}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="text-sm font-medium text-gray-600">Durata Sessione</h5>
                    <p className="text-2xl font-bold text-blue-600">{analyticsData.sessionDuration}s</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="text-sm font-medium text-gray-600">Bounce Rate</h5>
                    <p className="text-2xl font-bold text-blue-600">{analyticsData.bounceRate}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="text-sm font-medium text-gray-600">Preventivi Oggi</h5>
                    <p className="text-2xl font-bold text-blue-600">{analyticsData.businessMetrics?.preventiviCreati || 0}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">📊 Google Analytics 4</h5>
                  <p className="text-sm text-blue-700">Tracking completo gratuito</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">🔒 Plausible</h5>
                  <p className="text-sm text-blue-700">Privacy-focused analytics</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">📈 Umami</h5>
                  <p className="text-sm text-blue-700">Self-hosted gratuito</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                  <h4 className="text-lg font-semibold text-green-900">Sistema Notifiche</h4>
                </div>
                <button
                  onClick={testNotifications}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Test Notifiche'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h5 className="font-medium text-green-900">📧 EmailJS</h5>
                  </div>
                  <p className="text-sm text-green-700">200 email gratuite/mese</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h5 className="font-medium text-green-900">🤖 Telegram Bot</h5>
                  </div>
                  <p className="text-sm text-green-700">Illimitato gratuito</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h5 className="font-medium text-green-900">💬 Discord</h5>
                  </div>
                  <p className="text-sm text-green-700">Webhook gratuiti</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h5 className="font-medium text-green-900">🌐 Browser</h5>
                  </div>
                  <p className="text-sm text-green-700">Notifiche native</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h5 className="font-medium text-green-900 mb-3">🔔 Notifiche Automatiche Attive:</h5>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• 🚨 Promemoria scadenze fiscali (15 giorni prima)</li>
                  <li>• 📊 Aggiornamenti prezzi materiali (settimanali)</li>
                  <li>• 💾 Conferme backup automatici (giornalieri)</li>
                  <li>• 📋 Nuovi preventivi e lavori completati</li>
                  <li>• ⚠️ Alert sistema e errori critici</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'backup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-orange-600" />
                  <h4 className="text-lg font-semibold text-orange-900">Sistema Backup</h4>
                </div>
                <button
                  onClick={performBackup}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Backup Ora'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Cloud className="h-5 w-5 text-orange-600" />
                    <h5 className="font-medium text-orange-900">☁️ Multi-Cloud</h5>
                  </div>
                  <p className="text-sm text-orange-700">GitHub + Google Drive + Dropbox</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    <h5 className="font-medium text-orange-900">🔒 Sicurezza</h5>
                  </div>
                  <p className="text-sm text-orange-700">Checksum e verifica integrità</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-orange-200 text-center">
                  <h5 className="font-medium text-orange-900 mb-2">🗂️ GitHub</h5>
                  <p className="text-sm text-orange-700">Repository privati gratuiti</p>
                  <div className="mt-2">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-green-600 ml-1">Attivo</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-orange-200 text-center">
                  <h5 className="font-medium text-orange-900 mb-2">☁️ Google Drive</h5>
                  <p className="text-sm text-orange-700">15GB gratuiti</p>
                  <div className="mt-2">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-green-600 ml-1">Attivo</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-orange-200 text-center">
                  <h5 className="font-medium text-orange-900 mb-2">📦 Dropbox</h5>
                  <p className="text-sm text-orange-700">2GB gratuiti</p>
                  <div className="mt-2">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-green-600 ml-1">Attivo</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h5 className="font-medium text-orange-900 mb-3">📅 Programma Backup Automatici:</h5>
                <ul className="space-y-2 text-sm text-orange-700">
                  <li>• 🕐 Backup completo ogni giorno alle 02:00</li>
                  <li>• 📊 Backup incrementale ogni 6 ore</li>
                  <li>• 🔄 Rotazione automatica (mantieni 30 giorni)</li>
                  <li>• 🔔 Notifiche di successo/errore</li>
                  <li>• ✅ Verifica integrità automatica</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'integrations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Webhook className="h-6 w-6 text-red-600" />
                  <h4 className="text-lg font-semibold text-red-900">Integrazioni</h4>
                </div>
                <button
                  onClick={testIntegrations}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Test Integrazioni'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(integrationStatus).map(([name, enabled]) => (
                  <div key={name} className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <h5 className="font-medium text-red-900 capitalize">{name.replace('_', ' ')}</h5>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {enabled ? 'Attivo' : 'Inattivo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h5 className="font-medium text-red-900 mb-3">🔗 Automazioni Disponibili:</h5>
                  <ul className="space-y-1 text-sm text-red-700">
                    <li>• Zapier (100 task/mese gratuiti)</li>
                    <li>• IFTTT (3 applet gratuiti)</li>
                    <li>• Google Sheets sync</li>
                    <li>• Slack notifications</li>
                    <li>• Microsoft Teams</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h5 className="font-medium text-red-900 mb-3">⚡ Eventi Automatici:</h5>
                  <ul className="space-y-1 text-sm text-red-700">
                    <li>• Nuovo preventivo creato</li>
                    <li>• Lavoro completato</li>
                    <li>• Cliente aggiunto</li>
                    <li>• Aggiornamento prezzi</li>
                    <li>• Promemoria fiscali</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-red-200">
                <h5 className="font-medium text-red-900 mb-3">🌐 Collegamenti Esterni:</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <a
                    href="https://zapier.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Zapier</span>
                  </a>
                  <a
                    href="https://ifttt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">IFTTT</span>
                  </a>
                  <a
                    href="https://sheets.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Google Sheets</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseFeatures;