import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  UploadCloud, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Download, 
  Plus, 
  X, 
  FileText, 
  Calendar, 
  User, 
  BookOpen, 
  Hash, 
  Clock, 
  ShieldCheck, 
  Loader2,
  FileCheck
} from 'lucide-react';
import { 
  createCertificate, 
  CertificateRecord, 
  getPublicAuthUrl, 
  getActualBrowserAuthUrl 
} from '../../services/certificateService';
import { generateQrCodeDataUrl, downloadQrCode } from '../../utils/qrCode';
import { playSound } from '../../utils/soundEffects';

interface AdminCreateCertificatePageProps {
  onCreated: (cert: CertificateRecord) => void;
  onOpenPublicPage: (id: string) => void;
  onCancel: () => void;
}

const COURSE_OPTIONS = [
  'UI/UX Design',
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Cybersecurity',
  'Data Analysis',
  'Video Editing',
  'Brand Identity Design',
  'AI Automation',
  'Other'
];

const CERTIFICATE_TYPES = [
  'Professional Certificate',
  'Course Completion Certificate',
  'Bootcamp Certificate',
  'Workshop Certificate'
];

export const AdminCreateCertificatePage: React.FC<AdminCreateCertificatePageProps> = ({
  onCreated,
  onOpenPublicPage,
  onCancel
}) => {
  // Form State
  const [studentName, setStudentName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('Full Stack Development');
  const [customCourse, setCustomCourse] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [dateIssued, setDateIssued] = useState(new Date().toISOString().split('T')[0]);
  const [courseDuration, setCourseDuration] = useState('3 Months');
  const [certificateType, setCertificateType] = useState('Professional Certificate');
  const [studentId, setStudentId] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<{
    file: File;
    previewUrl?: string;
    progress: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission & Success Screen State
  const [loading, setLoading] = useState(false);
  const [createdCertificate, setCreatedCertificate] = useState<CertificateRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Unsupported file type. Please upload a PDF, PNG, JPG, or JPEG file.');
      return;
    }

    playSound('page');

    // Simulate clean upload progress
    setUploadedFile({ file, progress: 20 });
    let p = 20;
    const interval = setInterval(() => {
      p += 25;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
      }
      setUploadedFile(prev => prev ? { ...prev, progress: p } : null);
    }, 120);

    // Read as Data URL for preview if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFile(prev => prev ? { ...prev, previewUrl: e.target?.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    playSound('release');
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim()) {
      alert('Please enter the student\'s full name.');
      return;
    }

    const finalCourse = selectedCourse === 'Other' ? customCourse.trim() : selectedCourse;
    if (!finalCourse) {
      alert('Please specify the course or program name.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const newRecord = createCertificate({
      studentName: studentName.trim(),
      course: finalCourse,
      certificateNumber: certificateNumber.trim() || undefined,
      dateIssued,
      courseDuration: courseDuration.trim() || undefined,
      certificateType: certificateType.trim() || undefined,
      studentId: studentId.trim() || undefined,
      additionalNotes: additionalNotes.trim() || undefined,
      fileName: uploadedFile?.file.name,
      fileSize: uploadedFile?.file.size,
      fileType: uploadedFile?.file.type,
      documentUrl: uploadedFile?.previewUrl
    });

    // Generate QR code for success screen
    const browserUrl = getActualBrowserAuthUrl(newRecord.id);
    try {
      const qrUrl = await generateQrCodeDataUrl(browserUrl, 500);
      setQrDataUrl(qrUrl);
    } catch (err) {
      console.error('QR generation error:', err);
    }

    playSound('ready');
    setCreatedCertificate(newRecord);
    setLoading(false);
    onCreated(newRecord);
  };

  const handleCopyLink = () => {
    if (!createdCertificate) return;
    playSound('sparkle');
    const publicUrl = getPublicAuthUrl(createdCertificate.id);
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!createdCertificate) return;
    playSound('chime');
    const browserUrl = getActualBrowserAuthUrl(createdCertificate.id);
    downloadQrCode(browserUrl, `Orbit_Space_Certificate_QR_${createdCertificate.id}.png`);
  };

  const handleResetForm = () => {
    playSound('droplet');
    setCreatedCertificate(null);
    setStudentName('');
    setSelectedCourse('Full Stack Development');
    setCustomCourse('');
    setCertificateNumber('');
    setDateIssued(new Date().toISOString().split('T')[0]);
    setCourseDuration('3 Months');
    setCertificateType('Professional Certificate');
    setStudentId('');
    setAdditionalNotes('');
    setUploadedFile(null);
    setQrDataUrl('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // SUCCESS SCREEN
  if (createdCertificate) {
    const publicUrl = getPublicAuthUrl(createdCertificate.id);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto bg-[#181524] rounded-[28px] p-6 sm:p-10 border border-[#332d47] shadow-2xl relative overflow-hidden space-y-8"
      >
        {/* Top Success Header */}
        <div className="text-center space-y-3 pb-6 border-b border-[#332d47]">
          <div className="w-16 h-16 rounded-3xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/50">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block font-semibold">
            ✓ Certificate Successfully Registered
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal">
            Certificate Authentication Created
          </h1>
          <p className="text-xs sm:text-sm text-[#c4c7c8] font-light max-w-md mx-auto">
            The student record is officially registered and verifiable online via its unique authentication URL and QR code.
          </p>
        </div>

        {/* Certificate Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#100e17] p-6 rounded-2xl border border-[#332d47]">
          
          <div className="md:col-span-7 space-y-4 text-xs">
            <div>
              <span className="text-[10px] text-[#c4c7c8] font-mono uppercase block">Student Name</span>
              <span className="text-lg font-semibold text-[#ffffff] font-serif block mt-0.5">
                {createdCertificate.studentName}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#c4c7c8] font-mono uppercase block">Course / Program</span>
              <span className="text-sm font-semibold text-[#a855f7] block mt-0.5">
                {createdCertificate.course}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-[10px] text-[#c4c7c8] font-mono uppercase block">Authentication ID</span>
                <span className="text-sm font-mono font-bold text-[#c084fc] block mt-0.5">
                  {createdCertificate.id}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#c4c7c8] font-mono uppercase block">Date Issued</span>
                <span className="text-xs text-[#ffffff] block mt-0.5">
                  {createdCertificate.dateIssued}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-[#c4c7c8] font-mono uppercase block mb-1">Public Authentication URL</span>
              <div className="bg-[#181524] px-3.5 py-2.5 rounded-xl border border-[#332d47] text-xs font-mono text-[#ffffff] truncate flex items-center justify-between">
                <span className="truncate">{publicUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="text-xs text-[#a855f7] hover:text-[#ffffff] font-semibold shrink-0 ml-2"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="md:col-span-5 bg-[#181524] p-5 rounded-xl border border-[#332d47] flex flex-col items-center justify-between text-center">
            <span className="text-[10px] text-[#a855f7] font-mono uppercase tracking-wider font-semibold">
              Authentic QR Code
            </span>

            {qrDataUrl && (
              <div className="bg-white p-3 rounded-xl shadow-lg my-2">
                <img src={qrDataUrl} alt="Certificate QR Code" className="w-36 h-36 object-contain" />
              </div>
            )}

            <button
              onClick={handleDownloadQr}
              className="w-full py-2.5 px-3 rounded-xl bg-[#100e17] hover:bg-[#332d47] border border-[#332d47] text-xs text-[#ffffff] font-semibold flex items-center justify-center gap-2 transition-all mt-2"
            >
              <Download className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>Download High-Res QR Code</span>
            </button>
          </div>

        </div>

        {/* Success Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#332d47]">
          <button
            onClick={handleCopyLink}
            className="py-3 px-5 rounded-full bg-[#100e17] hover:bg-[#1f1b2e] border border-[#332d47] text-xs font-semibold text-[#ffffff] flex items-center gap-2 transition-all min-h-[44px]"
          >
            <Copy className="w-4 h-4 text-[#a855f7]" />
            <span>{copied ? '✓ Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={() => onOpenPublicPage(createdCertificate.id)}
            className="py-3 px-5 rounded-full btn-purple text-xs font-semibold flex items-center gap-2 shadow-lg transition-all min-h-[44px]"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Authentication Page</span>
          </button>

          <button
            onClick={handleResetForm}
            className="py-3 px-5 rounded-full bg-[#1f1b2e] hover:bg-[#332d47] border border-[#332d47] text-xs font-semibold text-[#e2e8f0] flex items-center gap-2 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-[#a855f7]" />
            <span>Create Another Certificate</span>
          </button>
        </div>

      </motion.div>
    );
  }

  // FORM VIEW
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Top Title Banner */}
      <div className="bg-[#181524] rounded-[24px] p-6 sm:p-8 border border-[#332d47] shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1f1b2e] border border-[#332d47] text-[#c084fc] text-xs font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>New Certificate Record</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal">
            Generate Student Certificate
          </h1>
          <p className="text-xs sm:text-sm text-[#c4c7c8] font-light mt-1">
            Enter the student's details to generate an official Orbit Space certificate authentication record.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="p-2.5 rounded-full bg-[#1f1b2e] border border-[#332d47] text-[#c4c7c8] hover:text-[#ffffff] transition-colors"
          title="Back to Directory"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-[#181524] rounded-[28px] p-6 sm:p-8 border border-[#332d47] shadow-2xl space-y-8">
        
        {/* Section 1: Student & Course Information */}
        <div className="space-y-6">
          <div className="pb-3 border-b border-[#332d47] flex items-center gap-2">
            <User className="w-4 h-4 text-[#a855f7]" />
            <h2 className="text-sm font-semibold text-[#ffffff] uppercase tracking-wider font-mono">
              1. Student & Course Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Student Full Name */}
            <div>
              <label className="block text-xs font-medium text-[#e2e8f0] mb-2">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-sm rounded-xl px-4 py-3 outline-none transition-colors"
              />
            </div>

            {/* Course Select */}
            <div>
              <label className="block text-xs font-medium text-[#e2e8f0] mb-2">
                Course / Program <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-sm rounded-xl px-4 py-3 outline-none transition-colors"
              >
                {COURSE_OPTIONS.map((c) => (
                  <option key={c} value={c} className="bg-[#181524] text-white">
                    {c}
                  </option>
                ))}
              </select>

              {selectedCourse === 'Other' && (
                <input
                  type="text"
                  required
                  value={customCourse}
                  onChange={(e) => setCustomCourse(e.target.value)}
                  placeholder="Specify custom course name..."
                  className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-sm rounded-xl px-4 py-3 outline-none transition-colors mt-3"
                />
              )}
            </div>

            {/* Certificate Number (Optional) */}
            <div>
              <label className="block text-xs font-medium text-[#e2e8f0] mb-2">
                Certificate Number <span className="text-[10px] text-[#c4c7c8] font-light">(Optional)</span>
              </label>
              <input
                type="text"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                placeholder="Leave empty to auto-generate (e.g. ORB/2026/CERT-8912)"
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-sm rounded-xl px-4 py-3 outline-none transition-colors font-mono"
              />
            </div>

            {/* Date Issued */}
            <div>
              <label className="block text-xs font-medium text-[#e2e8f0] mb-2">
                Date Issued <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dateIssued}
                onChange={(e) => setDateIssued(e.target.value)}
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-sm rounded-xl px-4 py-3 outline-none transition-colors font-sans"
              />
            </div>

            {/* Course Duration */}
            <div>
              <label className="block text-xs font-medium text-[#e2e8f0] mb-2">
                Course Duration <span className="text-[10px] text-[#c4c7c8] font-light">(Optional)</span>
              </label>
              <input
                type="text"
                value={courseDuration}
                onChange={(e) => setCourseDuration(e.target.value)}
                placeholder="e.g. 3 Months, 6 Months"
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-sm rounded-xl px-4 py-3 outline-none transition-colors"
              />
            </div>

            {/* Certificate Type */}
            <div>
              <label className="block text-xs font-medium text-[#e2e8f0] mb-2">
                Certificate Type <span className="text-[10px] text-[#c4c7c8] font-light">(Optional)</span>
              </label>
              <select
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-sm rounded-xl px-4 py-3 outline-none transition-colors"
              >
                {CERTIFICATE_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[#181524] text-white">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-xs font-medium text-[#e2e8f0] mb-2">
                Student ID <span className="text-[10px] text-[#c4c7c8] font-light">(Optional)</span>
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. OS-2026-0182"
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-sm rounded-xl px-4 py-3 outline-none transition-colors font-mono"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-medium text-[#e2e8f0] mb-2">
                Additional Notes / Honors <span className="text-[10px] text-[#c4c7c8] font-light">(Optional)</span>
              </label>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Graduated with Distinction in Web & Cloud Engineering"
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-sm rounded-xl px-4 py-3 outline-none transition-colors"
              />
            </div>

          </div>
        </div>

        {/* Section 2: Certificate Document Upload */}
        <div className="space-y-4">
          <div className="pb-3 border-b border-[#332d47] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[#a855f7]" />
              <h2 className="text-sm font-semibold text-[#ffffff] uppercase tracking-wider font-mono">
                2. Certificate Document Upload <span className="text-[10px] text-[#c4c7c8] font-light lowercase">(Optional)</span>
              </h2>
            </div>
            <span className="text-[11px] text-[#c4c7c8]">PDF, PNG, JPG (Max 10MB)</span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
          />

          {!uploadedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#a855f7] bg-[#1f1b2e]'
                  : 'border-[#332d47] hover:border-[#a855f7] bg-[#100e17]/50 hover:bg-[#100e17]'
              }`}
            >
              <UploadCloud className="w-10 h-10 text-[#a855f7] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#ffffff]">
                Drag your certificate here or <span className="text-[#c084fc] underline">click to browse</span>
              </p>
              <p className="text-xs text-[#c4c7c8] font-light mt-1">
                Upload the official signed certificate file for admin archives and authorization verification.
              </p>
            </div>
          ) : (
            <div className="bg-[#100e17] p-5 rounded-2xl border border-[#332d47] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center text-[#a855f7] shrink-0">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-semibold text-[#ffffff] truncate font-mono">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-[11px] text-[#c4c7c8] flex items-center gap-2">
                    <span>{uploadedFile.file.type || 'Document'}</span>
                    <span>•</span>
                    <span>{formatFileSize(uploadedFile.file.size)}</span>
                  </p>

                  {/* Progress bar */}
                  {uploadedFile.progress < 100 && (
                    <div className="w-36 h-1.5 bg-[#1f1b2e] rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-[#a855f7] transition-all duration-150"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#1f1b2e] border border-[#332d47] text-xs text-[#c084fc] hover:text-[#ffffff] transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg bg-[#1f1b2e] border border-[#332d47] text-rose-400 hover:text-rose-300 transition-colors"
                  title="Remove File"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Toolbar */}
        <div className="pt-6 border-t border-[#332d47] flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="py-3 px-6 rounded-full bg-[#100e17] hover:bg-[#1f1b2e] border border-[#332d47] text-xs font-semibold text-[#c4c7c8] transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn-purple py-3.5 px-8 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-2.5 shadow-xl transition-all disabled:opacity-60 min-h-[48px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating Certificate Link...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Generate Authentication Link</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
