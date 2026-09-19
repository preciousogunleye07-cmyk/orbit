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
  Sparkles, 
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
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.studentAuthors.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (art.supervisingTutor && art.supervisingTutor.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

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
            <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>Orbit Space Academic Research & Capstones</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif text-[#ffffff] font-normal tracking-tight leading-tight">
            Technical Case Studies & Student Engineering Papers
          </h1>

          <p className="text-sm sm:text-base text-[#c4c7c8] font-light leading-relaxed">
            Explore peer-reviewed engineering case studies, distributed cloud systems, and cybersecurity defensive architectures engineered by certified Orbit Space students and supervised by faculty mentors.
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-[#181524] p-3 sm:p-4 rounded-2xl border border-[#332d47] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
          {/* Categories Pill List */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playSound('droplet');
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'btn-purple text-white shadow-md'
                    : 'bg-[#100e17] text-[#c4c7c8] hover:text-white border border-[#332d47]'
                }`}
              >
                {cat === 'all' ? 'All Publications' : cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-[#8e8a9f] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, supervisor, or topic..."
              className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl pl-9 pr-4 py-2 outline-none transition-all"
            />
          </div>
        </div>

        {/* FEATURED PUBLICATION BANNER (if available) */}
        {featuredArticle && !searchQuery && selectedCategory === 'all' && (
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
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/85 backdrop-blur-md text-[#c084fc] border border-purple-700/60 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Featured Academic Capstone
              </span>
            </div>

            {/* Info */}
            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-mono text-[#8e8a9f]">
                  <span className="text-[#a855f7] font-semibold">{featuredArticle.category}</span>
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

              {/* Student & Supervisor Credits */}
              <div className="pt-4 border-t border-[#332d47] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
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

                <div className="flex items-center gap-2 text-xs font-semibold text-[#c084fc] group-hover:translate-x-1 transition-transform">
                  <span>Read Full Case Study</span>
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
              {(searchQuery || selectedCategory !== 'all' ? filteredArticles : gridArticles).map(art => {
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
                    className="bg-[#181524] rounded-[24px] border border-[#332d47] overflow-hidden shadow-xl hover:border-purple-500/60 transition-all flex flex-col justify-between group cursor-pointer"
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
                        
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#100e17]/90 backdrop-blur-md text-[#c084fc] border border-purple-500/30">
                          {art.category}
                        </span>

                        <span className="absolute bottom-3 right-3 text-[10px] font-mono text-[#c4c7c8] bg-[#100e17]/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#a855f7]" /> {art.readTime}
                        </span>
                      </div>

                      {/* Content Info */}
                      <div className="p-5 space-y-3">
                        <div className="text-[10px] font-mono text-[#8e8a9f]">
                          {art.publishedAt}
                        </div>

                        <h4 className="text-base font-serif font-medium text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h4>

                        <p className="text-xs text-[#a39ebb] font-light line-clamp-2 leading-relaxed">
                          {art.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Author & Verification Footer */}
                    <div className="p-5 pt-0">
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

                      <div className="pt-3 flex items-center justify-between text-xs text-[#c084fc] font-medium group-hover:text-white transition-colors">
                        <span>Read Case Study</span>
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
