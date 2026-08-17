import React from 'react';
import { ActiveModal } from '../types';
import { playSound } from '../utils/soundEffects';
import { 
  Wifi, 
  Zap, 
  Coffee, 
  ArrowRight, 
  Building
} from 'lucide-react';

interface WorkspaceSectionProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({ setActiveModal }) => {
  return (
    <section id="workspace" className="py-16 sm:py-20 relative bg-[#100e17]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-8 sm:mb-12">
          <span className="text-xs font-semibold text-[#a855f7] tracking-[0.2em] uppercase mb-2 block">
            Coworking Sanctuary
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#ffffff] font-serif leading-tight">
            A Space Built for Focused Work
          </h2>
          <p className="text-[#c4c7c8] font-light text-sm sm:text-base mt-2">
            Need somewhere quiet, comfortable, and reliable to code, study, or host tech meetings in Ilorin?
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { icon: Zap, label: 'Uninterrupted Power', sub: 'Solar + Generator Backup' },
            { icon: Wifi, label: 'High-Speed Fiber Internet', sub: 'Low Latency Link' },
            { icon: Building, label: 'Ergonomic Desk Setup', sub: 'Air Conditioned Space' },
            { icon: Coffee, label: 'Coffee & Refreshments', sub: 'Lounge & Meeting Pods' },
          ].map((item, i) => (
            <div key={i} className="bg-[#181524] p-4 sm:p-5 rounded-[16px] border border-[#332d47] flex flex-col items-start text-left shadow-lg hover:border-[#8b5cf6]/50 transition-all">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center mb-2.5 sm:mb-3">
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#a855f7]" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#ffffff] leading-snug">{item.label}</p>
              <p className="text-[11px] sm:text-xs text-[#c4c7c8] mt-1 font-light leading-snug">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Workspace Photo Banner */}
        <div className="relative h-52 sm:h-80 rounded-[24px] overflow-hidden mb-8 sm:mb-12 border border-[#332d47] shadow-2xl shadow-purple-950/30 group">
          <img
            src="https://cdn.phototourl.com/free/2026-08-09-c5183788-9dc8-4bb4-9bd5-de3082a92959.png"
            alt="Orbit Space Coworking Environment"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#100e17] via-[#100e17]/80 to-transparent flex items-center p-5 sm:p-12">
            <div className="max-w-md">
              <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-[#a855f7] uppercase mb-1 sm:mb-2 block font-semibold">
                Quiet & Focused Atmosphere
              </span>
              <h3 className="text-lg sm:text-3xl font-serif text-[#ffffff] font-normal mb-1.5 sm:mb-3 leading-snug">
                Work Without Power Interruptions
              </h3>
              <p className="text-xs sm:text-sm text-[#c4c7c8] font-light leading-relaxed">
                Walk in, pick a desk, connect to high-speed fiber internet, and build your products in peace.
              </p>
            </div>
          </div>
        </div>

        {/* Action CTA */}
        <div className="text-center">
          <button
            onClick={() => {
              playSound('sparkle');
              setActiveModal({ type: 'workspace' });
            }}
            className="btn-purple inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-xs transition-all shadow-lg cursor-pointer"
            id="btn-explore-workspace"
          >
            <span>Explore Workspace & Passes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
