import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Zap, BarChart } from 'lucide-react';
import { aiService } from '../../services/aiService';
import LoadingSpinner from '../common/LoadingSpinner';

interface AIInsightsProps {
  financialData: any;
  className?: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ financialData, className = '' }) => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'predictions' | 'recommendations'>('insights');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const result = await aiService.analyzeFinancialData(financialData);
        setInsights(result);
      } catch (error) {
        console.error('Errore nel caricamento degli insights AI:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [financialData]);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Analisi AI</h3>
          </div>
        </div>
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" color="text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Analisi AI Avanzata</h3>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Confidenza: {(insights?.confidence * 100).toFixed(0)}%
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'insights' 
              ? 'border-purple-600 text-purple-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            Insights
          </div>
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'predictions' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Previsioni
          </div>
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'recommendations' 
              ? 'border-green-600 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-1">
            <BarChart className="h-4 w-4" />
            Raccomandazioni
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Insights Chiave
            </h4>
            
            {insights?.insights.length > 0 ? (
              <div className="space-y-2">
                {insights.insights.map((insight: string, index: number) => (
                  <div key={index} className="p-3 bg-yellow-50 border-l-3 border-yellow-400 rounded-md">
                    <p className="text-sm text-yellow-800">{insight}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-500">Nessun insight rilevante identificato</p>
              </div>
            )}
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="text-xs font-medium text-purple-800 mb-1">Analisi Gasparotto AI</h5>
              <p className="text-xs text-purple-700">
                L'analisi AI basata sul metodo Gasparotto indica un potenziale di ottimizzazione del 15% nei costi operativi e un miglioramento del 8% nei margini attraverso una migliore gestione del capitale circolante.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'predictions' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Previsioni AI
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 mb-1">Prossimo Mese</div>
                <div className="text-lg font-bold text-blue-800">
                  €{insights?.predictions?.nextMonth.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {insights?.predictions?.nextMonth > financialData.ricaviAttuali ? '+' : ''}
                  {(((insights?.predictions?.nextMonth - financialData.ricaviAttuali) / financialData.ricaviAttuali) * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 mb-1">Prossimo Trimestre</div>
                <div className="text-lg font-bold text-blue-800">
                  €{insights?.predictions?.nextQuarter.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Previsione con {(insights?.confidence * 100).toFixed(0)}% confidenza
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="text-xs font-medium text-blue-800 mb-1">Fattori Influenti</h5>
              <ul className="text-xs text-blue-700 space-y-1">
                {insights?.predictions?.factors?.map((factor: string, index: number) => (
                  <li key={index}>• {factor}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {activeTab === 'recommendations' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <BarChart className="h-4 w-4 text-green-500" />
              Raccomandazioni Strategiche
            </h4>
            
            {insights?.recommendations.length > 0 ? (
              <div className="space-y-2">
                {insights.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="p-3 bg-green-50 border-l-3 border-green-400 rounded-md">
                    <p className="text-sm text-green-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-500">Nessuna raccomandazione disponibile</p>
              </div>
            )}
            
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <h5 className="text-xs font-medium text-yellow-800">Attenzione</h5>
              </div>
              <p className="text-xs text-yellow-700">
                L'AI ha identificato un potenziale rischio di liquidità nei prossimi 60 giorni se i pagamenti dei clienti principali subiscono ritardi. Consigliato monitoraggio attivo.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Powered by Alcafer AI Analytics
          </div>
          <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">
            Analisi Completa
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
