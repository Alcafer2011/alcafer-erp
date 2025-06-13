import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Preventivo, Cliente } from '../types/database';

interface PreventivoModalProps {
  preventivo: Preventivo | null;
  onClose: () => void;
}

const PreventivoModal: React.FC<PreventivoModalProps> = ({ preventivo, onClose }) => {
  const [formData, setFormData] = useState({
    cliente_id: '',
    importo: '',
    stato: 'bozza',
    file_path: '',
  });
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClienti();
    
    if (preventivo) {
      setFormData({
        cliente_id: preventivo.cliente_id || '',
        importo: preventivo.importo?.toString() || '',
        stato: preventivo.stato || 'bozza',
        file_path: preventivo.file_path || '',
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        cliente_id: formData.cliente_id || null,
        importo: formData.importo ? parseFloat(formData.importo) : null,
        stato: formData.stato,
        file_path: formData.file_path || null,
      };

      if (preventivo) {
        // Aggiorna preventivo esistente
        const { error } = await supabase
          .from('preventivi')
          .update(dataToSave)
          .eq('id', preventivo.id);

        if (error) throw error;
      } else {
        // Crea nuovo preventivo
        const { error } = await supabase
          .from('preventivi')
          .insert([dataToSave]);

        if (error) throw error;
      }

      onClose();
    } catch (error) {
      console.error('Errore nel salvataggio del preventivo:', error);
      alert('Errore nel salvataggio del preventivo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {preventivo ? 'Modifica Preventivo' : 'Nuovo Preventivo'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="cliente_id" className="block text-sm font-medium text-gray-700">
                  Cliente
                </label>
                <select
                  id="cliente_id"
                  name="cliente_id"
                  value={formData.cliente_id}
                  onChange={handleChange}
                  className="input-field mt-1"
                >
                  <option value="">Seleziona un cliente</option>
                  {clienti.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="importo" className="block text-sm font-medium text-gray-700">
                  Importo (€)
                </label>
                <input
                  type="number"
                  id="importo"
                  name="importo"
                  step="0.01"
                  min="0"
                  value={formData.importo}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="stato" className="block text-sm font-medium text-gray-700">
                  Stato
                </label>
                <select
                  id="stato"
                  name="stato"
                  value={formData.stato}
                  onChange={handleChange}
                  className="input-field mt-1"
                >
                  <option value="bozza">Bozza</option>
                  <option value="in_attesa">In Attesa</option>
                  <option value="approvato">Approvato</option>
                  <option value="rifiutato">Rifiutato</option>
                </select>
              </div>

              <div>
                <label htmlFor="file_path" className="block text-sm font-medium text-gray-700">
                  Percorso File
                </label>
                <input
                  type="text"
                  id="file_path"
                  name="file_path"
                  value={formData.file_path}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Percorso del file del preventivo"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Annulla
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Salvataggio...' : 'Salva'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreventivoModal;