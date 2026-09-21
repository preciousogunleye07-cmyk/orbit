import React from 'react';
import { AdminAttendanceManager } from '../components/admin/AdminAttendanceManager';
import { ActiveModal } from '../types';

interface AttendancePageProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-neutral-950 text-neutral-100">
      <AdminAttendanceManager
        currentUser={{
          name: 'Student / Public Visitor',
          email: 'student@orbitspace.academy',
          role: 'Student (View-Only)',
        }}
      />
    </div>
  );
};
