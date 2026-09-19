import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Award, 
  ShieldCheck, 
  User, 
  Share2, 
  Check, 
  BookOpen, 
  ExternalLink,
  Tag,
  Building,
  ChevronRight
} from 'lucide-react';
import { ArticleRecord, getArticleBySlug, getArticles } from '../services/articleService';
import { playSound } from '../utils/soundEffects';

interface ArticleDetailPageProps {
  slug: string;
  onBack: () => void;
  onNavigateToCertificate: (certId: string) => void;
  onSelectArticle: (slug: string) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({
  slug,
  onBack,
  onNavigateToCertificate,
  onSelectArticle
}) => {
  const [article, setArticle] = useState<ArticleRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<ArticleRecord[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const current = getArticleBySlug(slug);
    setArticle(current);

    if (current) {
      const all = getArticles().filter(a => a.status === 'published' && a.id !== current.id);
      setRelatedArticles(all.slice(0, 3));
    }
  }, [slug]);

  if (!article) {
    return (
      <div className="min-h-screen bg-[#100e17] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-serif mb-2">Publication Not Found</h2>
        <p className="text-xs text-gray-400 mb-6">The requested technical paper or article does not exist or may have been un-deployed.</p>
        <button
          onClick={onBack}
          className="btn-purple px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </button>
      </div>
    );
  }

  const primaryStudent = article.studentAuthors[0];

  const handleCopyLink = () => {
    playSound('droplet');
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  /**
   * Simple, reliable markdown-like parser for technical article text
   */
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    lines.forEach((line, index) => {
      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="bg-[#0b0a10] border border-[#2d273f] rounded-2xl p-4 my-4 overflow-x-auto text-xs font-mono text-purple-200">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headings
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl sm:text-2xl font-serif text-white font-normal mt-8 mb-3 tracking-tight border-b border-[#29233b] pb-2">
            {line.replace('## ', '')}
          </h2>
        );
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-base sm:text-lg font-serif text-purple-200 font-medium mt-6 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="border-l-4 border-[#a855f7] bg-[#181524] px-4 py-3 rounded-r-xl my-4 text-xs sm:text-sm text-[#c4c7c8] italic leading-relaxed">
            {line.replace('> ', '')}
          </blockquote>
        );
        return;
      }

      // Bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const clean = line.trim().replace(/^[\*\-]\s+/, '');
        elements.push(
          <li key={index} className="ml-5 list-disc text-xs sm:text-sm text-[#e2e8f0] font-light leading-relaxed my-1">
            {clean}
          </li>
        );
        return;
      }

      // Dividers
      if (line.trim() === '---') {
        elements.push(<hr key={index} className="border-[#29233b] my-6" />);
        return;
      }

      // Standard paragraphs
      if (line.trim().length > 0) {
        elements.push(
          <p key={index} className="text-xs sm:text-sm text-[#cbd5e1] font-light leading-relaxed my-3 font-sans">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="min-h-screen bg-[#100e17] text-[#e5e2e1] pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />

      <article className="max-w-[860px] mx-auto relative z-10 space-y-8">
        
        {/* Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-[#c4c7c8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer bg-[#181524] px-3.5 py-2 rounded-xl border border-[#332d47]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Articles & Capstones</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="text-xs font-semibold text-[#c084fc] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer bg-[#181524] px-3.5 py-2 rounded-xl border border-[#332d47]"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Article'}</span>
          </button>
        </div>

        {/* Article Meta Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#221c35] text-[#c084fc] border border-purple-800/50">
              {article.category}
            </span>
            <span className="text-xs text-[#8e8a9f] font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#a855f7]" /> {article.publishedAt}
            </span>
            <span className="text-xs text-[#8e8a9f] font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#a855f7]" /> {article.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif text-white font-normal leading-tight tracking-tight">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base text-[#c4c7c8] font-light leading-relaxed">
            {article.subtitle}
          </p>
        </header>

        {/* Cover Image Banner */}
        <div className="relative h-64 sm:h-96 w-full rounded-[28px] overflow-hidden border border-[#332d47] shadow-2xl bg-[#100e17]">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* CRITICAL FEATURE: BI-DIRECTIONAL STUDENT AUTHOR & TUTOR LINKING BOX */}
        <div className="bg-[#181524] rounded-[28px] p-5 sm:p-7 border border-purple-800/40 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#2e2645]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#c084fc]" />
              <span className="text-xs sm:text-sm font-semibold text-white">
                Academic Capstone Research Authorship
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Orbit Space Research
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Student Author Card */}
            {primaryStudent ? (
              <div className="bg-[#100e17] rounded-2xl p-4 border border-[#332d47] space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#a855f7] tracking-wider block">
                    Student Author & Alum
                  </span>
                  <h4 className="text-base font-semibold text-white">
                    {primaryStudent.name}
                  </h4>
                  {primaryStudent.courseTrack && (
                    <p className="text-xs text-[#c4c7c8]">
                      Track: {primaryStudent.courseTrack}
                    </p>
                  )}
                  {primaryStudent.projectTitle && (
                    <p className="text-xs text-[#8e8a9f] italic">
                      Project: "{primaryStudent.projectTitle}"
                    </p>
                  )}
                </div>

                {primaryStudent.certificateId ? (
                  <button
                    onClick={() => {
                      playSound('sparkle');
                      onNavigateToCertificate(primaryStudent.certificateId!);
                    }}
                    className="w-full mt-2 py-2.5 px-3 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700/60 hover:border-purple-400 text-[#c084fc] hover:text-white text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verify Official Certificate #{primaryStudent.certificateId}</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </button>
                ) : (
                  <div className="text-[11px] text-[#8e8a9f] font-mono pt-1">
                    Orbit Space Certified Program Alum
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#100e17] rounded-2xl p-4 border border-[#332d47] space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#a855f7] block">Authorship</span>
                <h4 className="text-sm font-semibold text-white">Orbit Space Editorial Team</h4>
              </div>
            )}

            {/* Supervising Tutor Card */}
            <div className="bg-[#100e17] rounded-2xl p-4 border border-[#332d47] space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#a855f7] tracking-wider block">
                  Supervising Faculty / Tutor
                </span>
                <h4 className="text-base font-semibold text-white">
                  {article.supervisingTutor?.name || 'Orbit Space Academic Mentor'}
                </h4>
                <p className="text-xs text-[#c4c7c8]">
                  {article.supervisingTutor?.role || 'Senior Academic & Research Supervisor'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#29233b] flex items-center justify-between text-[11px] text-[#8e8a9f]">
                <span className="flex items-center gap-1 font-mono">
                  <Building className="w-3 h-3 text-[#a855f7]" /> Orbit Space Academia
                </span>
                <span className="text-[#a855f7] font-medium">Faculty Review Board</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Article Body Text */}
        <section className="bg-[#181524] rounded-[28px] p-6 sm:p-10 border border-[#332d47] shadow-xl text-white">
          <div className="prose prose-invert max-w-none">
            {renderFormattedContent(article.content)}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#332d47] flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#8e8a9f] flex items-center gap-1 font-mono">
                <Tag className="w-3.5 h-3.5 text-[#a855f7]" /> Keywords:
              </span>
              {article.tags.map(tag => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#100e17] text-[#c4c7c8] border border-[#332d47]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4 pt-6">
            <h3 className="text-lg font-serif text-white font-normal flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#c084fc]" />
              <span>More Orbit Space Research & Case Studies</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => {
                    playSound('chime');
                    onSelectArticle(rel.slug);
                  }}
                  className="bg-[#181524] rounded-2xl p-4 border border-[#332d47] hover:border-purple-500/50 transition-all cursor-pointer group space-y-2"
                >
                  <span className="text-[10px] font-mono text-[#a855f7]">{rel.category}</span>
                  <h4 className="text-xs font-serif font-medium text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {rel.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-[#8e8a9f] pt-1">
                    <span>{rel.readTime}</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-[#c084fc]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </article>
    </div>
  );
};
