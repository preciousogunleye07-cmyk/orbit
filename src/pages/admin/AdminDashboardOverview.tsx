import React, { useState } from 'react';
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
  HardDrive,
  Download,
  Upload,
  Database,
  Check,
  RefreshCw
} from 'lucide-react';
import { 
  CertificateRecord, 
  getCertificateStats, 
  getPublicAuthUrl,
  getLocalHostingStats,
  exportLocalDatabaseAsJson,
  importLocalDatabaseFromJson,
  getAdminHostingMode,
  setAdminHostingMode,
  AdminHostingMode,
  forceSyncLocalToCloud
} from '../../services/certificateService';
import { playSound } from '../../utils/soundEffects';

interface AdminDashboardOverviewProps {
  certificates: CertificateRecord[];
  onGenerateClick: () => void;
  onViewAllClick: () => void;
  onSelectCertificate: (cert: CertificateRecord) => void;
  onEditCertificate?: (cert: CertificateRecord) => void;
  onOpenPublicPage: (id: string) => void;
  onRefreshData?: () => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  certificates,
  onGenerateClick,
  onViewAllClick,
  onSelectCertificate,
  onEditCertificate,
  onOpenPublicPage,
  onRefreshData
}) => {
  const stats = getCertificateStats();
  const recentCertificates = certificates.slice(0, 5);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hostingMode, setHostingMode] = useState<AdminHostingMode>(getAdminHostingMode());
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const hostingStats = getLocalHostingStats();

  const handleCopy = (id: string) => {
    playSound('sparkle');
    const url = getPublicAuthUrl(id);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleHostingModeChange = (mode: AdminHostingMode) => {
    playSound('toggle');
    setAdminHostingMode(mode);
    setHostingMode(mode);
    setFeedbackMessage(
      mode === 'local' 
        ? 'Local Hosting active. All certificates are stored directly on this device.'
        : 'Cloud Sync mode active. Database will synchronize with cloud storage.'
    );
    setTimeout(() => setFeedbackMessage(null), 4000);
    if (onRefreshData) onRefreshData();
  };

  const handleExportDatabase = () => {
    playSound('chime');
    const json = exportLocalDatabaseAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbit_space_certificates_local_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setFeedbackMessage('Local database exported successfully.');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importLocalDatabaseFromJson(content);
        if (result.success) {
          playSound('success');
          setFeedbackMessage(`Successfully imported ${result.importedCount} certificate(s) into local database.`);
          if (onRefreshData) onRefreshData();
        } else {
          playSound('error');
          alert(`Import failed: ${result.error || 'Invalid file format'}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    playSound('pulse');
    try {
      const res = await forceSyncLocalToCloud();
      if (res.success) {
        playSound('success');
        setFeedbackMessage(`Successfully synced ${res.syncedCount} local records to cloud.`);
      } else {
        playSound('error');
        setFeedbackMessage(`Cloud sync notice: ${res.error}`);
      }
    } catch (err: any) {
      setFeedbackMessage(`Sync failed: ${err?.message || 'Network error'}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Welcome Banner & Main Action */}
      <div className="bg-[#181524] rounded-[24px] p-6 sm:p-8 border border-[#332d47] relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-[11px] font-mono tracking-widest text-[#a855f7] uppercase font-semibold block">
            Orbit Space Certification Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal leading-tight">
            Certificate Authentication Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#c4c7c8] font-light leading-relaxed">
            Manage student certificates, verify physical credentials, and issue secure, verifiable Orbit Space authentication URLs.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => {
            playSound('sparkle');
            onGenerateClick();
          }}
          className="btn-purple py-3.5 px-6 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl hover:scale-105 transition-all shrink-0 min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          <span>+ Generate Certificate</span>
        </button>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Certificates */}
        <div className="bg-[#181524] p-5 sm:p-6 rounded-[20px] border border-[#332d47] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-[#c4c7c8] uppercase">Total Certificates</span>
            <div className="w-9 h-9 rounded-xl bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center text-[#a855f7]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-serif text-[#ffffff] font-normal">{stats.total}</div>
          <p className="text-[11px] text-[#c4c7c8] font-light mt-1">All time issued records</p>
        </div>

        {/* Active Certificates */}
        <div className="bg-[#181524] p-5 sm:p-6 rounded-[20px] border border-[#332d47] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-[#c4c7c8] uppercase">Active Certificates</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-serif text-emerald-400 font-normal">{stats.active}</div>
          <p className="text-[11px] text-[#c4c7c8] font-light mt-1">Currently valid & verifiable</p>
        </div>

        {/* Revoked Certificates */}
        <div className="bg-[#181524] p-5 sm:p-6 rounded-[20px] border border-[#332d47] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-[#c4c7c8] uppercase">Revoked Certificates</span>
            <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-serif text-rose-400 font-normal">{stats.revoked}</div>
          <p className="text-[11px] text-[#c4c7c8] font-light mt-1">Inactivated / flagged</p>
        </div>

        {/* Recently Issued */}
        <div className="bg-[#181524] p-5 sm:p-6 rounded-[20px] border border-[#332d47] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-[#c4c7c8] uppercase">Recently Issued</span>
            <div className="w-9 h-9 rounded-xl bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center text-[#c084fc]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-serif text-[#c084fc] font-normal">{stats.recent}</div>
          <p className="text-[11px] text-[#c4c7c8] font-light mt-1">In the last 30 days</p>
        </div>

      </div>

      {/* Local Hosting & Storage Engine Hub */}
      <div className="bg-[#181524] rounded-[24px] p-6 sm:p-7 border border-[#332d47] shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-[#332d47]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-serif text-white">Local Hosting & Storage Engine</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[11px] font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {hostingMode === 'local' ? '100% On-Device Local Mode' : 'Cloud Sync Mode'}
              </span>
            </div>
            <p className="text-xs text-[#c4c7c8] font-light">
              Administrative data and certificate issuing are hosted locally on this machine with direct browser persistence and instant speed.
            </p>
          </div>

          {/* Mode Switcher Toggle */}
          <div className="flex items-center gap-2 bg-[#100e17] p-1.5 rounded-xl border border-[#332d47] shrink-0 self-start lg:self-auto">
            <button
              onClick={() => handleHostingModeChange('local')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                hostingMode === 'local'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-[#c4c7c8] hover:text-white'
              }`}
            >
              Local Hosting (Active)
            </button>
            <button
              onClick={() => handleHostingModeChange('cloud')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                hostingMode === 'cloud'
                  ? 'btn-purple text-white shadow-md'
                  : 'text-[#c4c7c8] hover:text-white'
              }`}
            >
              Cloud Sync
            </button>
          </div>
        </div>

        {/* Local Storage Operations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          {/* Storage Footprint */}
          <div className="bg-[#100e17] p-4 rounded-xl border border-[#332d47] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-[#c4c7c8] block">Database Footprint</span>
              <span className="text-lg font-mono text-white font-semibold">{hostingStats.storageSizeFormatted}</span>
              <span className="text-[10px] text-[#c4c7c8] block">{hostingStats.total} certificates stored locally</span>
            </div>
            <Database className="w-7 h-7 text-[#a855f7]/70" />
          </div>

          {/* Backup Export */}
          <div className="bg-[#100e17] p-4 rounded-xl border border-[#332d47] flex flex-col justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono text-[#c4c7c8] block">Export Local Backup</span>
              <span className="text-xs text-[#e2e8f0]">Download JSON database file</span>
            </div>
            <button
              onClick={handleExportDatabase}
              className="px-3.5 py-2 rounded-lg bg-[#181524] hover:bg-[#251f38] border border-[#332d47] hover:border-[#a855f7] text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#c084fc]" />
              <span>Export Database (.json)</span>
            </button>
          </div>

          {/* Backup Restore */}
          <div className="bg-[#100e17] p-4 rounded-xl border border-[#332d47] flex flex-col justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono text-[#c4c7c8] block">Import Local Backup</span>
              <span className="text-xs text-[#e2e8f0]">Restore certificates from JSON</span>
            </div>
            <label className="px-3.5 py-2 rounded-lg bg-[#181524] hover:bg-[#251f38] border border-[#332d47] hover:border-[#a855f7] text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import Database (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportDatabase}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Cloud Sync option if desired */}
        {hostingMode === 'cloud' && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#100e17] border border-[#332d47] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#c4c7c8]">
              Push all local offline changes to the Supabase cloud cluster:
            </span>
            <button
              onClick={handleSyncToCloud}
              disabled={isSyncing}
              className="btn-purple px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Force Sync to Cloud'}</span>
            </button>
          </div>
        )}

        {/* Feedback Banner */}
        {feedbackMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              {feedbackMessage}
            </span>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-emerald-400 hover:text-white px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Recently Issued Certificates Section */}
      <div className="bg-[#181524] rounded-[24px] p-6 sm:p-8 border border-[#332d47] shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#332d47]">
          <div>
            <h2 className="text-lg font-serif text-[#ffffff] font-normal">Recently Generated Certificates</h2>
            <p className="text-xs text-[#c4c7c8] font-light mt-0.5">Quick overview of recent student authentication records</p>
          </div>
          <button
            onClick={() => {
              playSound('droplet');
              onViewAllClick();
            }}
            className="text-xs text-[#c084fc] hover:text-[#ffffff] font-medium flex items-center gap-1 transition-colors"
          >
            <span>View All ({certificates.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentCertificates.length === 0 ? (
          <div className="text-center py-12 bg-[#100e17] rounded-xl border border-[#332d47]">
            <Award className="w-8 h-8 text-[#a855f7] mx-auto mb-2 opacity-50" />
            <p className="text-sm text-[#ffffff] font-medium">No certificates issued yet</p>
            <p className="text-xs text-[#c4c7c8] font-light mt-1">Click "+ Generate Certificate" to create your first record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#332d47] text-[#c4c7c8] font-mono uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-3">Student</th>
                  <th className="pb-3 px-3">Course</th>
                  <th className="pb-3 px-3">Auth ID</th>
                  <th className="pb-3 px-3">Issue Date</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#332d47]/50">
                {recentCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-[#1f1b2e]/60 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-[#ffffff] whitespace-nowrap">
                      {cert.studentName}
                      {cert.certificateNumber && (
                        <span className="block text-[10px] font-mono text-[#c4c7c8] font-normal">
                          {cert.certificateNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-[#e2e8f0] whitespace-nowrap">
                      {cert.course}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#c084fc] font-medium whitespace-nowrap">
                      {cert.id}
                    </td>
                    <td className="py-3.5 px-3 text-[#c4c7c8] whitespace-nowrap">
                      {cert.dateIssued}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {cert.status === 'valid' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[10px] font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-400 text-[10px] font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            playSound('scan');
                            onSelectCertificate(cert);
                          }}
                          className="p-1.5 rounded-lg bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-[#ffffff] hover:border-[#a855f7] transition-all"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {onEditCertificate && (
                          <button
                            onClick={() => {
                              playSound('toggle');
                              onEditCertificate(cert);
                            }}
                            className="p-1.5 rounded-lg bg-[#100e17] border border-[#332d47] text-[#c084fc] hover:text-[#ffffff] hover:border-[#a855f7] transition-all"
                            title="Edit Certificate Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleCopy(cert.id)}
                          className="p-1.5 rounded-lg bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-[#c084fc] hover:border-[#a855f7] transition-all"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            playSound('scan');
                            onOpenPublicPage(cert.id);
                          }}
                          className="p-1.5 rounded-lg bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-[#a855f7] hover:border-[#a855f7] transition-all"
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
        )}
      </div>

    </div>
  );
};
