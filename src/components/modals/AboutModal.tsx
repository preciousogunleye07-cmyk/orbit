import React from 'react';
import { X, Orbit, MapPin, Zap, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
  onOpenEnroll: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose, onOpenEnroll }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100e17]/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#181524] border border-[#332d47] text-[#e2e8f0] rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-10 relative shadow-2xl shadow-purple-950/40">
        
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1f1b2e] text-[#c4c7c8] hover:text-[#a855f7] hover:bg-[#332d47] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-[#ffffff] shadow-md">
            <Orbit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal">
              About Orbit Space
            </h3>
            <p className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase font-semibold">
              Practical Tech Academy & Coworking Hub in Ilorin
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-[#c4c7c8] font-light leading-relaxed border-t border-[#332d47] pt-6">
          <p className="text-sm text-[#e2e8f0] font-normal leading-relaxed">
            <strong className="text-[#ffffff]">Orbit Space</strong> is a tech academy in Ilorin focused on practical, hands-on learning. Founded with a vision to bridge the digital skills gap in Kwara State and across Nigeria, we train developers, designers, analysts, and cybersecurity specialists through real-world execution.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#1f1b2e] rounded-[16px] border border-[#332d47]">
              <h4 className="font-semibold text-[#ffffff] mb-1 flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-[#a855f7]" />
                100% Practical Pedagogy
              </h4>
              <p className="text-[11px] text-[#c4c7c8] font-light">
                No boring lectures or outdated slides. Every lesson revolves around building real projects and writing production code.
              </p>
            </div>

            <div className="p-4 bg-[#1f1b2e] rounded-[16px] border border-[#332d47]">
              <h4 className="font-semibold text-[#ffffff] mb-1 flex items-center gap-2 text-xs">
                <Zap className="w-4 h-4 text-[#a855f7]" />
                24/7 Power & High-Speed Internet
              </h4>
              <p className="text-[11px] text-[#c4c7c8] font-light">
                Eliminate power cuts and poor connectivity. Our Ilorin facility guarantees smooth, uninterrupted study & work sessions.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-serif text-[#ffffff] font-normal mb-3">Our Core Pillar Programs</h4>
            <div className="space-y-2">
              {[
                { title: 'Tech Academy Courses', desc: '10-16 week intensive tracks in Cybersecurity, Data Analysis, Frontend, Backend, Full Stack, UI/UX, and AI Web Dev.' },
                { title: 'SIWES Placement', desc: 'Official industrial training partner for university and polytechnic students in Kwara State and beyond.' },
                { title: 'Coworking Workspace', desc: 'Affordable daily, weekly, and monthly desk access for remote workers, freelancers, and tech builders.' }
              ].map((p, idx) => (
                <div key={idx} className="p-3.5 bg-[#1f1b2e] rounded-[12px] border border-[#332d47] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#ffffff]">{p.title}: </span>
                    <span className="text-[#c4c7c8] font-light">{p.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#332d47] flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-[#c4c7c8] text-[11px]">
              <MapPin className="w-4 h-4 text-[#a855f7]" />
              <span>Ilorin, Kwara State, Nigeria</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenEnroll();
              }}
              className="px-6 py-2.5 rounded-full btn-purple font-semibold text-xs shadow-md flex items-center gap-2 transition-all"
            >
              <span>Enroll Today</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

