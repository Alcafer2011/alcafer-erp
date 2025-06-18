import React, { useEffect, useState } from 'react';
import { Edit, Home, Zap, Droplet, Flame, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import toast from 'react-hot-toast';

interface CostoUtenza {
  id: string;
  tipo: 'elettricita' | 'acqua' | 'gas' | 'tari' | 'imu' | 'pulizia' | 'assicurazione' | 'mutuo' | 'imprevisti';
  fornitore: string;
  costo_fisso: number;
  costo_variabile: number;
  unita_misura: string;
  data_aggiornamento: string;
  potenza_installata?: number;
  note?: string;
}

const CostiUtenze: React.FC = () => {
  const [costiUtenze, setCostiUtenze] = useState<CostoUtenza[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    costo_fisso: number;
    costo_variabile: number;
    note?: string;
  }>({
    costo_fisso: 0,
    costo_variabile: 0,
    note: ''
  });
  const [newUtenza, setNewUtenza] = useState<{
    tipo: 'elettricita' | 'acqua' | 'gas' | 'tari' | 'imu' | 'pulizia' | 'assicurazione' | 'mutuo' | 'imprevisti';
    fornitore: string;
    costo_fisso: number;
    costo_variabile: number;
    unita_misura: string;
    note?: string;
  }>({
    tipo: 'elettricita',
    fornitore: '',
    costo_fisso: 0,
    costo_variabile: 0,
    unita_misura: 'kWh',
    note: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const permissions = usePermissions();

  // Dati predefiniti per i fornitori locali
  const fornitoriLocali = {
    elettricita: [
      { nome: 'ASM Pavia', costo_fisso: 45.50, costo_variabile: 0.28, unita: 'kWh' },
      { nome: 'Enel Energia', costo_fisso: 42.80, costo_variabile: 0.26, unita: 'kWh' },
      { nome: 'A2A', costo_fisso: 44.20, costo_variabile: 0.27, unita: 'kWh' }
    ],
    gas: [
      { nome: 'ASM Pavia', costo_fisso: 12.30, costo_variabile: 0.95, unita: 'Smc' },
      { nome: 'Eni Gas e Luce', costo_fisso: 13.50, costo_variabile: 0.92, unita: 'Smc' },
      { nome: 'Sorgenia', costo_fisso: 11.80, costo_variabile: 0.97, unita: 'Smc' }
    ],
    acqua: [
      { nome: 'Pavia Acque', costo_fisso: 8.90, costo_variabile: 2.80, unita: 'm³' },
      { nome: 'CAP Holding', costo_fisso: 9.20, costo_variabile: 2.75, unita: 'm³' }
    ],
    tari: [
      { nome: 'Comune di Pavia', costo_fisso: 450, costo_variabile: 0, unita: 'anno' }
    ],
    imu: [
      { nome: 'Comune di Pavia', costo_fisso: 1200, costo_variabile: 0, unita: 'anno' }
    ],
    mutuo: [
      { nome: 'Banca Intesa', costo_fisso: 1850, costo_variabile: 0, unita: 'mese' },
      { nome: 'Unicredit', costo_fisso: 1820, costo_variabile: 0, unita: 'mese' }
    ],
    pulizia: [
      { nome: 'Servizi Pulizie SRL', costo_fisso: 350, costo_variabile: 0, unita: 'mese' }
    ],
    assicurazione: [
      { nome: 'Generali', costo_fisso: 180, costo_variabile: 0, unita: 'mese' },
      { nome: 'UnipolSai', costo_fisso: 175, costo_variabile: 0, unita: 'mese' }
    ],
    imprevisti: [
      { nome: 'Fondo imprevisti', costo_fisso: 500, costo_variabile: 0, unita: 'mese' }
    ]
  };

  useEffect(() => {
    fetchCostiUtenze();
  }, []);

  const fetchCostiUtenze = async () => {
    try {
      const { data, error } = await supabase
        .from('costi_utenze')
        .select('*')
        .order('tipo');

      if (error) throw error;
      
      // Se non ci sono dati, inizializza con valori predefiniti
      if (!data || data.length === 0) {
        await initializeCostiUtenze();
        const { data: initialData } = await supabase
          .from('costi_utenze')
          .select('*')
          .order('tipo');
        
        setCostiUtenze(initialData || []);
      } else {
        setCostiUtenze(data);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei costi utenze:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const initializeCostiUtenze = async () => {
    try {
      const costiToInsert = [];
      
      // Elettricità
      costiToInsert.push({
        tipo: 'elettricita',
        fornitore: 'ASM Pavia',
        costo_fisso: 45.50,
        costo_variabile: 0.28,
        unita_misura: 'kWh',
        data_aggiornamento: new Date().toISOString().split('T')[0],
        potenza_installata: 100,
        note: 'Contratto business 3F+N'
      });
      
      // Gas
      costiToInsert.push({
        tipo: 'gas',
        fornitore: 'ASM Pavia',
        costo_fisso: 12.30,
        costo_variabile: 0.95,
        unita_misura: 'Smc',
        data_aggiornamento: new Date().toISOString().split('T')[0],
        note: 'Riscaldamento capannone'
      });
      
      // Acqua
      costiToInsert.push({
        tipo: 'acqua',
        fornitore: 'Pavia Acque',
        costo_fisso: 8.90,
        costo_variabile: 2.80,
        unita_misura: 'm³',
        data_aggiornamento: new Date().toISOString().split('T')[0]
      });
      
      // TARI
      costiToInsert.push({
        tipo: 'tari',
        fornitore: 'Comune di Pavia',
        costo_fisso: 450,
        costo_variabile: 0,
        unita_misura: 'anno',
        data_aggiornamento: new Date().toISOString().split('T')[0],
        note: 'Tassa rifiuti annuale'
      });
      
      // IMU
      costiToInsert.push({
        tipo: 'imu',
        fornitore: 'Comune di Pavia',
        costo_fisso: 1200,
        costo_variabile: 0,
        unita_misura: 'anno',
        data_aggiornamento: new Date().toISOString().split('T')[0],
        note: 'Imposta municipale unica'
      });
      
      // Mutuo
      costiToInsert.push({
        tipo: 'mutuo',
        fornitore: 'Banca Intesa',
        costo_fisso: 1850,
        costo_variabile: 0,
        unita_misura: 'mese',
        data_aggiornamento: new Date().toISOString().split('T')[0],
        note: 'Mutuo capannone 20 anni'
      });
      
      // Pulizia
      costiToInsert.push({
        tipo: 'pulizia',
        fornitore: 'Servizi Pulizie SRL',
        costo_fisso: 350,
        costo_variabile: 0,
        unita_misura: 'mese',
        data_aggiornamento: new Date().toISOString().split('T')[0],
        note: 'Pulizia settimanale'
      });
      
      // Assicurazione
      costiToInsert.push({
        tipo: 'assicurazione',
        fornitore: 'Generali',
        costo_fisso: 180,
        costo_variabile: 0,
        unita_misura: 'mese',
        data_aggiornamento: new Date().toISOString().split('T')[0],
        note: 'RC + incendio + furto'
      });
      
      // Imprevisti
      costiToInsert.push({
        tipo: 'imprevisti',
        fornitore: 'Fondo imprevisti',
        costo_fisso: 500,
        costo_variabile: 0,
        unita_misura: 'mese',
        data_aggiornamento: new Date().toISOString().split('T')[0],
        note: 'Accantonamento mensile'
      });
      
      const { error } = await supabase
        .from('costi_utenze')
        .insert(costiToInsert);
      
      if (error) throw error;
      toast.success('Costi utenze inizializzati');
    } catch (error) {
      console.error('Errore nell\'inizializzazione dei costi:', error);
      toast.error('Errore nell\'inizializzazione dei costi');
    }
  };

  const handleEdit = (utenza: CostoUtenza) => {
    setEditingId(utenza.id);
    setEditValues({
      costo_fisso: utenza.costo_fisso,
      costo_variabile: utenza.costo_variabile,
      note: utenza.note
    });
  };

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('costi_utenze')
        .update({
          costo_fisso: editValues.costo_fisso,
          costo_variabile: editValues.costo_variabile,
          data_aggiornamento: new Date().toISOString().split('T')[0],
          note: editValues.note
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Costi aggiornati con successo');
      setEditingId(null);
      fetchCostiUtenze();
    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error);
      toast.error('Errore nell\'aggiornamento');
    }
  };

  const handleAddUtenza = async () => {
    if (!newUtenza.fornitore) {
      toast.error('Il fornitore è obbligatorio');
      return;
    }

    try {
      const { error } = await supabase
        .from('costi_utenze')
        .insert([{
          tipo: newUtenza.tipo,
          fornitore: newUtenza.fornitore,
          costo_fisso: newUtenza.costo_fisso,
          costo_variabile: newUtenza.costo_variabile,
          unita_misura: newUtenza.unita_misura,
          data_aggiornamento: new Date().toISOString().split('T')[0],
          note: newUtenza.note
        }]);

      if (error) throw error;
      
      toast.success('Utenza aggiunta con successo');
      setNewUtenza({
        tipo: 'elettricita',
        fornitore: '',
        costo_fisso: 0,
        costo_variabile: 0,
        unita_misura: 'kWh',
        note: ''
      });
      setShowAddForm(false);
      fetchCostiUtenze();
    } catch (error) {
      console.error('Errore nell\'aggiunta dell\'utenza:', error);
      toast.error('Errore nell\'aggiunta dell\'utenza');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa utenza?')) return;

    try {
      const { error } = await supabase
        .from('costi_utenze')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Utenza eliminata con successo');
      fetchCostiUtenze();
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'utenza:', error);
      toast.error('Errore nell\'eliminazione');
    }
  };

  const handleFornitoreSelect = (fornitore: string) => {
    const tipoAttuale = newUtenza.tipo;
    const fornitoriDelTipo = fornitoriLocali[tipoAttuale];
    const fornitoreSelezionato = fornitoriDelTipo.find(f => f.nome === fornitore);
    
    if (fornitoreSelezionato) {
      setNewUtenza(prev => ({
        ...prev,
        fornitore,
        costo_fisso: fornitoreSelezionato.costo_fisso,
        costo_variabile: fornitoreSelezionato.costo_variabile,
        unita_misura: fornitoreSelezionato.unita
      }));
    }
  };

  const handleTipoChange = (tipo: any) => {
    setNewUtenza(prev => {
      const nuovoTipo = tipo as 'elettricita' | 'acqua' | 'gas' | 'tari' | 'imu' | 'pulizia' | 'assicurazione' | 'mutuo' | 'imprevisti';
      const fornitoriDelTipo = fornitoriLocali[nuovoTipo];
      const primoFornitore = fornitoriDelTipo[0];
      
      return {
        ...prev,
        tipo: nuovoTipo,
        fornitore: '',
        costo_fisso: 0,
        costo_variabile: 0,
        unita_misura: primoFornitore?.unita || ''
      };
    });
  };

  const getTotaleMensile = () => {
    return costiUtenze.reduce((sum, utenza) => {
      // Converti costi annuali in mensili
      const fattore = utenza.unita_misura === 'anno' ? 1/12 : 1;
      return sum + (utenza.costo_fisso * fattore);
    }, 0);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'elettricita': return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'acqua': return <Droplet className="h-5 w-5 text-blue-500" />;
      case 'gas': return <Flame className="h-5 w-5 text-orange-500" />;
      default: return <Home className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      elettricita: 'Elettricità',
      acqua: 'Acqua',
      gas: 'Gas',
      tari: 'TARI',
      imu: 'IMU',
      pulizia: 'Pulizia',
      assicurazione: 'Assicurazione',
      mutuo: 'Mutuo Capannone',
      imprevisti: 'Fondo Imprevisti'
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!permissions.canModifyUtenze) {
    return (
      <div className="text-center py-12">
        <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accesso Limitato</h3>
        <p className="text-gray-500">Non hai i permessi per visualizzare questa sezione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Costi Utenze e Capannone</h1>
          <p className="mt-2 text-gray-600">Gestisci i costi fissi e variabili di utenze e immobili</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Aggiungi Utenza
        </button>
      </div>

      {/* Form Aggiungi Utenza */}
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
                Aggiungi Nuova Utenza
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Utenza *
                  </label>
                  <select
                    id="tipo"
                    value={newUtenza.tipo}
                    onChange={(e) => handleTipoChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="elettricita">Elettricità</option>
                    <option value="gas">Gas</option>
                    <option value="acqua">Acqua</option>
                    <option value="tari">TARI</option>
                    <option value="imu">IMU</option>
                    <option value="mutuo">Mutuo Capannone</option>
                    <option value="pulizia">Pulizia</option>
                    <option value="assicurazione">Assicurazione</option>
                    <option value="imprevisti">Fondo Imprevisti</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="fornitore" className="block text-sm font-medium text-gray-700 mb-1">
                    Fornitore *
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="fornitore_select"
                      onChange={(e) => handleFornitoreSelect(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleziona o inserisci manualmente</option>
                      {fornitoriLocali[newUtenza.tipo]?.map(f => (
                        <option key={f.nome} value={f.nome}>{f.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="fornitore_input" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Fornitore *
                  </label>
                  <input
                    type="text"
                    id="fornitore_input"
                    value={newUtenza.fornitore}
                    onChange={(e) => setNewUtenza(prev => ({ ...prev, fornitore: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome fornitore"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="costo_fisso" className="block text-sm font-medium text-gray-700 mb-1">
                    Costo Fisso (€) *
                  </label>
                  <input
                    type="number"
                    id="costo_fisso"
                    value={newUtenza.costo_fisso}
                    onChange={(e) => setNewUtenza(prev => ({ ...prev, costo_fisso: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="costo_variabile" className="block text-sm font-medium text-gray-700 mb-1">
                    Costo Variabile (€) *
                  </label>
                  <input
                    type="number"
                    id="costo_variabile"
                    value={newUtenza.costo_variabile}
                    onChange={(e) => setNewUtenza(prev => ({ ...prev, costo_variabile: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.0001"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="unita_misura" className="block text-sm font-medium text-gray-700 mb-1">
                    Unità di Misura *
                  </label>
                  <input
                    type="text"
                    id="unita_misura"
                    value={newUtenza.unita_misura}
                    onChange={(e) => setNewUtenza(prev => ({ ...prev, unita_misura: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="kWh, Smc, m³, ecc."
                    required
                  />
                </div>
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <input
                    type="text"
                    id="note"
                    value={newUtenza.note}
                    onChange={(e) => setNewUtenza(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Note aggiuntive"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors mr-2"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAddUtenza}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Aggiungi
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Riepilogo Totale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Costo Totale Mensile</p>
            <p className="text-3xl font-bold text-blue-900">
              €{getTotaleMensile().toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {costiUtenze.length} utenze/costi fissi
            </p>
          </div>
          <div className="p-4 bg-blue-600 rounded-full">
            <Home className="h-8 w-8 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Lista Utenze */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Utenze e Costi Fissi
            </h3>
            <HelpTooltip content="Gestisci i costi fissi e variabili di utenze, capannone e altri servizi" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornitore
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo Fisso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo Variabile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {costiUtenze.map((utenza, index) => (
                <motion.tr
                  key={utenza.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTipoIcon(utenza.tipo)}
                      <div className="ml-3 text-sm font-medium text-gray-900">
                        {getTipoLabel(utenza.tipo)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {utenza.fornitore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === utenza.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editValues.costo_fisso}
                        onChange={(e) => setEditValues(prev => ({ ...prev, costo_fisso: parseFloat(e.target.value) || 0 }))}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        €{utenza.costo_fisso.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        <span className="text-xs text-gray-500 ml-1">
                          /{utenza.unita_misura === 'anno' ? 'anno' : 'mese'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === utenza.id ? (
                      <input
                        type="number"
                        step="0.0001"
                        value={editValues.costo_variabile}
                        onChange={(e) => setEditValues(prev => ({ ...prev, costo_variabile: parseFloat(e.target.value) || 0 }))}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {utenza.costo_variabile > 0 ? (
                          <>
                            €{utenza.costo_variabile.toLocaleString('it-IT', { minimumFractionDigits: utenza.costo_variabile < 1 ? 4 : 2 })}
                            <span className="text-xs text-gray-500 ml-1">/{utenza.unita_misura}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === utenza.id ? (
                      <input
                        type="text"
                        value={editValues.note || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, note: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-sm text-gray-500">
                        {utenza.note || '-'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === utenza.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSave(utenza.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Salva
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Annulla
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(utenza)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifica costi"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(utenza.id)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Elimina utenza"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informazioni aggiuntive */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Home className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-blue-800">Informazioni Utenze</h3>
        </div>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• I costi fissi sono mensili o annuali a seconda dell'utenza</p>
          <p>• I costi variabili sono per unità di consumo (kWh, Smc, m³, ecc.)</p>
          <p>• Il mutuo del capannone è incluso nei costi fissi mensili</p>
          <p>• Il fondo imprevisti è un accantonamento mensile per spese non programmate</p>
        </div>
      </div>
    </div>
  );
};

export default CostiUtenze;