import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Save, 
  User, 
  BookOpen, 
  Hash, 
  Calendar, 
  Clock, 
  Award, 
  FileText, 
  UploadCloud, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  AlertOctagon,
  Edit3
} from 'lucide-react';
import { 
  CertificateRecord, 
  updateCertificateAsync, 
  CertificateUpdateInput 
} from '../../services/certificateService';
import { playSound } from '../../utils/soundEffects';

const POPULAR_COURSES = [
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

interface EditCertificateModalProps {
  certificate: CertificateRecord;
  onClose: () => void;
  onUpdated: (updatedCert: CertificateRecord) => void;
}

export const EditCertificateModal: React.FC<EditCertificateModalProps> = ({
  certificate,
  onClose,
  onUpdated
}) => {
  // Check if course is standard or custom
  const isKnownCourse = POPULAR_COURSES.includes(certificate.course);

  // Form State initialized from certificate
  const [studentName, setStudentName] = useState(certificate.studentName);
  const [selectedCourse, setSelectedCourse] = useState(isKnownCourse ? certificate.course : 'Other');
  const [customCourse, setCustomCourse] = useState(isKnownCourse ? '' : certificate.course);
  const [certificateNumber, setCertificateNumber] = useState(certificate.certificateNumber || '');
  const [dateIssued, setDateIssued] = useState(certificate.dateIssued || '');
  const [courseDuration, setCourseDuration] = useState(certificate.courseDuration || '3 Months');
  const [certificateType, setCertificateType] = useState(certificate.certificateType || 'Professional Certificate');
  const [studentId, setStudentId] = useState(certificate.studentId || '');
  const [status, setStatus] = useState<'valid' | 'revoked'>(certificate.status);
  const [additionalNotes, setAdditionalNotes] = useState(certificate.additionalNotes || '');

  // File replacement state
  const [existingFileName, setExistingFileName] = useState<string | undefined>(certificate.fileName);
  const [existingDocumentUrl, setExistingDocumentUrl] = useState<string | undefined>(certificate.documentUrl);
  const [newUploadedFile, setNewUploadedFile] = useState<{
    file: File;
    previewUrl?: string;
    progress: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClose = () => {
    playSound('release');
    onClose();
  };

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
      setErrorMsg('File size exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Unsupported file type. Please upload a PDF, PNG, JPG, or JPEG file.');
      return;
    }

    playSound('page');
    setErrorMsg(null);

    setNewUploadedFile({ file, progress: 20 });
    let p = 20;
    const interval = setInterval(() => {
      p += 25;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
      }
      setNewUploadedFile(prev => prev ? { ...prev, progress: p } : null);
    }, 100);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewUploadedFile(prev => prev ? { ...prev, previewUrl: e.target?.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveExistingFile = () => {
    playSound('trash');
    setExistingFileName(undefined);
    setExistingDocumentUrl(undefined);
  };

  const handleRemoveNewFile = () => {
    playSound('trash');
    setNewUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!studentName.trim()) {
      setErrorMsg('Student name is required.');
      return;
    }

    const finalCourse = selectedCourse === 'Other' ? customCourse.trim() : selectedCourse;
    if (!finalCourse) {
      setErrorMsg('Please specify the course name.');
      return;
    }

    setLoading(true);

    const updates: CertificateUpdateInput = {
      studentName: studentName.trim(),
      course: finalCourse,
      certificateNumber: certificateNumber.trim() || undefined,
      dateIssued: dateIssued || new Date().toISOString().split('T')[0],
      courseDuration: courseDuration.trim() || '3 Months',
      certificateType: certificateType.trim() || 'Professional Certificate',
      studentId: studentId.trim() || undefined,
      status,
      additionalNotes: additionalNotes.trim() || undefined
    };

    if (newUploadedFile) {
      updates.fileName = newUploadedFile.file.name;
      updates.fileSize = newUploadedFile.file.size;
      updates.fileType = newUploadedFile.file.type;
      updates.documentUrl = newUploadedFile.previewUrl || existingDocumentUrl;
    } else if (!existingFileName) {
      updates.fileName = undefined;
      updates.fileSize = undefined;
      updates.fileType = undefined;
      updates.documentUrl = undefined;
    }

    try {
      const result = await updateCertificateAsync(certificate.id, updates);
      if (!result.success && result.error) {
        setErrorMsg(result.error);
        setLoading(false);
        return;
      }

      playSound('success');
      setLoading(false);
      if (result.certificate) {
        onUpdated(result.certificate);
      }
      onClose();
    } catch (err: any) {
      console.error('Update certificate error:', err);
      setErrorMsg(err?.message || 'Failed to save certificate updates.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#181524] border border-[#332d47] rounded-[24px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-xs"
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-[#c4c7c8] hover:text-[#ffffff] rounded-xl bg-[#1f1b2e] border border-[#332d47] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center text-[#a855f7]">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif text-[#ffffff] font-normal">Edit Certificate</h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-[#c084fc] font-mono text-[10px]">
                {certificate.id}
              </span>
            </div>
            <p className="text-xs text-[#c4c7c8] font-light mt-0.5">
              Make corrections to student information, course track, dates, or documentation.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-xs">{errorMsg}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Student Full Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-semibold text-[#ffffff] uppercase font-mono tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#a855f7]" />
                Student Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-sm rounded-xl px-4 py-2.5 transition-colors outline-none font-sans"
              />
            </div>

            {/* Course Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#ffffff] uppercase font-mono tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#a855f7]" />
                Course / Track <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-xs rounded-xl px-3 py-2.5 transition-colors outline-none cursor-pointer"
              >
                {POPULAR_COURSES.map((c) => (
                  <option key={c} value={c} className="bg-[#181524] text-[#ffffff]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Course Name (if Other) */}
            {selectedCourse === 'Other' ? (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#ffffff] uppercase font-mono tracking-wider">
                  Custom Course Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customCourse}
                  onChange={(e) => setCustomCourse(e.target.value)}
                  placeholder="e.g. AI Prompt Engineering"
                  className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-xs rounded-xl px-3 py-2.5 transition-colors outline-none"
                />
              </div>
            ) : (
              /* Certificate Type */
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#ffffff] uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#a855f7]" />
                  Certificate Type
                </label>
                <select
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value)}
                  className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-xs rounded-xl px-3 py-2.5 transition-colors outline-none cursor-pointer"
                >
                  {CERTIFICATE_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#181524] text-[#ffffff]">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Certificate Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#ffffff] uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#a855f7]" />
                Certificate Number
              </label>
              <input
                type="text"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                placeholder="e.g. ORB/2026/FS-0182"
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-xs font-mono rounded-xl px-3 py-2.5 transition-colors outline-none"
              />
            </div>

            {/* Date Issued */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#ffffff] uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#a855f7]" />
                Date Issued <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dateIssued}
                onChange={(e) => setDateIssued(e.target.value)}
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-xs rounded-xl px-3 py-2.5 transition-colors outline-none"
              />
            </div>

            {/* Course Duration */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#ffffff] uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#a855f7]" />
                Course Duration
              </label>
              <input
                type="text"
                value={courseDuration}
                onChange={(e) => setCourseDuration(e.target.value)}
                placeholder="e.g. 3 Months, 6 Months"
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-xs rounded-xl px-3 py-2.5 transition-colors outline-none"
              />
            </div>

            {/* Student ID / Registration No */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#ffffff] uppercase font-mono tracking-wider">
                Student ID / Reg No.
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. OS-2026-0042"
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-xs font-mono rounded-xl px-3 py-2.5 transition-colors outline-none"
              />
            </div>

            {/* Status (Valid vs Revoked) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-semibold text-[#ffffff] uppercase font-mono tracking-wider flex items-center gap-1.5">
                Record Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('valid')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-semibold ${
                    status === 'valid'
                      ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 ring-1 ring-emerald-500'
                      : 'bg-[#100e17] border-[#332d47] text-[#c4c7c8] hover:text-emerald-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Valid & Authenticated</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('revoked')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-semibold ${
                    status === 'revoked'
                      ? 'bg-rose-950/60 border-rose-700 text-rose-300 ring-1 ring-rose-500'
                      : 'bg-[#100e17] border-[#332d47] text-[#c4c7c8] hover:text-rose-400'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span>Revoked</span>
                </button>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-semibold text-[#ffffff] uppercase font-mono tracking-wider">
                Additional Notes / Honors / Specialization
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Graduated with Distinction in UI/UX Design."
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-xs rounded-xl p-3 transition-colors outline-none resize-none font-sans"
              />
            </div>

            {/* Document / PDF Attachment Section */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-semibold text-[#ffffff] uppercase font-mono tracking-wider flex items-center justify-between">
                <span>Certificate Document Attachment</span>
                <span className="text-[10px] text-[#c4c7c8] font-normal">Optional (Max 10MB)</span>
              </label>

              {/* Display existing file if present */}
              {existingFileName && !newUploadedFile && (
                <div className="bg-[#100e17] p-3 rounded-xl border border-[#332d47] flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <FileText className="w-4 h-4 text-[#a855f7] shrink-0" />
                    <div className="truncate">
                      <span className="text-xs text-[#ffffff] font-mono block truncate">{existingFileName}</span>
                      <span className="text-[10px] text-[#c4c7c8]">Current Attached File</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveExistingFile}
                    className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 hover:bg-rose-900/60 transition-colors"
                    title="Remove attached file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Display new replacement file if uploaded */}
              {newUploadedFile && (
                <div className="bg-[#100e17] p-3 rounded-xl border border-purple-500/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <span className="text-xs text-[#ffffff] font-mono block truncate">{newUploadedFile.file.name}</span>
                      <span className="text-[10px] text-emerald-400">New Replacement File ({(newUploadedFile.file.size / 1024).toFixed(0)} KB)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveNewFile}
                    className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 hover:bg-rose-900/60 transition-colors"
                    title="Remove uploaded file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Upload area */}
              {!newUploadedFile && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#a855f7] bg-[#a855f7]/10'
                      : 'border-[#332d47] hover:border-[#a855f7] bg-[#100e17]/50 hover:bg-[#100e17]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs text-[#c4c7c8]">
                    <UploadCloud className="w-4 h-4 text-[#a855f7]" />
                    <span>{existingFileName ? 'Click or drop to replace attached document' : 'Click or drop PDF / Image certificate file'}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Modal Actions */}
          <div className="pt-5 border-t border-[#332d47] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="py-2.5 px-5 rounded-full bg-[#100e17] hover:bg-[#1f1b2e] border border-[#332d47] text-xs font-semibold text-[#c4c7c8] hover:text-[#ffffff] transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 rounded-full btn-purple text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-950/50 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
};
