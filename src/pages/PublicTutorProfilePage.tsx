import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Clock, 
  Users, 
  ExternalLink, 
  Share2, 
  Copy, 
  ArrowLeft, 
  FolderGit2, 
  FileText, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  Briefcase,
  Check,
  GraduationCap,
  History,
  FileCheck,
  CalendarCheck,
  BadgeCheck,
  Building,
  Globe,
  Calendar
} from 'lucide-react';
import { TutorProfile, TutorService, ComputedTutorStats } from '../services/tutorService';
import { VerificationDataService, SupervisedProjectRecord, TeachingHourRecord } from '../services/verificationDataService';
import { getArticlesByTutorName, ArticleRecord } from '../services/articleService';
import { OrbitLogo } from '../components/OrbitLogo';
import { playSound } from '../utils/soundEffects';

interface PublicTutorProfilePageProps {
  tutorSlug: string;
  onNavigateHome: () => void;
  onNavigateToCertificate?: (certId: string) => void;
  onNavigateToProject?: (projectSlug: string) => void;
  onNavigateToArticle?: (slug: string) => void;
}

export const PublicTutorProfilePage: React.FC<PublicTutorProfilePageProps> = ({
  tutorSlug,
  onNavigateHome,
  onNavigateToCertificate,
  onNavigateToProject,
  onNavigateToArticle
}) => {
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [computedStats, setComputedStats] = useState<ComputedTutorStats | null>(null);
  const [projects, setProjects] = useState<SupervisedProjectRecord[]>([]);
  const [teachingSessions, setTeachingSessions] = useState<TeachingHourRecord[]>([]);
  const [supervisedArticles, setSupervisedArticles] = useState<ArticleRecord[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'hours' | 'certified' | 'articles' | 'bio'>('projects');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const loadProfileData = () => {
      const profile = TutorService.getTutorBySlug(tutorSlug);
      setTutor(profile || null);

      if (profile) {
        // SEO Metadata
        document.title = `${profile.name} | Verified Faculty Profile – Orbit Space`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', `${profile.name} (${profile.role}) at Orbit Space. Specialization: ${profile.specialization}. Verified instructional hours and capstone supervisory records.`);
        }

        // Inject Schema.org Person JSON-LD
        const scriptId = 'tutor-schema-jsonld';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.type = 'application/ld+json';
          document.head.appendChild(script);
        }
        script.text = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: profile.name,
          jobTitle: profile.role,
          worksFor: {
            '@type': 'EducationalOrganization',
            name: 'Orbit Space Academy',
            url: 'https://orbitspace.academy'
          },
          description: profile.bio || profile.specialization,
          image: profile.photoUrl || undefined,
          knowsAbout: profile.programs,
          sameAs: profile.linkedinUrl ? [profile.linkedinUrl] : undefined
        });

        // 1. Fetch system-calculated dynamic stats
        TutorService.getComputedTutorStats(profile.id)
          .then((stats) => {
            setComputedStats(stats);
          })
          .catch((err) => {
            console.error('Error fetching computed tutor stats:', err);
          });

        // 2. Fetch projects
        const projs = VerificationDataService.getProjectsForTutor(profile.id, true);
        setProjects(projs);

        // 3. Fetch teaching hours
        const sessions = VerificationDataService.getTeachingHoursForTutor(profile.id);
        setTeachingSessions(sessions);

        // 4. Fetch supervised articles
        const arts = getArticlesByTutorName(profile.name);
        setSupervisedArticles(arts);
      }
      setLoading(false);
    };

    loadProfileData();

    // Live subscription to tutor changes across tabs and modal updates
    const unsubscribe = TutorService.subscribeTutors(() => {
      loadProfileData();
    });

    const handleTutorEvent = () => loadProfileData();
    window.addEventListener('storage', handleTutorEvent);
    window.addEventListener('orbit-tutors-updated', handleTutorEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleTutorEvent);
      window.removeEventListener('orbit-tutors-updated', handleTutorEvent);
    };
  }, [tutorSlug]);

  const handleCopyLink = () => {
    playSound('sparkle');
    const origin = window.location.origin || '';
    const cleanUrl = `${origin}/tutor/${tutor?.slug || tutorSlug}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleanUrl);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0b14] flex items-center justify-center p-6 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#c4c7c8]">Authenticating Faculty Profile...</span>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-[#0d0b14] text-white flex flex-col justify-center items-center p-6 text-center">
        <div className="max-w-md w-full bg-[#181524] rounded-3xl p-8 border border-[#332d47] space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Faculty Record Not Found</h2>
          <p className="text-xs text-[#9d98af] leading-relaxed">
            No active tutor credential corresponds to slug <span className="font-mono text-purple-400">"{tutorSlug}"</span>. The instructor profile may be archived or updated.
          </p>
          <button
            onClick={onNavigateHome}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-xs tracking-wide transition-all"
          >
            Return to Orbit Space Academy
          </button>
        </div>
      </div>
    );
  }

  // System-derived dynamic stats (no fabricated dummy data)
  const totalVerifiedHours = computedStats?.totalTeachingHours ?? 0;
  const newAttendanceHours = computedStats?.newAttendanceHours ?? 0;
  const historicalTeachingHours = computedStats?.historicalTeachingHours ?? 0;
  const adjustmentHours = computedStats?.adjustmentHours ?? 0;
  const ledgerEntries = computedStats?.ledgerEntries || [];

  const totalStudentsTaught = computedStats?.totalStudentsTaught ?? 0;
  const newStudentsTaught = computedStats?.newStudentsTaught ?? 0;
  const historicalStudentsTaught = computedStats?.historicalStudentsTaught ?? 0;

  const totalStudentsCertified = computedStats?.totalStudentsCertified ?? 0;
  const newStudentsCertified = computedStats?.newStudentsCertified ?? 0;
  const historicalStudentsCertified = computedStats?.historicalStudentsCertified ?? 0;

  const totalProjectsSupervised = computedStats?.totalProjectsSupervised ?? projects.length;
  const newProjectsSupervised = computedStats?.newProjectsSupervised ?? projects.length;
  const historicalProjectsSupervised = computedStats?.historicalProjectsSupervised ?? 0;

  const articlesCount = computedStats?.articlesSupervisedCount ?? supervisedArticles.length;
  const teachingHistoryList = computedStats?.teachingHistory || [];
  const certifiedStudentsList = computedStats?.certifiedStudentsList || [];

  const isDeactivated = tutor.status === 'deactivated';
  const hasHistoricalBaseline = Boolean(computedStats?.hasHistoricalBaseline);
  const baselineDetails = computedStats?.historicalBaselineDetails;

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

  return (
    <div className="min-h-screen bg-[#0c0a13] text-[#e5e2e1] flex flex-col justify-between pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-purple-900/15 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute top-96 right-0 w-[400px] h-[400px] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex-1 space-y-8">

        {/* Top Navigation & Verification Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#282338]">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-xs font-semibold text-[#a855f7] hover:text-[#c084fc] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Orbit Space Academy</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium border ${
              isDeactivated 
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isDeactivated ? 'Archived Faculty Profile' : 'Official Verified Faculty Profile'}</span>
            </span>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-[#1a1627] hover:bg-[#251f38] border border-[#39314e] text-xs text-white font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy public link to share on LinkedIn or CV"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
              <span>{copiedLink ? 'Copied' : 'Share URL'}</span>
            </button>
          </div>
        </div>

        {/* Main Faculty Header Card */}
        <div className="bg-[#141120] rounded-3xl p-6 sm:p-8 border border-[#2d2740] shadow-2xl relative overflow-hidden space-y-6">
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            
            {/* Avatar Badge with Profile Picture */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-purple-900/60 to-indigo-950/80 border-2 border-purple-500/40 flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-xl shadow-purple-950/50 overflow-hidden relative">
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
                  tutor.avatar || tutor.shortName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-lg" title="Academic Status Verified">
                <CheckCircle2 className="w-5 h-5 fill-white text-emerald-600" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {tutor.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-900/40 border border-purple-700/50 text-[10px] font-mono text-purple-300">
                  ID: {tutor.id}
                </span>
                {hasHistoricalBaseline && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                    <History className="w-3 h-3" />
                    <span>Includes Audited Pre-Platform History</span>
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base font-medium text-purple-300">
                {tutor.role}
              </p>

              <p className="text-xs sm:text-sm text-[#a49faf] leading-relaxed max-w-2xl">
                {tutor.specialization}
              </p>

              {tutor.bio && (
                <p className="text-xs sm:text-sm text-[#cbd5e1] font-light leading-relaxed max-w-3xl pt-1">
                  {tutor.bio}
                </p>
              )}

              {/* Qualifications */}
              {tutor.qualifications && tutor.qualifications.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold">Qualifications:</span>
                  {tutor.qualifications.map((q, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/40 text-[10px] font-mono text-purple-200"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              )}

              {/* Programs Covered Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {tutor.programs.map((prog, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#1f1a30] border border-[#3b3353] text-[11px] font-medium text-[#d8d3e8]"
                  >
                    {prog}
                  </span>
                ))}
              </div>

              {/* Verified Lecturer Status, Academic Institution & Length of Service Bar */}
              <div className="pt-3 border-t border-[#251f38] flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-700/50 text-emerald-300 font-mono text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Lecturer</span>
                </span>

                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1528] border border-[#322849] text-white font-mono text-[11px]">
                  <Building className="w-3.5 h-3.5 text-purple-400" />
                  <span>Orbit Space Academy</span>
                </span>

                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1528] border border-[#322849] text-[#c4bfd4] font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Joined: {tutor.joinedDate ? new Date(tutor.joinedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Active Academic Service'}</span>
                </span>

                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1528] border border-[#322849] text-purple-300 font-mono text-[11px] font-bold">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tenure: {calculateLengthOfService(tutor.joinedDate)}</span>
                </span>

                {/* Professional Links */}
                {tutor.linkedinUrl && (
                  <a
                    href={tutor.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0077b5]/20 hover:bg-[#0077b5]/30 border border-[#0077b5]/40 text-blue-300 font-mono text-[11px] transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                    <span>LinkedIn</span>
                  </a>
                )}

                {tutor.portfolioUrl && (
                  <a
                    href={tutor.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/40 text-cyan-300 font-mono text-[11px] transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Portfolio</span>
                  </a>
                )}

                {tutor.email && (
                  <a
                    href={`mailto:${tutor.email}`}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1528] hover:bg-[#251f38] border border-[#322849] text-[#c4bfd4] hover:text-white font-mono text-[11px] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    <span>{tutor.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Transparent Historical Baseline Audit Banner (If historical records exist) */}
          {hasHistoricalBaseline && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-semibold font-mono text-[11px]">
                <FileCheck className="w-4 h-4" />
                <span>Admin-Entered Historical Baseline Archive Credited</span>
              </div>
              <p className="text-[#c4bfd4] text-[11px] leading-relaxed">
                {baselineDetails?.note || 'Pre-platform instructional records verified and archived by Orbit Space Academic Administration.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-amber-400/80 pt-1">
                {baselineDetails?.auditedBy && (
                  <span>Audited By: <strong>{baselineDetails.auditedBy}</strong></span>
                )}
                {baselineDetails?.auditDate && (
                  <span>Audit Date: <strong>{new Date(baselineDetails.auditDate).toLocaleDateString()}</strong></span>
                )}
                <span>• Credited transparently alongside real-time platform check-ins</span>
              </div>
            </div>
          )}

          {/* Key Verified Metric Counters (Dynamic & Strict No-Dummy Data) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            
            {/* Teaching Hours */}
            <div className="bg-[#1a162a] rounded-2xl p-4 border border-[#342d4a]">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9d98af]">Teaching Hours</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {totalVerifiedHours} <span className="text-xs font-normal text-[#a49faf]">hrs</span>
              </div>
              <div className="text-[10px] text-[#8e8a9f] font-mono pt-1 leading-tight">
                {historicalTeachingHours > 0 || adjustmentHours !== 0 ? (
                  <span>
                    Hist: +{historicalTeachingHours}h | Live: +{newAttendanceHours}h
                    {adjustmentHours !== 0 && ` | Adj: ${adjustmentHours > 0 ? `+${adjustmentHours}` : adjustmentHours}h`}
                  </span>
                ) : (
                  <span className="text-emerald-400">SUM(Historical + Live Attendance)</span>
                )}
              </div>
            </div>

            {/* Students Taught */}
            <div className="bg-[#1a162a] rounded-2xl p-4 border border-[#342d4a]">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9d98af]">Students Taught</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {totalStudentsTaught}
              </div>
              <div className="text-[10px] text-[#8e8a9f] font-mono pt-1 leading-tight">
                {hasHistoricalBaseline ? (
                  <span>Classes: {newStudentsTaught} | Audited: {historicalStudentsTaught}</span>
                ) : (
                  <span className="text-cyan-400">Enrolled in tutor classes</span>
                )}
              </div>
            </div>

            {/* Students Certified */}
            <div className="bg-[#1a162a] rounded-2xl p-4 border border-[#342d4a]">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9d98af]">Certified Alumni</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {totalStudentsCertified}
              </div>
              <div className="text-[10px] text-[#8e8a9f] font-mono pt-1 leading-tight">
                {hasHistoricalBaseline ? (
                  <span>Platform: {newStudentsCertified} | Audited: {historicalStudentsCertified}</span>
                ) : (
                  <span className="text-emerald-400">Verified graduates</span>
                )}
              </div>
            </div>

            {/* Projects Supervised */}
            <div className="bg-[#1a162a] rounded-2xl p-4 border border-[#342d4a]">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <FolderGit2 className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9d98af]">Supervised Projects</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {totalProjectsSupervised}
              </div>
              <div className="text-[10px] text-[#8e8a9f] font-mono pt-1 leading-tight">
                {hasHistoricalBaseline ? (
                  <span>Portfolios: {newProjectsSupervised} | Audited: {historicalProjectsSupervised}</span>
                ) : (
                  <span className="text-amber-400">Verified student capstones</span>
                )}
              </div>
            </div>

          </div>

          {/* Social/Verification Public Link Bar */}
          <div className="pt-4 border-t border-[#262036] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-[#9d98af]">
              {tutor.joinedDate && (
                <span>Faculty Member Since: <strong className="text-white font-mono">{tutor.joinedDate}</strong></span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {tutor.linkedinUrl && (
                <a
                  href={tutor.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-[#1f1a30] hover:bg-purple-900/40 text-purple-300 flex items-center gap-1.5 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}
              <div className="text-[11px] font-mono text-[#8a849b]">
                orbitspace.academy/tutor/{tutor.slug}
              </div>
            </div>
          </div>

        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-[#282338] pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1a1628]'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Supervised Student Projects ({totalProjectsSupervised})</span>
          </button>

          <button
            onClick={() => setActiveTab('hours')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'hours'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1a1628]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Verified Teaching Ledger ({teachingHistoryList.length + teachingSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('certified')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'certified'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1a1628]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certified Graduates ({totalStudentsCertified})</span>
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1a1628]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Research & Articles ({articlesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('bio')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'bio'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-[#9d98af] hover:text-white hover:bg-[#1a1628]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Qualifications & Bio</span>
          </button>
        </div>

        {/* Tab 1: Supervised Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Student Capstone Projects & Live Evidence</h3>
                <p className="text-xs text-[#9d98af]">Student projects completed and validated under this tutor's supervision.</p>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="bg-[#141120] rounded-2xl p-8 text-center border border-[#2d2740] space-y-3">
                <FolderGit2 className="w-10 h-10 text-purple-400/60 mx-auto" />
                <p className="text-xs text-[#9d98af]">No student capstone projects currently registered for this tutor.</p>
                {hasHistoricalBaseline && historicalProjectsSupervised > 0 && (
                  <p className="text-[11px] font-mono text-amber-300">
                    Includes {historicalProjectsSupervised} historical capstones verified by admin baseline.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-[#141120] rounded-2xl p-5 border border-[#2d2740] hover:border-purple-500/40 transition-all space-y-4 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-purple-400 mb-1">
                          <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 font-semibold">
                            {proj.program}
                          </span>
                          <span>•</span>
                          <span>Student: {proj.studentName}</span>
                          {proj.studentIdOrRef && (
                            <span className="text-[#847f94]">({proj.studentIdOrRef})</span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                          {proj.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {proj.linkedCertificateId && onNavigateToCertificate && (
                          <button
                            type="button"
                            onClick={() => onNavigateToCertificate(proj.linkedCertificateId!)}
                            className="px-3 py-1.5 rounded-xl bg-[#1f1a30] hover:bg-purple-900/60 border border-purple-800/40 text-[#c084fc] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Verify Cert {proj.linkedCertificateId}</span>
                          </button>
                        )}

                        {onNavigateToProject && (
                          <button
                            type="button"
                            onClick={() => onNavigateToProject(proj.verificationSlug)}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-950/40"
                          >
                            <span>Inspect Project</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#a9a4b8] leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#251f38] text-[11px] font-mono text-[#8a849c]">
                      <div className="flex items-center gap-3">
                        <span>Supervision Date: <strong className="text-[#d0cbdf]">{proj.supervisionDate}</strong></span>
                        {proj.verifiedBy && (
                          <span className="text-emerald-400">✓ Audited: {proj.verifiedBy}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {proj.projectUrl && (
                          <a
                            href={proj.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:underline flex items-center gap-1"
                          >
                            <span>Live Deployment</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {proj.repoUrl && (
                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:underline flex items-center gap-1"
                          >
                            <span>Repository</span>
                            <Github className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Verified Teaching Ledger */}
        {activeTab === 'hours' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>Verified Teaching Hours Ledger & Audit Trail</span>
                </h3>
                <p className="text-xs text-[#9d98af]">
                  Calculated dynamically from: Historical Baseline + Digital Class Check-ins + Approved Adjustments.
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[11px] font-mono shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Audited Balance: {totalVerifiedHours} hrs</span>
              </div>
            </div>

            {/* Tripartite Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center justify-between">
                  <span>Historical Baseline</span>
                  <History className="w-3.5 h-3.5 text-amber-400/80" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-200">
                  +{historicalTeachingHours}
                  <span className="text-xs font-normal text-amber-400/80 ml-1">hrs</span>
                </div>
                <p className="text-[10px] text-[#9f99ad] leading-tight">Pre-platform manual logs</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center justify-between">
                  <span>Digital Attendance</span>
                  <FileCheck className="w-3.5 h-3.5 text-cyan-400/80" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-cyan-200">
                  +{newAttendanceHours}
                  <span className="text-xs font-normal text-cyan-400/80 ml-1">hrs</span>
                </div>
                <p className="text-[10px] text-[#9f99ad] leading-tight">Live class check-ins</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold flex items-center justify-between">
                  <span>Manual Adjustments</span>
                  <Clock className="w-3.5 h-3.5 text-purple-400/80" />
                </div>
                <div className={`text-xl sm:text-2xl font-black ${
                  adjustmentHours >= 0 ? 'text-purple-200' : 'text-rose-300'
                }`}>
                  {adjustmentHours > 0 ? `+${adjustmentHours}` : adjustmentHours}
                  <span className="text-xs font-normal text-purple-400/80 ml-1">hrs</span>
                </div>
                <p className="text-[10px] text-[#9f99ad] leading-tight">Audited corrections (+/-)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-900/30 to-indigo-950/50 border border-purple-500/50 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold flex items-center justify-between">
                  <span>Total Verified Hours</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {totalVerifiedHours}
                  <span className="text-xs font-normal text-purple-300 ml-1">hrs</span>
                </div>
                <p className="text-[10px] text-purple-300/80 font-medium leading-tight">SUM(all ledger entries)</p>
              </div>
            </div>

            {/* Teaching Hours Ledger Entries Table */}
            {ledgerEntries.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#9d98af] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ledger Transactions & Audit Proof</span>
                </div>
                <div className="bg-[#141120] rounded-2xl border border-[#2d2740] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#2d2740] bg-[#181427] text-[#9d98af] font-mono uppercase tracking-wider text-[10px]">
                          <th className="p-3.5">Date</th>
                          <th className="p-3.5">Type</th>
                          <th className="p-3.5">Description & Audit Reason</th>
                          <th className="p-3.5">Hours</th>
                          <th className="p-3.5">Audited By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#231e33]">
                        {ledgerEntries.map((entry: any) => {
                          const isHist = entry.type === 'historical';
                          const isAtt = entry.type === 'attendance';
                          const isPositive = entry.hours >= 0;

                          return (
                            <tr key={entry.id} className="hover:bg-[#1a162b] transition-colors">
                              <td className="p-3.5 font-mono text-purple-300 whitespace-nowrap">
                                {entry.date}
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                                  isHist
                                    ? 'bg-amber-950/50 border-amber-800/60 text-amber-300'
                                    : isAtt
                                    ? 'bg-cyan-950/50 border-cyan-800/60 text-cyan-300'
                                    : 'bg-purple-950/50 border-purple-800/60 text-purple-300'
                                }`}>
                                  {isHist && <History className="w-2.5 h-2.5" />}
                                  {isAtt && <FileCheck className="w-2.5 h-2.5" />}
                                  <span className="capitalize">{entry.type}</span>
                                </span>
                              </td>
                              <td className="p-3.5 max-w-sm">
                                <div className="font-semibold text-white">{entry.description}</div>
                                {entry.auditReason && (
                                  <div className="text-[11px] text-[#9d98af]">{entry.auditReason}</div>
                                )}
                                {entry.referenceNote && (
                                  <div className="text-[10px] font-mono text-[#787186]">Ref: {entry.referenceNote}</div>
                                )}
                              </td>
                              <td className="p-3.5 font-mono font-bold whitespace-nowrap">
                                <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                                  {isPositive ? `+${entry.hours}` : entry.hours} hrs
                                </span>
                              </td>
                              <td className="p-3.5 text-[#9d98af] text-[11px] whitespace-nowrap">
                                {entry.addedBy}
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

            {/* Individual Digital Attendance Sessions */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#9d98af] flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Class Session Check-In & Check-Out Logs</span>
              </div>

              {teachingHistoryList.length === 0 && teachingSessions.length === 0 ? (
                <div className="bg-[#141120] rounded-2xl p-6 text-center border border-[#2d2740] space-y-2">
                  <p className="text-xs text-[#9d98af]">No digital check-in sessions recorded on the platform yet.</p>
                </div>
              ) : (
                <div className="bg-[#141120] rounded-2xl border border-[#2d2740] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#2d2740] bg-[#181427] text-[#9d98af] font-mono uppercase tracking-wider text-[10px]">
                          <th className="p-3.5">Session Date</th>
                          <th className="p-3.5">Course & Topic</th>
                          <th className="p-3.5">Check-In / Out</th>
                          <th className="p-3.5">Duration</th>
                          <th className="p-3.5">Students Present</th>
                          <th className="p-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#231e33]">
                        {teachingHistoryList.map((session) => (
                          <tr key={session.sessionId} className="hover:bg-[#1a162b] transition-colors">
                            <td className="p-3.5 font-mono text-purple-300 shrink-0">
                              {session.date}
                            </td>
                            <td className="p-3.5">
                              <div className="font-semibold text-white">{session.topic}</div>
                              <div className="text-[11px] text-purple-400 font-mono">
                                {session.course} • {session.cohort}
                              </div>
                            </td>
                            <td className="p-3.5 font-mono text-[#c4c0d4] text-[11px]">
                              {session.checkInTime || '—'} → {session.checkOutTime || '—'}
                            </td>
                            <td className="p-3.5 font-mono font-bold text-white">
                              {session.durationHours} hrs
                            </td>
                            <td className="p-3.5 font-mono text-[#c4c0d4]">
                              {session.studentsPresentCount} / {session.totalStudentsCount}
                            </td>
                            <td className="p-3.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified Session</span>
                              </span>
                            </td>
                          </tr>
                        ))}

                        {/* Fallback to legacy logged sessions if present */}
                        {teachingSessions.map((session) => (
                          <tr key={session.id} className="hover:bg-[#1a162b] transition-colors">
                            <td className="p-3.5 font-mono text-purple-300 shrink-0">
                              {session.date}
                            </td>
                            <td className="p-3.5">
                              <div className="font-semibold text-white">{session.topicCovered}</div>
                              <div className="text-[11px] text-purple-400 font-mono">{session.program}</div>
                            </td>
                            <td className="p-3.5 font-mono text-[#c4c0d4] text-[11px]">
                              Academic Log
                            </td>
                            <td className="p-3.5 font-mono font-bold text-white">
                              {session.durationHours} hrs
                            </td>
                            <td className="p-3.5 font-mono text-[#c4c0d4]">
                              {session.studentsCount} attended
                            </td>
                            <td className="p-3.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{session.verifiedBy ? 'Verified' : 'Logged'}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Certified Graduates */}
        {activeTab === 'certified' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Verified Certified Alumni</h3>
              <p className="text-xs text-[#9d98af]">
                Students trained by this instructor who successfully met academy standards and earned official certificates.
              </p>
            </div>

            {certifiedStudentsList.length === 0 ? (
              <div className="bg-[#141120] rounded-2xl p-8 text-center border border-[#2d2740] space-y-3">
                <Award className="w-10 h-10 text-purple-400/60 mx-auto" />
                <p className="text-xs text-[#9d98af]">No digital certificates currently indexed under this tutor.</p>
                {hasHistoricalBaseline && historicalStudentsCertified > 0 && (
                  <p className="text-[11px] font-mono text-amber-300">
                    Includes {historicalStudentsCertified} certified graduates recorded in historical baseline.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {certifiedStudentsList.map((cert, idx) => (
                  <div
                    key={idx}
                    className="bg-[#141120] rounded-2xl p-4 border border-[#2d2740] hover:border-purple-500/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">
                        {cert.studentName}
                      </h4>
                      <div className="text-[11px] text-purple-400 font-mono">
                        {cert.program}
                      </div>
                      <div className="text-[10px] text-[#8e8a9f] font-mono">
                        Issued: {cert.dateIssued} • ID: {cert.certificateId}
                      </div>
                    </div>

                    {onNavigateToCertificate && (
                      <button
                        type="button"
                        onClick={() => onNavigateToCertificate(cert.certificateId)}
                        className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800/60 text-purple-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                      >
                        <span>Verify</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Supervised Articles */}
        {activeTab === 'articles' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Supervised Technical Research & Capstone Articles</h3>
              <p className="text-xs text-[#9d98af]">Publications and case studies authored by students under this mentor's direct supervision.</p>
            </div>

            {supervisedArticles.length === 0 ? (
              <div className="bg-[#141120] rounded-2xl p-8 text-center border border-[#2d2740] space-y-3">
                <FileText className="w-10 h-10 text-purple-400/60 mx-auto" />
                <p className="text-xs text-[#9d98af]">No published articles currently linked to this tutor profile.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {supervisedArticles.map((art) => (
                  <div
                    key={art.id}
                    className="bg-[#141120] rounded-2xl p-5 border border-[#2d2740] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-purple-500/50 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-purple-400">
                        <span>{art.category}</span>
                        <span>•</span>
                        <span>By {art.studentAuthors?.[0]?.name || 'Student Researcher'}</span>
                        <span>•</span>
                        <span>{art.readTime}</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        {art.title}
                      </h4>
                      <p className="text-xs text-[#a9a4b8] line-clamp-2">
                        {art.subtitle || (art.content ? art.content.slice(0, 140) : '')}
                      </p>
                    </div>

                    {onNavigateToArticle && (
                      <button
                        onClick={() => onNavigateToArticle(art.slug)}
                        className="px-3.5 py-2 rounded-xl bg-[#1f1a30] hover:bg-purple-900/60 text-purple-300 hover:text-white border border-purple-800/40 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                      >
                        <span>Read Paper</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Qualifications & Bio */}
        {activeTab === 'bio' && (
          <div className="bg-[#141120] rounded-2xl p-6 sm:p-8 border border-[#2d2740] space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Faculty Background & Mentorship Philosophy</h3>
              <p className="text-xs sm:text-sm text-[#b8b3c6] leading-relaxed">
                {tutor.bio || `${tutor.name} is an active industry practitioner and senior instructor at Orbit Space Academy, mentoring emerging technologists across Nigeria in modern engineering, research, and production workflows.`}
              </p>
            </div>

            {tutor.qualifications && tutor.qualifications.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#9d98af] mb-3">
                  Verified Industry Credentials & Accreditations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tutor.qualifications.map((qual, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1c172d] p-3 rounded-xl border border-[#342d4a] flex items-center gap-2.5 text-xs text-[#e0dceb]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{qual}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-[#8a849b] border-t border-[#251f38] pt-6 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <OrbitLogo className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-white">Orbit Space Academy</span>
        </div>
        <p className="text-[11px] font-mono">
          Official Academic Faculty Verification Portal • Public Credential Infrastructure
        </p>
      </footer>
    </div>
  );
};
