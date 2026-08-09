import React from 'react';
import { WORKSPACE_PLANS } from '../data/workspaceData';
import { ActiveModal } from '../types';
import { Zap, Wifi, Clock, CheckCircle2, Building, ShieldCheck, Coffee, Airplay, MapPin, ArrowRight } from 'lucide-react';

interface WorkspacePageProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({ setActiveModal }) => {
  return (
    <div className="py-20 max-w-[1200px] mx-auto px-6 bg-[#141313] min-h-screen">
      {/* Header Banner */}
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-semibold text-[#c4c7c8] tracking-[0.2em] uppercase mb-2 block">
          Coworking & Workspace Passes
        </span>
        <h1 className="text-4xl md:text-5xl font-light text-[#ffffff] font-serif leading-tight mb-4">
          Reliable Workspace with Power & Fiber Internet in Ilorin
        </h1>
        <p className="text-base text-[#c4c7c8] font-light leading-relaxed">
          Uninterrupted solar + generator power supply, high-speed low-latency internet, air-conditioned quiet rooms, and ergonomic desk setups.
        </p>
      </div>

      {/* Featured Photo Banner */}
      <div className="relative h-64 sm:h-80 rounded-[20px] overflow-hidden mb-12 border border-[#353434] shadow-2xl group">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
          alt="Orbit Space Coworking Environment"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141313] via-[#141313]/70 to-transparent flex items-center p-8 sm:p-12">
          <div className="max-w-lg">
            <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-[#353434] text-[#e5e2e1] mb-3 inline-block border border-[#444748]">
              Quiet & Focused Atmosphere
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-light mb-3">
              Work Without Power Outages or Slow Networks
            </h2>
            <p className="text-xs sm:text-sm text-[#c4c7c8] font-light mb-6 leading-relaxed">
              Walk in, plug in your laptop, enjoy high-speed fiber connection, and build without disruption.
            </p>
            <button
              onClick={() => setActiveModal({ type: 'workspace' })}
              className="px-6 py-3 rounded-full bg-[#ffffff] hover:bg-[#e2e2e2] text-[#141313] font-semibold text-xs shadow-md transition-all"
            >
              Book Desk Pass Now
            </button>
          </div>
        </div>
      </div>

      {/* Amenity Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {[
          { icon: Zap, title: '24/7 Solar & Gen Power', desc: 'Zero downtime guaranteed' },
          { icon: Wifi, title: 'Fiber Optic Internet', desc: 'High bandwidth low latency' },
          { icon: Airplay, title: 'Air-Conditioned Comfort', desc: 'Cool quiet workspace' },
          { icon: Coffee, title: 'Complimentary Drinks', desc: 'Coffee, tea & water' },
        ].map((item, index) => (
          <div key={index} className="p-5 bg-[#1c1b1b] rounded-[16px] border border-[#353434] flex items-start gap-3.5">
            <div className="p-2.5 rounded-full bg-[#201f1f] border border-[#353434] text-[#ffffff] shrink-0">
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-medium text-[#ffffff] mb-0.5">{item.title}</h4>
              <p className="text-[11px] text-[#c4c7c8] font-light">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Cards Grid - EXACT PRICES: Daily: ₦3,000 | Weekly: ₦12,000 | Monthly: ₦25,000 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {WORKSPACE_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`bg-[#1c1b1b] rounded-[20px] p-8 border transition-all duration-300 flex flex-col justify-between relative shadow-xl ${
              plan.recommended
                ? 'border-[#ffffff] shadow-2xl'
                : 'border-[#353434] hover:border-[#8e9192]'
            }`}
          >
            {plan.recommended && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ffffff] text-[#141313] text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full font-bold shadow-md">
                Most Popular Choice
              </span>
            )}

            <div>
              <div className="mb-4">
                <h3 className="text-xl font-serif text-[#ffffff] font-light mb-1">{plan.name}</h3>
              </div>

              <div className="mb-6 p-4 rounded-[12px] bg-[#201f1f] border border-[#353434]">
                <span className="text-3xl font-serif text-[#ffffff]">{plan.formattedPrice}</span>
                <span className="text-xs text-[#c4c7c8] font-light ml-1">/ {plan.period}</span>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#c4c7c8] font-light leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveModal({ type: 'workspace', planId: plan.id })}
              className={`w-full py-3.5 rounded-full font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                plan.recommended
                  ? 'bg-[#ffffff] hover:bg-[#e2e2e2] text-[#141313] shadow-md'
                  : 'bg-[#201f1f] hover:bg-[#353434] text-[#e5e2e1] border border-[#353434]'
              }`}
            >
              <span>Book {plan.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
