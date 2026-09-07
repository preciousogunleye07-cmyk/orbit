import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SpotlightCard from './SpotlightCard';
import { COURSES_DATA } from '../data/coursesData';
import { Course, ActiveModal } from '../types';
import { playSound } from '../utils/soundEffects';
import { 
  ShieldAlert, 
  BarChart3, 
  Code2, 
  Server, 
  Layers, 
  Layout, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Video,
  Bot,
  Camera,
  X
} from 'lucide-react';

interface CoursesSectionProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({ setActiveModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAll, setShowAll] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const distance = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -distance : distance,
        behavior: 'smooth'
      });
    }
  };

  // Icon mapper helper
  const getCourseIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-[#a855f7]" />;
      case 'BarChart3': return <BarChart3 className="w-5 h-5 text-[#a855f7]" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-[#a855f7]" />;
      case 'Server': return <Server className="w-5 h-5 text-[#a855f7]" />;
      case 'Layers': return <Layers className="w-5 h-5 text-[#a855f7]" />;
      case 'Layout': return <Layout className="w-5 h-5 text-[#a855f7]" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-[#a855f7]" />;
      case 'Video': return <Video className="w-5 h-5 text-[#a855f7]" />;
      case 'Bot': return <Bot className="w-5 h-5 text-[#a855f7]" />;
      case 'Camera': return <Camera className="w-5 h-5 text-[#a855f7]" />;
      default: return <Code2 className="w-5 h-5 text-[#a855f7]" />;
    }
  };

  const CATEGORIES: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All Tracks', icon: Sparkles },
    { id: 'development', label: 'Development', icon: Code2 },
    { id: 'security', label: 'Cybersecurity', icon: ShieldAlert },
    { id: 'data', label: 'Data Analysis', icon: BarChart3 },
    { id: 'design', label: 'UI/UX', icon: Layout },
    { id: 'creative', label: 'Media & Creative', icon: Camera },
    { id: 'ai', label: 'AI & Automation', icon: Bot },
  ];

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return COURSES_DATA.length;
    return COURSES_DATA.filter((c) => c.category === catId).length;
  };

  const filteredCourses = COURSES_DATA.filter((course) => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayedCourses = showAll ? filteredCourses : filteredCourses.slice(0, 4);

  return (
    <section id="courses" className="py-16 sm:py-20 relative bg-[#100e17]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-8 sm:mb-10">
          <span className="text-xs font-semibold text-[#a855f7] tracking-[0.2em] uppercase mb-2 block">
            Practical Tracks
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#ffffff] font-serif leading-tight">
            Learn Skills That Matter
          </h2>
          <p className="text-[#c4c7c8] font-light text-sm sm:text-base mt-2">
            Choose a project-based program that matches your career aspirations in Kwara State or remote engineering roles.
          </p>
        </div>

        {/* Courses Track Navigation & Search Bar */}
        <div className="mb-8 sm:mb-10 flex flex-col gap-3.5" id="courses-track-navigation">
          
          {/* Track Tabs Segment */}
          <div className="relative bg-[#151221]/95 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-[#2e2642] shadow-xl shadow-black/30">
            
            {/* Scroll Left Button */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-8 h-8 rounded-xl bg-[#1d172e] hover:bg-[#2a2143] border border-[#3b3156] text-[#c084fc] hover:text-white shadow-lg transition-all active:scale-95 cursor-pointer"
                aria-label="Scroll tracks left"
                id="btn-scroll-tracks-left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Left Edge Mask */}
            <div 
              className={`pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#151221] to-transparent z-10 rounded-l-2xl transition-opacity duration-200 ${
                canScrollLeft ? 'opacity-100' : 'opacity-0'
              }`} 
            />

            {/* Scrollable Tracks Tabs */}
            <div 
              ref={scrollContainerRef}
              className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scroll-smooth snap-x touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1 py-0.5 w-full"
            >
              {CATEGORIES.map((tab) => {
                const count = getCategoryCount(tab.id);
                const isSelected = selectedCategory === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`track-tab-${tab.id}`}
                    onClick={() => {
                      playSound('droplet');
                      setSelectedCategory(tab.id);
                      setShowAll(true);
                    }}
                    className={`relative snap-start min-h-[42px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer select-none shrink-0 active:scale-95 ${
                      isSelected
                        ? 'text-white font-semibold shadow-sm'
                        : 'text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#201a30]/80'
                    }`}
                  >
                    {/* Active Tab Background */}
                    {isSelected && (
                      <motion.div
                        layoutId="activeTrackTab"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 bg-[#2b2046] border border-[#7c3aed]/50 rounded-xl shadow-md shadow-purple-950/40"
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className={`w-4 h-4 transition-colors ${isSelected ? 'text-[#c084fc]' : 'text-[#8b5cf6]/70'}`} />
                      <span>{tab.label}</span>
                    </span>

                    <span
                      className={`relative z-10 text-[10px] px-2 py-0.5 rounded-full font-mono font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#7c3aed]/30 text-[#e9d5ff] border border-[#a855f7]/30'
                          : 'bg-[#1e182e] text-[#8e8a9f]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Edge Mask */}
            <div 
              className={`pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#151221] to-transparent z-10 rounded-r-2xl transition-opacity duration-200 ${
                canScrollRight ? 'opacity-100' : 'opacity-0'
              }`} 
            />

            {/* Scroll Right Button */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-8 h-8 rounded-xl bg-[#1d172e] hover:bg-[#2a2143] border border-[#3b3156] text-[#c084fc] hover:text-white shadow-lg transition-all active:scale-95 cursor-pointer"
                aria-label="Scroll tracks right"
                id="btn-scroll-tracks-right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Bar & Result Status Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-1">
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#a855f7] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tracks by skill, stack, or role..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowAll(true);
                }}
                className="w-full pl-9 pr-9 py-2 bg-[#171324] hover:bg-[#1b162a] focus:bg-[#1a1529] border border-[#2f2746] focus:border-[#a855f7] rounded-xl text-xs text-[#e2e8f0] placeholder-[#7d7894] focus:outline-none focus:ring-2 focus:ring-[#a855f7]/20 min-h-[40px] transition-all shadow-inner"
                id="courses-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8e8a9f] hover:text-white rounded-lg transition-colors cursor-pointer"
                  aria-label="Clear search"
                  id="btn-clear-courses-search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results Count & Reset Control */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5 text-xs text-[#9ca3af]">
              <div className="flex items-center gap-1.5 font-mono text-[11px] bg-[#161222] border border-[#2b233f] px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  <strong className="text-white font-medium">{filteredCourses.length}</strong> {filteredCourses.length === 1 ? 'Program' : 'Programs'}
                </span>
                {selectedCategory !== 'all' && (
                  <span className="text-[#a855f7] font-medium truncate max-w-[120px]">
                    • {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                  </span>
                )}
              </div>

              {(selectedCategory !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#c084fc] hover:text-white bg-[#231b36] hover:bg-[#2d2247] border border-[#40335e] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95"
                  id="btn-reset-filters"
                >
                  <X className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Courses Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {displayedCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                id={`course-card-${course.id}`}
                className="h-full"
              >
                <SpotlightCard
                  spotlightColor="rgba(168, 85, 247, 0.2)"
                  className="group relative bg-[#1f1b2e] rounded-[20px] border border-[#332d47] hover:border-[#8b5cf6]/60 transition-colors duration-300 flex flex-col justify-between shadow-xl overflow-hidden hover:shadow-purple-950/40 h-full p-0"
                >
                  {/* Course Image Banner */}
                  {course.imageUrl && (
                    <div className="relative h-40 w-full overflow-hidden bg-[#181524] rounded-t-[20px]">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1f1b2e] via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#ffffff] drop-shadow-md">
                          {course.priceFormatted}
                        </span>
                        {course.badge && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#7c3aed]/90 text-[#ffffff] text-[10px] uppercase font-mono tracking-wider border border-[#a855f7]/50 shadow-sm">
                            {course.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between w-full">
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#181524] border border-[#332d47] flex items-center justify-center shrink-0 shadow-sm">
                          {getCourseIcon(course.iconName)}
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase font-semibold">
                          {course.category}
                        </span>
                      </div>

                      {/* COURSE TITLE */}
                      <h3 className="text-xl font-serif text-[#ffffff] font-normal mb-2 group-hover:text-[#a855f7] transition-colors">
                        {course.title}
                      </h3>

                      {/* COURSE DESCRIPTION */}
                      <p className="text-xs text-[#c4c7c8] font-light mb-5 sm:mb-6 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Quick Info Pills */}
                      <div className="flex flex-wrap items-center gap-2 mb-5 sm:mb-6">
                        <span className="flex items-center gap-1 text-[11px] text-[#c4c7c8] bg-[#181524] px-3 py-1 rounded-full border border-[#332d47]">
                          <Clock className="w-3.5 h-3.5 text-[#a855f7]" />
                          {course.duration}
                        </span>
                        <span className="text-[11px] text-[#c4c7c8] bg-[#181524] px-3 py-1 rounded-full border border-[#332d47]">
                          {course.level}
                        </span>
                      </div>

                      {/* Curriculum Snippet */}
                      <div className="space-y-2 mb-5 sm:mb-6 pt-4 border-t border-[#332d47]">
                        {course.curriculum.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#c4c7c8] font-light">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#a855f7] shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-[#332d47] flex items-center gap-2.5">
                      <button
                        onClick={() => {
                          playSound('scan');
                          setActiveModal({ type: 'course-detail', course });
                        }}
                        className="flex-1 py-2.5 px-3 min-h-[42px] rounded-full bg-[#181524] hover:bg-[#332d47] border border-[#332d47] text-xs font-medium text-[#e2e8f0] hover:text-[#a855f7] transition-all text-center relative z-10 active:scale-95"
                      >
                        Syllabus
                      </button>
                      <button
                        onClick={() => {
                          playSound('sparkle');
                          setActiveModal({ type: 'enroll', course });
                        }}
                        className="flex-1 py-2.5 px-3 min-h-[42px] rounded-full btn-purple text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md relative z-10 active:scale-95"
                      >
                        <span>Enroll</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16 px-6 bg-[#161224]/70 backdrop-blur-sm rounded-2xl border border-[#2e2642] max-w-md mx-auto my-6">
            <Search className="w-8 h-8 text-[#a855f7] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-medium text-white mb-1">No matching programs</h3>
            <p className="text-xs text-[#9ca3af] mb-5 leading-relaxed">
              We couldn&apos;t find any courses matching your filter or keyword. Try searching for a different skill or reset filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white rounded-xl text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md shadow-purple-900/30"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* View All Button */}
        {COURSES_DATA.length > 4 && (
          <div className="text-center mt-12">
            <button
              onClick={() => {
                playSound('toggle');
                setShowAll(!showAll);
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium text-xs bg-[#201f1f] border border-[#353434] hover:bg-[#353434] text-[#ffffff] transition-all"
              id="btn-view-all-courses"
            >
              <span>{showAll ? 'Collapse Courses View' : 'View All Courses'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
