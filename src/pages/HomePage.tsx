import React from 'react';
import { motion, Variants } from 'motion/react';
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

const sectionVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const HomePage: React.FC<HomePageProps> = ({ setActiveModal, setCurrentPage }) => {
  return (
    <div className="space-y-12 overflow-hidden">
      {/* Hero Banner */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={sectionVariant}
      >
        <HeroSection
          setActiveModal={setActiveModal}
          onExploreCourses={() => setCurrentPage('courses')}
        />
      </motion.div>

      {/* Featured Courses Teaser */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={sectionVariant}
      >
        <CoursesSection setActiveModal={setActiveModal} />
      </motion.div>

      {/* Career Advisor Teaser */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={sectionVariant}
      >
        <CareerAdvisorQuiz setActiveModal={setActiveModal} />
      </motion.div>

      {/* SIWES Placement Teaser */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={sectionVariant}
      >
        <SIWESSection setActiveModal={setActiveModal} />
      </motion.div>

      {/* Workspace Pass Teaser */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={sectionVariant}
      >
        <WorkspaceSection setActiveModal={setActiveModal} />
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={sectionVariant}
      >
        <FAQSection />
      </motion.div>
    </div>
  );
};
