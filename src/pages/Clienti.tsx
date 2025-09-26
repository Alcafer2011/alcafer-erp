import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, MapPin, Search, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Cliente } from '../types/database';
import ClienteModal from '../components/modals/ClienteModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import toast from 'react-hot-toast';

const Clienti: React.FC = () => {
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [filteredClienti, setFilteredClienti] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClienti();
  }, []);

  useEffect(() => {
    const filtered = clienti.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cliente.telefono && cliente.telefono.includes(searchTerm))
    );
    setFilteredClienti(filtered);
  }, [clienti, searchTerm]);

  const fetchClienti = async () => {
    try {
      const { data, error } = await supabase
        .from('clienti')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClienti(data || []);
    } catch (error) {
      console.error('Errore nel caricamento dei clienti:', error);
      toast.error('Errore nel caricamento dei clienti');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente? Questa azione non può essere annullata.')) return;

    try {
      const { error } = await supabase
        .from('clienti')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Cliente eliminato con successo');
      fetchClienti();
    } catch (error) {
      console.error('Errore nell\'eliminazione del cliente:', error);
      toast.error('Errore nell\'eliminazione del cliente');
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedCliente(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCliente(null);
    fetchClienti();
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Clienti</h1>
          <p className="mt-2 text-gray-600">Gestisci i tuoi clienti e le loro informazioni</p>
        </div>
        <button 
          onClick={handleNew} 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuovo Cliente
        </button>
      </div>

      {/* Barra di ricerca */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca clienti per nome, email o telefono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredClienti.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nessun cliente trovato' : 'Nessun cliente'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Prova a modificare i termini di ricerca' 
                : 'Inizia aggiungendo il tuo primo cliente per gestire i progetti'
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={handleNew} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Aggiungi Cliente
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Clienti ({filteredClienti.length})
                </h3>
                <HelpTooltip content="Gestisci i tuoi clienti: aggiungi, modifica o elimina le informazioni dei clienti" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contatti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Indirizzo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Registrazione
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredClienti.map((cliente, index) => (
                      <motion.tr
                        key={cliente.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {cliente.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              {cliente.email}
                            </div>
                            {cliente.telefono && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                {cliente.telefono}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cliente.indirizzo ? (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="truncate max-w-xs">{cliente.indirizzo}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Non specificato</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('it-IT') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(cliente)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Modifica cliente"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cliente.id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Elimina cliente"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <ClienteModal
            cliente={selectedCliente}
            onClose={handleModalClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Clienti;
