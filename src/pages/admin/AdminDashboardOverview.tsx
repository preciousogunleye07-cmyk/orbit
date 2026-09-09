import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Award, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Search, 
  Eye, 
  Edit3, 
  Link as LinkIcon,
  FileSpreadsheet,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { CertificateRecord, getCertificateStats, getPublicAuthUrl } from '../../services/certificateService';
import { DEFAULT_SHEETDB_URL } from '../../services/sheetdbService';
import { playSound } from '../../utils/soundEffects';

interface AdminDashboardOverviewProps {
  certificates: CertificateRecord[];
  onGenerateClick: () => void;
  onViewAllClick: () => void;
  onSelectCertificate: (cert: CertificateRecord) => void;
  onEditCertificate?: (cert: CertificateRecord) => void;
  onOpenPublicPage: (id: string) => void;
  onOpenBulkAuthModal?: () => void;
  onOpenSheetDBTab?: () => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  certificates,
  onGenerateClick,
  onViewAllClick,
  onSelectCertificate,
  onEditCertificate,
  onOpenPublicPage,
  onOpenBulkAuthModal,
  onOpenSheetDBTab
}) => {
  const [quickSearch, setQuickSearch] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const stats = React.useMemo(() => {
    const total = certificates.length;
    const active = certificates.filter(c => c.status === 'valid').length;
    const revoked = certificates.filter(c => c.status === 'revoked').length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = certificates.filter(c => {
      const issueDate = new Date(c.dateIssued);
      return issueDate >= thirtyDaysAgo;
    }).length;
    return { total, active, revoked, recent };
  }, [certificates]);

  // Filtered recent certificates
  const displayedCertificates = React.useMemo(() => {
    if (!quickSearch.trim()) {
      return certificates.slice(0, 6);
    }
    const q = quickSearch.toLowerCase().trim();
    return certificates.filter(c => 
      c.studentName.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.course.toLowerCase().includes(q) ||
      (c.studentEmail && c.studentEmail.toLowerCase().includes(q)) ||
      (c.certificateNumber && c.certificateNumber.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [certificates, quickSearch]);

  const handleCopy = (id: string) => {
    playSound('sparkle');
    const url = getPublicAuthUrl(id);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Top Welcome Banner & Action Autolayout */}
      <div className="bg-[#181524] rounded-[24px] p-5 sm:p-7 lg:p-8 border border-[#332d47] shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Glow effect behind banner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="space-y-2 max-w-xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase font-semibold px-2 py-0.5 rounded bg-purple-950/50 border border-purple-800/40">
              Admin Control Center
            </span>
            <span className="text-[11px] text-[#c4c7c8] font-mono">
              Orbit Space Academy
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#ffffff] font-normal leading-tight">
            Certificate & Roster Management
          </h1>
          <p className="text-xs sm:text-sm text-[#c4c7c8] font-light leading-relaxed">
            Generate tamper-proof credentials, edit issued certificates, and synchronize student enrollments directly with your master Google Sheets.
          </p>
        </div>

        {/* Action Buttons Autolayout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0 relative z-10">
          {onOpenBulkAuthModal && (
            <button
              id="overview-copy-all-auth-links-btn"
              onClick={() => {
                playSound('chime');
                onOpenBulkAuthModal();
              }}
              className="py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 bg-[#221c33] border border-purple-500/50 text-purple-200 hover:text-white hover:bg-purple-900/40 hover:border-purple-400 shadow-md transition-all cursor-pointer min-h-[44px]"
              title="Copy all student authentication links to clipboard"
            >
              <LinkIcon className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Bulk Auth Links</span>
            </button>
          )}

          <button
            onClick={() => {
              playSound('sparkle');
              onGenerateClick();
            }}
            className="btn-purple py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Issue Certificate</span>
          </button>
        </div>
      </div>

      {/* Responsive Statistics Cards Grid (1 col on small mobile, 2 cols on tablet, 4 cols on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        
        {/* Total Certificates */}
        <div className="bg-[#181524] p-5 rounded-[20px] border border-[#332d47] flex flex-col justify-between shadow-md hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono text-[#c4c7c8] uppercase tracking-wider">Total Records</span>
            <div className="w-9 h-9 rounded-xl bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center text-[#a855f7]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal">{stats.total}</div>
            <p className="text-[11px] text-[#c4c7c8] font-light mt-0.5">All issued certificates</p>
          </div>
        </div>

        {/* Active Certificates */}
        <div className="bg-[#181524] p-5 rounded-[20px] border border-[#332d47] flex flex-col justify-between shadow-md hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono text-emerald-400/90 uppercase tracking-wider">Valid & Active</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif text-emerald-400 font-normal">{stats.active}</div>
            <p className="text-[11px] text-[#c4c7c8] font-light mt-0.5">Verifiable on public portal</p>
          </div>
        </div>

        {/* Revoked Certificates */}
        <div className="bg-[#181524] p-5 rounded-[20px] border border-[#332d47] flex flex-col justify-between shadow-md hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono text-rose-400/90 uppercase tracking-wider">Revoked</span>
            <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif text-rose-400 font-normal">{stats.revoked}</div>
            <p className="text-[11px] text-[#c4c7c8] font-light mt-0.5">Flagged or invalidated</p>
          </div>
        </div>

        {/* Recently Issued */}
        <div className="bg-[#181524] p-5 rounded-[20px] border border-[#332d47] flex flex-col justify-between shadow-md hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono text-[#c084fc] uppercase tracking-wider">Last 30 Days</span>
            <div className="w-9 h-9 rounded-xl bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center text-[#c084fc]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif text-[#c084fc] font-normal">{stats.recent}</div>
            <p className="text-[11px] text-[#c4c7c8] font-light mt-0.5">Recent student issuances</p>
          </div>
        </div>

      </div>

      {/* SheetDB Google Sheets Integration Banner */}
      <div className="bg-[#181524] rounded-[22px] p-5 sm:p-6 border border-purple-500/40 shadow-xl bg-gradient-to-r from-[#181524] via-[#1c182d] to-[#181524] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-[#a855f7] shrink-0 shadow-md">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#a855f7] font-semibold">
                Google Sheets Live Sync
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SheetDB Connected
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-serif text-[#ffffff] font-normal">
              Student Enrollment & Ledger
            </h3>
            <p className="text-xs text-[#c4c7c8] font-light max-w-xl">
              Orbit Space Academy's live roster endpoint (<code className="text-purple-300 font-mono text-[11px]">jaa32wk9mncqz</code>) provides instant access to student profiles, enrollment records, and fast 1-click certificate generation.
            </p>
          </div>
        </div>

        {onOpenSheetDBTab && (
          <button
            onClick={() => {
              playSound('droplet');
              onOpenSheetDBTab();
            }}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[#221c33] border border-purple-500/60 text-purple-200 hover:text-white hover:bg-purple-900/50 text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
            <span>Open Students Roster</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Recently Generated Certificates Section with Quick Search & Edit */}
      <div className="bg-[#181524] rounded-[24px] p-5 sm:p-7 border border-[#332d47] shadow-xl space-y-5">
        
        {/* Section Header & Quick Search Autolayout */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#332d47]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif text-[#ffffff] font-normal">Recently Generated Certificates</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/40">
                Click Edit to update details
              </span>
            </div>
            <p className="text-xs text-[#c4c7c8] font-light mt-0.5">
              Quickly view, edit, or copy verification links for recent students.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {/* Quick Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-[#a855f7] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search recent student or ID..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-[#ffffff] text-xs rounded-xl pl-8 pr-3 py-2 outline-none transition-colors"
              />
            </div>

            <button
              onClick={() => {
                playSound('droplet');
                onViewAllClick();
              }}
              className="text-xs text-[#c084fc] hover:text-[#ffffff] bg-[#100e17] hover:bg-[#1f1b2e] border border-[#332d47] px-3 py-2 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              <span>Directory ({certificates.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {displayedCertificates.length === 0 ? (
          <div className="text-center py-12 bg-[#100e17] rounded-xl border border-[#332d47]">
            <Award className="w-8 h-8 text-[#a855f7] mx-auto mb-2 opacity-50" />
            <p className="text-sm text-[#ffffff] font-medium">
              {quickSearch ? 'No certificates match your search query' : 'No certificates issued yet'}
            </p>
            <p className="text-xs text-[#c4c7c8] font-light mt-1">
              {quickSearch ? 'Try searching by student name, matric number, or course' : 'Click "+ Issue Certificate" to create your first record.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table View (hidden on small mobile screens for clean autolayout) */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#332d47] bg-[#100e17]/80 shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#332d47] bg-[#14111f] text-[#94a3b8] font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4 font-medium">Student</th>
                    <th className="py-3.5 px-4 font-medium">Course</th>
                    <th className="py-3.5 px-4 font-medium">Auth ID</th>
                    <th className="py-3.5 px-4 font-medium">Issue Date</th>
                    <th className="py-3.5 px-4 font-medium">Status</th>
                    <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#332d47]/60">
                  {displayedCertificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-[#1a1628]/80 transition-colors group">
                      {/* Cell 1: Student with avatar badge & ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-950/70 border border-purple-800/60 flex items-center justify-center text-[#c084fc] font-semibold text-xs shrink-0 shadow-sm">
                            {cert.studentName ? cert.studentName.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-semibold text-[#ffffff] group-hover:text-purple-200 transition-colors truncate">
                              {cert.studentName}
                            </span>
                            <span className="text-[10px] font-mono text-[#94a3b8] font-normal tracking-tight">
                              {cert.certificateNumber || cert.studentId || 'No Matric'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cell 2: Course pill */}
                      <td className="py-3.5 px-4 text-[#e2e8f0] whitespace-nowrap align-middle">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#181424] border border-[#332d47] text-[11px] font-medium text-purple-200 shadow-sm">
                          {cert.course}
                        </span>
                      </td>

                      {/* Cell 3: Auth ID badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#c084fc] font-semibold bg-[#141021] px-2.5 py-1 rounded-lg border border-purple-900/50 shadow-inner">
                          <ShieldCheck className="w-3 h-3 text-purple-400 shrink-0" />
                          {cert.id}
                        </span>
                      </td>

                      {/* Cell 4: Issue Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <span className="inline-flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
                          <Calendar className="w-3 h-3 text-purple-400/80 shrink-0" />
                          {cert.dateIssued}
                        </span>
                      </td>

                      {/* Cell 5: Status badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        {cert.status === 'valid' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-emerald-400 text-[10px] font-mono font-medium shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/70 border border-rose-700/60 text-rose-400 text-[10px] font-mono font-medium shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Revoked
                          </span>
                        )}
                      </td>

                      {/* Cell 6: Actions toolbar */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap align-middle">
                        <div className="flex items-center justify-end gap-1.5">
                          {onEditCertificate && (
                            <button
                              onClick={() => {
                                playSound('toggle');
                                onEditCertificate(cert);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-900/40 border border-purple-600/60 text-purple-200 hover:bg-purple-700/60 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                              title="Edit Certificate Details"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-purple-300" />
                              <span>Edit</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              playSound('scan');
                              onSelectCertificate(cert);
                            }}
                            className="p-1.5 rounded-lg bg-[#141021] border border-[#332d47] text-[#94a3b8] hover:text-white hover:border-purple-500/50 hover:bg-purple-950/40 transition-all cursor-pointer shadow-sm"
                            title="View Certificate Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-400" />
                          </button>

                          <button
                            onClick={() => handleCopy(cert.id)}
                            className="p-1.5 rounded-lg bg-[#141021] border border-[#332d47] text-[#94a3b8] hover:text-[#c084fc] hover:border-purple-500/50 hover:bg-purple-950/40 transition-all cursor-pointer shadow-sm"
                            title="Copy Public Auth Link"
                          >
                            {copiedId === cert.id ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => {
                              playSound('scan');
                              onOpenPublicPage(cert.id);
                            }}
                            className="p-1.5 rounded-lg bg-[#141021] border border-[#332d47] text-[#94a3b8] hover:text-purple-300 hover:border-purple-500/50 hover:bg-purple-950/40 transition-all cursor-pointer shadow-sm"
                            title="Open Public Authentication Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (displayed strictly on mobile screens for effortless reading & tapping) */}
            <div className="md:hidden space-y-3">
              {displayedCertificates.map((cert) => (
                <div 
                  key={cert.id}
                  className="bg-[#100e17] rounded-2xl p-4 border border-[#332d47] space-y-3.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-tight">
                        {cert.studentName}
                      </h4>
                      <p className="text-[11px] text-purple-300 mt-0.5">
                        {cert.course}
                      </p>
                    </div>

                    {cert.status === 'valid' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[10px] font-mono">
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-400 text-[10px] font-mono">
                        <span className="w-1 h-1 rounded-full bg-rose-400" />
                        Revoked
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#c4c7c8] pt-2 border-t border-[#332d47]/50">
                    <span className="text-[#c084fc] font-semibold">{cert.id}</span>
                    <span>{cert.dateIssued}</span>
                  </div>

                  {/* Mobile Actions: Big Touch Targets */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {onEditCertificate && (
                      <button
                        onClick={() => {
                          playSound('toggle');
                          onEditCertificate(cert);
                        }}
                        className="py-2 px-2.5 rounded-xl bg-purple-950/60 border border-purple-700/60 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 active:bg-purple-900 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-purple-300" />
                        <span>Edit</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        playSound('scan');
                        onSelectCertificate(cert);
                      }}
                      className="py-2 px-2.5 rounded-xl bg-[#181524] border border-[#332d47] text-white text-xs font-medium flex items-center justify-center gap-1.5 active:bg-[#231e33] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-400" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleCopy(cert.id)}
                      className="py-2 px-2.5 rounded-xl bg-[#181524] border border-[#332d47] text-[#c4c7c8] text-xs font-medium flex items-center justify-center gap-1.5 active:bg-[#231e33] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedId === cert.id ? 'Copied!' : 'Link'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
};
