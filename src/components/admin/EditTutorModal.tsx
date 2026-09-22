import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, User, Mail, Phone, BookOpen, Briefcase, Save, AlertCircle, CheckCircle2, Upload, Image as ImageIcon, Trash2, Link as LinkIcon, Clock, Plus, Check } from 'lucide-react';
import { TutorProfile, TutorService } from '../../services/tutorService';
import { TeachingHoursLedgerService } from '../../services/teachingHoursLedgerService';
import { isAdminAuthenticated } from '../../services/certificateService';
import { isSubAdminAuthenticated } from '../../services/subAdminService';
import { AdminTeachingHoursLedgerModal } from './AdminTeachingHoursLedgerModal';
import { playSound } from '../../utils/soundEffects';

const AVAILABLE_COURSES = [
  'UI/UX Design & Product Design',
  'Graphics Design & Brand Identity',
  'Frontend Web Development',
  'Backend Web Development',
  'Fullstack Web Development',
  'Data Analysis & Business Intelligence',
  'Cybersecurity & Ethical Hacking',
  'Video Editing & Motion Graphics',
  'Content Creation & Digital Media',
  'AI Automation & Prompt Engineering',
  'Robotics & Hardware Engineering',
  'Statistics & Data Science',
  'Product Engineering'
];

interface EditTutorModalProps {
  tutor: TutorProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onTutorUpdated: (tutor: TutorProfile) => void;
}

export const EditTutorModal: React.FC<EditTutorModalProps> = ({
  tutor,
  isOpen,
  onClose,
  onTutorUpdated,
}) => {
  if (!isOpen || !tutor) return null;

  const [name, setName] = useState(tutor.name);
  const [shortName, setShortName] = useState(tutor.shortName || tutor.name.split(' ')[0]);
  const [email, setEmail] = useState(tutor.email);
  const [phone, setPhone] = useState(tutor.phone || '');
  const [photoUrl, setPhotoUrl] = useState(tutor.photoUrl || '');
  const [specialization, setSpecialization] = useState(tutor.specialization);
  const [role, setRole] = useState(tutor.role);
  const [bio, setBio] = useState(tutor.bio || '');
  const [linkedinUrl, setLinkedinUrl] = useState(tutor.linkedinUrl || '');
  const [qualificationsStr, setQualificationsStr] = useState((tutor.qualifications || []).join(', '));
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(tutor.programs || []);
  const [customProgramInput, setCustomProgramInput] = useState('');
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [teachingHours, setTeachingHours] = useState<number>(
    tutor.historicalBaseline?.historicalTeachingHours ?? tutor.baseTeachingHours ?? 0
  );
  const [studentsTaught, setStudentsTaught] = useState<number>(
    tutor.historicalBaseline?.historicalStudentsTaught ?? tutor.baseStudentsCount ?? 0
  );
  const [certifiedStudents, setCertifiedStudents] = useState<number>(
    tutor.historicalBaseline?.historicalStudentsCertified ?? 0
  );
  const [projectsSupervised, setProjectsSupervised] = useState<number>(
    tutor.historicalBaseline?.historicalProjectsSupervised ?? 0
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
      setError('Image file is too large. Please select an image under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPhotoUrl(result);
        setError(null);
        playSound('pop');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAdminAuthenticated() && !isSubAdminAuthenticated()) {
      setError('Access Denied: Only Orbit Space Administrators or authorized staff can edit tutor details.');
      playSound('error');
      return;
    }

    if (!name.trim()) {
      setError('Tutor full name is required.');
      return;
    }

    if (!shortName.trim()) {
      setError('Short display name is required.');
      return;
    }

    setIsSaving(true);
    playSound('click');

    try {
      const parsedQualifications = qualificationsStr
        .split(',')
        .map(q => q.trim())
        .filter(Boolean);

      const finalPrograms = selectedPrograms.map(p => p.trim()).filter(Boolean);

      const updated: TutorProfile = {
        ...tutor,
        name: name.trim(),
        shortName: shortName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
        specialization: specialization.trim(),
        role: role.trim(),
        bio: bio.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        qualifications: parsedQualifications.length > 0 ? parsedQualifications : undefined,
        programs: finalPrograms,
        historicalBaseline: {
          historicalTeachingHours: Number(teachingHours) || 0,
          historicalStudentsTaught: Number(studentsTaught) || 0,
          historicalStudentsCertified: Number(certifiedStudents) || 0,
          historicalProjectsSupervised: Number(projectsSupervised) || 0,
          historicalBaselineNote: 'Admin audited & configured',
          historicalAuditedBy: 'Academic Administration',
          historicalAuditDate: new Date().toISOString().split('T')[0]
        },
        baseTeachingHours: Number(teachingHours) || 0,
        baseStudentsCount: Number(studentsTaught) || 0
      };

      const result = await TutorService.updateTutor(updated, tutor.shortName);
      playSound('success');
      setSuccess(true);
      onTutorUpdated(result.tutor);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Failed to update tutor.');
      playSound('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 my-8 text-neutral-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-base shrink-0 overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                tutor.avatar || (shortName ? shortName.charAt(0) : 'T')
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Edit Faculty Mentor Profile</h2>
              <p className="text-xs text-neutral-400">
                Update verified faculty credentials, profile photo, and teaching assignments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Faculty profile and photo updated across the platform!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Option */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                Profile Picture (Faculty Avatar)
              </label>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove photo
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Photo Preview */}
              <div className="relative w-20 h-20 rounded-2xl bg-neutral-900 border-2 border-dashed border-neutral-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setError('Unable to load image from provided URL.')}
                  />
                ) : (
                  <div className="text-center p-2">
                    <User className="w-6 h-6 mx-auto text-neutral-500 mb-1" />
                    <span className="text-[10px] text-neutral-500 block font-mono">No Photo</span>
                  </div>
                )}
              </div>

              {/* Upload Dropzone & URL Input */}
              <div className="flex-1 w-full space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition flex items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                      : 'border-neutral-700 bg-neutral-900 hover:border-purple-500/50 hover:bg-neutral-850 text-neutral-300'
                  }`}
                >
                  <Upload className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-xs font-medium">
                    {isDragging ? 'Drop photo here...' : 'Click to browse or drag & drop photo'}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Or paste image URL (https://...)"
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none transition pr-7"
                  />
                  <LinkIcon className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-neutral-500">
              Supported formats: JPG, PNG, WebP (max 4MB). Shown on the public verification badge, certificate links, and timetable.
            </p>
          </div>

          {/* Full Name & Short Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">
                Full Display Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lawal (Senior Frontend Lead)"
                required
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">
                Short Name / Timetable Name *
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. Lawal, Olamide, Ayo"
                required
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
              <p className="text-[10px] text-neutral-500">Used on timetable slot headers & compact pills.</p>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tutor@orbitspace.academy"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>
          </div>

          {/* Professional Role & Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300">
              Professional Role / Academic Title
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Full Stack Lead, Lead Security Engineer"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
            />
          </div>

          {/* Specialization / Tech Stack */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300">
              Specialization & Focus Areas
            </label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. React, TypeScript, Modern UI Architectures"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
            />
          </div>

          {/* Bio for Verification Profile */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300">
              Faculty Biography
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of professional experience, mentorship philosophy, and achievements..."
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition resize-none"
            />
          </div>

          {/* LinkedIn Profile & Qualifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">
                Qualifications (Comma-separated)
              </label>
              <input
                type="text"
                value={qualificationsStr}
                onChange={(e) => setQualificationsStr(e.target.value)}
                placeholder="e.g. B.Sc Computer Science, AWS Certified"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>
          </div>

          {/* Programs / Classes Managed */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-semibold text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                Assigned Programs & Tracks ({selectedPrograms.length})
              </label>
              <span className="text-[10px] text-neutral-400">Click to toggle or add custom tracks</span>
            </div>

            {/* Currently Selected Badges */}
            {selectedPrograms.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedPrograms.map((prog) => (
                  <span
                    key={prog}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs font-medium"
                  >
                    <span>{prog}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPrograms((prev) => prev.filter((p) => p !== prog))}
                      className="text-purple-400 hover:text-white transition-colors cursor-pointer"
                      title={`Remove ${prog}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-400/80 flex items-center gap-1.5 py-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                No programs assigned yet. Select from available academy courses below.
              </p>
            )}

            {/* Available Course Quick-Toggle Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-neutral-400 block">Available Academy Programs:</span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {AVAILABLE_COURSES.map((course) => {
                  const isSelected = selectedPrograms.includes(course);
                  return (
                    <button
                      key={course}
                      type="button"
                      onClick={() => {
                        setSelectedPrograms((prev) =>
                          isSelected ? prev.filter((p) => p !== course) : [...prev, course]
                        );
                      }}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-900/30'
                          : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-neutral-500" />}
                      <span>{course}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Track Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customProgramInput}
                onChange={(e) => setCustomProgramInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const trimmed = customProgramInput.trim();
                    if (trimmed && !selectedPrograms.includes(trimmed)) {
                      setSelectedPrograms((prev) => [...prev, trimmed]);
                      setCustomProgramInput('');
                    }
                  }
                }}
                placeholder="Or type custom track name and press Enter..."
                className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none transition"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = customProgramInput.trim();
                  if (trimmed && !selectedPrograms.includes(trimmed)) {
                    setSelectedPrograms((prev) => [...prev, trimmed]);
                    setCustomProgramInput('');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Track</span>
              </button>
            </div>

            <p className="text-[10px] text-neutral-500">
              Students, attendance sessions, and certificates in these tracks automatically link to this mentor profile.
            </p>
          </div>

          {/* Verified Instructional Hours & Supervisory Records */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Teaching Hours, Students & Supervisory Baseline
                </h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  These audited baseline figures combine with live check-in logs and audited ledger adjustments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsLedgerModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-800/60 text-purple-300 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="View tripartite ledger, upload CSV, or make audited adjustments"
              >
                <Clock className="w-3 h-3 text-purple-400" />
                <span>Open Hours Ledger</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">Teaching Hours</label>
                <input
                  type="number"
                  min="0"
                  value={teachingHours}
                  onChange={(e) => setTeachingHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">Students Taught</label>
                <input
                  type="number"
                  min="0"
                  value={studentsTaught}
                  onChange={(e) => setStudentsTaught(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">Certified Students</label>
                <input
                  type="number"
                  min="0"
                  value={certifiedStudents}
                  onChange={(e) => setCertifiedStudents(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">Projects Supervised</label>
                <input
                  type="number"
                  min="0"
                  value={projectsSupervised}
                  onChange={(e) => setProjectsSupervised(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-900/30 transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save & Cascade All'}</span>
            </button>
          </div>
        </form>
      </motion.div>

      {/* Teaching Hours Ledger Modal */}
      <AdminTeachingHoursLedgerModal
        isOpen={isLedgerModalOpen}
        initialLecturerId={tutor.id}
        onClose={() => setIsLedgerModalOpen(false)}
        onUpdated={() => {
          // Re-fetch tutor stats or update baseline hours if needed
          const sum = TeachingHoursLedgerService.getLecturerLedgerSummary(tutor.id);
          if (sum.historicalHours > 0) {
            setTeachingHours(sum.historicalHours);
          }
        }}
      />
    </div>
  );
};
