import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Copy, ExternalLink, Download, AlertTriangle, Eye, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';
import { CertificateRecord, getPublicAuthUrl, getActualBrowserAuthUrl } from '../../services/certificateService';
import { downloadQrCode } from '../../utils/qrCode';
import { playSound } from '../../utils/soundEffects';

interface AdminCertificatesListProps {
  certificates: CertificateRecord[];
  onGenerateClick: () => void;
  onSelectCertificate: (cert: CertificateRecord) => void;
  onOpenPublicPage: (id: string) => void;
  onRequestRevoke: (cert: CertificateRecord) => void;
}

export const AdminCertificatesList: React.FC<AdminCertificatesListProps> = ({
  certificates,
  onGenerateClick,
  onSelectCertificate,
  onOpenPublicPage,
  onRequestRevoke
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'revoked'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      // Status filter
      if (statusFilter !== 'all' && cert.status !== statusFilter) {
        return false;
      }

      // Search term filter
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase().trim();
      return (
        cert.studentName.toLowerCase().includes(q) ||
        cert.id.toLowerCase().includes(q) ||
        cert.course.toLowerCase().includes(q) ||
        (cert.certificateNumber && cert.certificateNumber.toLowerCase().includes(q)) ||
        (cert.studentId && cert.studentId.toLowerCase().includes(q))
      );
    });
  }, [certificates, searchTerm, statusFilter]);

  // Reset pagination on search / filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage) || 1;
  const paginatedCertificates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCertificates.slice(start, start + itemsPerPage);
  }, [filteredCertificates, currentPage]);

  const handleFilterChange = (filter: 'all' | 'valid' | 'revoked') => {
    playSound('droplet');
    setStatusFilter(filter);
  };

  const handleCopy = (id: string) => {
    playSound('sparkle');
    const url = getPublicAuthUrl(id);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQr = (cert: CertificateRecord) => {
    playSound('chime');
    const browserUrl = getActualBrowserAuthUrl(cert.id);
    downloadQrCode(browserUrl, `Orbit_Space_Certificate_QR_${cert.id}.png`);
  };

  const handlePageChange = (newPage: number) => {
    playSound('page');
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search Control */}
      <div className="bg-[#181524] rounded-[24px] p-6 sm:p-8 border border-[#332d47] shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#332d47]">
          <div>
            <h1 className="text-2xl font-serif text-[#ffffff] font-normal">Certificates Directory</h1>
            <p className="text-xs text-[#c4c7c8] font-light mt-1">
              Search, filter, view details, and manage official Orbit Space student certificate records.
            </p>
          </div>

          <button
            onClick={onGenerateClick}
            className="btn-purple py-3 px-5 rounded-full font-semibold text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all shrink-0 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Generate Certificate</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-[#a855f7] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, Auth ID, course, or cert number..."
              className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#c4c7c8] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#100e17] p-1 rounded-xl border border-[#332d47] w-full sm:w-auto">
            <button
              onClick={() => handleFilterChange('all')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#1f1b2e] text-[#ffffff] shadow-sm border border-[#332d47]'
                  : 'text-[#c4c7c8] hover:text-[#ffffff]'
              }`}
            >
              All ({certificates.length})
            </button>
            <button
              onClick={() => handleFilterChange('valid')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'valid'
                  ? 'bg-emerald-950/60 text-emerald-300 shadow-sm border border-emerald-800/50'
                  : 'text-[#c4c7c8] hover:text-emerald-400'
              }`}
            >
              Valid ({certificates.filter(c => c.status === 'valid').length})
            </button>
            <button
              onClick={() => handleFilterChange('revoked')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'revoked'
                  ? 'bg-rose-950/60 text-rose-300 shadow-sm border border-rose-800/50'
                  : 'text-[#c4c7c8] hover:text-rose-400'
              }`}
            >
              Revoked ({certificates.filter(c => c.status === 'revoked').length})
            </button>
          </div>

        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-[#181524] rounded-[24px] p-6 sm:p-8 border border-[#332d47] shadow-xl">
        {filteredCertificates.length === 0 ? (
          <div className="text-center py-16 bg-[#100e17] rounded-xl border border-[#332d47]">
            <Search className="w-8 h-8 text-[#a855f7] mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-serif text-[#ffffff] font-normal">No certificates match your search</h3>
            <p className="text-xs text-[#c4c7c8] font-light mt-1 max-w-sm mx-auto">
              Try modifying your search keywords or switching filter tabs.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#332d47] text-[#c4c7c8] font-mono uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Student Name</th>
                    <th className="pb-3 px-3">Course / Track</th>
                    <th className="pb-3 px-3">Authentication ID</th>
                    <th className="pb-3 px-3">Date Issued</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#332d47]/50">
                  {paginatedCertificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-[#1f1b2e]/60 transition-colors">
                      <td className="py-4 px-3 font-semibold text-[#ffffff] whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{cert.studentName}</span>
                          <span className="text-[10px] font-mono text-[#c4c7c8] font-normal">
                            {cert.certificateNumber}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-3 text-[#e2e8f0] whitespace-nowrap">
                        {cert.course}
                      </td>

                      <td className="py-4 px-3 font-mono text-[#c084fc] font-semibold whitespace-nowrap">
                        {cert.id}
                      </td>

                      <td className="py-4 px-3 text-[#c4c7c8] whitespace-nowrap">
                        {cert.dateIssued}
                      </td>

                      <td className="py-4 px-3 whitespace-nowrap">
                        {cert.status === 'valid' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[10px] font-mono font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-400 text-[10px] font-mono font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Revoked
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              playSound('scan');
                              onSelectCertificate(cert);
                            }}
                            className="p-2 rounded-lg bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-[#ffffff] hover:border-[#a855f7] transition-all flex items-center gap-1 text-[11px]"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#a855f7]" />
                            <span className="hidden sm:inline">View</span>
                          </button>

                          <button
                            onClick={() => handleCopy(cert.id)}
                            className="p-2 rounded-lg bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-[#c084fc] hover:border-[#a855f7] transition-all"
                            title="Copy Link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              playSound('scan');
                              onOpenPublicPage(cert.id);
                            }}
                            className="p-2 rounded-lg bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-[#a855f7] hover:border-[#a855f7] transition-all"
                            title="Open Authentication Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDownloadQr(cert)}
                            className="p-2 rounded-lg bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-[#c084fc] hover:border-[#a855f7] transition-all"
                            title="Download QR Code"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {cert.status === 'valid' && (
                            <button
                              onClick={() => {
                                playSound('toggle');
                                onRequestRevoke(cert);
                              }}
                              className="p-2 rounded-lg bg-[#100e17] border border-[#332d47] text-rose-400 hover:bg-rose-950/40 hover:border-rose-800 transition-all"
                              title="Revoke Certificate"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Toolbar */}
            {totalPages > 1 && (
              <div className="pt-6 mt-6 border-t border-[#332d47] flex items-center justify-between text-xs text-[#c4c7c8]">
                <span>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCertificates.length)} of {filteredCertificates.length} records
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className="px-3 py-1.5 rounded-lg bg-[#100e17] border border-[#332d47] hover:bg-[#1f1b2e] disabled:opacity-40 transition-all"
                  >
                    Previous
                  </button>
                  <span className="font-mono text-[#ffffff]">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className="px-3 py-1.5 rounded-lg bg-[#100e17] border border-[#332d47] hover:bg-[#1f1b2e] disabled:opacity-40 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};
