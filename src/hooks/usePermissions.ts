import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { userProfile } = useAuth();

  const permissions = {
    // Alessandro - Amministratore completo
    canModifyAll: userProfile?.ruolo === 'alessandro',
    
    // Gabriel - Permessi limitati
    canModifyPreventivi: userProfile?.ruolo === 'alessandro' || userProfile?.ruolo === 'gabriel',
    canModifyLavori: userProfile?.ruolo === 'alessandro' || userProfile?.ruolo === 'gabriel',
    canModifyCostiMateriali: userProfile?.ruolo === 'alessandro' || userProfile?.ruolo === 'gabriel',
    
    // Hanna - Amministrazione e contabilità
    canViewFinancials: userProfile?.ruolo === 'alessandro' || userProfile?.ruolo === 'hanna',
    canViewReports: userProfile?.ruolo === 'alessandro' || userProfile?.ruolo === 'hanna',
    canViewAllOrders: userProfile?.ruolo === 'alessandro' || userProfile?.ruolo === 'hanna',
    
    // Solo Alessandro
    canModifyLeasing: userProfile?.ruolo === 'alessandro',
    canModifyManovalanza: userProfile?.ruolo === 'alessandro',
    canModifyTaxes: userProfile?.ruolo === 'alessandro',
    
    // Visualizzazione generale
    canViewDashboard: true,
    canViewClienti: true,
  };

  return permissions;
};