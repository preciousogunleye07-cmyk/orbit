import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  FolderGit2, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Lock, 
  Key, 
  Layers, 
  AlertCircle,
  FileCheck,
  Building
} from 'lucide-react';
import { TutorProfile, TutorService, ComputedTutorStats } from '../../services/tutorService';
import { TutorAuthService } from '../../services/tutorAuthService';
import { TIMETABLE_DATA } from '../../data/timetableData';
import { VerificationDataService, SupervisedProjectRecord } from '../../services/verificationDataService';
import { OrbitLogo } from '../../components/OrbitLogo';
import { playSound } from '../../utils/soundEffects';

interface TeacherDashboardPageProps {
  initialTutor: TutorProfile;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateToCertificate?: (certId: string) => void;
  onNavigateToProject?: (projectSlug: string) => void;
}

export const TeacherDashboardPage: React.FC<TeacherDashboardPageProps> = ({
  initialTutor,
  onLogout,
  onNavigateHome,
  onNavigateToCertificate,
  onNavigateToProject
}) => {
  const [tutor, setTutor] = useState<TutorProfile>(initialTutor);
  const [computedStats, setComputedStats] = useState<ComputedTutorStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'hours' | 'students' | 'projects' | 'certifications' | 'account'>('courses');

  // Password update state
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  const loadData = async () => {
    try {
      setLoadingStats(true);
      const fresh = TutorService.getTutorById(tutor.id) || tutor;
      setTutor(fresh);

      const stats = await TutorService.getComputedTutorStats(fresh.id);
      setComputedStats(stats);
    } catch (err) {
      console.error('Error loading teacher data:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    document.title = `${tutor.name} | Faculty Dashboard – Orbit Space`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadData();

    const unsub = TutorService.subscribeTutors(() => loadData());
    return () => unsub();
  }, [tutor.id]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!newPassword.trim() || newPassword.trim().length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      playSound('error');
      return;
    }

    setIsUpdatingPass(true);
    try {
      await TutorService.resetTutorPassword(tutor.id, newPassword.trim());
      playSound('success');
      setPasswordMsg({ type: 'success', text: 'Password successfully updated! Use your new password on next login.' });
      setNewPassword('');
    } catch (err: any) {
      playSound('error');
      setPasswordMsg({ type: 'error', text: err?.message || 'Failed to update password.' });
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleSignOut = () => {
    playSound('pop');
    TutorAuthService.logoutTeacher();
    onLogout();
  };

  // Timetable slots assigned to this teacher
  const tutorNameLower = tutor.name.toLowerCase();
  const tutorShortLower = tutor.shortName.toLowerCase();
  const allTargetIds = new Set<string>([
    tutor.id.toLowerCase(),
    ...(tutor.aliasIds || []).map(a => a.toLowerCase())
  ]);

  const relevantSlots = TIMETABLE_DATA.filter(slot => {
    if (slot.mentorId && allTargetIds.has(slot.mentorId.toLowerCase())) return true;
    const inst = (slot.instructor || '').toLowerCase();
    const course = (slot.course || '').toLowerCase();
    return inst.includes(tutorShortLower) || 
      inst.includes(tutorNameLower) ||
      (tutor.programs || []).some(p => course.includes(p.toLowerCase()));
  });

  const totalTeachingHours = computedStats?.totalTeachingHours ?? 0;
  const totalStudentsTaught = computedStats?.totalStudentsTaught ?? 0;
  const totalProjectsSupervised = computedStats?.totalProjectsSupervised ?? 0;
  const totalStudentsCertified = computedStats?.totalStudentsCertified ?? 0;

  return (
    <div className="min-h-screen bg-[#0d0b14] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#231e33]">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 group cursor-pointer text-left"
              title="Orbit Space Home"
            >
              <OrbitLogo size={28} color="#a855f7" className="group-hover:scale-105 transition-transform" />
              <div>
                <span className="text-sm font-bold text-white tracking-tight font-sans">
                  oRbit<span className="text-[#a855f7] font-light">.space</span>
                </span>
                <span className="text-[10px] text-purple-300 font-mono block">
                  Faculty Portal
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/tutor/${tutor.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#1b172a] hover:bg-[#251f38] border border-[#342d4a] text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleSignOut}
              className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/50 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Profile Card Banner */}
        <div className="bg-[#141120] border border-[#2e2842] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-purple-600/20 border-2 border-purple-500/40 flex items-center justify-center text-3xl font-black text-white shadow-xl overflow-hidden">
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
                  tutor.avatar || tutor.shortName.charAt(0)
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-md">
                <CheckCircle2 className="w-4 h-4 fill-white text-emerald-600" />
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {tutor.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-[11px] font-mono text-purple-300">
                  ID: {tutor.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-[11px] font-mono text-emerald-300">
                  {tutor.status === 'active' ? 'Active Faculty' : 'Inactive Faculty'}
                </span>
              </div>

              <p className="text-sm font-medium text-purple-300">
                {tutor.role}
              </p>

              <p className="text-xs text-[#a49faf] max-w-2xl leading-relaxed">
                {tutor.specialization}
              </p>

              {/* Assigned Course Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] font-mono text-[#8e8a9f] uppercase self-center">Assigned Courses:</span>
                {(tutor.programs || []).map((prog, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-[#1f1a30] border border-[#3b3353] text-[11px] font-medium text-[#d8d3e8]"
                  >
                    {prog}
                  </span>
                ))}
                {(!tutor.programs || tutor.programs.length === 0) && (
                  <span className="text-xs text-amber-400 font-mono">No courses assigned yet.</span>
                )}
              </div>
            </div>
          </div>

          {/* Admin Managed Notification Callout */}
          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs flex items-center justify-between gap-3 text-purple-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                <strong>Academic System Notice:</strong> Faculty profile details, course assignments, and statistics are administered centrally. All numbers are dynamically derived from actual records.
              </span>
            </div>
            <span className="text-[10px] font-mono text-purple-400 shrink-0 hidden sm:inline">
              Verified Source of Truth
            </span>
          </div>

          {/* 3 Dynamic Metric Counters (Strictly No Dummy Data) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            
            {/* Students Taught */}
            <div 
              onClick={() => setActiveTab('students')}
              className="bg-[#1a162a] hover:bg-[#201c34] rounded-2xl p-4 border border-[#342d4a] transition cursor-pointer"
            >
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9d98af]">Students Taught</span>
              </div>
              <div className="text-2xl font-black text-white">
                {loadingStats ? '...' : totalStudentsTaught}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono pt-1">
                Active course enrolments
              </div>
            </div>

            {/* Supervised Projects */}
            <div 
              onClick={() => setActiveTab('projects')}
              className="bg-[#1a162a] hover:bg-[#201c34] rounded-2xl p-4 border border-[#342d4a] transition cursor-pointer"
            >
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <FolderGit2 className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9d98af]">Projects Supervised</span>
              </div>
              <div className="text-2xl font-black text-white">
                {loadingStats ? '...' : totalProjectsSupervised}
              </div>
              <div className="text-[10px] text-amber-400 font-mono pt-1">
                Verified student capstones
              </div>
            </div>

            {/* Certifications */}
            <div 
              onClick={() => setActiveTab('certifications')}
              className="bg-[#1a162a] hover:bg-[#201c34] rounded-2xl p-4 border border-[#342d4a] transition cursor-pointer"
            >
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9d98af]">Certified Alumni</span>
              </div>
              <div className="text-2xl font-black text-white">
                {loadingStats ? '...' : totalStudentsCertified}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono pt-1">
                Verified student graduates
              </div>
            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#231e33]">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'courses'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1a1628]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Assigned Courses & Timetable ({(tutor.programs || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hours')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'hours'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1a1628]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Attendance & Teaching Hours ({totalTeachingHours}h)</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1a1628]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students Taught ({totalStudentsTaught})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1a1628]'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Supervised Projects ({totalProjectsSupervised})</span>
          </button>

          <button
            onClick={() => setActiveTab('certifications')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'certifications'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1a1628]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Student Certifications ({totalStudentsCertified})</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'account'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1a1628]'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Tab 1: Assigned Courses & Timetable */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="bg-[#141120] border border-[#2e2842] rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span>My Assigned Academy Programs</span>
              </h3>
              <p className="text-xs text-[#a49faf]">
                Programs assigned by administration. Teachers can teach multiple tracks across Orbit Space Academy.
              </p>

              {(tutor.programs || []).length === 0 ? (
                <div className="p-8 text-center bg-[#181427] rounded-2xl border border-[#2e2842] space-y-2">
                  <BookOpen className="w-10 h-10 text-purple-400/50 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No courses currently assigned</h4>
                  <p className="text-xs text-[#8e8a9f]">Please contact an administrator to be assigned to your academy courses.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(tutor.programs || []).map((prog, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#1b172a] border border-[#302845] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/70 border border-purple-800/40 text-purple-300">
                          Course #{idx + 1}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Track</span>
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{prog}</h4>
                      <p className="text-xs text-[#a49faf]">
                        Orbit Space Academy Core Practical Track
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Timetable */}
            <div className="bg-[#141120] border border-[#2e2842] rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <span>My Weekly Timetable & Classes</span>
              </h3>

              {relevantSlots.length === 0 ? (
                <div className="p-8 text-center bg-[#181427] rounded-2xl border border-[#2e2842] space-y-2">
                  <Calendar className="w-10 h-10 text-purple-400/50 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No timetable sessions scheduled</h4>
                  <p className="text-xs text-[#8e8a9f]">No weekly classes are currently assigned to your timetable.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#2d2740] bg-[#181427] text-[#9d98af] font-mono uppercase tracking-wider text-[10px]">
                        <th className="p-3.5">Day</th>
                        <th className="p-3.5">Course Track</th>
                        <th className="p-3.5">Scheduled Time</th>
                        <th className="p-3.5">Lab / Venue</th>
                        <th className="p-3.5">Cohort</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#231e33]">
                      {relevantSlots.map((slot, idx) => (
                        <tr key={idx} className="hover:bg-[#1a162b] transition-colors">
                          <td className="p-3.5 font-bold text-purple-300">{slot.day}</td>
                          <td className="p-3.5 font-semibold text-white">{slot.course}</td>
                          <td className="p-3.5 font-mono text-[#c4c0d4]">{slot.time}</td>
                          <td className="p-3.5 font-mono text-emerald-400">{slot.venue}</td>
                          <td className="p-3.5 text-[#9d98af]">{slot.badge || 'Active'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Attendance & Teaching Hours */}
        {activeTab === 'hours' && (
          <div className="bg-[#141120] border border-[#2e2842] rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span>Actual Recorded Teaching Hours</span>
                </h3>
                <p className="text-xs text-[#a49faf]">
                  Teaching hours are calculated strictly from live class attendance records.
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 font-mono text-xs font-bold">
                Total Teaching Hours: {totalTeachingHours} hrs
              </div>
            </div>

            {(!computedStats?.teachingHistory || computedStats.teachingHistory.length === 0) ? (
              <div className="p-10 text-center bg-[#181427] rounded-2xl border border-[#2e2842] space-y-2">
                <Clock className="w-10 h-10 text-purple-400/50 mx-auto" />
                <h4 className="text-sm font-bold text-white">No teaching hours recorded</h4>
                <p className="text-xs text-[#8e8a9f]">
                  No attendance records have been registered for your sessions yet. As classes are conducted and attendance is recorded, your verified hours will accumulate here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#2d2740] bg-[#181427] text-[#9d98af] font-mono uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Session Date</th>
                      <th className="p-3.5">Course Track & Topic</th>
                      <th className="p-3.5">Times</th>
                      <th className="p-3.5">Duration</th>
                      <th className="p-3.5">Students Present</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#231e33]">
                    {computedStats.teachingHistory.map((s) => (
                      <tr key={s.sessionId} className="hover:bg-[#1a162b] transition">
                        <td className="p-3.5 font-mono text-purple-300">{s.date}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{s.topic}</div>
                          <div className="text-[11px] text-purple-400 font-mono">{s.course} • {s.cohort}</div>
                        </td>
                        <td className="p-3.5 font-mono text-[#c4c0d4]">{s.checkInTime || '—'} → {s.checkOutTime || '—'}</td>
                        <td className="p-3.5 font-mono font-bold text-white">{s.durationHours} hrs</td>
                        <td className="p-3.5 font-mono text-[#c4c0d4]">{s.studentsPresentCount} / {s.totalStudentsCount}</td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Recorded</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Students Taught */}
        {activeTab === 'students' && (
          <div className="bg-[#141120] border border-[#2e2842] rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span>Students Taught</span>
                </h3>
                <p className="text-xs text-[#a49faf]">
                  Calculated dynamically from current student enrolments across your assigned courses.
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono text-xs font-bold">
                Active Enrolments: {totalStudentsTaught}
              </div>
            </div>

            {(!computedStats?.studentsTaughtList || computedStats.studentsTaughtList.length === 0) ? (
              <div className="p-10 text-center bg-[#181427] rounded-2xl border border-[#2e2842] space-y-2">
                <Users className="w-10 h-10 text-purple-400/50 mx-auto" />
                <h4 className="text-sm font-bold text-white">No students currently assigned</h4>
                <p className="text-xs text-[#8e8a9f]">
                  Students will appear here when enrolled in courses assigned to your teacher profile.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {computedStats.studentsTaughtList.map((stu, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#1b172a] border border-[#2f2742] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{stu.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                        Enrolled
                      </span>
                    </div>
                    <p className="text-xs text-purple-300 font-medium">{stu.course}</p>
                    {stu.matricNumber && (
                      <p className="text-[10px] font-mono text-[#8e8a9f]">ID: {stu.matricNumber}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Supervised Projects */}
        {activeTab === 'projects' && (
          <div className="bg-[#141120] border border-[#2e2842] rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-amber-400" />
                  <span>Student Projects Supervised</span>
                </h3>
                <p className="text-xs text-[#a49faf]">
                  Real capstone deliverables and live projects supervised under your instruction.
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 font-mono text-xs font-bold">
                Supervised Projects: {totalProjectsSupervised}
              </div>
            </div>

            {(!computedStats?.supervisedProjectsList || computedStats.supervisedProjectsList.length === 0) ? (
              <div className="p-10 text-center bg-[#181427] rounded-2xl border border-[#2e2842] space-y-2">
                <FolderGit2 className="w-10 h-10 text-amber-400/50 mx-auto" />
                <h4 className="text-sm font-bold text-white">No projects supervised</h4>
                <p className="text-xs text-[#8e8a9f]">
                  No student capstone projects currently list you as the supervisor in the system.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {computedStats.supervisedProjectsList.map((proj) => (
                  <div key={proj.id} className="p-5 rounded-2xl bg-[#1b172a] border border-[#2f2742] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-purple-300 bg-purple-950/60 px-2.5 py-0.5 rounded-md">
                        {proj.program}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Capstone</span>
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{proj.title}</h4>
                    <p className="text-xs text-[#c4c0d4]">Student: <strong className="text-white">{proj.studentName}</strong></p>
                    <p className="text-xs text-[#8e8a9f] leading-relaxed line-clamp-2">{proj.description}</p>

                    <div className="flex items-center gap-3 pt-2 border-t border-[#251f38]">
                      {proj.demoUrl && (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-purple-300 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Live Demo</span>
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#c4c0d4] hover:underline flex items-center gap-1"
                        >
                          <span>Repository</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Student Certifications */}
        {activeTab === 'certifications' && (
          <div className="bg-[#141120] border border-[#2e2842] rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span>Associated Student Certifications</span>
                </h3>
                <p className="text-xs text-[#a49faf]">
                  Certificates earned by students who completed programs under your instruction.
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-mono text-xs font-bold">
                Graduates Certified: {totalStudentsCertified}
              </div>
            </div>

            {(!computedStats?.certifiedStudentsList || computedStats.certifiedStudentsList.length === 0) ? (
              <div className="p-10 text-center bg-[#181427] rounded-2xl border border-[#2e2842] space-y-2">
                <Award className="w-10 h-10 text-emerald-400/50 mx-auto" />
                <h4 className="text-sm font-bold text-white">No student certifications available</h4>
                <p className="text-xs text-[#8e8a9f]">
                  Student certificates will appear here once students taught in your courses graduate and receive official certificates.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#2d2740] bg-[#181427] text-[#9d98af] font-mono uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Program Track</th>
                      <th className="p-3.5">Certificate ID</th>
                      <th className="p-3.5">Date Issued</th>
                      <th className="p-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#231e33]">
                    {computedStats.certifiedStudentsList.map((cert) => (
                      <tr key={cert.certificateId} className="hover:bg-[#1a162b] transition">
                        <td className="p-3.5 font-bold text-white">{cert.studentName}</td>
                        <td className="p-3.5 text-purple-300">{cert.program}</td>
                        <td className="p-3.5 font-mono text-emerald-400">{cert.certificateNumber || cert.certificateId}</td>
                        <td className="p-3.5 font-mono text-[#c4c0d4]">{cert.dateIssued}</td>
                        <td className="p-3.5">
                          {onNavigateToCertificate && (
                            <button
                              type="button"
                              onClick={() => onNavigateToCertificate(cert.certificateId)}
                              className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-800/60 text-purple-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Certificate</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Security & Password */}
        {activeTab === 'account' && (
          <div className="max-w-xl bg-[#141120] border border-[#2e2842] rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                <span>Account Credentials & Security</span>
              </h3>
              <p className="text-xs text-[#a49faf]">
                Manage your teacher login password and view account identifiers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181427] border border-[#2c263f] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8e8a9f]">Login Username:</span>
                <span className="font-mono text-white font-semibold">{tutor.account?.username || tutor.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8e8a9f]">Account Status:</span>
                <span className="font-mono text-emerald-400 font-semibold">{tutor.status === 'active' ? 'Active' : 'Deactivated'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8e8a9f]">Last Login:</span>
                <span className="font-mono text-purple-300">
                  {tutor.account?.lastLoginAt ? new Date(tutor.account.lastLoginAt).toLocaleString() : 'This session'}
                </span>
              </div>
            </div>

            {passwordMsg && (
              <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                passwordMsg.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#c4c0d4]">
                  Update Your Teacher Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password (min. 6 characters)..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1b172a] border border-[#342d4a] text-sm text-white placeholder-[#78728a] focus:outline-none focus:border-purple-500 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPass}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 cursor-pointer transition"
              >
                {isUpdatingPass ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Change My Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
