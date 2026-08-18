import React from 'react';
import { ActiveModal } from '../types';
import { MapPin, MessageCircle, Instagram, Linkedin, Video } from 'lucide-react';
import { OrbitLogo } from './OrbitLogo';
import { playSound } from '../utils/soundEffects';

interface FooterSectionProps {
  setActiveModal: (modal: ActiveModal) => void;
  setCurrentPage: (page: string) => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ setActiveModal, setCurrentPage }) => {
  const navigateToPage = (page: string) => {
    playSound('pulse');
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    playSound('scan');
    const text = encodeURIComponent("Hello Orbit Space! I am reaching out from your website.");
    window.open(`https://wa.me/2348067627491?text=${text}`, '_blank');
  };

  return (
    <footer className="bg-[#100e17] text-[#e2e8f0] border-t border-[#332d47] pt-16 sm:pt-20 pb-12 relative overflow-hidden">
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-[#332d47]">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-[#1f1b2e] border border-[#332d47] shadow-md shadow-purple-900/20">
                <OrbitLogo size={36} color="#c084fc" />
              </div>
              <div>
                <span className="font-serif text-2xl font-normal tracking-tight text-[#ffffff]">
                  oRbit<span className="text-[#a855f7] font-sans text-lg font-light">.space</span>
                </span>
                <p className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase font-semibold">
                  Come learn. Build. Grow.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#c4c7c8] font-light max-w-sm leading-relaxed">
              Orbit Space is a premier tech academy in Ilorin focused on practical, hands-on learning, SIWES student placements, and a state-of-the-art coworking workspace.
            </p>

            <div className="flex items-start gap-2 text-xs text-[#c4c7c8] font-light">
              <MapPin className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
              <span>Orbit Space, After Tanke Junction, behind Armour House, Ilorin, Kwara State.</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono tracking-widest text-[#a855f7] uppercase font-semibold">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-[#c4c7c8] font-light">
              <li>
                <button
                  onClick={() => navigateToPage('home')}
                  className="hover:text-[#a855f7] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('courses')}
                  className="hover:text-[#a855f7] transition-colors"
                >
                  Courses
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('timetable')}
                  className="hover:text-[#a855f7] transition-colors"
                >
                  Class Timetable
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('siwes')}
                  className="hover:text-[#a855f7] transition-colors"
                >
                  SIWES Placement
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('workspace')}
                  className="hover:text-[#a855f7] transition-colors"
                >
                  Workspace
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('quiz')}
                  className="hover:text-[#a855f7] transition-colors"
                >
                  Career Quiz
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('about')}
                  className="hover:text-[#a855f7] transition-colors"
                >
                  About Orbit Space
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('contact')}
                  className="hover:text-[#a855f7] transition-colors"
                >
                  Contact Us
                </button>
              </li>
              <li className="pt-2 border-t border-[#332d47]">
                <a
                  href="/ORB-8F29K2"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/ORB-8F29K2');
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  className="text-[#c084fc] hover:text-[#ffffff] transition-colors font-medium flex items-center gap-1.5"
                >
                  <span>Verify Certificate</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social Connections */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-mono tracking-widest text-[#a855f7] uppercase font-semibold">
              Connect With Orbit Space
            </h4>
            <p className="text-xs text-[#c4c7c8] font-light leading-relaxed">
              Follow our community updates, practical project showcases, and student highlights across social media.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={openWhatsApp}
                className="group px-3.5 py-2.5 rounded-xl bg-[#181524] hover:bg-[#231e34] border border-[#332d47] hover:border-[#a855f7]/50 text-[#e2e8f0] hover:text-[#ffffff] text-xs font-medium flex items-center gap-2.5 transition-all shadow-sm hover:shadow-purple-950/20"
                id="footer-whatsapp"
              >
                <div className="w-6 h-6 rounded-lg bg-[#231f33] border border-[#3d3654] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-[#a855f7]/40 transition-all">
                  <svg className="w-3.5 h-3.5 fill-current text-[#e2e8f0] group-hover:text-[#c084fc] shrink-0 transition-colors" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.707 1.456h.005c6.554 0 11.89-5.335 11.893-11.893 0-3.177-1.238-6.163-3.498-8.414" />
                  </svg>
                </div>
                <span>WhatsApp</span>
              </button>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="group px-3.5 py-2.5 rounded-xl bg-[#181524] hover:bg-[#231e34] border border-[#332d47] hover:border-[#a855f7]/50 text-[#e2e8f0] hover:text-[#ffffff] text-xs font-medium flex items-center gap-2.5 transition-all shadow-sm hover:shadow-purple-950/20"
                id="footer-instagram"
              >
                <div className="w-6 h-6 rounded-lg bg-[#231f33] border border-[#3d3654] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-[#a855f7]/40 transition-all">
                  <svg className="w-3.5 h-3.5 fill-current text-[#e2e8f0] group-hover:text-[#c084fc] shrink-0 transition-colors" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <span>Instagram</span>
              </a>

              <a
                href="https://www.tiktok.com/@orb_itspace"
                target="_blank"
                rel="noreferrer"
                className="group px-3.5 py-2.5 rounded-xl bg-[#181524] hover:bg-[#231e34] border border-[#332d47] hover:border-[#a855f7]/50 text-[#e2e8f0] hover:text-[#ffffff] text-xs font-medium flex items-center gap-2.5 transition-all shadow-sm hover:shadow-purple-950/20"
                id="footer-tiktok"
              >
                <div className="w-6 h-6 rounded-lg bg-[#231f33] border border-[#3d3654] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-[#a855f7]/40 transition-all">
                  <svg className="w-3.5 h-3.5 fill-current text-[#e2e8f0] group-hover:text-[#c084fc] shrink-0 transition-colors" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.31 1.56-1.3 2.56.01 1.01.55 1.97 1.39 2.52.92.6 2.12.65 3.08.18.91-.42 1.54-1.34 1.62-2.34.02-3.72.01-7.44.01-11.16z" />
                  </svg>
                </div>
                <span>TikTok</span>
              </a>

              <a
                href="https://www.linkedin.com/company/orbit-space-ilorin"
                target="_blank"
                rel="noreferrer"
                className="group px-3.5 py-2.5 rounded-xl bg-[#181524] hover:bg-[#231e34] border border-[#332d47] hover:border-[#a855f7]/50 text-[#e2e8f0] hover:text-[#ffffff] text-xs font-medium flex items-center gap-2.5 transition-all shadow-sm hover:shadow-purple-950/20"
                id="footer-linkedin"
              >
                <div className="w-6 h-6 rounded-lg bg-[#231f33] border border-[#3d3654] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-[#a855f7]/40 transition-all">
                  <svg className="w-3.5 h-3.5 fill-current text-[#e2e8f0] group-hover:text-[#c084fc] shrink-0 transition-colors" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </div>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#c4c7c8] font-light">
          <p>© {new Date().getFullYear()} Orbit Space Tech Academy. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[#a855f7]">
            <span>Practical Learning Hub in Ilorin, Kwara State</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
