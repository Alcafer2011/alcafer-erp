import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Clock, Calendar, DollarSign, 
  User, Briefcase, CheckCircle, AlertTriangle, Tool
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Lavoro } from '../types/database';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import toast from 'react-hot-toast';

interface PosaInOpera {
  id: string;
  lavoro_id: string;
  data: string;
  ore_lavoro: number;
  tariffa_oraria: number;
  importo_totale: number;
  note?: string;
  created_at: string;
}

const PosaInOpera: React.FC = () => {
  const [poseInOpera, setPoseInOpera] = useState<PosaInOpera[]>([]);
  const [lavori, setLavori] = useState<Lavoro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const permissions = usePermissions();
  
  const [formData, setFormData] = useState({
    lavoro_id: '',
    data: new Date().toISOString().split('T')[0],
    ore_lavoro: 0,
    tariffa_oraria: 35,
    note: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch lavori completati o in produzione
      const { data: lavoriData, error: lavoriError } = await supabase
        .from('lavori')
        .select('*')
        .in('stato', ['in_produzione', 'completato'])
        .order('created_at', { ascending: false });

      if (lavoriError) throw lavoriError;
      setLavori(lavoriData || []);
      
      // Simula dati di posa in opera per demo
      const mockPoseInOpera: PosaInOpera[] = [
        {
          id: '1',
          lavoro_id: lavoriData?.[0]?.id || '1',
          data: '2024-12-15',
          ore_lavoro: 8,
          tariffa_oraria: 35,
          importo_totale: 280,
          note: 'Installazione cancello presso cliente',
          created_at: '2024-12-15T10:00:00Z'
        },
        {
          id: '2',
          lavoro_id: lavoriData?.[1]?.id || '2',
          data: '2024-12-16',
          ore_lavoro: 4,
          tariffa_oraria: 40,
          importo_totale: 160,
          note: 'Montaggio struttura metallica',
          created_at: '2024-12-16T09:30:00Z'
        }
      ];
      
      setPoseInOpera(mockPoseInOpera);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.lavoro_id) {
      toast.error('Seleziona un lavoro');
      return;
    }
    
    if (formData.ore_lavoro <= 0) {
      toast.error('Le ore di lavoro devono essere maggiori di 0');
      return;
    }
    
    if (formData.tariffa_oraria <= 0) {
      toast.error('La tariffa oraria deve essere maggiore di 0');
      return;
    }
    
    try {
      const importoTotale = formData.ore_lavoro * formData.tariffa_oraria;
      
      if (editingId) {
        // Aggiorna record esistente
        const updatedPosa = {
          ...formData,
          importo_totale: importoTotale
        };
        
        // Simula aggiornamento
        setPoseInOpera(prev => prev.map(p => p.id === editingId ? { ...p, ...updatedPosa } : p));
        toast.success('Posa in opera aggiornata con successo');
        setEditingId(null);
      } else {
        // Crea nuovo record
        const newPosa: PosaInOpera = {
          id: Date.now().toString(),
          lavoro_id: formData.lavoro_id,
          data: formData.data,
          ore_lavoro: formData.ore_lavoro,
          tariffa_oraria: formData.tariffa_oraria,
          importo_totale: importoTotale,
          note: formData.note,
          created_at: new Date().toISOString()
        };
        
        // Simula inserimento
        setPoseInOpera(prev => [newPosa, ...prev]);
        toast.success('Posa in opera registrata con successo');
      }
      
      // Reset form
      setFormData({
        lavoro_id: '',
        data: new Date().toISOString().split('T')[0],
        ore_lavoro: 0,
        tariffa_oraria: 35,
        note: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      toast.error('Errore nel salvataggio');
    }
  };

  const handleEdit = (posa: PosaInOpera) => {
    setFormData({
      lavoro_id: posa.lavoro_id,
      data: posa.data,
      ore_lavoro: posa.ore_lavoro,
      tariffa_oraria: posa.tariffa_oraria,
      note: posa.note || ''
    });
    setEditingId(posa.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa posa in opera?')) return;
    
    try {
      // Simula eliminazione
      setPoseInOpera(prev => prev.filter(p => p.id !== id));
      toast.success('Posa in opera eliminata con successo');
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
      toast.error('Errore nell\'eliminazione');
    }
  };

  const getLavoroDetails = (lavoroId: string) => {
    const lavoro = lavori.find(l => l.id === lavoroId);
    return lavoro ? {
      numero: lavoro.numero_lavoro,
      descrizione: lavoro.descrizione,
      ditta: lavoro.ditta
    } : { numero: 'N/A', descrizione: 'Lavoro non trovato', ditta: 'N/A' };
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
        <Tool className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accesso Limitato</h3>
        <p className="text-gray-500">Non hai i permessi per visualizzare questa sezione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posa in Opera</h1>
          <p className="mt-2 text-gray-600">Gestisci le ore di installazione e montaggio presso i clienti</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({
              lavoro_id: '',
              data: new Date().toISOString().split('T')[0],
              ore_lavoro: 0,
              tariffa_oraria: 35,
              note: ''
            });
            setShowAddForm(!showAddForm);
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Registra Posa in Opera
        </button>
      </div>

      {/* Form Aggiungi/Modifica */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Modifica Posa in Opera' : 'Registra Nuova Posa in Opera'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="lavoro_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Lavoro *
                  </label>
                  <select
                    id="lavoro_id"
                    value={formData.lavoro_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, lavoro_id: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleziona un lavoro</option>
                    {lavori.map(lavoro => (
                      <option key={lavoro.id} value={lavoro.id}>
                        {lavoro.numero_lavoro} - {lavoro.descrizione.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      id="data"
                      value={formData.data}
                      onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label htmlFor="ore_lavoro" className="block text-sm font-medium text-gray-700 mb-1">
                    Ore di Lavoro *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      id="ore_lavoro"
                      value={formData.ore_lavoro}
                      onChange={(e) => setFormData(prev => ({ ...prev, ore_lavoro: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.5"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="tariffa_oraria" className="block text-sm font-medium text-gray-700 mb-1">
                    Tariffa Oraria (€/h) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      id="tariffa_oraria"
                      value={formData.tariffa_oraria}
                      onChange={(e) => setFormData(prev => ({ ...prev, tariffa_oraria: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importo Totale (€)
                  </label>
                  <div className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg text-gray-700 font-medium">
                    € {(formData.ore_lavoro * formData.tariffa_oraria).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Note aggiuntive..."
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingId ? 'Aggiorna' : 'Registra'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Riepilogo Totali */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Totale Ore Posa in Opera</p>
            <p className="text-2xl font-bold text-blue-900">
              {poseInOpera.reduce((sum, p) => sum + p.ore_lavoro, 0)} ore
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Importo: €{poseInOpera.reduce((sum, p) => sum + p.importo_totale, 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-4 bg-blue-600 rounded-full">
            <Tool className="h-8 w-8 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Lista Pose in Opera */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Pose in Opera
            </h3>
            <HelpTooltip content="Registra le ore di installazione e montaggio presso i clienti" />
          </div>
        </div>

        {poseInOpera.length === 0 ? (
          <div className="text-center py-12">
            <Tool className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna posa in opera registrata</h3>
            <p className="text-gray-500 mb-6">Inizia registrando le ore di installazione e montaggio</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Registra Posa in Opera
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lavoro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ore
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tariffa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {poseInOpera.map((posa, index) => {
                    const lavoroDetails = getLavoroDetails(posa.lavoro_id);
                    return (
                      <motion.tr
                        key={posa.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {lavoroDetails.numero}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {lavoroDetails.descrizione}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              lavoroDetails.ditta === 'alcafer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {lavoroDetails.ditta.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(posa.data).toLocaleDateString('it-IT')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {posa.ore_lavoro} h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          €{posa.tariffa_oraria.toFixed(2)}/h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            €{posa.importo_totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(posa)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Modifica posa in opera"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(posa.id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Elimina posa in opera"
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
        )}
      </div>

      {/* Informazioni aggiuntive */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Tool className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-blue-800">Informazioni Posa in Opera</h3>
        </div>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• La posa in opera include installazione, montaggio e messa in funzione presso il cliente</p>
          <p>• Le ore vengono conteggiate dal momento della partenza al rientro in azienda</p>
          <p>• La tariffa oraria standard è di €35/h, ma può variare in base alla complessità</p>
          <p>• Per lavori fuori provincia, aggiungere anche le spese di trasferta</p>
        </div>
      </div>
    </div>
  );
};

export default PosaInOpera;