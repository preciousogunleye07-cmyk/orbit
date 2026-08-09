import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { FooterSection } from './components/FooterSection';

import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { SIWESPage } from './pages/SIWESPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { QuizPage } from './pages/QuizPage';

import { EnrollModal } from './components/modals/EnrollModal';
import { SIWESModal } from './components/modals/SIWESModal';
import { WorkspaceModal } from './components/modals/WorkspaceModal';
import { AboutModal } from './components/modals/AboutModal';
import { ContactModal } from './components/modals/ContactModal';
import { CourseDetailModal } from './components/modals/CourseDetailModal';

import { ActiveModal } from './types';

const VALID_PAGES = ['home', 'courses', 'siwes', 'workspace', 'quiz', 'about', 'contact'];

const getPageFromPath = (path: string): string => {
  const cleanPath = path.replace(/^\/+/, '').split('/')[0].toLowerCase();
  if (cleanPath && VALID_PAGES.includes(cleanPath)) {
    return cleanPath;
  }
  return 'home';
};

const PAGE_TITLES: Record<string, string> = {
  home: 'Orbit Space | Practical Tech Academy & Workspace in Ilorin',
  courses: 'Courses & Programs | Orbit Space Academia',
  siwes: 'SIWES Placement & Industrial Training | Orbit Space Academia',
  workspace: 'Coworking Space & Passes | Orbit Space Academia',
  quiz: 'Tech Career Advisor Quiz | Orbit Space Academia',
  about: 'About Orbit Space | Tech Hub in Ilorin',
  contact: 'Contact Us & Location | Orbit Space Academia'
};

export default function App() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [currentPage, setCurrentPageRaw] = useState<string>(() => {
    return getPageFromPath(window.location.pathname);
  });

  const changePage = (page: string, pushHistory = true) => {
    const validPage = VALID_PAGES.includes(page) ? page : 'home';
    setCurrentPageRaw(validPage);
    const targetPath = validPage === 'home' ? '/' : `/${validPage}`;

    if (PAGE_TITLES[validPage]) {
      document.title = PAGE_TITLES[validPage];
    }

    if (pushHistory && window.location.pathname !== targetPath) {
      window.history.pushState({ page: validPage }, '', targetPath);
    }
  };

  useEffect(() => {
    const initialPage = getPageFromPath(window.location.pathname);
    if (PAGE_TITLES[initialPage]) {
      document.title = PAGE_TITLES[initialPage];
    }

    const handlePopState = (e: PopStateEvent) => {
      const page = e.state?.page || getPageFromPath(window.location.pathname);
      changePage(page, false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen bg-[#141313] text-[#e5e2e1] font-sans selection:bg-[#353434] selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* Top Header Navbar */}
      <Navbar
        setActiveModal={setActiveModal}
        currentPage={currentPage}
        setCurrentPage={(p) => changePage(p, true)}
      />

      {/* Main Multi-Page Content Area */}
      <main className="pt-20 flex-1 relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {currentPage === 'home' && (
              <HomePage setActiveModal={setActiveModal} setCurrentPage={(p) => changePage(p, true)} />
            )}

            {currentPage === 'courses' && (
              <CoursesPage setActiveModal={setActiveModal} />
            )}

            {currentPage === 'siwes' && (
              <SIWESPage setActiveModal={setActiveModal} />
            )}

            {currentPage === 'workspace' && (
              <WorkspacePage setActiveModal={setActiveModal} />
            )}

            {currentPage === 'quiz' && (
              <QuizPage setActiveModal={setActiveModal} />
            )}

            {currentPage === 'about' && (
              <AboutPage setActiveModal={setActiveModal} />
            )}

            {currentPage === 'contact' && (
              <ContactPage />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Section */}
      <FooterSection
        setActiveModal={setActiveModal}
        setCurrentPage={(p) => changePage(p, true)}
      />

      {/* Interactive Modal Dialog Overlays */}
      <AnimatePresence>
        {activeModal?.type === 'enroll' && (
          <EnrollModal
            course={activeModal.course}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal?.type === 'siwes' && (
          <SIWESModal
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal?.type === 'workspace' && (
          <WorkspaceModal
            planId={activeModal.planId}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal?.type === 'about' && (
          <AboutModal
            onClose={() => setActiveModal(null)}
            onOpenEnroll={() => setActiveModal({ type: 'enroll' })}
          />
        )}

        {activeModal?.type === 'contact' && (
          <ContactModal
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal?.type === 'course-detail' && (
          <CourseDetailModal
            course={activeModal.course}
            onClose={() => setActiveModal(null)}
            onEnroll={() => setActiveModal({ type: 'enroll', course: activeModal.course })}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
