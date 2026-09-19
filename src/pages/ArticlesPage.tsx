import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Search, 
  Clock, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  Filter, 
  BookOpen,
  ExternalLink,
  ChevronRight,
  PenTool
} from 'lucide-react';
import { ArticleRecord, getArticles, syncArticlesFromFirebase } from '../services/articleService';
import { playSound } from '../utils/soundEffects';

interface ArticlesPageProps {
  onSelectArticle: (slug: string) => void;
  onNavigateToCertificate: (certId: string) => void;
}

export const ArticlesPage: React.FC<ArticlesPageProps> = ({
  onSelectArticle,
  onNavigateToCertificate
}) => {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [authorshipFilter, setAuthorshipFilter] = useState<'all' | 'think-academy' | 'student'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load articles from local cache first
    const local = getArticles().filter(a => a.status === 'published');
    setArticles(local);
    setIsLoading(false);

    // Sync from Firebase
    syncArticlesFromFirebase().then((synced) => {
      setArticles(synced.filter(a => a.status === 'published'));
    });
  }, []);

  const categories = [
    'all',
    'Web Engineering',
    'Embedded Systems & IoT',
    'Cybersecurity',
    'Data Science',
    'UI/UX & Product Design'
  ];

  const filteredArticles = articles.filter(art => {
    const isThinkAcademy = art.authorType === 'think-academy';
    
    // Authorship filter
    if (authorshipFilter === 'think-academy' && !isThinkAcademy) return false;
    if (authorshipFilter === 'student' && isThinkAcademy) return false;

    // Category filter
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    
    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch = 
      art.title.toLowerCase().includes(q) ||
      art.subtitle.toLowerCase().includes(q) ||
      (isThinkAcademy && (
        art.thinkAcademyAuthor?.name?.toLowerCase().includes(q) ||
        art.thinkAcademyAuthor?.role?.toLowerCase().includes(q) ||
        art.thinkAcademyAuthor?.institution?.toLowerCase().includes(q) ||
        q.includes('think') ||
        q.includes('obitt')
      )) ||
      art.studentAuthors.some(a => a.name.toLowerCase().includes(q)) ||
      (art.supervisingTutor && art.supervisingTutor.name.toLowerCase().includes(q)) ||
      art.tags.some(t => t.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles[0];
  const gridArticles = filteredArticles.slice(1);

  return (
    <div className="min-h-screen bg-[#100e17] text-[#e5e2e1] pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative" id="articles-page">
      {/* Ambient background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-purple-900/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-[1240px] mx-auto relative z-10 space-y-12">
        
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181524] border border-purple-800/40 text-xs font-mono text-[#c084fc]">
            <span>Orbit Space Publications & Think Academy Research</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif text-[#ffffff] font-normal tracking-tight leading-tight">
            Technical Research, Think Academy Monograms & Student Capstones
          </h1>

          <p className="text-sm sm:text-base text-[#c4c7c8] font-light leading-relaxed">
            Explore architectural monographs authored by Obitt from Think Academy alongside peer-reviewed engineering case studies engineered by certified Orbit Space students.
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-[#181524] p-3.5 sm:p-5 rounded-2xl border border-[#332d47] space-y-3.5 shadow-xl">
          {/* Top Row: Authorship Source Toggle & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#29233b]">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[11px] font-mono uppercase text-gray-400 shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#a855f7]" /> Source:
              </span>
              
              <button
                onClick={() => {
                  playSound('droplet');
                  setAuthorshipFilter('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  authorshipFilter === 'all'
                    ? 'btn-purple text-white shadow-md'
                    : 'bg-[#100e17] text-[#c4c7c8] hover:text-white border border-[#332d47]'
                }`}
              >
                All Sources ({articles.length})
              </button>

              <button
                onClick={() => {
                  playSound('droplet');
                  setAuthorshipFilter('think-academy');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  authorshipFilter === 'think-academy'
                    ? 'bg-amber-600 text-white font-semibold shadow-lg shadow-amber-900/30'
                    : 'bg-[#100e17] text-amber-300 hover:text-white border border-amber-800/50'
                }`}
              >
                <span>Think Academy (Obitt)</span>
              </button>

              <button
                onClick={() => {
                  playSound('droplet');
                  setAuthorshipFilter('student');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  authorshipFilter === 'student'
                    ? 'btn-purple text-white shadow-md'
                    : 'bg-[#100e17] text-[#c4c7c8] hover:text-white border border-[#332d47]'
                }`}
              >
                <Award className="w-3 h-3 text-[#c084fc]" />
                <span>Student Capstones</span>
              </button>
            </div>

            {/* Search bar */}
            <div className="relative w-full sm:w-80 shrink-0">
              <Search className="w-4 h-4 text-[#8e8a9f] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Obitt, Think Academy, student, topic..."
                className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl pl-9 pr-4 py-2 outline-none transition-all"
              />
            </div>
          </div>

          {/* Bottom Row: Categories Pill List */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono uppercase text-gray-400 shrink-0 mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playSound('droplet');
                  setSelectedCategory(cat);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-purple-900/80 text-purple-200 border border-purple-500/60'
                    : 'bg-[#100e17] text-[#8e8a9f] hover:text-white border border-[#2d273f]'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* FEATURED PUBLICATION BANNER (if available) */}
        {featuredArticle && !searchQuery && selectedCategory === 'all' && authorshipFilter === 'all' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#181524] rounded-[32px] border border-purple-900/50 overflow-hidden shadow-2xl hover:border-purple-500/60 transition-all grid grid-cols-1 lg:grid-cols-12 group cursor-pointer"
            onClick={() => {
              playSound('chime');
              onSelectArticle(featuredArticle.slug);
            }}
          >
            {/* Image */}
            <div className="lg:col-span-6 relative h-64 lg:h-auto min-h-[300px] overflow-hidden bg-[#100e17]">
              <img
                src={featuredArticle.coverImage}
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent to-[#181524]/90" />
              
              {featuredArticle.authorType === 'think-academy' ? (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/90 backdrop-blur-md text-amber-300 border border-amber-700/60 shadow-lg">
                  Think Academy Monograph • by Obitt
                </span>
              ) : (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/85 backdrop-blur-md text-[#c084fc] border border-purple-700/60 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  Featured Academic Capstone
                </span>
              )}
            </div>

            {/* Info */}
            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-mono text-[#8e8a9f]">
                  <span className={featuredArticle.authorType === 'think-academy' ? 'text-amber-400 font-semibold' : 'text-[#a855f7] font-semibold'}>
                    {featuredArticle.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#c084fc]" />
                    {featuredArticle.readTime}
                  </span>
                  <span>•</span>
                  <span>{featuredArticle.publishedAt}</span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif text-white font-normal leading-snug group-hover:text-purple-300 transition-colors">
                  {featuredArticle.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#a39ebb] font-light leading-relaxed line-clamp-3">
                  {featuredArticle.subtitle}
                </p>
              </div>

              {/* Author Credits */}
              <div className="pt-4 border-t border-[#332d47] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  {featuredArticle.authorType === 'think-academy' ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {featuredArticle.thinkAcademyAuthor?.name || 'Obitt'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800/60">
                          <span>Think Academy Author</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8e8a9f] block">
                        {featuredArticle.thinkAcademyAuthor?.role || 'Founder & Lead Researcher, Think Academy'}
                      </span>
                    </div>
                  ) : (
                    <div>
                      {featuredArticle.studentAuthors[0] && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            {featuredArticle.studentAuthors[0].name}
                          </span>
                          {featuredArticle.studentAuthors[0].certificateId && (
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToCertificate(featuredArticle.studentAuthors[0].certificateId!);
                              }}
                              className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/80 text-[#c084fc] border border-purple-800/60 hover:border-purple-400 transition-colors flex items-center gap-1 cursor-pointer"
                              title="View verified graduate certificate"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>#{featuredArticle.studentAuthors[0].certificateId}</span>
                            </span>
                          )}
                        </div>
                      )}
                      {featuredArticle.supervisingTutor && (
                        <span className="text-[11px] text-[#8e8a9f] block">
                          Supervised by {featuredArticle.supervisingTutor.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#c084fc] group-hover:translate-x-1 transition-transform">
                  <span>{featuredArticle.authorType === 'think-academy' ? 'Read Full Monograph' : 'Read Full Case Study'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ARTICLES GRID */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif text-white font-normal flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#c084fc]" />
              <span>Published Research Articles</span>
              <span className="text-xs font-mono text-[#8e8a9f]">({filteredArticles.length})</span>
            </h3>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="bg-[#181524] rounded-[24px] p-12 border border-[#332d47] text-center space-y-3">
              <FileText className="w-10 h-10 text-[#5a5270] mx-auto" />
              <h4 className="text-base font-semibold text-white">No Publications Found</h4>
              <p className="text-xs text-[#8e8a9f] max-w-sm mx-auto">
                No published articles match your active filter. Try resetting your search or category selection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(searchQuery || selectedCategory !== 'all' || authorshipFilter !== 'all' ? filteredArticles : gridArticles).map(art => {
                const isThinkAcademy = art.authorType === 'think-academy';
                const student = art.studentAuthors[0];
                return (
                  <motion.div
                    key={art.id}
                    layout
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      playSound('chime');
                      onSelectArticle(art.slug);
                    }}
                    className={`bg-[#181524] rounded-[24px] border overflow-hidden shadow-xl transition-all flex flex-col justify-between group cursor-pointer ${
                      isThinkAcademy 
                        ? 'border-amber-900/40 hover:border-amber-500/70 hover:shadow-amber-950/20' 
                        : 'border-[#332d47] hover:border-purple-500/60'
                    }`}
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative h-48 w-full overflow-hidden bg-[#100e17]">
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#181524] via-[#181524]/30 to-transparent" />
                        
                        {isThinkAcademy ? (
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#100e17]/95 backdrop-blur-md text-amber-300 border border-amber-600/50">
                            Think Academy
                          </span>
                        ) : (
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#100e17]/90 backdrop-blur-md text-[#c084fc] border border-purple-500/30">
                            {art.category}
                          </span>
                        )}

                        <span className="absolute bottom-3 right-3 text-[10px] font-mono text-[#c4c7c8] bg-[#100e17]/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className={`w-3 h-3 ${isThinkAcademy ? 'text-amber-400' : 'text-[#a855f7]'}`} /> {art.readTime}
                        </span>
                      </div>

                      {/* Content Info */}
                      <div className="p-5 space-y-3">
                        <div className="text-[10px] font-mono text-[#8e8a9f]">
                          {art.publishedAt}
                        </div>

                        <h4 className={`text-base font-serif font-medium text-white transition-colors line-clamp-2 leading-snug ${
                          isThinkAcademy ? 'group-hover:text-amber-300' : 'group-hover:text-purple-300'
                        }`}>
                          {art.title}
                        </h4>

                        <p className="text-xs text-[#a39ebb] font-light line-clamp-2 leading-relaxed">
                          {art.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Author & Verification Footer */}
                    <div className="p-5 pt-0">
                      {isThinkAcademy ? (
                        <div className="bg-[#100e17] rounded-xl p-3 border border-amber-950/70 flex items-center justify-between gap-2">
                          <div className="space-y-0.5 truncate">
                            <span className="text-[9px] font-mono uppercase text-amber-400 font-semibold block">
                              Think Academy
                            </span>
                            <span className="text-xs font-semibold text-white truncate block">
                              {art.thinkAcademyAuthor?.name || 'Obitt'}
                            </span>
                          </div>

                          <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-800/60 text-amber-300 text-[10px] font-mono shrink-0">
                            Monograph
                          </span>
                        </div>
                      ) : (
                        <div className="bg-[#100e17] rounded-xl p-3 border border-[#2d273f] flex items-center justify-between gap-2">
                          <div className="space-y-0.5 truncate">
                            <span className="text-[9px] font-mono uppercase text-[#a855f7] block">
                              Student Researcher
                            </span>
                            <span className="text-xs font-semibold text-white truncate block">
                              {student?.name || 'Orbit Space Alum'}
                            </span>
                          </div>

                          {student?.certificateId && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playSound('sparkle');
                                onNavigateToCertificate(student.certificateId!);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-950/70 border border-purple-800/60 hover:border-purple-400 text-emerald-400 text-[10px] font-mono flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                              title="Verify Official Student Certificate"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{student.certificateId}</span>
                            </button>
                          )}
                        </div>
                      )}

                      <div className={`pt-3 flex items-center justify-between text-xs font-medium group-hover:text-white transition-colors ${
                        isThinkAcademy ? 'text-amber-400' : 'text-[#c084fc]'
                      }`}>
                        <span>{isThinkAcademy ? 'Read Monograph' : 'Read Case Study'}</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Academic Submissions Banner */}
        <div className="bg-gradient-to-r from-purple-950/40 via-[#181524] to-indigo-950/40 rounded-[28px] border border-purple-900/50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-serif text-white font-normal">
              Are you an Orbit Space Student or Capstone Supervisor?
            </h3>
            <p className="text-xs text-[#c4c7c8] font-light max-w-xl">
              Published articles are automatically indexed with your verifiable graduation credentials, showcasing your technical problem-solving directly to prospective employers and research institutions.
            </p>
          </div>

          <a
            href="https://wa.me/2348123456789?text=Hello%20Orbit%20Space%20Academic%20Desk!%20I%20would%20like%20to%20submit%20my%20capstone%20engineering%20article."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-purple px-6 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 shadow-lg cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Submit Capstone to Academic Desk</span>
          </a>
        </div>

      </div>
    </div>
  );
};
