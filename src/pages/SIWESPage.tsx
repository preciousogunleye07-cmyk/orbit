import React from 'react';
import { ActiveModal } from '../types';
import { GraduationCap, CheckCircle2, ArrowRight, Building2, Award, FileText, Calendar, ShieldCheck, MapPin } from 'lucide-react';

interface SIWESPageProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const SIWESPage: React.FC<SIWESPageProps> = ({ setActiveModal }) => {
  return (
    <div className="py-20 max-w-[1200px] mx-auto px-6 bg-[#141313] min-h-screen">
      {/* Header Banner */}
      <div className="bg-[#1c1b1b] border border-[#353434] rounded-[20px] p-8 md:p-12 mb-12 relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl relative z-10">
          <span className="text-xs font-semibold text-[#c4c7c8] tracking-[0.2em] uppercase mb-3 block">
            SIWES & IT Placement Hub
          </span>

          <h1 className="text-4xl md:text-5xl font-light text-[#ffffff] font-serif leading-tight mb-4">
            Industrial Training & SIWES Placement in Ilorin
          </h1>

          <p className="text-base text-[#c4c7c8] font-light mb-8 leading-relaxed">
            Turn your mandatory SIWES attachment period into real software engineering experience. Orbit Space provides official acceptance letters, practical project logbook supervision, and hands-on guidance for students across Kwara State and beyond.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveModal({ type: 'siwes' })}
              className="px-8 py-3.5 rounded-full bg-[#ffffff] hover:bg-[#e2e2e2] text-[#141313] font-semibold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <span>Apply for SIWES Placement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#c4c7c8] font-light flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Official Acceptance Letters Issued Promptly</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Left column: Key Benefits */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-2xl md:text-3xl font-serif font-light text-[#ffffff]">
            Why Complete Your SIWES at Orbit Space?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-[#1c1b1b] rounded-[16px] border border-[#353434]">
              <div className="w-10 h-10 rounded-full bg-[#201f1f] border border-[#353434] flex items-center justify-center text-[#ffffff] mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif text-[#ffffff] font-medium mb-1">Official Acceptance Letter</h3>
              <p className="text-xs text-[#c4c7c8] font-light leading-relaxed">Prompt issuance of verification letters accepted by university SIWES units.</p>
            </div>

            <div className="p-6 bg-[#1c1b1b] rounded-[16px] border border-[#353434]">
              <div className="w-10 h-10 rounded-full bg-[#201f1f] border border-[#353434] flex items-center justify-center text-[#ffffff] mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif text-[#ffffff] font-medium mb-1">Real Portfolio Projects</h3>
              <p className="text-xs text-[#c4c7c8] font-light leading-relaxed">Build production apps, real APIs, or analytics models to fill your logbook with substance.</p>
            </div>

            <div className="p-6 bg-[#1c1b1b] rounded-[16px] border border-[#353434]">
              <div className="w-10 h-10 rounded-full bg-[#201f1f] border border-[#353434] flex items-center justify-center text-[#ffffff] mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif text-[#ffffff] font-medium mb-1">3 & 6 Months Duration</h3>
              <p className="text-xs text-[#c4c7c8] font-light leading-relaxed">Flexible schedules tailored for ND, HND, and University 300L/400L students.</p>
            </div>

            <div className="p-6 bg-[#1c1b1b] rounded-[16px] border border-[#353434]">
              <div className="w-10 h-10 rounded-full bg-[#201f1f] border border-[#353434] flex items-center justify-center text-[#ffffff] mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif text-[#ffffff] font-medium mb-1">Logbook Assistance</h3>
              <p className="text-xs text-[#c4c7c8] font-light leading-relaxed">Direct supervisor sign-offs and weekly technical task documentation support.</p>
            </div>
          </div>
        </div>

        {/* Right column: Participating Tertiary Institutions */}
        <div className="lg:col-span-5 bg-[#1c1b1b] rounded-[20px] p-6 border border-[#353434] shadow-2xl">
          <div className="relative h-44 rounded-[12px] overflow-hidden mb-6 border border-[#353434] group">
            <img
              src="https://user22236.na.imgto.link/public/20260809/screenshot-2026-08-09-at-04-27-39.avif"
              alt="SIWES Student Lab"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141313] via-transparent to-transparent flex items-end p-4">
              <span className="text-xs font-serif text-[#ffffff] font-light">
                Practical Workstations at Orbit Hub Ilorin
              </span>
            </div>
          </div>

          <h3 className="text-xs font-mono tracking-widest text-[#c4c7c8] uppercase mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#ffffff]" />
            Accepted From Key Institutions
          </h3>

          <div className="space-y-2.5 mb-6 text-xs text-[#ffffff]">
            {[
              { name: 'University of Ilorin (UNILORIN)', status: 'Active Partners' },
              { name: 'Kwara State University (KWASU)', status: 'Active Partners' },
              { name: 'Kwara State Polytechnic, Ilorin', status: 'Active Partners' },
              { name: 'Federal Polytechnic Offa', status: 'Active Partners' },
              { name: 'Landmark University & Al-Hikmah', status: 'Active Partners' },
            ].map((inst, i) => (
              <div key={i} className="p-3 bg-[#201f1f] rounded-[10px] border border-[#353434] flex items-center justify-between">
                <span className="font-light text-xs">{inst.name}</span>
                <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-800/40">{inst.status}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveModal({ type: 'siwes' })}
            className="w-full py-3.5 rounded-full bg-[#ffffff] hover:bg-[#e2e2e2] text-[#141313] font-semibold text-xs transition-all shadow-md"
          >
            Submit SIWES Placement Request
          </button>
        </div>

      </div>
    </div>
  );
};
