import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Link as LinkIcon,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  AlertCircle,
  ExternalLink,
  Plus,
  Search,
  Filter,
  User,
  Mail,
  Phone,
  Briefcase,
  Globe,
  Linkedin,
  Github,
  Layers,
  Sparkles,
  ShieldCheck,
  Share2
} from 'lucide-react';
import {
  TeacherSubmissionService,
  TeacherSubmission,
  TeacherInviteLink,
  DEFAULT_AVAILABLE_COURSES
} from '../../services/teacherSubmissionService';
import { ProgramService } from '../../services/programService';
import { playSound } from '../../utils/soundEffects';

interface AdminTeacherSubmissionsManagerProps {
  onTutorAdopted?: () => void;
}

export const AdminTeacherSubmissionsManager: React.FC<AdminTeacherSubmissionsManagerProps> = ({
  onTutorAdopted
}) => {
  const [submissions, setSubmissions] = useState<TeacherSubmission[]>([]);
  const [inviteLinks, setInviteLinks] = useState<TeacherInviteLink[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'links'>('submissions');

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'adopted' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  // Review modal state
  const [selectedSubmission, setSelectedSubmission] = useState<TeacherSubmission | null>(null);
  const [isAdopting, setIsAdopting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Link generation state
  const [selectedCourseForLink, setSelectedCourseForLink] = useState(DEFAULT_AVAILABLE_COURSES[0].title);
  const [customCourseInput, setCustomCourseInput] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Subscribe to live submissions and links
  useEffect(() => {
    const unsubSubs = TeacherSubmissionService.subscribeSubmissions((subs) => {
      setSubmissions(subs);
    });
    const unsubLinks = TeacherSubmissionService.subscribeInviteLinks((links) => {
      setInviteLinks(links);
    });
    return () => {
      unsubSubs();
      unsubLinks();
    };
  }, []);

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  const showToast = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Generate full invite URL
  const getFullInviteUrl = (link: TeacherInviteLink): string => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://orbitspace.academy';
    return `${origin}/teacher-submit/${link.courseSlug}?token=${link.token}`;
  };

  const handleCopyLink = async (link: TeacherInviteLink) => {
    try {
      const fullUrl = getFullInviteUrl(link);
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLinkId(link.id);
      playSound('droplet');
      showToast(`Copied public submission link for ${link.courseTitle}!`, 'success');
      setTimeout(() => setCopiedLinkId(null), 2500);
    } catch {
      showToast('Failed to copy link to clipboard.', 'error');
    }
  };

  const handleCreateLink = async () => {
    const title = customCourseInput.trim() || selectedCourseForLink;
    if (!title) return;

    try {
      setIsGeneratingLink(true);
      const newLink = await TeacherSubmissionService.generateInviteLink(title);
      playSound('success');
      showToast(`Generated secure invite link for "${title}"!`, 'success');
      setCustomCourseInput('');
      handleCopyLink(newLink);
    } catch (err: any) {
      showToast(err.message || 'Failed to create link.', 'error');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleAdopt = async (submission: TeacherSubmission) => {
    try {
      setIsAdopting(true);
      playSound('pulse');
      const { tutor } = await TeacherSubmissionService.adoptSubmission(submission.id, 'Super Administrator');
      playSound('arrival');
      showToast(`Adopted ${tutor.name}! Instructor profile is now active on the public course & teacher portal.`, 'success');
      setSelectedSubmission(null);
      if (onTutorAdopted) onTutorAdopted();
    } catch (err: any) {
      console.error('Adopt error:', err);
      showToast(err.message || 'Failed to adopt teacher.', 'error');
      playSound('error');
    } finally {
      setIsAdopting(false);
    }
  };

  const handleReject = async (submissionId: string) => {
    const reason = window.prompt('Optional administrative note for rejection:', 'Does not match current track prerequisites.');
    if (reason === null) return;

    try {
      await TeacherSubmissionService.rejectSubmission(submissionId, reason || undefined);
      playSound('pop');
      showToast('Submission marked as Rejected.', 'success');
      setSelectedSubmission(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to reject submission.', 'error');
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this submission?')) return;
    try {
      await TeacherSubmissionService.deleteSubmission(submissionId);
      playSound('trash');
      showToast('Submission deleted permanently.', 'success');
      setSelectedSubmission(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete submission.', 'error');
    }
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (courseFilter !== 'all' && s.courseSlug !== courseFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchSkills = s.skills.some((sk) => sk.toLowerCase().includes(q));
      return matchName || matchEmail || matchTitle || matchSkills;
    }
    return true;
  });

  // Extract all distinct course titles
  const allCourses = Array.from(
    new Set([
      ...DEFAULT_AVAILABLE_COURSES.map((c) => c.title),
      ...ProgramService.getAllPrograms().map((p) => p.title),
      ...inviteLinks.map((l) => l.courseTitle)
    ])
  );

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-medium flex items-center gap-2 animate-fadeIn ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/80 text-emerald-200'
              : 'bg-rose-950 border-rose-500/80 text-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Top Banner & Flow Explanation */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#181329] to-[#120f20] border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Public Teacher Submission Links &amp; Admin Approval Workflow</span>
            </span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-[11px] font-bold animate-pulse">
                🔴 {pendingCount} Pending Approval
              </span>
            )}
          </div>
          <p className="text-xs text-[#9d98af] max-w-2xl leading-relaxed">
            Generate course-specific links for instructors (e.g.{' '}
            <code className="text-purple-300">/teacher-submit/ui-ux</code>). Teachers fill their credentials with zero logins or passwords required. Submissions are held in <strong>Pending</strong> status until you click <strong>Adopt</strong> to publish them to the academy.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-[#100c1c] p-1 rounded-xl border border-[#2b233e] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'submissions'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-[#9d98af] hover:text-white'
            }`}
          >
            <span>Submissions</span>
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'links'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-[#9d98af] hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Course Links ({inviteLinks.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Submissions Review */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Controls / Filter Bar */}
          <div className="p-4 rounded-2xl bg-[#141022] border border-[#28213b] flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#79728f] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teacher by name, email, skills..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0d0918] border border-[#302746] text-white placeholder-[#5d5673] focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Status pills */}
              <div className="flex items-center gap-1 bg-[#0d0918] p-1 rounded-xl border border-[#2b233e]">
                {(['all', 'pending', 'adopted', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer capitalize ${
                      statusFilter === st
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-[#9d98af] hover:text-white'
                    }`}
                  >
                    {st === 'pending' ? 'Pending Approval' : st}
                  </button>
                ))}
              </div>

              {/* Course filter */}
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#0d0918] border border-[#302746] text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">All Course Tracks</option>
                {DEFAULT_AVAILABLE_COURSES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submissions Table / Cards */}
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#141022] border border-[#28213b] space-y-3">
              <User className="w-10 h-10 text-purple-400/40 mx-auto" />
              <h4 className="text-sm font-bold text-white">No teacher submissions match filters</h4>
              <p className="text-xs text-[#9d98af] max-w-md mx-auto">
                Generate a course submission link under the <strong>Course Links</strong> tab and share it with your instructor to receive their credentials.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('links')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Public Submission Link</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#141022] rounded-2xl border border-[#28213b] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#28213b] bg-[#171326] text-[#9d98af] font-mono uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Instructor Name &amp; Title</th>
                      <th className="p-3.5">Assigned Course</th>
                      <th className="p-3.5">Experience &amp; Skills</th>
                      <th className="p-3.5">Submitted</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#211a30]">
                    {filteredSubmissions.map((sub) => {
                      const isPending = sub.status === 'pending';
                      const isAdopted = sub.status === 'adopted';
                      const isRejected = sub.status === 'rejected';

                      return (
                        <tr key={sub.id} className="hover:bg-[#1a152b] transition-colors">
                          {/* Teacher Photo + Name */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#201934] border border-purple-500/30 overflow-hidden flex items-center justify-center shrink-0">
                                {sub.photoUrl ? (
                                  <img src={sub.photoUrl} alt={sub.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-5 h-5 text-purple-400" />
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-white text-xs block">{sub.fullName}</span>
                                <span className="text-[11px] text-[#a49ebb] block truncate max-w-[200px]">
                                  {sub.title}
                                </span>
                                <span className="text-[10px] text-[#716a85] font-mono block">{sub.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Course Track */}
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-lg bg-purple-950/70 border border-purple-700/50 text-purple-200 text-xs font-semibold inline-block">
                              {sub.courseTitle}
                            </span>
                          </td>

                          {/* Experience & Skills */}
                          <td className="p-3.5">
                            <span className="text-[11px] text-white block font-medium">
                              {sub.experienceYears || '3+ Years'}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1 max-w-xs">
                              {sub.skills.slice(0, 3).map((sk) => (
                                <span
                                  key={sk}
                                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#201934] text-[#c4bed8] border border-[#33284f]"
                                >
                                  {sk}
                                </span>
                              ))}
                              {sub.skills.length > 3 && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#201934] text-purple-300">
                                  +{sub.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Submission Date */}
                          <td className="p-3.5 font-mono text-[11px] text-[#9d98af]">
                            {new Date(sub.submittedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-600/60 text-amber-300 font-mono text-[10px] font-bold">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Pending Approval</span>
                              </span>
                            )}
                            {isAdopted && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-600/60 text-emerald-300 font-mono text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Adopted &amp; Active</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/70 border border-rose-600/60 text-rose-300 font-mono text-[10px] font-bold">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>Rejected</span>
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedSubmission(sub)}
                                className="px-3 py-1.5 rounded-xl bg-[#231b38] hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Review</span>
                              </button>

                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleAdopt(sub)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Adopt</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Course Links Generator & Directory */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          {/* Link Generator Box */}
          <div className="p-6 rounded-2xl bg-[#141022] border border-[#28213b] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#261f38] pb-3">
              <LinkIcon className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
                Generate Course-Specific Public Submission Link
              </h3>
            </div>

            <p className="text-xs text-[#9d98af]">
              Choose the program for the instructor. The generated public link will pre-lock the course track so the teacher cannot submit under the wrong program. No login or password required.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-medium text-[#c4bed8]">
                  Select Academy Course:
                </label>
                <select
                  value={selectedCourseForLink}
                  onChange={(e) => setSelectedCourseForLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d0918] border border-[#302746] text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {allCourses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#c4bed8]">
                  Or Custom Track Name:
                </label>
                <input
                  type="text"
                  value={customCourseInput}
                  onChange={(e) => setCustomCourseInput(e.target.value)}
                  placeholder="e.g. Cloud DevOps..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0d0918] border border-[#302746] text-white placeholder-[#5c5472] focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isGeneratingLink}
                onClick={handleCreateLink}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-purple-950/50 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isGeneratingLink ? 'Generating...' : 'Create & Copy Secure Submission Link'}</span>
              </button>
            </div>
          </div>

          {/* Active Links Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9d98af]">
              Active Course Invitation Links ({inviteLinks.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inviteLinks.map((link) => {
                const isCopied = copiedLinkId === link.id;
                const fullUrl = getFullInviteUrl(link);

                return (
                  <div
                    key={link.id}
                    className="p-4 rounded-2xl bg-[#141022] border border-[#28213b] space-y-3 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{link.courseTitle}</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-950/70 border border-purple-700/50 text-purple-300 font-mono text-[10px]">
                        {link.submissionCount || 0} Submissions
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-[#0d0918] border border-[#251e35] flex items-center justify-between gap-2 text-xs font-mono text-purple-300 overflow-hidden">
                      <span className="truncate text-[11px] text-[#9d98af]">
                        /teacher-submit/{link.courseSlug}?token={link.token.slice(0, 10)}...
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(link)}
                        className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#221b36] hover:bg-purple-600 text-white'
                        }`}
                        title="Copy direct submission URL"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#716a85] pt-1">
                      <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
                      >
                        <span>Preview Form</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#151124] border border-[#302649] rounded-[24px] max-w-2xl w-full shadow-2xl relative my-auto flex flex-col max-h-[92vh] overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-[#2d2444] bg-[#120e1e] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#211a36] border border-purple-500/40 overflow-hidden flex items-center justify-center shrink-0">
                    {selectedSubmission.photoUrl ? (
                      <img
                        src={selectedSubmission.photoUrl}
                        alt={selectedSubmission.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{selectedSubmission.fullName}</h3>
                    <p className="text-xs text-purple-300 font-medium">{selectedSubmission.title}</p>
                    <span className="text-[10px] font-mono text-[#8d86a3]">
                      Target Track: <strong className="text-white">{selectedSubmission.courseTitle}</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#c4bfd6]">
                {/* Status Notice */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f0b18] border border-[#2b223d]">
                  <span className="font-mono text-[11px] text-[#9d98af]">Application Status:</span>
                  {selectedSubmission.status === 'pending' && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-600/60 text-amber-300 font-mono text-[10px] font-bold">
                      🔴 Pending Academic Council Approval
                    </span>
                  )}
                  {selectedSubmission.status === 'adopted' && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-mono text-[10px] font-bold">
                      🟢 Adopted &amp; Published
                    </span>
                  )}
                  {selectedSubmission.status === 'rejected' && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-600/60 text-rose-300 font-mono text-[10px] font-bold">
                      🔴 Rejected
                    </span>
                  )}
                </div>

                {/* Contact information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#0f0b18] border border-[#2b223d]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#7d7594] block uppercase font-mono">Email Address</span>
                      <a href={`mailto:${selectedSubmission.email}`} className="text-white hover:underline">
                        {selectedSubmission.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#7d7594] block uppercase font-mono">Phone / WhatsApp</span>
                      <span className="text-white">{selectedSubmission.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#7d7594] block">Professional Bio</span>
                  <div className="p-3.5 rounded-xl bg-[#0f0b18] border border-[#2b223d] text-white leading-relaxed text-xs">
                    {selectedSubmission.bio}
                  </div>
                </div>

                {/* Teaching statement */}
                {selectedSubmission.teachingStatement && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-[#7d7594] block">Teaching Statement</span>
                    <div className="p-3.5 rounded-xl bg-[#0f0b18] border border-[#2b223d] text-white leading-relaxed text-xs italic">
                      "{selectedSubmission.teachingStatement}"
                    </div>
                  </div>
                )}

                {/* Skills & Experience */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#7d7594] block">
                    Core Skills &amp; Experience ({selectedSubmission.experienceYears || '3+ Years'})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSubmission.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-700/60 text-purple-200 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Online Profiles & Work */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#7d7594] block">Online Profiles &amp; Work</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubmission.portfolioUrl && (
                      <a
                        href={selectedSubmission.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#1b152d] hover:bg-purple-600 text-white transition flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Portfolio Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedSubmission.linkedinUrl && (
                      <a
                        href={selectedSubmission.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#1b152d] hover:bg-blue-600 text-white transition flex items-center gap-1.5"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        <span>LinkedIn Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedSubmission.githubUrl && (
                      <a
                        href={selectedSubmission.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#1b152d] hover:bg-neutral-800 text-white transition flex items-center gap-1.5"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Work / GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {selectedSubmission.projectHighlights && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#7d7594] block">Project Highlights</span>
                    <p className="text-white text-xs">{selectedSubmission.projectHighlights}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-[#2d2444] bg-[#120e1e] flex flex-wrap items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedSubmission.id)}
                  className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-rose-950 text-neutral-400 hover:text-rose-300 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  {selectedSubmission.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleReject(selectedSubmission.id)}
                      className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-rose-950 border border-neutral-700 hover:border-rose-700/60 text-neutral-300 hover:text-rose-200 transition text-xs font-semibold cursor-pointer"
                    >
                      Reject Submission
                    </button>
                  )}

                  {selectedSubmission.status === 'pending' ? (
                    <button
                      type="button"
                      disabled={isAdopting}
                      onClick={() => handleAdopt(selectedSubmission)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer disabled:opacity-50"
                    >
                      {isAdopting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Adopting Teacher...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Adopt &amp; Publish to Academy</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>This teacher is currently active on the academy portal.</span>
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
