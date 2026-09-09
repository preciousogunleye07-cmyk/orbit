import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  RotateCcw, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  User,
  MapPin,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { TimetableSlot, DAYS_OF_WEEK } from '../../data/timetableData';
import { 
  getLocalTimetableSlots, 
  subscribeTimetable, 
  deleteTimetableSlot, 
  saveTimetableSlot,
  resetTimetableToDefault,
  generateSlotId 
} from '../../services/timetableService';
import { EditTimetableSlotModal } from './EditTimetableSlotModal';
import { playSound } from '../../utils/soundEffects';

interface AdminTimetableManagerProps {
  onOpenPublicTimetable: () => void;
}

export const AdminTimetableManager: React.FC<AdminTimetableManagerProps> = ({
  onOpenPublicTimetable
}) => {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [slotToEdit, setSlotToEdit] = useState<TimetableSlot | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [slotToDelete, setSlotToDelete] = useState<TimetableSlot | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    // Initial load
    setSlots(getLocalTimetableSlots());

    // Subscribe to Firestore / local sync
    const unsubscribe = subscribeTimetable((latestSlots) => {
      setSlots(latestSlots);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Group and filter
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchesDay = selectedDay === 'all' || slot.day === selectedDay;
      const matchesCategory = selectedCategory === 'all' || slot.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === '' ||
        slot.course.toLowerCase().includes(query) ||
        slot.instructor.toLowerCase().includes(query) ||
        slot.venue.toLowerCase().includes(query) ||
        slot.day.toLowerCase().includes(query) ||
        slot.time.toLowerCase().includes(query) ||
        (slot.badge && slot.badge.toLowerCase().includes(query));

      return matchesDay && matchesCategory && matchesSearch;
    });
  }, [slots, selectedDay, selectedCategory, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const instructorsSet = new Set(slots.map(s => s.instructor));
    const venuesSet = new Set(slots.map(s => s.venue));
    return {
      total: slots.length,
      instructors: instructorsSet.size,
      venues: venuesSet.size
    };
  }, [slots]);

  const handleCreateNew = () => {
    playSound('pulse');
    setSlotToEdit(null);
    setIsEditModalOpen(true);
  };

  const handleEditSlot = (slot: TimetableSlot) => {
    playSound('droplet');
    setSlotToEdit(slot);
    setIsEditModalOpen(true);
  };

  const handleDuplicateSlot = async (slot: TimetableSlot) => {
    try {
      playSound('pulse');
      const newId = generateSlotId(slot.day);
      const duplicate: TimetableSlot = {
        ...slot,
        id: newId,
        course: `${slot.course} (Copy)`,
        badge: slot.badge ? `${slot.badge} • Copy` : undefined
      };
      await saveTimetableSlot(duplicate);
      playSound('success');
      showToast(`Duplicated ${slot.course} slot.`);
    } catch (err: any) {
      console.error('Error duplicating slot:', err);
      showToast('Failed to duplicate slot.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!slotToDelete) return;
    try {
      playSound('trash');
      await deleteTimetableSlot(slotToDelete.id);
      showToast(`Deleted ${slotToDelete.course} from schedule.`);
      setSlotToDelete(null);
    } catch (err: any) {
      console.error('Error deleting slot:', err);
      showToast('Failed to delete slot.');
    }
  };

  const handleResetConfirm = async () => {
    try {
      playSound('trash');
      await resetTimetableToDefault();
      playSound('success');
      showToast('Restored default weekly timetable schedule.');
      setIsResetConfirmOpen(false);
    } catch (err: any) {
      console.error('Error resetting timetable:', err);
      showToast('Failed to reset timetable.');
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'security':
        return 'bg-rose-950/60 text-rose-300 border-rose-800/40';
      case 'development':
        return 'bg-sky-950/60 text-sky-300 border-sky-800/40';
      case 'engineering':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/40';
      case 'data':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40';
      case 'creative':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/40';
      case 'automation':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40';
      default:
        return 'bg-[#201b30] text-[#c4c7c8] border-[#382f54]';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#1e1730] border border-[#a855f7]/60 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#181524] p-5 rounded-2xl border border-[#332d47] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#94a3b8]">Total Classes</span>
            <div className="w-7 h-7 rounded-lg bg-[#281f3d] flex items-center justify-center text-[#c084fc]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{stats.total}</p>
          <p className="text-[11px] text-[#94a3b8] mt-1">Across Mon–Sat schedules</p>
        </div>

        <div className="bg-[#181524] p-5 rounded-2xl border border-[#332d47] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#94a3b8]">Instructors Assigned</span>
            <div className="w-7 h-7 rounded-lg bg-[#281f3d] flex items-center justify-center text-[#c084fc]">
              <User className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{stats.instructors}</p>
          <p className="text-[11px] text-[#94a3b8] mt-1">Leading active tracks</p>
        </div>

        <div className="bg-[#181524] p-5 rounded-2xl border border-[#332d47] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#94a3b8]">Hub Labs in Use</span>
            <div className="w-7 h-7 rounded-lg bg-[#281f3d] flex items-center justify-center text-[#c084fc]">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{stats.venues}</p>
          <p className="text-[11px] text-[#94a3b8] mt-1">Hardware & software suites</p>
        </div>

        <div className="bg-[#181524] p-5 rounded-2xl border border-[#332d47] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#94a3b8]">Sync & Storage</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-950/60 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">Cloud Firestore</span>
          </div>
          <p className="text-[11px] text-[#94a3b8] mt-1">Real-time student reflection</p>
        </div>

      </div>

      {/* Control Bar: Actions & Filters */}
      <div className="bg-[#181524] rounded-2xl p-5 border border-[#332d47] shadow-xl space-y-4">
        
        {/* Top Action Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#a855f7]" />
              <span>Timetable Schedules</span>
            </h2>
            <p className="text-xs text-[#94a3b8]">
              Add new sessions, edit lecture hours, adjust lab venues, or reassign instructors.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            
            <button
              onClick={handleCreateNew}
              className="btn-purple px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
              id="btn-admin-add-slot"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class Slot</span>
            </button>

            <button
              onClick={() => {
                playSound('droplet');
                onOpenPublicTimetable();
              }}
              className="px-3.5 py-2 rounded-xl bg-[#1d172e] hover:bg-[#281f3e] border border-[#3e345a] text-xs text-[#c084fc] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Preview the student timetable page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Student View</span>
            </button>

            <button
              onClick={() => {
                playSound('pulse');
                setIsResetConfirmOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-[#1d172e] hover:bg-[#2c1d2e] border border-[#3e345a] hover:border-rose-800/50 text-xs text-[#94a3b8] hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset schedule to standard template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Defaults</span>
            </button>

          </div>
        </div>

        {/* Filter Bar: Day Tabs + Track Tabs + Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-[#2a243c]">
          
          {/* Day Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => {
                playSound('droplet');
                setSelectedDay('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedDay === 'all'
                  ? 'bg-[#a855f7] text-white shadow-md'
                  : 'bg-[#151221] text-[#94a3b8] hover:text-white border border-[#2e2642]'
              }`}
            >
              All Days ({slots.length})
            </button>

            {DAYS_OF_WEEK.map((d) => {
              const dayCount = slots.filter(s => s.day === d).length;
              const isSelected = selectedDay === d;
              return (
                <button
                  key={d}
                  onClick={() => {
                    playSound('droplet');
                    setSelectedDay(d);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#a855f7] text-white font-semibold shadow-md'
                      : 'bg-[#151221] text-[#94a3b8] hover:text-white border border-[#2e2642]'
                  }`}
                >
                  <span>{d.substring(0, 3)}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/30 text-white' : 'bg-[#231b34] text-[#8e8a9f]'}`}>
                    {dayCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course, instructor, lab..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-[#151221] border border-[#2e2642] focus:border-[#a855f7] focus:outline-none text-xs text-white placeholder:text-[#64748b]"
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

      </div>

      {/* Slots Table & List */}
      <div className="bg-[#181524] rounded-2xl border border-[#332d47] overflow-hidden shadow-xl">
        
        <div className="p-4 bg-[#12101b] border-b border-[#2e2642] flex items-center justify-between text-xs text-[#94a3b8]">
          <span>
            Showing <strong className="text-white font-semibold">{filteredSlots.length}</strong> scheduled class slots
            {selectedDay !== 'all' && <> on <strong className="text-[#a855f7]">{selectedDay}</strong></>}
          </span>

          {(selectedDay !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDay('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-[#a855f7] hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredSlots.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Calendar className="w-10 h-10 text-[#6b5f8a] mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-semibold text-white mb-1">No matching classes</h3>
            <p className="text-xs text-[#94a3b8] max-w-sm mx-auto mb-4">
              There are no timetable slots matching your filter. You can add a new class or adjust your search.
            </p>
            <button
              onClick={handleCreateNew}
              className="btn-purple px-4 py-2 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class Slot</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#141120] text-[#94a3b8] border-b border-[#2e2642] font-mono uppercase text-[11px]">
                  <th className="py-3.5 px-5 font-semibold">Day & Time</th>
                  <th className="py-3.5 px-5 font-semibold">Course & Track</th>
                  <th className="py-3.5 px-5 font-semibold">Instructor</th>
                  <th className="py-3.5 px-5 font-semibold">Venue / Room</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262038]">
                {filteredSlots.map((slot) => (
                  <tr 
                    key={slot.id}
                    className="hover:bg-[#1e182f]/60 transition-colors group"
                  >
                    {/* Day & Time */}
                    <td className="py-4 px-5 align-top whitespace-nowrap">
                      <div className="font-semibold text-white text-xs mb-0.5">
                        {slot.day}
                      </div>
                      <div className="text-[#c084fc] font-mono text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#a855f7]" />
                        <span>{slot.time}</span>
                      </div>
                    </td>

                    {/* Course & Track */}
                    <td className="py-4 px-5 align-top">
                      <div className="font-semibold text-white text-xs flex items-center gap-2 flex-wrap">
                        <span>{slot.course}</span>
                        {slot.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#271f3b] border border-[#3e325c] text-[#d8b4fe]">
                            {slot.badge}
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md border capitalize font-medium ${getCategoryBadgeClass(slot.category)}`}>
                          {slot.category}
                        </span>
                      </div>
                    </td>

                    {/* Instructor */}
                    <td className="py-4 px-5 align-top">
                      <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#2a2044] border border-[#44356e] flex items-center justify-center text-[10px] text-[#c084fc] font-bold">
                          {slot.instructor.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{slot.instructor}</span>
                      </div>
                      {slot.instructorTitle && (
                        <p className="text-[11px] text-[#94a3b8] mt-0.5 max-w-[200px] truncate">
                          {slot.instructorTitle}
                        </p>
                      )}
                    </td>

                    {/* Venue */}
                    <td className="py-4 px-5 align-top text-[#c4c7c8]">
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-[#a855f7] shrink-0" />
                        <span>{slot.venue}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditSlot(slot)}
                          className="p-1.5 rounded-lg bg-[#231b36] hover:bg-[#31254d] border border-[#3e315e] text-[#c084fc] hover:text-white transition-all cursor-pointer"
                          title="Edit this class schedule slot"
                          id={`btn-edit-slot-${slot.id}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate Button */}
                        <button
                          onClick={() => handleDuplicateSlot(slot)}
                          className="p-1.5 rounded-lg bg-[#231b36] hover:bg-[#31254d] border border-[#3e315e] text-[#94a3b8] hover:text-white transition-all cursor-pointer"
                          title="Duplicate this class slot"
                          id={`btn-duplicate-slot-${slot.id}`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            playSound('pulse');
                            setSlotToDelete(slot);
                          }}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 hover:text-white transition-all cursor-pointer"
                          title="Delete this class slot"
                          id={`btn-delete-slot-${slot.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Edit or Create Slot Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditTimetableSlotModal
            slot={slotToEdit}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSaved={(savedSlot) => {
              showToast(slotToEdit ? `Updated schedule for ${savedSlot.course}.` : `Created ${savedSlot.course} class slot.`);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {slotToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161224] border border-rose-800/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-800/50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Class Slot?</h3>
                  <p className="text-xs text-[#94a3b8]">This will remove the lecture from the active schedule.</p>
                </div>
              </div>

              <div className="p-3 bg-[#110e1b] rounded-xl border border-[#2b2340] text-xs space-y-1">
                <div className="font-semibold text-white">{slotToDelete.course}</div>
                <div className="text-[#94a3b8]">{slotToDelete.day} • {slotToDelete.time}</div>
                <div className="text-[#a855f7]">Instructor: {slotToDelete.instructor}</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSlotToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-[#1e192c] hover:bg-[#28213a] text-xs text-[#c4c7c8] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Delete Slot
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161224] border border-amber-800/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-400">
                <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-800/50 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reset to Default Schedule?</h3>
                  <p className="text-xs text-[#94a3b8]">Restores Orbit Space's official standard 20-slot timetable.</p>
                </div>
              </div>

              <p className="text-xs text-[#c4c7c8] leading-relaxed">
                All customized slots will be replaced with the official template across Cybersecurity, Product Engineering, Web Development, Creative Media, and Data Analysis.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1e192c] hover:bg-[#28213a] text-xs text-[#c4c7c8] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetConfirm}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
