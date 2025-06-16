import React, { useEffect, useState } from 'react';
import { 
  Users, FileText, TrendingUp, Briefcase, 
  AlertTriangle, CheckCircle, Clock, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import AIInsights from '../components/dashboard/AIInsights';
import AIAssistant from '../components/dashboard/AIAssistant';
import EnterpriseFeatures from '../components/dashboard/EnterpriseFeatures';
import { freeAnalyticsService } from '../services/freeAnalyticsService';
import { cronJobService } from '../services/cronJobService';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalClienti: 0,
    totalPreventivi: 0,
    preventiviAccettati: 0,
    lavoriInCorso: 0,
    lavoriCompletati: 0,
    importoTotalePreventivi: 0,
    importoTotaleLavori: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState({
    ricaviAttuali: 65000,
    costiMensili: 45000,
    margineOperativo: 0.28,
    liquidita: 89000,
    crescitaMensile: 0.12,
    dataPoints: 18,
    dataQuality: 0.85,
    consistency: 0.78
  });
  const permissions = usePermissions();

  useEffect(() => {
    fetchDashboardData();
    initializeEnterpriseServices();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Statistiche clienti
      const { count: clientiCount } = await supabase
        .from('clienti')
        .select('*', { count: 'exact', head: true });

      // Statistiche preventivi
      const { data: preventivi, count: preventiviCount } = await supabase
        .from('preventivi')
        .select('*', { count: 'exact' });

      const preventiviAccettati = preventivi?.filter(p => p.stato === 'accettato').length || 0;
      const importoTotalePreventivi = preventivi?.reduce((sum, p) => sum + (p.importo || 0), 0) || 0;

      // Statistiche lavori
      const { data: lavori } = await supabase
        .from('lavori')
        .select('*');

      const lavoriInCorso = lavori?.filter(l => l.stato === 'in_produzione').length || 0;
      const lavoriCompletati = lavori?.filter(l => l.stato === 'completato').length || 0;
      const importoTotaleLavori = lavori?.reduce((sum, l) => sum + (l.importo_totale || 0), 0) || 0;

      // Attività recenti
      const { data: recentPreventivi } = await supabase
        .from('preventivi')
        .select('*, cliente:clienti(*)')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentLavori } = await supabase
        .from('lavori')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalClienti: clientiCount || 0,
        totalPreventivi: preventiviCount || 0,
        preventiviAccettati,
        lavoriInCorso,
        lavoriCompletati,
        importoTotalePreventivi,
        importoTotaleLavori,
      });

      // Combina attività recenti
      const activity = [
        ...(recentPreventivi || []).map(p => ({
          type: 'preventivo',
          title: `Preventivo ${p.numero_preventivo || p.id}`,
          description: `Cliente: ${p.cliente?.nome || 'N/A'}`,
          date: p.created_at,
          status: p.stato,
        })),
        ...(recentLavori || []).map(l => ({
          type: 'lavoro',
          title: `Lavoro ${l.numero_lavoro}`,
          description: l.descrizione,
          date: l.created_at,
          status: l.stato,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

      setRecentActivity(activity);

      // Traccia analytics
      freeAnalyticsService.trackBusinessEvent('dashboard_viewed');

    } catch (error) {
      console.error('Errore nel caricamento dei dati dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeEnterpriseServices = async () => {
    try {
      // Inizializza servizi enterprise gratuiti
      await freeAnalyticsService.initializeGA4();
      await freeAnalyticsService.initializePlausible();
      await cronJobService.setupItalianAutomation();
      
      console.log('🚀 Servizi enterprise inizializzati');
    } catch (error) {
      console.error('Errore inizializzazione servizi:', error);
    }
  };

  const statCards = [
    {
      name: 'Clienti Totali',
      value: stats.totalClienti,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      help: 'Numero totale di clienti registrati nel sistema',
    },
    {
      name: 'Preventivi Totali',
      value: stats.totalPreventivi,
      icon: FileText,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      help: 'Numero totale di preventivi creati',
    },
    {
      name: 'Preventivi Accettati',
      value: stats.preventiviAccettati,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      help: 'Preventivi che sono stati accettati dai clienti',
    },
    {
      name: 'Lavori in Corso',
      value: stats.lavoriInCorso,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      help: 'Lavori attualmente in produzione',
    },
    {
      name: 'Lavori Completati',
      value: stats.lavoriCompletati,
      icon: Briefcase,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      help: 'Lavori completati e consegnati',
    },
    {
      name: 'Valore Preventivi',
      value: `€${stats.importoTotalePreventivi.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      help: 'Valore totale di tutti i preventivi',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accettato':
      case 'completato':
        return 'text-green-600 bg-green-100';
      case 'in_produzione':
      case 'inviato':
        return 'text-yellow-600 bg-yellow-100';
      case 'rifiutato':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accettato':
      case 'completato':
        return CheckCircle;
      case 'in_produzione':
      case 'inviato':
        return Clock;
      case 'rifiutato':
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Enterprise</h1>
          <p className="mt-2 text-gray-600 flex items-center gap-2">
            Panoramica generale con funzionalità avanzate
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              <Zap className="h-3 w-3" />
              100% Gratuito
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          {permissions.canViewFinancials && (
            <Link
              to="/home-finanziaria"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Home Finanziaria
            </Link>
          )}
        </div>
      </div>

      {/* Statistiche principali */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <HelpTooltip content={stat.help} />
                  </div>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Funzionalità Enterprise */}
      <EnterpriseFeatures />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attività recenti */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Attività Recenti</h3>
            <HelpTooltip content="Ultimi preventivi e lavori creati o modificati" />
          </div>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const StatusIcon = getStatusIcon(activity.status);
                return (
                  <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(activity.date).toLocaleDateString('it-IT')}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nessuna attività recente</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Azioni rapide */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Azioni Rapide</h3>
            <HelpTooltip content="Accesso rapido alle funzioni più utilizzate" />
          </div>
          
          <div className="space-y-3">
            <Link
              to="/clienti"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all duration-200 group"
            >
              <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Gestisci Clienti</p>
                <p className="text-sm text-gray-600">Aggiungi o modifica clienti</p>
              </div>
            </Link>

            {permissions.canModifyPreventivi && (
              <Link
                to="/preventivi"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg transition-all duration-200 group"
              >
                <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Nuovo Preventivo</p>
                  <p className="text-sm text-gray-600">Crea un nuovo preventivo</p>
                </div>
              </Link>
            )}

            {permissions.canModifyLavori && (
              <Link
                to="/lavori"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all duration-200 group"
              >
                <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Gestisci Lavori</p>
                  <p className="text-sm text-gray-600">Visualizza e gestisci i lavori</p>
                </div>
              </Link>
            )}

            {permissions.canViewFinancials && (
              <Link
                to="/finanziari/dividendi"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 rounded-lg transition-all duration-200 group"
              >
                <div className="p-2 bg-yellow-600 rounded-lg group-hover:bg-yellow-700 transition-colors">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Calcola Dividendi</p>
                  <p className="text-sm text-gray-600">Visualizza i dividendi tra le aziende</p>
                </div>
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      {/* Componente AI Insights */}
      <AIInsights financialData={financialData} />
      
      {/* Assistente AI */}
      <AIAssistant />
    </div>
  );
};

export default Dashboard;