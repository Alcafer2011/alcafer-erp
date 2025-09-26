import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Truck, Star, Phone, Mail, MapPin, Search, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import FornitoreModal from '../components/modals/FornitoreModal';
import toast from 'react-hot-toast';

interface Fornitore {
  id: string;
  nome: string;
  email?: string;
  telefono?: string;
  indirizzo?: string;
  partita_iva?: string;
  codice_fiscale?: string;
  tipo_fornitore: string;
  settore_merceologico?: string;
  condizioni_pagamento?: string;
  sconto_standard?: number;
  valutazione?: number;
  note?: string;
  attivo: boolean;
  created_at?: string;
  updated_at?: string;
}

const Fornitori: React.FC = () => {
  const [fornitori, setFornitori] = useState<Fornitore[]>([]);
  const [filteredFornitori, setFilteredFornitori] = useState<Fornitore[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFornitore, setSelectedFornitore] = useState<Fornitore | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const permissions = usePermissions();

  useEffect(() => {
    fetchFornitori();
  }, []);

  useEffect(() => {
    let filtered = fornitori;

    // Filtro per ricerca
    if (searchTerm) {
      filtered = filtered.filter(fornitore =>
        fornitore.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fornitore.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fornitore.settore_merceologico?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro per tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(fornitore => fornitore.tipo_fornitore === filterType);
    }

    setFilteredFornitori(filtered);
  }, [fornitori, searchTerm, filterType]);

  const fetchFornitori = async () => {
    try {
      // Simula dati fornitori per demo
      const mockFornitori: Fornitore[] = [
        {
          id: '1',
          nome: 'Acciai Speciali Milano',
          email: 'ordini@acciaispeciali.it',
          telefono: '+39 02 1234567',
          indirizzo: 'Via Industria 15, 20100 Milano',
          partita_iva: '12345678901',
          tipo_fornitore: 'materiali',
          settore_merceologico: 'Acciai e leghe metalliche',
          condizioni_pagamento: '30 giorni',
          sconto_standard: 5.0,
          valutazione: 5,
          attivo: true,
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          nome: 'Gas Tecnici Lombardia',
          email: 'info@gastecnici.com',
          telefono: '+39 02 9876543',
          indirizzo: 'Via Chimica 8, 20090 Segrate',
          partita_iva: '98765432109',
          tipo_fornitore: 'materiali',
          settore_merceologico: 'Gas industriali',
          condizioni_pagamento: '15 giorni',
          sconto_standard: 3.0,
          valutazione: 4,
          attivo: true,
          created_at: '2024-02-01T14:30:00Z'
        },
        {
          id: '3',
          nome: 'Trasporti Veloci SRL',
          email: 'logistica@trasportiveloci.it',
          telefono: '+39 02 5555555',
          indirizzo: 'Via Logistica 22, 20080 Basiglio',
          partita_iva: '11122233344',
          tipo_fornitore: 'trasporti',
          settore_merceologico: 'Trasporti e logistica',
          condizioni_pagamento: '60 giorni',
          sconto_standard: 0,
          valutazione: 3,
          attivo: true,
          created_at: '2024-03-10T09:15:00Z'
        },
        {
          id: '4',
          nome: 'Manutenzione Industriale',
          email: 'servizi@manutenzione.com',
          telefono: '+39 02 7777777',
          indirizzo: 'Via Riparazione 5, 20100 Milano',
          partita_iva: '55566677788',
          tipo_fornitore: 'manutenzione',
          settore_merceologico: 'Manutenzione macchinari',
          condizioni_pagamento: '30 giorni',
          sconto_standard: 2.5,
          valutazione: 4,
          attivo: true,
          created_at: '2024-04-05T16:45:00Z'
        }
      ];

      setFornitori(mockFornitori);
    } catch (error) {
      console.error('Errore nel caricamento dei fornitori:', error);
      toast.error('Errore nel caricamento dei fornitori');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo fornitore?')) return;

    try {
      setFornitori(prev => prev.filter(f => f.id !== id));
      toast.success('Fornitore eliminato con successo');
    } catch (error) {
      console.error('Errore nell\'eliminazione del fornitore:', error);
      toast.error('Errore nell\'eliminazione del fornitore');
    }
  };

  const handleEdit = (fornitore: Fornitore) => {
    setSelectedFornitore(fornitore);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedFornitore(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedFornitore(null);
    fetchFornitori();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      materiali: 'bg-blue-100 text-blue-800',
      servizi: 'bg-green-100 text-green-800',
      trasporti: 'bg-purple-100 text-purple-800',
      utenze: 'bg-yellow-100 text-yellow-800',
      manutenzione: 'bg-red-100 text-red-800',
      consulenza: 'bg-indigo-100 text-indigo-800',
      altro: 'bg-gray-100 text-gray-800'
    };
    return colors[tipo] || colors.altro;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!permissions.canViewFornitori) {
    return (
      <div className="text-center py-12">
        <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accesso Limitato</h3>
        <p className="text-gray-500">Non hai i permessi per visualizzare questa sezione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Fornitori</h1>
          <p className="mt-2 text-gray-600">Gestisci i tuoi fornitori e le loro informazioni</p>
        </div>
        {permissions.canModifyFornitori && (
          <button 
            onClick={handleNew} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuovo Fornitore
          </button>
        )}
      </div>

      {/* Filtri e ricerca */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca fornitori per nome, email o settore..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti i tipi</option>
            <option value="materiali">Materiali</option>
            <option value="servizi">Servizi</option>
            <option value="trasporti">Trasporti</option>
            <option value="utenze">Utenze</option>
            <option value="manutenzione">Manutenzione</option>
            <option value="consulenza">Consulenza</option>
            <option value="altro">Altro</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredFornitori.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' ? 'Nessun fornitore trovato' : 'Nessun fornitore'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterType !== 'all'
                ? 'Prova a modificare i filtri di ricerca' 
                : 'Inizia aggiungendo il tuo primo fornitore'
              }
            </p>
            {!searchTerm && filterType === 'all' && permissions.canModifyFornitori && (
              <button 
                onClick={handleNew} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Aggiungi Fornitore
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Fornitori ({filteredFornitori.length})
                </h3>
                <HelpTooltip content="Gestisci i tuoi fornitori: aggiungi, modifica o elimina le informazioni dei fornitori" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
              <AnimatePresence>
                {filteredFornitori.map((fornitore, index) => (
                  <motion.div
                    key={fornitore.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{fornitore.nome}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(fornitore.tipo_fornitore)}`}>
                            {fornitore.tipo_fornitore}
                          </span>
                        </div>
                      </div>
                      
                      {permissions.canModifyFornitori && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(fornitore)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="Modifica fornitore"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(fornitore.id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            title="Elimina fornitore"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {fornitore.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{fornitore.email}</span>
                        </div>
                      )}
                      
                      {fornitore.telefono && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{fornitore.telefono}</span>
                        </div>
                      )}
                      
                      {fornitore.indirizzo && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{fornitore.indirizzo}</span>
                        </div>
                      )}
                    </div>

                    {fornitore.settore_merceologico && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        <strong>Settore:</strong> {fornitore.settore_merceologico}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {renderStars(fornitore.valutazione || 0)}
                        <span className="text-sm text-gray-500 ml-1">
                          ({fornitore.valutazione || 0}/5)
                        </span>
                      </div>
                      
                      {fornitore.sconto_standard && fornitore.sconto_standard > 0 && (
                        <span className="text-sm font-medium text-green-600">
                          Sconto {fornitore.sconto_standard}%
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      Aggiunto: {fornitore.created_at ? new Date(fornitore.created_at).toLocaleDateString('it-IT') : 'N/A'}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <FornitoreModal
            fornitore={selectedFornitore}
            onClose={handleModalClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Fornitori;
