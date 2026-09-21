import React, { useState, useEffect } from 'react';
import { 
  History, 
  ShieldCheck, 
  Clock, 
  Users, 
  Award, 
  FolderGit2, 
  AlertCircle, 
  Save, 
  RotateCcw, 
  X,
  FileCheck,
  Info
} from 'lucide-react';
import { TutorProfile, TutorService, TutorHistoricalBaseline, ComputedTutorStats } from '../../services/tutorService';
import { playSound } from '../../utils/soundEffects';

interface AdminHistoricalBaselineModalProps {
  isOpen: boolean;
  tutor: TutorProfile | null;
  onClose: () => void;
  onSaved: () => void;
}

export const AdminHistoricalBaselineModal: React.FC<AdminHistoricalBaselineModalProps> = ({
  isOpen,
  tutor,
  onClose,
  onSaved
}) => {
  const [loadingStats, setLoadingStats] = useState(false);
  const [computedStats, setComputedStats] = useState<ComputedTutorStats | null>(null);

  // Form state
  const [hours, setHours] = useState<string>('0');
  const [students, setStudents] = useState<string>('0');
  const [certified, setCertified] = useState<string>('0');
  const [projects, setProjects] = useState<string>('0');
  const [note, setNote] = useState<string>('');
  const [auditedBy, setAuditedBy] = useState<string>('Orbit Academy Academic Registrar');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && tutor) {
      setErrorMsg(null);
      setLoadingStats(true);

      // Load existing baseline values if any
      const currentBaseline = tutor.historicalBaseline;
      setHours(String(currentBaseline?.historicalTeachingHours ?? tutor.baseTeachingHours ?? 0));
      setStudents(String(currentBaseline?.historicalStudentsTaught ?? tutor.baseStudentsCount ?? 0));
      setCertified(String(currentBaseline?.historicalStudentsCertified ?? 0));
      setProjects(String(currentBaseline?.historicalProjectsSupervised ?? 0));
      setNote(currentBaseline?.historicalBaselineNote || 'Audited physical logbook records from academy foundation period.');
      setAuditedBy(currentBaseline?.historicalAuditedBy || 'Orbit Academy Academic Registrar');

      TutorService.getComputedTutorStats(tutor.id)
        .then((stats) => setComputedStats(stats))
        .catch((e) => console.error('Failed to load computed stats:', e))
        .finally(() => setLoadingStats(false));
    }
  }, [isOpen, tutor]);

  if (!isOpen || !tutor) return null;

  const numHours = Math.max(0, Number(hours) || 0);
  const numStudents = Math.max(0, Math.floor(Number(students) || 0));
  const numCertified = Math.max(0, Math.floor(Number(certified) || 0));
  const numProjects = Math.max(0, Math.floor(Number(projects) || 0));

  // Current system metrics (excluding previous baseline)
  const systemHours = computedStats?.newAttendanceHours || 0;
  const systemStudents = computedStats?.newStudentsTaught || 0;
  const systemCertified = computedStats?.newStudentsCertified || 0;
  const systemProjects = computedStats?.newProjectsSupervised || 0;

  // Real-time combined previews
  const previewTotalHours = Math.round((systemHours + numHours) * 10) / 10;
  const previewTotalStudents = systemStudents + numStudents;
  const previewTotalCertified = systemCertified + numCertified;
  const previewTotalProjects = systemProjects + numProjects;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      const baselinePayload: TutorHistoricalBaseline = {
        historicalTeachingHours: numHours,
        historicalStudentsTaught: numStudents,
        historicalStudentsCertified: numCertified,
        historicalProjectsSupervised: numProjects,
        historicalBaselineNote: note.trim() || 'Admin-Entered Historical Baseline',
        historicalAuditedBy: auditedBy.trim() || 'System Administrator',
        historicalAuditDate: new Date().toISOString()
      };

      await TutorService.setTutorHistoricalBaseline(tutor.id, baselinePayload, auditedBy);
      playSound('success');
      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save historical baseline.');
      playSound('error');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm(`Reset historical baseline for ${tutor.name}? Statistics will revert to strictly live digital attendance records.`)) {
      return;
    }
    setSaving(true);
    setErrorMsg(null);

    try {
      await TutorService.clearTutorHistoricalBaseline(tutor.id);
      playSound('chime');
      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to clear baseline.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#151221] border border-[#342d4a] w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-white">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#28213b] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Audited Historical Baseline</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase tracking-wider">
                  Admin Control
                </span>
              </h2>
              <p className="text-xs text-[#9d98af]">
                Crediting pre-platform teaching history for <strong className="text-purple-300">{tutor.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1f1a30] hover:bg-[#2d2547] text-[#9d98af] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Policy Explainer Banner */}
        <div className="p-3.5 rounded-2xl bg-[#1b172a] border border-[#3a3055] flex items-start gap-3 text-xs text-[#c2bed4]">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>No Dummy Data Rule:</strong> Orbit Space does not fabricate dummy statistics. When tutors taught before our attendance system was introduced, admins enter an audited baseline. On public profiles, these hours and students are transparently credited as <strong className="text-amber-300">Admin-Entered Historical Records</strong> alongside digital attendance check-ins.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Baseline Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Historical Hours */}
            <div className="space-y-1.5 bg-[#1a1529] p-3.5 rounded-2xl border border-[#2d2642]">
              <label className="text-xs font-semibold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-purple-300">
                  <Clock className="w-3.5 h-3.5" />
                  Historical Teaching Hours
                </span>
                <span className="text-[10px] font-mono text-[#8a849e]">Hours (hrs)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-[#120f1d] border border-[#383050] text-white text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors"
              />
              <div className="text-[10px] text-[#8e8a9f] flex justify-between pt-1 font-mono">
                <span>System: {systemHours} hrs</span>
                <span className="text-emerald-400 font-bold">Total: {previewTotalHours} hrs</span>
              </div>
            </div>

            {/* Historical Students Taught */}
            <div className="space-y-1.5 bg-[#1a1529] p-3.5 rounded-2xl border border-[#2d2642]">
              <label className="text-xs font-semibold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Users className="w-3.5 h-3.5" />
                  Historical Students Taught
                </span>
                <span className="text-[10px] font-mono text-[#8a849e]">Learners</span>
              </label>
              <input
                type="number"
                min="0"
                value={students}
                onChange={(e) => setStudents(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-[#120f1d] border border-[#383050] text-white text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <div className="text-[10px] text-[#8e8a9f] flex justify-between pt-1 font-mono">
                <span>System: {systemStudents}</span>
                <span className="text-cyan-400 font-bold">Total: {previewTotalStudents}</span>
              </div>
            </div>

            {/* Historical Students Certified */}
            <div className="space-y-1.5 bg-[#1a1529] p-3.5 rounded-2xl border border-[#2d2642]">
              <label className="text-xs font-semibold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <Award className="w-3.5 h-3.5" />
                  Historical Students Certified
                </span>
                <span className="text-[10px] font-mono text-[#8a849e]">Certificates</span>
              </label>
              <input
                type="number"
                min="0"
                value={certified}
                onChange={(e) => setCertified(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-[#120f1d] border border-[#383050] text-white text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <div className="text-[10px] text-[#8e8a9f] flex justify-between pt-1 font-mono">
                <span>System: {systemCertified}</span>
                <span className="text-emerald-400 font-bold">Total: {previewTotalCertified}</span>
              </div>
            </div>

            {/* Historical Projects Supervised */}
            <div className="space-y-1.5 bg-[#1a1529] p-3.5 rounded-2xl border border-[#2d2642]">
              <label className="text-xs font-semibold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <FolderGit2 className="w-3.5 h-3.5" />
                  Historical Projects Supervised
                </span>
                <span className="text-[10px] font-mono text-[#8a849e]">Capstones</span>
              </label>
              <input
                type="number"
                min="0"
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-[#120f1d] border border-[#383050] text-white text-sm font-mono focus:outline-none focus:border-amber-500 transition-colors"
              />
              <div className="text-[10px] text-[#8e8a9f] flex justify-between pt-1 font-mono">
                <span>System: {systemProjects}</span>
                <span className="text-amber-400 font-bold">Total: {previewTotalProjects}</span>
              </div>
            </div>

          </div>

          {/* Audit Note & Auditor Name */}
          <div className="space-y-3 bg-[#181326] p-4 rounded-2xl border border-[#2f2746]">
            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                Historical Audit Justification & Note:
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Physical logbook archives and manual graduation registry from 2023-2024 academic year."
                className="w-full px-3 py-2 rounded-xl bg-[#120f1d] border border-[#383050] text-white text-xs focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                Audited & Authorized By:
              </label>
              <input
                type="text"
                value={auditedBy}
                onChange={(e) => setAuditedBy(e.target.value)}
                placeholder="Name or Title of Administrator"
                className="w-full px-3 py-2 rounded-xl bg-[#120f1d] border border-[#383050] text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={saving}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Baseline (Revert to Pure System Records)</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#1e192e] hover:bg-[#2a233f] text-[#a49faf] text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-purple-900/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving Baseline...' : 'Save Audited Baseline'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
