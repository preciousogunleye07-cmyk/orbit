import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { FooterSection } from './components/FooterSection';
import { initSoundSystem, playSound } from './utils/soundEffects';

import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { SIWESPage } from './pages/SIWESPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { QuizPage } from './pages/QuizPage';
import { TimetablePage } from './pages/TimetablePage';

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
import { 
  isAdminAuthenticated, 
  SECRET_ADMIN_PREFIX, 
  SECRET_ADMIN_LOGIN_PATH, 
  SECRET_ADMIN_DASHBOARD_PATH 
} from './services/certificateService';

const MAIN_PAGES = ['home', 'courses', 'timetable', 'siwes', 'workspace', 'quiz', 'about', 'contact'];

type RouteState = 
  | { mode: 'main'; page: string }
  | { mode: 'admin-login' }
  | { mode: 'admin-dashboard'; subTab?: 'overview' | 'directory' | 'create' }
  | { mode: 'public-certificate'; authId: string };

function getCurrentLocationPath(): string {
  if (typeof window === 'undefined') return '/';

  // Check if redirected from 404.html via ?p=... or ?page=...
  const searchParams = new URLSearchParams(window.location.search);
  const pParam = searchParams.get('p') || searchParams.get('page');
  if (pParam) {
    try {
      const cleanTarget = pParam.startsWith('/') ? pParam : `/${pParam}`;
      window.history.replaceState(null, '', cleanTarget);
      return cleanTarget;
    } catch {}
    return pParam;
  }

  // Check hash route fallback (e.g. #/timetable or #timetable)
  if (window.location.hash) {
    const hashVal = window.location.hash.replace(/^#[!/]+/, '');
    if (hashVal) {
      return `/${hashVal}`;
    }
  }

  return window.location.pathname;
}

function parsePathToRoute(path: string): RouteState {
  // Strip query strings and hashes
  const withoutQuery = path.split('?')[0].split('#')[0];
  // Strip leading and trailing slashes
  const cleanPath = withoutQuery.replace(/^\/+|\/+$/g, '').trim();
  const lowerPath = cleanPath.toLowerCase();

  if (!lowerPath || lowerPath === 'index.html') {
    return { mode: 'main', page: 'home' };
  }

  // Secret Admin obfuscated routes (e.g. /portal-auth-x98k72/login or /portal-auth-x98k72/dashboard)
  if (lowerPath === `${SECRET_ADMIN_PREFIX}/login` || lowerPath === `${SECRET_ADMIN_PREFIX}`) {
    return { mode: 'admin-login' };
  }

  if (lowerPath === `${SECRET_ADMIN_PREFIX}/dashboard` || lowerPath === `${SECRET_ADMIN_PREFIX}/admin`) {
    return { mode: 'admin-dashboard', subTab: 'overview' };
  }

  if (lowerPath === `${SECRET_ADMIN_PREFIX}/certificates`) {
    return { mode: 'admin-dashboard', subTab: 'directory' };
  }

  if (lowerPath === `${SECRET_ADMIN_PREFIX}/certificates/new`) {
    return { mode: 'admin-dashboard', subTab: 'create' };
  }

  // Note: /admin, /admin/login, /admin/dashboard are deliberately NOT mapped to admin to prevent public discovery and bot scanning. They return to the home view.

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

  // Specific certificate format pattern (ORB-XXXXXX)
  if (lowerPath.startsWith('orb-') || lowerPath.startsWith('cert-')) {
    return { mode: 'public-certificate', authId: cleanPath.toUpperCase() };
  }

  // Fallback to home page for any unknown routes
  return { mode: 'main', page: 'home' };
}

const PAGE_TITLES: Record<string, string> = {
  home: 'Orbit Space | Practical Tech Academy & Workspace in Ilorin',
  courses: 'Courses & Programs | Orbit Space Academia',
  timetable: 'Weekly Class Timetable | Orbit Space Academia Ilorin',
  siwes: 'SIWES Placement & Industrial Training | Orbit Space Academia',
  workspace: 'Coworking Space & Passes | Orbit Space Academia',
  quiz: 'Tech Career Advisor Quiz | Orbit Space Academia',
  about: 'About Orbit Space | Tech Hub in Ilorin',
  contact: 'Contact Us & Location | Orbit Space Academia'
};

export default function App() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [route, setRoute] = useState<RouteState>(() => parsePathToRoute(getCurrentLocationPath()));

  useEffect(() => {
    initSoundSystem();

    const handleLocationChange = () => {
      setRoute(parsePathToRoute(getCurrentLocationPath()));
      playSound('page');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Update document title for initial load
    const current = parsePathToRoute(getCurrentLocationPath());
    if (current.mode === 'main' && PAGE_TITLES[current.page]) {
      document.title = PAGE_TITLES[current.page];
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string, pushHistory = true) => {
    const newRoute = parsePathToRoute(path);
    setRoute(newRoute);
    playSound('page');

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
              {route.page === 'timetable' && (
                <TimetablePage setActiveModal={setActiveModal} />
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
                onSuccess={() => navigateTo(SECRET_ADMIN_DASHBOARD_PATH)}
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
                  onLogout={() => navigateTo(SECRET_ADMIN_LOGIN_PATH)}
                  onNavigateHome={() => navigateTo('/')}
                  onOpenPublicPage={(id) => navigateTo(`/${id}`)}
                />
              ) : (
                <AdminLoginPage
                  onSuccess={() => navigateTo(SECRET_ADMIN_DASHBOARD_PATH)}
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
