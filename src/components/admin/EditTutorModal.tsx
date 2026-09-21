import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, User, Mail, Phone, BookOpen, Briefcase, Save, AlertCircle, CheckCircle2, Upload, Image as ImageIcon, Trash2, Link as LinkIcon } from 'lucide-react';
import { TutorProfile, TutorService } from '../../services/tutorService';
import { isAdminAuthenticated } from '../../services/certificateService';
import { playSound } from '../../utils/soundEffects';

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
  const [programsStr, setProgramsStr] = useState(tutor.programs.join(', '));
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

    if (!isAdminAuthenticated()) {
      setError('Access Denied: Only Orbit Space Administrators can edit tutor details.');
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
      const parsedPrograms = programsStr
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);

      const parsedQualifications = qualificationsStr
        .split(',')
        .map(q => q.trim())
        .filter(Boolean);

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
        programs: parsedPrograms.length > 0 ? parsedPrograms : tutor.programs,
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
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300">
              Assigned Programs / Tracks (Comma-separated)
            </label>
            <input
              type="text"
              value={programsStr}
              onChange={(e) => setProgramsStr(e.target.value)}
              placeholder="e.g. Front End Development, Web Development"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
            />
            <p className="text-[10px] text-neutral-500">
              Issued certificates and enrolled students in these tracks will automatically link to this faculty profile.
            </p>
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
    </div>
  );
};
