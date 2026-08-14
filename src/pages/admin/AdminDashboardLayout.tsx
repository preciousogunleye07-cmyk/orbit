import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  LogOut, 
  Plus, 
  List, 
  LayoutDashboard, 
  User, 
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { 
  CertificateRecord, 
  getCertificates, 
  getAdminSession, 
  logoutAdmin,
  AdminUser
} from '../../services/certificateService';

import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminCertificatesList } from './AdminCertificatesList';
import { AdminCreateCertificatePage } from './AdminCreateCertificatePage';
import { CertificateDetailsModal } from '../../components/admin/CertificateDetailsModal';
import { RevokeConfirmationModal } from '../../components/admin/RevokeConfirmationModal';
import { OrbitLogo } from '../../components/OrbitLogo';

interface AdminDashboardLayoutProps {
  onLogout: () => void;
  onNavigateHome: () => void;
  onOpenPublicPage: (id: string) => void;
  initialTab?: 'overview' | 'directory' | 'create';
}

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  onLogout,
  onNavigateHome,
  onOpenPublicPage,
  initialTab = 'overview'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'directory' | 'create'>(initialTab);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Modal states
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateRecord | null>(null);
  const [certificateToRevoke, setCertificateToRevoke] = useState<CertificateRecord | null>(null);

  const refreshData = () => {
    setCertificates(getCertificates());
  };

  useEffect(() => {
    refreshData();
    setAdminUser(getAdminSession());
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    onLogout();
  };

  const handleCreated = (newCert: CertificateRecord) => {
    refreshData();
  };

  const handleRevoked = () => {
    refreshData();
    if (selectedCertificate) {
      const updated = certificates.find(c => c.id === selectedCertificate.id);
      if (updated) setSelectedCertificate(updated);
    }
  };

  return (
    <div className="min-h-screen bg-[#100e17] text-[#e5e2e1] flex flex-col justify-between pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Background glow accent */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1240px] mx-auto w-full relative z-10 space-y-8 flex-1">
        
        {/* Admin Header Navigation Bar */}
        <div className="bg-[#181524] rounded-[24px] p-5 sm:p-6 border border-[#332d47] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Left Brand Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 group text-left cursor-pointer hover:opacity-90 transition-opacity"
              title="Return to Orbit Space main site"
            >
              <OrbitLogo size={32} color="#c084fc" className="shrink-0" />
            </button>

            <div className="h-8 w-[1px] bg-[#332d47]" />

            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#a855f7]" />
                <span className="text-sm font-semibold text-[#ffffff] font-sans tracking-tight">
                  Certificate Authentication
                </span>
              </div>
              <p className="text-[11px] text-[#c4c7c8] font-light hidden sm:block">
                Manage student certificates and generate secure authentication links.
              </p>
            </div>
          </div>

          {/* Navigation Tab Pills */}
          <div className="flex items-center gap-1.5 bg-[#100e17] p-1.5 rounded-full border border-[#332d47] w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'btn-purple text-white shadow-md'
                  : 'text-[#c4c7c8] hover:text-[#ffffff] hover:bg-[#1f1b2e]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'directory'
                  ? 'btn-purple text-white shadow-md'
                  : 'text-[#c4c7c8] hover:text-[#ffffff] hover:bg-[#1f1b2e]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Certificates ({certificates.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'create'
                  ? 'btn-purple text-white shadow-md'
                  : 'text-[#c084fc] hover:text-[#ffffff] hover:bg-[#1f1b2e]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Generate</span>
            </button>
          </div>

          {/* Admin User Profile & Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-0 border-[#332d47]">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-full bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center text-[#a855f7] font-semibold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-[#ffffff] leading-tight">
                  {adminUser?.name || 'Orbit Admin'}
                </span>
                <span className="text-[10px] text-[#c4c7c8] font-mono">
                  {adminUser?.role || 'Administrator'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateHome}
                className="p-2 rounded-xl bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-[#ffffff] transition-colors"
                title="View Orbit Space Main Website"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 hover:text-white hover:bg-rose-900/60 transition-colors"
                title="Sign Out of Admin Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Dynamic Main View */}
        <div className="w-full">
          {activeTab === 'overview' && (
            <AdminDashboardOverview
              certificates={certificates}
              onGenerateClick={() => setActiveTab('create')}
              onViewAllClick={() => setActiveTab('directory')}
              onSelectCertificate={(cert) => setSelectedCertificate(cert)}
              onOpenPublicPage={onOpenPublicPage}
            />
          )}

          {activeTab === 'directory' && (
            <AdminCertificatesList
              certificates={certificates}
              onGenerateClick={() => setActiveTab('create')}
              onSelectCertificate={(cert) => setSelectedCertificate(cert)}
              onOpenPublicPage={onOpenPublicPage}
              onRequestRevoke={(cert) => setCertificateToRevoke(cert)}
            />
          )}

          {activeTab === 'create' && (
            <AdminCreateCertificatePage
              onCreated={handleCreated}
              onOpenPublicPage={onOpenPublicPage}
              onCancel={() => setActiveTab('directory')}
            />
          )}
        </div>

      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedCertificate && (
          <CertificateDetailsModal
            certificate={selectedCertificate}
            onClose={() => setSelectedCertificate(null)}
            onOpenPublicView={onOpenPublicPage}
            onRequestRevoke={(cert) => setCertificateToRevoke(cert)}
          />
        )}

        {certificateToRevoke && (
          <RevokeConfirmationModal
            certificate={certificateToRevoke}
            onClose={() => setCertificateToRevoke(null)}
            onRevoked={handleRevoked}
          />
        )}
      </AnimatePresence>

    </div>
  );
};
