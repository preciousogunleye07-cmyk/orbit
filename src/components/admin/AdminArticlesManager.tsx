import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Search, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  User, 
  Award, 
  Eye, 
  Globe, 
  Image as ImageIcon, 
  X, 
  Upload,
  AlertCircle,
  Tag,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  BookOpen,
  Copy,
  Check,
  ShieldAlert,
  KeyRound,
  Lock
} from 'lucide-react';
import { 
  ArticleRecord, 
  ArticleAuthorType,
  ThinkAcademyAuthor,
  StudentAuthor, 
  getArticles, 
  syncArticlesFromFirebase, 
  createOrDeployArticleAsync, 
  updateArticleAsync, 
  deleteArticleAsync,
  PRESET_ARTICLE_IMAGES,
  generateTechnicalArticleDraft,
  generateThinkAcademyDraft
} from '../../services/articleService';
import { getCertificates, CertificateRecord } from '../../services/certificateService';
import { SubAdminUser } from '../../services/subAdminService';
import { playSound } from '../../utils/soundEffects';
import { 
  getSubAdminRouteSlug, 
  setSubAdminRouteSlug, 
  resetSubAdminRouteSlug, 
  getSubAdminFullUrl 
} from '../../utils/subAdminRoute';

interface AdminArticlesManagerProps {
  currentUser: SubAdminUser | null;
  onViewPublicArticle?: (slug: string) => void;
  onNavigateToCertificate?: (certId: string) => void;
}

export const AdminArticlesManager: React.FC<AdminArticlesManagerProps> = ({
  currentUser,
  onViewPublicArticle,
  onNavigateToCertificate
}) => {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState('Web Engineering');
  const [formCoverImage, setFormCoverImage] = useState(PRESET_ARTICLE_IMAGES[0].url);
  const [formReadTime, setFormReadTime] = useState('5 min read');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('React, Web, Capstone');
  
  // Author State
  const [authorType, setAuthorType] = useState<ArticleAuthorType>('student');
  const [thinkAuthorName, setThinkAuthorName] = useState('Obitt');
  const [thinkAuthorRole, setThinkAuthorRole] = useState('Founder & Lead Researcher, Think Academy');
  const [thinkAuthorInstitution, setThinkAuthorInstitution] = useState('Think Academy');
  const [thinkAuthorBio, setThinkAuthorBio] = useState('Author of foundational engineering monographs and mental models at Think Academy.');

  const [selectedStudentCertId, setSelectedStudentCertId] = useState<string>('');
  const [studentAuthorName, setStudentAuthorName] = useState('');
  const [studentCertNumber, setStudentCertNumber] = useState('');
  const [studentCourseTrack, setStudentCourseTrack] = useState('');
  const [studentProjectTitle, setStudentProjectTitle] = useState('');
  const [supervisingTutorName, setSupervisingTutorName] = useState('Engr. David Babatunde');
  const [supervisingTutorRole, setSupervisingTutorRole] = useState('Senior Academic & Engineering Supervisor');

  // AI Generator Form State
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [aiGeneratorMode, setAiGeneratorMode] = useState<'student' | 'think-academy'>('student');
  const [aiStudentCertId, setAiStudentCertId] = useState('');
  const [aiStudentName, setAiStudentName] = useState('');
  const [aiProjectTitle, setAiProjectTitle] = useState('');
  const [aiCourseTrack, setAiCourseTrack] = useState('Full-Stack Web Development');
  const [aiTutorName, setAiTutorName] = useState('Engr. David Babatunde');
  const [aiTutorRole, setAiTutorRole] = useState('Principal Engineering Fellow');
  const [aiCategory, setAiCategory] = useState('Web Engineering');
  const [aiHighlights, setAiHighlights] = useState('');

  // AI Think Academy Generator Fields
  const [aiThinkAuthorName, setAiThinkAuthorName] = useState('Obitt');
  const [aiThinkAuthorRole, setAiThinkAuthorRole] = useState('Founder & Lead Researcher, Think Academy');
  const [aiThinkTopic, setAiThinkTopic] = useState('');
  const [aiThinkCategory, setAiThinkCategory] = useState('Distributed Systems');
  const [aiThinkHighlights, setAiThinkHighlights] = useState('');

  // Sub-Admin Obfuscated Route Gateway State
  const [subAdminSlug, setSubAdminSlug] = useState(getSubAdminRouteSlug());
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugDraft, setSlugDraft] = useState(subAdminSlug);
  const [copiedGateway, setCopiedGateway] = useState(false);

  const handleCopyGatewayUrl = () => {
    playSound('pulse');
    const fullUrl = getSubAdminFullUrl();
    navigator.clipboard.writeText(fullUrl);
    setCopiedGateway(true);
    showToast('Secret Sub-Admin Gateway URL copied to clipboard!');
    setTimeout(() => setCopiedGateway(false), 3000);
  };

  const handleSaveNewSlug = () => {
    try {
      const saved = setSubAdminRouteSlug(slugDraft);
      setSubAdminSlug(saved);
      setIsEditingSlug(false);
      showToast(`Sub-Admin gateway slug updated to /${saved}`);
      playSound('success');
    } catch (err: any) {
      showToast(err.message || 'Invalid gateway slug');
      playSound('error');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    setIsLoading(true);
    setArticles(getArticles());
    setCertificates(getCertificates());

    syncArticlesFromFirebase().then((synced) => {
      setArticles(synced);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // When student certificate dropdown is selected in editor
  const handleSelectStudentCert = (certId: string) => {
    setSelectedStudentCertId(certId);
    if (!certId) return;

    const cert = certificates.find(c => c.id === certId);
    if (cert) {
      setStudentAuthorName(cert.studentName);
      setStudentCertNumber(cert.certificateNumber);
      setStudentCourseTrack(cert.course);
      if (cert.additionalNotes && !studentProjectTitle) {
        // Extract project or set clean title
        setStudentProjectTitle(cert.additionalNotes.slice(0, 70));
      }
      playSound('sparkle');
    }
  };

  // When student certificate dropdown is selected in AI generator
  const handleSelectAiStudentCert = (certId: string) => {
    setAiStudentCertId(certId);
    if (!certId) return;

    const cert = certificates.find(c => c.id === certId);
    if (cert) {
      setAiStudentName(cert.studentName);
      setAiCourseTrack(cert.course);
      setAiProjectTitle(cert.additionalNotes ? cert.additionalNotes.slice(0, 60) : `${cert.course} Capstone System`);
      if (cert.course.toLowerCase().includes('data')) {
        setAiCategory('Data Science');
        setAiTutorName('Dr. K. A. Adeleke');
        setAiTutorRole('Principal Analytics Fellow');
      } else if (cert.course.toLowerCase().includes('cyber')) {
        setAiCategory('Cybersecurity');
        setAiTutorName('Inspector Aliyu Mohammed');
        setAiTutorRole('Senior Cyber Defense Instructor');
      } else if (cert.course.toLowerCase().includes('design') || cert.course.toLowerCase().includes('ux')) {
        setAiCategory('UI/UX & Product Design');
        setAiTutorName('Mr. Emmanuel Okafor');
        setAiTutorRole('Lead UI Architecture Fellow');
      } else {
        setAiCategory('Web Engineering');
        setAiTutorName('Engr. David Babatunde');
        setAiTutorRole('Principal Web Architecture Fellow');
      }
      playSound('sparkle');
    }
  };

  const handleOpenNewArticle = () => {
    setEditingArticleId(null);
    setFormTitle('');
    setFormSlug('');
    setFormSubtitle('');
    setFormCategory('Web Engineering');
    setFormCoverImage(PRESET_ARTICLE_IMAGES[0].url);
    setFormReadTime('5 min read');
    setFormContent('');
    setFormTags('OrbitSpace, Tech, Innovation');
    
    setAuthorType('student');
    setThinkAuthorName('Obitt');
    setThinkAuthorRole('Founder & Lead Researcher, Think Academy');
    setThinkAuthorInstitution('Think Academy');
    setThinkAuthorBio('Author of foundational engineering monographs and mental models at Think Academy.');

    setSelectedStudentCertId('');
    setStudentAuthorName('');
    setStudentCertNumber('');
    setStudentCourseTrack('');
    setStudentProjectTitle('');
    setSupervisingTutorName('Engr. David Babatunde');
    setSupervisingTutorRole('Senior Academic & Engineering Supervisor');

    setPreviewTab('edit');
    setIsEditorOpen(true);
    playSound('chime');
  };

  const handleEditArticle = (art: ArticleRecord) => {
    setEditingArticleId(art.id);
    setFormTitle(art.title);
    setFormSlug(art.slug);
    setFormSubtitle(art.subtitle);
    setFormCategory(art.category);
    setFormCoverImage(art.coverImage);
    setFormReadTime(art.readTime);
    setFormContent(art.content);
    setFormTags(art.tags.join(', '));

    const determinedType: ArticleAuthorType = art.authorType || (art.thinkAcademyAuthor ? 'think-academy' : 'student');
    setAuthorType(determinedType);

    if (art.thinkAcademyAuthor) {
      setThinkAuthorName(art.thinkAcademyAuthor.name || 'Obitt');
      setThinkAuthorRole(art.thinkAcademyAuthor.role || 'Founder & Lead Researcher, Think Academy');
      setThinkAuthorInstitution(art.thinkAcademyAuthor.institution || 'Think Academy');
      setThinkAuthorBio(art.thinkAcademyAuthor.bio || '');
    } else {
      setThinkAuthorName('Obitt');
      setThinkAuthorRole('Founder & Lead Researcher, Think Academy');
      setThinkAuthorInstitution('Think Academy');
      setThinkAuthorBio('Author of foundational engineering monographs and mental models at Think Academy.');
    }

    const primaryAuthor = art.studentAuthors?.[0];
    if (primaryAuthor) {
      setSelectedStudentCertId(primaryAuthor.certificateId || '');
      setStudentAuthorName(primaryAuthor.name || '');
      setStudentCertNumber(primaryAuthor.certificateNumber || '');
      setStudentCourseTrack(primaryAuthor.courseTrack || '');
      setStudentProjectTitle(primaryAuthor.projectTitle || '');
    } else {
      setSelectedStudentCertId('');
      setStudentAuthorName('');
      setStudentCertNumber('');
      setStudentCourseTrack('');
      setStudentProjectTitle('');
    }

    if (art.supervisingTutor) {
      setSupervisingTutorName(art.supervisingTutor.name || '');
      setSupervisingTutorRole(art.supervisingTutor.role || '');
    }

    setPreviewTab('edit');
    setIsEditorOpen(true);
    playSound('droplet');
  };

  const handleExecuteAiGenerate = () => {
    playSound('sparkle');

    if (aiGeneratorMode === 'think-academy') {
      if (!aiThinkTopic.trim()) {
        showToast('Please provide a research monograph topic or title.');
        return;
      }

      const generated = generateThinkAcademyDraft({
        authorName: aiThinkAuthorName.trim() || 'Obitt',
        authorRole: aiThinkAuthorRole.trim() || 'Founder & Lead Researcher, Think Academy',
        topic: aiThinkTopic.trim(),
        category: aiThinkCategory,
        keyPrinciples: aiThinkHighlights
      });

      setAuthorType('think-academy');
      setThinkAuthorName(generated.thinkAcademyAuthor.name);
      setThinkAuthorRole(generated.thinkAcademyAuthor.role);
      setThinkAuthorInstitution(generated.thinkAcademyAuthor.institution);
      setThinkAuthorBio(generated.thinkAcademyAuthor.bio);

      setFormTitle(generated.title);
      setFormSubtitle(generated.subtitle);
      setFormContent(generated.content);
      setFormCategory(generated.category);
      setFormTags(generated.tags.join(', '));
      setFormSlug(generated.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));

      const matchingPreset = PRESET_ARTICLE_IMAGES.find(p => p.category.toLowerCase().includes(aiThinkCategory.toLowerCase())) || PRESET_ARTICLE_IMAGES[0];
      setFormCoverImage(matchingPreset.url);

      setIsAiGeneratorOpen(false);
      setIsEditorOpen(true);
      showToast('Think Academy monograph drafted successfully! You can refine and deploy.');
      return;
    }

    if (!aiStudentName.trim() || !aiProjectTitle.trim()) {
      showToast('Please enter both student name and project title.');
      return;
    }

    const generated = generateTechnicalArticleDraft({
      studentName: aiStudentName.trim(),
      projectTitle: aiProjectTitle.trim(),
      courseTrack: aiCourseTrack,
      supervisingTutorName: aiTutorName,
      supervisingTutorRole: aiTutorRole,
      category: aiCategory,
      keyHighlights: aiHighlights,
      certificateId: aiStudentCertId
    });

    setAuthorType('student');
    setFormTitle(generated.title);
    setFormSubtitle(generated.subtitle);
    setFormContent(generated.content);
    setFormCategory(generated.category);
    setFormTags(generated.tags.join(', '));
    setFormSlug(generated.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));

    // Populate student author
    setStudentAuthorName(aiStudentName);
    setSelectedStudentCertId(aiStudentCertId);
    const cert = certificates.find(c => c.id === aiStudentCertId);
    if (cert) {
      setStudentCertNumber(cert.certificateNumber);
      setStudentCourseTrack(cert.course);
    } else {
      setStudentCourseTrack(aiCourseTrack);
    }
    setStudentProjectTitle(aiProjectTitle);

    setSupervisingTutorName(aiTutorName);
    setSupervisingTutorRole(aiTutorRole);

    // Pick appropriate image preset
    const matchingPreset = PRESET_ARTICLE_IMAGES.find(p => p.category.toLowerCase().includes(aiCategory.toLowerCase())) || PRESET_ARTICLE_IMAGES[0];
    setFormCoverImage(matchingPreset.url);

    setIsAiGeneratorOpen(false);
    setIsEditorOpen(true);
    showToast('Technical article drafted successfully! You can now refine, add images, and deploy.');
  };

  const handleSaveArticle = async (statusToSet: 'published' | 'draft') => {
    if (!formTitle.trim()) {
      showToast('Please provide an article title.');
      return;
    }

    if (!formContent.trim()) {
      showToast('Please write some content for the article.');
      return;
    }

    setIsLoading(true);
    playSound('pulse');

    const cleanSlug = (formSlug.trim() || formTitle.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const isThink = authorType === 'think-academy';

    const studentAuthorsList: StudentAuthor[] = (!isThink && studentAuthorName.trim())
      ? [
          {
            name: studentAuthorName.trim(),
            certificateId: selectedStudentCertId.trim() || undefined,
            certificateNumber: studentCertNumber.trim() || undefined,
            courseTrack: studentCourseTrack.trim() || undefined,
            projectTitle: studentProjectTitle.trim() || undefined,
            roleInProject: 'Lead Student Researcher & Project Author'
          }
        ]
      : [];

    const deployedByInfo = {
      name: currentUser?.name || (isThink ? 'Think Academy Faculty' : 'Academic Editorial Team'),
      role: currentUser?.role || 'Sub-Administrator',
      email: currentUser?.email || 'editor@orbitspace.academy'
    };

    const tagsArray = formTags.split(',').map(t => t.trim()).filter(Boolean);

    const articlePayload: Partial<ArticleRecord> = {
      title: formTitle.trim(),
      slug: cleanSlug,
      subtitle: formSubtitle.trim(),
      content: formContent.trim(),
      category: formCategory,
      coverImage: formCoverImage,
      readTime: formReadTime,
      status: statusToSet,
      publishedAt: new Date().toISOString().split('T')[0],
      authorType: authorType,
      thinkAcademyAuthor: isThink ? {
        name: thinkAuthorName.trim() || 'Obitt',
        role: thinkAuthorRole.trim() || 'Founder & Lead Researcher, Think Academy',
        institution: thinkAuthorInstitution.trim() || 'Think Academy',
        bio: thinkAuthorBio.trim()
      } : undefined,
      studentAuthors: isThink ? [] : studentAuthorsList,
      supervisingTutor: isThink ? {
        name: 'Think Academy Editorial Board',
        role: 'Academic Publications'
      } : {
        name: supervisingTutorName.trim() || 'Orbit Space Academic Mentor',
        role: supervisingTutorRole.trim() || 'Project Supervisor'
      },
      tags: tagsArray,
      deployedBy: deployedByInfo
    };

    try {
      if (editingArticleId) {
        // Update
        const res = await updateArticleAsync(editingArticleId, articlePayload);

        if (res.success) {
          showToast(statusToSet === 'published' ? 'Article deployed live to public website!' : 'Article draft updated.');
          playSound('success');
          setIsEditorOpen(false);
          loadData();
        } else {
          showToast(res.error || 'Failed to update article.');
        }
      } else {
        // Create new
        const res = await createOrDeployArticleAsync(articlePayload as Omit<ArticleRecord, 'id' | 'createdAt' | 'updatedAt'>);

        if (res.success) {
          showToast(statusToSet === 'published' ? 'Article deployed live to public website!' : 'Article saved as draft.');
          playSound('success');
          setIsEditorOpen(false);
          loadData();
        } else {
          showToast(res.error || 'Failed to deploy article.');
        }
      }
    } catch (e: any) {
      showToast(e.message || 'Error processing article action.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (art: ArticleRecord) => {
    const nextStatus = art.status === 'published' ? 'draft' : 'published';
    playSound('toggle');
    const res = await updateArticleAsync(art.id, { status: nextStatus });
    if (res.success) {
      showToast(nextStatus === 'published' ? `"${art.title}" deployed to public site!` : `"${art.title}" reverted to draft.`);
      loadData();
    }
  };

  const handleDeleteArticle = async (art: ArticleRecord) => {
    if (!window.confirm(`Are you sure you want to delete the article "${art.title}"?`)) {
      return;
    }

    playSound('trash');
    const res = await deleteArticleAsync(art.id);
    if (res.success) {
      showToast('Article deleted successfully.');
      loadData();
    } else {
      showToast(res.error || 'Failed to delete article.');
    }
  };

  // Filter articles
  const filteredArticles = articles.filter(art => {
    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.studentAuthors.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (art.supervisingTutor && art.supervisingTutor.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || art.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['all', 'Web Engineering', 'Embedded Systems & IoT', 'Cybersecurity', 'Data Science', 'UI/UX & Product Design', 'SIWES Placement'];

  return (
    <div className="space-y-6" id="admin-articles-studio">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#1e1a2f] border border-purple-500/80 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-medium text-xs backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Action Bar */}
      <div className="bg-[#181524] rounded-[24px] p-5 sm:p-6 border border-[#332d47] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg sm:text-xl font-serif text-[#ffffff] font-normal tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#c084fc]" />
              Research & Articles Deployment Studio
            </h2>
          </div>
          <p className="text-xs text-[#c4c7c8] font-light mt-1 max-w-2xl">
            Publish student capstones, technical research papers, and SIWES case studies. Automatically binds student authors to their official credentials and capstone projects.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <button
            onClick={() => {
              setIsAiGeneratorOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/50 hover:border-purple-400 text-purple-200 hover:text-white transition-all text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            title="Generate structured technical article draft from student capstone"
            id="btn-ai-generate-article"
          >
            <span>AI Draft Generator</span>
          </button>

          <button
            onClick={handleOpenNewArticle}
            className="btn-purple px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
            id="btn-new-article"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Sub-Admin Stealth Gateway & Route Security Management */}
      <div className="bg-[#181524] rounded-2xl p-4 sm:p-5 border border-purple-900/40 bg-gradient-to-r from-purple-950/30 via-[#181524] to-[#181524] shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#c084fc]" />
              <span className="text-xs font-semibold text-white tracking-tight">
                Sub-Admin Editorial Gateway & URL Obfuscation
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                Active Stealth Protection
              </span>
            </div>
            <p className="text-[11px] text-[#a39ebb] font-light max-w-2xl">
              To prevent casual discovery or guessing, common paths like <code className="text-purple-300 font-mono">/editor</code> and <code className="text-purple-300 font-mono">/sub-admin</code> are hidden. Remote editorial staff must use this secret unguessable URL:
            </p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
            <div className="bg-[#100e17] border border-[#332d47] px-3 py-1.5 rounded-xl font-mono text-xs text-purple-300 flex items-center gap-2 select-all max-w-full overflow-x-auto">
              <Lock className="w-3 h-3 text-[#a855f7] shrink-0" />
              <span>/{subAdminSlug}</span>
            </div>

            <button
              type="button"
              onClick={handleCopyGatewayUrl}
              className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/60 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy full secret link to clipboard"
            >
              {copiedGateway ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsEditingSlug(!isEditingSlug);
                setSlugDraft(subAdminSlug);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#201b33] hover:bg-[#2c2547] border border-[#3e3559] text-gray-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>{isEditingSlug ? 'Cancel' : 'Change Slug'}</span>
            </button>
          </div>
        </div>

        {/* Inline Slug Customizer */}
        {isEditingSlug && (
          <div className="mt-3 pt-3 border-t border-[#332d47] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <span className="text-xs text-gray-400 shrink-0 font-mono">Custom Gateway Slug: /</span>
            <input
              type="text"
              value={slugDraft}
              onChange={(e) => setSlugDraft(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
              placeholder="e.g. orbit-fellows-gate-7x1z"
              className="flex-1 bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-3 py-1.5 outline-none font-mono"
            />
            <button
              type="button"
              onClick={handleSaveNewSlug}
              className="btn-purple px-4 py-1.5 rounded-xl text-xs font-medium cursor-pointer shrink-0"
            >
              Save New Gateway
            </button>
            <button
              type="button"
              onClick={() => {
                resetSubAdminRouteSlug();
                setSubAdminSlug(getSubAdminRouteSlug());
                setSlugDraft(getSubAdminRouteSlug());
                setIsEditingSlug(false);
                showToast('Reset to default secret gateway.');
              }}
              className="px-3 py-1.5 rounded-xl bg-[#100e17] border border-[#332d47] text-gray-400 hover:text-white text-xs cursor-pointer shrink-0"
            >
              Reset Default
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#181524] rounded-2xl p-4 border border-[#332d47] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#8e8a9f] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, student author, or supervising tutor..."
            className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category & Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-xs text-[#e5e2e1] rounded-xl px-3 py-2.5 outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Tracks & Categories' : cat}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-xs text-[#e5e2e1] rounded-xl px-3 py-2.5 outline-none"
          >
            <option value="all">All Deployment States</option>
            <option value="published">Deployed / Published Live</option>
            <option value="draft">Drafts</option>
          </select>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-[#100e17] border border-[#332d47] text-[#c4c7c8] hover:text-white transition-colors"
            title="Refresh Articles"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Articles Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="articles-list-container">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full bg-[#181524] rounded-[24px] p-10 border border-[#332d47] text-center space-y-3">
            <FileText className="w-10 h-10 text-[#5a5270] mx-auto" />
            <h3 className="text-base font-semibold text-white">No Articles Found</h3>
            <p className="text-xs text-[#8e8a9f] max-w-md mx-auto">
              No articles match your active search or filters. Click "Write New Article" or "AI Draft Generator" to publish student research.
            </p>
          </div>
        ) : (
          filteredArticles.map(art => {
            const student = art.studentAuthors[0];
            return (
              <motion.div
                key={art.id}
                layout
                className="bg-[#181524] rounded-[24px] border border-[#332d47] overflow-hidden shadow-xl hover:border-purple-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Article Thumbnail Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-[#100e17]">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181524] via-[#181524]/40 to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#100e17]/85 backdrop-blur-md text-[#c084fc] border border-purple-500/30">
                        {art.category}
                      </span>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium flex items-center gap-1.5 backdrop-blur-md ${
                        art.status === 'published'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${art.status === 'published' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        {art.status === 'published' ? 'Live on Site' : 'Draft'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-[#c4c7c8]">
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="w-3 h-3 text-[#a855f7]" /> {art.readTime}
                      </span>
                      <span className="text-[10px] font-mono text-[#8e8a9f]">
                        {art.publishedAt}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-serif font-medium text-[#ffffff] line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#a39ebb] line-clamp-2 leading-relaxed font-light">
                      {art.subtitle}
                    </p>

                    {/* Author Binding Card */}
                    <div className="bg-[#100e17] rounded-xl p-3 border border-[#332d47]/80 space-y-2">
                      {art.authorType === 'think-academy' ? (
                        <div className="flex items-start justify-between gap-2 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono uppercase text-amber-400 font-semibold block">
                              Think Academy Monograph
                            </span>
                            <span className="font-semibold text-white block">
                              {art.thinkAcademyAuthor?.name || 'Obitt'}
                            </span>
                            <span className="text-[10px] text-amber-200/80 block">
                              {art.thinkAcademyAuthor?.role || 'Founder & Lead Researcher, Think Academy'}
                            </span>
                          </div>

                          <span className="px-2 py-0.5 rounded-lg bg-amber-950/70 border border-amber-800/60 text-amber-300 text-[10px] font-mono shrink-0">
                            Obitt Editorial
                          </span>
                        </div>
                      ) : student ? (
                        <div className="flex items-start justify-between gap-2 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono uppercase text-[#a855f7] tracking-wider block">
                              Student Author
                            </span>
                            <span className="font-semibold text-white block">
                              {student.name}
                            </span>
                            {student.courseTrack && (
                              <span className="text-[10px] text-[#8e8a9f] block">
                                {student.courseTrack}
                              </span>
                            )}
                          </div>

                          {student.certificateId ? (
                            <button
                              onClick={() => onNavigateToCertificate && onNavigateToCertificate(student.certificateId!)}
                              className="px-2 py-1 rounded-lg bg-purple-950/60 border border-purple-700/50 hover:border-purple-400 text-[#c084fc] text-[10px] font-mono flex items-center gap-1 transition-all"
                              title="Verify linked student certificate"
                            >
                              <Award className="w-3 h-3 text-emerald-400" />
                              <span>{student.certificateId}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-500 font-mono">Unlinked</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Institutional Editorial Publication</span>
                      )}

                      {/* Supervising Tutor / Origin */}
                      <div className="pt-2 border-t border-[#29233b] flex items-center justify-between text-[11px]">
                        <span className="text-[#8e8a9f]">
                          {art.authorType === 'think-academy' ? 'Publication Source:' : 'Supervisor:'}
                        </span>
                        <span className="font-medium text-[#e5e2e1] truncate max-w-[200px]">
                          {art.authorType === 'think-academy'
                            ? (art.thinkAcademyAuthor?.institution || 'Think Academy Research')
                            : (art.supervisingTutor?.name || 'Orbit Space Mentor')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 pt-0 border-t border-[#29233b]/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {onViewPublicArticle && (
                      <button
                        onClick={() => onViewPublicArticle(art.slug)}
                        className="p-2 rounded-xl bg-[#100e17] hover:bg-[#201a2f] border border-[#332d47] text-[#c4c7c8] hover:text-white transition-all"
                        title="View Public Article Reader"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleStatus(art)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        art.status === 'published'
                          ? 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-900/60'
                          : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/60'
                      }`}
                      title={art.status === 'published' ? 'Revert to Draft' : 'Deploy to Website'}
                    >
                      {art.status === 'published' ? 'Revert to Draft' : 'Deploy Live'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditArticle(art)}
                      className="px-3 py-1.5 rounded-xl bg-[#221c35] hover:bg-[#2e2648] border border-purple-800/40 text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-all"
                      title="Edit Article"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteArticle(art)}
                      className="p-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-900/40 text-rose-400 hover:text-rose-200 transition-all"
                      title="Delete Article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ARTICLE EDITOR MODAL / DRAWER */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#181524] rounded-[28px] border border-[#3e3559] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden relative my-auto"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-[#332d47] flex items-center justify-between gap-4 bg-[#14121d]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-[#c084fc]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-medium text-white">
                      {editingArticleId ? 'Edit Article & Capstone Research' : 'Compose & Deploy New Article'}
                    </h3>
                    <span className="text-[11px] text-[#8e8a9f]">
                      Published under Orbit Space Academia Research Portal
                    </span>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-2">
                  <div className="bg-[#100e17] p-1 rounded-xl border border-[#332d47] flex items-center">
                    <button
                      onClick={() => setPreviewTab('edit')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        previewTab === 'edit' ? 'bg-[#2b243f] text-white' : 'text-[#8e8a9f] hover:text-white'
                      }`}
                    >
                      Editor
                    </button>
                    <button
                      onClick={() => setPreviewTab('preview')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        previewTab === 'preview' ? 'bg-[#2b243f] text-white' : 'text-[#8e8a9f] hover:text-white'
                      }`}
                    >
                      Reader Preview
                    </button>
                  </div>

                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="p-2 rounded-xl bg-[#100e17] hover:bg-[#201a2f] border border-[#332d47] text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {previewTab === 'edit' ? (
                  <div className="space-y-5">
                    {/* Basic Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-8 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-300">
                          Article Title *
                        </label>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={(e) => {
                            setFormTitle(e.target.value);
                            if (!formSlug || formSlug === formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) {
                              setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
                            }
                          }}
                          placeholder="e.g. Distributed Real-Time Inventory Architecture in Modern Web Apps"
                          className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-4 py-2.5 outline-none font-medium"
                        />
                      </div>

                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-300">
                          Category / Track *
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-3 py-2.5 outline-none"
                        >
                          <option value="Web Engineering">Web Engineering</option>
                          <option value="Embedded Systems & IoT">Embedded Systems & IoT</option>
                          <option value="Cybersecurity">Cybersecurity</option>
                          <option value="Data Science">Data Science</option>
                          <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                          <option value="SIWES Placement">SIWES Placement</option>
                        </select>
                      </div>

                      <div className="sm:col-span-8 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-300">
                          URL Slug (Perm-link)
                        </label>
                        <input
                          type="text"
                          value={formSlug}
                          onChange={(e) => setFormSlug(e.target.value)}
                          placeholder="e.g. distributed-realtime-inventory-systems"
                          className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-4 py-2 outline-none font-mono"
                        />
                      </div>

                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-300">
                          Estimated Read Time
                        </label>
                        <input
                          type="text"
                          value={formReadTime}
                          onChange={(e) => setFormReadTime(e.target.value)}
                          placeholder="e.g. 5 min read"
                          className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-4 py-2 outline-none"
                        />
                      </div>

                      <div className="sm:col-span-12 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-300">
                          Subtitle & Abstract Summary *
                        </label>
                        <textarea
                          rows={2}
                          value={formSubtitle}
                          onChange={(e) => setFormSubtitle(e.target.value)}
                          placeholder="Brief 1-2 sentence executive summary describing the student project and problem solved..."
                          className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl p-3 outline-none"
                        />
                      </div>
                    </div>

                    {/* Featured Image & Presets */}
                    <div className="bg-[#120f1b] p-4 rounded-2xl border border-[#332d47] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#c084fc]" />
                          Featured Banner Image URL
                        </label>
                        <span className="text-[10px] text-[#8e8a9f]">Choose a high-res preset or custom image URL</span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formCoverImage}
                          onChange={(e) => setFormCoverImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-4 py-2 outline-none font-mono"
                        />
                        {formCoverImage && (
                          <div className="w-12 h-10 rounded-lg overflow-hidden border border-[#332d47] shrink-0">
                            <img src={formCoverImage} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Image Presets Selector */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                        {PRESET_ARTICLE_IMAGES.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFormCoverImage(preset.url);
                              playSound('droplet');
                            }}
                            className={`group relative rounded-xl overflow-hidden border text-left p-1 transition-all ${
                              formCoverImage === preset.url ? 'border-[#a855f7] ring-1 ring-[#a855f7]' : 'border-[#332d47] hover:border-purple-500/50'
                            }`}
                          >
                            <div className="h-12 w-full rounded-lg overflow-hidden">
                              <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </div>
                            <span className="text-[9px] font-medium text-[#c4c7c8] truncate block mt-1">
                              {preset.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Authorship Origin & Type Switcher */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#c084fc]" />
                          Authorship Attribution *
                        </label>
                        <span className="text-[10px] font-mono text-[#a855f7]">
                          {authorType === 'think-academy' ? 'Think Academy Monograph' : 'Student Capstone Research'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1.5 bg-[#100e17] rounded-2xl border border-[#332d47]">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthorType('student');
                            playSound('droplet');
                          }}
                          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            authorType === 'student'
                              ? 'bg-purple-900/70 text-white border border-purple-500/60 shadow-md'
                              : 'text-gray-400 hover:text-gray-200 hover:bg-[#181524]'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5 text-purple-300" />
                          <span>Student Capstone Author</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAuthorType('think-academy');
                            playSound('droplet');
                          }}
                          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            authorType === 'think-academy'
                              ? 'bg-amber-950/80 text-amber-200 border border-amber-500/70 shadow-md'
                              : 'text-gray-400 hover:text-gray-200 hover:bg-[#181524]'
                          }`}
                        >
                          <span>Think Academy (Obitt)</span>
                        </button>
                      </div>
                    </div>

                    {/* THINK ACADEMY AUTHOR FORM SECTION */}
                    {authorType === 'think-academy' ? (
                      <div className="bg-gradient-to-br from-[#1b1528] to-[#120f1b] p-4 sm:p-5 rounded-2xl border border-amber-600/50 space-y-4 shadow-lg">
                        <div className="flex items-center justify-between pb-3 border-b border-amber-900/30">
                          <span className="text-xs font-semibold text-white">
                            Think Academy Faculty & Monograph Attribution
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setThinkAuthorName('Obitt');
                              setThinkAuthorRole('Founder & Lead Researcher, Think Academy');
                              setThinkAuthorInstitution('Think Academy');
                              setThinkAuthorBio('Author of foundational engineering monographs and mental models at Think Academy, focused on first-principles thinking and distributed computing.');
                              playSound('sparkle');
                              showToast('Reset author to Obitt (Think Academy Founder)');
                            }}
                            className="text-[10px] text-amber-300 hover:text-white font-mono bg-amber-950/60 hover:bg-amber-900/70 px-2.5 py-1 rounded-lg border border-amber-700/50 transition-all cursor-pointer"
                          >
                            Reset to Obitt
                          </button>
                        </div>

                        <p className="text-[11px] text-amber-200/80 font-light leading-relaxed">
                          This article is authored by Obitt / Think Academy faculty. It appears with institutional monograph styling and does not require student certification links.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-amber-300">Author Name *</label>
                            <input
                              type="text"
                              value={thinkAuthorName}
                              onChange={(e) => setThinkAuthorName(e.target.value)}
                              placeholder="e.g. Obitt"
                              className="w-full bg-[#100e17] border border-amber-900/50 focus:border-amber-400 text-white text-xs rounded-xl px-3 py-2 outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-amber-300">Author Role / Academic Title</label>
                            <input
                              type="text"
                              value={thinkAuthorRole}
                              onChange={(e) => setThinkAuthorRole(e.target.value)}
                              placeholder="e.g. Founder & Lead Researcher, Think Academy"
                              className="w-full bg-[#100e17] border border-amber-900/50 focus:border-amber-400 text-white text-xs rounded-xl px-3 py-2 outline-none"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[10px] font-mono uppercase text-amber-300">Institution / Department</label>
                            <input
                              type="text"
                              value={thinkAuthorInstitution}
                              onChange={(e) => setThinkAuthorInstitution(e.target.value)}
                              placeholder="e.g. Think Academy"
                              className="w-full bg-[#100e17] border border-amber-900/50 focus:border-amber-400 text-white text-xs rounded-xl px-3 py-2 outline-none"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[10px] font-mono uppercase text-amber-300">Author Bio & Editorial Note</label>
                            <textarea
                              rows={2}
                              value={thinkAuthorBio}
                              onChange={(e) => setThinkAuthorBio(e.target.value)}
                              placeholder="Brief background on the author's research or mental model..."
                              className="w-full bg-[#100e17] border border-amber-900/50 focus:border-amber-400 text-white text-xs rounded-xl p-3 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* STUDENT AUTHOR FORM SECTION */
                      <div className="bg-[#120f1b] p-4 sm:p-5 rounded-2xl border border-purple-900/40 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[#29233b]">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#c084fc]" />
                            <span className="text-xs font-semibold text-white">
                              Student Authors & Certification Linking
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                            Automatic Credential Binding
                          </span>
                        </div>

                        {/* Choose from existing issued certificates */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-gray-300">
                            Link to Registered Orbit Space Certificate:
                          </label>
                          <select
                            value={selectedStudentCertId}
                            onChange={(e) => handleSelectStudentCert(e.target.value)}
                            className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-3 py-2.5 outline-none font-mono"
                          >
                            <option value="">-- Select student from certificate database (or enter manual details below) --</option>
                            {certificates.map(cert => (
                              <option key={cert.id} value={cert.id}>
                                {cert.studentName} — {cert.course} ({cert.id})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-gray-400">Student Author Name</label>
                            <input
                              type="text"
                              value={studentAuthorName}
                              onChange={(e) => setStudentAuthorName(e.target.value)}
                              placeholder="e.g. Michael Adebayo"
                              className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-3 py-2 outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-gray-400">Certificate ID / Ref</label>
                            <input
                              type="text"
                              value={selectedStudentCertId}
                              onChange={(e) => setSelectedStudentCertId(e.target.value)}
                              placeholder="e.g. ORB-8F29K2"
                              className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-purple-300 font-mono text-xs rounded-xl px-3 py-2 outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-gray-400">Course / Academic Track</label>
                            <input
                              type="text"
                              value={studentCourseTrack}
                              onChange={(e) => setStudentCourseTrack(e.target.value)}
                              placeholder="e.g. Full-Stack Web Development"
                              className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-3 py-2 outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-gray-400">Capstone Project Title</label>
                            <input
                              type="text"
                              value={studentProjectTitle}
                              onChange={(e) => setStudentProjectTitle(e.target.value)}
                              placeholder="e.g. Distributed Inventory Microservices Engine"
                              className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-3 py-2 outline-none"
                            />
                          </div>
                        </div>

                        {/* Supervising Tutor */}
                        <div className="pt-3 border-t border-[#29233b] grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-gray-400">Supervising Tutor / Instructor</label>
                            <input
                              type="text"
                              value={supervisingTutorName}
                              onChange={(e) => setSupervisingTutorName(e.target.value)}
                              placeholder="e.g. Engr. David Babatunde"
                              className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-3 py-2 outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-gray-400">Supervisor Academic Role</label>
                            <input
                              type="text"
                              value={supervisingTutorRole}
                              onChange={(e) => setSupervisingTutorRole(e.target.value)}
                              placeholder="e.g. Principal Web Architecture Fellow"
                              className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-3 py-2 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Article Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-300">
                          Article Body (Markdown Supported) *
                        </label>
                        <div className="text-[10px] text-gray-400 space-x-2">
                          <span>## Heading 2</span>
                          <span>* Bullet</span>
                          <span>&gt; Quote</span>
                          <span>\`\`\`code\`\`\`</span>
                        </div>
                      </div>
                      <textarea
                        rows={12}
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        placeholder="Write your technical analysis, implementation details, benchmarks, and conclusions..."
                        className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl p-4 outline-none font-mono leading-relaxed"
                      />
                    </div>

                    {/* Search Tags */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#a855f7]" />
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        placeholder="React, TypeScript, Microservices, Agriculture"
                        className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-4 py-2 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  /* Reader Preview Tab */
                  <div className="bg-[#100e17] rounded-2xl p-6 sm:p-8 border border-[#332d47] space-y-6">
                    {/* Header preview */}
                    <div className="space-y-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#221c35] text-[#c084fc] border border-purple-800/40 inline-block">
                        {formCategory}
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-serif text-white font-normal leading-tight">
                        {formTitle || 'Article Title Preview'}
                      </h1>
                      <p className="text-sm text-[#a39ebb] font-light leading-relaxed">
                        {formSubtitle || 'Executive summary will appear here...'}
                      </p>
                    </div>

                    {/* Cover image preview */}
                    {formCoverImage && (
                      <div className="h-64 w-full rounded-2xl overflow-hidden border border-[#332d47]">
                        <img src={formCoverImage} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Author credit card preview */}
                    {authorType === 'think-academy' ? (
                      <div className="bg-[#181524] rounded-2xl p-4 border border-amber-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold block">
                            Think Academy Monograph Author
                          </span>
                          <p className="text-sm font-semibold text-white">{thinkAuthorName || 'Obitt'}</p>
                          <p className="text-xs text-amber-200/90">{thinkAuthorRole || 'Founder & Lead Researcher'}</p>
                          {thinkAuthorBio && (
                            <p className="text-[11px] text-[#8e8a9f] font-light line-clamp-2 pt-1">{thinkAuthorBio}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-purple-400 block">Publication Authority</span>
                          <p className="text-sm font-semibold text-white">{thinkAuthorInstitution || 'Think Academy'}</p>
                          <p className="text-xs text-[#8e8a9f]">Academic Monograph Series</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#181524] rounded-2xl p-4 border border-[#332d47] grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#a855f7] block">Student Author</span>
                          <p className="text-sm font-semibold text-white">{studentAuthorName || 'Student Name'}</p>
                          <p className="text-xs text-[#8e8a9f]">{studentCourseTrack || 'Course Track'}</p>
                          {selectedStudentCertId && (
                            <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verified Certificate #{selectedStudentCertId}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#a855f7] block">Supervising Tutor</span>
                          <p className="text-sm font-semibold text-white">{supervisingTutorName || 'Supervisor Name'}</p>
                          <p className="text-xs text-[#8e8a9f]">{supervisingTutorRole || 'Faculty Designation'}</p>
                        </div>
                      </div>
                    )}

                    {/* Body markdown preview */}
                    <div className="text-xs sm:text-sm text-[#e2e8f0] font-light leading-relaxed whitespace-pre-wrap font-sans space-y-4">
                      {formContent || 'Article body preview will be rendered here...'}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-[#332d47] bg-[#14121d] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#100e17] hover:bg-[#201a2f] border border-[#332d47] text-gray-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSaveArticle('draft')}
                    className="px-4 py-2.5 rounded-xl bg-[#201a2f] hover:bg-[#2c2342] border border-[#3e3559] text-purple-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSaveArticle('published')}
                    className="btn-purple px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Deploy Live to Website</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI RESEARCH DRAFT GENERATOR MODAL */}
      <AnimatePresence>
        {isAiGeneratorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#181524] rounded-[28px] border border-purple-500/60 shadow-2xl w-full max-w-2xl overflow-hidden relative my-auto"
            >
              <div className="p-5 sm:p-6 border-b border-[#332d47] bg-gradient-to-r from-purple-950/60 to-indigo-950/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-900/80 border border-purple-600/80 flex items-center justify-center text-purple-200 font-mono text-sm font-bold">
                    AI
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-medium text-white">
                      AI Article Draft Generator
                    </h3>
                    <p className="text-[11px] text-purple-200">
                      Crafts a high-impact technical paper or Think Academy research monograph.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAiGeneratorOpen(false)}
                  className="p-2 rounded-xl bg-[#100e17] text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="p-4 sm:p-5 pb-0">
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#100e17] rounded-xl border border-[#332d47]">
                  <button
                    type="button"
                    onClick={() => {
                      setAiGeneratorMode('student');
                      playSound('droplet');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      aiGeneratorMode === 'student'
                        ? 'bg-purple-900/80 text-white border border-purple-500/60 shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-purple-300" />
                    <span>Student Capstone</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAiGeneratorMode('think-academy');
                      playSound('droplet');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      aiGeneratorMode === 'think-academy'
                        ? 'bg-amber-950/80 text-amber-200 border border-amber-600/70 shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>Think Academy (Obitt)</span>
                  </button>
                </div>
              </div>

              {aiGeneratorMode === 'think-academy' ? (
                /* THINK ACADEMY AI GENERATOR FIELDS */
                <div className="p-5 sm:p-6 space-y-4 text-xs">
                  <div className="bg-amber-950/40 p-3.5 rounded-xl border border-amber-700/40 text-amber-200/90 text-xs">
                    Generate an in-depth technical monograph authored by Obitt for Think Academy, focusing on mental models, distributed architecture, and first principles.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-300">Author Name *</label>
                      <input
                        type="text"
                        value={aiThinkAuthorName}
                        onChange={(e) => setAiThinkAuthorName(e.target.value)}
                        placeholder="e.g. Obitt"
                        className="w-full bg-[#100e17] border border-[#332d47] focus:border-amber-400 text-white rounded-xl px-3 py-2 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-gray-300">Author Designation</label>
                      <input
                        type="text"
                        value={aiThinkAuthorRole}
                        onChange={(e) => setAiThinkAuthorRole(e.target.value)}
                        placeholder="e.g. Founder & Lead Researcher, Think Academy"
                        className="w-full bg-[#100e17] border border-[#332d47] focus:border-amber-400 text-white rounded-xl px-3 py-2 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-300">Monograph Research Topic / Concept *</label>
                    <input
                      type="text"
                      value={aiThinkTopic}
                      onChange={(e) => setAiThinkTopic(e.target.value)}
                      placeholder="e.g. Distributed State Invariants, Reactive Event Sourcing & Architectural Simplicity"
                      className="w-full bg-[#100e17] border border-[#332d47] focus:border-amber-400 text-white rounded-xl px-3 py-2 outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-300">Technical Domain / Category</label>
                    <select
                      value={aiThinkCategory}
                      onChange={(e) => setAiThinkCategory(e.target.value)}
                      className="w-full bg-[#100e17] border border-[#332d47] focus:border-amber-400 text-white text-xs rounded-xl px-3 py-2 outline-none"
                    >
                      <option value="Distributed Systems">Distributed Systems & Backend Engineering</option>
                      <option value="Software Architecture">Software Architecture & Mental Models</option>
                      <option value="Web Engineering">Full-Stack Web Engineering</option>
                      <option value="Artificial Intelligence">Applied AI & Cognitive Systems</option>
                      <option value="DevOps & Reliability">Site Reliability & Cloud Infrastructure</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-300">Key Principles & Philosophical Pillars (Optional)</label>
                    <textarea
                      rows={3}
                      value={aiThinkHighlights}
                      onChange={(e) => setAiThinkHighlights(e.target.value)}
                      placeholder="e.g. Avoid unnecessary microservices; treat database as immutable append-only log; prioritize deterministic state transitions."
                      className="w-full bg-[#100e17] border border-[#332d47] focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* STUDENT CAPSTONE AI GENERATOR FIELDS */
                <div className="p-5 sm:p-6 space-y-4 text-xs">
                  {/* Select from existing students */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-200 block">
                      Choose Certified Orbit Space Student:
                    </label>
                    <select
                      value={aiStudentCertId}
                      onChange={(e) => handleSelectAiStudentCert(e.target.value)}
                      className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-3 py-2.5 outline-none font-mono"
                    >
                      <option value="">-- Choose certified student to auto-fill details --</option>
                      {certificates.map(cert => (
                        <option key={cert.id} value={cert.id}>
                          {cert.studentName} — {cert.course} ({cert.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-300">Student Author Name *</label>
                      <input
                        type="text"
                        value={aiStudentName}
                        onChange={(e) => setAiStudentName(e.target.value)}
                        placeholder="e.g. Michael Adebayo"
                        className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white rounded-xl px-3 py-2 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-gray-300">Academic Track *</label>
                      <input
                        type="text"
                        value={aiCourseTrack}
                        onChange={(e) => setAiCourseTrack(e.target.value)}
                        placeholder="e.g. Full-Stack Web Development"
                        className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white rounded-xl px-3 py-2 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-300">Capstone Project Title *</label>
                    <input
                      type="text"
                      value={aiProjectTitle}
                      onChange={(e) => setAiProjectTitle(e.target.value)}
                      placeholder="e.g. Real-Time Microservices Inventory Sync Platform"
                      className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white rounded-xl px-3 py-2 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-300">Supervising Tutor</label>
                      <input
                        type="text"
                        value={aiTutorName}
                        onChange={(e) => setAiTutorName(e.target.value)}
                        placeholder="e.g. Engr. David Babatunde"
                        className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white rounded-xl px-3 py-2 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-gray-300">Supervisor Designation</label>
                      <input
                        type="text"
                        value={aiTutorRole}
                        onChange={(e) => setAiTutorRole(e.target.value)}
                        placeholder="e.g. Principal Web Architecture Fellow"
                        className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white rounded-xl px-3 py-2 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-300">Key Technical Milestones (Optional)</label>
                    <textarea
                      rows={3}
                      value={aiHighlights}
                      onChange={(e) => setAiHighlights(e.target.value)}
                      placeholder="e.g. Achieved 42ms checkout latency under heavy simulation. Zero lost transactions over 4-hour simulated network outage."
                      className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white rounded-xl p-3 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-5 border-t border-[#332d47] bg-[#14121d] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAiGeneratorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#100e17] text-gray-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleExecuteAiGenerate}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                    aiGeneratorMode === 'think-academy'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white'
                      : 'btn-purple'
                  }`}
                >
                  <span>{aiGeneratorMode === 'think-academy' ? 'Generate Think Academy Monograph' : 'Generate Student Article'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
