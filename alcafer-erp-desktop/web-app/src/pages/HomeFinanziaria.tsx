import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, TrendingDown, BarChart3, 
  AlertTriangle, Calculator, Target, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';

interface FinancialData {
  ebitda: number;
  indiceIndebitamento: number;
  puntoPareggio: number;
  ricaviMensili: Array<{ mese: string; valore: number }>;
  costiMensili: Array<{ mese: string; valore: number }>;
  margineOperativo: number;
  liquidita: number;
  crescitaMensile: number;
}

const HomeFinanziaria: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    ebitda: 0,
    indiceIndebitamento: 0,
    puntoPareggio: 0,
    ricaviMensili: [],
    costiMensili: [],
    margineOperativo: 0,
    liquidita: 0,
    crescitaMensile: 0,
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
    fetchAlerts();
  }, []);

  const fetchFinancialData = async () => {
    try {
      // Simula dati finanziari - in produzione questi verranno calcolati dai dati reali
      const mockData: FinancialData = {
        ebitda: 125000,
        indiceIndebitamento: 0.35,
        puntoPareggio: 85000,
        ricaviMensili: [
          { mese: 'Gen', valore: 45000 },
          { mese: 'Feb', valore: 52000 },
          { mese: 'Mar', valore: 48000 },
          { mese: 'Apr', valore: 61000 },
          { mese: 'Mag', valore: 58000 },
          { mese: 'Giu', valore: 67000 },
        ],
        costiMensili: [
          { mese: 'Gen', valore: 32000 },
          { mese: 'Feb', valore: 35000 },
          { mese: 'Mar', valore: 33000 },
          { mese: 'Apr', valore: 38000 },
          { mese: 'Mag', valore: 36000 },
          { mese: 'Giu', valore: 41000 },
        ],
        margineOperativo: 0.28,
        liquidita: 89000,
        crescitaMensile: 0.12,
      };

      setFinancialData(mockData);
    } catch (error) {
      console.error('Errore nel caricamento dei dati finanziari:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      // Recupera scadenze IVA e tasse
      const { data: scadenzeIva } = await supabase
        .from('tasse_iva')
        .select('*')
        .eq('pagato', false)
        .gte('data_scadenza', new Date().toISOString())
        .lte('data_scadenza', new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString());

      const alertsData = [
        ...(scadenzeIva || []).map(s => ({
          type: 'warning',
          title: `Scadenza IVA ${s.ditta.toUpperCase()}`,
          message: `€${s.iva_da_versare.toLocaleString('it-IT')} in scadenza il ${new Date(s.data_scadenza).toLocaleDateString('it-IT')}`,
          date: s.data_scadenza,
        })),
        // Aggiungi altri tipi di alert qui
      ];

      setAlerts(alertsData);
    } catch (error) {
      console.error('Errore nel caricamento degli alert:', error);
    }
  };

  const getIndicatorColor = (value: number, type: 'ebitda' | 'debt' | 'growth') => {
    switch (type) {
      case 'ebitda':
        return value > 100000 ? 'text-green-600' : value > 50000 ? 'text-yellow-600' : 'text-red-600';
      case 'debt':
        return value < 0.3 ? 'text-green-600' : value < 0.5 ? 'text-yellow-600' : 'text-red-600';
      case 'growth':
        return value > 0.1 ? 'text-green-600' : value > 0.05 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getIndicatorIcon = (value: number, type: 'ebitda' | 'debt' | 'growth') => {
    const isPositive = type === 'debt' ? value < 0.3 : value > (type === 'growth' ? 0.05 : 50000);
    return isPositive ? TrendingUp : TrendingDown;
  };

  const getSuggestion = (type: 'ebitda' | 'debt' | 'growth', value: number) => {
    switch (type) {
      case 'ebitda':
        if (value < 50000) return 'Considera di ridurre i costi operativi e aumentare i margini sui progetti';
        if (value < 100000) return 'Buon andamento, cerca di ottimizzare ulteriormente i processi produttivi';
        return 'Eccellente performance, mantieni questo trend e considera investimenti per la crescita';
      case 'debt':
        if (value > 0.5) return 'Livello di indebitamento alto, priorità al rimborso dei debiti';
        if (value > 0.3) return 'Indebitamento nella norma, monitora attentamente i flussi di cassa';
        return 'Ottima situazione finanziaria, puoi considerare investimenti strategici';
      case 'growth':
        if (value < 0) return 'Crescita negativa, rivedi la strategia commerciale e i costi';
        if (value < 0.05) return 'Crescita lenta, cerca nuove opportunità di mercato';
        return 'Ottima crescita, continua con questa strategia';
      default:
        return '';
    }
  };

  const pieData = [
    { name: 'Ricavi', value: financialData.ricaviMensili.reduce((sum, item) => sum + item.valore, 0), color: '#10B981' },
    { name: 'Costi', value: financialData.costiMensili.reduce((sum, item) => sum + item.valore, 0), color: '#EF4444' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Home Finanziaria</h1>
        <p className="mt-2 text-gray-600">Analisi finanziaria avanzata e indicatori di performance</p>
      </div>

      {/* Alert e notifiche */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Attenzione - Scadenze imminenti</h3>
          </div>
          <div className="space-y-1">
            {alerts.map((alert, index) => (
              <p key={index} className="text-sm text-yellow-700">{alert.message}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Indicatori principali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'EBITDA',
            value: financialData.ebitda,
            format: 'currency',
            type: 'ebitda' as const,
            icon: TrendingUp,
            help: 'Earnings Before Interest, Taxes, Depreciation and Amortization - Misura la redditività operativa'
          },
          {
            title: 'Indice di Indebitamento',
            value: financialData.indiceIndebitamento,
            format: 'percentage',
            type: 'debt' as const,
            icon: BarChart3,
            help: 'Rapporto tra debiti totali e patrimonio netto - Indica il livello di indebitamento'
          },
          {
            title: 'Crescita Mensile',
            value: financialData.crescitaMensile,
            format: 'percentage',
            type: 'growth' as const,
            icon: Target,
            help: 'Tasso di crescita medio mensile dei ricavi'
          }
        ].map((indicator, index) => {
          const IconComponent = getIndicatorIcon(indicator.value, indicator.type);
          const colorClass = getIndicatorColor(indicator.value, indicator.type);
          const suggestion = getSuggestion(indicator.type, indicator.value);

          return (
            <motion.div
              key={indicator.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{indicator.title}</h3>
                  <HelpTooltip content={indicator.help} />
                </div>
                <IconComponent className={`h-6 w-6 ${colorClass}`} />
              </div>
              
              <div className={`text-3xl font-bold ${colorClass} mb-2`}>
                {indicator.format === 'currency' 
                  ? `€${indicator.value.toLocaleString('it-IT')}`
                  : `${(indicator.value * 100).toFixed(1)}%`
                }
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">{suggestion}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Grafici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico andamento ricavi/costi */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Andamento Ricavi vs Costi</h3>
            <HelpTooltip content="Confronto mensile tra ricavi e costi per valutare la redditività" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={financialData.ricaviMensili.map((item, index) => ({
              ...item,
              costi: financialData.costiMensili[index]?.valore || 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mese" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`€${value.toLocaleString('it-IT')}`, '']}
                labelFormatter={(label) => `Mese: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="valore" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Ricavi"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="costi" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Costi"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Grafico a torta ricavi/costi */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Distribuzione Ricavi/Costi</h3>
            <HelpTooltip content="Proporzione tra ricavi totali e costi totali del periodo" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`€${value.toLocaleString('it-IT')}`, '']}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
          
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Metriche aggiuntive */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Punto di Pareggio',
            value: `€${financialData.puntoPareggio.toLocaleString('it-IT')}`,
            icon: Target,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            help: 'Fatturato minimo necessario per coprire tutti i costi fissi e variabili'
          },
          {
            title: 'Margine Operativo',
            value: `${(financialData.margineOperativo * 100).toFixed(1)}%`,
            icon: Calculator,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            help: 'Percentuale di ricavi che rimane dopo aver coperto i costi operativi'
          },
          {
            title: 'Liquidità',
            value: `€${financialData.liquidita.toLocaleString('it-IT')}`,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            help: 'Disponibilità liquide immediate per far fronte agli impegni'
          },
          {
            title: 'Performance',
            value: financialData.ebitda > 100000 ? 'Eccellente' : financialData.ebitda > 50000 ? 'Buona' : 'Da migliorare',
            icon: Zap,
            color: financialData.ebitda > 100000 ? 'text-green-600' : financialData.ebitda > 50000 ? 'text-yellow-600' : 'text-red-600',
            bgColor: financialData.ebitda > 100000 ? 'bg-green-50' : financialData.ebitda > 50000 ? 'bg-yellow-50' : 'bg-red-50',
            help: 'Valutazione complessiva delle performance aziendali basata sui KPI principali'
          }
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`${metric.bgColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">{metric.title}</h4>
                <div className="flex items-center gap-1">
                  <HelpTooltip content={metric.help} />
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
              <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeFinanziaria;
