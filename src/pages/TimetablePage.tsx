import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowRight, Download, Plus, Edit3, Shield, CheckCircle2 } from 'lucide-react';
import { DAYS_OF_WEEK, TimetableSlot } from '../data/timetableData';
import { 
  getLocalTimetableSlots, 
  subscribeTimetable, 
  syncTimetableFromFirestore 
} from '../services/timetableService';
import { getAdminSession, AdminUser } from '../services/certificateService';
import { EditTimetableSlotModal } from '../components/admin/EditTimetableSlotModal';
import { ActiveModal } from '../types';
import { playSound } from '../utils/soundEffects';
import { generateTimetablePdf } from '../utils/timetablePdf';
import { AnimatePresence, motion } from 'motion/react';

interface TimetablePageProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const TimetablePage: React.FC<TimetablePageProps> = ({ setActiveModal }) => {
  const [slots, setSlots] = useState<TimetableSlot[]>(() => getLocalTimetableSlots());
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Modal states for admin editing
  const [slotToEdit, setSlotToEdit] = useState<TimetableSlot | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    // Check admin session
    setAdminUser(getAdminSession());

    // Subscribe to real-time timetable updates
    const unsubscribe = subscribeTimetable((latest) => {
      setSlots(latest);
    });

    // Cloud sync check
    syncTimetableFromFirestore().then((latest) => {
      if (latest && latest.length > 0) {
        setSlots(latest);
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Group schedule by days for the clean table display
  const daysList = useMemo(() => {
    return DAYS_OF_WEEK.map(day => {
      const daySlots = slots.filter(slot => {
        const matchesDay = slot.day === day;
        const matchesFilter = selectedDay === 'all' || selectedDay === day;
        const matchesSearch = searchQuery.trim() === '' || 
          slot.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
          slot.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          slot.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
          slot.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
          slot.time.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (slot.badge && slot.badge.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesDay && matchesFilter && matchesSearch;
      });

      return {
        day,
        slots: daySlots
      };
    }).filter(group => group.slots.length > 0);
  }, [slots, selectedDay, searchQuery]);

  // Flatten currently filtered slots
  const allFilteredSlots = useMemo(() => {
    return daysList.flatMap(group => group.slots);
  }, [daysList]);

  const totalFilteredClasses = useMemo(() => {
    return allFilteredSlots.length;
  }, [allFilteredSlots]);

  const handleDownloadPdf = () => {
    try {
      setIsDownloadingPdf(true);
      playSound('chime');
      
      generateTimetablePdf({
        slots: allFilteredSlots.length > 0 ? allFilteredSlots : slots,
        filterDay: selectedDay,
        searchQuery: searchQuery
      });

      setTimeout(() => {
        setIsDownloadingPdf(false);
      }, 1200);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setIsDownloadingPdf(false);
    }
  };

  const handleOpenEdit = (slot: TimetableSlot) => {
    playSound('droplet');
    setSlotToEdit(slot);
    setIsEditModalOpen(true);
  };

  const handleAddNewSlot = () => {
    playSound('pulse');
    setSlotToEdit(null);
    setIsEditModalOpen(true);
  };

  const navigateToAdminPortal = () => {
    playSound('droplet');
    window.history.pushState({}, '', '/admin');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-[#100e17] text-[#e5e2e1] py-12 px-4 sm:px-6 selection:bg-[#a855f7]/30 selection:text-white relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#1e1730] border border-emerald-500/60 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* Admin Quick Bar when Admin Session is active */}
        {adminUser && (
          <div className="bg-[#1c162e] border border-[#a855f7]/40 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-[#c084fc] shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Admin Edit Mode Active</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.2 rounded font-mono">
                    {adminUser.role}
                  </span>
                </div>
                <p className="text-[11px] text-[#94a3b8]">
                  Click the edit pencil on any lecture row, or add new class slots.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleAddNewSlot}
                className="btn-purple px-3 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 shadow-md cursor-pointer"
                id="btn-admin-add-slot-public"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Slot</span>
              </button>

              <button
                onClick={navigateToAdminPortal}
                className="px-3 py-1.5 rounded-xl bg-[#140f23] hover:bg-[#251b3d] border border-[#3f325d] text-xs text-[#c084fc] hover:text-white transition-colors cursor-pointer"
              >
                Manage in Admin Portal
              </button>
            </div>
          </div>
        )}

        {/* Simple Clean Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Weekly Class Timetable
          </h1>
          
          <p className="text-sm text-[#94a3b8] max-w-lg mx-auto font-light">
            Lecture and practical lab hours across all active tech tracks.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          
          {/* Day Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                playSound('toggle');
                setSelectedDay('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedDay === 'all'
                  ? 'bg-[#a855f7] text-white font-semibold'
                  : 'bg-[#181524] text-[#94a3b8] hover:text-white border border-[#332d47]'
              }`}
            >
              All Days
            </button>

            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => {
                  playSound('toggle');
                  setSelectedDay(day);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  selectedDay === day
                    ? 'bg-[#a855f7] text-white font-semibold'
                    : 'bg-[#181524] text-[#94a3b8] hover:text-white border border-[#332d47]'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course or instructor..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#181524] border border-[#332d47] focus:border-[#a855f7] focus:outline-none text-xs text-white placeholder:text-[#64748b]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8] hover:text-white cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

        </div>

        {/* Clean Timetable Structure */}
        <div className="bg-[#181524] rounded-xl border border-[#332d47] overflow-hidden shadow-xl">
          
          {/* Desktop & Tablet Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#12101b] text-[#94a3b8] border-b border-[#332d47] text-xs font-mono uppercase">
                  <th className="py-3.5 px-6 font-semibold w-1/4">Day</th>
                  <th className="py-3.5 px-6 font-semibold w-1/4">Time</th>
                  <th className="py-3.5 px-6 font-semibold w-1/3">Course</th>
                  <th className="py-3.5 px-6 font-semibold">Instructor</th>
                  {adminUser && <th className="py-3.5 px-4 font-semibold text-right">Edit</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262137]">
                {daysList.map((group) => {
                  return group.slots.map((slot, index) => {
                    const isFirstInGroup = index === 0;

                    return (
                      <tr 
                        key={slot.id}
                        className="hover:bg-[#1f1b2e]/60 transition-colors group"
                      >
                        {/* Day Column (Spans group or clearly shows on first row) */}
                        <td className={`py-4 px-6 align-top ${isFirstInGroup ? 'font-semibold text-white' : 'text-transparent sm:text-inherit sm:opacity-0'}`}>
                          {isFirstInGroup && (
                            <span className="inline-block font-semibold text-white">
                              {group.day}
                            </span>
                          )}
                        </td>

                        {/* Time Column */}
                        <td className="py-4 px-6 text-[#c084fc] font-mono text-xs whitespace-nowrap">
                          {slot.time}
                        </td>

                        {/* Course Column */}
                        <td className="py-4 px-6 text-white font-medium">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{slot.course}</span>
                            {slot.badge && (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#261f38] text-[#d8b4fe] border border-[#3b3054]">
                                {slot.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#94a3b8] font-normal mt-0.5">
                            {slot.venue}
                          </div>
                        </td>

                        {/* Instructor Column */}
                        <td className="py-4 px-6 text-[#94a3b8]">
                          <span className="text-white font-medium block">{slot.instructor}</span>
                          {slot.instructorTitle && (
                            <span className="text-[11px] text-[#94a3b8] block">{slot.instructorTitle}</span>
                          )}
                        </td>

                        {/* Admin Inline Edit Button */}
                        {adminUser && (
                          <td className="py-4 px-4 text-right align-top whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEdit(slot)}
                              className="p-1.5 rounded-lg bg-[#271f3a] hover:bg-[#a855f7] text-[#c084fc] hover:text-white transition-all cursor-pointer shadow-sm"
                              title={`Edit ${slot.course} slot`}
                              id={`btn-public-edit-${slot.id}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Clean List View */}
          <div className="sm:hidden divide-y divide-[#262137]">
            {daysList.map((group) => (
              <div key={group.day} className="p-4 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#a855f7] bg-[#12101b] px-2.5 py-1 rounded inline-block">
                  {group.day}
                </h3>
                
                <div className="space-y-2.5">
                  {group.slots.map((slot) => (
                    <div 
                      key={slot.id}
                      className="p-3 rounded-lg bg-[#12101b] border border-[#262137] space-y-1.5 relative group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[#c084fc]">{slot.time}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#94a3b8]">{slot.instructor}</span>
                          {adminUser && (
                            <button
                              onClick={() => handleOpenEdit(slot)}
                              className="p-1 rounded bg-[#241a37] text-[#c084fc] hover:text-white cursor-pointer"
                              title="Edit slot"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-white flex items-center gap-1.5 flex-wrap">
                        <span>{slot.course}</span>
                        {slot.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#271f3b] text-[#d8b4fe]">
                            {slot.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#94a3b8]">
                        Venue: {slot.venue}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Empty state if nothing matches */}
          {daysList.length === 0 && (
            <div className="text-center py-12 px-4 text-[#94a3b8]">
              <p className="text-sm font-medium text-white mb-1">No classes found</p>
              <p className="text-xs">Try clearing your search query or selecting "All Days".</p>
            </div>
          )}

        </div>

        {/* Simple Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs text-[#94a3b8] border-t border-[#262137]">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Total Sessions: <strong className="text-white">{totalFilteredClasses}</strong></span>
            <span>•</span>
            <span>Venue: <strong className="text-white">Orbit Space Hub, Ilorin</strong></span>
            <span>•</span>
            <button
              onClick={navigateToAdminPortal}
              className="text-[#a855f7] hover:underline cursor-pointer"
            >
              Admin Portal
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-end">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              id="btn-download-pdf-bottom"
              className="px-3.5 py-2 rounded-lg bg-[#181524] hover:bg-[#231e34] border border-[#a855f7]/50 text-white flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              title="Download Timetable PDF"
            >
              {isDownloadingPdf ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin"></span>
                  <span>Exporting PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#a855f7]" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                playSound('sparkle');
                setActiveModal({ type: 'enroll' });
              }}
              id="btn-enroll-course"
              className="btn-purple px-4 py-2 rounded-lg font-semibold text-white flex items-center gap-1.5 shadow-md"
            >
              <span>Enroll in a Course</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Edit or Create Slot Modal for Admin */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditTimetableSlotModal
            slot={slotToEdit}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSaved={(saved) => {
              showToast(slotToEdit ? `Updated schedule for ${saved.course}.` : `Added ${saved.course} to schedule.`);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

