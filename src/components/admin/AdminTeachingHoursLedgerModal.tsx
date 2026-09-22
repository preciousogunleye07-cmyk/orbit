import React, { useState, useEffect } from 'react';
import { 
  History, 
  Plus, 
  Minus, 
  FileSpreadsheet, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  ArrowUpDown, 
  Trash2, 
  Upload, 
  Copy, 
  Check, 
  FileCheck, 
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { 
  TeachingHoursLedgerService, 
  TeachingHourLedgerEntry, 
  LedgerEntryType, 
  LecturerLedgerSummary 
} from '../../services/teachingHoursLedgerService';
import { TutorProfile, TutorService } from '../../services/tutorService';
import { getAdminSession } from '../../services/certificateService';
import { getSubAdminSession } from '../../services/subAdminService';
import { playSound } from '../../utils/soundEffects';

interface AdminTeachingHoursLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLecturerId?: string;
  onUpdated?: () => void;
}

export const AdminTeachingHoursLedgerModal: React.FC<AdminTeachingHoursLedgerModalProps> = ({
  isOpen,
  onClose,
  initialLecturerId,
  onUpdated
}) => {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>(initialLecturerId || 'all');
  const [activeTab, setActiveTab] = useState<'ledger' | 'historical' | 'bulk' | 'adjustment'>('ledger');
  
  // Ledger entries state
  const [entries, setEntries] = useState<TeachingHourLedgerEntry[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Summary for selected lecturer
  const [summary, setSummary] = useState<LecturerLedgerSummary | null>(null);

  // Historical Form State
  const [histLecturerId, setHistLecturerId] = useState<string>('');
  const [histHours, setHistHours] = useState<string>('146');
  const [histDate, setHistDate] = useState<string>('2026-01-15');
  const [histReason, setHistReason] = useState<string>('Imported manual attendance records prior to digital system');
  const [histNote, setHistNote] = useState<string>('Verified paper registers & physical logbook archive');
  const [histSubmitting, setHistSubmitting] = useState(false);

  // Adjustment Form State
  const [adjLecturerId, setAdjLecturerId] = useState<string>('');
  const [adjIsAddition, setAdjIsAddition] = useState<boolean>(true);
  const [adjHours, setAdjHours] = useState<string>('2');
  const [adjReason, setAdjReason] = useState<string>('');
  const [adjNote, setAdjNote] = useState<string>('');
  const [adjSubmitting, setAdjSubmitting] = useState(false);

  // Bulk CSV State
  const [bulkCsv, setBulkCsv] = useState<string>(
`Lecturer, Historical Hours, Reason
Lawal, 146, Manual attendance records 2024-2025
Olamide, 132, SOC Lab registers 2024-2025
Mr. Stat, 118, Statistics & Data Lab Logbook
Precious, 95, Video Editing & Creative Media Studio`
  );
  const [bulkResult, setBulkResult] = useState<{ successCount: number; errors: string[] } | null>(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Notifications
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin session & permissions
  const adminSession = getAdminSession();
  const subAdminSession = getSubAdminSession();
  const currentAdminName = adminSession?.name || subAdminSession?.name || 'Super Admin (Engr. Precious Ogunleye)';
  const canMakeAdjustments = subAdminSession?.permissions?.canAdjustTeachingHours ?? true;

  // Initialize data
  useEffect(() => {
    if (isOpen) {
      const allTutors = TutorService.getAllTutors();
      setTutors(allTutors);

      if (initialLecturerId && allTutors.some(t => t.id === initialLecturerId)) {
        setSelectedLecturerId(initialLecturerId);
        setHistLecturerId(initialLecturerId);
        setAdjLecturerId(initialLecturerId);
      } else if (allTutors.length > 0) {
        setHistLecturerId(allTutors[0].id);
        setAdjLecturerId(allTutors[0].id);
      }

      loadLedger();
    }
  }, [isOpen, initialLecturerId]);

  const loadLedger = () => {
    const all = TeachingHoursLedgerService.getAllEntries();
    setEntries(all);

    if (selectedLecturerId && selectedLecturerId !== 'all') {
      const sum = TeachingHoursLedgerService.getLecturerLedgerSummary(selectedLecturerId);
      setSummary(sum);
    } else {
      setSummary(null);
    }
  };

  useEffect(() => {
    if (selectedLecturerId && selectedLecturerId !== 'all') {
      const sum = TeachingHoursLedgerService.getLecturerLedgerSummary(selectedLecturerId);
      setSummary(sum);
      setHistLecturerId(selectedLecturerId);
      setAdjLecturerId(selectedLecturerId);
    } else {
      setSummary(null);
    }
  }, [selectedLecturerId, entries]);

  if (!isOpen) return null;

  // Filtered entries for table
  const displayedEntries = entries.filter((e) => {
    if (selectedLecturerId !== 'all' && e.lecturerId !== selectedLecturerId) return false;
    if (filterType !== 'all' && e.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLecturer = e.lecturerName.toLowerCase().includes(q);
      const matchDesc = e.description.toLowerCase().includes(q);
      const matchReason = (e.auditReason || '').toLowerCase().includes(q);
      const matchAddedBy = e.addedBy.toLowerCase().includes(q);
      return matchLecturer || matchDesc || matchReason || matchAddedBy;
    }
    return true;
  });

  // Calculate global summary across all lecturers
  const allHistorical = entries.filter(e => e.type === 'historical').reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const allAttendance = entries.filter(e => e.type === 'attendance').reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const allAdjustments = entries.filter(e => e.type === 'adjustment').reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const allTotal = Math.round((allHistorical + allAttendance + allAdjustments) * 10) / 10;

  // Handlers
  const handleAddHistorical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canMakeAdjustments) {
      setFeedbackMsg({ type: 'error', text: 'Permission Denied: Only Super Administrators can enter historical hours.' });
      return;
    }

    const hrs = parseFloat(histHours);
    if (isNaN(hrs) || hrs <= 0) {
      setFeedbackMsg({ type: 'error', text: 'Please enter a valid positive number of historical hours.' });
      return;
    }

    setHistSubmitting(true);
    setFeedbackMsg(null);

    try {
      await TeachingHoursLedgerService.addHistoricalEntry({
        lecturerId: histLecturerId,
        hours: hrs,
        date: histDate,
        reason: histReason,
        note: histNote,
        addedBy: currentAdminName
      });

      playSound('ready');
      setFeedbackMsg({ type: 'success', text: `Successfully credited +${hrs} historical teaching hours to ledger!` });
      loadLedger();
      if (onUpdated) onUpdated();
      setActiveTab('ledger');
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to add historical entry.' });
    } finally {
      setHistSubmitting(false);
    }
  };

  const handleAddAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canMakeAdjustments) {
      setFeedbackMsg({ type: 'error', text: 'Permission Denied: Only Super Administrators can make manual ledger adjustments.' });
      return;
    }

    const hrs = parseFloat(adjHours);
    if (isNaN(hrs) || hrs <= 0) {
      setFeedbackMsg({ type: 'error', text: 'Please enter a valid positive number of hours to adjust.' });
      return;
    }

    if (!adjReason.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Adjustment reason is strictly mandatory for the academic audit trail.' });
      return;
    }

    setAdjSubmitting(true);
    setFeedbackMsg(null);

    try {
      await TeachingHoursLedgerService.addAdjustmentEntry({
        lecturerId: adjLecturerId,
        hours: hrs,
        isAddition: adjIsAddition,
        reason: adjReason,
        note: adjNote,
        addedBy: currentAdminName
      });

      playSound('ready');
      const sign = adjIsAddition ? '+' : '-';
      setFeedbackMsg({ type: 'success', text: `Adjustment saved: ${sign}${hrs} hrs recorded with full audit trail!` });
      setAdjReason('');
      setAdjNote('');
      loadLedger();
      if (onUpdated) onUpdated();
      setActiveTab('ledger');
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to apply adjustment.' });
    } finally {
      setAdjSubmitting(false);
    }
  };

  const handleBulkImport = async () => {
    if (!canMakeAdjustments) {
      setFeedbackMsg({ type: 'error', text: 'Permission Denied: Only Super Administrators can bulk import hours.' });
      return;
    }

    if (!bulkCsv.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please paste CSV content to import.' });
      return;
    }

    setBulkSubmitting(true);
    setFeedbackMsg(null);
    setBulkResult(null);

    try {
      const res = await TeachingHoursLedgerService.bulkImportHistoricalEntries(bulkCsv, currentAdminName);
      setBulkResult({ successCount: res.successCount, errors: res.errors });
      if (res.successCount > 0) {
        playSound('ready');
        setFeedbackMsg({ type: 'success', text: `Successfully imported ${res.successCount} historical records into the ledger!` });
        loadLedger();
        if (onUpdated) onUpdated();
      } else {
        setFeedbackMsg({ type: 'error', text: 'No valid records could be imported from CSV.' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Bulk import failed.' });
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entry: TeachingHourLedgerEntry) => {
    if (!canMakeAdjustments) {
      alert('Only Super Administrators can delete or void ledger transactions.');
      return;
    }

    const confirmMsg = `Are you sure you want to void this transaction?\n\nDate: ${entry.date}\nType: ${entry.type}\nHours: ${entry.hours > 0 ? `+${entry.hours}` : entry.hours}\nDescription: ${entry.description}`;
    if (window.confirm(confirmMsg)) {
      await TeachingHoursLedgerService.deleteEntry(entry.id);
      playSound('pulse');
      loadLedger();
      if (onUpdated) onUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#120f1d] border border-[#2d2642] rounded-3xl max-w-5xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-[#28223b] flex items-start justify-between gap-4 bg-[#171326]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-700/50 text-purple-300">
                <History className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Teaching Hours Ledger & Verification Audit
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#9f99ad]">
              Separated Historical Baseline, Verified Digital Attendance, and Traceable Manual Adjustments
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#231d36] hover:bg-[#2e2647] text-[#9f99ad] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global or Lecturer Summary Cards */}
        <div className="p-6 bg-[#151124] border-b border-[#241e36]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono font-medium text-purple-300 uppercase tracking-wider">
                Active Lecturer:
              </label>
              <select
                value={selectedLecturerId}
                onChange={(e) => setSelectedLecturerId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#201a33] border border-[#3b3254] text-xs font-semibold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">All Faculty Members (Institution Overview)</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-[#9f99ad] font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Immutable Audit Trail Enforced</span>
            </div>
          </div>

          {/* Breakdown Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Historical */}
            <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center justify-between">
                <span>Historical Baseline</span>
                <Clock className="w-3.5 h-3.5 text-amber-400/80" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-200">
                +{summary ? summary.historicalHours : allHistorical}
                <span className="text-xs font-normal text-amber-400/80 ml-1">hrs</span>
              </div>
              <p className="text-[10px] text-[#9f99ad] leading-tight">Pre-digital paper registers</p>
            </div>

            {/* Attendance */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center justify-between">
                <span>Digital Attendance</span>
                <FileCheck className="w-3.5 h-3.5 text-cyan-400/80" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-cyan-200">
                +{summary ? summary.attendanceHours : allAttendance}
                <span className="text-xs font-normal text-cyan-400/80 ml-1">hrs</span>
              </div>
              <p className="text-[10px] text-[#9f99ad] leading-tight">Class check-in/out records</p>
            </div>

            {/* Adjustments */}
            <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold flex items-center justify-between">
                <span>Manual Adjustments</span>
                <ArrowUpDown className="w-3.5 h-3.5 text-purple-400/80" />
              </div>
              <div className={`text-xl sm:text-2xl font-black ${
                (summary ? summary.adjustmentHours : allAdjustments) >= 0 ? 'text-purple-200' : 'text-rose-300'
              }`}>
                {(summary ? summary.adjustmentHours : allAdjustments) > 0 ? '+' : ''}
                {summary ? summary.adjustmentHours : allAdjustments}
                <span className="text-xs font-normal text-purple-400/80 ml-1">hrs</span>
              </div>
              <p className="text-[10px] text-[#9f99ad] leading-tight">Audited corrections (+/-)</p>
            </div>

            {/* Current Total */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-900/30 to-indigo-950/50 border border-purple-500/50 space-y-1 relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold flex items-center justify-between">
                <span>Total Verified Hours</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {summary ? summary.totalTeachingHours : allTotal}
                <span className="text-xs font-normal text-purple-300 ml-1">hrs</span>
              </div>
              <p className="text-[10px] text-purple-300/80 font-medium leading-tight">Calculated strictly from ledger</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[#241e36] bg-[#120f1d] overflow-x-auto">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'ledger'
                ? 'border-purple-500 text-white bg-[#1b162b]'
                : 'border-transparent text-[#9f99ad] hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Ledger Audit Trail ({displayedEntries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('historical')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'historical'
                ? 'border-amber-500 text-white bg-[#1b162b]'
                : 'border-transparent text-[#9f99ad] hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Add Historical Hours</span>
          </button>

          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'bulk'
                ? 'border-emerald-500 text-white bg-[#1b162b]'
                : 'border-transparent text-[#9f99ad] hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            onClick={() => setActiveTab('adjustment')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'adjustment'
                ? 'border-purple-500 text-white bg-[#1b162b]'
                : 'border-transparent text-[#9f99ad] hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <Minus className="w-3.5 h-3.5 text-rose-400 -ml-2" />
            <span>Manual Adjustment (+/-)</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className={`mx-6 mt-4 p-3 rounded-xl flex items-center justify-between text-xs ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-[#9f99ad] hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: LEDGER AUDIT TRAIL */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              
              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7c758c]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transactions, lecturer, notes..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#1b162b] border border-[#372f4e] text-xs text-white placeholder-[#7c758c] focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Filter className="w-3.5 h-3.5 text-[#7c758c]" />
                  <span className="text-xs text-[#9f99ad]">Filter Type:</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#1b162b] border border-[#372f4e] text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="historical">Historical Baseline</option>
                    <option value="attendance">Digital Attendance</option>
                    <option value="adjustment">Manual Adjustment</option>
                  </select>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="border border-[#2a243d] rounded-2xl overflow-hidden bg-[#151124]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1c172e] text-[#9f99ad] font-mono uppercase text-[10px] tracking-wider border-b border-[#2a243d]">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Lecturer</th>
                        <th className="py-3 px-4">Description / Audit Reason</th>
                        <th className="py-3 px-4">Hours</th>
                        <th className="py-3 px-4">Added By</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#231d36] font-sans">
                      {displayedEntries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#7c758c] text-xs">
                            No ledger transactions found matching the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        displayedEntries.map((entry) => {
                          const isHist = entry.type === 'historical';
                          const isAtt = entry.type === 'attendance';
                          const isAdj = entry.type === 'adjustment';
                          const isPositive = entry.hours >= 0;

                          return (
                            <tr key={entry.id} className="hover:bg-[#1a152b] transition-colors">
                              <td className="py-3 px-4 font-mono text-purple-200 whitespace-nowrap">
                                {entry.date}
                              </td>
                              
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                                  isHist 
                                    ? 'bg-amber-950/50 border-amber-800/60 text-amber-300' 
                                    : isAtt
                                    ? 'bg-cyan-950/50 border-cyan-800/60 text-cyan-300'
                                    : 'bg-purple-950/50 border-purple-800/60 text-purple-300'
                                }`}>
                                  {isHist && <Clock className="w-2.5 h-2.5" />}
                                  {isAtt && <FileCheck className="w-2.5 h-2.5" />}
                                  {isAdj && <ArrowUpDown className="w-2.5 h-2.5" />}
                                  <span className="capitalize">{entry.type}</span>
                                </span>
                              </td>

                              <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                                {entry.lecturerName}
                              </td>

                              <td className="py-3 px-4 max-w-xs">
                                <div className="font-medium text-[#e2ddec] truncate" title={entry.description}>
                                  {entry.description}
                                </div>
                                {entry.auditReason && (
                                  <div className="text-[11px] text-[#8e879e] truncate" title={entry.auditReason}>
                                    Reason: {entry.auditReason}
                                  </div>
                                )}
                                {entry.referenceNote && (
                                  <div className="text-[10px] font-mono text-[#787186] truncate">
                                    Ref: {entry.referenceNote}
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className={`font-mono font-bold text-sm ${
                                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  {isPositive ? `+${entry.hours}` : entry.hours} hrs
                                </span>
                              </td>

                              <td className="py-3 px-4 text-[#a39cb2] text-[11px] whitespace-nowrap">
                                {entry.addedBy}
                              </td>

                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                {canMakeAdjustments && (isAdj || isHist) ? (
                                  <button
                                    onClick={() => handleDeleteEntry(entry)}
                                    title="Void transaction (Super Admin)"
                                    className="p-1 rounded-lg hover:bg-rose-950/40 text-[#7c758c] hover:text-rose-400 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-mono text-[#585168]">verified</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#171326] border border-[#2b243f] text-xs text-[#8e879e] flex items-center justify-between">
                <span>
                  Showing {displayedEntries.length} transactions in teaching hours ledger.
                </span>
                <span className="font-mono text-[11px] text-purple-400">
                  Total: {summary ? summary.totalTeachingHours : allTotal} verified instructional hours
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: ADD HISTORICAL HOURS */}
          {activeTab === 'historical' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-xs space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Manual Attendance Starting Balance (Pre-Platform)</span>
                </div>
                <p className="text-[#c8c2d6]">
                  Enter verified instructional hours from historical manual attendance registers prior to this digital platform. This forms the lecturer's starting balance in the ledger.
                </p>
              </div>

              {!canMakeAdjustments && (
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Sub-admin account restriction: Only Super Administrators can credit historical teaching hours.</span>
                </div>
              )}

              <form onSubmit={handleAddHistorical} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#9f99ad] uppercase mb-1.5">
                      Lecturer / Faculty Member *
                    </label>
                    <select
                      value={histLecturerId}
                      onChange={(e) => setHistLecturerId(e.target.value)}
                      disabled={!canMakeAdjustments}
                      className="w-full px-3 py-2 rounded-xl bg-[#1b162b] border border-[#372f4e] text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {tutors.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#9f99ad] uppercase mb-1.5">
                      Historical Hours to Credit *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={histHours}
                      onChange={(e) => setHistHours(e.target.value)}
                      disabled={!canMakeAdjustments}
                      placeholder="e.g. 146"
                      className="w-full px-3 py-2 rounded-xl bg-[#1b162b] border border-[#372f4e] text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#9f99ad] uppercase mb-1.5">
                      Date of Record Entry *
                    </label>
                    <input
                      type="date"
                      value={histDate}
                      onChange={(e) => setHistDate(e.target.value)}
                      disabled={!canMakeAdjustments}
                      className="w-full px-3 py-2 rounded-xl bg-[#1b162b] border border-[#372f4e] text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#9f99ad] uppercase mb-1.5">
                      Added By / Verified Authority
                    </label>
                    <input
                      type="text"
                      value={currentAdminName}
                      disabled
                      className="w-full px-3 py-2 rounded-xl bg-[#171324] border border-[#2b253d] text-xs text-[#8e879e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#9f99ad] uppercase mb-1.5">
                    Audit Description / Source Registry *
                  </label>
                  <input
                    type="text"
                    value={histReason}
                    onChange={(e) => setHistReason(e.target.value)}
                    disabled={!canMakeAdjustments}
                    placeholder="e.g. Verified manual attendance records (Q1 2024 - Q4 2025 Foundation Cohorts)"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b162b] border border-[#372f4e] text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#9f99ad] uppercase mb-1.5">
                    Supporting Logbook Reference / Archive Note
                  </label>
                  <input
                    type="text"
                    value={histNote}
                    onChange={(e) => setHistNote(e.target.value)}
                    disabled={!canMakeAdjustments}
                    placeholder="e.g. Physical Registry Vol 2, Page 42, Signed by Academic Registrar"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b162b] border border-[#372f4e] text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!canMakeAdjustments || histSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-900/30"
                  >
                    <History className="w-4 h-4" />
                    <span>{histSubmitting ? 'Recording Entry...' : 'Credit Historical Starting Balance'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: BULK CSV IMPORT */}
          {activeTab === 'bulk' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-2">
                <div className="font-semibold text-emerald-300 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Bulk Import Historical Attendance via CSV</span>
                </div>
                <p className="text-[#c8c2d6]">
                  Paste CSV text or exported table to automatically credit historical hours across multiple faculty members.
                </p>
                <div className="font-mono text-[11px] bg-black/40 p-2 rounded-lg text-emerald-200">
                  Expected format: Lecturer, Historical Hours, Reason
                </div>
              </div>

              {!canMakeAdjustments && (
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Sub-admin account restriction: Only Super Administrators can execute bulk ledger imports.</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#9f99ad] uppercase">
                    CSV Content:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkCsv(
`Lecturer, Historical Hours, Reason
Lawal, 146, Manual attendance records 2024-2025
Olamide, 132, SOC Lab registers 2024-2025
Mr. Stat, 118, Statistics & Data Lab Logbook
Precious, 95, Video Editing & Creative Media Studio`
                      );
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Load Template</span>
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={bulkCsv}
                  onChange={(e) => setBulkCsv(e.target.value)}
                  disabled={!canMakeAdjustments}
                  className="w-full p-3 rounded-xl bg-[#1b162b] border border-[#372f4e] font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {bulkResult && (
                <div className="p-4 rounded-2xl bg-[#181329] border border-[#342b4d] text-xs space-y-2">
                  <div className="font-semibold text-emerald-400">
                    Import Result: {bulkResult.successCount} record(s) successfully created.
                  </div>
                  {bulkResult.errors.length > 0 && (
                    <div className="space-y-1 text-rose-300">
                      <div className="font-semibold">Errors encountered:</div>
                      {bulkResult.errors.map((err, i) => (
                        <div key={i} className="text-[11px] font-mono">• {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={!canMakeAdjustments || bulkSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-900/30"
                >
                  <Upload className="w-4 h-4" />
                  <span>{bulkSubmitting ? 'Importing CSV Records...' : 'Execute Bulk Historical Import'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MANUAL ADJUSTMENT (+/-) */}
          {activeTab === 'adjustment' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 text-xs space-y-1">
                <div className="font-semibold text-purple-300 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Traceable Academic Adjustment (+ or - Hours)</span>
                </div>
                <p className="text-[#c8c2d6]">
                  Every manual adjustment is logged as an immutable transaction with mandatory reason, administrator attribution, and timestamp.
                </p>
              </div>

              {!canMakeAdjustments && (
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Sub-admin account restriction: Only Super Administrators can apply manual balance adjustments.</span>
                </div>
              )}

              <form onSubmit={handleAddAdjustment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#9f99ad] uppercase mb-1.5">
                      Lecturer / Faculty Member *
                    </label>
                    <select
                      value={adjLecturerId}
                      onChange={(e) => setAdjLecturerId(e.target.value)}
                      disabled={!canMakeAdjustments}
                      className="w-full px-3 py-2 rounded-xl bg-[#1b162b] border border-[#372f4e] text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {tutors.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#9f99ad] uppercase mb-1.5">
                      Adjustment Action *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAdjIsAddition(true)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          adjIsAddition
                            ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                            : 'bg-[#1b162b] border-[#372f4e] text-[#9f99ad]'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add (+)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdjIsAddition(false)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          !adjIsAddition
                            ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                            : 'bg-[#1b162b] border-[#372f4e] text-[#9f99ad]'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>Subtract (-)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#9f99ad] uppercase mb-1.5">
                      Number of Hours ({adjIsAddition ? '+ Credit' : '- Deduction'}) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={adjHours}
                      onChange={(e) => setAdjHours(e.target.value)}
                      disabled={!canMakeAdjustments}
                      placeholder="e.g. 2.0"
                      className="w-full px-3 py-2 rounded-xl bg-[#1b162b] border border-[#372f4e] text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#9f99ad] uppercase mb-1.5">
                      Authorized Admin Attribution
                    </label>
                    <input
                      type="text"
                      value={currentAdminName}
                      disabled
                      className="w-full px-3 py-2 rounded-xl bg-[#171324] border border-[#2b253d] text-xs text-[#8e879e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#9f99ad] uppercase mb-1.5">
                    Reason for Adjustment (Mandatory Audit Requirement) *
                  </label>
                  <input
                    type="text"
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                    disabled={!canMakeAdjustments}
                    placeholder="e.g. Missed digital checkout on 2026-09-18 / Weekend Hackathon Supervision Credit"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b162b] border border-[#372f4e] text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#9f99ad] uppercase mb-1.5">
                    Supporting Document / Ticket Memo (Optional)
                  </label>
                  <input
                    type="text"
                    value={adjNote}
                    onChange={(e) => setAdjNote(e.target.value)}
                    disabled={!canMakeAdjustments}
                    placeholder="e.g. Academic Council Memo #ORB-ADJ-2026-04"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b162b] border border-[#372f4e] text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!canMakeAdjustments || adjSubmitting}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                      adjIsAddition
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                    }`}
                  >
                    {adjIsAddition ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    <span>{adjSubmitting ? 'Recording Adjustment...' : `Save ${adjIsAddition ? '+' : '-'}${adjHours || 0} hrs Adjustment`}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-[#28223b] bg-[#141022] flex items-center justify-between text-xs text-[#8e879e]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Ledger status: Real-time synchronization active</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#231d36] hover:bg-[#2d2546] text-white font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
