import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowUpRight, MapPin, Volume2, VolumeX } from 'lucide-react';
import { ActiveModal } from '../types';
import { GooeyNav, GooeyNavItem } from './GooeyNav';
import { OrbitLogo } from './OrbitLogo';
import { playSound, toggleSound, getSoundStatus } from '../utils/soundEffects';

interface NavbarProps {
  setActiveModal: (modal: ActiveModal) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setActiveModal, currentPage, setCurrentPage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setSoundEnabled(getSoundStatus());
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleAudio = () => {
    const newState = toggleSound();
    setSoundEnabled(newState);
  };

  const handleNavClick = (page: string) => {
    playSound('pulse');
    setMobileMenuOpen(false);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navPages = ['home', 'courses', 'timetable', 'siwes', 'workspace', 'quiz', 'about', 'contact'];
  const activeIndex = Math.max(0, navPages.indexOf(currentPage));

  const gooeyNavItems: GooeyNavItem[] = [
    { label: 'Home', onClick: () => handleNavClick('home') },
    { label: 'Courses', onClick: () => handleNavClick('courses') },
    { label: 'Timetable', onClick: () => handleNavClick('timetable') },
    { label: 'SIWES', onClick: () => handleNavClick('siwes') },
    { label: 'Workspace', onClick: () => handleNavClick('workspace') },
    { label: 'Advisor', onClick: () => handleNavClick('quiz') },
    { label: 'About', onClick: () => handleNavClick('about') },
    { label: 'Contact', onClick: () => handleNavClick('contact') }
  ];

  const openWhatsApp = () => {
    const text = encodeURIComponent("Hello Orbit Space Ilorin! I would like to inquire about courses, SIWES placement, and workspace pass.");
    window.open(`https://wa.me/2348123456789?text=${text}`, '_blank');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent ${
        scrolled ? 'py-3' : 'py-4'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer text-left shrink-0 min-h-[44px]"
            id="brand-logo"
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              <OrbitLogo size={32} color="#c084fc" className="group-hover:scale-105 transition-transform shrink-0" />
              <div className="h-5 w-[1px] bg-[#332d47]" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#ffffff] tracking-tight font-sans leading-none">
                  oRbit<span className="text-[#a855f7] font-light">.space</span>
                </span>
                <span className="text-[9px] text-[#c4c7c8] font-mono tracking-widest uppercase flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2 h-2 text-[#a855f7]" /> Ilorin Hub
                </span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block bg-[#1f1b2e]/80 px-3 py-1.5 rounded-full border border-[#332d47]" id="desktop-nav">
            <GooeyNav
              items={gooeyNavItems}
              activeIndex={activeIndex}
              particleCount={12}
              particleDistances={[60, 10]}
              colors={[1, 2, 3, 4]}
            />
          </div>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={handleToggleAudio}
              className="p-2 rounded-full text-[#c4c7c8] hover:text-[#ffffff] bg-[#1f1b2e] hover:bg-[#2b253f] border border-[#332d47] transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
              title={soundEnabled ? 'Mute Interaction Sounds' : 'Unmute Interaction Sounds'}
              aria-label={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#c084fc]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#c4c7c8]" />
              )}
            </button>
            <button
              onClick={() => {
                playSound('pulse');
                window.history.pushState({}, '', '/admin/login');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="px-4 py-2 rounded-full text-xs font-medium text-[#c084fc] hover:text-[#ffffff] bg-[#1f1b2e] hover:bg-[#2b253f] border border-[#332d47] transition-all min-h-[40px] flex items-center gap-1.5"
              id="btn-verify-header"
            >
              <span>Verify Certificate</span>
            </button>
            <button
              onClick={() => {
                playSound('sparkle');
                setActiveModal({ type: 'enroll' });
              }}
              className="btn-purple flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold shadow-md transition-all min-h-[40px]"
              id="btn-apply-header"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-lg bg-[#201f1f] border border-[#353434] text-[#ffffff] min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="md:hidden bg-[#1c1b1b]/95 backdrop-blur-xl border-b border-[#353434] px-4 sm:px-6 pt-4 pb-6 mt-2 space-y-2 shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            {[
              { id: 'home', label: 'Home' },
              { id: 'courses', label: 'Courses Catalog' },
              { id: 'timetable', label: 'Class Timetable' },
              { id: 'siwes', label: 'SIWES Placement' },
              { id: 'workspace', label: 'Workspace Passes' },
              { id: 'quiz', label: 'Career Advisor' },
              { id: 'about', label: 'About Orbit Space' },
              { id: 'contact', label: 'Contact & Location' },
            ].map((item, idx) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.2 }}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-4 py-2.5 rounded-lg font-medium text-xs transition-colors ${
                  currentPage === item.id ? 'bg-[#ffffff] text-[#141313] font-semibold' : 'text-[#c4c7c8] hover:bg-[#201f1f]'
                }`}
              >
                {item.label}
              </motion.button>
            ))}

            <div className="pt-3 border-t border-[#353434] flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveModal({ type: 'enroll' });
                }}
                className="w-full py-2.5 rounded-full bg-[#ffffff] text-[#141313] font-bold text-center text-xs shadow-sm hover:bg-slate-200 transition-colors"
              >
                Enroll in a Program
              </button>
              <button
                onClick={openWhatsApp}
                className="w-full py-2.5 rounded-full bg-[#201f1f] border border-[#353434] text-[#e5e2e1] font-medium text-center text-xs flex items-center justify-center gap-2 hover:bg-[#2d2c2c] transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current text-emerald-400 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.707 1.456h.005c6.554 0 11.89-5.335 11.893-11.893 0-3.177-1.238-6.163-3.498-8.414" />
                </svg>
                Chat on WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
