import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Briefcase, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Clock, 
  Plus, 
  Check, 
  Lock, 
  Key, 
  Users, 
  Award, 
  FolderGit2, 
  ShieldCheck,
  UserCheck,
  UserX
} from 'lucide-react';
import { TutorProfile, TutorService, ComputedTutorStats } from '../../services/tutorService';
import { ProgramService } from '../../services/programService';
import { isAdminAuthenticated } from '../../services/certificateService';
import { isSubAdminAuthenticated } from '../../services/subAdminService';
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

const EditTutorModalContent: React.FC<{
  tutor: TutorProfile;
  isOpen: boolean;
  onClose: () => void;
  onTutorUpdated: (tutor: TutorProfile) => void;
}> = ({
  tutor,
  isOpen,
  onClose,
  onTutorUpdated,
}) => {
  const [name, setName] = useState(tutor.name);
  const [shortName, setShortName] = useState(tutor.shortName || tutor.name.split(' ')[0]);
  const [email, setEmail] = useState(tutor.email);
  const [phone, setPhone] = useState(tutor.phone || '');
  const [photoUrl, setPhotoUrl] = useState(tutor.photoUrl || '');
  const [specialization, setSpecialization] = useState(tutor.specialization);
  const [role, setRole] = useState(tutor.role);
  const [bio, setBio] = useState(tutor.bio || '');
  const [linkedinUrl, setLinkedinUrl] = useState(tutor.linkedinUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(tutor.portfolioUrl || '');
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(tutor.programs || []);
  const [customProgramInput, setCustomProgramInput] = useState('');
  
  // Dynamic computed stats (strictly read-only)
  const [computedStats, setComputedStats] = useState<ComputedTutorStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Account credentials management
  const [accountStatus, setAccountStatus] = useState<'active' | 'deactivated'>(
    tutor.account?.accountStatus === 'deactivated' || tutor.status === 'deactivated' ? 'deactivated' : 'active'
  );
  const [accountUsername, setAccountUsername] = useState(tutor.account?.username || tutor.email);
  const [newPassword, setNewPassword] = useState('');
  const [resetPassSuccess, setResetPassSuccess] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    setLoadingStats(true);
    TutorService.getComputedTutorStats(tutor.id)
      .then((stats) => {
        if (isMounted) {
          setComputedStats(stats);
          setLoadingStats(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load computed stats:', err);
        if (isMounted) setLoadingStats(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tutor.id]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
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

  // Dynamic available programs from ProgramService catalog + courses
  const allAvailablePrograms = useMemo(() => {
    try {
      const catalog = ProgramService.getAllPrograms().map(p => p.title);
      const combined = Array.from(new Set([...catalog, ...AVAILABLE_COURSES]));
      return combined.sort((a, b) => a.localeCompare(b));
    } catch {
      return AVAILABLE_COURSES;
    }
  }, []);

  const handleToggleCourse = (course: string) => {
    setSelectedPrograms(prev => {
      const next = prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course];
      playSound('pop');
      return next;
    });
  };

  const handleAddProgramFromDropdown = (programName: string) => {
    if (!programName) return;
    if (!selectedPrograms.includes(programName)) {
      setSelectedPrograms(prev => [...prev, programName]);
      playSound('pop');
    }
  };

  const handleRemoveCourse = (course: string) => {
    setSelectedPrograms(prev => prev.filter(c => c !== course));
    playSound('pop');
  };

  const handleAddCustomCourse = () => {
    const trimmed = customProgramInput.trim();
    if (!trimmed) return;
    if (!selectedPrograms.includes(trimmed)) {
      setSelectedPrograms(prev => [...prev, trimmed]);
    }
    setCustomProgramInput('');
    playSound('pop');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAdminAuthenticated() && !isSubAdminAuthenticated()) {
      setError('Access Denied: Only Orbit Space Administrators can edit teacher details.');
      playSound('error');
      return;
    }

    if (!name.trim()) {
      setError('Teacher full name is required.');
      return;
    }

    if (!shortName.trim()) {
      setError('Short display name is required.');
      return;
    }

    setIsSaving(true);
    playSound('click');

    try {
      const finalPrograms = selectedPrograms.map(p => p.trim()).filter(Boolean);

      // Assemble updated tutor profile with updated credentials
      const updatedAccount = {
        hasAccount: true,
        username: accountUsername.trim() || email.trim(),
        initialPassword: newPassword.trim() ? newPassword.trim() : (tutor.account?.initialPassword || 'OrbitTeacher2026!'),
        accountStatus: accountStatus,
        lastLoginAt: tutor.account?.lastLoginAt
      };

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
        portfolioUrl: portfolioUrl.trim() || undefined,
        programs: finalPrograms,
        status: accountStatus === 'deactivated' ? 'deactivated' : 'active',
        account: updatedAccount
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
        className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 my-8 text-neutral-200 max-h-[90vh] overflow-y-auto"
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
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Edit Teacher Profile</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  accountStatus === 'deactivated' 
                    ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' 
                    : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                }`}>
                  {accountStatus === 'deactivated' ? 'DEACTIVATED' : 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Administer faculty credentials, account access, and multi-course assignments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
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
            <span>Teacher profile and credentials updated across the platform!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Dynamic Statistics Display (Strictly Read-Only from Actual Records) */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-semibold text-white">
                  Dynamic Faculty Statistics (System Derived)
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-md">
                <Lock className="w-3 h-3 text-purple-400" />
                <span>Read-Only Source of Truth</span>
              </span>
            </div>
            
            <p className="text-[11px] text-neutral-400 leading-tight">
              Statistics are calculated automatically from attendance logs, student enrollments, verified capstones, and certificates. Manual override is disabled to prevent inconsistent records.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Students Taught</span>
                <span className="text-base font-bold text-white">
                  {loadingStats ? '...' : (computedStats?.totalStudentsTaught ?? 0)}
                </span>
                <span className="text-[9px] text-cyan-400 block mt-0.5">Active course enrolments</span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Supervised Projects</span>
                <span className="text-base font-bold text-white">
                  {loadingStats ? '...' : (computedStats?.totalProjectsSupervised ?? 0)}
                </span>
                <span className="text-[9px] text-amber-400 block mt-0.5">Verified capstones</span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Certifications</span>
                <span className="text-base font-bold text-white">
                  {loadingStats ? '...' : (computedStats?.totalStudentsCertified ?? 0)}
                </span>
                <span className="text-[9px] text-purple-400 block mt-0.5">Student certificates</span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Publications</span>
                <span className="text-base font-bold text-white">
                  {loadingStats ? '...' : (computedStats?.articlesSupervisedCount ?? 0)}
                </span>
                <span className="text-[9px] text-emerald-400 block mt-0.5">Authored articles</span>
              </div>
            </div>
          </div>

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
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove photo
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl bg-neutral-900 border-2 border-dashed border-neutral-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl font-bold text-neutral-600">
                    {shortName ? shortName.charAt(0) : 'T'}
                  </span>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition ${
                    isDragging
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50'
                  }`}
                >
                  <Upload className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <p className="text-xs text-neutral-300 font-medium">Click to upload photo or drag & drop</p>
                  <p className="text-[10px] text-neutral-500">PNG, JPG, WebP up to 4MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Or paste direct image URL (https://...)"
                    className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account & Authentication Control Section */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Key className="w-4 h-4 text-purple-400" />
                Teacher Login Account & Permissions
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">
                Last Login: {tutor.account?.lastLoginAt ? new Date(tutor.account.lastLoginAt).toLocaleDateString() : 'Never'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">
                  Account Status
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountStatus('active')}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                      accountStatus === 'active'
                        ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Active Access</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountStatus('deactivated')}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                      accountStatus === 'deactivated'
                        ? 'bg-amber-950/80 border-amber-600 text-amber-300 shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Deactivated</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">
                  Login Identifier (Username/Email)
                </label>
                <input
                  type="text"
                  value={accountUsername}
                  onChange={(e) => setAccountUsername(e.target.value)}
                  placeholder="teacher@orbitspace.academy"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">
                  Reset Password (Leave blank to keep existing password)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new teacher password..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setNewPassword('OrbitTeacher2026!')}
                    className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800/40 text-purple-300 text-xs font-semibold whitespace-nowrap cursor-pointer transition"
                    title="Set to standard default faculty password"
                  >
                    Default (OrbitTeacher2026!)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Core Profile Fields */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <User className="w-4 h-4 text-purple-400" />
              Teacher Core Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">Short Display Name *</label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. John"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mentor@orbitspace.academy"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 812 345 6789"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">Designation / Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Instructor"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. React, TypeScript, Next.js"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">Portfolio Website</label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://johndoe.design"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">Biography</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Professional summary, years of practical experience, mentorship ethos..."
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Multi-Course / Subject Assignment */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Assigned Academy Programs ({selectedPrograms.length})
                </h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Select available programs from the dropdown menu. A tutor can teach more than 1 program across the academy.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-900/60 border border-purple-700/60 text-purple-200 font-mono text-[11px] font-semibold">
                {selectedPrograms.length} {selectedPrograms.length === 1 ? 'Program' : 'Programs'} Assigned
              </span>
            </div>

            {/* Select Dropdown Menu of Available Programs */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-neutral-300">
                Select Dropdown Menu of Available Programs:
              </label>
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddProgramFromDropdown(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-purple-500/50 text-white focus:outline-none focus:border-purple-400 text-xs cursor-pointer shadow-inner pr-8"
                >
                  <option value="">▼ Click to select and assign an available program...</option>
                  {allAvailablePrograms.map((course) => (
                    <option key={course} value={course} className="bg-neutral-900 text-white py-1">
                      {selectedPrograms.includes(course) ? `✓ ${course} (Already Assigned)` : `+ Assign: ${course}`}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-neutral-400">
                Select any program to immediately assign it to this tutor. Repeat to assign multiple programs.
              </p>
            </div>

            {/* Selected Courses Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Currently Assigned Programs ({selectedPrograms.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                {selectedPrograms.map((prog, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-600/60 text-purple-200 text-xs font-medium shadow-sm animate-fadeIn"
                  >
                    <span>{prog}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(prog)}
                      className="hover:text-rose-400 text-purple-400 transition cursor-pointer p-0.5 rounded-md hover:bg-rose-950/40"
                      title={`Remove ${prog}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedPrograms.length === 0 && (
                  <span className="text-xs text-amber-400/90 font-mono flex items-center gap-1.5 py-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>No programs currently assigned to this teacher. Select from the dropdown above.</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Toggle Available Academy Courses */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Quick Toggle Academy Tracks:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {allAvailablePrograms.map((course) => {
                  const isAssigned = selectedPrograms.includes(course);
                  return (
                    <button
                      key={course}
                      type="button"
                      onClick={() => handleToggleCourse(course)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        isAssigned
                          ? 'bg-purple-600 text-white font-semibold shadow-sm'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                      }`}
                    >
                      {isAssigned && <Check className="w-3 h-3" />}
                      <span>{course}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Course Add Input */}
            <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80">
              <input
                type="text"
                value={customProgramInput}
                onChange={(e) => setCustomProgramInput(e.target.value)}
                placeholder="Or type a custom specialized program name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomCourse();
                  }
                }}
                className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomCourse}
                className="px-3.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-800/60 text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3 h-3" />
                <span>Add Track</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-950/40 disabled:opacity-50 transition cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Teacher Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const EditTutorModal: React.FC<EditTutorModalProps> = ({
  tutor,
  isOpen,
  onClose,
  onTutorUpdated,
}) => {
  if (!isOpen || !tutor) return null;

  return (
    <EditTutorModalContent
      key={tutor.id}
      tutor={tutor}
      isOpen={isOpen}
      onClose={onClose}
      onTutorUpdated={onTutorUpdated}
    />
  );
};

