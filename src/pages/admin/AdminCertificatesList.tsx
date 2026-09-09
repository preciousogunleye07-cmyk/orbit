import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Copy, 
  ExternalLink, 
  Download, 
  AlertTriangle, 
  Eye, 
  CheckCircle2, 
  AlertOctagon, 
  RefreshCw, 
  Trash2, 
  Edit3,
  Link as LinkIcon,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  Mail,
  Check
} from 'lucide-react';
import { 
  CertificateRecord, 
  getPublicAuthUrl, 
  getActualBrowserAuthUrl,
  getStudentEmail,
  generateFormattedAuthLinks
} from '../../services/certificateService';
import { downloadQrCode } from '../../utils/qrCode';
import { playSound } from '../../utils/soundEffects';
import { BulkAuthLinksModal } from '../../components/admin/BulkAuthLinksModal';

interface AdminCertificatesListProps {
  certificates: CertificateRecord[];
  onGenerateClick: () => void;
  onSelectCertificate: (cert: CertificateRecord) => void;
  onEditCertificate?: (cert: CertificateRecord) => void;
  onOpenPublicPage: (id: string) => void;
  onRequestRevoke: (cert: CertificateRecord) => void;
  onRequestDelete?: (cert: CertificateRecord) => void;
}

export const AdminCertificatesList: React.FC<AdminCertificatesListProps> = ({
  certificates,
  onGenerateClick,
  onSelectCertificate,
  onEditCertificate,
  onOpenPublicPage,
  onRequestRevoke,
  onRequestDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'revoked'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bulk Authentication Links selection & modal state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkModalInitialIds, setBulkModalInitialIds] = useState<string[] | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quickCopied, setQuickCopied] = useState(false);

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
      const email = getStudentEmail(cert).toLowerCase();
      return (
        cert.studentName.toLowerCase().includes(q) ||
        email.includes(q) ||
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
    showToast('Authentication URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
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

  // Selection helpers
  const isAllPaginatedSelected = useMemo(() => {
    if (paginatedCertificates.length === 0) return false;
    return paginatedCertificates.every(c => selectedIds.has(c.id));
  }, [paginatedCertificates, selectedIds]);

  const handleToggleSelectAllPaginated = () => {
    playSound('soft');
    const next = new Set(selectedIds);
    if (isAllPaginatedSelected) {
      paginatedCertificates.forEach(c => next.delete(c.id));
    } else {
      paginatedCertificates.forEach(c => next.add(c.id));
    }
    setSelectedIds(next);
  };

  const handleToggleStudentSelect = (id: string) => {
    playSound('soft');
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAllFiltered = () => {
    playSound('chime');
    const next = new Set(selectedIds);
    filteredCertificates.forEach(c => next.add(c.id));
    setSelectedIds(next);
    showToast(`Selected all ${filteredCertificates.length} matching students.`);
  };

  const handleDeselectAll = () => {
    playSound('release');
    setSelectedIds(new Set());
  };

  // Open Bulk Modal for ALL or Filtered
  const handleOpenBulkModalAll = () => {
    playSound('chime');
    if (selectedIds.size > 0) {
      setBulkModalInitialIds(Array.from(selectedIds));
    } else {
      // Default to all current filtered certificates
      setBulkModalInitialIds(filteredCertificates.map(c => c.id));
    }
    setIsBulkModalOpen(true);
  };

  // Quick Copy Selected directly
  const handleQuickCopySelected = async () => {
    const selectedList = certificates.filter(c => selectedIds.has(c.id));
    if (selectedList.length === 0) return;

    try {
      const text = generateFormattedAuthLinks(selectedList, {
        format: 'with-email',
        fields: {
          studentName: true,
          email: true,
          authUrl: true,
          course: false,
          dateIssued: false,
          certificateType: false,
          completionDate: false,
          credentialId: false,
          studentId: false,
          status: false
        },
        customSeparator: ' — '
      });

      await navigator.clipboard.writeText(text);
      playSound('sparkle');
      setQuickCopied(true);
      setTimeout(() => setQuickCopied(false), 2000);
      showToast(`${selectedList.length} authentication link${selectedList.length === 1 ? '' : 's'} copied successfully.`);
    } catch (err) {
      console.error(err);
      showToast(`Copied ${selectedList.length} authentication link${selectedList.length === 1 ? '' : 's'}.`);
    }
  };

  return (
    <div className="space-y-6 relative">

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#161224] border border-emerald-500/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-emerald-100">{toastMessage}</span>
        </div>
      )}
      
      {/* Top Header & Search Control */}
      <div className="bg-[#181524] rounded-[24px] p-6 sm:p-8 border border-[#332d47] shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-[#332d47]">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-serif text-[#ffffff] font-normal">Certificates Directory</h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
                {certificates.length} Total
              </span>
            </div>
            <p className="text-xs text-[#c4c7c8] font-light mt-1">
              Search, filter, view details, export authentication URLs, and manage student certificate records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            {/* Primary Request: Copy All Authentication Links Button */}
            <button
              id="copy-all-auth-links-btn"
              onClick={handleOpenBulkModalAll}
              className="px-4 py-3 rounded-full font-semibold text-xs flex items-center gap-2 bg-[#221c33] border border-purple-500/50 text-purple-200 hover:text-white hover:bg-purple-900/40 hover:border-purple-400 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 min-h-[44px]"
              title="Copy all generated student authentication URLs to clipboard"
            >
              <LinkIcon className="w-4 h-4 text-purple-400" />
              <span>Copy All Authentication Links</span>
            </button>

            <button
              onClick={onGenerateClick}
              className="btn-purple py-3 px-5 rounded-full font-semibold text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all shrink-0 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Generate Certificate</span>
            </button>
          </div>
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
              placeholder="Search by student name, email, Auth ID, course, or cert number..."
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

        {/* Selection helper bar */}
        {filteredCertificates.length > 0 && (
          <div className="pt-4 mt-4 border-t border-[#2d2740] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSelectAllPaginated}
                className="px-2.5 py-1 rounded-lg bg-[#141120] hover:bg-[#1e1930] text-purple-300 border border-[#332d47] transition-colors flex items-center gap-1.5"
              >
                {isAllPaginatedSelected ? (
                  <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-[#64748b]" />
                )}
                <span>{isAllPaginatedSelected ? 'Deselect Page' : 'Select Page'}</span>
              </button>

              <button
                onClick={handleSelectAllFiltered}
                className="px-2.5 py-1 rounded-lg bg-[#141120] hover:bg-[#1e1930] text-[#cbd5e1] border border-[#332d47] transition-colors"
              >
                Select All Filtered ({filteredCertificates.length})
              </button>

              {selectedIds.size > 0 && (
                <button
                  onClick={handleDeselectAll}
                  className="px-2.5 py-1 rounded-lg bg-[#141120] hover:bg-[#1e1930] text-[#94a3b8] hover:text-rose-300 border border-[#332d47] transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="text-[11px] text-[#94a3b8]">
              {selectedIds.size > 0 ? (
                <span className="text-purple-300 font-medium">
                  {selectedIds.size} of {certificates.length} students selected
                </span>
              ) : (
                <span>Click checkboxes to select specific students to copy</span>
              )}
            </div>
          </div>
        )}
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
            {/* Desktop Table View (hidden on mobile for responsive cleanliness) */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#332d47] bg-[#100e17]/80 shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#332d47] bg-[#14111f] text-[#94a3b8] font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={isAllPaginatedSelected}
                        onChange={handleToggleSelectAllPaginated}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-700 bg-gray-900 cursor-pointer"
                        title="Select/Deselect All on this page"
                      />
                    </th>
                    <th className="py-3.5 px-4">Student Name & Email</th>
                    <th className="py-3.5 px-4">Course / Track</th>
                    <th className="py-3.5 px-4">Authentication ID</th>
                    <th className="py-3.5 px-4">Date Issued</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#332d47]/50">
                  {paginatedCertificates.map((cert) => {
                    const isSelected = selectedIds.has(cert.id);
                    const email = getStudentEmail(cert);

                    return (
                      <tr 
                        key={cert.id} 
                        className={`transition-colors ${
                          isSelected ? 'bg-purple-950/25 hover:bg-purple-950/35' : 'hover:bg-[#1f1b2e]/60'
                        }`}
                      >
                        {/* Checkbox column */}
                        <td className="py-4 px-3 w-8">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleStudentSelect(cert.id)}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-700 bg-gray-900 cursor-pointer"
                          />
                        </td>

                        {/* Student Name & Email */}
                        <td className="py-4 px-3 font-semibold text-[#ffffff] whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-white">{cert.studentName}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-sans text-purple-300 flex items-center gap-1 font-normal">
                                <Mail className="w-2.5 h-2.5 text-purple-400" />
                                {email}
                              </span>
                              {cert.certificateNumber && (
                                <>
                                  <span className="text-[9px] text-[#64748b]">•</span>
                                  <span className="text-[10px] font-mono text-[#c4c7c8] font-normal">
                                    {cert.certificateNumber}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-3 text-[#e2e8f0] whitespace-nowrap">
                          {cert.course}
                        </td>

                        <td className="py-4 px-3 font-mono text-[#c084fc] font-semibold whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{cert.id}</span>
                          </div>
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
                            {onEditCertificate && (
                              <button
                                onClick={() => {
                                  playSound('toggle');
                                  onEditCertificate(cert);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-purple-950/50 border border-purple-800/60 text-purple-300 hover:text-white hover:bg-purple-900/80 transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
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
                              className="p-2 rounded-lg bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-[#ffffff] hover:border-[#a855f7] transition-all flex items-center gap-1 text-[11px] cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#a855f7]" />
                              <span className="hidden sm:inline">View</span>
                            </button>

                            <button
                              onClick={() => handleCopy(cert.id)}
                              className="p-2 rounded-lg bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-[#c084fc] hover:border-[#a855f7] transition-all cursor-pointer"
                              title="Copy Authentication URL"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                playSound('scan');
                                onOpenPublicPage(cert.id);
                              }}
                              className="p-2 rounded-lg bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-[#a855f7] hover:border-[#a855f7] transition-all cursor-pointer"
                              title="Open Authentication Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDownloadQr(cert)}
                              className="p-2 rounded-lg bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-[#c084fc] hover:border-[#a855f7] transition-all cursor-pointer"
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
                                className="p-2 rounded-lg bg-[#100e17] border border-[#332d47] text-amber-400 hover:bg-amber-950/40 hover:border-amber-800 transition-all cursor-pointer"
                                title="Revoke Certificate"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {onRequestDelete && (
                              <button
                                onClick={() => {
                                  playSound('toggle');
                                  onRequestDelete(cert);
                                }}
                                className="p-2 rounded-lg bg-[#100e17] border border-[#332d47] text-rose-400 hover:bg-rose-950/50 hover:border-rose-800 transition-all cursor-pointer"
                                title="Permanently Delete Certificate"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (displayed on mobile devices for easy editing and viewing) */}
            <div className="md:hidden space-y-3.5">
              {paginatedCertificates.map((cert) => {
                const isSelected = selectedIds.has(cert.id);
                const email = getStudentEmail(cert);

                return (
                  <div
                    key={cert.id}
                    className={`bg-[#100e17] rounded-2xl p-4 border transition-colors space-y-3 ${
                      isSelected ? 'border-purple-500 bg-purple-950/20' : 'border-[#332d47]'
                    }`}
                  >
                    {/* Header row: Checkbox, Name, Status */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleStudentSelect(cert.id)}
                          className="w-4 h-4 mt-0.5 rounded text-purple-600 focus:ring-purple-500 border-gray-700 bg-gray-900 cursor-pointer"
                        />
                        <div>
                          <h4 className="text-sm font-semibold text-white leading-tight">
                            {cert.studentName}
                          </h4>
                          <span className="text-xs text-purple-300 font-medium">
                            {cert.course}
                          </span>
                        </div>
                      </div>

                      {cert.status === 'valid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[10px] font-mono shrink-0">
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-400 text-[10px] font-mono shrink-0">
                          <span className="w-1 h-1 rounded-full bg-rose-400" />
                          Revoked
                        </span>
                      )}
                    </div>

                    {/* Meta information row */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#181524] p-2.5 rounded-xl border border-[#332d47]/60">
                      <div>
                        <span className="text-[#94a3b8] block text-[10px]">Auth ID:</span>
                        <span className="font-mono text-[#c084fc] font-medium">{cert.id}</span>
                      </div>
                      <div>
                        <span className="text-[#94a3b8] block text-[10px]">Issue Date:</span>
                        <span className="font-mono text-white">{cert.dateIssued}</span>
                      </div>
                      {email && (
                        <div className="col-span-2 text-[10px] text-purple-300 truncate">
                          {email}
                        </div>
                      )}
                    </div>

                    {/* Primary Actions Grid for Easy Editing and Interaction */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {onEditCertificate && (
                        <button
                          onClick={() => {
                            playSound('toggle');
                            onEditCertificate(cert);
                          }}
                          className="py-2 px-3 rounded-xl bg-purple-950/70 border border-purple-600/70 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 active:bg-purple-900 transition-all cursor-pointer"
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
                        className="py-2 px-3 rounded-xl bg-[#181524] border border-[#332d47] text-white text-xs font-medium flex items-center justify-center gap-1.5 active:bg-[#231e33] transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-purple-400" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleCopy(cert.id)}
                        className="py-2 px-3 rounded-xl bg-[#181524] border border-[#332d47] text-[#c4c7c8] text-xs font-medium flex items-center justify-center gap-1.5 active:bg-[#231e33] transition-all cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedId === cert.id ? 'Copied!' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => {
                          playSound('scan');
                          onOpenPublicPage(cert.id);
                        }}
                        className="py-2 px-3 rounded-xl bg-[#181524] border border-[#332d47] text-[#c4c7c8] text-xs font-medium flex items-center justify-center gap-1.5 active:bg-[#231e33] transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Verify</span>
                      </button>
                    </div>
                  </div>
                );
              })}
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

      {/* Floating Bottom Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#161224]/95 border border-purple-500/60 shadow-2xl rounded-2xl px-5 py-3.5 flex items-center gap-3 sm:gap-4 text-xs text-white backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 text-purple-300 font-semibold font-mono">
            <CheckSquare className="w-4 h-4 text-purple-400" />
            <span>
              {selectedIds.size} student{selectedIds.size === 1 ? '' : 's'} selected
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#332d47]" />

          <button
            onClick={handleQuickCopySelected}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-1.5 transition-colors shadow-md shadow-purple-900/30"
          >
            {quickCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{quickCopied ? 'Copied!' : `Copy Links (${selectedIds.size})`}</span>
          </button>

          <button
            onClick={() => {
              playSound('chime');
              setBulkModalInitialIds(Array.from(selectedIds));
              setIsBulkModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#221d33] hover:bg-[#2c2642] text-purple-200 border border-[#373052] font-medium flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Customize Fields & Format...</span>
            <span className="sm:hidden">Format...</span>
          </button>

          <button
            onClick={handleDeselectAll}
            className="text-[#94a3b8] hover:text-white px-2 py-1 transition-colors text-xs"
          >
            Clear
          </button>
        </div>
      )}

      {/* Bulk Authentication Links Modal */}
      {isBulkModalOpen && (
        <BulkAuthLinksModal
          certificates={certificates}
          initialSelectedIds={bulkModalInitialIds}
          isOpen={isBulkModalOpen}
          onClose={() => {
            setIsBulkModalOpen(false);
            setBulkModalInitialIds(undefined);
          }}
          onCopiedSuccess={(msg) => {
            showToast(msg);
          }}
        />
      )}

    </div>
  );
};
