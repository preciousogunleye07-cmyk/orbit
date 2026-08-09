import React from 'react';
import { motion } from 'motion/react';
import { X, ArrowRight, BookOpen, Award } from 'lucide-react';
import { Course } from '../../types';
import AnimatedList from '../AnimatedList';

interface CourseDetailModalProps {
  course: Course;
  onClose: () => void;
  onEnroll: () => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ course, onClose, onEnroll }) => {
  const syllabusItems = course.curriculum.map((mod, i) => (
    <div key={i} className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-[#181524] border border-[#a855f7]/40 text-[#a855f7] text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5">
        {i + 1}
      </div>
      <div>
        <p className="text-xs text-[#ffffff] font-medium leading-relaxed">{mod}</p>
        <p className="text-[10px] text-[#c4c7c8] font-light mt-0.5">Hands-on practical module & project assessment</p>
      </div>
    </div>
  ));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100e17]/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="liquid-glass-card rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl overflow-hidden"
      >
        
        {course.imageUrl && (
          <div className="relative h-48 w-full bg-[#100e17]">
            <img
              src={course.imageUrl}
              alt={course.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181524] via-[#181524]/50 to-transparent" />
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2 rounded-full bg-[#100e17]/80 backdrop-blur-sm text-[#c4c7c8] hover:text-[#a855f7] hover:bg-[#332d47] transition-all shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 -mt-10 relative z-10">
          <div className="mb-6">
            <span className="px-3 py-1 rounded-full bg-[#1f1b2e] border border-[#332d47] text-[#a855f7] text-[10px] font-mono tracking-widest uppercase inline-block mb-3 font-semibold">
              {course.duration} | {course.level}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal mb-2">
              {course.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#c4c7c8] font-light leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="space-y-6 border-t border-[#332d47] pt-6">
            
            {/* Detailed Syllabus using AnimatedList */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-mono tracking-widest text-[#a855f7] uppercase font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#a855f7]" />
                  Syllabus & Core Modules
                </h4>
                <span className="text-[10px] text-[#c4c7c8] font-mono">Use ↑↓ or Tab keys</span>
              </div>

              <AnimatedList
                items={syllabusItems}
                showGradients={true}
                enableArrowNavigation={true}
                displayScrollbar={true}
                className="max-h-[280px]"
              />
            </div>

            {/* Career Outcomes */}
            <div>
              <h4 className="text-xs font-mono tracking-widest text-[#a855f7] uppercase mb-3 font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-[#a855f7]" />
                Career Outcomes & Job Roles
              </h4>
              <div className="flex flex-wrap gap-2">
                {course.careerOutcomes.map((role, i) => (
                  <span key={i} className="px-3.5 py-1.5 rounded-full bg-[#1f1b2e] border border-[#332d47] text-[#a855f7] text-xs font-medium shadow-sm">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Price & Enroll Bar */}
            <div className="p-4 bg-[#1f1b2e] rounded-[16px] border border-[#332d47] flex items-center justify-between gap-4 shadow-lg">
              <div>
                <p className="text-[11px] text-[#c4c7c8] font-light">Total Program Tuition</p>
                <p className="text-2xl font-serif text-[#ffffff] font-normal">{course.priceFormatted}</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onEnroll();
                }}
                className="btn-purple px-6 py-3 rounded-full font-semibold text-xs shadow-md flex items-center gap-2 transition-all"
              >
                <span>Apply for {course.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </motion.div>
    </motion.div>
  );
};
