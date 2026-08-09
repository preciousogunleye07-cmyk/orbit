import React from 'react';
import { CareerAdvisorQuiz } from '../components/CareerAdvisorQuiz';
import { ActiveModal } from '../types';

interface QuizPageProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ setActiveModal }) => {
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="label-caps text-[#630fd4] text-xs px-3 py-1 bg-[#ede0ff] rounded-full border border-[#7c3aed]/30 mb-3 inline-block">
          Interactive Career Guidance
        </span>
        <h1 className="display-lg text-[#1d1a24] mb-3">
          Discover Your Ideal Tech Track
        </h1>
        <p className="body-md text-[#4a4455]">
          Answer 4 simple questions about your goals and interests to receive a personalized course recommendation tailored for you at Orbit Space Ilorin.
        </p>
      </div>

      <CareerAdvisorQuiz setActiveModal={setActiveModal} />
    </div>
  );
};
