import React, { useEffect, useState } from 'react';
import { Users, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalClienti: 0,
    totalPreventivi: 0,
    preventiviApprovati: 0,
    importoTotale: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Conta clienti
        const { count: clientiCount } = await supabase
          .from('clienti')
          .select('*', { count: 'exact', head: true });

        // Conta preventivi
        const { count: preventiviCount } = await supabase
          .from('preventivi')
          .select('*', { count: 'exact', head: true });

        // Conta preventivi approvati
        const { count: approvatiCount } = await supabase
          .from('preventivi')
          .select('*', { count: 'exact', head: true })
          .eq('stato', 'approvato');

        // Calcola importo totale
        const { data: preventivi } = await supabase
          .from('preventivi')
          .select('importo')
          .eq('stato', 'approvato');

        const importoTotale = preventivi?.reduce((sum, p) => sum + (p.importo || 0), 0) || 0;

        setStats({
          totalClienti: clientiCount || 0,
          totalPreventivi: preventiviCount || 0,
          preventiviApprovati: approvatiCount || 0,
          importoTotale,
        });
      } catch (error) {
        console.error('Errore nel caricamento delle statistiche:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Clienti Totali',
      value: stats.totalClienti,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Preventivi Totali',
      value: stats.totalPreventivi,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      name: 'Preventivi Approvati',
      value: stats.preventiviApprovati,
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
    {
      name: 'Valore Approvati',
      value: `€${stats.importoTotale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Panoramica generale dell'attività</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Recenti</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Sistema avviato</span>
              <span className="text-xs text-gray-400">Oggi</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Database connesso</span>
              <span className="text-xs text-gray-400">Oggi</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
          <div className="space-y-3">
            <button className="btn-primary w-full">
              Nuovo Cliente
            </button>
            <button className="btn-secondary w-full">
              Nuovo Preventivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;