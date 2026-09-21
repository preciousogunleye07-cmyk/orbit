import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  User, 
  ExternalLink, 
  Share2, 
  Copy, 
  ArrowLeft, 
  FolderGit2, 
  FileText, 
  Github, 
  Calendar,
  Check,
  Download,
  AlertTriangle
} from 'lucide-react';
import { VerificationDataService, SupervisedProjectRecord } from '../services/verificationDataService';
import { CertificateRecord, getCertificateById } from '../services/certificateService';
import { OrbitLogo } from '../components/OrbitLogo';
import { playSound } from '../utils/soundEffects';

interface PublicProjectEvidencePageProps {
  projectSlug: string;
  onNavigateHome: () => void;
  onNavigateToTutor?: (tutorSlug: string) => void;
  onNavigateToCertificate?: (certId: string) => void;
}

export const PublicProjectEvidencePage: React.FC<PublicProjectEvidencePageProps> = ({
  projectSlug,
  onNavigateHome,
  onNavigateToTutor,
  onNavigateToCertificate
}) => {
  const [project, setProject] = useState<SupervisedProjectRecord | null>(null);
  const [linkedCert, setLinkedCert] = useState<CertificateRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const proj = VerificationDataService.getProjectBySlug(projectSlug);
    setProject(proj || null);

    if (proj && proj.linkedCertificateId) {
      const cert = getCertificateById(proj.linkedCertificateId);
      setLinkedCert(cert || null);
    }

    setLoading(false);
  }, [projectSlug]);

  const handleCopyLink = () => {
    playSound('sparkle');
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0b14] flex items-center justify-center p-6 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#c4c7c8]">Authenticating Project Evidence...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0d0b14] text-white flex flex-col justify-center items-center p-6 text-center">
        <div className="max-w-md w-full bg-[#181524] rounded-3xl p-8 border border-[#332d47] space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Project Record Not Found</h2>
          <p className="text-xs text-[#9d98af] leading-relaxed">
            No student capstone record corresponds to slug <span className="font-mono text-purple-400">"{projectSlug}"</span>.
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

  const isVerified = project.verificationStatus === 'verified';

  return (
    <div className="min-h-screen bg-[#0c0a13] text-[#e5e2e1] flex flex-col justify-between pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-purple-900/15 blur-[180px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full relative z-10 flex-1 space-y-8">
        
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#282338]">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-xs font-semibold text-[#a855f7] hover:text-[#c084fc] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Orbit Space Academy</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium border ${
              isVerified 
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400' 
                : 'bg-amber-950/60 border-amber-800/60 text-amber-300'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isVerified ? 'Academic Council Verified Project' : 'Pending Audit'}</span>
            </span>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-[#1a1627] hover:bg-[#251f38] border border-[#39314e] text-xs text-white font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Project Card */}
        <div className="bg-[#141120] rounded-3xl p-6 sm:p-8 border border-[#2d2740] shadow-2xl space-y-6">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 font-semibold">
                {project.program}
              </span>
              <span className="text-[#8e8a9f]">Student Capstone Evidence</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.title}
            </h1>
          </div>

          {/* Student & Tutor Supervision Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#1b172a] border border-[#312a47]">
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#9e99af] tracking-wider block">Student Author</span>
              <div className="font-bold text-white text-sm sm:text-base">{project.studentName}</div>
              {project.studentIdOrRef && (
                <div className="text-xs font-mono text-purple-400">Student Ref: {project.studentIdOrRef}</div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#9e99af] tracking-wider block">Supervising Faculty</span>
              <div className="font-bold text-white text-sm sm:text-base">{project.tutorName}</div>
              <div className="text-xs text-[#a9a4b8]">{project.tutorRole || 'Faculty Mentor'}</div>
            </div>

          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#9d98af]">Executive Summary & Technical Architecture</h3>
            <p className="text-xs sm:text-sm text-[#d4cfe2] leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Verification Badges */}
          <div className="pt-4 border-t border-[#262038] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-[10px] text-[#9d98af] uppercase block">Supervision & Completion</span>
              <span className="text-white font-medium">{project.supervisionDate}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#9d98af] uppercase block">Audit Verification</span>
              <span className="text-emerald-400 font-medium">✓ {project.verifiedBy || 'Orbit Space Academic Council'}</span>
            </div>
          </div>

          {/* Live Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#262038]">
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-950/40"
              >
                <span>Inspect Live Deployment</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#1d182e] hover:bg-[#282240] border border-[#3c3453] text-white text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Source Repository</span>
              </a>
            )}

            {project.linkedCertificateId && onNavigateToCertificate && (
              <button
                type="button"
                onClick={() => onNavigateToCertificate(project.linkedCertificateId!)}
                className="px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>View Verified Certificate {project.linkedCertificateId}</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-[#8a849b] border-t border-[#251f38] pt-6 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <OrbitLogo className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-white">Orbit Space Academy</span>
        </div>
        <p className="text-[11px] font-mono">
          Student Project Verification & Capstone Portfolio Registry
        </p>
      </footer>
    </div>
  );
};
