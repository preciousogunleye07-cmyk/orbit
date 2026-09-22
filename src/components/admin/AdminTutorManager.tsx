import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Trash2, 
  UserX, 
  ExternalLink, 
  Edit3, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  FolderGit2, 
  Clock, 
  BookOpen, 
  Award,
  Layers,
  Sparkles,
  Plus,
  History,
  Copy
} from 'lucide-react';
import { TutorProfile, TutorService } from '../../services/tutorService';
import { VerificationDataService } from '../../services/verificationDataService';
import { EditTutorModal } from './EditTutorModal';
import { AdminHistoricalBaselineModal } from './AdminHistoricalBaselineModal';
import { AdminTeachingHoursLedgerModal } from './AdminTeachingHoursLedgerModal';
import { CreateMentorModal } from './CreateMentorModal';
import { AdminMentorProfileView } from './AdminMentorProfileView';
import { playSound } from '../../utils/soundEffects';

interface AdminTutorManagerProps {
  onOpenPublicTutor: (slug: string) => void;
  allowDeletion?: boolean;
}

export const AdminTutorManager: React.FC<AdminTutorManagerProps> = ({
  onOpenPublicTutor,
  allowDeletion = true
}) => {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all');
  
  // Dedicated mentor management view
  const [selectedMentorForDetail, setSelectedMentorForDetail] = useState<TutorProfile | null>(null);

  // Create mentor modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Edit tutor modal
  const [tutorToEdit, setTutorToEdit] = useState<TutorProfile | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Historical Baseline modal
  const [tutorForBaseline, setTutorForBaseline] = useState<TutorProfile | null>(null);
  const [isBaselineOpen, setIsBaselineOpen] = useState(false);

  // Teaching Hours Ledger modal
  const [tutorForLedger, setTutorForLedger] = useState<TutorProfile | null>(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // Deletion / Deactivation modal
  const [tutorToDelete, setTutorToDelete] = useState<TutorProfile | null>(null);
  const [tutorStats, setTutorStats] = useState<{
    teachingHours: number;
    studentsCount: number;
    supervisedProjectsCount: number;
    supervisedArticlesCount: number;
    certificatesLinkedCount: number;
    programsCount: number;
    programsList: string[];
    uploadedProjectEvidenceCount: number;
    hasHistoricalBaseline: boolean;
  } | null>(null);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadTutors = () => {
    setTutors(TutorService.getAllTutors());
  };

  useEffect(() => {
    loadTutors();
    const unsub = TutorService.subscribeTutors((latest) => setTutors(latest));
    return () => unsub();
  }, []);

  const filteredTutors = tutors.filter(t => {
    const q = searchTerm.toLowerCase().trim();
    const matchQuery = !q || 
      t.name.toLowerCase().includes(q) || 
      (t.shortName && t.shortName.toLowerCase().includes(q)) ||
      t.specialization.toLowerCase().includes(q) ||
      t.role.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || (t.status || 'active') === statusFilter;
    return matchQuery && matchStatus;
  });

  // Handle Soft-Delete / Deactivation
  const handleToggleDeactivate = async (tutor: TutorProfile) => {
    const newStatus = tutor.status === 'deactivated' ? 'active' : 'deactivated';
    try {
      await TutorService.setTutorStatus(tutor.id, newStatus);
      playSound(newStatus === 'active' ? 'chime' : 'click');
      showToast(`Tutor ${tutor.shortName || tutor.name} marked as ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Open Safe Delete modal
  const handleOpenDelete = async (tutor: TutorProfile) => {
    const stats = await TutorService.getTutorRecordStats(tutor.id);
    setTutorToDelete(tutor);
    setTutorStats(stats);
    setConfirmDeleteText('');
    playSound('warning');
  };

  // Confirm Permanent Deletion
  const handleConfirmDelete = async () => {
    if (!tutorToDelete) return;
    if (confirmDeleteText.trim().toLowerCase() !== tutorToDelete.name.trim().toLowerCase()) {
      showToast('Type the exact tutor name to confirm permanent removal.');
      return;
    }

    setIsDeleting(true);
    try {
      await TutorService.deleteTutorPermanently(tutorToDelete.id);
      playSound('trash');
      showToast(`Tutor ${tutorToDelete.name} permanently removed from directory.`);
      setTutorToDelete(null);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Dedicated mentor management view
  if (selectedMentorForDetail) {
    return (
      <AdminMentorProfileView
        tutor={selectedMentorForDetail}
        onBack={() => {
          setSelectedMentorForDetail(null);
          loadTutors();
        }}
        onOpenPublicTutor={onOpenPublicTutor}
        onTutorUpdated={(updated) => {
          setSelectedMentorForDetail(updated);
          loadTutors();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-24 right-6 z-50 bg-[#161224] border border-purple-500/80 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header card */}
      <div className="bg-[#141120] rounded-3xl p-6 sm:p-8 border border-[#2e2842] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 font-mono text-[10px] font-semibold uppercase">
            Faculty Directory & Credentials
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Faculty Mentors & Verification Management
          </h2>
          <p className="text-xs text-[#9d98af] max-w-xl">
            Manage individual mentors across all assigned courses and cohorts. Audit teaching hours, track student capstones, and manage shareable LinkedIn verification profiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-950/40 cursor-pointer transition-all"
            title="Create a new mentor profile teaching multiple courses"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Mentor</span>
          </button>

          <button
            onClick={() => {
              setTutorForLedger(null);
              setIsLedgerOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#1f1935] hover:bg-purple-900/40 text-purple-200 border border-purple-800/50 text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-950/30 cursor-pointer transition-all"
            title="Manage historical teaching hours, CSV import, and manual adjustments"
          >
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Teaching Hours Ledger</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-[#141120] p-4 rounded-2xl border border-[#2e2842] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8a849c] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search mentors by full name, short name, or specialization..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white placeholder-[#78728a] focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Faculty Statuses</option>
            <option value="active">Active Faculty</option>
            <option value="deactivated">Deactivated (Soft-Deleted)</option>
          </select>
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTutors.map((tutor) => {
          const isDeactivated = tutor.status === 'deactivated';
          const verifiedProjects = VerificationDataService.getProjectsForTutor(tutor.id).filter(p => p.verificationStatus === 'verified');
          const verifiedHours = VerificationDataService.getTotalVerifiedHours(tutor.id, tutor.baseTeachingHours);

          return (
            <div
              key={tutor.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                isDeactivated
                  ? 'bg-[#120f1c] border-[#29223a] opacity-75'
                  : 'bg-[#141120] border-[#2e2842] hover:border-purple-500/40'
              }`}
            >
              <div className="space-y-3">
                
                {/* Header row with avatar & status */}
                <div className="flex items-center justify-between gap-3">
                  <div 
                    onClick={() => setSelectedMentorForDetail(tutor)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 group-hover:border-purple-400 flex items-center justify-center text-purple-300 font-bold text-base shrink-0 overflow-hidden relative transition-colors">
                      {tutor.photoUrl ? (
                        <img
                          src={tutor.photoUrl}
                          alt={tutor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        tutor.avatar || (tutor.shortName ? tutor.shortName.charAt(0) : 'T')
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                          {tutor.name}
                        </h3>
                        <span className="text-xs font-mono text-purple-400">
                          ({tutor.shortName})
                        </span>
                      </div>
                      <p className="text-xs text-[#9d98af]">{tutor.role}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isDeactivated
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                  }`}>
                    {isDeactivated ? 'DEACTIVATED' : 'ACTIVE'}
                  </span>
                </div>

                {/* Evidence Stats row */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#1a1628] border border-[#2d2740] text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#8e8a9f] uppercase block">Audited Hours</span>
                    <span className="text-purple-300 font-bold">{verifiedHours} hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8e8a9f] uppercase block">Supervised Projects</span>
                    <span className="text-emerald-400 font-bold">{verifiedProjects.length} Verified</span>
                  </div>
                </div>

                {/* Programs Taught */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#8e8a9f] tracking-wider block">
                      Assigned Subjects ({tutor.programs?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTutorToEdit(tutor);
                        setIsEditOpen(true);
                      }}
                      className="text-[11px] text-purple-400 hover:text-purple-300 transition inline-flex items-center gap-1 cursor-pointer font-medium"
                      title="Assign or edit multiple subjects for this tutor"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Assign Subjects</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tutor.programs && tutor.programs.length > 0 ? (
                      tutor.programs.map((prog, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300 text-[10px] font-mono">
                          {prog}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-neutral-500 italic">No subjects assigned yet — click Assign Subjects</span>
                    )}
                  </div>
                </div>

                {/* Public Verification Link */}
                <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#8a849c]">
                  <span>Slug: <strong className="text-purple-400">/tutor/{tutor.slug}</strong></span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const origin = window.location.origin || '';
                        navigator.clipboard.writeText(`${origin}/tutor/${tutor.slug}`);
                        playSound('sparkle');
                        showToast(`Copied /tutor/${tutor.slug} link for LinkedIn/CV`);
                      }}
                      className="px-2 py-0.5 rounded bg-[#1f1a30] hover:bg-[#2c2444] border border-[#393150] text-[#c4c0d4] hover:text-white text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy public link to share on LinkedIn/CV"
                    >
                      <Copy className="w-3 h-3 text-purple-400" />
                      <span>Copy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenPublicTutor(tutor.slug)}
                      className="text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#231e33] flex items-center justify-end gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedMentorForDetail(tutor)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-purple-950/40"
                  title="Open dedicated mentor profile page"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Manage Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTutorForLedger(tutor);
                    setIsLedgerOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/50 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Audited teaching hours ledger, historical baseline & manual adjustments"
                >
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hours Ledger</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTutorForBaseline(tutor);
                    setIsBaselineOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Admin-entered historical baseline (teaching hours, students, certificates)"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Historical Baseline</span>
                </button>

                <button
                  onClick={() => {
                    setTutorToEdit(tutor);
                    setIsEditOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#1b172b] hover:bg-purple-900/40 text-[#c4c0d4] hover:text-white border border-[#342d4a] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Info</span>
                </button>

                <button
                  onClick={() => handleToggleDeactivate(tutor)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                    isDeactivated
                      ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/60'
                      : 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-900/60'
                  }`}
                  title={isDeactivated ? 'Reactivate instructor' : 'Deactivate instructor (preserves student certificates and historical attendance)'}
                >
                  <UserX className="w-3 h-3" />
                  <span>{isDeactivated ? 'Reactivate' : 'Deactivate'}</span>
                </button>

                {allowDeletion && (
                  <button
                    onClick={() => handleOpenDelete(tutor)}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition-all cursor-pointer"
                    title="Permanently Remove Tutor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Historical Baseline Modal */}
      <AdminHistoricalBaselineModal
        isOpen={isBaselineOpen}
        tutor={tutorForBaseline}
        onClose={() => {
          setIsBaselineOpen(false);
          setTutorForBaseline(null);
        }}
        onSaved={loadTutors}
      />

      {/* Teaching Hours Ledger Modal */}
      <AdminTeachingHoursLedgerModal
        isOpen={isLedgerOpen}
        initialLecturerId={tutorForLedger?.id}
        onClose={() => {
          setIsLedgerOpen(false);
          setTutorForLedger(null);
        }}
        onUpdated={() => {
          loadTutors();
          showToast('Teaching hours ledger and tutor metrics synchronized successfully.');
        }}
      />

      {/* EDIT TUTOR MODAL */}
      <EditTutorModal
        tutor={tutorToEdit}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setTutorToEdit(null);
        }}
        onTutorUpdated={(updated) => {
          showToast(`Tutor ${updated.shortName || updated.name} updated across all modules.`);
          loadTutors();
        }}
      />

      {/* PERMANENT DELETE TUTOR CONFIRMATION MODAL */}
      {tutorToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151221] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-rose-900/50 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Tutor Record</h3>
                <span className="text-xs font-mono text-rose-400">Irreversible Action</span>
              </div>
            </div>

            <p className="text-xs text-[#c4c0d4] leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{tutorToDelete.name}"</strong>?
            </p>

            {/* Historical Records Warning */}
            {tutorStats && (
              <div className="bg-amber-950/40 rounded-2xl p-4 border border-amber-800/50 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Associated Academic Records & Supervised Evidence</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-amber-200/90 pt-1">
                  <div className="bg-black/30 p-2 rounded-xl border border-amber-900/40">
                    <span className="text-[#9d98af] block text-[10px] uppercase">Teaching Hours</span>
                    <strong className="text-white text-sm">{tutorStats.teachingHours} hrs</strong>
                  </div>
                  <div className="bg-black/30 p-2 rounded-xl border border-amber-900/40">
                    <span className="text-[#9d98af] block text-[10px] uppercase">Students Taught</span>
                    <strong className="text-white text-sm">{tutorStats.studentsCount} students</strong>
                  </div>
                  <div className="bg-black/30 p-2 rounded-xl border border-amber-900/40">
                    <span className="text-[#9d98af] block text-[10px] uppercase">Projects Supervised</span>
                    <strong className="text-white text-sm">{tutorStats.supervisedProjectsCount} projects</strong>
                  </div>
                  <div className="bg-black/30 p-2 rounded-xl border border-amber-900/40">
                    <span className="text-[#9d98af] block text-[10px] uppercase">Uploaded Evidence</span>
                    <strong className="text-white text-sm">{tutorStats.uploadedProjectEvidenceCount} verified live/repos</strong>
                  </div>
                  <div className="bg-black/30 p-2 rounded-xl border border-amber-900/40">
                    <span className="text-[#9d98af] block text-[10px] uppercase">Articles Supervised</span>
                    <strong className="text-white text-sm">{tutorStats.supervisedArticlesCount} publications</strong>
                  </div>
                  <div className="bg-black/30 p-2 rounded-xl border border-amber-900/40">
                    <span className="text-[#9d98af] block text-[10px] uppercase">Certified Alumni</span>
                    <strong className="text-white text-sm">{tutorStats.certificatesLinkedCount} certified</strong>
                  </div>
                </div>

                {tutorStats.programsList && tutorStats.programsList.length > 0 && (
                  <div className="text-[11px] text-[#c4c0d4] bg-black/20 p-2.5 rounded-xl border border-amber-900/30">
                    <span className="text-[#9d98af] block font-mono text-[10px] uppercase mb-1">Programs Taught:</span>
                    <span className="font-semibold text-white">{tutorStats.programsList.join(', ')}</span>
                  </div>
                )}

                <div className="text-[11px] text-purple-300 bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/40 leading-relaxed">
                  💡 <strong>Soft Delete / Deactivation Recommended:</strong> Deactivating preserves existing student certificates, published technical research, and verified student capstones while hiding this instructor from active course allocations.
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#9d98af] block">
                Type <span className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">{tutorToDelete.name}</span> to confirm permanent deletion:
              </label>
              <input
                type="text"
                value={confirmDeleteText}
                onChange={(e) => setConfirmDeleteText(e.target.value)}
                placeholder="Type exact tutor name here..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleToggleDeactivate(tutorToDelete);
                  setTutorToDelete(null);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-800/50 text-amber-300 text-xs font-semibold cursor-pointer"
              >
                Deactivate Instead
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTutorToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#1c172a] hover:bg-[#28223c] text-xs font-semibold text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmDeleteText.trim().toLowerCase() !== tutorToDelete.name.trim().toLowerCase() || isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-950/40"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Tutor'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Create Mentor Modal */}
      {isCreateOpen && (
        <CreateMentorModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={(newMentor) => {
            loadTutors();
            setSelectedMentorForDetail(newMentor);
            showToast(`Created mentor profile for ${newMentor.name}`);
          }}
        />
      )}

    </div>
  );
};
