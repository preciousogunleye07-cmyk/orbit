import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertOctagon, 
  Search, 
  Copy, 
  Download, 
  Printer, 
  FileText, 
  Calendar, 
  User, 
  BookOpen, 
  Hash, 
  Clock, 
  Award,
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import { 
  CertificateRecord, 
  fetchCertificateByIdAsync, 
  getCertificateById, 
  getPublicAuthUrl, 
  getActualBrowserAuthUrl 
} from '../services/certificateService';
import { generateQrCodeDataUrl, downloadQrCode } from '../utils/qrCode';
import { OrbitLogo } from '../components/OrbitLogo';
import { playSound } from '../utils/soundEffects';
import { getArticlesByStudentCertificateId, ArticleRecord } from '../services/articleService';
import { VerificationDataService, SupervisedProjectRecord } from '../services/verificationDataService';
import { TutorService, TutorProfile } from '../services/tutorService';

interface PublicCertificatePageProps {
  authId: string;
  onNavigateHome: () => void;
  onSearchNewId: (newId: string) => void;
  onNavigateToArticle?: (slug: string) => void;
  onNavigateToTutor?: (tutorSlug: string) => void;
  onNavigateToProject?: (projectSlug: string) => void;
}

export const PublicCertificatePage: React.FC<PublicCertificatePageProps> = ({
  authId,
  onNavigateHome,
  onSearchNewId,
  onNavigateToArticle,
  onNavigateToTutor,
  onNavigateToProject
}) => {
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [linkedArticles, setLinkedArticles] = useState<ArticleRecord[]>([]);
  const [linkedProject, setLinkedProject] = useState<SupervisedProjectRecord | null>(null);
  const [supervisingTutor, setSupervisingTutor] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [lookupInput, setLookupInput] = useState('');

  const publicUrl = getPublicAuthUrl(authId);
  const browserUrl = getActualBrowserAuthUrl(authId);

  useEffect(() => {
    let isMounted = true;
    if (!authId || !authId.trim()) {
      setCertificate(null);
      setLinkedArticles([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetchCertificateByIdAsync(authId).then((record) => {
      if (!isMounted) return;
      setCertificate(record);
      setLoading(false);

      if (record) {
        playSound('arrival');
        const studentArts = getArticlesByStudentCertificateId(record.id);
        setLinkedArticles(studentArts);

        // Resolve linked project evidence
        const proj = VerificationDataService.getProjectByCertificateId(record.id);
        if (proj) {
          setLinkedProject(proj);
        } else if (record.projectTitle) {
          setLinkedProject({
            id: `proj-${record.id}`,
            verificationSlug: record.projectSlug || record.projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            title: record.projectTitle,
            description: `Graduation capstone project in ${record.course} completed with distinction.`,
            studentName: record.studentName,
            program: record.course,
            category: 'web',
            projectUrl: record.projectUrl,
            tutorId: record.supervisingTutorId || '',
            tutorName: record.supervisingTutorName || 'Orbit Space Faculty',
            supervisionDate: record.dateIssued,
            visibility: 'public',
            verificationStatus: 'verified',
            linkedCertificateId: record.id,
            createdAt: record.createdAt
          });
        } else {
          setLinkedProject(null);
        }

        // Resolve supervising tutor
        if (record.supervisingTutorSlug) {
          const tut = TutorService.getTutorBySlug(record.supervisingTutorSlug);
          setSupervisingTutor(tut || null);
        } else if (record.supervisingTutorName) {
          const tut = TutorService.getAllTutors().find(t => t.name === record.supervisingTutorName || t.shortName === record.supervisingTutorName);
          setSupervisingTutor(tut || null);
        } else if (proj && proj.tutorId) {
          const tut = TutorService.getTutorById(proj.tutorId);
          setSupervisingTutor(tut || null);
        } else if (record.course) {
          const assigned = TutorService.getAssignedTutorForProgram(record.course);
          setSupervisingTutor(assigned || null);
        }

        generateQrCodeDataUrl(browserUrl, 500)
          .then(url => {
            if (isMounted) setQrDataUrl(url);
          })
          .catch(console.error);
      } else {
        playSound('error');
        setLinkedArticles([]);
        setLinkedProject(null);
        setSupervisingTutor(null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [authId, browserUrl]);

  // Keep certificateRef synced for event listeners
  const certificateRef = useRef(certificate);
  useEffect(() => {
    certificateRef.current = certificate;
  }, [certificate]);

  // Real-time synchronization: when a lecturer's profile or picture updates, refresh supervising tutor immediately
  useEffect(() => {
    const handleTutorRefresh = () => {
      const currentCert = certificateRef.current;
      if (!currentCert) return;
      const proj = VerificationDataService.getProjectByCertificateId(currentCert.id);
      let tut: TutorProfile | null = null;
      if (currentCert.supervisingTutorSlug) {
        tut = TutorService.getTutorBySlug(currentCert.supervisingTutorSlug) || null;
      } else if (currentCert.supervisingTutorName) {
        tut = TutorService.getAllTutors().find(t => t.name === currentCert.supervisingTutorName || t.shortName === currentCert.supervisingTutorName) || null;
      } else if (proj && proj.tutorId) {
        tut = TutorService.getTutorById(proj.tutorId) || null;
      } else if (currentCert.course) {
        tut = TutorService.getAssignedTutorForProgram(currentCert.course) || null;
      }
      if (tut) {
        setSupervisingTutor(tut);
      }
    };

    window.addEventListener('storage', handleTutorRefresh);
    window.addEventListener('orbit-tutors-updated', handleTutorRefresh);
    const unsubscribe = TutorService.subscribeTutors(() => handleTutorRefresh());

    return () => {
      window.removeEventListener('storage', handleTutorRefresh);
      window.removeEventListener('orbit-tutors-updated', handleTutorRefresh);
      unsubscribe();
    };
  }, []);

  const handleCopyLink = () => {
    playSound('sparkle');
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    playSound('chime');
    downloadQrCode(browserUrl, `Orbit_Space_Certificate_QR_${authId.toUpperCase()}.png`);
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupInput.trim()) {
      playSound('scan');
      onSearchNewId(lookupInput.trim().toUpperCase());
    }
  };

  const handlePrint = () => {
    playSound('pulse');
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#100e17] flex items-center justify-center p-6 text-[#ffffff]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#c4c7c8]">Authenticating Certificate ID...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#100e17] text-[#e5e2e1] flex flex-col justify-between pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background radial atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-900/15 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full relative z-10 flex-1 space-y-8">
        
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#332d47]">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 group cursor-pointer text-left transition-transform hover:scale-105"
            title="Return to Orbit Space Homepage"
          >
            <OrbitLogo size={36} color="#c084fc" className="shrink-0" />
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-[#ffffff] tracking-tight font-sans">
                oRbit<span className="text-[#a855f7] font-light">.space</span>
              </span>
              <span className="text-[10px] text-[#a855f7] font-mono tracking-widest uppercase">
                Official Credential Verification
              </span>
            </div>
          </button>

          <button
            onClick={onNavigateHome}
            className="text-xs text-[#c4c7c8] hover:text-[#ffffff] px-4 py-1.5 rounded-full bg-[#181524] border border-[#332d47] transition-colors"
          >
            ← Back to Orbit Space
          </button>
        </div>

        {/* 1. STATE A: VALID CERTIFICATE */}
        {certificate && certificate.status === 'valid' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#181524] rounded-[28px] p-6 sm:p-10 border border-[#332d47] shadow-2xl relative overflow-hidden space-y-8 print:bg-white print:text-black print:border-none print:shadow-none"
          >
            {/* Top Verification Header */}
            <div className="text-center space-y-3 pb-8 border-b border-[#332d47] print:border-gray-200">
              
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-950/50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest">
                ✓ AUTHENTICATED
              </span>

              <h1 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal tracking-tight print:text-black">
                Official Certificate Authentication
              </h1>

              <p className="text-xs sm:text-sm text-[#e2e8f0] font-light max-w-lg mx-auto leading-relaxed print:text-gray-700">
                This certificate has been successfully authenticated as an official certificate issued by <strong className="text-[#ffffff] font-semibold print:text-black">Orbit Space</strong>.
              </p>
            </div>

            {/* Certificate Record Metadata Box */}
            <div className="bg-[#100e17] rounded-2xl p-6 border border-[#332d47] space-y-6 print:bg-gray-50 print:border-gray-200">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Holder Name */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#c4c7c8] font-mono uppercase tracking-wider block flex items-center gap-1.5 print:text-gray-500">
                    <User className="w-3.5 h-3.5 text-[#a855f7]" /> Certificate Holder
                  </span>
                  <p className="text-lg font-serif text-[#ffffff] font-normal print:text-black">
                    {certificate.studentName}
                  </p>
                </div>

                {/* Course / Program */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#c4c7c8] font-mono uppercase tracking-wider block flex items-center gap-1.5 print:text-gray-500">
                    <BookOpen className="w-3.5 h-3.5 text-[#a855f7]" /> Program / Track
                  </span>
                  <p className="text-base font-semibold text-[#a855f7] print:text-purple-700">
                    {certificate.course}
                  </p>
                </div>

                {/* Certificate ID */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#c4c7c8] font-mono uppercase tracking-wider block flex items-center gap-1.5 print:text-gray-500">
                    <Hash className="w-3.5 h-3.5 text-[#a855f7]" /> Certificate ID
                  </span>
                  <p className="text-sm font-mono font-bold text-[#c084fc] print:text-purple-900">
                    {certificate.id}
                  </p>
                </div>

                {/* Date Issued */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#c4c7c8] font-mono uppercase tracking-wider block flex items-center gap-1.5 print:text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-[#a855f7]" /> Date Issued
                  </span>
                  <p className="text-sm font-medium text-[#ffffff] print:text-black">
                    {certificate.dateIssued}
                  </p>
                </div>

                {/* Certificate Number */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#c4c7c8] font-mono uppercase tracking-wider block flex items-center gap-1.5 print:text-gray-500">
                    <FileText className="w-3.5 h-3.5 text-[#a855f7]" /> Registration Number
                  </span>
                  <p className="text-xs font-mono text-[#e2e8f0] print:text-gray-800">
                    {certificate.certificateNumber}
                  </p>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#c4c7c8] font-mono uppercase tracking-wider block print:text-gray-500">
                    Record Status
                  </span>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Valid & Verified
                    </span>
                  </div>
                </div>

                {/* Supervising Tutor with Verified Profile Picture */}
                {supervisingTutor && (
                  <div className="space-y-1 sm:col-span-2 bg-[#120f1b] p-3 rounded-2xl border border-purple-900/30">
                    <span className="text-[10px] text-[#c4c7c8] font-mono uppercase tracking-wider block flex items-center gap-1.5 print:text-gray-500">
                      <User className="w-3.5 h-3.5 text-[#a855f7]" /> Supervising Faculty Member
                    </span>
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-200 font-bold text-sm shrink-0 overflow-hidden relative shadow-md">
                          {supervisingTutor.photoUrl ? (
                            <img
                              src={supervisingTutor.photoUrl}
                              alt={supervisingTutor.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            supervisingTutor.avatar || (supervisingTutor.shortName ? supervisingTutor.shortName.charAt(0) : 'T')
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-white print:text-black">
                              {supervisingTutor.name}
                            </span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          </div>
                          <p className="text-[11px] text-purple-300 font-medium">
                            {supervisingTutor.role}
                          </p>
                        </div>
                      </div>

                      {onNavigateToTutor && (
                        <button
                          type="button"
                          onClick={() => {
                            playSound('chime');
                            onNavigateToTutor(supervisingTutor.slug);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/50 text-[11px] font-mono text-purple-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 shrink-0 print:hidden"
                        >
                          <span>Faculty Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Optional Fields */}
              {(certificate.courseDuration || certificate.certificateType || certificate.additionalNotes) && (
                <div className="pt-4 border-t border-[#332d47] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs print:border-gray-200">
                  {certificate.courseDuration && (
                    <div>
                      <span className="text-[#c4c7c8] text-[10px] font-mono uppercase block">Duration</span>
                      <span className="text-[#ffffff] font-medium print:text-black">{certificate.courseDuration}</span>
                    </div>
                  )}
                  {certificate.certificateType && (
                    <div>
                      <span className="text-[#c4c7c8] text-[10px] font-mono uppercase block">Credential Type</span>
                      <span className="text-[#ffffff] font-medium print:text-black">{certificate.certificateType}</span>
                    </div>
                  )}
                  {certificate.additionalNotes && (
                    <div className="sm:col-span-2 pt-1">
                      <span className="text-[#c4c7c8] text-[10px] font-mono uppercase block">Honors / Notes</span>
                      <p className="text-[#e2e8f0] font-light leading-relaxed print:text-gray-800">{certificate.additionalNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Uploaded Certificate Document Preview if attached */}
              {certificate.fileName && (
                <div className="pt-4 border-t border-[#332d47] flex items-center justify-between gap-3 print:border-gray-200">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#a855f7] shrink-0" />
                    <span className="text-xs text-[#ffffff] font-mono truncate print:text-black">
                      {certificate.fileName}
                    </span>
                  </div>

                  {certificate.documentUrl && (
                    <a
                      href={certificate.documentUrl}
                      download={certificate.fileName}
                      className="text-xs text-[#c084fc] hover:underline font-semibold shrink-0 print:hidden"
                    >
                      Download Document
                    </a>
                  )}
                </div>
              )}

            </div>

            {/* QR Code & Direct Link Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-[#100e17] p-5 rounded-2xl border border-[#332d47] print:hidden">
              <div className="sm:col-span-8 space-y-2">
                <span className="text-[10px] text-[#a855f7] font-mono uppercase tracking-widest font-semibold block">
                  Public Authentication Link
                </span>
                <div className="bg-[#181524] px-3.5 py-2.5 rounded-xl border border-[#332d47] text-xs font-mono text-[#ffffff] truncate">
                  {publicUrl}
                </div>
                <p className="text-[11px] text-[#c4c7c8] font-light">
                  Scan the QR code or visit this link anytime to verify this credential's official status.
                </p>
              </div>

              <div className="sm:col-span-4 flex flex-col items-center justify-center">
                {qrDataUrl && (
                  <div className="bg-white p-2.5 rounded-xl shadow-lg">
                    <img src={qrDataUrl} alt={`QR Code for ${certificate.id}`} className="w-28 h-28 object-contain" />
                  </div>
                )}
              </div>
            </div>

            {/* CRITICAL FEATURE: BI-DIRECTIONALLY LINKED STUDENT ARTICLES */}
            {linkedArticles.length > 0 && (
              <div className="bg-[#100e17] rounded-2xl p-5 border border-purple-800/40 space-y-4 print:hidden">
                <div className="flex items-center justify-between pb-2 border-b border-[#2d273f]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#c084fc]" />
                    <span className="text-xs font-semibold text-white">
                      Published Research & Capstone Articles
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    {linkedArticles.length} Published Paper{linkedArticles.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {linkedArticles.map((art) => (
                    <div
                      key={art.id}
                      className="bg-[#181524] rounded-xl p-4 border border-[#332d47] hover:border-purple-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#8e8a9f]">
                          <span className="text-[#a855f7] font-semibold">{art.category}</span>
                          <span>•</span>
                          <span>{art.readTime}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {art.title}
                        </h4>
                        {art.supervisingTutor?.name && (
                          <p className="text-[11px] text-[#c4c7c8] font-light">
                            Supervised by {art.supervisingTutor.name} ({art.supervisingTutor.role})
                          </p>
                        )}
                      </div>

                      {onNavigateToArticle && (
                        <button
                          type="button"
                          onClick={() => {
                            playSound('chime');
                            onNavigateToArticle(art.slug);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-[#221c35] hover:bg-purple-900/60 border border-purple-800/50 text-[#c084fc] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                        >
                          <span>Read Article</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CRITICAL FEATURE: VERIFIED STUDENT CAPSTONE PROJECT EVIDENCE */}
            {linkedProject && (
              <div className="bg-[#100e17] rounded-2xl p-5 border border-purple-800/40 space-y-4 print:hidden">
                <div className="flex items-center justify-between pb-2 border-b border-[#2d273f]">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">
                      Verified Capstone Project Evidence
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Audited Evidence</span>
                  </span>
                </div>

                <div className="bg-[#181524] rounded-xl p-4 border border-[#332d47] hover:border-purple-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#8e8a9f]">
                      <span className="text-[#a855f7] font-semibold">{linkedProject.program}</span>
                      <span>•</span>
                      <span>Supervised by {linkedProject.tutorName}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {linkedProject.title}
                    </h4>
                    <p className="text-[11px] text-[#c4c7c8] font-light line-clamp-2">
                      {linkedProject.description}
                    </p>
                  </div>

                  {onNavigateToProject && (
                    <button
                      type="button"
                      onClick={() => {
                        playSound('chime');
                        onNavigateToProject(linkedProject.verificationSlug);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-lg shadow-purple-950/40"
                    >
                      <span>Inspect Project Evidence</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#332d47] print:hidden">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="py-3 px-5 rounded-full bg-[#100e17] hover:bg-[#1f1b2e] border border-[#332d47] text-xs font-semibold text-[#ffffff] flex items-center gap-2 transition-all"
                >
                  <Copy className="w-4 h-4 text-[#a855f7]" />
                  <span>{copied ? '✓ Link Copied!' : 'Copy Authentication URL'}</span>
                </button>

                <button
                  onClick={handleDownloadQr}
                  className="py-3 px-5 rounded-full btn-purple text-xs font-semibold flex items-center gap-2 shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR Code</span>
                </button>
              </div>

              <button
                onClick={handlePrint}
                className="py-3 px-5 rounded-full bg-[#1f1b2e] hover:bg-[#332d47] border border-[#332d47] text-xs font-semibold text-[#e2e8f0] flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4 text-[#a855f7]" />
                <span>Print Statement</span>
              </button>
            </div>

          </motion.div>
        )}

        {/* 2. STATE B: REVOKED CERTIFICATE */}
        {certificate && certificate.status === 'revoked' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#181524] rounded-[28px] p-6 sm:p-10 border border-rose-800/60 shadow-2xl relative overflow-hidden space-y-8"
          >
            <div className="text-center space-y-3 pb-8 border-b border-[#332d47]">
              <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto shadow-2xl shadow-rose-950/50">
                <AlertOctagon className="w-9 h-9" />
              </div>

              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-400 text-xs font-mono font-bold uppercase tracking-widest">
                ✕ CERTIFICATE REVOKED
              </span>

              <h1 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal tracking-tight">
                Certificate Revoked
              </h1>

              <p className="text-xs sm:text-sm text-rose-200 font-light max-w-lg mx-auto leading-relaxed">
                This certificate was previously issued by Orbit Space but is <strong className="text-rose-400">no longer considered valid</strong>.
              </p>
            </div>

            {/* Revoked Record Summary */}
            <div className="bg-[#100e17] rounded-2xl p-6 border border-rose-900/40 space-y-4 text-xs">
              <div className="flex justify-between border-b border-[#332d47] pb-3">
                <span className="text-[#c4c7c8]">Certificate Holder:</span>
                <span className="text-[#ffffff] font-semibold">{certificate.studentName}</span>
              </div>
              <div className="flex justify-between border-b border-[#332d47] pb-3">
                <span className="text-[#c4c7c8]">Course / Program:</span>
                <span className="text-[#ffffff] font-semibold">{certificate.course}</span>
              </div>
              <div className="flex justify-between border-b border-[#332d47] pb-3">
                <span className="text-[#c4c7c8]">Certificate ID:</span>
                <span className="text-rose-400 font-mono font-bold">{certificate.id}</span>
              </div>
              <div className="flex justify-between border-b border-[#332d47] pb-3">
                <span className="text-[#c4c7c8]">Date Issued:</span>
                <span className="text-[#ffffff]">{certificate.dateIssued}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#c4c7c8]">Status:</span>
                <span className="text-rose-400 font-bold uppercase font-mono">Revoked</span>
              </div>
            </div>

            {/* Lookup Another Form */}
            <div className="pt-4 border-t border-[#332d47]">
              <span className="text-xs text-[#c4c7c8] block mb-2 font-mono">Verify Another Certificate ID:</span>
              <form onSubmit={handleLookupSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder="e.g. ORB-8F29K2"
                  className="flex-1 bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-4 py-2.5 outline-none font-mono"
                />
                <button
                  type="submit"
                  className="btn-purple px-5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Verify</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* 3. STATE C: INVALID / NOT FOUND / ENTER ID */}
        {!certificate && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#181524] rounded-[28px] p-6 sm:p-10 border border-[#332d47] shadow-2xl relative overflow-hidden space-y-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#1f1b2e] border border-[#332d47] text-[#a855f7] flex items-center justify-center mx-auto shadow-xl">
              {authId ? <Search className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-[#a855f7] uppercase tracking-widest font-semibold block">
                Verification System
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal">
                {authId ? 'Certificate Not Found' : 'Verify Student Certificate'}
              </h1>
              <p className="text-xs sm:text-sm text-[#c4c7c8] font-light max-w-md mx-auto leading-relaxed">
                {authId ? (
                  <>We couldn't find an official certificate associated with authentication ID <span className="font-mono text-[#ffffff] font-semibold">{authId}</span>.</>
                ) : (
                  <>Enter the unique Certificate ID to verify authentic graduation credentials and course completion.</>
                )}
              </p>
            </div>

            {/* Check Authentication ID Form */}
            <div className="max-w-md mx-auto bg-[#100e17] p-6 rounded-2xl border border-[#332d47] space-y-4 text-left">
              <label className="block text-xs font-medium text-[#e2e8f0]">
                Check Authentication ID
              </label>
              <form onSubmit={handleLookupSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder="Enter ID e.g. ORB-8F29K2"
                  className="flex-1 bg-[#181524] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-4 py-3 outline-none font-mono"
                />
                <button
                  type="submit"
                  className="btn-purple px-6 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Verify</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-[#332d47]">
              <button
                onClick={onNavigateHome}
                className="text-xs text-[#c4c7c8] hover:text-[#a855f7] transition-colors"
              >
                ← Return to Orbit Space Main Page
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
