import React, { useState, useEffect } from 'react';
import { X, Building2, Mail, Phone, MapPin, CreditCard, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import HelpTooltip from '../common/HelpTooltip';
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
}

interface FornitoreModalProps {
  fornitore: Fornitore | null;
  onClose: () => void;
}

const FornitoreModal: React.FC<FornitoreModalProps> = ({ fornitore, onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefono: '',
    indirizzo: '',
    partita_iva: '',
    codice_fiscale: '',
    tipo_fornitore: 'materiali',
    settore_merceologico: '',
    condizioni_pagamento: '30 giorni',
    sconto_standard: 0,
    valutazione: 3,
    note: '',
    attivo: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (fornitore) {
      setFormData({
        nome: fornitore.nome || '',
        email: fornitore.email || '',
        telefono: fornitore.telefono || '',
        indirizzo: fornitore.indirizzo || '',
        partita_iva: fornitore.partita_iva || '',
        codice_fiscale: fornitore.codice_fiscale || '',
        tipo_fornitore: fornitore.tipo_fornitore || 'materiali',
        settore_merceologico: fornitore.settore_merceologico || '',
        condizioni_pagamento: fornitore.condizioni_pagamento || '30 giorni',
        sconto_standard: fornitore.sconto_standard || 0,
        valutazione: fornitore.valutazione || 3,
        note: fornitore.note || '',
        attivo: fornitore.attivo ?? true,
      });
    }
  }, [fornitore]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Il nome è obbligatorio';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Inserisci un\'email valida';
    }

    if (formData.partita_iva && formData.partita_iva.length !== 11) {
      newErrors.partita_iva = 'La partita IVA deve essere di 11 cifre';
    }

    if (formData.sconto_standard < 0 || formData.sconto_standard > 100) {
      newErrors.sconto_standard = 'Lo sconto deve essere tra 0 e 100%';
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
      // Simula salvataggio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (fornitore) {
        toast.success('Fornitore aggiornato con successo');
      } else {
        toast.success('Fornitore creato con successo');
      }

      onClose();
    } catch (error: any) {
      console.error('Errore nel salvataggio del fornitore:', error);
      toast.error('Errore nel salvataggio del fornitore');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'number') {
      processedValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Rimuovi l'errore quando l'utente inizia a digitare
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const renderStars = (rating: number, onChange: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className="focus:outline-none"
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
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
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {fornitore ? 'Modifica Fornitore' : 'Nuovo Fornitore'}
              </h3>
              <p className="text-sm text-gray-500">
                {fornitore ? 'Aggiorna le informazioni del fornitore' : 'Inserisci i dati del nuovo fornitore'}
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
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  Nome Fornitore *
                </label>
                <HelpTooltip content="Nome completo o ragione sociale del fornitore" />
              </div>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.nome ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Inserisci il nome del fornitore"
                />
              </div>
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="tipo_fornitore" className="block text-sm font-medium text-gray-700">
                  Tipo Fornitore *
                </label>
                <HelpTooltip content="Categoria principale del fornitore" />
              </div>
              <select
                id="tipo_fornitore"
                name="tipo_fornitore"
                value={formData.tipo_fornitore}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
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

          {/* Contatti */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <HelpTooltip content="Indirizzo email principale per le comunicazioni" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="fornitore@esempio.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                  Telefono
                </label>
                <HelpTooltip content="Numero di telefono per contatti diretti" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+39 123 456 7890"
                />
              </div>
            </div>
          </div>

          {/* Indirizzo */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="indirizzo" className="block text-sm font-medium text-gray-700">
                Indirizzo
              </label>
              <HelpTooltip content="Indirizzo completo del fornitore" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                id="indirizzo"
                name="indirizzo"
                rows={2}
                value={formData.indirizzo}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Via, Città, CAP, Provincia"
              />
            </div>
          </div>

          {/* Dati Fiscali */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="partita_iva" className="block text-sm font-medium text-gray-700">
                  Partita IVA
                </label>
                <HelpTooltip content="Partita IVA del fornitore (11 cifre)" />
              </div>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="partita_iva"
                  name="partita_iva"
                  value={formData.partita_iva}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.partita_iva ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="12345678901"
                  maxLength={11}
                />
              </div>
              {errors.partita_iva && (
                <p className="mt-1 text-sm text-red-600">{errors.partita_iva}</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="codice_fiscale" className="block text-sm font-medium text-gray-700">
                  Codice Fiscale
                </label>
                <HelpTooltip content="Codice fiscale del fornitore" />
              </div>
              <input
                type="text"
                id="codice_fiscale"
                name="codice_fiscale"
                value={formData.codice_fiscale}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="RSSMRA80A01H501U"
                maxLength={16}
              />
            </div>
          </div>

          {/* Settore e Condizioni */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="settore_merceologico" className="block text-sm font-medium text-gray-700">
                  Settore Merceologico
                </label>
                <HelpTooltip content="Settore di specializzazione del fornitore" />
              </div>
              <input
                type="text"
                id="settore_merceologico"
                name="settore_merceologico"
                value={formData.settore_merceologico}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="es. Acciai e leghe metalliche"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="condizioni_pagamento" className="block text-sm font-medium text-gray-700">
                  Condizioni di Pagamento
                </label>
                <HelpTooltip content="Termini di pagamento concordati" />
              </div>
              <select
                id="condizioni_pagamento"
                name="condizioni_pagamento"
                value={formData.condizioni_pagamento}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="15 giorni">15 giorni</option>
                <option value="30 giorni">30 giorni</option>
                <option value="60 giorni">60 giorni</option>
                <option value="90 giorni">90 giorni</option>
                <option value="Pagamento immediato">Pagamento immediato</option>
                <option value="Altro">Altro</option>
              </select>
            </div>
          </div>

          {/* Sconto e Valutazione */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="sconto_standard" className="block text-sm font-medium text-gray-700">
                  Sconto Standard (%)
                </label>
                <HelpTooltip content="Percentuale di sconto standard applicata" />
              </div>
              <input
                type="number"
                id="sconto_standard"
                name="sconto_standard"
                min="0"
                max="100"
                step="0.1"
                value={formData.sconto_standard}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.sconto_standard ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.sconto_standard && (
                <p className="mt-1 text-sm text-red-600">{errors.sconto_standard}</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Valutazione
                </label>
                <HelpTooltip content="Valutazione del fornitore da 1 a 5 stelle" />
              </div>
              <div className="flex items-center gap-2">
                {renderStars(formData.valutazione, (rating) => 
                  setFormData(prev => ({ ...prev, valutazione: rating }))
                )}
                <span className="text-sm text-gray-600 ml-2">
                  ({formData.valutazione}/5)
                </span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                Note
              </label>
              <HelpTooltip content="Note aggiuntive sul fornitore" />
            </div>
            <textarea
              id="note"
              name="note"
              rows={3}
              value={formData.note}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Note aggiuntive..."
            />
          </div>

          {/* Stato Attivo */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="attivo"
              name="attivo"
              checked={formData.attivo}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="attivo" className="text-sm font-medium text-gray-700">
              Fornitore attivo
            </label>
            <HelpTooltip content="Disattiva per nascondere il fornitore dalle liste" />
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
                fornitore ? 'Aggiorna Fornitore' : 'Crea Fornitore'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default FornitoreModal;