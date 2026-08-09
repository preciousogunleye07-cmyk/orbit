import React from 'react';
import { CheckCircle2, ArrowRight, Building2, Award } from 'lucide-react';
import { ActiveModal } from '../types';

interface SIWESSectionProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const SIWESSection: React.FC<SIWESSectionProps> = ({ setActiveModal }) => {
  return (
    <section id="siwes" className="py-20 relative bg-[#100e17]">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        
        <div className="bg-[#181524] rounded-[24px] p-8 md:p-12 border border-[#332d47] relative overflow-hidden shadow-2xl shadow-purple-950/20">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            <div className="lg:col-span-7">

              <span className="text-xs font-semibold text-[#a855f7] tracking-[0.2em] uppercase mb-3 block">
                Industrial Training Program
              </span>

              <h2 className="text-3xl md:text-4xl font-normal text-[#ffffff] font-serif leading-tight mb-4">
                Looking for a SIWES Placement?
              </h2>

              <p className="text-base text-[#e2e8f0] font-light mb-3">
                Turn your mandatory SIWES into an opportunity to learn practical, industry-relevant software skills.
              </p>
              <p className="text-sm text-[#c4c7c8] font-light mb-8 leading-relaxed">
                Join Orbit Space in Ilorin and gain hands-on experience while completing your SIWES program with official logbook sign-offs and mentor support.
              </p>

              {/* Perks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  'Hands-on Practical Projects',
                  'Official Logbook Guidance & Sign-off',
                  'Dedicated Industry Mentors',
                  'High-Speed Internet & Uninterrupted Power',
                  'Portfolio Development for Job Market',
                  'Flexible 3 to 6-Month Placement Tracks'
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-light text-[#e2e8f0] bg-[#1f1b2e] p-3 rounded-full border border-[#332d47]">
                    <CheckCircle2 className="w-4 h-4 text-[#a855f7] shrink-0" />
                    <span className="truncate">{perk}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => setActiveModal({ type: 'siwes' })}
                className="btn-purple px-8 py-4 rounded-full font-semibold text-xs transition-all flex items-center justify-center gap-2 group w-full sm:w-auto shadow-lg"
                id="btn-apply-siwes"
              >
                <span>Apply for SIWES</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>

            {/* Right Side Visual Container */}
            <div className="lg:col-span-5 bg-[#1f1b2e] rounded-[16px] p-6 border border-[#332d47]">
              {/* Featured Image */}
              <div className="relative h-44 rounded-[12px] overflow-hidden mb-6 border border-[#332d47] group">
                <img
                  src="https://user22236.na.imgto.link/public/20260809/screenshot-2026-08-09-at-04-27-39.avif"
                  alt="Students undergoing SIWES practical training"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#100e17] via-transparent to-transparent flex items-end p-4">
                  <span className="text-xs font-serif text-[#ffffff] font-normal">
                    Hands-On Industrial Training Workstation
                  </span>
                </div>
              </div>

              <h3 className="text-xs font-mono tracking-widest text-[#a855f7] uppercase mb-4 flex items-center gap-2 font-semibold">
                <Building2 className="w-4 h-4 text-[#a855f7]" />
                Institutions We Partner With
              </h3>
              
              <div className="space-y-2.5 mb-6">
                {[
                  { name: 'University of Ilorin (UNILORIN)', count: 'Computer Sci, Engineering, Physics' },
                  { name: 'Kwara State Polytechnic (KWARAPOLY)', count: 'SLT, Computer Eng, Mass Comm' },
                  { name: 'Kwara State University (KWASU)', count: 'ICT, Computer Science, Engineering' },
                  { name: 'Federal Polytechnic Offa (FEDPOFFA)', count: 'Software, Networking, Telecom' },
                  { name: 'Al-Hikmah University & Others', count: 'Science & Tech Students' }
                ].map((inst, index) => (
                  <div key={index} className="p-3 rounded-[10px] bg-[#181524] border border-[#332d47] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#ffffff]">{inst.name}</p>
                      <p className="text-[10px] text-[#c4c7c8]">{inst.count}</p>
                    </div>
                    <Award className="w-4 h-4 text-[#a855f7] shrink-0" />
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#100e17] rounded-full border border-[#332d47] text-center">
                <p className="text-xs text-[#e2e8f0] font-light">
                  Accepted for 3-Month, 6-Month, or 1-Year SIWES Programs
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
