import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, FileText, Briefcase, Settings, 
  Menu, X, LogOut, HelpCircle, ChevronDown, Calculator,
  TrendingUp, PieChart, Receipt, Wrench, UserCheck, Building2,
  Package, Truck, UserCog, Droplet, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);
  const { userProfile, switchUser } = useAuth();
  const permissions = usePermissions();

  const handleLogout = async () => {
    toast.success('Logout effettuato con successo');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const navigation = [
    {
      section: 'main',
      title: 'Principale',
      items: [
        { name: 'Dashboard', href: '/', icon: Home, show: true },
        { name: 'Home Finanziaria', href: '/home-finanziaria', icon: TrendingUp, show: permissions.canViewFinancials },
      ]
    },
    {
      section: 'gestione',
      title: 'Gestione',
      items: [
        { name: 'Clienti', href: '/clienti', icon: Users, show: true },
        { name: 'Preventivi', href: '/preventivi', icon: FileText, show: permissions.canModifyPreventivi },
        { name: 'Lavori', href: '/lavori', icon: Briefcase, show: permissions.canModifyLavori },
        { name: 'Fornitori', href: '/fornitori', icon: Truck, show: permissions.canViewFornitori },
      ]
    },
    {
      section: 'costi',
      title: 'Costi e Materiali',
      items: [
        { name: 'Materiali Metallici', href: '/materiali-metallici', icon: Package, show: permissions.canModifyCostiMateriali },
        { name: 'Materiali Vari', href: '/materiali-vari', icon: Settings, show: permissions.canModifyCostiMateriali },
        { name: 'Leasing Strumentali', href: '/leasing', icon: Wrench, show: permissions.canModifyLeasing },
        { name: 'Manovalanza', href: '/manovalanza', icon: UserCheck, show: true },
        { name: 'Costi Utenze', href: '/costi-utenze', icon: Flame, show: permissions.canModifyUtenze },
      ]
    },
    {
      section: 'finanziari',
      title: 'Sezione Finanziaria',
      items: [
        { name: 'Informazioni Importanti', href: '/finanziari/info', icon: Calculator, show: permissions.canViewFinancials },
        { name: 'Dividendi', href: '/finanziari/dividendi', icon: PieChart, show: permissions.canViewFinancials },
        { name: 'Tasse e IVA Alcafer', href: '/finanziari/tasse-alcafer', icon: Receipt, show: permissions.canModifyTaxes },
        { name: 'Tasse e IVA Gabifer', href: '/finanziari/tasse-gabifer', icon: Receipt, show: permissions.canModifyTaxes },
      ]
    },
    {
      section: 'admin',
      title: 'Amministrazione',
      items: [
        { name: 'Gestione Utenti', href: '/utenti', icon: UserCog, show: permissions.canViewUsers },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Alcafer & Gabifer ERP
        </h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navigation.map((section) => {
          const visibleItems = section.items.filter(item => item.show);
          if (visibleItems.length === 0) return null;

          const isExpanded = expandedSections.includes(section.section);

          return (
            <div key={section.section}>
              <button
                onClick={() => toggleSection(section.section)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span>{section.title}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-2 mt-1 space-y-1 overflow-hidden"
                  >
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isActive(item.href)
                              ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon className="mr-3 h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {userProfile?.nome?.charAt(0)}{userProfile?.cognome?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userProfile?.nome} {userProfile?.cognome}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {userProfile?.ruolo === 'alessandro' && 'Amministratore'}
              {userProfile?.ruolo === 'gabriel' && 'Operatore'}
              {userProfile?.ruolo === 'hanna' && 'Contabilità'}
            </p>
          </div>
        </div>

        {/* Switch User (solo per demo) */}
        {userProfile?.ruolo === 'alessandro' && (
          <div className="mb-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800 mb-2">Demo - Cambia Utente:</p>
            <div className="flex gap-1">
              <button
                onClick={() => switchUser('alessandro')}
                className={`px-2 py-1 text-xs rounded ${userProfile.ruolo === 'alessandro' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                A
              </button>
              <button
                onClick={() => switchUser('gabriel')}
                className={`px-2 py-1 text-xs rounded ${userProfile.ruolo === 'gabriel' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                G
              </button>
              <button
                onClick={() => switchUser('hanna')}
                className={`px-2 py-1 text-xs rounded ${userProfile.ruolo === 'hanna' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                H
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
            >
              <NavigationContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <NavigationContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6">
          <button
            type="button"
            className="lg:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;