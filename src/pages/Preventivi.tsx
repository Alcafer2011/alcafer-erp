import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, FileText, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Preventivo } from '../types/database';
import PreventivoModal from '../components/PreventivoModal';

const Preventivi: React.FC = () => {
  const [preventivi, setPreventivi] = useState<Preventivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPreventivo, setSelectedPreventivo] = useState<Preventivo | null>(null);

  useEffect(() => {
    fetchPreventivi();
  }, []);

  const fetchPreventivi = async () => {
    try {
      const { data, error } = await supabase
        .from('preventivi')
        .select(`
          *,
          cliente:clienti(*)
        `)
        .order('id', { ascending: false });

      if (error) throw error;
      setPreventivi(data || []);
    } catch (error) {
      console.error('Errore nel caricamento dei preventivi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo preventivo?')) return;

    try {
      const { error } = await supabase
        .from('preventivi')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPreventivi();
    } catch (error) {
      console.error('Errore nell\'eliminazione del preventivo:', error);
      alert('Errore nell\'eliminazione del preventivo');
    }
  };

  const handleEdit = (preventivo: Preventivo) => {
    setSelectedPreventivo(preventivo);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedPreventivo(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedPreventivo(null);
    fetchPreventivi();
  };

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'approvato':
        return 'bg-green-100 text-green-800';
      case 'rifiutato':
        return 'bg-red-100 text-red-800';
      case 'in_attesa':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Preventivi</h1>
          <p className="mt-2 text-gray-600">Gestisci i tuoi preventivi</p>
        </div>
        <button onClick={handleNew} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuovo Preventivo
        </button>
      </div>

      <div className="card">
        {preventivi.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun preventivo</h3>
            <p className="mt-1 text-sm text-gray-500">Inizia creando il tuo primo preventivo.</p>
            <div className="mt-6">
              <button onClick={handleNew} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Preventivo
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preventivi.map((preventivo) => (
                  <tr key={preventivo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <div className="text-sm font-medium text-gray-900">
                          {preventivo.cliente?.nome || 'Cliente non specificato'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {preventivo.importo ? `€${preventivo.importo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatoColor(preventivo.stato || 'bozza')}`}>
                        {preventivo.stato || 'bozza'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {preventivo.file_path ? (
                        <span className="text-primary-600">File presente</span>
                      ) : (
                        <span className="text-gray-400">Nessun file</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(preventivo)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(preventivo.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <PreventivoModal
          preventivo={selectedPreventivo}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Preventivi;