import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Cliente } from '../types/database';
import ClienteModal from '../components/ClienteModal';

const Clienti: React.FC = () => {
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    fetchClienti();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return;

    try {
      const { error } = await supabase
        .from('clienti')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchClienti();
    } catch (error) {
      console.error('Errore nell\'eliminazione del cliente:', error);
      alert('Errore nell\'eliminazione del cliente');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clienti</h1>
          <p className="mt-2 text-gray-600">Gestisci i tuoi clienti</p>
        </div>
        <button onClick={handleNew} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuovo Cliente
        </button>
      </div>

      <div className="card">
        {clienti.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun cliente</h3>
            <p className="mt-1 text-sm text-gray-500">Inizia aggiungendo il tuo primo cliente.</p>
            <div className="mt-6">
              <button onClick={handleNew} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Cliente
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Creazione
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clienti.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-2" />
                        {cliente.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('it-IT') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
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
        <ClienteModal
          cliente={selectedCliente}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Clienti;