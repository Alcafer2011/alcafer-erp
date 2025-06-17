import React, { useState, useEffect } from 'react';
import { UserCog, Shield, Eye, EyeOff, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import toast from 'react-hot-toast';

interface UserPermissions {
  canModifyPreventivi: boolean;
  canModifyLavori: boolean;
  canModifyCostiMateriali: boolean;
  canViewFinancials: boolean;
  canModifyTaxes: boolean;
  canModifyLeasing: boolean;
  canModifyManovalanza: boolean;
  canViewFornitori: boolean;
  canModifyFornitori: boolean;
  canModifyMovimentiContabili: boolean;
  canViewAuditLog: boolean;
}

interface UserConfig {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo: 'alessandro' | 'gabriel' | 'hanna';
  attivo: boolean;
  permissions: UserPermissions;
  lastLogin?: string;
  loginCount: number;
}

const Utenti: React.FC = () => {
  const { userProfile } = useAuth();
  const permissions = usePermissions();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserConfig[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    initializeUsers();
  }, []);

  const initializeUsers = () => {
    // Precompila i tre utenti con configurazioni di default
    const defaultUsers: UserConfig[] = [
      {
        id: 'alessandro-id',
        nome: 'Alessandro',
        cognome: 'Calabria',
        email: 'alessandro@alcafer.com',
        ruolo: 'alessandro',
        attivo: true,
        permissions: {
          canModifyPreventivi: true,
          canModifyLavori: true,
          canModifyCostiMateriali: true,
          canViewFinancials: true,
          canModifyTaxes: true,
          canModifyLeasing: true,
          canModifyManovalanza: true,
          canViewFornitori: true,
          canModifyFornitori: true,
          canModifyMovimentiContabili: true,
          canViewAuditLog: true,
        },
        lastLogin: new Date().toISOString(),
        loginCount: 156
      },
      {
        id: 'gabriel-id',
        nome: 'Gabriel',
        cognome: 'Prunaru',
        email: 'gabriel@alcafer.com',
        ruolo: 'gabriel',
        attivo: true,
        permissions: {
          canModifyPreventivi: true,
          canModifyLavori: true,
          canModifyCostiMateriali: true,
          canViewFinancials: false,
          canModifyTaxes: false,
          canModifyLeasing: false,
          canModifyManovalanza: false,
          canViewFornitori: true,
          canModifyFornitori: false,
          canModifyMovimentiContabili: false,
          canViewAuditLog: false,
        },
        lastLogin: '2024-12-16T14:30:00Z',
        loginCount: 89
      },
      {
        id: 'hanna-id',
        nome: 'Hanna',
        cognome: 'Mazhar',
        email: 'hanna@alcafer.com',
        ruolo: 'hanna',
        attivo: true,
        permissions: {
          canModifyPreventivi: false,
          canModifyLavori: false,
          canModifyCostiMateriali: false,
          canViewFinancials: true,
          canModifyTaxes: false,
          canModifyLeasing: false,
          canModifyManovalanza: false,
          canViewFornitori: false,
          canModifyFornitori: false,
          canModifyMovimentiContabili: true,
          canViewAuditLog: false,
        },
        lastLogin: '2024-12-15T09:15:00Z',
        loginCount: 67
      }
    ];

    setUsers(defaultUsers);
  };

  const handlePermissionChange = (userId: string, permission: keyof UserPermissions, value: boolean) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            permissions: { 
              ...user.permissions, 
              [permission]: value 
            } 
          }
        : user
    ));
    setHasChanges(true);
  };

  const handleUserStatusChange = (userId: string, attivo: boolean) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, attivo } : user
    ));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    setLoading(true);
    try {
      // Simula salvataggio nel database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In produzione, qui salveresti le configurazioni nel database
      localStorage.setItem('userPermissions', JSON.stringify(users));
      
      toast.success('Configurazioni utenti salvate con successo');
      setHasChanges(false);
    } catch (error) {
      toast.error('Errore nel salvataggio delle configurazioni');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Sei sicuro di voler ripristinare le configurazioni di default? Tutte le modifiche non salvate andranno perse.')) {
      initializeUsers();
      setHasChanges(false);
      toast.success('Configurazioni ripristinate ai valori di default');
    }
  };

  const getPermissionLabel = (permission: keyof UserPermissions): string => {
    const labels: Record<keyof UserPermissions, string> = {
      canModifyPreventivi: 'Gestire Preventivi',
      canModifyLavori: 'Gestire Lavori',
      canModifyCostiMateriali: 'Gestire Materiali',
      canViewFinancials: 'Visualizzare Dati Finanziari',
      canModifyTaxes: 'Gestire Tasse e IVA',
      canModifyLeasing: 'Gestire Leasing',
      canModifyManovalanza: 'Gestire Manovalanza',
      canViewFornitori: 'Visualizzare Fornitori',
      canModifyFornitori: 'Gestire Fornitori',
      canModifyMovimentiContabili: 'Gestire Movimenti Contabili',
      canViewAuditLog: 'Visualizzare Log Audit',
    };
    return labels[permission];
  };

  const getRoleColor = (ruolo: string) => {
    switch (ruolo) {
      case 'alessandro': return 'bg-red-100 text-red-800';
      case 'gabriel': return 'bg-blue-100 text-blue-800';
      case 'hanna': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (ruolo: string) => {
    switch (ruolo) {
      case 'alessandro': return 'Amministratore';
      case 'gabriel': return 'Operatore';
      case 'hanna': return 'Contabilità';
      default: return 'Utente';
    }
  };

  if (!permissions.canViewUsers) {
    return (
      <div className="text-center py-12">
        <UserCog className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accesso Negato</h3>
        <p className="text-gray-500">Non hai i permessi per visualizzare questa sezione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Utenti</h1>
          <p className="mt-2 text-gray-600">Configura permessi e accessi per ogni utente del sistema</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={resetToDefaults}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Default
          </button>
          
          <button
            onClick={saveChanges}
            disabled={!hasChanges || loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
            {loading ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800 font-medium">Modifiche non salvate</p>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Hai modifiche in sospeso. Ricordati di salvare prima di uscire dalla pagina.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Header Utente */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {user.nome.charAt(0)}{user.cognome.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.nome} {user.cognome}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.ruolo)}`}>
                    {getRoleLabel(user.ruolo)}
                  </span>
                </div>
              </div>

              {/* Statistiche Utente */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Ultimo Accesso</p>
                  <p className="font-medium text-gray-900">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('it-IT') : 'Mai'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Accessi Totali</p>
                  <p className="font-medium text-gray-900">{user.loginCount}</p>
                </div>
              </div>

              {/* Stato Utente */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Stato Account</span>
                <button
                  onClick={() => handleUserStatusChange(user.id, !user.attivo)}
                  disabled={user.ruolo === 'alessandro'} // Alessandro non può essere disattivato
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    user.attivo ? 'bg-green-600' : 'bg-gray-200'
                  } ${user.ruolo === 'alessandro' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      user.attivo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Permessi */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900">Permessi</h4>
                <HelpTooltip content="Configura cosa può vedere e modificare questo utente" />
              </div>

              <div className="space-y-3">
                {Object.entries(user.permissions).map(([permission, enabled]) => (
                  <div key={permission} className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 cursor-pointer">
                      {getPermissionLabel(permission as keyof UserPermissions)}
                    </label>
                    <button
                      onClick={() => handlePermissionChange(user.id, permission as keyof UserPermissions, !enabled)}
                      disabled={user.ruolo === 'alessandro'} // Alessandro ha sempre tutti i permessi
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        enabled ? 'bg-blue-600' : 'bg-gray-200'
                      } ${user.ruolo === 'alessandro' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {user.ruolo === 'alessandro' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <p className="text-xs text-red-800 font-medium">Amministratore</p>
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    L'amministratore ha sempre accesso completo a tutte le funzionalità.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Riepilogo Permessi */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Permessi per Funzionalità</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funzionalità
                </th>
                {users.map(user => (
                  <th key={user.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {user.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.keys(users[0].permissions).map((permission) => (
                <tr key={permission}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getPermissionLabel(permission as keyof UserPermissions)}
                  </td>
                  {users.map(user => (
                    <td key={user.id} className="px-6 py-4 whitespace-nowrap text-center">
                      {user.permissions[permission as keyof UserPermissions] ? (
                        <Eye className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Utenti;