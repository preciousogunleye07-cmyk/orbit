import React, { useState } from 'react';
import { FAQ_DATA } from '../data/workspaceData';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-20 relative bg-[#100e17]">
      <div className="max-w-[800px] mx-auto px-6 relative z-10">
        
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold text-[#a855f7] tracking-[0.2em] uppercase mb-2 block">
            Got Questions?
          </span>
          <h2 className="text-3xl md:text-4xl font-normal text-[#ffffff] font-serif leading-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((faq, idx) => (
            <div
              key={idx}
              className={`rounded-[16px] bg-[#181524] border border-[#332d47] transition-all shadow-lg ${
                openIdx === idx ? 'border-[#a855f7]' : ''
              }`}
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className={`text-sm font-medium ${openIdx === idx ? 'text-[#a855f7]' : 'text-[#ffffff]'}`}>
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#a855f7] shrink-0 transition-transform ${
                    openIdx === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIdx === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-[#c4c7c8] font-light leading-relaxed border-t border-[#332d47] bg-[#181524] animate-fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
