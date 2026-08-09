import React from 'react';
import { ActiveModal } from '../types';
import { Orbit, MapPin, CheckCircle2, ShieldCheck, Users, Target, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setActiveModal }) => {
  return (
    <div className="py-20 max-w-[1200px] mx-auto px-6 bg-[#141313] min-h-screen">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-semibold text-[#c4c7c8] tracking-[0.2em] uppercase mb-2 block">
          About Orbit Space Hub
        </span>
        <h1 className="text-4xl md:text-5xl font-light text-[#ffffff] font-serif leading-tight mb-4">
          Ilorin's Premier Practical Tech Academy & Coworking Hub
        </h1>
        <p className="text-base text-[#c4c7c8] font-light leading-relaxed">
          Founded with a clear mission: bridging the gap between theoretical tech education and real-world software engineering practice in Kwara State.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-2xl md:text-3xl font-serif font-light text-[#ffffff]">
            Practical Hands-On Learning That Actually Works
          </h2>

          <p className="text-xs sm:text-sm text-[#c4c7c8] font-light leading-relaxed">
            At Orbit Space, we believe coding, cybersecurity, and data analysis cannot be learned from textbooks alone. Our students build real web apps, conduct penetration tests in sandbox environments, and query live relational databases from Day 1.
          </p>

          <div className="space-y-3 pt-2">
            {[
              '100% Project-Based Curriculum aligned with international tech standards',
              'Experienced industry mentors who write code and build production systems daily',
              'SIWES Industrial Training placement and supervisor logbook sign-offs',
              'State-of-the-art physical workstations with 24/7 power & fiber internet',
              'Thriving community of developers, designers, and tech founders in Ilorin',
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2.5 text-xs text-[#c4c7c8] font-light">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveModal({ type: 'enroll' })}
              className="px-8 py-3.5 rounded-full bg-[#ffffff] hover:bg-[#e2e2e2] text-[#141313] font-semibold text-xs shadow-md transition-all"
            >
              Enroll in a Program
            </button>
            <button
              onClick={() => setActiveModal({ type: 'contact' })}
              className="px-6 py-3.5 rounded-full bg-[#1c1b1b] hover:bg-[#353434] text-[#e5e2e1] font-medium text-xs border border-[#353434] transition-all"
            >
              Visit Our Campus
            </button>
          </div>
        </div>

        {/* Right Photo */}
        <div className="lg:col-span-5">
          <div className="relative rounded-[20px] overflow-hidden border border-[#353434] shadow-2xl group">
            <img
              src="https://cdn.phototourl.com/free/2026-08-09-2ccdab1a-ad07-4c0d-837c-4ab2e5fe796a.jpg"
              alt="Orbit Space Collaborative Environment"
              referrerPolicy="no-referrer"
              className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141313] via-transparent to-transparent flex items-end p-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#353434] text-[#e5e2e1] mb-1 inline-block border border-[#444748]">
                  Ilorin Campus
                </span>
                <p className="text-sm font-serif text-[#ffffff] font-light">
                  Collaborative Learning Workstations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[#353434]">
        <div className="p-6 bg-[#1c1b1b] rounded-[16px] border border-[#353434]">
          <div className="w-10 h-10 rounded-full bg-[#201f1f] border border-[#353434] text-[#ffffff] flex items-center justify-center mb-4">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-serif font-light text-[#ffffff] mb-2">Our Core Mission</h3>
          <p className="text-xs text-[#c4c7c8] font-light leading-relaxed">
            Empower 5,000+ youth and undergraduates in Kwara State with job-ready technical skills and practical work experience by 2028.
          </p>
        </div>

        <div className="p-6 bg-[#1c1b1b] rounded-[16px] border border-[#353434]">
          <div className="w-10 h-10 rounded-full bg-[#201f1f] border border-[#353434] text-[#ffffff] flex items-center justify-center mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-serif font-light text-[#ffffff] mb-2">Vibrant Community</h3>
          <p className="text-xs text-[#c4c7c8] font-light leading-relaxed">
            Join weekend hackathons, project review sessions, guest lectures from international engineers, and peer pair programming.
          </p>
        </div>

        <div className="p-6 bg-[#1c1b1b] rounded-[16px] border border-[#353434]">
          <div className="w-10 h-10 rounded-full bg-[#201f1f] border border-[#353434] text-[#ffffff] flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-serif font-light text-[#ffffff] mb-2">Verified Credentials</h3>
          <p className="text-xs text-[#c4c7c8] font-light leading-relaxed">
            Earn industry-recognized certificates of completion backed by verified practical capstone projects hosted publicly on GitHub.
          </p>
        </div>
      </div>
    </div>
  );
};
