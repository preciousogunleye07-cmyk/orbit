import React, { useState } from 'react';
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
  Video,
  Bot,
  Camera
} from 'lucide-react';

interface CoursesSectionProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({ setActiveModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAll, setShowAll] = useState<boolean>(true);

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
        <div className="max-w-2xl mb-8 sm:mb-12">
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

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 bg-[#181524] p-3 rounded-[16px] border border-[#332d47]">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Programs' },
              { id: 'development', label: 'Development' },
              { id: 'security', label: 'Cybersecurity' },
              { id: 'data', label: 'Data' },
              { id: 'design', label: 'UI/UX' },
              { id: 'creative', label: 'Creative & Media' },
              { id: 'ai', label: 'AI & Automation' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playSound('droplet');
                  setSelectedCategory(tab.id);
                  setShowAll(true);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-[#8b5cf6] text-[#ffffff] shadow-md shadow-purple-900/40'
                    : 'text-[#c4c7c8] hover:text-[#a855f7] hover:bg-[#1f1b2e]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#8b5cf6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowAll(true);
              }}
              className="w-full pl-9 pr-4 py-1.5 bg-[#1f1b2e] border border-[#332d47] rounded-full text-xs text-[#e2e8f0] placeholder-[#8e9192] focus:outline-none focus:border-[#8b5cf6]"
            />
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

                  <div className="p-6 flex-1 flex flex-col justify-between w-full">
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
                      <p className="text-xs text-[#c4c7c8] font-light mb-6 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Quick Info Pills */}
                      <div className="flex flex-wrap items-center gap-2 mb-6">
                        <span className="flex items-center gap-1 text-[11px] text-[#c4c7c8] bg-[#181524] px-3 py-1 rounded-full border border-[#332d47]">
                          <Clock className="w-3.5 h-3.5 text-[#a855f7]" />
                          {course.duration}
                        </span>
                        <span className="text-[11px] text-[#c4c7c8] bg-[#181524] px-3 py-1 rounded-full border border-[#332d47]">
                          {course.level}
                        </span>
                      </div>

                      {/* Curriculum Snippet */}
                      <div className="space-y-2 mb-6 pt-4 border-t border-[#332d47]">
                        {course.curriculum.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#c4c7c8] font-light">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#a855f7] shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-[#332d47] flex items-center gap-2">
                      <button
                        onClick={() => {
                          playSound('scan');
                          setActiveModal({ type: 'course-detail', course });
                        }}
                        className="flex-1 py-2 px-3 rounded-full bg-[#181524] hover:bg-[#332d47] border border-[#332d47] text-xs font-medium text-[#e2e8f0] hover:text-[#a855f7] transition-all text-center relative z-10"
                      >
                        Syllabus
                      </button>
                      <button
                        onClick={() => {
                          playSound('sparkle');
                          setActiveModal({ type: 'enroll', course });
                        }}
                        className="flex-1 py-2 px-3 rounded-full btn-purple text-xs font-semibold transition-all flex items-center justify-center gap-1 shadow-md relative z-10"
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
