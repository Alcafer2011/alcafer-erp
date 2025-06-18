import React, { useState, useEffect } from 'react';
import { X, Briefcase, User, DollarSign, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Lavoro, Cliente, Preventivo } from '../../types/database';
import HelpTooltip from '../common/HelpTooltip';
import toast from 'react-hot-toast';

interface LavoroModalProps {
  lavoro: Lavoro | null;
  onClose: () => void;
}

const LavoroModal: React.FC<LavoroModalProps> = ({ lavoro, onClose }) => {
  const [formData, setFormData] = useState({
    preventivo_id: '',
    descrizione: '',
    importo_totale: '',
    acconto_percentuale: '50',
    acconto_modalita: 'alcafer',
    stato: 'in_attesa',
    data_inizio: '',
    data_fine: '',
    ore_lavoro: '',
    ditta: 'alcafer',
    accordo_gabifer: '',
    importo_accordo_gabifer: '',
    macchinari_utilizzati: [] as string[],
  });
  const [preventivi, setPreventivi] = useState<Preventivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const macchinariDisponibili = [
    'Taglio laser',
    'Piegatrice',
    'Saldatrice TIG',
    'Saldatrice MIG',
    'Trapano a colonna',
    'Smerigliatrice',
    'Seghetto a nastro',
    'Tornio',
    'Fresa',
    'Plasma'
  ];

  useEffect(() => {
    fetchPreventivi();
    
    if (lavoro) {
      setFormData({
        preventivo_id: lavoro.preventivo_id || '',
        descrizione: lavoro.descrizione || '',
        importo_totale: lavoro.importo_totale?.toString() || '',
        acconto_percentuale: lavoro.acconto_percentuale?.toString() || '50',
        acconto_modalita: lavoro.acconto_modalita || 'alcafer',
        stato: lavoro.stato || 'in_attesa',
        data_inizio: lavoro.data_inizio || '',
        data_fine: lavoro.data_fine || '',
        ore_lavoro: lavoro.ore_lavoro?.toString() || '',
        ditta: lavoro.ditta || 'alcafer',
        accordo_gabifer: lavoro.accordo_gabifer || '',
        importo_accordo_gabifer: lavoro.importo_accordo_gabifer?.toString() || '',
        macchinari_utilizzati: lavoro.macchinari_utilizzati || [],
      });
    }
  }, [lavoro]);

  const fetchPreventivi = async () => {
    try {
      const { data, error } = await supabase
        .from('preventivi')
        .select('*, cliente:clienti(*)')
        .eq('stato', 'accettato')
        .order('numero_preventivo');

      if (error) throw error;
      setPreventivi(data || []);
    } catch (error) {
      console.error('Errore nel caricamento dei preventivi:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descrizione.trim()) {
      newErrors.descrizione = 'La descrizione è obbligatoria';
    }

    if (!formData.importo_totale || parseFloat(formData.importo_totale) <= 0) {
      newErrors.importo_totale = 'L\'importo deve essere maggiore di 0';
    }

    if (parseFloat(formData.acconto_percentuale) < 0 || parseFloat(formData.acconto_percentuale) > 100) {
      newErrors.acconto_percentuale = 'La percentuale deve essere tra 0 e 100';
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
        preventivo_id: formData.preventivo_id || null,
        descrizione: formData.descrizione.trim(),
        importo_totale: parseFloat(formData.importo_totale),
        acconto_percentuale: parseFloat(formData.acconto_percentuale),
        acconto_modalita: formData.acconto_modalita,
        stato: formData.stato,
        data_inizio: formData.data_inizio || null,
        data_fine: formData.data_fine || null,
        ore_lavoro: formData.ore_lavoro ? parseFloat(formData.ore_lavoro) : null,
        ditta: formData.ditta,
        accordo_gabifer: formData.accordo_gabifer || null,
        importo_accordo_gabifer: formData.importo_accordo_gabifer ? parseFloat(formData.importo_accordo_gabifer) : null,
        macchinari_utilizzati: formData.macchinari_utilizzati,
      };

      if (lavoro) {
        // Aggiorna lavoro esistente
        const { error } = await supabase
          .from('lavori')
          .update(dataToSave)
          .eq('id', lavoro.id);

        if (error) throw error;
        toast.success('Lavoro aggiornato con successo');
      } else {
        // Crea nuovo lavoro
        const { error } = await supabase
          .from('lavori')
          .insert([dataToSave]);

        if (error) throw error;
        toast.success('Lavoro creato con successo');
      }

      onClose();
    } catch (error: any) {
      console.error('Errore nel salvataggio del lavoro:', error);
      toast.error('Errore nel salvataggio del lavoro');
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

  const handleMacchinarioToggle = (macchinario: string) => {
    setFormData(prev => ({
      ...prev,
      macchinari_utilizzati: prev.macchinari_utilizzati.includes(macchinario)
        ? prev.macchinari_utilizzati.filter(m => m !== macchinario)
        : [...prev.macchinari_utilizzati, macchinario]
    }));
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
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {lavoro ? 'Modifica Lavoro' : 'Nuovo Lavoro'}
              </h3>
              <p className="text-sm text-gray-500">
                {lavoro ? 'Aggiorna le informazioni del lavoro' : 'Inserisci i dati del nuovo lavoro'}
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
          {/* Informazioni Base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="preventivo_id" className="block text-sm font-medium text-gray-700">
                  Preventivo di Riferimento
                </label>
                <HelpTooltip content="Seleziona il preventivo da cui deriva questo lavoro (opzionale)" />
              </div>
              <select
                id="preventivo_id"
                name="preventivo_id"
                value={formData.preventivo_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Nessun preventivo</option>
                {preventivi.map((preventivo) => (
                  <option key={preventivo.id} value={preventivo.id}>
                    {preventivo.numero_preventivo} - {preventivo.cliente?.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="ditta" className="block text-sm font-medium text-gray-700">
                  Ditta *
                </label>
                <HelpTooltip content="Seleziona quale ditta eseguirà il lavoro" />
              </div>
              <select
                id="ditta"
                name="ditta"
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
                Descrizione Lavoro *
              </label>
              <HelpTooltip content="Descrizione dettagliata del lavoro da eseguire" />
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
              placeholder="Descrivi il lavoro da eseguire..."
            />
            {errors.descrizione && (
              <p className="mt-1 text-sm text-red-600">{errors.descrizione}</p>
            )}
          </div>

          {/* Importi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="importo_totale" className="block text-sm font-medium text-gray-700">
                  Importo Totale (€) *
                </label>
                <HelpTooltip content="Importo totale del lavoro" />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  id="importo_totale"
                  name="importo_totale"
                  step="0.01"
                  min="0"
                  required
                  value={formData.importo_totale}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.importo_totale ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.importo_totale && (
                <p className="mt-1 text-sm text-red-600">{errors.importo_totale}</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="acconto_percentuale" className="block text-sm font-medium text-gray-700">
                  Acconto (%)
                </label>
                <HelpTooltip content="Percentuale di acconto richiesta" />
              </div>
              <input
                type="number"
                id="acconto_percentuale"
                name="acconto_percentuale"
                min="0"
                max="100"
                step="0.1"
                value={formData.acconto_percentuale}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.acconto_percentuale ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="50"
              />
              {errors.acconto_percentuale && (
                <p className="mt-1 text-sm text-red-600">{errors.acconto_percentuale}</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="acconto_modalita" className="block text-sm font-medium text-gray-700">
                  Modalità Acconto
                </label>
                <HelpTooltip content="Chi riceverà l'acconto" />
              </div>
              <select
                id="acconto_modalita"
                name="acconto_modalita"
                value={formData.acconto_modalita}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="alcafer">Alcafer</option>
                <option value="gabifer">Gabifer</option>
                <option value="diretto">Diretto Cliente</option>
              </select>
            </div>
          </div>

          {/* Date e Ore */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="data_inizio" className="block text-sm font-medium text-gray-700">
                  Data Inizio
                </label>
                <HelpTooltip content="Data di inizio prevista del lavoro" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  id="data_inizio"
                  name="data_inizio"
                  value={formData.data_inizio}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="data_fine" className="block text-sm font-medium text-gray-700">
                  Data Fine
                </label>
                <HelpTooltip content="Data di fine prevista del lavoro" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  id="data_fine"
                  name="data_fine"
                  value={formData.data_fine}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="ore_lavoro" className="block text-sm font-medium text-gray-700">
                  Ore di Lavoro
                </label>
                <HelpTooltip content="Ore totali stimate per il lavoro" />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  id="ore_lavoro"
                  name="ore_lavoro"
                  step="0.5"
                  min="0"
                  value={formData.ore_lavoro}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Stato */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="stato" className="block text-sm font-medium text-gray-700">
                Stato Lavoro
              </label>
              <HelpTooltip content="Stato attuale del lavoro" />
            </div>
            <select
              id="stato"
              name="stato"
              value={formData.stato}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="in_attesa">In Attesa</option>
              <option value="in_produzione">In Produzione</option>
              <option value="completato">Completato</option>
            </select>
          </div>

          {/* Accordo Gabifer */}
          {formData.ditta === 'alcafer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="accordo_gabifer" className="block text-sm font-medium text-gray-700">
                    Accordo Gabifer
                  </label>
                  <HelpTooltip content="Tipo di accordo con Gabifer per questo lavoro" />
                </div>
                <select
                  id="accordo_gabifer"
                  name="accordo_gabifer"
                  value={formData.accordo_gabifer}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Nessun accordo</option>
                  <option value="orario">Pagamento Orario</option>
                  <option value="tantum">Importo Fisso</option>
                </select>
              </div>

              {formData.accordo_gabifer && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label htmlFor="importo_accordo_gabifer" className="block text-sm font-medium text-gray-700">
                      {formData.accordo_gabifer === 'orario' ? 'Tariffa Oraria (€/h)' : 'Importo Fisso (€)'}
                    </label>
                    <HelpTooltip content={formData.accordo_gabifer === 'orario' ? 'Tariffa oraria per Gabifer' : 'Importo fisso per Gabifer'} />
                  </div>
                  <input
                    type="number"
                    id="importo_accordo_gabifer"
                    name="importo_accordo_gabifer"
                    step="0.01"
                    min="0"
                    value={formData.importo_accordo_gabifer}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          )}

          {/* Macchinari */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Macchinari Utilizzati
              </label>
              <HelpTooltip content="Seleziona i macchinari che verranno utilizzati per questo lavoro" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {macchinariDisponibili.map((macchinario) => (
                <label
                  key={macchinario}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.macchinari_utilizzati.includes(macchinario)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.macchinari_utilizzati.includes(macchinario)}
                    onChange={() => handleMacchinarioToggle(macchinario)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{macchinario}</span>
                </label>
              ))}
            </div>
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
                lavoro ? 'Aggiorna Lavoro' : 'Crea Lavoro'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LavoroModal;