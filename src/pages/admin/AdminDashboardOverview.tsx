import React from 'react';
import { motion } from 'motion/react';
import { Plus, Award, CheckCircle2, AlertOctagon, Clock, ArrowRight, ExternalLink, Copy, Search, Eye } from 'lucide-react';
import { CertificateRecord, getCertificateStats, getPublicAuthUrl } from '../../services/certificateService';
import { playSound } from '../../utils/soundEffects';

interface AdminDashboardOverviewProps {
  certificates: CertificateRecord[];
  onGenerateClick: () => void;
  onViewAllClick: () => void;
  onSelectCertificate: (cert: CertificateRecord) => void;
  onOpenPublicPage: (id: string) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  certificates,
  onGenerateClick,
  onViewAllClick,
  onSelectCertificate,
  onOpenPublicPage
}) => {
  const stats = getCertificateStats();
  const recentCertificates = certificates.slice(0, 5);

  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string) => {
    playSound('sparkle');
    const url = getPublicAuthUrl(id);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
