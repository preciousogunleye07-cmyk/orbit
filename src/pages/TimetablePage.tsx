import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Download } from 'lucide-react';
import { TIMETABLE_DATA, DAYS_OF_WEEK, TimetableSlot } from '../data/timetableData';
import { ActiveModal } from '../types';
import { playSound } from '../utils/soundEffects';
import { generateTimetablePdf } from '../utils/timetablePdf';

interface TimetablePageProps {
  setActiveModal: (modal: ActiveModal) => void;
}

export const TimetablePage: React.FC<TimetablePageProps> = ({ setActiveModal }) => {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Group schedule by days for the clean table display
  const daysList = useMemo(() => {
    return DAYS_OF_WEEK.map(day => {
      const slots = TIMETABLE_DATA.filter(slot => {
        const matchesDay = slot.day === day;
        const matchesFilter = selectedDay === 'all' || selectedDay === day;
        const matchesSearch = searchQuery.trim() === '' || 
          slot.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
          slot.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          slot.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
          slot.time.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesDay && matchesFilter && matchesSearch;
      });

      return {
        day,
        slots
      };
    }).filter(group => group.slots.length > 0);
  }, [selectedDay, searchQuery]);

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
        slots: allFilteredSlots.length > 0 ? allFilteredSlots : TIMETABLE_DATA,
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

  return (
    <div className="min-h-screen bg-[#100e17] text-[#e5e2e1] py-12 px-4 sm:px-6 selection:bg-[#a855f7]/30 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">

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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8] hover:text-white"
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
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262137]">
                {daysList.map((group) => {
                  return group.slots.map((slot, index) => {
                    const isFirstInGroup = index === 0;

                    return (
                      <tr 
                        key={slot.id}
                        className="hover:bg-[#1f1b2e]/60 transition-colors"
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
                          {slot.course}
                        </td>

                        {/* Instructor Column */}
                        <td className="py-4 px-6 text-[#94a3b8]">
                          {slot.instructor}
                        </td>
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
                      className="p-3 rounded-lg bg-[#12101b] border border-[#262137] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[#c084fc]">{slot.time}</span>
                        <span className="text-[#94a3b8]">{slot.instructor}</span>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {slot.course}
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
          <div className="flex items-center gap-2">
            <span>Total Sessions: <strong className="text-white">{totalFilteredClasses}</strong></span>
            <span>•</span>
            <span>Venue: <strong className="text-white">Orbit Space Hub, Ilorin</strong></span>
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
    </div>
  );
};
