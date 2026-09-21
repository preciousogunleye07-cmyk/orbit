import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  ExternalLink, 
  UploadCloud, 
  FileText, 
  Plus, 
  Check, 
  UserCheck, 
  ShieldAlert, 
  AlertTriangle,
  Github,
  Award,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  VerificationDataService, 
  SupervisedProjectRecord, 
  TeachingHourRecord 
} from '../../services/verificationDataService';
import { TutorProfile, TutorService } from '../../services/tutorService';
import { CertificateRecord, getCertificates } from '../../services/certificateService';
import { ProgramService, ProgramRecord } from '../../services/programService';
import { playSound } from '../../utils/soundEffects';

interface AdminVerificationHubProps {
  currentAdminName: string;
  onOpenPublicTutor?: (slug: string) => void;
  onOpenPublicProject?: (slug: string) => void;
  onOpenPublicCertificate?: (id: string) => void;
}

export const AdminVerificationHub: React.FC<AdminVerificationHubProps> = ({
  currentAdminName,
  onOpenPublicTutor,
  onOpenPublicProject,
  onOpenPublicCertificate
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'hours' | 'add-project' | 'log-hour'>('projects');
  const [projects, setProjects] = useState<SupervisedProjectRecord[]>([]);
  const [hours, setHours] = useState<TeachingHourRecord[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [programs, setPrograms] = useState<ProgramRecord[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');
  const [selectedTutorFilter, setSelectedTutorFilter] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states for Uploading Student Project
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    studentName: '',
    studentIdOrRef: '',
    program: '',
    category: 'web' as SupervisedProjectRecord['category'],
    projectUrl: '',
    repoUrl: '',
    tutorId: '',
    supervisionDate: new Date().toISOString().split('T')[0],
    visibility: 'public' as SupervisedProjectRecord['visibility'],
    linkedCertificateId: ''
  });

  // Form states for Logging Teaching Hours
  const [newHour, setNewHour] = useState({
    tutorId: '',
    program: '',
    date: new Date().toISOString().split('T')[0],
    durationHours: 2.5,
    studentsCount: 15,
    topicCovered: '',
    sessionNotes: ''
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const refreshData = () => {
    setProjects([...VerificationDataService.getAllSupervisedProjects()]);
    setHours([...VerificationDataService.getAllTeachingHours()]);
    setTutors([...TutorService.getAllTutors()]);
    setPrograms([...ProgramService.getAllPrograms()]);
    setCertificates(getCertificates());
  };

  useEffect(() => {
    refreshData();
    const unsub = TutorService.subscribeTutors((t) => setTutors(t));
    return () => unsub();
  }, []);

  // Handle Project Verification Action
  const handleVerifyProject = async (projectId: string, status: 'verified' | 'rejected') => {
    try {
      await VerificationDataService.setProjectVerification(projectId, status, currentAdminName);
      playSound(status === 'verified' ? 'chime' : 'click');
      showToast(`Project record marked as ${status.toUpperCase()} by ${currentAdminName}.`);
      refreshData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Handle Teaching Hour Verification Action
  const handleVerifyHour = async (hourId: string, verified: boolean) => {
    try {
      await VerificationDataService.verifyTeachingSession(hourId, verified, currentAdminName);
      playSound(verified ? 'chime' : 'click');
      showToast(`Teaching session ${verified ? 'VERIFIED' : 'REJECTED'}.`);
      refreshData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Handle Submit New Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim() || !newProject.studentName.trim() || !newProject.tutorId) {
      showToast('Please provide project title, student name, and supervising tutor.');
      return;
    }

    const tutorObj = tutors.find(t => t.id === newProject.tutorId);
    if (!tutorObj) return;

    try {
      await VerificationDataService.uploadStudentProject({
        title: newProject.title.trim(),
        description: newProject.description.trim() || 'Student capstone project at Orbit Space Academy.',
        studentName: newProject.studentName.trim(),
        studentIdOrRef: newProject.studentIdOrRef.trim() || undefined,
        program: newProject.program || tutorObj.programs[0] || 'Tech Track',
        category: newProject.category,
        projectUrl: newProject.projectUrl.trim() || undefined,
        repoUrl: newProject.repoUrl.trim() || undefined,
        tutorId: tutorObj.id,
        tutorName: tutorObj.name,
        tutorRole: tutorObj.role,
        supervisionDate: newProject.supervisionDate,
        visibility: newProject.visibility,
        verificationStatus: 'verified', // Admin created is auto verified
        linkedCertificateId: newProject.linkedCertificateId.trim() || undefined,
        verifiedBy: currentAdminName,
        verifiedAt: new Date().toISOString()
      });

      playSound('sparkle');
      showToast('Student capstone project registered and audited successfully!');
      setNewProject({
        title: '',
        description: '',
        studentName: '',
        studentIdOrRef: '',
        program: '',
        category: 'web',
        projectUrl: '',
        repoUrl: '',
        tutorId: '',
        supervisionDate: new Date().toISOString().split('T')[0],
        visibility: 'public',
        linkedCertificateId: ''
      });
      refreshData();
      setActiveSubTab('projects');
    } catch (err: any) {
      showToast(`Error saving project: ${err.message}`);
    }
  };

  // Handle Submit Teaching Session
  const handleSaveHour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHour.tutorId || !newHour.topicCovered.trim()) {
      showToast('Please select tutor and enter the session topic covered.');
      return;
    }

    const tutorObj = tutors.find(t => t.id === newHour.tutorId);
    if (!tutorObj) return;

    try {
      await VerificationDataService.recordTeachingSession({
        tutorId: tutorObj.id,
        tutorName: tutorObj.shortName || tutorObj.name,
        program: newHour.program || tutorObj.programs[0] || 'Academic Session',
        date: newHour.date,
        durationHours: Number(newHour.durationHours) || 2,
        studentsCount: Number(newHour.studentsCount) || 12,
        topicCovered: newHour.topicCovered.trim(),
        sessionNotes: newHour.sessionNotes.trim() || undefined,
        verificationStatus: 'verified', // Admin recorded is verified
        verifiedBy: currentAdminName,
        verifiedAt: new Date().toISOString()
      });

      playSound('sparkle');
      showToast('Teaching session recorded and verified into faculty ledger!');
      setNewHour({
        tutorId: '',
        program: '',
        date: new Date().toISOString().split('T')[0],
        durationHours: 2.5,
        studentsCount: 15,
        topicCovered: '',
        sessionNotes: ''
      });
      refreshData();
      setActiveSubTab('hours');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Filtered lists
  const filteredProjects = projects.filter(p => {
    const q = searchTerm.toLowerCase().trim();
    const matchQuery = !q || 
      p.title.toLowerCase().includes(q) || 
      p.studentName.toLowerCase().includes(q) || 
      p.tutorName.toLowerCase().includes(q) ||
      (p.linkedCertificateId || '').toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || p.verificationStatus === statusFilter;
    const matchTutor = selectedTutorFilter === 'all' || p.tutorId === selectedTutorFilter;
    return matchQuery && matchStatus && matchTutor;
  });

  const filteredHours = hours.filter(h => {
    const q = searchTerm.toLowerCase().trim();
    const matchQuery = !q || 
      h.topicCovered.toLowerCase().includes(q) || 
      h.tutorName.toLowerCase().includes(q) || 
      h.program.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || h.verificationStatus === statusFilter;
    const matchTutor = selectedTutorFilter === 'all' || h.tutorId === selectedTutorFilter;
    return matchQuery && matchStatus && matchTutor;
  });

  // Pending counters
  const pendingProjectsCount = projects.filter(p => p.verificationStatus === 'pending').length;
  const pendingHoursCount = hours.filter(h => h.verificationStatus === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-24 right-6 z-50 bg-[#161224] border border-purple-500/80 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#141120] rounded-3xl p-6 sm:p-8 border border-[#2e2842] shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 font-mono text-[10px] font-semibold uppercase">
                Academic Integrity & Evidence
              </span>
              {(pendingProjectsCount > 0 || pendingHoursCount > 0) && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 font-mono text-[10px] animate-pulse">
                  {pendingProjectsCount + pendingHoursCount} Pending Audits
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Tutor Verification & Student Evidence Engine
            </h2>
            <p className="text-xs text-[#9d98af] max-w-2xl">
              Orbit Space Academy strict verification workflow: Student projects, capstones, and faculty teaching hours are audited by the academic council before linking to public tutor profiles and certificates.
            </p>
          </div>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveSubTab('add-project')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-950/40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Capstone Project</span>
            </button>
            <button
              onClick={() => setActiveSubTab('log-hour')}
              className="px-4 py-2 rounded-xl bg-[#1f1a30] hover:bg-[#2c2444] border border-[#3b3353] text-purple-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Log Faculty Hours</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-2 border-t border-[#262038] pt-4 mt-6 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'projects'
                ? 'bg-purple-600 text-white'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1f1a30]'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Supervised Projects ({projects.length})</span>
            {pendingProjectsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-bold">
                {pendingProjectsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('hours')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'hours'
                ? 'bg-purple-600 text-white'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1f1a30]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Teaching Hours Ledger ({hours.length})</span>
            {pendingHoursCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-bold">
                {pendingHoursCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('add-project')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'add-project'
                ? 'bg-purple-600 text-white'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1f1a30]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Student Project</span>
          </button>

          <button
            onClick={() => setActiveSubTab('log-hour')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'log-hour'
                ? 'bg-purple-600 text-white'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1f1a30]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Log Teaching Session</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR for Lists */}
      {(activeSubTab === 'projects' || activeSubTab === 'hours') && (
        <div className="bg-[#141120] p-4 rounded-2xl border border-[#2e2842] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8a849c] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeSubTab === 'projects' ? 'Search student, project title, certificate ID...' : 'Search topic, program, or mentor...'}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white placeholder-[#78728a] focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTutorFilter}
              onChange={(e) => setSelectedTutorFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Faculty Mentors</option>
              {tutors.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#1b172a] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Audit</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: SUPERVISED PROJECTS LIST */}
      {activeSubTab === 'projects' && (
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="bg-[#141120] rounded-2xl p-12 text-center border border-[#2e2842] space-y-3">
              <FolderGit2 className="w-12 h-12 text-purple-400/50 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Capstone Projects Match Filter</h4>
              <p className="text-xs text-[#9d98af]">Try changing the filter or add a student project above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProjects.map((p) => {
                const isAudited = p.verificationStatus === 'verified';
                const isPending = p.verificationStatus === 'pending';

                return (
                  <div
                    key={p.id}
                    className="bg-[#141120] rounded-2xl p-5 border border-[#2e2842] hover:border-purple-500/40 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300 font-semibold">
                            {p.program}
                          </span>
                          <span className="text-[#8e8a9f]">• Student: <strong className="text-white">{p.studentName}</strong></span>
                          {p.studentIdOrRef && (
                            <span className="text-[#8e8a9f]">({p.studentIdOrRef})</span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${
                            isAudited 
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' 
                              : isPending
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60 animate-pulse'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          }`}>
                            {p.verificationStatus.toUpperCase()}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white">
                          {p.title}
                        </h3>

                        <p className="text-xs text-[#9d98af] leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      {/* Admin Verification Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleVerifyProject(p.id, 'verified')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve Project</span>
                            </button>
                            <button
                              onClick={() => handleVerifyProject(p.id, 'rejected')}
                              className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/50 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                            <Check className="w-3 h-3" />
                            <span>Audited by {p.verifiedBy}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta bar & Quick Links */}
                    <div className="pt-3 border-t border-[#231e33] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 text-[#9d98af]">
                        <span>Supervisor: <strong className="text-purple-300">{p.tutorName}</strong></span>
                        <span>Date: {p.supervisionDate}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.projectUrl && (
                          <a
                            href={p.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:underline flex items-center gap-1 text-[11px] font-mono"
                          >
                            <span>Live App</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {p.repoUrl && (
                          <a
                            href={p.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:underline flex items-center gap-1 text-[11px] font-mono"
                          >
                            <span>Repo</span>
                            <Github className="w-3 h-3" />
                          </a>
                        )}

                        {p.linkedCertificateId && onOpenPublicCertificate && (
                          <button
                            type="button"
                            onClick={() => onOpenPublicCertificate(p.linkedCertificateId!)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/50 text-emerald-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                          >
                            <Award className="w-3 h-3" />
                            <span>Cert {p.linkedCertificateId}</span>
                          </button>
                        )}

                        {onOpenPublicProject && (
                          <button
                            type="button"
                            onClick={() => onOpenPublicProject(p.verificationSlug)}
                            className="px-2.5 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-900/80 border border-purple-700/50 text-purple-200 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect Evidence Page</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: TEACHING HOURS LEDGER */}
      {activeSubTab === 'hours' && (
        <div className="space-y-4">
          <div className="bg-[#141120] rounded-2xl border border-[#2e2842] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2e2842] bg-[#191528] text-[#9d98af] font-mono uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Session Date</th>
                    <th className="p-3.5">Faculty Mentor</th>
                    <th className="p-3.5">Topic & Program</th>
                    <th className="p-3.5">Hours</th>
                    <th className="p-3.5">Attendance</th>
                    <th className="p-3.5">Verification Audit</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#231e33]">
                  {filteredHours.map((h) => {
                    const isVerified = h.verificationStatus === 'verified';
                    const isPending = h.verificationStatus === 'pending';

                    return (
                      <tr key={h.id} className="hover:bg-[#1a162b] transition-colors">
                        <td className="p-3.5 font-mono text-purple-300">
                          {h.date}
                        </td>
                        <td className="p-3.5 font-bold text-white">
                          {h.tutorName}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{h.topicCovered}</div>
                          <div className="text-[11px] text-purple-400 font-mono">{h.program}</div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">
                          {h.durationHours} hrs
                        </td>
                        <td className="p-3.5 font-mono text-[#b6b1c5]">
                          {h.studentsCount} students
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                            isVerified
                              ? 'bg-emerald-950/80 border border-emerald-800/60 text-emerald-400'
                              : isPending
                              ? 'bg-amber-950/80 border border-amber-800/60 text-amber-300 animate-pulse'
                              : 'bg-rose-950/80 border border-rose-800/60 text-rose-300'
                          }`}>
                            {isVerified ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            <span>{isVerified ? `Audited: ${h.verifiedBy || 'Admin'}` : h.verificationStatus.toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {isPending && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleVerifyHour(h.id, true)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerifyHour(h.id, false)}
                                className="px-2.5 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 text-[11px] font-semibold cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FORM TO REGISTER STUDENT CAPSTONE PROJECT */}
      {activeSubTab === 'add-project' && (
        <div className="bg-[#141120] rounded-3xl p-6 sm:p-8 border border-[#2e2842] shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Register Verified Student Capstone Project</h3>
            <p className="text-xs text-[#9d98af]">Once registered, this project immediately indexes into the supervising tutor's profile and displays on the student's verification link.</p>
          </div>

          <form onSubmit={handleSaveProject} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c0d4]">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Enterprise Escrow & Inventory Engine"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c0d4]">Student Author Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Michael Adebayo"
                  value={newProject.studentName}
                  onChange={(e) => setNewProject({ ...newProject, studentName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c0d4]">Student Reference / Matric (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. OS-2025-089"
                  value={newProject.studentIdOrRef}
                  onChange={(e) => setNewProject({ ...newProject, studentIdOrRef: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c0d4]">Supervising Faculty Mentor *</label>
                <select
                  required
                  value={newProject.tutorId}
                  onChange={(e) => {
                    const tut = tutors.find(t => t.id === e.target.value);
                    setNewProject({ 
                      ...newProject, 
                      tutorId: e.target.value,
                      program: tut?.programs[0] || newProject.program
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Supervising Tutor</option>
                  {tutors.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c0d4]">Academic Program / Track</label>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack Web Development"
                  value={newProject.program}
                  onChange={(e) => setNewProject({ ...newProject, program: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c0d4]">Supervision Date</label>
                <input
                  type="date"
                  value={newProject.supervisionDate}
                  onChange={(e) => setNewProject({ ...newProject, supervisionDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c0d4]">Live Deployment URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://client-staging.orbitspace.academy"
                  value={newProject.projectUrl}
                  onChange={(e) => setNewProject({ ...newProject, projectUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c0d4]">Source Code Repository (Optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/orbitspace-capstone/..."
                  value={newProject.repoUrl}
                  onChange={(e) => setNewProject({ ...newProject, repoUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-[#c4c0d4]">Linked Certificate ID (e.g. ORB-8F29K2)</label>
                <input
                  type="text"
                  placeholder="ORB-8F29K2"
                  value={newProject.linkedCertificateId}
                  onChange={(e) => setNewProject({ ...newProject, linkedCertificateId: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
                <span className="text-[10px] text-[#8e8a9f]">If linked, employers verifying this certificate will see this audited project directly.</span>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-[#c4c0d4]">Project Overview & Technical Summary</label>
                <textarea
                  rows={3}
                  placeholder="Brief explanation of technical problem solved, architecture used, tools, and results..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262038]">
              <button
                type="button"
                onClick={() => setActiveSubTab('projects')}
                className="px-4 py-2.5 rounded-xl bg-[#1c172a] hover:bg-[#28223c] text-xs font-semibold text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-950/40 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Publish Audited Project</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 4: FORM TO LOG TEACHING HOURS */}
      {activeSubTab === 'log-hour' && (
        <div className="bg-[#141120] rounded-3xl p-6 sm:p-8 border border-[#2e2842] shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Log Verified Faculty Teaching Session</h3>
            <p className="text-xs text-[#9d98af]">Recorded hours are credited towards the instructor's verified teaching hours on their public URL.</p>
          </div>

          <form onSubmit={handleSaveHour} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c0d4]">Faculty Instructor *</label>
                <select
                  required
                  value={newHour.tutorId}
                  onChange={(e) => {
                    const tut = tutors.find(t => t.id === e.target.value);
                    setNewHour({
                      ...newHour,
                      tutorId: e.target.value,
                      program: tut?.programs[0] || newHour.program
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Instructor</option>
                  {tutors.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c0d4]">Program / Course Track *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Front End Development"
                  value={newHour.program}
                  onChange={(e) => setNewHour({ ...newHour, program: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c0d4]">Session Date</label>
                <input
                  type="date"
                  required
                  value={newHour.date}
                  onChange={(e) => setNewHour({ ...newHour, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c0d4]">Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  required
                  value={newHour.durationHours}
                  onChange={(e) => setNewHour({ ...newHour, durationHours: parseFloat(e.target.value) || 2 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c0d4]">Students in Attendance</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={newHour.studentsCount}
                  onChange={(e) => setNewHour({ ...newHour, studentsCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-[#c4c0d4]">Specific Curriculum Topic Covered *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern React Architecture, Context Providers & Custom Hooks"
                  value={newHour.topicCovered}
                  onChange={(e) => setNewHour({ ...newHour, topicCovered: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1629] border border-[#342d4a] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262038]">
              <button
                type="button"
                onClick={() => setActiveSubTab('hours')}
                className="px-4 py-2.5 rounded-xl bg-[#1c172a] hover:bg-[#28223c] text-xs font-semibold text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-950/40 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Submit & Verify Session</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
