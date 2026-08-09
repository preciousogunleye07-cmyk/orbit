import React, { useState } from 'react';
import { COURSES_DATA } from '../data/coursesData';
import { ActiveModal } from '../types';
import { Search, Sparkles, Clock, CheckCircle2, ArrowRight, ShieldAlert, BarChart3, Code2, Server, Layers, Layout, Video, Bot, Camera } from 'lucide-react';

interface CoursesPageProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ setActiveModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Software Development', 'Data & AI', 'Cybersecurity', 'Design & UX', 'Creative & Media'];

  const filteredCourses = COURSES_DATA.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || 
                          c.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                          c.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCourseIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-[#ffffff]" />;
      case 'BarChart3': return <BarChart3 className="w-5 h-5 text-[#ffffff]" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-[#ffffff]" />;
      case 'Server': return <Server className="w-5 h-5 text-[#ffffff]" />;
      case 'Layers': return <Layers className="w-5 h-5 text-[#ffffff]" />;
      case 'Layout': return <Layout className="w-5 h-5 text-[#ffffff]" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-[#ffffff]" />;
      case 'Video': return <Video className="w-5 h-5 text-[#ffffff]" />;
      case 'Bot': return <Bot className="w-5 h-5 text-[#ffffff]" />;
      case 'Camera': return <Camera className="w-5 h-5 text-[#ffffff]" />;
      default: return <Code2 className="w-5 h-5 text-[#ffffff]" />;
    }
  };

  return (
    <div className="py-20 max-w-[1200px] mx-auto px-6 bg-[#141313] min-h-screen">
      {/* Page Header */}
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-semibold text-[#c4c7c8] tracking-[0.2em] uppercase mb-2 block">
          Academy Catalog
        </span>
        <h1 className="text-4xl md:text-5xl font-light text-[#ffffff] font-serif leading-tight mb-4">
          Practical Tech Courses in Ilorin
        </h1>
        <p className="text-[#c4c7c8] font-light text-base leading-relaxed">
          100% practical, project-based training designed to get you hired or launch your own digital products in Kwara State or remotely.
        </p>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 bg-[#1c1b1b] p-3 rounded-[16px] border border-[#353434] shadow-xl">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#ffffff] text-[#141313]'
                  : 'text-[#c4c7c8] hover:text-[#ffffff] hover:bg-[#201f1f]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#8e9192] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#201f1f] border border-[#353434] rounded-full pl-9 pr-4 py-1.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#8e9192]"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-[#201f1f] rounded-[16px] border border-[#353434] hover:border-[#8e9192] transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between group"
          >
            {/* Banner Image */}
            {course.imageUrl && (
              <div className="relative h-44 w-full overflow-hidden bg-[#1c1b1b]">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#201f1f] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#ffffff]">
                    {course.priceFormatted}
                  </span>
                  {course.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#353434] text-[#e5e2e1] text-[10px] font-mono tracking-widest uppercase border border-[#444748]">
                      {course.badge}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1c1b1b] border border-[#353434] flex items-center justify-center shrink-0">
                    {getCourseIcon(course.iconName)}
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-[#c4c7c8] uppercase">
                    {course.category}
                  </span>
                </div>

                <h3 className="text-xl font-serif text-[#ffffff] font-light mb-2 group-hover:text-[#e2e2e2] transition-colors">
                  {course.title}
                </h3>

                <p className="text-xs text-[#c4c7c8] font-light mb-4 leading-relaxed">
                  {course.description}
                </p>

                {/* Highlights */}
                <div className="space-y-2 mb-6 pt-4 border-t border-[#353434]">
                  {course.curriculum.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#c4c7c8] font-light">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-[#353434]">
                <button
                  onClick={() => setActiveModal({ type: 'course-detail', course })}
                  className="flex-1 py-2 px-3 rounded-full border border-[#353434] bg-[#1c1b1b] hover:bg-[#353434] text-[#e5e2e1] font-medium text-xs transition-all text-center"
                >
                  Syllabus
                </button>
                <button
                  onClick={() => setActiveModal({ type: 'enroll', course })}
                  className="flex-1 py-2 px-3 rounded-full bg-[#ffffff] hover:bg-[#e2e2e2] text-[#141313] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-16 bg-[#1c1b1b] rounded-[16px] border border-[#353434]">
          <p className="text-lg font-serif text-[#ffffff] mb-2">No courses found matching "{searchQuery}"</p>
          <p className="text-xs text-[#c4c7c8] font-light mb-4">Try adjusting your category filter or search keywords.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="px-6 py-2.5 rounded-full bg-[#ffffff] text-[#141313] font-semibold text-xs"
          >
            Reset Search Filters
          </button>
        </div>
      )}
    </div>
  );
};
