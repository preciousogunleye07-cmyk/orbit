import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Trash2, 
  Archive, 
  RefreshCw, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Users, 
  FileText,
  Clock,
  ShieldAlert,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { ProgramService, ProgramRecord } from '../../services/programService';
import { TutorProfile, TutorService } from '../../services/tutorService';
import { playSound } from '../../utils/soundEffects';

interface AdminProgramManagerProps {
  onNavigateToCourseDetail?: (programId: string) => void;
}

export const AdminProgramManager: React.FC<AdminProgramManagerProps> = ({
  onNavigateToCourseDetail
}) => {
  const [programs, setPrograms] = useState<ProgramRecord[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

  // Deletion modal state
  const [programToDelete, setProgramToDelete] = useState<ProgramRecord | null>(null);
  const [deleteWarnings, setDeleteWarnings] = useState<{
    attachedTutors: string[];
    attachedStudentsCount: number;
    attachedStudents: string[];
    hasCertificates: boolean;
    certificatesCount: number;
    hasTimetableSlots: boolean;
    timetableSlotsCount: number;
  } | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit / Add Program Modal state
  const [editingProgram, setEditingProgram] = useState<ProgramRecord | null>(null);
  const [isNewProgram, setIsNewProgram] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'development' as ProgramRecord['category'],
    duration: '10 Weeks',
    level: 'Beginner to Advanced',
    schedule: 'Flexible Track',
    badge: 'In Demand',
    priceFormatted: '₦165,000',
    curriculumText: '',
    careerOutcomesText: ''
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadData = () => {
    setPrograms(ProgramService.getAllPrograms());
    setTutors(TutorService.getAllTutors());
  };

  useEffect(() => {
    loadData();
    const unsub = ProgramService.subscribePrograms((p) => setPrograms(p));
    return () => unsub();
  }, []);

  // Filtered Programs
  const filteredPrograms = programs.filter(p => {
    const q = searchTerm.toLowerCase().trim();
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchQ && matchCat && matchStatus;
  });

  // Handle Archive / Reactivate
  const handleToggleArchive = async (program: ProgramRecord) => {
    const newStatus = program.status === 'archived' ? 'active' : 'archived';
    try {
      await ProgramService.setProgramStatus(program.id, newStatus);
      playSound(newStatus === 'active' ? 'chime' : 'click');
      showToast(`Program marked as ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Open Safe Delete Dialog
  const handleOpenDelete = async (program: ProgramRecord) => {
    const deps = await ProgramService.checkProgramDependencies(program.id, program.title);
    setProgramToDelete(program);
    setDeleteWarnings(deps);
    setDeleteConfirmationText('');
    playSound('warning');
  };

  // Execute Safe Delete
  const handleConfirmDelete = async () => {
    if (!programToDelete) return;
    if (deleteConfirmationText.trim().toLowerCase() !== programToDelete.title.trim().toLowerCase()) {
      showToast('Please type the exact program title to confirm permanent deletion.');
      return;
    }

    setIsDeleting(true);
    try {
      await ProgramService.deleteProgram(programToDelete.id);
      playSound('trash');
      showToast(`Program "${programToDelete.title}" permanently deleted.`);
      setProgramToDelete(null);
      setDeleteWarnings(null);
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Edit or Create Modal
  const handleOpenEdit = (program?: ProgramRecord) => {
    if (program) {
      setIsNewProgram(false);
      setEditingProgram(program);
      setFormData({
        title: program.title,
        description: program.description,
        category: program.category,
        duration: program.duration,
        level: program.level,
        schedule: program.schedule,
        badge: program.badge || 'Practical',
        priceFormatted: program.priceFormatted,
        curriculumText: (program.curriculum || []).join('\n'),
        careerOutcomesText: (program.careerOutcomes || []).join('\n')
      });
    } else {
      setIsNewProgram(true);
      setEditingProgram(null);
      setFormData({
        title: '',
        description: '',
        category: 'development',
        duration: '10 Weeks',
        level: 'Beginner to Advanced',
        schedule: 'Flexible Track',
        badge: 'New Track',
        priceFormatted: '₦165,000',
        curriculumText: 'Module 1: Foundations & Architecture\nModule 2: Practical Projects\nModule 3: Industry Capstone',
        careerOutcomesText: 'Industry Specialist\nConsultant'
      });
    }
  };

  const handleSaveProgramForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please enter program title.');
      return;
    }

    try {
      const curriculum = formData.curriculumText.split('\n').map(s => s.trim()).filter(Boolean);
      const careerOutcomes = formData.careerOutcomesText.split('\n').map(s => s.trim()).filter(Boolean);

      await ProgramService.saveProgram({
        id: editingProgram ? editingProgram.id : undefined,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        duration: formData.duration,
        level: formData.level,
        schedule: formData.schedule,
        badge: formData.badge,
        priceFormatted: formData.priceFormatted,
        curriculum,
        careerOutcomes
      });

      playSound('sparkle');
      showToast(`Program "${formData.title}" saved successfully.`);
      setEditingProgram(null);
      setIsNewProgram(false);
    } catch (err: any) {
      showToast(`Failed to save program: ${err.message}`);
    }
  };

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
            Curriculum & Tracks
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Academic Program Management
          </h2>
          <p className="text-xs text-[#9d98af] max-w-xl">
            Create, update, archive, or safely decommission technical tracks. Archiving preserves historical student certificates, attendance rolls, and supervised project links.
          </p>
        </div>

        <button
          onClick={() => handleOpenEdit()}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-950/40 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Academic Program</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-[#141120] p-4 rounded-2xl border border-[#2e2842] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8a849c] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search programs by title or curriculum..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white placeholder-[#78728a] focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Tracks</option>
            <option value="archived">Archived Tracks</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Categories</option>
            <option value="development">Development</option>
            <option value="security">Cybersecurity</option>
            <option value="data">Data</option>
            <option value="design">Design</option>
            <option value="ai">AI & Automation</option>
            <option value="creative">Creative & Media</option>
          </select>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrograms.map((prog) => {
          const isArchived = prog.status === 'archived';
          
          // Find attached faculty
          const attachedTutors = tutors.filter(t => 
            t.programs.some(p => p.toLowerCase().includes(prog.title.toLowerCase()) || prog.title.toLowerCase().includes(p.toLowerCase()))
          );

          return (
            <div
              key={prog.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                isArchived 
                  ? 'bg-[#120f1c] border-[#29223a] opacity-75' 
                  : 'bg-[#141120] border-[#2e2842] hover:border-purple-500/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 font-mono text-[10px] uppercase font-semibold">
                      {prog.category}
                    </span>
                    <span className="text-[11px] font-mono text-[#8a849c]">{prog.duration}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isArchived
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                  }`}>
                    {isArchived ? 'ARCHIVED' : 'ACTIVE'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">
                  {prog.title}
                </h3>

                <p className="text-xs text-[#9d98af] line-clamp-2">
                  {prog.description}
                </p>

                {/* Attached Faculty */}
                <div className="pt-2 border-t border-[#231e33] flex items-center gap-2 text-xs">
                  <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-[#8a849c] text-[11px]">Faculty Attached:</span>
                  {attachedTutors.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {attachedTutors.map(t => (
                        <span key={t.id} className="text-[11px] font-medium text-purple-300">
                          {t.shortName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#6b667a] italic">None Assigned</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#231e33] flex items-center justify-between gap-2">
                <div className="text-xs font-mono font-bold text-emerald-400">
                  {prog.priceFormatted}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(prog)}
                    className="p-2 rounded-xl bg-[#1b172b] hover:bg-purple-900/40 text-[#c4c0d4] hover:text-white border border-[#342d4a] transition-all cursor-pointer"
                    title="Edit Program Information"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleArchive(prog)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                      isArchived
                        ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/60'
                        : 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-900/60'
                    }`}
                    title={isArchived ? 'Reactivate track for prospective learners' : 'Archive track to safely hide without breaking past certificates'}
                  >
                    <Archive className="w-3 h-3" />
                    <span>{isArchived ? 'Reactivate' : 'Archive'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenDelete(prog)}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition-all cursor-pointer"
                    title="Permanently Delete Program"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: SAFE DELETE PROGRAM CONFIRMATION */}
      {programToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151221] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-rose-900/50 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Academic Program</h3>
                <span className="text-xs font-mono text-rose-400">Irreversible Decommissioning</span>
              </div>
            </div>

            <p className="text-xs text-[#c4c0d4] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{programToDelete.title}"</strong>?
            </p>

            {/* Safety Warnings for Attached Faculty / Students / Historical Records */}
            {deleteWarnings && (
              <div className="space-y-2.5">
                {/* Tutors Attached Warning */}
                {deleteWarnings.attachedTutors.length > 0 && (
                  <div className="bg-amber-950/40 rounded-2xl p-3.5 border border-amber-800/50 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>Faculty Attached ({deleteWarnings.attachedTutors.length})</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      Assigned instructors: <strong className="text-white">{deleteWarnings.attachedTutors.join(', ')}</strong>.
                    </p>
                  </div>
                )}

                {/* Students Attached Warning */}
                {deleteWarnings.attachedStudentsCount > 0 && (
                  <div className="bg-amber-950/40 rounded-2xl p-3.5 border border-amber-800/50 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>Active Enrolled Students ({deleteWarnings.attachedStudentsCount})</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      Enrolled learners: <strong className="text-white">{deleteWarnings.attachedStudents.join(', ')}</strong>
                      {deleteWarnings.attachedStudentsCount > deleteWarnings.attachedStudents.length && (
                        <span> and {deleteWarnings.attachedStudentsCount - deleteWarnings.attachedStudents.length} others</span>
                      )}.
                    </p>
                  </div>
                )}

                {/* Certificates Issued Warning */}
                {deleteWarnings.hasCertificates && (
                  <div className="bg-rose-950/40 rounded-2xl p-3.5 border border-rose-800/50 space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Issued Certificates Warning</span>
                    </div>
                    <p className="text-[11px] text-rose-200/90 leading-relaxed">
                      There are <strong className="text-white">{deleteWarnings.certificatesCount} verifiable certificates</strong> issued under this track title. Deleting this track will disrupt historical graduate verification.
                    </p>
                  </div>
                )}

                {/* Timetable Slots Warning */}
                {deleteWarnings.hasTimetableSlots && (
                  <div className="bg-purple-950/40 rounded-2xl p-3.5 border border-purple-800/50 space-y-1.5">
                    <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Timetable Schedule Conflict</span>
                    </div>
                    <p className="text-[11px] text-purple-200/90 leading-relaxed">
                      This program has <strong className="text-white">{deleteWarnings.timetableSlotsCount} weekly timetable lecture slots</strong> currently scheduled.
                    </p>
                  </div>
                )}

                <div className="text-[11px] text-purple-300 bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/40 leading-relaxed">
                  💡 <strong>Recommendation:</strong> Use <strong>Archive</strong> instead of permanent delete. Archiving hides the program from public admissions while preserving all past student certificates and faculty verification portfolios.
                </div>
              </div>
            )}

            {/* Type to Confirm Guard */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#9d98af] block">
                Type <span className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">{programToDelete.title}</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type exact program title here..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleToggleArchive(programToDelete);
                  setProgramToDelete(null);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-800/50 text-amber-300 text-xs font-semibold cursor-pointer"
              >
                Archive Instead
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProgramToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#1c172a] hover:bg-[#28223c] text-xs font-semibold text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmationText.trim().toLowerCase() !== programToDelete.title.trim().toLowerCase() || isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-950/40"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Permanently Delete'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT PROGRAM MODAL */}
      {(editingProgram || isNewProgram) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#151221] rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#342d4a] space-y-5 shadow-2xl my-8 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-[#2d2740] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isNewProgram ? 'Create Academic Program' : `Edit: ${editingProgram?.title}`}
                </h3>
                <p className="text-xs text-[#9d98af]">Configure track specifications, curriculum modules, and tuition.</p>
              </div>
              <button
                onClick={() => {
                  setEditingProgram(null);
                  setIsNewProgram(false);
                }}
                className="text-[#9d98af] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProgramForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-[#c4c0d4]">Program Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Full Stack Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-[#c4c0d4]">Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the program..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#c4c0d4]">Track Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="development">Development</option>
                    <option value="security">Cybersecurity</option>
                    <option value="data">Data Analysis</option>
                    <option value="design">UI/UX & Design</option>
                    <option value="ai">AI & Automation</option>
                    <option value="creative">Creative Media & Video</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#c4c0d4]">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 10 Weeks"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#c4c0d4]">Target Level</label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="e.g. Beginner to Pro"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#c4c0d4]">Tuition Price Formatted</label>
                  <input
                    type="text"
                    value={formData.priceFormatted}
                    onChange={(e) => setFormData({ ...formData, priceFormatted: e.target.value })}
                    placeholder="e.g. ₦165,000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-[#c4c0d4]">Curriculum Modules (1 per line)</label>
                  <textarea
                    rows={4}
                    value={formData.curriculumText}
                    onChange={(e) => setFormData({ ...formData, curriculumText: e.target.value })}
                    placeholder="Enter each module on a new line..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2d2740]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProgram(null);
                    setIsNewProgram(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#1c172a] hover:bg-[#28223c] text-xs font-semibold text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-950/40 cursor-pointer"
                >
                  {isNewProgram ? 'Publish Program' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
