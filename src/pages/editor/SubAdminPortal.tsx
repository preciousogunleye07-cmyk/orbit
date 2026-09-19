import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Award, 
  LogOut, 
  ArrowLeft, 
  Shield, 
  ShieldCheck, 
  User, 
  Sparkles, 
  ExternalLink,
  CheckCircle2,
  Clock,
  BookOpen,
  Info,
  Calendar
} from 'lucide-react';
import { 
  SubAdminUser, 
  getSubAdminSession, 
  logoutSubAdmin 
} from '../../services/subAdminService';
import { getCertificates, CertificateRecord, syncCertificatesFromSupabase } from '../../services/certificateService';
import { AdminArticlesManager } from '../../components/admin/AdminArticlesManager';
import { AdminTimetableManager } from '../../components/admin/AdminTimetableManager';
import { CertificateDetailsModal } from '../../components/admin/CertificateDetailsModal';
import { OrbitLogo } from '../../components/OrbitLogo';
import { playSound } from '../../utils/soundEffects';
import { SubAdminLoginPage } from './SubAdminLoginPage';

interface SubAdminPortalProps {
  onNavigateHome: () => void;
  onOpenArticle: (slug: string) => void;
  onOpenCertificate: (certId: string) => void;
}

export const SubAdminPortal: React.FC<SubAdminPortalProps> = ({
  onNavigateHome,
  onOpenArticle,
  onOpenCertificate
}) => {
  const [currentUser, setCurrentUser] = useState<SubAdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'articles' | 'certificates' | 'timetable'>('articles');

  // Certificates list for reference
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [selectedCertForView, setSelectedCertForView] = useState<CertificateRecord | null>(null);
  const [certSearch, setCertSearch] = useState('');

  useEffect(() => {
    const session = getSubAdminSession();
    setCurrentUser(session);
    if (session) {
      setCertificates(getCertificates());
      syncCertificatesFromSupabase().then(latest => setCertificates(latest));
    }
  }, []);

  const handleLogout = () => {
    playSound('release');
    logoutSubAdmin();
    setCurrentUser(null);
  };

  const filteredCerts = certificates.filter(c =>
    c.studentName.toLowerCase().includes(certSearch.toLowerCase()) ||
    c.course.toLowerCase().includes(certSearch.toLowerCase()) ||
    c.id.toLowerCase().includes(certSearch.toLowerCase())
  );

  // If not authenticated, show distinctive SubAdminLoginPage
  if (!currentUser) {
    return (
      <SubAdminLoginPage
        onSuccess={(user) => {
          setCurrentUser(user);
          setCertificates(getCertificates());
          syncCertificatesFromSupabase().then(latest => setCertificates(latest));
        }}
        onNavigateHome={onNavigateHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#100e17] text-[#e5e2e1] flex flex-col justify-between pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative">
      {/* Background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1240px] mx-auto w-full relative z-10 space-y-6 flex-1">
        
        {/* Authenticated: Sub-Admin Dashboard */}
        <div className="space-y-6">
            
            {/* Top Bar Header */}
            <header className="bg-[#181524] rounded-[24px] p-4 sm:p-5 lg:p-6 border border-[#332d47] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onNavigateHome}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  title="Return to Orbit Space main site"
                >
                  <OrbitLogo size={32} color="#c084fc" />
                </button>
                <div className="h-7 w-[1px] bg-[#332d47]" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-base font-semibold text-white tracking-tight">
                      Orbit Space Academic & Editorial Portal
                    </h1>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-700/60">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c4c7c8] font-light">
                    Publish student research articles, link student certifications, and deploy live to the website.
                  </p>
                </div>
              </div>

              {/* User Profile & Actions */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2 bg-[#100e17] px-3 py-1.5 rounded-xl border border-[#332d47]">
                  <div className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-[#c084fc] font-semibold text-[11px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-white text-xs leading-none">
                      {currentUser.name}
                    </span>
                    <span className="text-[9px] text-[#a855f7] font-mono mt-0.5">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onNavigateHome}
                    className="px-3 py-1.5 rounded-xl bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Public Site</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 hover:text-white hover:bg-rose-900/60 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-2 bg-[#181524] p-2 rounded-2xl border border-[#332d47] overflow-x-auto">
              <button
                onClick={() => {
                  playSound('droplet');
                  setActiveTab('articles');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'articles'
                    ? 'btn-purple text-white shadow-md'
                    : 'text-[#c4c7c8] hover:text-white hover:bg-[#1f1b2e]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Research & Articles Studio</span>
              </button>

              <button
                onClick={() => {
                  playSound('droplet');
                  setActiveTab('certificates');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'certificates'
                    ? 'btn-purple text-white shadow-md'
                    : 'text-[#c4c7c8] hover:text-white hover:bg-[#1f1b2e]'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Student Directory & Projects</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#100e17] text-purple-300 border border-[#332d47]">
                  {certificates.length}
                </span>
              </button>

              <button
                onClick={() => {
                  playSound('droplet');
                  setActiveTab('timetable');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'timetable'
                    ? 'btn-purple text-white shadow-md'
                    : 'text-[#c4c7c8] hover:text-white hover:bg-[#1f1b2e]'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Weekly Timetable</span>
              </button>
            </nav>

            {/* Tab 1: Articles Manager */}
            {activeTab === 'articles' && (
              <AdminArticlesManager
                currentUser={currentUser}
                onViewPublicArticle={onOpenArticle}
                onNavigateToCertificate={onOpenCertificate}
              />
            )}

            {/* Tab 2: Read-Only Student Certificates & Projects Directory */}
            {activeTab === 'certificates' && (
              <div className="space-y-5">
                <div className="bg-[#181524] rounded-2xl p-5 border border-[#332d47] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-serif text-white font-normal flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#c084fc]" />
                      Student Certifications & Capstone Directory
                    </h3>
                    <p className="text-xs text-[#8e8a9f]">
                      Sub-Admin Reference View. Use these credential numbers and project summaries to link student authors to technical articles.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      value={certSearch}
                      onChange={(e) => setCertSearch(e.target.value)}
                      placeholder="Search student or course..."
                      className="w-full bg-[#100e17] border border-[#332d47] text-white text-xs rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCerts.map(cert => (
                    <div
                      key={cert.id}
                      className="bg-[#181524] rounded-2xl p-4 border border-[#332d47] hover:border-purple-500/50 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{cert.studentName}</h4>
                          <span className="text-[11px] text-[#a855f7] block">{cert.course}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800/60">
                          {cert.id}
                        </span>
                      </div>

                      {cert.additionalNotes && (
                        <div className="bg-[#100e17] p-2.5 rounded-xl border border-[#2d273f] text-xs text-[#c4c7c8] font-light line-clamp-3">
                          <strong className="text-white font-semibold block text-[10px] font-mono uppercase text-[#a855f7] mb-0.5">Capstone / Honors:</strong>
                          {cert.additionalNotes}
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#2d273f] flex items-center justify-between text-xs">
                        <span className="text-[10px] text-gray-400 font-mono">Issued: {cert.dateIssued}</span>
                        <button
                          onClick={() => setSelectedCertForView(cert)}
                          className="text-[#c084fc] hover:underline text-xs flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <span>Inspect Record</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Timetable Manager */}
            {activeTab === 'timetable' && (
              <AdminTimetableManager
                onOpenPublicTimetable={() => {
                  window.open('/timetable', '_blank');
                }}
              />
            )}

          </div>
        </div>

      {/* View Certificate Modal for Sub-Admin */}
      {selectedCertForView && (
        <CertificateDetailsModal
          certificate={selectedCertForView}
          onClose={() => setSelectedCertForView(null)}
          onOpenPublicView={onOpenCertificate}
          onRequestRevoke={() => {
            alert('Notice: Revocation of official credentials requires Super-Admin authorization.');
          }}
          onEdit={() => {
            alert('Notice: Modifying master official certificate files requires Super-Admin authorization.');
          }}
        />
      )}
    </div>
  );
};
