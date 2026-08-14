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

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardLayout } from './pages/admin/AdminDashboardLayout';
import { PublicCertificatePage } from './pages/PublicCertificatePage';

import { EnrollModal } from './components/modals/EnrollModal';
import { SIWESModal } from './components/modals/SIWESModal';
import { WorkspaceModal } from './components/modals/WorkspaceModal';
import { AboutModal } from './components/modals/AboutModal';
import { ContactModal } from './components/modals/ContactModal';
import { CourseDetailModal } from './components/modals/CourseDetailModal';

import { ActiveModal } from './types';
import { isAdminAuthenticated } from './services/certificateService';

const MAIN_PAGES = ['home', 'courses', 'siwes', 'workspace', 'quiz', 'about', 'contact'];

type RouteState = 
  | { mode: 'main'; page: string }
  | { mode: 'admin-login' }
  | { mode: 'admin-dashboard'; subTab?: 'overview' | 'directory' | 'create' }
  | { mode: 'public-certificate'; authId: string };

function parsePathToRoute(path: string): RouteState {
  const cleanPath = path.replace(/^\/+/, '').trim();
  const lowerPath = cleanPath.toLowerCase();

  if (!lowerPath) {
    return { mode: 'main', page: 'home' };
  }

  // Admin routes
  if (lowerPath === 'admin/login') {
    return { mode: 'admin-login' };
  }

  if (lowerPath === 'admin') {
    return { mode: 'admin-dashboard', subTab: 'overview' };
  }

  if (lowerPath === 'admin/certificates') {
    return { mode: 'admin-dashboard', subTab: 'directory' };
  }

  if (lowerPath === 'admin/certificates/new') {
    return { mode: 'admin-dashboard', subTab: 'create' };
  }

  // Main site pages
  if (MAIN_PAGES.includes(lowerPath)) {
    return { mode: 'main', page: lowerPath };
  }

  // Handle /verify/ORB-8F29K2 or /ORB-8F29K2
  if (lowerPath.startsWith('verify/')) {
    const certId = cleanPath.substring(7).trim();
    return { mode: 'public-certificate', authId: certId.toUpperCase() };
  }

  if (lowerPath === 'verify') {
    return { mode: 'public-certificate', authId: '' };
  }

  // Default: treat any single path segment e.g. /ORB-8F29K2 as public certificate route
  return { mode: 'public-certificate', authId: cleanPath.toUpperCase() };
}

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
  const [route, setRoute] = useState<RouteState>(() => parsePathToRoute(window.location.pathname));

  const navigateTo = (path: string, pushHistory = true) => {
    const newRoute = parsePathToRoute(path);
    setRoute(newRoute);

    if (newRoute.mode === 'main' && PAGE_TITLES[newRoute.page]) {
      document.title = PAGE_TITLES[newRoute.page];
    } else if (newRoute.mode === 'admin-login' || newRoute.mode === 'admin-dashboard') {
      document.title = 'Certificate Authentication Admin | Orbit Space';
    } else if (newRoute.mode === 'public-certificate') {
      document.title = `Certificate Verification ${newRoute.authId ? '(' + newRoute.authId + ')' : ''} | Orbit Space`;
    }

    if (pushHistory && window.location.pathname !== path) {
      window.history.pushState({ path }, '', path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parsePathToRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Admin authentication guard
  const isAuthenticated = isAdminAuthenticated();

  return (
    <div className="min-h-screen bg-[#141313] text-[#e5e2e1] font-sans selection:bg-[#353434] selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* Show Main Navbar only when on Main site pages */}
      {route.mode === 'main' && (
        <Navbar
          setActiveModal={setActiveModal}
          currentPage={route.page}
          setCurrentPage={(p) => navigateTo(p === 'home' ? '/' : `/${p}`)}
        />
      )}

      {/* Main Content Router */}
      <main className="flex-1 relative w-full">
        <AnimatePresence mode="wait">
          
          {/* 1. Main Site Pages */}
          {route.mode === 'main' && (
            <motion.div
              key={`main-${route.page}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full pt-20"
            >
              {route.page === 'home' && (
                <HomePage setActiveModal={setActiveModal} setCurrentPage={(p) => navigateTo(`/${p}`)} />
              )}
              {route.page === 'courses' && (
                <CoursesPage setActiveModal={setActiveModal} />
              )}
              {route.page === 'siwes' && (
                <SIWESPage setActiveModal={setActiveModal} />
              )}
              {route.page === 'workspace' && (
                <WorkspacePage setActiveModal={setActiveModal} />
              )}
              {route.page === 'quiz' && (
                <QuizPage setActiveModal={setActiveModal} />
              )}
              {route.page === 'about' && (
                <AboutPage setActiveModal={setActiveModal} />
              )}
              {route.page === 'contact' && (
                <ContactPage />
              )}
            </motion.div>
          )}

          {/* 2. Admin Login Page */}
          {route.mode === 'admin-login' && (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <AdminLoginPage
                onSuccess={() => navigateTo('/admin')}
                onNavigateHome={() => navigateTo('/')}
              />
            </motion.div>
          )}

          {/* 3. Admin Dashboard (Protected Route) */}
          {route.mode === 'admin-dashboard' && (
            <motion.div
              key="admin-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {isAuthenticated ? (
                <AdminDashboardLayout
                  initialTab={route.subTab || 'overview'}
                  onLogout={() => navigateTo('/admin/login')}
                  onNavigateHome={() => navigateTo('/')}
                  onOpenPublicPage={(id) => navigateTo(`/${id}`)}
                />
              ) : (
                <AdminLoginPage
                  onSuccess={() => navigateTo('/admin')}
                  onNavigateHome={() => navigateTo('/')}
                />
              )}
            </motion.div>
          )}

          {/* 4. Public Certificate Authentication Page */}
          {route.mode === 'public-certificate' && (
            <motion.div
              key={`public-cert-${route.authId}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <PublicCertificatePage
                authId={route.authId}
                onNavigateHome={() => navigateTo('/')}
                onSearchNewId={(newId) => navigateTo(`/${newId}`)}
                onNavigateAdminLogin={() => navigateTo('/admin/login')}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Show Main Footer only on Main site pages */}
      {route.mode === 'main' && (
        <FooterSection
          setActiveModal={setActiveModal}
          setCurrentPage={(p) => navigateTo(`/${p}`)}
        />
      )}

      {/* Interactive Modals on main site */}
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
