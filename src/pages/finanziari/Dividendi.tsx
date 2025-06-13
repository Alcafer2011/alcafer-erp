import React, { useEffect, useState } from 'react';
import { PieChart, Calculator, DollarSign, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { supabase } from '../../lib/supabase';
import { usePermissions } from '../../hooks/usePermissions';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import HelpTooltip from '../../components/common/HelpTooltip';

interface DividendiData {
  alcafer: { totale: number; percentuale: number };
  gabifer: { totale: number; percentuale: number };
  lavoriMese: any[];
}

const Dividendi: React.FC = () => {
  const [dividendiData, setDividendiData] = useState<DividendiData>({
    alcafer: { totale: 0, percentuale: 0 },
    gabifer: { totale: 0, percentuale: 0 },
    lavoriMese: []
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const permissions = usePermissions();

  useEffect(() => {
    fetchDividendiData();
  }, [selectedMonth, selectedYear]);

  const fetchDividendiData = async () => {
    try {
      // Recupera i lavori del mese selezionato
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

      const { data: lavori, error } = await supabase
        .from('lavori')
        .select(`
          *,
          materiali_metallici(*),
          materiali_vari(*)
        `)
        .gte('data_fine', startDate)
        .lte('data_fine', endDate)
        .eq('stato', 'completato');

      if (error) throw error;

      // Calcola i dividendi per ogni lavoro
      const lavoriConDividendi = lavori?.map(lavoro => {
        const costiMateriali = [
          ...(lavoro.materiali_metallici || []),
          ...(lavoro.materiali_vari || [])
        ].reduce((sum, materiale) => sum + (materiale.importo_totale || 0), 0);

        // Calcola costi leasing proporzionali alle ore
        const costiLeasing = (lavoro.ore_lavoro || 0) * 15; // Stima €15/ora per leasing

        // Calcola costi manovalanza proporzionali
        const costiManovalanza = 1200 * ((lavoro.ore_lavoro || 0) / 160); // 160 ore/mese standard

        const importoNetto = lavoro.importo_totale - costiMateriali - costiLeasing - costiManovalanza;

        let dividendoAlcafer = 0;
        let dividendoGabifer = 0;

        if (lavoro.ditta === 'gabifer') {
          // Se il lavoro è di Gabifer, divide al 50%
          dividendoAlcafer = importoNetto * 0.5;
          dividendoGabifer = importoNetto * 0.5;
        } else {
          // Se il lavoro è di Alcafer
          if (lavoro.accordo_gabifer === 'orario') {
            dividendoGabifer = (lavoro.ore_lavoro || 0) * 50; // €50/ora
            dividendoAlcafer = importoNetto - dividendoGabifer;
          } else if (lavoro.accordo_gabifer === 'tantum') {
            dividendoGabifer = lavoro.importo_accordo_gabifer || 0;
            dividendoAlcafer = importoNetto - dividendoGabifer;
          } else {
            dividendoAlcafer = importoNetto;
          }
        }

        return {
          ...lavoro,
          costiMateriali,
          costiLeasing,
          costiManovalanza,
          importoNetto,
          dividendoAlcafer,
          dividendoGabifer
        };
      }) || [];

      const totaleAlcafer = lavoriConDividendi.reduce((sum, l) => sum + l.dividendoAlcafer, 0);
      const totaleGabifer = lavoriConDividendi.reduce((sum, l) => sum + l.dividendoGabifer, 0);
      const totaleComplessivo = totaleAlcafer + totaleGabifer;

      setDividendiData({
        alcafer: {
          totale: totaleAlcafer,
          percentuale: totaleComplessivo > 0 ? (totaleAlcafer / totaleComplessivo) * 100 : 0
        },
        gabifer: {
          totale: totaleGabifer,
          percentuale: totaleComplessivo > 0 ? (totaleGabifer / totaleComplessivo) * 100 : 0
        },
        lavoriMese: lavoriConDividendi
      });
    } catch (error) {
      console.error('Errore nel calcolo dei dividendi:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Alcafer', value: dividendiData.alcafer.totale, color: '#3B82F6' },
    { name: 'Gabifer', value: dividendiData.gabifer.totale, color: '#8B5CF6' }
  ];

  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

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
        <PieChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accesso Limitato</h3>
        <p className="text-gray-500">Non hai i permessi per visualizzare questa sezione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calcolo Dividendi</h1>
          <p className="mt-2 text-gray-600">Distribuzione degli utili tra Alcafer e Gabifer</p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Riepilogo Dividendi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-blue-600">Dividendo Alcafer</p>
              <p className="text-2xl font-bold text-blue-900">
                €{dividendiData.alcafer.totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-blue-600">
                {dividendiData.alcafer.percentuale.toFixed(1)}% del totale
              </p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-purple-600">Dividendo Gabifer</p>
              <p className="text-2xl font-bold text-purple-900">
                €{dividendiData.gabifer.totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-purple-600">
                {dividendiData.gabifer.percentuale.toFixed(1)}% del totale
              </p>
            </div>
            <Building2 className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-green-600">Totale Dividendi</p>
              <p className="text-2xl font-bold text-green-900">
                €{(dividendiData.alcafer.totale + dividendiData.gabifer.totale).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-green-600">
                {dividendiData.lavoriMese.length} lavori completati
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>
      </div>

      {/* Grafici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico a torta */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Distribuzione Dividendi</h3>
            <HelpTooltip content="Ripartizione percentuale degli utili tra le due aziende" />
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

        {/* Dettaglio per lavoro */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Dividendi per Lavoro</h3>
            <HelpTooltip content="Dettaglio del calcolo dei dividendi per ogni lavoro completato" />
          </div>
          
          {dividendiData.lavoriMese.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dividendiData.lavoriMese.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="numero_lavoro" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`€${value.toLocaleString('it-IT')}`, '']}
                />
                <Bar dataKey="dividendoAlcafer" fill="#3B82F6" name="Alcafer" />
                <Bar dataKey="dividendoGabifer" fill="#8B5CF6" name="Gabifer" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nessun lavoro completato nel periodo selezionato</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Dettaglio Lavori */}
      {dividendiData.lavoriMese.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              Dettaglio Calcoli - {months[selectedMonth - 1]} {selectedYear}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lavoro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importo Totale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Netto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alcafer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gabifer
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dividendiData.lavoriMese.map((lavoro) => (
                  <tr key={lavoro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lavoro.numero_lavoro}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lavoro.ditta.toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{lavoro.importo_totale.toLocaleString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{(lavoro.costiMateriali + lavoro.costiLeasing + lavoro.costiManovalanza).toLocaleString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      €{lavoro.importoNetto.toLocaleString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                      €{lavoro.dividendoAlcafer.toLocaleString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
                      €{lavoro.dividendoGabifer.toLocaleString('it-IT')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dividendi;