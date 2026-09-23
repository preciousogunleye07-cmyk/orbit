import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Award, 
  BookOpen, 
  ExternalLink, 
  Copy, 
  Edit3, 
  History, 
  PlusCircle, 
  FolderGit2, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  FileText, 
  Check, 
  ShieldCheck,
  Building,
  Sparkles,
  Sliders,
  FileCheck,
  Trash2
} from 'lucide-react';
import { TutorProfile, TutorService, ComputedTutorStats } from '../../services/tutorService';
import { VerificationDataService, SupervisedProjectRecord } from '../../services/verificationDataService';
import { TIMETABLE_DATA } from '../../data/timetableData';
import { getCertificates } from '../../services/certificateService';
import { EditTutorModal } from './EditTutorModal';
import { playSound } from '../../utils/soundEffects';

interface AdminMentorProfileViewProps {
  tutor: TutorProfile;
  onBack: () => void;
  onOpenPublicTutor: (slug: string) => void;
  onTutorUpdated: (updated: TutorProfile) => void;
  onTutorDeleted?: () => void;
}

export const AdminMentorProfileView: React.FC<AdminMentorProfileViewProps> = ({
  tutor,
  onBack,
  onOpenPublicTutor,
  onTutorUpdated,
  onTutorDeleted
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'supervision'>('overview');
  const [stats, setStats] = useState<ComputedTutorStats | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentTutor, setCurrentTutor] = useState<TutorProfile>(tutor);

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteMentor = async () => {
    setIsDeleting(true);
    try {
      await TutorService.deleteTutorPermanently(currentTutor.id);
      playSound('trash');
      setIsDeleteModalOpen(false);
      if (onTutorDeleted) {
        onTutorDeleted();
      } else {
        onBack();
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Could not delete mentor'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Load computed stats and records
  const loadData = async () => {
    try {
      const freshTutor = TutorService.getTutorById(currentTutor.id) || currentTutor;
      setCurrentTutor(freshTutor);
      const computed = await TutorService.getComputedTutorStats(freshTutor.id);
      setStats(computed);
    } catch (e) {
      console.error('Error loading mentor details:', e);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = TutorService.subscribeTutors(() => loadData());
    return () => unsub();
  }, [currentTutor.id]);

  const handleCopyPublicLink = () => {
    playSound('sparkle');
    const origin = window.location.origin || '';
    const cleanUrl = `${origin}/tutor/${currentTutor.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cleanUrl);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  // Extract timetable batches for this mentor
  const mentorNameLower = currentTutor.name.toLowerCase();
  const mentorShortLower = currentTutor.shortName.toLowerCase();
  const allTargetIds = new Set<string>([
    currentTutor.id.toLowerCase(),
    ...(currentTutor.aliasIds || []).map(a => a.toLowerCase())
  ]);

  const relevantSlots = TIMETABLE_DATA.filter(slot => {
    if (slot.mentorId && allTargetIds.has(slot.mentorId.toLowerCase())) return true;
    const inst = (slot.instructor || '').toLowerCase();
    const course = (slot.course || '').toLowerCase();
    return inst.includes(mentorShortLower) || 
      inst.includes(mentorNameLower) ||
      (currentTutor.programs || []).some(p => course.includes(p.toLowerCase()));
  });

  // Calculate length of service
  const calculateLengthOfService = (startDateStr?: string) => {
    if (!startDateStr) return 'Active Academic Service';
    const start = new Date(startDateStr);
    const now = new Date();
    if (isNaN(start.getTime())) return 'Active Academic Service';
    const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
    if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} yr${years !== 1 ? 's' : ''}, ${months} mo${months !== 1 ? 's' : ''}`;
  };

  const totalTeachingHours = stats?.totalTeachingHours ?? 0;
  const historicalHours = stats?.historicalTeachingHours ?? 0;
  const attendanceHours = stats?.newAttendanceHours ?? 0;
  const adjustmentHours = stats?.adjustmentHours ?? 0;
  const totalStudents = stats?.totalStudentsTaught ?? 0;
  const totalCertified = stats?.totalStudentsCertified ?? 0;
  const totalProjects = stats?.totalProjectsSupervised ?? 0;

  const coursesList = currentTutor.programs && currentTutor.programs.length > 0 
    ? currentTutor.programs 
    : ['General Technology Mentorship'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141120] p-4 rounded-2xl border border-[#2e2842]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#c4c0d4] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400" />
          <span>Back to All Faculty Mentors</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyPublicLink}
            className="px-3 py-1.5 rounded-xl bg-[#1b172a] hover:bg-[#25203a] border border-[#342d4a] text-xs font-medium text-white flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy public LinkedIn verification link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-purple-400" />
                <span>Copy Public Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onOpenPublicTutor(currentTutor.slug)}
            className="px-3 py-1.5 rounded-xl bg-[#1b172a] hover:bg-[#25203a] border border-[#342d4a] text-xs font-medium text-purple-300 hover:text-purple-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-purple-950/40 cursor-pointer transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition-all cursor-pointer"
            title="Permanently remove mentor from directory"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Mentor Header Card */}
      <div className="bg-[#141120] rounded-3xl p-6 sm:p-8 border border-[#2e2842] shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          
          {/* Avatar with Status indicator */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-900/60 to-[#1e1932] border-2 border-purple-500/40 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-purple-950/50 overflow-hidden">
              {currentTutor.photoUrl ? (
                <img
                  src={currentTutor.photoUrl}
                  alt={currentTutor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                currentTutor.avatar || currentTutor.shortName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-md" title="Academic Status Verified">
              <CheckCircle2 className="w-4 h-4 fill-white text-emerald-600" />
            </div>
          </div>

          {/* Profile Headline */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {currentTutor.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-[10px] font-mono text-purple-300">
                ({currentTutor.shortName})
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                currentTutor.status === 'deactivated'
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
              }`}>
                {currentTutor.status === 'deactivated' ? 'ARCHIVED' : 'ACTIVE FACULTY'}
              </span>
            </div>

            <p className="text-sm font-semibold text-purple-300">
              {currentTutor.role}
            </p>

            <p className="text-xs text-[#a49faf] leading-relaxed max-w-2xl">
              {currentTutor.specialization}
            </p>

            {/* Courses / Programs Taught Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase text-[#8e8a9f] font-semibold">Assigned Tracks:</span>
              {coursesList.map((prog, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-purple-950/50 border border-purple-800/40 text-[11px] font-medium text-purple-200"
                >
                  {prog}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Courses Taught */}
        <div className="bg-[#141120] rounded-2xl p-5 border border-[#2e2842] shadow-md space-y-2">
          <div className="flex items-center justify-between text-[#9d98af]">
            <span className="text-xs font-mono uppercase tracking-wider">Courses Taught</span>
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {coursesList.length} <span className="text-xs font-normal text-[#9d98af]">Track{coursesList.length !== 1 ? 's' : ''}</span>
          </div>
          <p className="text-[10px] text-[#8e8a9f] font-mono">
            Unified under single mentor record
          </p>
        </div>

        {/* Active Batches / Cohorts */}
        <div className="bg-[#141120] rounded-2xl p-5 border border-[#2e2842] shadow-md space-y-2">
          <div className="flex items-center justify-between text-[#9d98af]">
            <span className="text-xs font-mono uppercase tracking-wider">Active Batches</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {relevantSlots.length > 0 ? relevantSlots.length : coursesList.length} <span className="text-xs font-normal text-[#9d98af]">Sessions</span>
          </div>
          <p className="text-[10px] text-[#8e8a9f] font-mono">
            Weekly timetable schedule slots
          </p>
        </div>

        {/* Supervised Capstones */}
        <div className="bg-[#141120] rounded-2xl p-5 border border-[#2e2842] shadow-md space-y-2">
          <div className="flex items-center justify-between text-[#9d98af]">
            <span className="text-xs font-mono uppercase tracking-wider">Supervised Capstones</span>
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {totalProjects} <span className="text-xs font-normal text-[#9d98af]">Projects</span>
          </div>
          <p className="text-[10px] text-purple-300 font-mono">
            {totalArticles} Published research papers
          </p>
        </div>

        {/* Total Students Mentored */}
        <div className="bg-[#141120] rounded-2xl p-5 border border-[#2e2842] shadow-md space-y-2">
          <div className="flex items-center justify-between text-[#9d98af]">
            <span className="text-xs font-mono uppercase tracking-wider">Students Mentored</span>
            <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {totalStudents} <span className="text-xs font-normal text-[#9d98af]">Enrolled</span>
          </div>
          <p className="text-[10px] text-[#8e8a9f] font-mono">
            {totalCertified} Verified Graduates
          </p>
        </div>

      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#2e2842] pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-[#c4c0d4] hover:text-white hover:bg-[#1b172a]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>1. Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'courses'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-[#c4c0d4] hover:text-white hover:bg-[#1b172a]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>2. Courses & Batches</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-950 border border-purple-800/60 text-purple-300">
            {coursesList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('supervision')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'supervision'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-[#c4c0d4] hover:text-white hover:bg-[#1b172a]'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>3. Supervised Projects & Certifications</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950 border border-amber-800/60 text-amber-300">
            {totalProjects}
          </span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Bio & Background */}
            <div className="bg-[#141120] rounded-2xl p-6 border border-[#2e2842] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Biography & Professional Background</span>
              </h3>
              <p className="text-xs text-[#c4c0d4] leading-relaxed whitespace-pre-line">
                {currentTutor.bio || 'Experienced technology mentor dedicated to practical, hands-on digital skills empowerment at Orbit Space Academy.'}
              </p>

              <div className="pt-3 border-t border-[#231e33] space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#8e8a9f] font-semibold block">Academic Tenure:</span>
                <div className="flex flex-wrap gap-4 text-xs font-mono text-white">
                  <div>
                    <span className="text-[#8e8a9f] block text-[10px]">Date Joined:</span>
                    <span>{currentTutor.joinedDate ? new Date(currentTutor.joinedDate).toLocaleDateString() : 'Active Service'}</span>
                  </div>
                  <div>
                    <span className="text-[#8e8a9f] block text-[10px]">Length of Service:</span>
                    <span className="text-purple-300 font-bold">{calculateLengthOfService(currentTutor.joinedDate)}</span>
                  </div>
                  <div>
                    <span className="text-[#8e8a9f] block text-[10px]">Institution:</span>
                    <span className="text-emerald-400">Orbit Space Academy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Professional Channels */}
            <div className="bg-[#141120] rounded-2xl p-6 border border-[#2e2842] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Contact Info & Professional Links</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1b172a] border border-[#2c263f]">
                  <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#8e8a9f] uppercase block font-mono">Email Address</span>
                    <span className="text-white font-medium">{currentTutor.email || 'mentor@orbitspace.academy'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1b172a] border border-[#2c263f]">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#8e8a9f] uppercase block font-mono">Phone Number</span>
                    <span className="text-white font-medium">{currentTutor.phone || 'Available via Academy Office'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1b172a] border border-[#2c263f]">
                  <Linkedin className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="flex-1 truncate">
                    <span className="text-[10px] text-[#8e8a9f] uppercase block font-mono">LinkedIn Profile</span>
                    {currentTutor.linkedinUrl ? (
                      <a 
                        href={currentTutor.linkedinUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-purple-300 hover:underline truncate block"
                      >
                        {currentTutor.linkedinUrl}
                      </a>
                    ) : (
                      <span className="text-[#8e8a9f]">Not provided</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1b172a] border border-[#2c263f]">
                  <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="flex-1 truncate">
                    <span className="text-[10px] text-[#8e8a9f] uppercase block font-mono">Portfolio / Website</span>
                    {currentTutor.portfolioUrl ? (
                      <a 
                        href={currentTutor.portfolioUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-cyan-300 hover:underline truncate block"
                      >
                        {currentTutor.portfolioUrl}
                      </a>
                    ) : (
                      <span className="text-[#8e8a9f]">Not provided</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Courses & Batches */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="bg-[#141120] rounded-2xl p-6 border border-[#2e2842] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Assigned Courses & Programs</span>
                </h3>
                <p className="text-xs text-[#9d98af]">
                  This mentor is assigned to teach multiple courses without duplicate profile creation.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs font-mono">
                {coursesList.length} Tracks
              </span>
            </div>

            {coursesList.length === 0 ? (
              <div className="p-8 text-center bg-[#181427] rounded-xl border border-[#2e2842] space-y-1">
                <BookOpen className="w-8 h-8 text-purple-400/40 mx-auto" />
                <h4 className="text-xs font-bold text-white">No courses currently assigned</h4>
                <p className="text-[11px] text-[#8e8a9f]">
                  Click "Edit Profile" above to assign one or multiple courses to this teacher.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {coursesList.map((course, idx) => {
                  // Find matching timetable slots for this course
                  const courseSlots = relevantSlots.filter(s => 
                    (s.course || '').toLowerCase().includes(course.toLowerCase()) ||
                    course.toLowerCase().includes((s.course || '').toLowerCase())
                  );

                  return (
                    <div 
                      key={idx}
                      className="p-5 rounded-2xl bg-[#1b172a] border border-[#302845] hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-900/40 text-purple-300">
                            Track #{idx + 1}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white">{course}</h4>
                        <p className="text-xs text-[#9d98af]">
                          Orbit Space Academy Core Tech Curriculum
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#28223a] space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[#a49faf]">
                          <span>Timetable Sessions:</span>
                          <strong className="text-white">{courseSlots.length} Weekly</strong>
                        </div>
                        {courseSlots.length > 0 && (
                          <div className="space-y-1 pt-1">
                            {courseSlots.slice(0, 2).map((slot, sIdx) => (
                              <div key={sIdx} className="text-[11px] font-mono text-purple-300 bg-[#120f1c] p-1.5 rounded-lg border border-[#272138] flex items-center justify-between">
                                <span>{slot.day}: {slot.time}</span>
                                <span className="text-[#8e8a9f]">{slot.venue}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timetable Schedule Grid */}
          <div className="bg-[#141120] rounded-2xl p-6 border border-[#2e2842] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Weekly Scheduled Class Times</span>
            </h3>

            {relevantSlots.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#28223a] text-[11px] font-mono text-[#8e8a9f] uppercase">
                      <th className="py-2.5 px-3">Day</th>
                      <th className="py-2.5 px-3">Course Track</th>
                      <th className="py-2.5 px-3">Scheduled Time</th>
                      <th className="py-2.5 px-3">Room / Lab</th>
                      <th className="py-2.5 px-3">Cohort</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#231e33]">
                    {relevantSlots.map((slot, idx) => (
                      <tr key={idx} className="hover:bg-[#1a1628] transition-colors">
                        <td className="py-3 px-3 font-semibold text-white">{slot.day}</td>
                        <td className="py-3 px-3 text-purple-300 font-medium">{slot.course}</td>
                        <td className="py-3 px-3 font-mono text-[#c4c0d4]">{slot.time}</td>
                        <td className="py-3 px-3 font-mono text-emerald-400">{slot.venue}</td>
                        <td className="py-3 px-3 text-[#9d98af]">{slot.badge || 'Active Cohort'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#181427] rounded-xl border border-[#2e2842] space-y-1">
                <Clock className="w-8 h-8 text-purple-400/40 mx-auto" />
                <h4 className="text-xs font-bold text-white">No timetable sessions scheduled</h4>
                <p className="text-[11px] text-[#8e8a9f]">
                  No weekly class sessions are currently registered for this teacher.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Supervised Projects & Certifications */}
      {activeTab === 'supervision' && (
        <div className="space-y-6">
          
          {/* Capstone Projects Supervised */}
          <div className="bg-[#141120] rounded-2xl p-6 border border-[#2e2842] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4" />
                  <span>Capstone Student Projects Supervised</span>
                </h3>
                <p className="text-xs text-[#9d98af]">
                  Real verified student capstone deliverables and live projects reviewed by this mentor.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs font-mono">
                {stats?.supervisedProjectsList.length || 0} Projects
              </span>
            </div>

            {stats?.supervisedProjectsList && stats.supervisedProjectsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.supervisedProjectsList.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-[#1b172a] border border-[#2f2742] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded">
                        {p.program}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Capstone</span>
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{p.title}</h4>
                    <p className="text-xs text-[#a49faf]">Student: <strong className="text-white">{p.studentName}</strong></p>
                    <p className="text-xs text-[#8e8a9f] line-clamp-2">{p.description}</p>
                    <div className="flex items-center gap-2 pt-2">
                      {p.demoUrl && (
                        <a 
                          href={p.demoUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[11px] font-medium text-purple-300 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Live Demo</span>
                        </a>
                      )}
                      {p.githubUrl && (
                        <a 
                          href={p.githubUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[11px] font-medium text-[#c4c0d4] hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          <span>Code Repository</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#181427] rounded-xl border border-[#2e2842] space-y-1">
                <FolderGit2 className="w-8 h-8 text-amber-400/40 mx-auto" />
                <h4 className="text-xs font-bold text-white">No projects supervised</h4>
                <p className="text-[11px] text-[#8e8a9f]">
                  No student capstone projects currently list this mentor as supervisor.
                </p>
              </div>
            )}
          </div>

          {/* Students Graduated & Certified Under Mentor */}
          <div className="bg-[#141120] rounded-2xl p-6 border border-[#2e2842] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Students Graduated & Certified Under Mentor</span>
                </h3>
                <p className="text-xs text-[#9d98af]">
                  Authenticated Orbit Space certificates supervised by {currentTutor.name}.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs font-mono">
                {stats?.certifiedStudentsList.length || 0} Graduates
              </span>
            </div>

            {stats?.certifiedStudentsList && stats.certifiedStudentsList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#28223a] text-[11px] font-mono text-[#8e8a9f] uppercase">
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Program / Course</th>
                      <th className="py-2.5 px-3">Cert #</th>
                      <th className="py-2.5 px-3">Date Issued</th>
                      <th className="py-2.5 px-3">Project Title</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#231e33]">
                    {stats.certifiedStudentsList.map((cert) => (
                      <tr key={cert.certificateId} className="hover:bg-[#1a1628] transition-colors">
                        <td className="py-3 px-3 font-semibold text-white">{cert.studentName}</td>
                        <td className="py-3 px-3 text-purple-300">{cert.program}</td>
                        <td className="py-3 px-3 font-mono text-[#8e8a9f]">{cert.certificateNumber}</td>
                        <td className="py-3 px-3 font-mono text-[#c4c0d4]">{cert.dateIssued}</td>
                        <td className="py-3 px-3 text-[#a49faf] max-w-xs truncate">{cert.projectTitle || 'Capstone Completion'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#181427] rounded-xl border border-[#2e2842] space-y-1">
                <Award className="w-8 h-8 text-emerald-400/40 mx-auto" />
                <h4 className="text-xs font-bold text-white">No student certifications available</h4>
                <p className="text-[11px] text-[#8e8a9f]">
                  No certificates have been issued to students taught by this mentor yet.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Embedded Modals */}
      {isEditOpen && (
        <EditTutorModal
          isOpen={isEditOpen}
          tutor={currentTutor}
          onClose={() => setIsEditOpen(false)}
          onTutorUpdated={(updated) => {
            setCurrentTutor(updated);
            onTutorUpdated(updated);
            loadData();
          }}
        />
      )}

      {isLedgerOpen && (
        <AdminTeachingHoursLedgerModal
          isOpen={isLedgerOpen}
          initialLecturerId={currentTutor.id}
          onClose={() => {
            setIsLedgerOpen(false);
            loadData();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141120] border border-[#2e2842] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-950/40 rounded-2xl border border-rose-900/50">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Permanently Remove Tutor</h3>
                <p className="text-xs text-[#9d98af]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#b8b3c7] leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-white font-semibold">{currentTutor.name}</strong> from the faculty directory?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#1c172a] hover:bg-[#28223c] text-xs font-semibold text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteMentor}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-950/40"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Tutor'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
