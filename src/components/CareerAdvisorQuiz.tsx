import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { COURSES_DATA } from '../data/coursesData';
import { Course, ActiveModal } from '../types';

interface CareerAdvisorQuizProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const CareerAdvisorQuiz: React.FC<CareerAdvisorQuizProps> = ({ setActiveModal }) => {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<{ interest?: string; style?: string; goal?: string }>({});
  const [recommendedCourse, setRecommendedCourse] = useState<Course | null>(null);

  const handleSelectOption = (key: 'interest' | 'style' | 'goal', value: string) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    if (step < 3) {
      setStep(step + 1);
    } else {
      let matchId = 'frontend-development';
      if (updated.interest === 'security') matchId = 'cybersecurity';
      else if (updated.interest === 'data') matchId = 'data-analysis';
      else if (updated.interest === 'design') matchId = 'ui-ux-design';
      else if (updated.interest === 'ai') matchId = 'ai-web-development-brand-identity';
      else if (updated.interest === 'backend') matchId = 'backend-development';
      else if (updated.goal === 'complete') matchId = 'full-stack-development';

      const matched = COURSES_DATA.find((c) => c.id === matchId) || COURSES_DATA[0];
      setRecommendedCourse(matched);
      setStep(4);
    }
  };

  const resetQuiz = () => {
    setStep(1);
    setAnswers({});
    setRecommendedCourse(null);
  };

  return (
    <section className="py-16 relative bg-[#100e17]">
      <div className="max-w-[900px] mx-auto px-6 relative z-10">
        <div className="bg-[#181524] rounded-[24px] p-8 md:p-10 border border-[#332d47] shadow-2xl shadow-purple-950/30 relative overflow-hidden">
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center text-[#a855f7] shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-[#ffffff] font-normal">
                Not sure which course is right for you?
              </h3>
              <p className="text-xs text-[#c4c7c8] font-light mt-0.5">
                Take our 3-question Orbit Career Advisor Quiz to find your ideal match.
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-[#1f1b2e] rounded-full mb-8 overflow-hidden border border-[#332d47]">
            <div 
              className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] transition-all duration-300 shadow-sm"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <p className="text-xs font-mono tracking-widest text-[#a855f7] uppercase font-semibold">
                  Question 1 of 3: What area excites you the most?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'dev', label: 'Building Websites & Web Apps', desc: 'Frontend or Backend coding' },
                    { key: 'security', label: 'Protecting Networks & Systems', desc: 'Ethical hacking & cybersecurity' },
                    { key: 'data', label: 'Analyzing Data & Finding Insights', desc: 'Excel, SQL, Power BI' },
                    { key: 'design', label: 'Designing Beautiful User Interfaces', desc: 'Figma, UI/UX research' },
                    { key: 'ai', label: 'AI Tools & Creative Technology', desc: 'AI APIs, Prompting & Branding' }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption('interest', opt.key)}
                      className="p-5 rounded-[12px] bg-[#1f1b2e] hover:bg-[#332d47] border border-[#332d47] hover:border-[#8b5cf6]/50 text-left transition-all group cursor-pointer"
                    >
                      <p className="text-sm font-medium text-[#ffffff] group-hover:text-[#a855f7]">{opt.label}</p>
                      <p className="text-xs text-[#c4c7c8] font-light mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <p className="text-xs font-mono tracking-widest text-[#a855f7] uppercase font-semibold">
                  Question 2 of 3: What is your primary career goal?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'job', label: 'Get a tech job / Land remote role', desc: 'High demand practical skill' },
                    { key: 'siwes', label: 'Complete SIWES / IT Placement', desc: 'Practical student experience' },
                    { key: 'freelance', label: 'Start Freelancing / Business', desc: 'Build client digital products' },
                    { key: 'complete', label: 'Become a Complete Full Stack Dev', desc: 'Frontend + Backend mastery' }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption('goal', opt.key)}
                      className="p-5 rounded-[12px] bg-[#1f1b2e] hover:bg-[#332d47] border border-[#332d47] hover:border-[#8b5cf6]/50 text-left transition-all group cursor-pointer"
                    >
                      <p className="text-sm font-medium text-[#ffffff] group-hover:text-[#a855f7]">{opt.label}</p>
                      <p className="text-xs text-[#c4c7c8] font-light mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <p className="text-xs font-mono tracking-widest text-[#a855f7] uppercase font-semibold">
                  Question 3 of 3: How do you prefer learning at Orbit Space?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'campus', label: 'Physical Classroom in Ilorin', desc: '24/7 Power, Fiber Internet, Mentors' },
                    { key: 'hybrid', label: 'Hybrid (Campus + Online)', desc: 'Flexible schedule options' }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption('style', opt.key)}
                      className="p-5 rounded-[12px] bg-[#1f1b2e] hover:bg-[#332d47] border border-[#332d47] hover:border-[#8b5cf6]/50 text-left transition-all group cursor-pointer"
                    >
                      <p className="text-sm font-medium text-[#ffffff] group-hover:text-[#a855f7]">{opt.label}</p>
                      <p className="text-xs text-[#c4c7c8] font-light mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && recommendedCourse && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="text-center py-4"
              >
                <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#1f1b2e] border border-[#332d47] text-[#a855f7] text-xs font-mono uppercase tracking-wider mb-4 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
                  Recommended Match
                </span>
                
                <h4 className="text-2xl font-serif text-[#ffffff] font-normal mb-2">
                  {recommendedCourse.title}
                </h4>
                <p className="text-sm text-[#c4c7c8] font-light mb-6 max-w-lg mx-auto leading-relaxed">
                  {recommendedCourse.description}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
                  <button
                    onClick={() => setActiveModal({ type: 'enroll', course: recommendedCourse })}
                    className="w-full sm:w-auto btn-purple px-8 py-3.5 rounded-full font-semibold text-xs shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Enroll in {recommendedCourse.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetQuiz}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#1f1b2e] hover:bg-[#332d47] border border-[#332d47] text-[#e2e8f0] hover:text-[#a855f7] text-xs font-medium flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
};
