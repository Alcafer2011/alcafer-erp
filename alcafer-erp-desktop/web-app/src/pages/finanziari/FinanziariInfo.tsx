import React, { useEffect, useState } from 'react';
import { Calculator, TrendingUp, AlertTriangle, BookOpen, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePermissions } from '../../hooks/usePermissions';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import HelpTooltip from '../../components/common/HelpTooltip';

const FinanziariInfo: React.FC = () => {
  const [financialMetrics] = useState({
    roi: 0.15,
    roe: 0.18,
    roa: 0.12,
    currentRatio: 1.8,
    quickRatio: 1.2,
    debtToEquity: 0.4,
    grossMargin: 0.35,
    netMargin: 0.12,
    assetTurnover: 1.5,
    inventoryTurnover: 8.2
  });
  
  const [cashFlowData] = useState([
    { mese: 'Gen', operativo: 15000, investimenti: -5000, finanziario: 2000 },
    { mese: 'Feb', operativo: 18000, investimenti: -3000, finanziario: 1000 },
    { mese: 'Mar', operativo: 22000, investimenti: -8000, finanziario: 3000 },
    { mese: 'Apr', operativo: 25000, investimenti: -2000, finanziario: -1000 },
    { mese: 'Mag', operativo: 28000, investimenti: -4000, finanziario: 2000 },
    { mese: 'Giu', operativo: 32000, investimenti: -6000, finanziario: 1500 }
  ]);

  const [loading, setLoading] = useState(true);
  const permissions = usePermissions();

  useEffect(() => {
    // Simula il caricamento dei dati finanziari
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const getIndicatorColor = (value: number, type: 'ratio' | 'percentage' | 'turnover') => {
    switch (type) {
      case 'ratio':
        return value > 1.5 ? 'text-green-600' : value > 1 ? 'text-yellow-600' : 'text-red-600';
      case 'percentage':
        return value > 0.15 ? 'text-green-600' : value > 0.1 ? 'text-yellow-600' : 'text-red-600';
      case 'turnover':
        return value > 5 ? 'text-green-600' : value > 3 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getGasparottoSuggestion = (metric: string, value: number) => {
    const suggestions = {
      roi: value < 0.1 ? 'Aumenta l\'efficienza operativa e riduci i costi non produttivi' : 
           value < 0.15 ? 'Ottimizza il mix di prodotti e servizi per massimizzare i margini' :
           'Eccellente ROI, mantieni questa performance e considera espansioni strategiche',
      
      roe: value < 0.12 ? 'Migliora la gestione del capitale proprio attraverso reinvestimenti mirati' :
           value < 0.18 ? 'Bilancia crescita e distribuzione dividendi per ottimizzare il rendimento' :
           'ROE ottimale, continua con la strategia attuale di creazione di valore',
      
      currentRatio: value < 1.2 ? 'Migliora la liquidità riducendo i debiti a breve termine' :
                   value > 2.5 ? 'Considera investimenti produttivi per l\'eccesso di liquidità' :
                   'Liquidità equilibrata, mantieni questo livello per la stabilità operativa',
      
      debtToEquity: value > 0.6 ? 'Riduci l\'indebitamento per migliorare la solidità finanziaria' :
                   value < 0.2 ? 'Considera un leverage moderato per accelerare la crescita' :
                   'Struttura finanziaria equilibrata, ottima gestione del rischio'
    };
    
    return suggestions[metric as keyof typeof suggestions] || 'Monitora costantemente questo indicatore';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!permissions.canViewFinancials) {
    return (
      <div className="text-center py-12">
        <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accesso Limitato</h3>
        <p className="text-gray-500">Non hai i permessi per visualizzare questa sezione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Informazioni Finanziarie</h1>
          <p className="mt-2 text-gray-600">Analisi avanzata basata sui metodi di Mirko Gasparotto</p>
        </div>
      </div>

      {/* Indicatori Chiave di Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'ROI', value: financialMetrics.roi, format: 'percentage', type: 'percentage' as const, icon: Target },
          { name: 'ROE', value: financialMetrics.roe, format: 'percentage', type: 'percentage' as const, icon: TrendingUp },
          { name: 'Current Ratio', value: financialMetrics.currentRatio, format: 'ratio', type: 'ratio' as const, icon: Calculator },
          { name: 'Debt/Equity', value: financialMetrics.debtToEquity, format: 'ratio', type: 'ratio' as const, icon: AlertTriangle }
        ].map((indicator) => {
          const Icon = indicator.icon;
          const colorClass = getIndicatorColor(indicator.value, indicator.type);
          
          return (
            <motion.div
              key={indicator.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{indicator.name}</h3>
                  <HelpTooltip content={getGasparottoSuggestion(indicator.name.toLowerCase().replace('/', ''), indicator.value)} />
                </div>
                <Icon className={`h-6 w-6 ${colorClass}`} />
              </div>
              
              <div className={`text-3xl font-bold ${colorClass} mb-2`}>
                {indicator.format === 'percentage' 
                  ? `${(indicator.value * 100).toFixed(1)}%`
                  : indicator.value.toFixed(2)
                }
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  {getGasparottoSuggestion(indicator.name.toLowerCase().replace('/', ''), indicator.value)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analisi Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Analisi Cash Flow</h3>
            <HelpTooltip content="Flussi di cassa operativi, di investimento e finanziari secondo il metodo Gasparotto" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mese" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`€${value.toLocaleString('it-IT')}`, '']}
                labelFormatter={(label) => `Mese: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="operativo" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Operativo"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="investimenti" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Investimenti"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="finanziario" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Finanziario"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Indicatori di Efficienza */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Indicatori di Efficienza</h3>
            <HelpTooltip content="Metriche di efficienza operativa e gestionale" />
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'Margine Lordo', value: financialMetrics.grossMargin, target: 0.3 },
              { name: 'Margine Netto', value: financialMetrics.netMargin, target: 0.1 },
              { name: 'Rotazione Attivi', value: financialMetrics.assetTurnover, target: 1.2 },
              { name: 'Rotazione Magazzino', value: financialMetrics.inventoryTurnover, target: 6 }
            ].map((metric) => {
              const percentage = metric.name.includes('Margine') ? (metric.value * 100).toFixed(1) + '%' : metric.value.toFixed(1);
              const isGood = metric.value >= metric.target;
              
              return (
                <div key={metric.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                    <HelpTooltip content={`Target: ${metric.target}. ${isGood ? 'Performance eccellente' : 'Necessario miglioramento'}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isGood ? 'text-green-600' : 'text-yellow-600'}`}>
                      {percentage}
                    </span>
                    {isGood ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Metodologia Gasparotto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Metodologia Mirko Gasparotto</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Analisi della Redditività</h4>
            <p className="text-sm text-gray-600">
              Focus su ROI, ROE e margini operativi per valutare l'efficacia nella generazione di profitti
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Gestione della Liquidità</h4>
            <p className="text-sm text-gray-600">
              Monitoraggio dei flussi di cassa e degli indici di liquidità per garantire la stabilità finanziaria
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Ottimizzazione del Capitale</h4>
            <p className="text-sm text-gray-600">
              Bilanciamento tra crescita e sostenibilità attraverso una gestione ottimale della struttura finanziaria
            </p>
          </div>
        </div>
      </motion.div>

      {/* Alert e Raccomandazioni */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-yellow-600" />
          <h3 className="font-medium text-yellow-800">Raccomandazioni Strategiche</h3>
        </div>
        
        <div className="space-y-2 text-sm text-yellow-700">
          <p>• <strong>Priorità Alta:</strong> Migliorare il margine netto attraverso l'ottimizzazione dei costi operativi</p>
          <p>• <strong>Priorità Media:</strong> Aumentare la rotazione degli attivi per massimizzare l'efficienza del capitale</p>
          <p>• <strong>Monitoraggio:</strong> Mantenere sotto controllo il rapporto debito/patrimonio per la stabilità finanziaria</p>
        </div>
      </motion.div>
    </div>
  );
};

export default FinanziariInfo;
