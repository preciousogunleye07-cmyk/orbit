import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { CoursesSection } from '../components/CoursesSection';
import { SIWESSection } from '../components/SIWESSection';
import { WorkspaceSection } from '../components/WorkspaceSection';
import { CareerAdvisorQuiz } from '../components/CareerAdvisorQuiz';
import { FAQSection } from '../components/FAQSection';
import { ActiveModal } from '../types';

interface HomePageProps {
  setActiveModal: (modal: ActiveModal) => void;
  setCurrentPage: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActiveModal, setCurrentPage }) => {
  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <HeroSection
        setActiveModal={setActiveModal}
        onExploreCourses={() => setCurrentPage('courses')}
      />

      {/* Featured Courses Teaser */}
      <CoursesSection setActiveModal={setActiveModal} />

      {/* Career Advisor Teaser */}
      <CareerAdvisorQuiz setActiveModal={setActiveModal} />

      {/* SIWES Placement Teaser */}
      <SIWESSection setActiveModal={setActiveModal} />

      {/* Workspace Pass Teaser */}
      <WorkspaceSection setActiveModal={setActiveModal} />

      {/* FAQ */}
      <FAQSection />
    </div>
  );
};
