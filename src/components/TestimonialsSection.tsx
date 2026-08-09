import React from 'react';
import { TESTIMONIALS_DATA } from '../data/workspaceData';
import { Star, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 relative bg-[#100e17]">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold text-[#a855f7] tracking-[0.2em] uppercase mb-2 block">
            Community Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-normal text-[#ffffff] font-serif leading-tight">
            Built by Hands-on Learning in Ilorin
          </h2>
          <p className="text-[#c4c7c8] font-light text-base mt-2">
            Hear from Orbit Space graduates, SIWES interns, and workspace members who built real projects with us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS_DATA.map((t) => (
            <div
              key={t.id}
              className="bg-[#181524] p-6 rounded-[16px] border border-[#332d47] hover:border-[#8b5cf6]/50 transition-all flex flex-col justify-between relative shadow-xl shadow-purple-950/20"
            >
              <Quote className="w-8 h-8 text-[#332d47] absolute top-6 right-6" />
              <div>
                <div className="flex items-center gap-1 text-[#a855f7] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#a855f7] text-[#a855f7]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#e2e8f0] leading-relaxed mb-6 font-serif font-light italic">
                  "{t.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#332d47]">
                <img
                  src={t.avatar}
                  alt={t.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-[#a855f7]/40 brightness-90 shadow-sm"
                />
                <div>
                  <h4 className="text-xs font-medium text-[#ffffff]">{t.name}</h4>
                  <p className="text-[10px] text-[#a855f7] font-mono tracking-wider font-semibold">{t.courseOrProgram}</p>
                  <p className="text-[10px] text-[#c4c7c8] font-light">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
