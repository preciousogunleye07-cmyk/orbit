import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Upload,
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Link as LinkIcon,
  Globe,
  Linkedin,
  Github,
  Plus,
  X,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Layers
} from 'lucide-react';
import { TeacherSubmissionService, DEFAULT_AVAILABLE_COURSES } from '../../services/teacherSubmissionService';
import { playSound } from '../../utils/soundEffects';

interface TeacherSubmissionPageProps {
  courseSlug: string;
  token?: string;
  onNavigateHome?: () => void;
}

export const TeacherSubmissionPage: React.FC<TeacherSubmissionPageProps> = ({
  courseSlug,
  token,
  onNavigateHome
}) => {
  // Resolve course from slug/token
  const [resolvedCourse, setResolvedCourse] = useState<{ courseTitle: string; courseSlug: string }>({
    courseTitle: 'Academy Track',
    courseSlug: courseSlug || 'general'
  });

  useEffect(() => {
    const info = TeacherSubmissionService.resolveCourseFromSlug(courseSlug, token);
    setResolvedCourse({ courseTitle: info.courseTitle, courseSlug: info.courseSlug });
  }, [courseSlug, token]);

  // Form states
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('3–5 Years');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [projectHighlights, setProjectHighlights] = useState('');
  const [teachingStatement, setTeachingStatement] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-seed recommended skills based on course
  useEffect(() => {
    const c = resolvedCourse.courseTitle.toLowerCase();
    if (skills.length === 0) {
      if (c.includes('ui') || c.includes('ux') || c.includes('design')) {
        setSkills(['Figma', 'User Research', 'Design Systems', 'Prototyping', 'Wireframing']);
      } else if (c.includes('web') || c.includes('software') || c.includes('full-stack')) {
        setSkills(['React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind CSS', 'PostgreSQL']);
      } else if (c.includes('cyber') || c.includes('security')) {
        setSkills(['Network Security', 'Penetration Testing', 'SIEM', 'Ethical Hacking', 'Linux']);
      } else if (c.includes('data') || c.includes('anal')) {
        setSkills(['Python', 'Power BI', 'SQL', 'Tableau', 'Excel Analytics', 'Data Modeling']);
      } else if (c.includes('video') || c.includes('media')) {
        setSkills(['Adobe Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Color Grading']);
      }
    }
  }, [resolvedCourse.courseTitle]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setSkillInput('');
      playSound('pop');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
    playSound('pop');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please upload an image file (PNG, JPG, WebP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size must be under 5MB.');
        return;
      }
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
          playSound('droplet');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Professional title is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('A valid email address is required.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Phone / WhatsApp number is required.');
      return;
    }
    if (!bio.trim() || bio.trim().length < 30) {
      setErrorMessage('Please write a professional bio (at least 30 characters).');
      return;
    }

    setIsSubmitting(true);
    playSound('pulse');

    try {
      await TeacherSubmissionService.createSubmission({
        courseTitle: resolvedCourse.courseTitle,
        courseSlug: resolvedCourse.courseSlug,
        token: token || undefined,
        fullName: fullName.trim(),
        title: title.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        photoUrl: photoUrl.trim() || undefined,
        bio: bio.trim(),
        skills: skills.length > 0 ? skills : [resolvedCourse.courseTitle],
        experienceYears,
        portfolioUrl: portfolioUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        projectHighlights: projectHighlights.trim() || undefined,
        teachingStatement: teachingStatement.trim() || undefined
      });

      playSound('success');
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'Failed to submit profile. Please try again.');
      playSound('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0a17] text-white py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-8">
        {/* Navigation / Header Brand */}
        <div className="flex items-center justify-between border-b border-[#28213b] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40 text-white font-bold text-lg">
              Ω
            </div>
            <div>
              <span className="text-sm font-black tracking-widest uppercase text-white block">
                Orbit Space Academy
              </span>
              <span className="text-[11px] text-[#9d98af]">
                Faculty Recruitment &amp; Mentorship Submission
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-700/50 text-purple-300 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Direct Public Link</span>
          </div>
        </div>

        {/* Success Confirmation State */}
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="p-8 sm:p-10 rounded-[28px] bg-[#161224] border border-purple-500/40 shadow-2xl text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-950/80 border-2 border-emerald-500/60 mx-auto flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/60 text-amber-300 font-mono text-xs uppercase tracking-wider font-semibold inline-block">
                Status: Pending Academic Council Approval
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Application Submitted Successfully!
              </h2>
              <p className="text-sm text-[#b8b3cb] max-w-lg mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{fullName}</strong>. Your instructor profile for{' '}
                <span className="text-purple-300 font-semibold">{resolvedCourse.courseTitle}</span> has been received by Orbit Space Academy.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#110d1c] border border-[#2a233c] text-left max-w-lg mx-auto space-y-3 text-xs text-[#9d98af]">
              <div className="font-semibold text-white flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>What happens next?</span>
              </div>
              <ul className="space-y-2 list-disc list-inside">
                <li>Your submission does <strong className="text-white">not</strong> require any password or login credentials.</li>
                <li>The Academic Council will audit your experience, bio, and portfolio.</li>
                <li>Once an administrator clicks <strong className="text-purple-300">Adopt</strong>, your verified instructor profile goes live on the academy's official course and faculty portal.</li>
                <li>You will receive an official confirmation via email at <strong className="text-white">{email}</strong>.</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateHome) onNavigateHome();
                  else window.location.href = '/';
                }}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-purple-950/50"
              >
                <span>Return to Orbit Space Homepage</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Submission Form */
          <div className="space-y-6">
            {/* Header & Course Locked Notice */}
            <div className="space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-600/50 text-purple-200 text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                <span>Instructor &amp; Mentor Profile Submission</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Join Orbit Space Faculty
              </h1>
              <p className="text-sm text-[#9f99b2] max-w-xl">
                Submit your professional credentials and experience. No account or password required. Once adopted by the academy administrators, your profile will be published to students.
              </p>
            </div>

            {/* Course Locked Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-[#19142b] border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/50 flex items-center justify-center text-purple-300 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">
                    Assigned Course Track (Locked to Invitation Link)
                  </span>
                  <span className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>{resolvedCourse.courseTitle}</span>
                    <span className="text-xs font-normal text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                      Pre-Selected
                    </span>
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#9f99ad] sm:text-right font-mono">
                Course: <strong className="text-purple-300">/{resolvedCourse.courseSlug}</strong>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-600/60 text-rose-200 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Basic Information */}
              <div className="p-6 rounded-2xl bg-[#151122] border border-[#2c2440] space-y-4">
                <div className="flex items-center gap-2 border-b border-[#29223c] pb-3">
                  <User className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
                    1. Instructor Identity &amp; Contact
                  </h3>
                </div>

                {/* Profile Photo Upload */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-[#1f1932] border-2 border-dashed border-purple-500/40 flex items-center justify-center overflow-hidden">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-2 text-[#79728f]">
                          <User className="w-8 h-8 mx-auto mb-1 text-purple-400/60" />
                          <span className="text-[9px] block">No Photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                    <label className="block text-xs font-medium text-white">
                      Profile Photo (Recommended)
                    </label>
                    <p className="text-[11px] text-[#938da6]">
                      High-resolution portrait photo for your verified faculty badge and public directory card.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <label className="px-3.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-semibold cursor-pointer transition flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {photoUrl && (
                        <button
                          type="button"
                          onClick={() => setPhotoUrl('')}
                          className="px-2.5 py-1.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs transition"
                        >
                          Clear Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#c4bfd6]">
                      Full Legal / Professional Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#79728f] absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Johnathan Doe"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0f0b18] border border-[#332a4a] text-white placeholder-[#5c5472] focus:outline-none focus:border-purple-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#c4bfd6]">
                      Professional Title / Role *
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-[#79728f] absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Senior UX Architect & Product Designer"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0f0b18] border border-[#332a4a] text-white placeholder-[#5c5472] focus:outline-none focus:border-purple-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#c4bfd6]">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#79728f] absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john.doe@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0f0b18] border border-[#332a4a] text-white placeholder-[#5c5472] focus:outline-none focus:border-purple-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#c4bfd6]">
                      Phone Number / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#79728f] absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0f0b18] border border-[#332a4a] text-white placeholder-[#5c5472] focus:outline-none focus:border-purple-500 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Experience & Skills */}
              <div className="p-6 rounded-2xl bg-[#151122] border border-[#2c2440] space-y-4">
                <div className="flex items-center gap-2 border-b border-[#29223c] pb-3">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
                    2. Experience &amp; Specialization
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#c4bfd6]">
                      Years of Professional Experience
                    </label>
                    <select
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0f0b18] border border-[#332a4a] text-white focus:outline-none focus:border-purple-500 text-xs cursor-pointer"
                    >
                      <option value="1–2 Years">1–2 Years</option>
                      <option value="3–5 Years">3–5 Years</option>
                      <option value="5–8 Years">5–8 Years</option>
                      <option value="8+ Years">8+ Years</option>
                      <option value="10+ Years">10+ Years (Senior Lead / Director)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#c4bfd6]">
                      Assigned Course Track (Locked)
                    </label>
                    <div className="px-3.5 py-2 rounded-xl bg-[#1e1832] border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-between">
                      <span>{resolvedCourse.courseTitle}</span>
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Skills Tag Input */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-medium text-[#c4bfd6]">
                    Core Skills &amp; Tools (Press Enter or click + to add)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="e.g. Figma, Microservices, Python..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#0f0b18] border border-[#332a4a] text-white placeholder-[#5c5472] focus:outline-none focus:border-purple-500 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-[#0f0b18] border border-[#2a223e]">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-700/60 text-purple-200 text-xs font-medium"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-rose-400 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <span className="text-xs text-[#716a85] font-mono py-0.5">
                        Add relevant software, programming languages, or domain skills.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Professional Bio */}
              <div className="p-6 rounded-2xl bg-[#151122] border border-[#2c2440] space-y-4">
                <div className="flex items-center gap-2 border-b border-[#29223c] pb-3">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
                    3. Professional Bio &amp; Teaching Statement
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#c4bfd6]">
                    Professional Biography *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe your professional journey, industry projects, key milestones, and mentorship background..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0f0b18] border border-[#332a4a] text-white placeholder-[#5c5472] focus:outline-none focus:border-purple-500 text-xs leading-relaxed"
                  />
                  <p className="text-[10px] text-[#7f7895]">
                    This bio will appear on your public instructor card once adopted by academy administrators.
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-medium text-[#c4bfd6]">
                    Teaching Philosophy / Statement (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={teachingStatement}
                    onChange={(e) => setTeachingStatement(e.target.value)}
                    placeholder="How do you approach mentoring junior developers / designers? What is your hands-on teaching methodology?"
                    className="w-full px-3 py-2 rounded-xl bg-[#0f0b18] border border-[#332a4a] text-white placeholder-[#5c5472] focus:outline-none focus:border-purple-500 text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Section 4: Links & Portfolio */}
              <div className="p-6 rounded-2xl bg-[#151122] border border-[#2c2440] space-y-4">
                <div className="flex items-center gap-2 border-b border-[#29223c] pb-3">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
                    4. Portfolio &amp; Online Profiles
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#c4bfd6]">
                      Portfolio / Personal Site
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-[#79728f] absolute left-3 top-3" />
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://myportfolio.dev"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0f0b18] border border-[#332a4a] text-white placeholder-[#5c5472] focus:outline-none focus:border-purple-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#c4bfd6]">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Linkedin className="w-4 h-4 text-[#79728f] absolute left-3 top-3" />
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0f0b18] border border-[#332a4a] text-white placeholder-[#5c5472] focus:outline-none focus:border-purple-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#c4bfd6]">
                      GitHub / Behance / Work
                    </label>
                    <div className="relative">
                      <Github className="w-4 h-4 text-[#79728f] absolute left-3 top-3" />
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0f0b18] border border-[#332a4a] text-white placeholder-[#5c5472] focus:outline-none focus:border-purple-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-medium text-[#c4bfd6]">
                    Key Projects or Notable Products Built
                  </label>
                  <input
                    type="text"
                    value={projectHighlights}
                    onChange={(e) => setProjectHighlights(e.target.value)}
                    placeholder="e.g. Lead designer for Fintech App (50k DAU), Core Maintainer of Open-source Lib..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0f0b18] border border-[#332a4a] text-white placeholder-[#5c5472] focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] text-[#8e87a2] font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Submissions are strictly reviewed before publication.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-purple-950/60 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Profile for Approval</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
