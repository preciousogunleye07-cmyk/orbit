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
  ArrowLeft,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { 
  CertificateRecord, 
  getCertificates, 
  syncCertificatesFromSupabase,
  getAdminSession, 
  logoutAdmin,
  AdminUser
} from '../../services/certificateService';
import { SheetDBStudent } from '../../services/sheetdbService';

import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminCertificatesList } from './AdminCertificatesList';
import { AdminCreateCertificatePage } from './AdminCreateCertificatePage';
import { AdminTimetableManager } from '../../components/admin/AdminTimetableManager';
import { AdminSheetDBManager } from '../../components/admin/AdminSheetDBManager';
import { CertificateDetailsModal } from '../../components/admin/CertificateDetailsModal';
import { EditCertificateModal } from '../../components/admin/EditCertificateModal';
import { RevokeConfirmationModal } from '../../components/admin/RevokeConfirmationModal';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { BulkAuthLinksModal } from '../../components/admin/BulkAuthLinksModal';
import { OrbitLogo } from '../../components/OrbitLogo';
import { playSound } from '../../utils/soundEffects';

interface AdminDashboardLayoutProps {
  onLogout: () => void;
  onNavigateHome: () => void;
  onOpenPublicPage: (id: string) => void;
  initialTab?: 'overview' | 'directory' | 'students' | 'create' | 'timetable';
}

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  onLogout,
  onNavigateHome,
  onOpenPublicPage,
  initialTab = 'overview'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'directory' | 'students' | 'create' | 'timetable'>(initialTab);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [prefilledStudentForCreate, setPrefilledStudentForCreate] = useState<SheetDBStudent | null>(null);

  // Modal states
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateRecord | null>(null);
  const [certificateToEdit, setCertificateToEdit] = useState<CertificateRecord | null>(null);
  const [certificateToRevoke, setCertificateToRevoke] = useState<CertificateRecord | null>(null);
  const [certificateToDelete, setCertificateToDelete] = useState<CertificateRecord | null>(null);
  const [isBulkAuthModalOpen, setIsBulkAuthModalOpen] = useState(false);
  const [layoutToast, setLayoutToast] = useState<string | null>(null);

  const refreshData = () => {
    setCertificates(getCertificates());
    syncCertificatesFromSupabase().then((latest) => {
      setCertificates(latest);
    });
  };

  useEffect(() => {
    refreshData();
    setAdminUser(getAdminSession());
  }, []);

  const handleTabChange = (tab: 'overview' | 'directory' | 'students' | 'create' | 'timetable') => {
    playSound('droplet');
    setActiveTab(tab);
  };

  const handleLogout = () => {
    playSound('release');
    logoutAdmin();
    onLogout();
  };

  const handleCreated = (newCert: CertificateRecord) => {
    playSound('success');
    refreshData();
  };

  const handleEdited = (updatedCert: CertificateRecord) => {
    playSound('success');
    refreshData();
    if (selectedCertificate && selectedCertificate.id === updatedCert.id) {
      setSelectedCertificate(updatedCert);
    }
  };

  const handleRevoked = () => {
    playSound('toggle');
    refreshData();
    if (selectedCertificate) {
      const updated = certificates.find(c => c.id === selectedCertificate.id);
      if (updated) setSelectedCertificate(updated);
    }
  };

  const handleDeleted = () => {
    playSound('trash');
    refreshData();
    setSelectedCertificate(null);
    setCertificateToDelete(null);
  };

  return (
    <div className="min-h-screen bg-[#100e17] text-[#e5e2e1] flex flex-col justify-between pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Background glow accent */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1240px] mx-auto w-full relative z-10 space-y-8 flex-1">
        
        {/* Admin Header Navigation Bar with Responsive Autolayout */}
        <header className="bg-[#181524] rounded-[24px] p-4 sm:p-5 lg:p-6 border border-[#332d47] shadow-xl space-y-4">
          
          {/* Top Bar: Brand, Live Status & Admin Profile Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[#332d47]/60">
            
            {/* Left: Brand & Portal Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-2.5 group text-left cursor-pointer hover:opacity-90 transition-opacity"
                title="Return to Orbit Space main site"
              >
                <OrbitLogo size={32} color="#c084fc" className="shrink-0" />
              </button>

              <div className="h-7 w-[1px] bg-[#332d47]" />

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-sm sm:text-base font-semibold text-[#ffffff] font-sans tracking-tight">
                    Orbit Space Admin Portal
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    System Online
                  </span>
                </div>
                <p className="text-[11px] text-[#c4c7c8] font-light hidden sm:block">
                  Student credentials, live SheetDB synchronization, and timetable manager.
                </p>
              </div>
            </div>

            {/* Right: Admin Profile & Portal Actions */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 bg-[#100e17] px-3 py-1.5 rounded-xl border border-[#332d47]">
                <div className="w-6 h-6 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-[#a855f7] font-semibold text-[11px]">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-[#ffffff] text-xs leading-none">
                    {adminUser?.name || 'Administrator'}
                  </span>
                  <span className="text-[9px] text-[#c4c7c8] font-mono mt-0.5">
                    {adminUser?.role || 'Portal Admin'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    playSound('pulse');
                    onNavigateHome();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-[#ffffff] hover:border-purple-500/40 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  title="View Orbit Space Main Website"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Public Site</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 hover:text-white hover:bg-rose-900/60 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  title="Sign Out of Admin Portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Responsive Navigation Tabs Autolayout */}
          <nav aria-label="Admin Sections" className="flex items-center gap-1.5 bg-[#100e17] p-1.5 rounded-2xl border border-[#332d47] overflow-x-auto scrollbar-none w-full">
            <button
              onClick={() => handleTabChange('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[40px] ${
                activeTab === 'overview'
                  ? 'btn-purple text-white shadow-md'
                  : 'text-[#c4c7c8] hover:text-[#ffffff] hover:bg-[#1f1b2e]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => handleTabChange('directory')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[40px] ${
                activeTab === 'directory'
                  ? 'btn-purple text-white shadow-md'
                  : 'text-[#c4c7c8] hover:text-[#ffffff] hover:bg-[#1f1b2e]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Certificates</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'directory' ? 'bg-purple-900/80 text-white' : 'bg-[#181524] text-purple-300 border border-[#332d47]'
              }`}>
                {certificates.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('students')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[40px] ${
                activeTab === 'students'
                  ? 'btn-purple text-white shadow-md'
                  : 'text-[#c4c7c8] hover:text-[#ffffff] hover:bg-[#1f1b2e]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Students (SheetDB)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>

            <button
              onClick={() => handleTabChange('timetable')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[40px] ${
                activeTab === 'timetable'
                  ? 'btn-purple text-white shadow-md'
                  : 'text-[#c4c7c8] hover:text-[#ffffff] hover:bg-[#1f1b2e]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timetable</span>
            </button>

            <button
              onClick={() => handleTabChange('create')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ml-auto min-h-[40px] ${
                activeTab === 'create'
                  ? 'btn-purple text-white shadow-md'
                  : 'bg-purple-950/40 text-purple-300 hover:text-white hover:bg-purple-900/60 border border-purple-800/40'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Issue Certificate</span>
            </button>
          </nav>

        </header>

        {/* Dynamic Main View */}
        <div className="w-full">
          {activeTab === 'overview' && (
            <AdminDashboardOverview
              certificates={certificates}
              onGenerateClick={() => setActiveTab('create')}
              onViewAllClick={() => setActiveTab('directory')}
              onSelectCertificate={(cert) => setSelectedCertificate(cert)}
              onEditCertificate={(cert) => setCertificateToEdit(cert)}
              onOpenPublicPage={onOpenPublicPage}
              onOpenBulkAuthModal={() => setIsBulkAuthModalOpen(true)}
              onOpenSheetDBTab={() => setActiveTab('students')}
            />
          )}

          {activeTab === 'directory' && (
            <AdminCertificatesList
              certificates={certificates}
              onGenerateClick={() => setActiveTab('create')}
              onSelectCertificate={(cert) => setSelectedCertificate(cert)}
              onEditCertificate={(cert) => setCertificateToEdit(cert)}
              onOpenPublicPage={onOpenPublicPage}
              onRequestRevoke={(cert) => setCertificateToRevoke(cert)}
              onRequestDelete={(cert) => setCertificateToDelete(cert)}
            />
          )}

          {activeTab === 'students' && (
            <AdminSheetDBManager
              certificates={certificates}
              onGenerateCertificateForStudent={(student) => {
                setPrefilledStudentForCreate(student);
                setActiveTab('create');
              }}
              onOpenPublicCertificate={onOpenPublicPage}
            />
          )}

          {activeTab === 'timetable' && (
            <AdminTimetableManager
              onOpenPublicTimetable={() => {
                window.history.pushState({}, '', '/timetable');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            />
          )}

          {activeTab === 'create' && (
            <AdminCreateCertificatePage
              onCreated={(newCert) => {
                handleCreated(newCert);
                setPrefilledStudentForCreate(null);
              }}
              onOpenPublicPage={onOpenPublicPage}
              onCancel={() => {
                setPrefilledStudentForCreate(null);
                setActiveTab('directory');
              }}
              prefilledStudent={prefilledStudentForCreate}
            />
          )}
        </div>

      </div>

      {/* Global Toast for Layout actions */}
      {layoutToast && (
        <div className="fixed top-24 right-6 z-50 bg-[#161224] border border-emerald-500/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-emerald-100">{layoutToast}</span>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isBulkAuthModalOpen && (
          <BulkAuthLinksModal
            certificates={certificates}
            isOpen={isBulkAuthModalOpen}
            onClose={() => setIsBulkAuthModalOpen(false)}
            onCopiedSuccess={(msg) => {
              setLayoutToast(msg);
              setTimeout(() => setLayoutToast(null), 3500);
            }}
          />
        )}
        {selectedCertificate && (
          <CertificateDetailsModal
            certificate={selectedCertificate}
            onClose={() => setSelectedCertificate(null)}
            onOpenPublicView={onOpenPublicPage}
            onEdit={(cert) => setCertificateToEdit(cert)}
            onRequestRevoke={(cert) => setCertificateToRevoke(cert)}
            onRequestDelete={(cert) => setCertificateToDelete(cert)}
          />
        )}

        {certificateToEdit && (
          <EditCertificateModal
            certificate={certificateToEdit}
            onClose={() => setCertificateToEdit(null)}
            onUpdated={handleEdited}
          />
        )}

        {certificateToRevoke && (
          <RevokeConfirmationModal
            certificate={certificateToRevoke}
            onClose={() => setCertificateToRevoke(null)}
            onRevoked={handleRevoked}
          />
        )}

        {certificateToDelete && (
          <DeleteConfirmationModal
            certificate={certificateToDelete}
            onClose={() => setCertificateToDelete(null)}
            onDeleted={handleDeleted}
          />
        )}
      </AnimatePresence>

    </div>
  );
};
