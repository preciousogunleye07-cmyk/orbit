import React from 'react';
import { ArrowRight, MapPin, Zap, ShieldCheck, GraduationCap, Mail } from 'lucide-react';
import { ActiveModal } from '../types';
import ShapeGrid from './ShapeGrid';
import RotatingText from './RotatingText';
import ScrollVelocity from './ScrollVelocity';

interface HeroSectionProps {
  setActiveModal: (modal: ActiveModal) => void;
  onExploreCourses: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ setActiveModal, onExploreCourses }) => {
  return (
    <section id="hero" className="relative pt-28 pb-16 overflow-visible bg-[#100e17]">
      {/* ShapeGrid Interactive Canvas Background */}
      <div className="absolute inset-0 opacity-30 z-0">
        <ShapeGrid 
          speed={0.3} 
          squareSize={48}
          direction="diagonal"
          borderColor="rgba(168, 85, 247, 0.18)"
          hoverFillColor="rgba(168, 85, 247, 0.35)"
          shape="square"
          hoverTrailAmount={5}
        />
      </div>

      {/* Radial Purple Glow Overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-violet-800/15 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        
        {/* Main Hero Content Area */}
        <div className="pt-8 pb-14 max-w-4xl mx-auto text-center space-y-6">

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal text-[#ffffff] font-serif leading-[1.2] tracking-tight flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span>Launch Your Career</span>
            <RotatingText
              texts={['Into Tech.', 'Into Software.', 'Into Cybersecurity.', 'Into AI & Data.']}
              mainClassName="px-3 sm:px-4 py-1 bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#e879f9] text-[#100e17] font-sans font-semibold rounded-xl overflow-hidden shadow-lg inline-flex items-center text-3xl sm:text-4xl md:text-5xl"
              staggerFrom="last"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              rotationInterval={2200}
            />
          </h1>

          <p className="text-[#c4c7c8] text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto text-center">
            Orbit Space is a tech academy in Ilorin focused on practical, hands-on learning. We bridge the gap between theoretical computer science and production software engineering.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-md sm:max-w-none mx-auto">
            <button
              onClick={() => setActiveModal({ type: 'contact' })}
              className="w-full sm:w-auto btn-purple text-sm font-semibold px-8 py-3.5 rounded-full flex items-center justify-center gap-2 group shadow-lg"
              id="btn-learn-more-hero"
            >
              <span>Contact Us</span>
              <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={onExploreCourses}
              className="w-full sm:w-auto bg-[#1f1b2e] text-[#e2e8f0] border border-[#332d47] text-sm font-medium px-8 py-3.5 rounded-full hover:bg-[#332d47] hover:text-[#ffffff] hover:border-[#8b5cf6]/50 transition-all text-center"
              id="btn-explore-courses-hero"
            >
              <span>Explore Programs</span>
            </button>
          </div>

        </div>

        {/* High Resolution Parallax Hero Image Banner */}
        <div className="w-full h-[260px] sm:h-[380px] md:h-[480px] rounded-2xl overflow-hidden relative border border-[#332d47] shadow-2xl shadow-purple-950/30 mb-12 group">
          <img
            src="https://cdn.phototourl.com/free/2026-08-09-2ccdab1a-ad07-4c0d-837c-4ab2e5fe796a.jpg"
            alt="Orbit Space Collaborative Tech Learning Hub"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#100e17] via-[#100e17]/40 to-transparent flex items-end p-8">
            <div className="max-w-xl">
              <span className="text-[10px] uppercase tracking-widest text-[#a855f7] font-mono block mb-1">
                Tanke Junction Area • Ilorin, Kwara State
              </span>
              <p className="text-2xl font-serif text-[#ffffff] font-normal">
                A sanctuary for developers, cybersecurity analysts, and data pioneers.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Velocity Marquee Banner */}
        <div className="w-full overflow-hidden mb-16 py-3 border-y border-[#332d47] bg-[#181524]/60 backdrop-blur-sm">
          <ScrollVelocity
            texts={[
              'SOFTWARE ENGINEERING • CYBERSECURITY & SOC • DATA & AI LABS • SIWES PLACEMENT • COWORKING PASS •',
              'COME LEARN • BUILD • GROW • ORBIT SPACE ILORIN •'
            ]}
            velocity={50}
            className="text-xs sm:text-sm font-mono tracking-[0.2em] uppercase text-[#c084fc] font-semibold"
            numCopies={4}
          />
        </div>



        {/* Core Capabilities 4-Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
          <div className="flex flex-col relative border-t border-[#332d47] pt-6 group">
            <MapPin className="w-6 h-6 text-[#a855f7] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-serif text-[#ffffff] mb-2 font-normal">Ilorin Campus</h3>
            <p className="text-sm text-[#c4c7c8] font-light leading-relaxed">Modern physical workstation, air-conditioned labs, and community desk space.</p>
          </div>

          <div className="flex flex-col relative border-t border-[#332d47] pt-6 group">
            <Zap className="w-6 h-6 text-[#a855f7] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-serif text-[#ffffff] mb-2 font-normal">24/7 Power & Fiber</h3>
            <p className="text-sm text-[#c4c7c8] font-light leading-relaxed">Uninterrupted solar back-up grid and high-speed dedicated internet link.</p>
          </div>

          <div className="flex flex-col relative border-t border-[#332d47] pt-6 group">
            <ShieldCheck className="w-6 h-6 text-[#a855f7] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-serif text-[#ffffff] mb-2 font-normal">100% Practical</h3>
            <p className="text-sm text-[#c4c7c8] font-light leading-relaxed">Build live web apps, deploy servers, and perform ethical hacking labs from Day 1.</p>
          </div>

          <div className="flex flex-col relative border-t border-[#332d47] pt-6 group">
            <GraduationCap className="w-6 h-6 text-[#a855f7] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-serif text-[#ffffff] mb-2 font-normal">SIWES Placement</h3>
            <p className="text-sm text-[#c4c7c8] font-light leading-relaxed">Instant IT acceptance letters, logbook guidance, and real company projects.</p>
          </div>
        </div>

      </div>
    </section>
  );
};
