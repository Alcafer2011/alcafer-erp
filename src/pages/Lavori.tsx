import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Play, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Lavoro } from '../types/database';
import LavoroModal from '../components/modals/LavoroModal';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import toast from 'react-hot-toast';

const Lavori: React.FC = () => {
  const [lavori, setLavori] = useState<Lavoro[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLavoro, setSelectedLavoro] = useState<Lavoro | null>(null);
  const permissions = usePermissions();

  useEffect(() => {
    fetchLavori();
  }, []);

  const fetchLavori = async () => {
    try {
      const { data, error } = await supabase
        .from('lavori')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLavori(data || []);
    } catch (error) {
      console.error('Errore nel caricamento dei lavori:', error);
      toast.error('Errore nel caricamento dei lavori');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo lavoro?')) return;

    try {
      const { error } = await supabase
        .from('lavori')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Lavoro eliminato con successo');
      fetchLavori();
    } catch (error) {
      console.error('Errore nell\'eliminazione del lavoro:', error);
      toast.error('Errore nell\'eliminazione del lavoro');
    }
  };

  const handleEdit = (lavoro: Lavoro) => {
    setSelectedLavoro(lavoro);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedLavoro(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedLavoro(null);
    fetchLavori();
  };

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'completato':
        return 'text-green-600 bg-green-100';
      case 'in_produzione':
        return 'text-blue-600 bg-blue-100';
      case 'in_attesa':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatoIcon = (stato: string) => {
    switch (stato) {
      case 'completato':
        return CheckCircle;
      case 'in_produzione':
        return Play;
      case 'in_attesa':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!permissions.canModifyLavori) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accesso Limitato</h3>
        <p className="text-gray-500">Non hai i permessi per visualizzare questa sezione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Lavori</h1>
          <p className="mt-2 text-gray-600">Monitora e gestisci tutti i lavori in corso</p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuovo Lavoro
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {lavori.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun lavoro</h3>
            <p className="text-gray-500 mb-6">Inizia aggiungendo il tuo primo lavoro</p>
            <button 
              onClick={handleNew}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Aggiungi Lavoro
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lavori ({lavori.length})
                </h3>
                <HelpTooltip content="Gestisci il ciclo di vita completo dei lavori: dalla creazione alla consegna" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lavoro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Importo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ditta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {lavori.map((lavoro, index) => {
                      const StatoIcon = getStatoIcon(lavoro.stato);
                      return (
                        <motion.tr
                          key={lavoro.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {lavoro.numero_lavoro}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {lavoro.descrizione}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <StatoIcon className="h-4 w-4" />
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatoColor(lavoro.stato)}`}>
                                {lavoro.stato.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              €{lavoro.importo_totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-gray-500">
                              Acconto: {lavoro.acconto_percentuale}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              lavoro.ditta === 'alcafer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {lavoro.ditta.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              {lavoro.data_inizio ? (
                                <div>Inizio: {new Date(lavoro.data_inizio).toLocaleDateString('it-IT')}</div>
                              ) : (
                                <div className="text-gray-400">Non iniziato</div>
                              )}
                              {lavoro.data_fine && (
                                <div>Fine: {new Date(lavoro.data_fine).toLocaleDateString('it-IT')}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(lavoro)}
                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Modifica lavoro"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(lavoro.id)}
                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Elimina lavoro"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <LavoroModal
            lavoro={selectedLavoro}
            onClose={handleModalClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lavori;