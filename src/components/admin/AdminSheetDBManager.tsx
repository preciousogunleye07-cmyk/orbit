import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  Search, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Award, 
  User, 
  Mail, 
  Phone, 
  DollarSign, 
  BookOpen, 
  Hash, 
  Calendar, 
  Filter, 
  Download, 
  Settings, 
  ShieldCheck, 
  Eye, 
  X, 
  Check, 
  Copy,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { 
  SheetDBStudent, 
  fetchSheetDBStudents, 
  fetchSheetDBSettings, 
  checkSheetDBHealth, 
  getSheetDBEndpoint, 
  setSheetDBEndpoint, 
  resetSheetDBEndpoint, 
  addStudentToSheetDB, 
  DEFAULT_SHEETDB_URL,
  DEFAULT_PROGRAMS
} from '../../services/sheetdbService';
import { CertificateRecord } from '../../services/certificateService';
import { playSound } from '../../utils/soundEffects';

interface AdminSheetDBManagerProps {
  certificates: CertificateRecord[];
  onGenerateCertificateForStudent: (student: SheetDBStudent) => void;
  onOpenPublicCertificate?: (id: string) => void;
}

export const AdminSheetDBManager: React.FC<AdminSheetDBManagerProps> = ({
  certificates,
  onGenerateCertificateForStudent,
  onOpenPublicCertificate
}) => {
  // State
  const [students, setStudents] = useState<SheetDBStudent[]>([]);
  const [settingsPrograms, setSettingsPrograms] = useState<string[]>(DEFAULT_PROGRAMS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ ok: boolean; latencyMs: number; sheets?: string[]; error?: string } | null>(null);
  
  // View controls
  const [activeTab, setActiveTab] = useState<'students' | 'programs' | 'config'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [showEmptySlots, setShowEmptySlots] = useState(false);

  // Modals
  const [selectedStudent, setSelectedStudent] = useState<SheetDBStudent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Config modal state
  const [endpointInput, setEndpointInput] = useState(getSheetDBEndpoint());
  const [testingEndpoint, setTestingEndpoint] = useState(false);

  // Add student form state
  const [newStudent, setNewStudent] = useState({
    studentId: '',
    matricNumber: '',
    fullName: '',
    email: '',
    phone: '',
    gender: 'male',
    institution: '',
    courseOfStudy: '',
    academicLevel: '',
    program: 'Cybersecurity',
    studentType: 'Regular',
    cohort: '1',
    trainingMode: 'Physical',
    baseFee: '₦165,000',
    netFee: '₦165,000',
    totalPaid: '₦0',
    outstandingBalance: '₦165,000',
    paymentStatus: 'Pending',
    studentStatus: 'Active'
  });
  const [submittingStudent, setSubmittingStudent] = useState(false);

  // Load data
  const loadData = async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // 1. Health check
      const health = await checkSheetDBHealth();
      setHealthStatus(health);

      // 2. Fetch students (all rows)
      const data = await fetchSheetDBStudents(true);
      setStudents(data);

      // 3. Fetch programs from Settings sheet
      const progs = await fetchSheetDBSettings();
      if (progs.length > 0) {
        setSettingsPrograms(progs);
      }

      if (isManualRefresh) {
        playSound('sparkle');
        setToastMessage(`Synced ${data.filter(s => s.fullName).length} active students from Google Sheet!`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err: any) {
      console.warn('SheetDB sync warning:', err);
      setError(err?.message || 'Failed to connect to SheetDB');
      if (isManualRefresh) {
        playSound('error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text: string, label: string) => {
    playSound('sparkle');
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Find if a student has an existing certificate issued in Orbit Space
  const getStudentCertificate = (student: SheetDBStudent): CertificateRecord | undefined => {
    if (!student.fullName && !student.email && !student.studentId) return undefined;
    
    return certificates.find(cert => {
      // Match by email
      if (student.email && cert.studentEmail && student.email.toLowerCase().trim() === cert.studentEmail.toLowerCase().trim()) {
        return true;
      }
      // Match by student ID
      if (student.studentId && cert.studentId && student.studentId.toLowerCase().trim() === cert.studentId.toLowerCase().trim()) {
        return true;
      }
      // Match by exact full name
      if (student.fullName && cert.studentName && student.fullName.toLowerCase().trim() === cert.studentName.toLowerCase().trim()) {
        return true;
      }
      return false;
    });
  };

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Empty slot toggle
      const hasContent = student.fullName.trim().length > 0 || student.email.trim().length > 0;
      if (!showEmptySlots && !hasContent) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = student.fullName.toLowerCase().includes(q);
        const matchEmail = student.email.toLowerCase().includes(q);
        const matchPhone = student.phone.toLowerCase().includes(q);
        const matchMatric = student.matricNumber.toLowerCase().includes(q);
        const matchId = student.studentId.toLowerCase().includes(q);
        const matchProg = student.program.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchMatric && !matchId && !matchProg) {
          return false;
        }
      }

      // Program filter
      if (selectedProgram !== 'ALL') {
        if (!student.program.toLowerCase().includes(selectedProgram.toLowerCase())) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'ALL') {
        if (student.studentStatus.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      // Payment filter
      if (selectedPayment !== 'ALL') {
        if (!student.paymentStatus.toLowerCase().includes(selectedPayment.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [students, searchQuery, selectedProgram, selectedStatus, selectedPayment, showEmptySlots]);

  // Available unique programs from data + settings
  const programOptions = useMemo(() => {
    const set = new Set<string>();
    settingsPrograms.forEach(p => set.add(p));
    students.forEach(s => {
      if (s.program && s.program.trim().length > 0) set.add(s.program.trim());
    });
    return Array.from(set);
  }, [settingsPrograms, students]);

  // Metrics summary
  const metrics = useMemo(() => {
    const filled = students.filter(s => s.fullName.trim().length > 0);
    const completed = filled.filter(s => s.studentStatus.toLowerCase() === 'completed');
    const certified = filled.filter(s => !!getStudentCertificate(s));
    const fullPaid = filled.filter(s => s.paymentStatus.toLowerCase().includes('paid') && !s.paymentStatus.toLowerCase().includes('installment'));
    
    return {
      totalFilled: filled.length,
      totalSlots: students.length,
      completedCount: completed.length,
      certifiedCount: certified.length,
      fullPaidCount: fullPaid.length
    };
  }, [students, certificates]);

  // Add student submit handler
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.fullName.trim()) {
      alert('Please enter Student Full Name');
      return;
    }

    setSubmittingStudent(true);
    try {
      // Auto-assign next student ID if blank
      let idToUse = newStudent.studentId.trim();
      if (!idToUse) {
        const nextNum = students.length + 1;
        idToUse = `STU-${String(nextNum).padStart(5, '0')}`;
      }

      let matricToUse = newStudent.matricNumber.trim();
      if (!matricToUse) {
        const nextNum = students.length + 1;
        matricToUse = `ORB/2026/${String(nextNum).padStart(4, '0')}`;
      }

      await addStudentToSheetDB({
        ...newStudent,
        studentId: idToUse,
        matricNumber: matricToUse
      });

      playSound('success');
      setIsAddModalOpen(false);
      setToastMessage('Student successfully registered into Google Sheet!');
      setTimeout(() => setToastMessage(null), 3500);

      // Reset form
      setNewStudent({
        studentId: '',
        matricNumber: '',
        fullName: '',
        email: '',
        phone: '',
        gender: 'male',
        institution: '',
        courseOfStudy: '',
        academicLevel: '',
        program: 'Cybersecurity',
        studentType: 'Regular',
        cohort: '1',
        trainingMode: 'Physical',
        baseFee: '₦165,000',
        netFee: '₦165,000',
        totalPaid: '₦0',
        outstandingBalance: '₦165,000',
        paymentStatus: 'Pending',
        studentStatus: 'Active'
      });

      // Reload
      loadData(true);
    } catch (err: any) {
      playSound('error');
      alert(`Error saving to SheetDB: ${err?.message}`);
    } finally {
      setSubmittingStudent(false);
    }
  };

  // Export filtered students as CSV
  const handleExportCSV = () => {
    playSound('droplet');
    const headers = [
      'Student ID',
      'Matric Number',
      'Full Name',
      'Email Address',
      'Phone Number',
      'Program',
      'Training Mode',
      'Cohort',
      'Net Fee',
      'Total Paid',
      'Outstanding Balance',
      'Payment Status',
      'Student Status',
      'Certified'
    ];

    const rows = filteredStudents.map(s => {
      const isCertified = !!getStudentCertificate(s);
      return [
        `"${s.studentId}"`,
        `"${s.matricNumber}"`,
        `"${s.fullName}"`,
        `"${s.email}"`,
        `"${s.phone}"`,
        `"${s.program}"`,
        `"${s.trainingMode}"`,
        `"${s.cohort}"`,
        `"${s.netFee}"`,
        `"${s.totalPaid}"`,
        `"${s.outstandingBalance}"`,
        `"${s.paymentStatus}"`,
        `"${s.studentStatus}"`,
        `"${isCertified ? 'YES' : 'NO'}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orbit_space_students_sheetdb_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#181524] border border-emerald-500/60 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-medium text-emerald-200">{toastMessage}</span>
        </div>
      )}

      {/* Main Connection Banner */}
      <div className="bg-[#181524] rounded-[24px] p-6 border border-[#332d47] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#a855f7]" />
              SheetDB API Connected
            </span>
            
            {healthStatus?.ok ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync • {healthStatus.latencyMs}ms
              </span>
            ) : healthStatus ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/40 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Sync Issue
              </span>
            ) : null}

            <span className="text-[11px] font-mono text-[#c4c7c8]/80 hidden sm:inline-block">
              Endpoint: <code className="text-purple-300">.../jaa32wk9mncqz</code>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif text-[#ffffff] font-normal">
            Google Sheet & Student Roster
          </h2>
          <p className="text-xs text-[#c4c7c8] font-light max-w-2xl">
            Live bi-directional synchronization with Orbit Space Academy's master Google Sheet. Review enrolled students, financial balances, and issue verifiable certificates in a single click.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-white hover:border-[#a855f7] transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
            title="Refresh data from SheetDB"
          >
            <RefreshCw className={`w-4 h-4 text-[#a855f7] ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Now</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-2.5 rounded-xl bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-white hover:border-[#a855f7] transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
            title="Export filtered students as CSV"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEndpointInput(getSheetDBEndpoint());
              setIsConfigModalOpen(true);
            }}
            className="p-2.5 rounded-xl bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-white hover:border-[#a855f7] transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
            title="API Endpoint Settings"
          >
            <Settings className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">API Config</span>
          </button>

          <button
            onClick={() => {
              playSound('pop');
              setIsAddModalOpen(true);
            }}
            className="btn-purple px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Student</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Enrolled Students */}
        <div className="bg-[#181524] p-5 rounded-[20px] border border-[#332d47] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-[#c4c7c8] uppercase">Enrolled Students</span>
            <div className="w-8 h-8 rounded-xl bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center text-[#a855f7]">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal">
            {metrics.totalFilled}
          </div>
          <p className="text-[10px] text-[#c4c7c8] font-light mt-1">
            {metrics.totalSlots} total allocated sheet rows
          </p>
        </div>

        {/* Completed Program */}
        <div className="bg-[#181524] p-5 rounded-[20px] border border-[#332d47] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-[#c4c7c8] uppercase">Graduated / Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-emerald-300 font-normal">
            {metrics.completedCount}
          </div>
          <p className="text-[10px] text-emerald-400/80 font-light mt-1">
            Eligible for immediate certification
          </p>
        </div>

        {/* Certified In Orbit Space */}
        <div className="bg-[#181524] p-5 rounded-[20px] border border-[#332d47] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-[#c4c7c8] uppercase">Issued Certificates</span>
            <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-purple-300 font-normal">
            {metrics.certifiedCount}
          </div>
          <p className="text-[10px] text-purple-300/80 font-light mt-1">
            Matched with authentication database
          </p>
        </div>

        {/* Fully Paid Fees */}
        <div className="bg-[#181524] p-5 rounded-[20px] border border-[#332d47] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-[#c4c7c8] uppercase">Fully Cleared Fees</span>
            <div className="w-8 h-8 rounded-xl bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal">
            {metrics.fullPaidCount}
          </div>
          <p className="text-[10px] text-[#c4c7c8] font-light mt-1">
            Zero outstanding ledger balance
          </p>
        </div>

      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[#332d47] pb-3">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'students'
              ? 'bg-[#221c33] text-purple-200 border border-purple-500/50'
              : 'text-[#c4c7c8] hover:text-white hover:bg-[#181524]'
          }`}
        >
          <User className="w-3.5 h-3.5 text-[#a855f7]" />
          <span>Student Directory ({metrics.totalFilled})</span>
        </button>

        <button
          onClick={() => setActiveTab('programs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'programs'
              ? 'bg-[#221c33] text-purple-200 border border-purple-500/50'
              : 'text-[#c4c7c8] hover:text-white hover:bg-[#181524]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#a855f7]" />
          <span>Academy Programs & Settings ({programOptions.length})</span>
        </button>
      </div>

      {/* TAB 1: Student Directory */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-[#181524] p-4 rounded-[20px] border border-[#332d47] flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#c4c7c8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, matric, ID..."
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#c4c7c8] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
              
              {/* Program filter */}
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                aria-label="Filter by program track"
                className="bg-[#100e17] border border-[#332d47] text-xs text-[#ffffff] rounded-xl px-3 py-2 outline-none focus:border-[#a855f7]"
              >
                <option value="ALL">All Programs</option>
                {programOptions.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>

              {/* Status filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Filter by student status"
                className="bg-[#100e17] border border-[#332d47] text-xs text-[#ffffff] rounded-xl px-3 py-2 outline-none focus:border-[#a855f7]"
              >
                <option value="ALL">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Active">Active</option>
                <option value="In-Training">In-Training</option>
              </select>

              {/* Payment filter */}
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                aria-label="Filter by payment status"
                className="bg-[#100e17] border border-[#332d47] text-xs text-[#ffffff] rounded-xl px-3 py-2 outline-none focus:border-[#a855f7]"
              >
                <option value="ALL">All Payments</option>
                <option value="Paid">Fully Paid</option>
                <option value="Installment">Installment</option>
                <option value="Pending">Pending</option>
              </select>

              {/* Toggle empty slots */}
              <label className="flex items-center gap-2 text-[11px] text-[#c4c7c8] cursor-pointer bg-[#100e17] border border-[#332d47] px-3 py-2 rounded-xl select-none hover:border-purple-500/40">
                <input
                  type="checkbox"
                  checked={showEmptySlots}
                  onChange={(e) => setShowEmptySlots(e.target.checked)}
                  className="rounded border-[#332d47] text-[#a855f7] focus:ring-0 focus:ring-offset-0 bg-[#181524]"
                />
                <span>Show Unassigned Slots ({students.length - metrics.totalFilled})</span>
              </label>

            </div>

          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs text-rose-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Failed to load SheetDB data: {error}</span>
              </div>
              <button
                onClick={() => loadData(true)}
                className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800/80 rounded-lg text-white font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-[#181524] rounded-[24px] border border-[#332d47] overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#a855f7] animate-spin mx-auto" />
                <p className="text-sm text-[#ffffff] font-medium">Fetching records from Google Sheet via SheetDB...</p>
                <p className="text-xs text-[#c4c7c8] font-light">Endpoint: {getSheetDBEndpoint()}</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <FileSpreadsheet className="w-10 h-10 text-[#c4c7c8]/40 mx-auto" />
                <p className="text-sm text-[#ffffff] font-medium">No students match your filter criteria</p>
                <p className="text-xs text-[#c4c7c8] font-light">Try adjusting your search query or reset filters.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#332d47] bg-[#14111f] text-[11px] font-mono text-[#c4c7c8] uppercase tracking-wider">
                      <th className="py-3.5 px-4">Student ID & Matric</th>
                      <th className="py-3.5 px-4">Student Information</th>
                      <th className="py-3.5 px-4">Program & Mode</th>
                      <th className="py-3.5 px-4">Payment Ledger</th>
                      <th className="py-3.5 px-4">Academic Status</th>
                      <th className="py-3.5 px-4">Certificate</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#332d47]/60 text-xs">
                    {filteredStudents.map((student, idx) => {
                      const existingCert = getStudentCertificate(student);
                      const isComplete = student.studentStatus.toLowerCase() === 'completed';
                      const hasContent = student.fullName.trim().length > 0;

                      return (
                        <tr 
                          key={student.studentId || idx}
                          className={`hover:bg-[#1f1b2e]/60 transition-colors ${
                            !hasContent ? 'opacity-50 bg-[#120f1c]/40' : ''
                          }`}
                        >
                          {/* Student ID & Matric */}
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-semibold text-purple-300">
                              {student.studentId || `STU-${idx + 1}`}
                            </div>
                            <div className="text-[10px] text-[#c4c7c8]">
                              {student.matricNumber || '—'}
                            </div>
                          </td>

                          {/* Student Info */}
                          <td className="py-3.5 px-4">
                            {hasContent ? (
                              <div>
                                <div className="font-semibold text-[#ffffff] text-sm flex items-center gap-1.5 capitalize">
                                  {student.fullName}
                                </div>
                                <div className="text-[11px] text-[#c4c7c8] flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 text-[#a855f7]" />
                                  <span>{student.email || 'No email recorded'}</span>
                                </div>
                                {student.phone && (
                                  <div className="text-[10px] text-[#c4c7c8]/80 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-2.5 h-2.5 text-[#a855f7]" />
                                    <span>{student.phone}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#c4c7c8]/50 italic font-mono text-[11px]">
                                Empty Slot ({student.studentId})
                              </span>
                            )}
                          </td>

                          {/* Program & Mode */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-[#ffffff]">
                              {student.program || '—'}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#100e17] border border-[#332d47] text-[#c4c7c8]">
                                {student.trainingMode || 'Physical'}
                              </span>
                              {student.cohort && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/30">
                                  Cohort {student.cohort}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Payment Ledger */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-xs text-[#ffffff]">
                              {student.totalPaid ? (
                                <span className="text-emerald-400 font-semibold">{student.totalPaid}</span>
                              ) : (
                                '—'
                              )}
                              {student.netFee && (
                                <span className="text-[#c4c7c8] text-[10px]"> / {student.netFee}</span>
                              )}
                            </div>
                            
                            {student.paymentStatus && (
                              <span className={`inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                student.paymentStatus.toLowerCase().includes('paid') && !student.paymentStatus.toLowerCase().includes('installment')
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                                  : student.paymentStatus.toLowerCase().includes('installment')
                                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                                  : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                              }`}>
                                {student.paymentStatus}
                              </span>
                            )}
                          </td>

                          {/* Academic Status */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-full font-semibold ${
                              isComplete
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                                : 'bg-blue-950/60 text-blue-300 border border-blue-800/50'
                            }`}>
                              {isComplete ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              <span>{student.studentStatus || 'Active'}</span>
                            </span>
                          </td>

                          {/* Orbit Space Certificate Status */}
                          <td className="py-3.5 px-4">
                            {existingCert ? (
                              <button
                                onClick={() => onOpenPublicCertificate(existingCert.id)}
                                className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/50 hover:bg-purple-900/60 transition-colors cursor-pointer group"
                                title="Click to view verified public certificate"
                              >
                                <Award className="w-3 h-3 text-[#a855f7]" />
                                <span className="font-semibold">{existingCert.id}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                              </button>
                            ) : (
                              <span className="text-[10px] font-mono text-[#c4c7c8]/60 bg-[#100e17] border border-[#332d47] px-2 py-0.5 rounded">
                                Not Issued
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details Button */}
                              <button
                                onClick={() => {
                                  playSound('pop');
                                  setSelectedStudent(student);
                                }}
                                className="p-1.5 rounded-lg bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-white hover:border-[#a855f7] transition-all cursor-pointer"
                                title="View Full Student Profile & Ledger"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Generate Certificate Button */}
                              {hasContent && (
                                <button
                                  onClick={() => {
                                    playSound('sparkle');
                                    onGenerateCertificateForStudent(student);
                                  }}
                                  className="px-3 py-1.5 rounded-lg btn-purple text-[11px] font-semibold flex items-center gap-1.5 shadow hover:scale-105 transition-all cursor-pointer shrink-0"
                                  title="Issue certificate using this student's Google Sheet data"
                                >
                                  <Award className="w-3 h-3" />
                                  <span>Issue Certificate</span>
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

              {/* Mobile Responsive Card View */}
              <div className="md:hidden p-3.5 space-y-3">
                {filteredStudents.map((student, idx) => {
                  const existingCert = getStudentCertificate(student);
                  const isComplete = student.studentStatus.toLowerCase() === 'completed';
                  const hasContent = student.fullName.trim().length > 0;

                  return (
                    <div
                      key={student.studentId || idx}
                      className="bg-[#100e17] rounded-2xl p-4 border border-[#332d47] space-y-3"
                    >
                      {/* Header: Name, Matric, Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-white">
                            {hasContent ? student.fullName : `Empty Slot (${student.studentId})`}
                          </h4>
                          <div className="text-[11px] text-purple-300 font-mono">
                            {student.studentId} • {student.matricNumber || 'No Matric'}
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                          isComplete
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                            : 'bg-purple-950/60 text-purple-300 border border-purple-800/50'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${isComplete ? 'bg-emerald-400' : 'bg-purple-400'}`} />
                          {student.studentStatus || 'Active'}
                        </span>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#181524] p-2.5 rounded-xl border border-[#332d47]/60">
                        <div>
                          <span className="text-[#94a3b8] text-[10px] block">Program:</span>
                          <span className="text-white font-medium truncate block">{student.program || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[#94a3b8] text-[10px] block">Training:</span>
                          <span className="text-white">{student.trainingMode || 'Physical'}</span>
                        </div>
                        <div>
                          <span className="text-[#94a3b8] text-[10px] block">Payment:</span>
                          <span className="text-emerald-400 font-mono">{student.totalPaid || '₦0'}</span>
                        </div>
                        <div>
                          <span className="text-[#94a3b8] text-[10px] block">Certificate:</span>
                          <span className="font-mono text-purple-300">
                            {existingCert ? existingCert.id : 'None'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            playSound('pop');
                            setSelectedStudent(student);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#181524] border border-[#332d47] text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-400" />
                          <span>Profile</span>
                        </button>

                        {hasContent && (
                          <button
                            onClick={() => {
                              playSound('sparkle');
                              onGenerateCertificateForStudent(student);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl btn-purple text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Issue Cert</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Programs & Settings */}
      {activeTab === 'programs' && (
        <div className="bg-[#181524] rounded-[24px] p-6 border border-[#332d47] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif text-[#ffffff] font-normal">
                Configured Program Tracks & Lookup Tables
              </h3>
              <p className="text-xs text-[#c4c7c8] font-light">
                Synchronized directly from the <code>Settings</code> tab of your Google Sheet.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-950/60 text-purple-300 border border-purple-800/40">
              {programOptions.length} Tracks Detected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {programOptions.map((prog, idx) => {
              const enrolledInProg = students.filter(s => s.program.toLowerCase() === prog.toLowerCase() && s.fullName).length;
              return (
                <div 
                  key={prog}
                  className="bg-[#100e17] border border-[#332d47] p-4 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-300 font-mono text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#ffffff]">{prog}</div>
                      <div className="text-[10px] text-[#c4c7c8] font-mono mt-0.5">
                        {enrolledInProg} enrolled student{enrolledInProg === 1 ? '' : 's'}
                      </div>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: View Full Student Profile & Ledger */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#181524] border border-[#332d47] rounded-[24px] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-[#332d47] pb-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase font-semibold block">
                    Google Sheet Student Record • {selectedStudent.studentId}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif text-[#ffffff] font-normal mt-1 capitalize">
                    {selectedStudent.fullName || 'Unassigned Student Slot'}
                  </h3>
                  <div className="text-xs text-[#c4c7c8] font-mono mt-0.5">
                    Matric: {selectedStudent.matricNumber || 'N/A'} • Program: {selectedStudent.program || 'N/A'}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 rounded-full bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of Student Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Contact details */}
                <div className="bg-[#100e17] p-4 rounded-xl border border-[#332d47] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#a855f7] font-semibold">
                    Contact & Identity
                  </div>
                  <div>
                    <span className="text-[#c4c7c8]">Email: </span>
                    <span className="text-white font-medium">{selectedStudent.email || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[#c4c7c8]">Phone: </span>
                    <span className="text-white font-medium">{selectedStudent.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[#c4c7c8]">Gender: </span>
                    <span className="text-white capitalize">{selectedStudent.gender || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[#c4c7c8]">Training Mode: </span>
                    <span className="text-white">{selectedStudent.trainingMode || 'Physical'}</span>
                  </div>
                </div>

                {/* Academic Profile */}
                <div className="bg-[#100e17] p-4 rounded-xl border border-[#332d47] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#a855f7] font-semibold">
                    Academic Background
                  </div>
                  <div>
                    <span className="text-[#c4c7c8]">Institution: </span>
                    <span className="text-white">{selectedStudent.institution || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[#c4c7c8]">Course of Study: </span>
                    <span className="text-white">{selectedStudent.courseOfStudy || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[#c4c7c8]">Academic Level: </span>
                    <span className="text-white">{selectedStudent.academicLevel || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[#c4c7c8]">Cohort & Type: </span>
                    <span className="text-white">Cohort {selectedStudent.cohort || '1'} ({selectedStudent.studentType || 'Regular'})</span>
                  </div>
                </div>

                {/* Financial Ledger */}
                <div className="bg-[#100e17] p-4 rounded-xl border border-[#332d47] space-y-2 sm:col-span-2">
                  <div className="text-[10px] font-mono uppercase text-emerald-400 font-semibold flex items-center justify-between">
                    <span>Fee & Payment Ledger</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">
                      {selectedStudent.paymentStatus || 'Pending'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div>
                      <div className="text-[10px] text-[#c4c7c8]">Base Fee</div>
                      <div className="font-mono text-sm text-white font-medium">{selectedStudent.baseFee || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#c4c7c8]">Net Fee</div>
                      <div className="font-mono text-sm text-white font-medium">{selectedStudent.netFee || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#c4c7c8]">Total Paid</div>
                      <div className="font-mono text-sm text-emerald-400 font-bold">{selectedStudent.totalPaid || '₦0'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#c4c7c8]">Outstanding Balance</div>
                      <div className="font-mono text-sm text-rose-300 font-bold">{selectedStudent.outstandingBalance || '₦0'}</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#332d47]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(
                      `${selectedStudent.fullName} — ${selectedStudent.email} — ${selectedStudent.studentId} — ${selectedStudent.program}`,
                      'student-summary'
                    )}
                    className="px-3 py-2 rounded-xl bg-[#100e17] border border-[#332d47] text-xs text-[#c4c7c8] hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedText === 'student-summary' ? 'Copied Summary!' : 'Copy Summary'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 rounded-xl bg-[#100e17] border border-[#332d47] text-xs text-[#c4c7c8] hover:text-white cursor-pointer"
                  >
                    Close
                  </button>

                  {selectedStudent.fullName && (
                    <button
                      onClick={() => {
                        const studentToCertify = selectedStudent;
                        setSelectedStudent(null);
                        onGenerateCertificateForStudent(studentToCertify);
                      }}
                      className="btn-purple px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Issue Certificate For This Student</span>
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Add New Student Directly to SheetDB */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#181524] border border-[#332d47] rounded-[24px] max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-[#332d47] pb-3">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase font-semibold block">
                    Google Sheet Registration
                  </span>
                  <h3 className="text-xl font-serif text-[#ffffff] font-normal mt-1">
                    Add New Student to SheetDB
                  </h3>
                  <p className="text-xs text-[#c4c7c8] font-light">
                    Saves a new row directly into your linked Google Sheet via SheetDB API.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-full bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-mono text-[#ffffff] font-semibold">
                      Student Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newStudent.fullName}
                      onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                      placeholder="e.g. John Oluwaseun Doe"
                      className="w-full bg-[#100e17] border border-[#332d47] rounded-xl px-3 py-2 text-white outline-none focus:border-[#a855f7]"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-[#ffffff] font-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      placeholder="e.g. john.doe@gmail.com"
                      className="w-full bg-[#100e17] border border-[#332d47] rounded-xl px-3 py-2 text-white outline-none focus:border-[#a855f7]"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-[#ffffff] font-semibold">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                      placeholder="e.g. 08012345678"
                      className="w-full bg-[#100e17] border border-[#332d47] rounded-xl px-3 py-2 text-white outline-none focus:border-[#a855f7]"
                    />
                  </div>

                  {/* Program */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-[#ffffff] font-semibold">
                      Program / Track
                    </label>
                    <select
                      value={newStudent.program}
                      onChange={(e) => setNewStudent({ ...newStudent, program: e.target.value })}
                      className="w-full bg-[#100e17] border border-[#332d47] rounded-xl px-3 py-2 text-white outline-none focus:border-[#a855f7]"
                    >
                      {programOptions.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Training Mode */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-[#ffffff] font-semibold">
                      Training Mode
                    </label>
                    <select
                      value={newStudent.trainingMode}
                      onChange={(e) => setNewStudent({ ...newStudent, trainingMode: e.target.value })}
                      className="w-full bg-[#100e17] border border-[#332d47] rounded-xl px-3 py-2 text-white outline-none focus:border-[#a855f7]"
                    >
                      <option value="Physical">Physical (Ilorin Hub)</option>
                      <option value="Virtual">Virtual / Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* Base Fee */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-[#ffffff] font-semibold">
                      Base Fee
                    </label>
                    <input
                      type="text"
                      value={newStudent.baseFee}
                      onChange={(e) => setNewStudent({ ...newStudent, baseFee: e.target.value, netFee: e.target.value })}
                      placeholder="e.g. ₦165,000"
                      className="w-full bg-[#100e17] border border-[#332d47] rounded-xl px-3 py-2 text-white outline-none focus:border-[#a855f7]"
                    />
                  </div>

                  {/* Total Paid */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-[#ffffff] font-semibold">
                      Total Paid
                    </label>
                    <input
                      type="text"
                      value={newStudent.totalPaid}
                      onChange={(e) => setNewStudent({ ...newStudent, totalPaid: e.target.value })}
                      placeholder="e.g. ₦165,000"
                      className="w-full bg-[#100e17] border border-[#332d47] rounded-xl px-3 py-2 text-white outline-none focus:border-[#a855f7]"
                    />
                  </div>

                  {/* Payment Status */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-[#ffffff] font-semibold">
                      Payment Status
                    </label>
                    <select
                      value={newStudent.paymentStatus}
                      onChange={(e) => setNewStudent({ ...newStudent, paymentStatus: e.target.value })}
                      className="w-full bg-[#100e17] border border-[#332d47] rounded-xl px-3 py-2 text-white outline-none focus:border-[#a855f7]"
                    >
                      <option value="Paid">Fully Paid</option>
                      <option value="Installment">Installment</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  {/* Student Academic Status */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-[#ffffff] font-semibold">
                      Student Academic Status
                    </label>
                    <select
                      value={newStudent.studentStatus}
                      onChange={(e) => setNewStudent({ ...newStudent, studentStatus: e.target.value })}
                      className="w-full bg-[#100e17] border border-[#332d47] rounded-xl px-3 py-2 text-white outline-none focus:border-[#a855f7]"
                    >
                      <option value="Active">Active (In Training)</option>
                      <option value="Completed">Completed (Graduated)</option>
                    </select>
                  </div>

                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#332d47]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#100e17] border border-[#332d47] text-white hover:bg-[#1a1727] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingStudent}
                    className="btn-purple px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
                  >
                    {submittingStudent ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Adding to Google Sheet...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save to SheetDB</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: API Config Modal */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#181524] border border-[#332d47] rounded-[24px] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-start justify-between border-b border-[#332d47] pb-3">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase font-semibold block">
                    Integration Settings
                  </span>
                  <h3 className="text-xl font-serif text-[#ffffff] font-normal mt-1">
                    SheetDB API Endpoint
                  </h3>
                </div>

                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="p-2 rounded-full bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-[#ffffff] font-semibold">
                    Current SheetDB REST Endpoint
                  </label>
                  <input
                    type="url"
                    value={endpointInput}
                    onChange={(e) => setEndpointInput(e.target.value)}
                    placeholder="https://sheetdb.io/api/v1/..."
                    className="w-full bg-[#100e17] border border-[#332d47] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs outline-none focus:border-[#a855f7]"
                  />
                  <p className="text-[11px] text-[#c4c7c8] font-light">
                    Default: <code>{DEFAULT_SHEETDB_URL}</code>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#100e17] border border-[#332d47] space-y-2">
                  <div className="text-[10px] font-mono text-purple-300 font-semibold uppercase">
                    Connection Health Info
                  </div>
                  <div className="text-[#c4c7c8] text-[11px] space-y-1 font-mono">
                    <div>Status: {healthStatus?.ok ? '🟢 200 OK Active' : '🔴 Unreachable'}</div>
                    <div>Latency: {healthStatus?.latencyMs || '—'} ms</div>
                    <div>Available Sheet Tabs: {healthStatus?.sheets?.join(', ') || 'Students, Settings, Payments'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#332d47]">
                  <button
                    type="button"
                    onClick={() => {
                      resetSheetDBEndpoint();
                      setEndpointInput(DEFAULT_SHEETDB_URL);
                    }}
                    className="text-[#c4c7c8] hover:text-white text-xs underline cursor-pointer"
                  >
                    Reset to Default
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={testingEndpoint}
                      onClick={async () => {
                        setTestingEndpoint(true);
                        setSheetDBEndpoint(endpointInput);
                        const res = await checkSheetDBHealth();
                        setHealthStatus(res);
                        setTestingEndpoint(false);
                        if (res.ok) {
                          alert(`Success! Connected to SheetDB in ${res.latencyMs}ms. Detected sheets: ${res.sheets.join(', ')}`);
                        } else {
                          alert(`Connection failed: ${res.error}`);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-[#100e17] border border-[#332d47] text-white hover:bg-[#221c33] cursor-pointer"
                    >
                      {testingEndpoint ? 'Testing...' : 'Test Connection'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSheetDBEndpoint(endpointInput);
                        setIsConfigModalOpen(false);
                        loadData(true);
                      }}
                      className="btn-purple px-4 py-2 rounded-xl font-semibold cursor-pointer"
                    >
                      Save & Apply
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
