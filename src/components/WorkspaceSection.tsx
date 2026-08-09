import React, { useState } from 'react';
import { WORKSPACE_PLANS } from '../data/workspaceData';
import { ActiveModal } from '../types';
import { 
  Wifi, 
  Zap, 
  Coffee, 
  ArrowRight, 
  Check, 
  Building,
  Calendar
} from 'lucide-react';

interface WorkspaceSectionProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({ setActiveModal }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('weekly-pass');

  return (
    <section id="workspace" className="py-20 relative bg-[#100e17]">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold text-[#a855f7] tracking-[0.2em] uppercase mb-2 block">
            Coworking Sanctuary
          </span>
          <h2 className="text-3xl md:text-4xl font-normal text-[#ffffff] font-serif leading-tight">
            A Space Built for Focused Work
          </h2>
          <p className="text-[#c4c7c8] font-light text-base mt-2">
            Need somewhere quiet, comfortable, and reliable to code, study, or host tech meetings in Ilorin?
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Zap, label: 'Uninterrupted Power', sub: 'Solar + Generator Backup' },
            { icon: Wifi, label: 'High-Speed Fiber Internet', sub: 'Low Latency Link' },
            { icon: Building, label: 'Ergonomic Desk Setup', sub: 'Air Conditioned Space' },
            { icon: Coffee, label: 'Coffee & Refreshments', sub: 'Lounge & Meeting Pods' },
          ].map((item, i) => (
            <div key={i} className="bg-[#181524] p-5 rounded-[16px] border border-[#332d47] flex flex-col items-start text-left shadow-lg hover:border-[#8b5cf6]/50 transition-all">
              <div className="w-10 h-10 rounded-full bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-[#a855f7]" />
              </div>
              <p className="text-sm font-medium text-[#ffffff]">{item.label}</p>
              <p className="text-xs text-[#c4c7c8] mt-1 font-light">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Workspace Photo Banner */}
        <div className="relative h-64 sm:h-80 rounded-[24px] overflow-hidden mb-12 border border-[#332d47] shadow-2xl shadow-purple-950/30 group">
          <img
            src="https://cdn.phototourl.com/free/2026-08-09-c5183788-9dc8-4bb4-9bd5-de3082a92959.png"
            alt="Orbit Space Coworking Environment"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#100e17] via-[#100e17]/70 to-transparent flex items-center p-8 sm:p-12">
            <div className="max-w-md">
              <span className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase mb-2 block font-semibold">
                Quiet & Focused Atmosphere
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal mb-3">
                Work Without Power Interruptions
              </h3>
              <p className="text-xs sm:text-sm text-[#c4c7c8] font-light leading-relaxed">
                Walk in, pick a desk, connect to high-speed fiber internet, and build your products in peace.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {WORKSPACE_PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative bg-[#1f1b2e] rounded-[20px] p-8 border transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xl ${
                plan.recommended
                  ? 'border-[#8b5cf6] bg-[#1f1b2e] shadow-2xl shadow-purple-900/30'
                  : 'border-[#332d47] hover:border-[#8b5cf6]/60'
              }`}
              id={`workspace-plan-${plan.id}`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-[#ffffff] text-[10px] font-mono tracking-widest uppercase font-semibold shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-serif text-[#ffffff] font-normal">{plan.name}</h3>
                  <Calendar className="w-5 h-5 text-[#a855f7]" />
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-serif text-[#ffffff] font-normal">
                    {plan.formattedPrice}
                  </span>
                  <span className="text-xs text-[#c4c7c8] font-light ml-1">
                    / {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#c4c7c8] font-light">
                      <Check className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModal({ type: 'workspace', planId: plan.id });
                }}
                className={`w-full py-3 px-4 rounded-full font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                  plan.recommended
                    ? 'btn-purple shadow-lg'
                    : 'bg-[#181524] hover:bg-[#332d47] text-[#e2e8f0] border border-[#332d47] hover:text-[#a855f7]'
                }`}
              >
                <span>Reserve Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Action CTA */}
        <div className="text-center">
          <button
            onClick={() => setActiveModal({ type: 'workspace' })}
            className="btn-purple inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-xs transition-all shadow-lg"
            id="btn-explore-workspace"
          >
            <span>Explore Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
