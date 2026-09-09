import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  FileText, 
  Link as LinkIcon, 
  Download, 
  Sparkles, 
  Mail, 
  Calendar, 
  Award, 
  ExternalLink,
  Table,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';
import { 
  CertificateRecord, 
  getStudentEmail, 
  formatFriendlyDate, 
  getPublicAuthUrl,
  getActualBrowserAuthUrl,
  AuthLinksExportFields, 
  AuthLinksExportFormat, 
  DEFAULT_AUTH_LINKS_FIELDS,
  generateFormattedAuthLinks 
} from '../../services/certificateService';
import { playSound } from '../../utils/soundEffects';

interface BulkAuthLinksModalProps {
  certificates: CertificateRecord[];
  initialSelectedIds?: string[];
  isOpen: boolean;
  onClose: () => void;
  onCopiedSuccess: (message: string) => void;
}

export const BulkAuthLinksModal: React.FC<BulkAuthLinksModalProps> = ({
  certificates,
  initialSelectedIds,
  isOpen,
  onClose,
  onCopiedSuccess
}) => {
  // Step 1: Student Selection & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (initialSelectedIds && initialSelectedIds.length > 0) {
      return new Set(initialSelectedIds);
    }
    return new Set(certificates.map(c => c.id));
  });

  // Sync selectedIds when initialSelectedIds or certificates change when opening
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedIds && initialSelectedIds.length > 0) {
        setSelectedIds(new Set(initialSelectedIds));
      } else {
        setSelectedIds(new Set(certificates.map(c => c.id)));
      }
    }
  }, [isOpen, initialSelectedIds, certificates]);

  // Step 2: Information / Field Selection
  const [fields, setFields] = useState<AuthLinksExportFields>({
    ...DEFAULT_AUTH_LINKS_FIELDS
  });

  // Step 3: Format Selection
  const [format, setFormat] = useState<AuthLinksExportFormat>('with-email');
  const [separator, setSeparator] = useState(' — ');
  const [useBrowserDomain, setUseBrowserDomain] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active step view tab (All in one streamlined view with tab shortcuts)
  const [activeTab, setActiveTab] = useState<'students' | 'fields' | 'preview'>('students');

  // Extract unique courses and types for filtering
  const coursesList = useMemo(() => {
    const set = new Set<string>();
    certificates.forEach(c => {
      if (c.course) set.add(c.course);
    });
    return Array.from(set).sort();
  }, [certificates]);

  const certTypesList = useMemo(() => {
    const set = new Set<string>();
    certificates.forEach(c => {
      if (c.certificateType) set.add(c.certificateType);
    });
    return Array.from(set).sort();
  }, [certificates]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return certificates.filter(cert => {
      // Course filter
      if (courseFilter !== 'ALL' && cert.course !== courseFilter) return false;
      // Status filter
      if (statusFilter !== 'ALL' && cert.status !== statusFilter) return false;
      // Type filter
      if (typeFilter !== 'ALL' && cert.certificateType !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = cert.studentName.toLowerCase();
        const email = getStudentEmail(cert).toLowerCase();
        const id = cert.id.toLowerCase();
        const course = cert.course.toLowerCase();
        const certNum = (cert.certificateNumber || '').toLowerCase();
        const studId = (cert.studentId || '').toLowerCase();

        return name.includes(q) || email.includes(q) || id.includes(q) || course.includes(q) || certNum.includes(q) || studId.includes(q);
      }

      return true;
    });
  }, [certificates, courseFilter, statusFilter, typeFilter, searchQuery]);

  // Selected students objects in current filter order
  const selectedStudentsList = useMemo(() => {
    return certificates.filter(c => selectedIds.has(c.id));
  }, [certificates, selectedIds]);

  // Generate output text dynamically
  const outputText = useMemo(() => {
    return generateFormattedAuthLinks(selectedStudentsList, {
      format,
      fields,
      customSeparator: separator,
      useBrowserDomain
    });
  }, [selectedStudentsList, format, fields, separator, useBrowserDomain]);

  // Handler: Select All Visible
  const handleSelectAllVisible = () => {
    playSound('chime');
    const newSet = new Set(selectedIds);
    filteredStudents.forEach(c => newSet.add(c.id));
    setSelectedIds(newSet);
  };

  // Handler: Select All Total
  const handleSelectAllTotal = () => {
    playSound('chime');
    setSelectedIds(new Set(certificates.map(c => c.id)));
  };

  // Handler: Deselect All
  const handleDeselectAll = () => {
    playSound('release');
    setSelectedIds(new Set());
  };

  // Handler: Toggle single student
  const handleToggleStudent = (id: string) => {
    playSound('soft');
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Field toggles
  const handleToggleField = (fieldKey: keyof AuthLinksExportFields) => {
    playSound('soft');
    setFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  // Reset fields to match selected format
  const handleFormatChange = (newFormat: AuthLinksExportFormat) => {
    playSound('soft');
    setFormat(newFormat);
    if (newFormat === 'simple') {
      setFields(prev => ({
        ...prev,
        studentName: true,
        email: false,
        authUrl: true
      }));
    } else if (newFormat === 'with-email') {
      setFields(prev => ({
        ...prev,
        studentName: true,
        email: true,
        authUrl: true
      }));
    } else if (newFormat === 'detailed') {
      setFields(prev => ({
        ...prev,
        studentName: true,
        email: true,
        course: true,
        dateIssued: true,
        authUrl: true
      }));
    }
  };

  // Primary Copy Action
  const handleCopy = async () => {
    if (selectedStudentsList.length === 0) {
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      playSound('sparkle');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      const count = selectedStudentsList.length;
      const msg = `${count} authentication link${count === 1 ? '' : 's'} copied successfully.`;
      onCopiedSuccess(msg);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = outputText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      const count = selectedStudentsList.length;
      onCopiedSuccess(`${count} authentication link${count === 1 ? '' : 's'} copied successfully.`);
    }
  };

  // Download export as file
  const handleDownloadFile = () => {
    playSound('chime');
    const isCsv = format === 'spreadsheet-csv';
    const isTsv = format === 'spreadsheet-tsv';
    const ext = isCsv ? 'csv' : isTsv ? 'tsv' : 'txt';
    const mime = isCsv ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';

    const blob = new Blob([outputText], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `OrbitSpace_Student_Auth_Links_${new Date().toISOString().split('T')[0]}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-[#181524] border border-[#332d47] rounded-[24px] max-w-5xl w-full shadow-2xl relative my-auto flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#332d47] flex items-center justify-between bg-[#151221] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-serif text-[#ffffff] font-medium tracking-tight">
                  Student Authentication-Link Manager
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
                  Bulk Export
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Select students, customize fields, pick your preferred output layout, and copy in one click.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('release');
              onClose();
            }}
            className="p-2 text-[#94a3b8] hover:text-[#ffffff] rounded-xl bg-[#1f1b2e] border border-[#332d47] hover:border-purple-500/40 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workflow Steps Navigation Bar */}
        <div className="px-6 py-3 bg-[#110e1a] border-b border-[#2d2740] flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'students'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-[#1e1a2f] text-[#cbd5e1] hover:text-white border border-[#332d47]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Select Students</span>
              <span className="text-[10px] opacity-80 px-1.5 py-0.2 rounded bg-black/30 font-mono">
                {selectedStudentsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('fields')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'fields'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-[#1e1a2f] text-[#cbd5e1] hover:text-white border border-[#332d47]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Select Information</span>
              <span className="text-[10px] opacity-80 px-1.5 py-0.2 rounded bg-black/30 font-mono">
                {Object.values(fields).filter(Boolean).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-[#1e1a2f] text-[#cbd5e1] hover:text-white border border-[#332d47]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">3</span>
              <span>Format & Preview</span>
              <Sparkles className="w-3 h-3 text-purple-300" />
            </button>
          </div>

          {/* Quick Counter */}
          <div className="text-xs text-[#94a3b8] flex items-center gap-2">
            <span>Ready to copy:</span>
            <span className="text-purple-300 font-semibold font-mono bg-purple-950/50 border border-purple-800/40 px-2 py-0.5 rounded-md">
              {selectedStudentsList.length} of {certificates.length}
            </span>
          </div>
        </div>

        {/* Modal Body - Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: SELECT STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="bg-[#120f1d] p-4 rounded-xl border border-[#2d2740] space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search student name, email, ID, or course..."
                      className="w-full bg-[#1b172a] border border-[#332d47] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-purple-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748b] hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Course Filter */}
                  <select
                    value={courseFilter}
                    onChange={e => setCourseFilter(e.target.value)}
                    className="bg-[#1b172a] border border-[#332d47] rounded-xl px-3 py-2 text-xs text-[#cbd5e1] focus:outline-none focus:border-purple-500"
                  >
                    <option value="ALL">All Courses ({coursesList.length})</option>
                    {coursesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-[#1b172a] border border-[#332d47] rounded-xl px-3 py-2 text-xs text-[#cbd5e1] focus:outline-none focus:border-purple-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="valid">Valid Only</option>
                    <option value="revoked">Revoked Only</option>
                  </select>
                </div>

                {/* Bulk Selection Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#231e33] text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSelectAllVisible}
                      className="px-2.5 py-1 rounded-lg bg-[#221d33] hover:bg-[#2c2642] text-purple-300 border border-[#373052] transition-colors flex items-center gap-1.5"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Select Visible ({filteredStudents.length})</span>
                    </button>
                    <button
                      onClick={handleSelectAllTotal}
                      className="px-2.5 py-1 rounded-lg bg-[#221d33] hover:bg-[#2c2642] text-[#cbd5e1] border border-[#373052] transition-colors"
                    >
                      Select All Total ({certificates.length})
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="px-2.5 py-1 rounded-lg bg-[#221d33] hover:bg-[#2c2642] text-[#94a3b8] hover:text-rose-300 border border-[#373052] transition-colors flex items-center gap-1.5"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Deselect All</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-[#94a3b8]">
                    Showing <strong className="text-white">{filteredStudents.length}</strong> students matching filters
                  </span>
                </div>
              </div>

              {/* Student List Table / Cards */}
              <div className="bg-[#120f1d] border border-[#2d2740] rounded-xl overflow-hidden">
                <div className="max-h-[380px] overflow-y-auto divide-y divide-[#231e33]">
                  {filteredStudents.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-xs text-[#94a3b8]">No students matched your search criteria.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setCourseFilter('ALL');
                          setStatusFilter('ALL');
                        }}
                        className="mt-2 text-xs text-purple-400 hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    filteredStudents.map(student => {
                      const isSelected = selectedIds.has(student.id);
                      const email = getStudentEmail(student);
                      const authUrl = getPublicAuthUrl(student.id);

                      return (
                        <div
                          key={student.id}
                          onClick={() => handleToggleStudent(student.id)}
                          className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-purple-950/20 hover:bg-purple-950/30'
                              : 'hover:bg-[#1a1628] opacity-75'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="text-purple-400 shrink-0">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-purple-400" />
                              ) : (
                                <Square className="w-4 h-4 text-[#4b5563]" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium text-white">
                                  {student.studentName}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1f1b2e] border border-[#332d47] text-purple-300">
                                  {student.id}
                                </span>
                                {student.status === 'revoked' && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300 uppercase font-semibold">
                                    Revoked
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 mt-1 text-[11px] text-[#94a3b8] flex-wrap">
                                <span className="flex items-center gap-1 text-[#cbd5e1]">
                                  <Mail className="w-3 h-3 text-[#7c3aed]" />
                                  <span className="truncate max-w-[200px]">{email}</span>
                                </span>
                                <span className="text-[#64748b]">•</span>
                                <span className="truncate max-w-[200px]">{student.course}</span>
                                <span className="text-[#64748b]">•</span>
                                <span>{formatFriendlyDate(student.dateIssued)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Link snippet */}
                          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-[#94a3b8] bg-[#1a1628] px-2.5 py-1 rounded-md border border-[#2d2740] shrink-0">
                            <LinkIcon className="w-3 h-3 text-purple-400" />
                            <span className="truncate max-w-[170px]">{authUrl}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SELECT INFORMATION (FIELDS) */}
          {activeTab === 'fields' && (
            <div className="space-y-5">
              <div className="bg-[#120f1d] p-4 rounded-xl border border-[#2d2740]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                      Choose Information to Include
                    </h3>
                    <p className="text-[11px] text-[#94a3b8] mt-0.5">
                      Toggle which student credentials and records appear in your copied authentication links.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => {
                        playSound('soft');
                        setFields({
                          studentName: true,
                          email: true,
                          authUrl: true,
                          course: true,
                          dateIssued: true,
                          certificateType: true,
                          completionDate: true,
                          credentialId: true,
                          studentId: true,
                          status: true
                        });
                      }}
                      className="text-purple-400 hover:underline"
                    >
                      Check All
                    </button>
                    <span className="text-[#4b5563]">•</span>
                    <button
                      onClick={() => {
                        playSound('soft');
                        setFields({
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
                        });
                      }}
                      className="text-[#94a3b8] hover:underline"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Student Name */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1b172a] border border-[#332d47] hover:border-purple-500/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={fields.studentName}
                      onChange={() => handleToggleField('studentName')}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-700 bg-gray-900"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Student Name</span>
                      <span className="text-[10px] text-[#94a3b8]">e.g. John Doe</span>
                    </div>
                  </label>

                  {/* Student Email */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1b172a] border border-[#332d47] hover:border-purple-500/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={fields.email}
                      onChange={() => handleToggleField('email')}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-700 bg-gray-900"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Student Email</span>
                      <span className="text-[10px] text-[#94a3b8]">e.g. john@example.com</span>
                    </div>
                  </label>

                  {/* Authentication URL */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={fields.authUrl}
                      onChange={() => handleToggleField('authUrl')}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-700 bg-gray-900"
                    />
                    <div>
                      <span className="text-xs font-medium text-purple-200 block">Authentication URL</span>
                      <span className="text-[10px] text-purple-300/80">e.g. https://orbitspace.academy/ORB-8F29K2</span>
                    </div>
                  </label>

                  {/* Course Name */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1b172a] border border-[#332d47] hover:border-purple-500/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={fields.course}
                      onChange={() => handleToggleField('course')}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-700 bg-gray-900"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Course</span>
                      <span className="text-[10px] text-[#94a3b8]">e.g. Full-Stack Web Development</span>
                    </div>
                  </label>

                  {/* Date Issued */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1b172a] border border-[#332d47] hover:border-purple-500/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={fields.dateIssued}
                      onChange={() => handleToggleField('dateIssued')}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-700 bg-gray-900"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Date Issued</span>
                      <span className="text-[10px] text-[#94a3b8]">e.g. February 15, 2026</span>
                    </div>
                  </label>

                  {/* Certificate / Credential Type */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1b172a] border border-[#332d47] hover:border-purple-500/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={fields.certificateType}
                      onChange={() => handleToggleField('certificateType')}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-700 bg-gray-900"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Credential / Cert Type</span>
                      <span className="text-[10px] text-[#94a3b8]">e.g. Professional Certificate</span>
                    </div>
                  </label>

                  {/* Completion Date */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1b172a] border border-[#332d47] hover:border-purple-500/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={fields.completionDate}
                      onChange={() => handleToggleField('completionDate')}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-700 bg-gray-900"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Completion Date</span>
                      <span className="text-[10px] text-[#94a3b8]">Graduation timestamp</span>
                    </div>
                  </label>

                  {/* Credential ID */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1b172a] border border-[#332d47] hover:border-purple-500/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={fields.credentialId}
                      onChange={() => handleToggleField('credentialId')}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-700 bg-gray-900"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Credential ID Code</span>
                      <span className="text-[10px] text-[#94a3b8]">e.g. ORB-8F29K2</span>
                    </div>
                  </label>

                  {/* Student ID / Cert Number */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1b172a] border border-[#332d47] hover:border-purple-500/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={fields.studentId}
                      onChange={() => handleToggleField('studentId')}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-700 bg-gray-900"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Student / Roll ID</span>
                      <span className="text-[10px] text-[#94a3b8]">e.g. OS-2025-089</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FORMAT & PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-5">
              {/* Format Selectors */}
              <div className="bg-[#120f1d] p-4 rounded-xl border border-[#2d2740] space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-1">
                    Select Output Format
                  </h3>
                  <p className="text-[11px] text-[#94a3b8]">
                    Choose the copy structure optimized for messaging (WhatsApp/Slack), formal emails, or spreadsheets.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {/* With Email */}
                  <button
                    onClick={() => handleFormatChange('with-email')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      format === 'with-email'
                        ? 'bg-purple-950/40 border-purple-500 text-white shadow-md shadow-purple-950/40'
                        : 'bg-[#1a1628] border-[#332d47] text-[#cbd5e1] hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold">With Email</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[10px] text-[#94a3b8] font-mono leading-relaxed truncate">
                      Name — Email — Link
                    </p>
                  </button>

                  {/* Simple */}
                  <button
                    onClick={() => handleFormatChange('simple')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      format === 'simple'
                        ? 'bg-purple-950/40 border-purple-500 text-white shadow-md shadow-purple-950/40'
                        : 'bg-[#1a1628] border-[#332d47] text-[#cbd5e1] hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold">Simple</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-[#94a3b8] font-mono">
                        Clean
                      </span>
                    </div>
                    <p className="text-[10px] text-[#94a3b8] font-mono leading-relaxed truncate">
                      Name — Link
                    </p>
                  </button>

                  {/* Detailed */}
                  <button
                    onClick={() => handleFormatChange('detailed')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      format === 'detailed'
                        ? 'bg-purple-950/40 border-purple-500 text-white shadow-md shadow-purple-950/40'
                        : 'bg-[#1a1628] border-[#332d47] text-[#cbd5e1] hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold">Detailed</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-[#94a3b8] font-mono">
                        Multi-line
                      </span>
                    </div>
                    <p className="text-[10px] text-[#94a3b8] font-mono leading-relaxed truncate">
                      Name: ... Email: ... Link: ...
                    </p>
                  </button>

                  {/* Spreadsheet (TSV / Excel) */}
                  <button
                    onClick={() => handleFormatChange('spreadsheet-tsv')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      format === 'spreadsheet-tsv'
                        ? 'bg-purple-950/40 border-purple-500 text-white shadow-md shadow-purple-950/40'
                        : 'bg-[#1a1628] border-[#332d47] text-[#cbd5e1] hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold">Excel / Sheets</span>
                      <Table className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-[#94a3b8] font-mono leading-relaxed truncate">
                      Tab-separated table rows
                    </p>
                  </button>
                </div>

                {/* Additional Formatting Settings */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#231e33] text-xs">
                  {format !== 'detailed' && format !== 'spreadsheet-tsv' && format !== 'spreadsheet-csv' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#94a3b8]">Separator:</span>
                      <select
                        value={separator}
                        onChange={e => setSeparator(e.target.value)}
                        className="bg-[#1b172a] border border-[#332d47] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value=" — ">Em Dash ( — )</option>
                        <option value=" | ">Vertical Bar ( | )</option>
                        <option value=" - ">Hyphen ( - )</option>
                        <option value=", ">Comma ( , )</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-[#94a3b8]">Domain:</span>
                    <button
                      onClick={() => setUseBrowserDomain(prev => !prev)}
                      className="px-2.5 py-1 rounded-lg bg-[#1b172a] border border-[#332d47] text-[#cbd5e1] hover:text-white font-mono text-[11px]"
                    >
                      {useBrowserDomain ? window.location.origin : 'https://orbitspace.academy'} (click to toggle)
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="bg-[#120f1d] p-4 rounded-xl border border-[#2d2740] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                      Live Output Preview
                    </h4>
                    <span className="text-[10px] text-[#94a3b8] font-mono">
                      ({selectedStudentsList.length} items, {outputText.length} characters)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadFile}
                      className="text-xs text-[#94a3b8] hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1b172a] border border-[#332d47] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <pre className="w-full max-h-[220px] overflow-y-auto bg-[#0b0a12] border border-[#252033] rounded-xl p-3.5 text-[11px] font-mono text-[#cbd5e1] whitespace-pre leading-relaxed select-all">
                    {outputText || 'No students selected to format.'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Quick Preview at bottom of Tab 1 & 2 for instant feedback */}
          {activeTab !== 'preview' && (
            <div className="bg-[#120f1d] p-3.5 rounded-xl border border-[#2d2740] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs text-[#cbd5e1]">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  Format:{' '}
                  <strong className="text-white capitalize">{format.replace('-', ' ')}</strong>
                  {' • '}
                  <span className="text-purple-300 font-mono font-medium">
                    {selectedStudentsList.length} students selected
                  </span>
                </span>
              </div>

              <button
                onClick={() => setActiveTab('preview')}
                className="text-xs text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 font-medium"
              >
                <span>View Full Preview & Options</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer with Primary Action */}
        <div className="px-6 py-4 bg-[#151221] border-t border-[#332d47] flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="text-xs text-[#94a3b8] flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-purple-400" />
            <span>
              Pasting ready for <strong className="text-white">WhatsApp, Email, Slack, and Excel</strong>.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playSound('release');
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1e1a2f] hover:bg-[#28233e] text-[#cbd5e1] border border-[#332d47] text-xs font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              id="copy-all-auth-links-modal-btn"
              onClick={handleCopy}
              disabled={selectedStudentsList.length === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : selectedStudentsList.length === 0
                  ? 'bg-purple-900/40 text-purple-300/50 cursor-not-allowed border border-purple-900/40'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>
                    Copy {selectedStudentsList.length === certificates.length ? 'All' : selectedStudentsList.length} Authentication Links
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
