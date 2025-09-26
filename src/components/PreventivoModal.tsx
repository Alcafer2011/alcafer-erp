import React, { useState, useEffect } from 'react';
import { X, FileText, Upload, User, DollarSign, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Preventivo, Cliente } from '../types/database';
import FileUpload from './common/FileUpload';
import HelpTooltip from './common/HelpTooltip';
import toast from 'react-hot-toast';

interface PreventivoModalProps {
  preventivo: Preventivo | null;
  onClose: () => void;
}

const PreventivoModal: React.FC<PreventivoModalProps> = ({ preventivo, onClose }) => {
  const [formData, setFormData] = useState({
    cliente_id: '',
    descrizione: '',
    importo: '',
    stato: 'bozza',
    file_path: '',
    data_creazione: new Date().toISOString().split('T')[0],
    data_scadenza: '',
    ditta: 'alcafer',
    note: ''
  });
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchClienti();
    
    if (preventivo) {
      setFormData({
        cliente_id: preventivo.cliente_id || '',
        descrizione: preventivo.descrizione || '',
        importo: preventivo.importo?.toString() || '',
        stato: preventivo.stato || 'bozza',
        file_path: preventivo.file_path || '',
        data_creazione: preventivo.data_creazione || new Date().toISOString().split('T')[0],
        data_scadenza: preventivo.data_scadenza || '',
        ditta: preventivo.ditta || 'alcafer',
        note: preventivo.note || ''
      });
    }
  }, [preventivo]);

  const fetchClienti = async () => {
    try {
      const { data, error } = await supabase
        .from('clienti')
        .select('*')
        .order('nome');

      if (error) throw error;
      setClienti(data || []);
    } catch (error) {
      console.error('Errore nel caricamento dei clienti:', error);
      toast.error('Errore nel caricamento dei clienti');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'Seleziona un cliente';
    }

    if (!formData.descrizione.trim()) {
      newErrors.descrizione = 'La descrizione è obbligatoria';
    }

    if (formData.importo && parseFloat(formData.importo) <= 0) {
      newErrors.importo = 'L\'importo deve essere maggiore di 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Correggi gli errori nel form');
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        cliente_id: formData.cliente_id || null,
        descrizione: formData.descrizione,
        importo: formData.importo ? parseFloat(formData.importo) : null,
        stato: formData.stato,
        file_path: formData.file_path || null,
        data_creazione: formData.data_creazione,
        data_scadenza: formData.data_scadenza || null,
        ditta: formData.ditta,
        note: formData.note || null
      };

      if (preventivo) {
        // Aggiorna preventivo esistente
        const { error } = await supabase
          .from('preventivi')
          .update(dataToSave)
          .eq('id', preventivo.id);

        if (error) throw error;
        toast.success('Preventivo aggiornato con successo');
      } else {
        // Crea nuovo preventivo
        const { error } = await supabase
          .from('preventivi')
          .insert([dataToSave]);

        if (error) throw error;
        toast.success('Preventivo creato con successo');
      }

      onClose();
    } catch (error) {
      console.error('Errore nel salvataggio del preventivo:', error);
      toast.error('Errore nel salvataggio del preventivo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Rimuovi l'errore quando l'utente inizia a digitare
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (files: any[]) => {
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, file_path: files[0].url }));
      setShowUpload(false);
      toast.success('File caricato con successo');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {preventivo ? 'Modifica Preventivo' : 'Nuovo Preventivo'}
              </h3>
              <p className="text-sm text-gray-500">
                {preventivo ? 'Aggiorna le informazioni del preventivo' : 'Inserisci i dati del nuovo preventivo'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cliente e Ditta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="cliente_id" className="block text-sm font-medium text-gray-700">
                  Cliente *
                </label>
                <HelpTooltip content="Seleziona il cliente per questo preventivo" />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="cliente_id"
                  name="cliente_id"
                  required
                  value={formData.cliente_id}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.cliente_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleziona un cliente</option>
                  {clienti.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>
              {errors.cliente_id && (
                <p className="mt-1 text-sm text-red-600">{errors.cliente_id}</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="ditta" className="block text-sm font-medium text-gray-700">
                  Ditta *
                </label>
                <HelpTooltip content="Seleziona quale ditta emetterà il preventivo" />
              </div>
              <select
                id="ditta"
                name="ditta"
                required
                value={formData.ditta}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="alcafer">Alcafer</option>
                <option value="gabifer">Gabifer</option>
              </select>
            </div>
          </div>

          {/* Descrizione */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">
                Descrizione *
              </label>
              <HelpTooltip content="Descrizione dettagliata del preventivo" />
            </div>
            <textarea
              id="descrizione"
              name="descrizione"
              rows={3}
              required
              value={formData.descrizione}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.descrizione ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Descrivi il lavoro preventivato..."
            />
            {errors.descrizione && (
              <p className="mt-1 text-sm text-red-600">{errors.descrizione}</p>
            )}
          </div>

          {/* Importo e Stato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="importo" className="block text-sm font-medium text-gray-700">
                  Importo (€)
                </label>
                <HelpTooltip content="Importo totale del preventivo" />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  id="importo"
                  name="importo"
                  step="0.01"
                  min="0"
                  value={formData.importo}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.importo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.importo && (
                <p className="mt-1 text-sm text-red-600">{errors.importo}</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="stato" className="block text-sm font-medium text-gray-700">
                  Stato
                </label>
                <HelpTooltip content="Stato attuale del preventivo" />
              </div>
              <select
                id="stato"
                name="stato"
                value={formData.stato}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bozza">Bozza</option>
                <option value="inviato">Inviato</option>
                <option value="accettato">Accettato</option>
                <option value="rifiutato">Rifiutato</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="data_creazione" className="block text-sm font-medium text-gray-700">
                  Data Creazione
                </label>
                <HelpTooltip content="Data di creazione del preventivo" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  id="data_creazione"
                  name="data_creazione"
                  value={formData.data_creazione}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="data_scadenza" className="block text-sm font-medium text-gray-700">
                  Data Scadenza
                </label>
                <HelpTooltip content="Data di scadenza del preventivo" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  id="data_scadenza"
                  name="data_scadenza"
                  value={formData.data_scadenza}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* File e Note */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label htmlFor="file_path" className="block text-sm font-medium text-gray-700">
                  File Preventivo
                </label>
                <HelpTooltip content="Carica il file PDF del preventivo" />
              </div>
              <button
                type="button"
                onClick={() => setShowUpload(!showUpload)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showUpload ? 'Nascondi' : 'Carica file'}
              </button>
            </div>
            
            {formData.file_path ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-800">
                    {formData.file_path.split('/').pop()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, file_path: '' }))}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {showUpload ? (
                  <FileUpload
                    onFilesUploaded={handleFileUpload}
                    acceptedTypes={['.pdf']}
                    maxFiles={1}
                    allowCamera={true}
                  />
                ) : (
                  <div className="text-center">
                    <p>Nessun file caricato</p>
                    <button
                      type="button"
                      onClick={() => setShowUpload(true)}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Carica PDF
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                Note
              </label>
              <HelpTooltip content="Note aggiuntive sul preventivo" />
            </div>
            <textarea
              id="note"
              name="note"
              rows={2}
              value={formData.note}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Note aggiuntive..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvataggio...
                </div>
              ) : (
                preventivo ? 'Aggiorna Preventivo' : 'Crea Preventivo'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PreventivoModal;
