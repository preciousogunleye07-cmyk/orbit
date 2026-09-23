import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  UserPlus, 
  Check, 
  Upload, 
  BookOpen, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Award, 
  Sparkles, 
  Briefcase,
  AlertCircle,
  Plus
} from 'lucide-react';
import { TutorProfile, TutorService } from '../../services/tutorService';
import { ProgramService } from '../../services/programService';
import { playSound } from '../../utils/soundEffects';

interface CreateMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newMentor: TutorProfile) => void;
}

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

const CreateMentorModalContent: React.FC<CreateMentorModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const [fullName, setFullName] = useState('');
  const [shortName, setShortName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [expertise, setExpertise] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [status, setStatus] = useState<'active' | 'deactivated'>('active');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [color, setColor] = useState('#a855f7');
  
  const [accountUsername, setAccountUsername] = useState('');
  const [initialPassword, setInitialPassword] = useState('OrbitTeacher2026!');

  const [customCourseInput, setCustomCourseInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    setSelectedCourses(prev => {
      const next = prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course];
      playSound('pop');
      return next;
    });
  };

  const handleAddProgramFromDropdown = (programName: string) => {
    if (!programName) return;
    if (!selectedCourses.includes(programName)) {
      setSelectedCourses(prev => [...prev, programName]);
      playSound('pop');
    }
  };

  const handleRemoveCourse = (course: string) => {
    setSelectedCourses(prev => prev.filter(c => c !== course));
    playSound('pop');
  };

  const handleAddCustomCourse = () => {
    const trimmed = customCourseInput.trim();
    if (trimmed && !selectedCourses.includes(trimmed)) {
      setSelectedCourses(prev => [...prev, trimmed]);
      setCustomCourseInput('');
      playSound('pop');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = fullName.trim();
    if (!cleanName) {
      setErrorMsg('Full name is required.');
      return;
    }

    if (selectedCourses.length === 0) {
      setErrorMsg('Please select at least one course taught by this mentor.');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedShortName = shortName.trim() || cleanName.split(' ')[0];
      const cleanSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const newMentorData = {
        name: cleanName,
        shortName: generatedShortName,
        role: title.trim() || 'Faculty Mentor & Instructor',
        specialization: expertise.trim() || selectedCourses.join(', '),
        programs: selectedCourses,
        bio: bio.trim(),
        email: email.trim(),
        phone: phone.trim(),
        linkedinUrl: linkedinUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        photoUrl: photoUrl.trim() || undefined,
        status: status,
        verificationStatus: 'verified' as const,
        joinedDate: new Date().toISOString().split('T')[0],
        color: color,
        slug: cleanSlug,
        account: {
          hasAccount: true,
          username: accountUsername.trim() || email.trim() || cleanSlug,
          initialPassword: initialPassword.trim() || 'OrbitTeacher2026!',
          accountStatus: status
        }
      };

      const created = await TutorService.createTutor(newMentorData);
      playSound('sparkle');
      onCreated(created);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create mentor profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0b14]/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#141120] border border-[#2e2842] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#231e33] flex items-center justify-between bg-[#181427]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add New Faculty Mentor</h2>
              <p className="text-xs text-[#9d98af]">
                Create a unified mentor profile that connects across multiple courses, timetable sessions, and verified certificates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#201a33] text-[#9d98af] hover:text-white hover:bg-[#2d2547] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo & Basic Identity */}
          <div className="p-4 rounded-2xl bg-[#1a1628] border border-[#2a243e] space-y-4">
            <h3 className="font-semibold text-white uppercase tracking-wider text-[11px] text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Profile Identity & Photo</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Photo Preview & Upload */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-[#231e33] border-2 border-dashed border-[#443b60] flex items-center justify-center overflow-hidden relative">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-2xl font-bold text-purple-400">
                      {fullName ? fullName.charAt(0).toUpperCase() : 'M'}
                    </span>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-lg transition-transform active:scale-95">
                  <Upload className="w-3 h-3" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="flex-1 w-full space-y-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#c4c0d4] mb-1">
                    Photo URL (Direct web link or upload via button)
                  </label>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or uploaded data"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white placeholder-[#686278] focus:outline-none focus:border-purple-500"
                  />
                </div>
                <p className="text-[10px] text-[#8e8a9f]">
                  Tip: The mentor's photo automatically displays on their LinkedIn shareable verification profile and course detail modals.
                </p>
              </div>
            </div>

            {/* Name, Short Name & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-[#c4c0d4] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe, Engr. Fatima Bello"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white placeholder-[#686278] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#c4c0d4] mb-1">
                  Short / First Name
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. John"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white placeholder-[#686278] focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#c4c0d4] mb-1">
                  Professional Title / Role
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior UI/UX Instructor & Design Lead"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white placeholder-[#686278] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#c4c0d4] mb-1">
                  Profile Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="active">Active Mentor (Visible in catalogs)</option>
                  <option value="deactivated">Deactivated (Archived)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#c4c0d4] mb-1">
                Bio & Background Summary
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief professional biography, years of industry experience, and mentorship philosophy..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white placeholder-[#686278] focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Assigned Academy Programs (Dropdown Multi-Select) */}
          <div className="p-4 rounded-2xl bg-[#1a1628] border border-[#2a243e] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white uppercase tracking-wider text-[11px] text-purple-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Assigned Academy Programs (Multi-Program) *</span>
                </h3>
                <p className="text-[10px] text-[#9d98af] mt-0.5">
                  Select available programs from the dropdown menu. A tutor can teach more than 1 program across the academy.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-900/60 border border-purple-700/60 text-purple-200 font-mono text-[11px] font-semibold">
                {selectedCourses.length} {selectedCourses.length === 1 ? 'Program' : 'Programs'} Selected
              </span>
            </div>

            {/* Select Dropdown Menu of Available Programs */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-[#c4c0d4]">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#120f1c] border border-purple-500/50 text-white focus:outline-none focus:border-purple-400 text-xs cursor-pointer shadow-inner pr-8"
                >
                  <option value="">▼ Click to select and add an available program...</option>
                  {allAvailablePrograms.map((course) => (
                    <option key={course} value={course} className="bg-[#120f1c] text-white py-1">
                      {selectedCourses.includes(course) ? `✓ ${course} (Already Selected)` : `+ Add: ${course}`}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-[#8e8a9f]">
                Select any program to immediately assign it to this tutor. Repeat to assign multiple programs.
              </p>
            </div>

            {/* Currently Selected Programs (Removable Badges) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase text-[#9d98af] block">
                Assigned Programs ({selectedCourses.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-[#120f1c] border border-[#2d2642]">
                {selectedCourses.map((prog) => (
                  <span
                    key={prog}
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
                {selectedCourses.length === 0 && (
                  <span className="text-xs text-amber-400/90 font-mono flex items-center gap-1.5 py-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>No programs selected yet. Choose one or more programs from the dropdown above.</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Toggle Available Tracks */}
            <div className="space-y-2 pt-2 border-t border-[#2a243e]">
              <span className="text-[10px] font-mono uppercase text-[#9d98af] block">
                Quick Toggle Academy Tracks:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {allAvailablePrograms.map((course) => {
                  const isSelected = selectedCourses.includes(course);
                  return (
                    <button
                      key={course}
                      type="button"
                      onClick={() => handleToggleCourse(course)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/70 border-purple-500/70 text-white shadow-sm'
                          : 'bg-[#120f1c] border-[#2f2742] text-[#c4c0d4] hover:border-purple-500/40 hover:text-white'
                      }`}
                    >
                      <span className="font-medium text-[11px] pr-2 truncate">{course}</span>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'border-[#443b60] bg-[#1a1628]'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Course / Program Addition */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#2a243e]">
              <input
                type="text"
                value={customCourseInput}
                onChange={(e) => setCustomCourseInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomCourse();
                  }
                }}
                placeholder="Or type a custom specialized program name..."
                className="flex-1 px-3.5 py-1.5 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white placeholder-[#686278] focus:outline-none focus:border-purple-500 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomCourse}
                className="px-3.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 hover:text-white transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Track</span>
              </button>
            </div>
          </div>

          {/* Contact & Professional Links */}
          <div className="p-4 rounded-2xl bg-[#1a1628] border border-[#2a243e] space-y-3">
            <h3 className="font-semibold text-white uppercase tracking-wider text-[11px] text-purple-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Contact Info & Professional Links</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#c4c0d4] mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#9d98af]" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mentor@orbitspace.academy"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white placeholder-[#686278] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#c4c0d4] mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#9d98af]" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 812 345 6789"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white placeholder-[#686278] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#c4c0d4] mb-1 flex items-center gap-1">
                  <Linkedin className="w-3 h-3 text-[#9d98af]" />
                  <span>LinkedIn Profile URL</span>
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white placeholder-[#686278] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#c4c0d4] mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#9d98af]" />
                  <span>Portfolio / Personal Website</span>
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://johndoe.design"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white placeholder-[#686278] focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#c4c0d4] mb-1">
                Areas of Expertise (Comma separated)
              </label>
              <input
                type="text"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="e.g. Design Systems, Figma, Wireframing, User Research, Interaction Design"
                className="w-full px-3.5 py-2 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white placeholder-[#686278] focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Teacher Account & Login Credentials (Admin Controlled) */}
          <div className="p-4 rounded-2xl bg-[#1a1628] border border-[#2a243e] space-y-3">
            <h3 className="font-semibold text-white uppercase tracking-wider text-[11px] text-purple-300 flex items-center gap-1.5">
              <span>Teacher Login Credentials & Access Setup</span>
            </h3>
            <p className="text-[11px] text-[#9d98af]">
              Set the teacher's initial account access. Mentors can view their assigned courses, students, and supervised projects.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#c4c0d4] mb-1">
                  Login Identifier (Username / Email)
                </label>
                <input
                  type="text"
                  value={accountUsername}
                  onChange={(e) => setAccountUsername(e.target.value)}
                  placeholder={email || "teacher@orbitspace.academy"}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white placeholder-[#686278] focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#c4c0d4] mb-1">
                  Initial Password
                </label>
                <input
                  type="text"
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  placeholder="OrbitTeacher2026!"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120f1c] border border-[#342d4a] text-white placeholder-[#686278] focus:outline-none focus:border-purple-500 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-[#231e33] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#201a33] hover:bg-[#2d2547] text-[#c4c0d4] hover:text-white font-medium transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center gap-2 shadow-lg shadow-purple-950/50 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Profile...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Mentor Profile</span>
                </>
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export const CreateMentorModal: React.FC<CreateMentorModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <CreateMentorModalContent {...props} />;
};

