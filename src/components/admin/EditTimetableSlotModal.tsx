import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Calendar, 
  Clock, 
  BookOpen, 
  User, 
  MapPin, 
  Tag, 
  Sparkles, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { TimetableSlot, DAYS_OF_WEEK, INSTRUCTORS } from '../../data/timetableData';
import { saveTimetableSlot, generateSlotId } from '../../services/timetableService';
import { playSound } from '../../utils/soundEffects';

interface EditTimetableSlotModalProps {
  slot: TimetableSlot | null; // null if creating a new slot
  isOpen: boolean;
  onClose: () => void;
  onSaved: (slot: TimetableSlot) => void;
}

const COURSE_SUGGESTIONS = [
  { course: 'Cyber Security', category: 'security', defaultVenue: 'Cyber Defense Lab (Lab 1)', badge: 'Core Track' },
  { course: 'Front End Development', category: 'development', defaultVenue: 'Code Lab Alpha (Lab 1)', badge: 'React & Modern Web' },
  { course: 'Back End Development', category: 'development', defaultVenue: 'Code Lab Alpha (Lab 2)', badge: 'Database & APIs' },
  { course: 'Product Engineering', category: 'engineering', defaultVenue: 'Engineering Suite (Lab 1)', badge: 'Hands-on Sprint' },
  { course: 'UI/UX Design', category: 'development', defaultVenue: 'Design Studio Alpha', badge: 'Figma & Design Systems' },
  { course: 'Video Editing', category: 'creative', defaultVenue: 'Creative Media Studio', badge: 'Post-Production' },
  { course: 'Content Creation', category: 'creative', defaultVenue: 'Media Suite', badge: 'Creator Lab' },
  { course: 'Statistics', category: 'data', defaultVenue: 'Data Analytics Suite (Lab 2)', badge: 'Practical Analytics' },
  { course: 'AI & Automation', category: 'automation', defaultVenue: 'AI Research Suite', badge: 'Agent Orchestration' }
];

const VENUE_SUGGESTIONS = [
  'Cyber Defense Lab (Lab 1)',
  'Cyber Defense Lab (Lab 2)',
  'Code Lab Alpha (Lab 1)',
  'Code Lab Alpha (Lab 2)',
  'Engineering Suite (Lab 1)',
  'Engineering Suite (Lab 2)',
  'Creative Media Studio',
  'Data Analytics Suite (Lab 2)',
  'Media Suite',
  'Main Lecture Hall'
];

export const EditTimetableSlotModal: React.FC<EditTimetableSlotModalProps> = ({
  slot,
  isOpen,
  onClose,
  onSaved
}) => {
  const isEditing = !!slot;

  const [day, setDay] = useState<TimetableSlot['day']>('Monday');
  const [time, setTime] = useState<string>('12:00–2:00 PM');
  const [startHour, setStartHour] = useState<number>(12);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [endHour, setEndHour] = useState<number>(14);
  const [endMinute, setEndMinute] = useState<number>(0);
  const [course, setCourse] = useState<string>('');
  const [instructor, setInstructor] = useState<string>('');
  const [instructorTitle, setInstructorTitle] = useState<string>('');
  const [venue, setVenue] = useState<string>('');
  const [category, setCategory] = useState<TimetableSlot['category']>('development');
  const [badge, setBadge] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (slot) {
      setDay(slot.day);
      setTime(slot.time);
      setStartHour(slot.startHour ?? 12);
      setStartMinute(slot.startMinute ?? 0);
      setEndHour(slot.endHour ?? 14);
      setEndMinute(slot.endMinute ?? 0);
      setCourse(slot.course);
      setInstructor(slot.instructor);
      setInstructorTitle(slot.instructorTitle || '');
      setVenue(slot.venue);
      setCategory(slot.category);
      setBadge(slot.badge || '');
    } else {
      // Default blank values for new slot
      setDay('Monday');
      setTime('12:00–2:00 PM');
      setStartHour(12);
      setStartMinute(0);
      setEndHour(14);
      setEndMinute(0);
      setCourse('');
      setInstructor('');
      setInstructorTitle('');
      setVenue('Cyber Defense Lab (Lab 1)');
      setCategory('development');
      setBadge('Core Track');
    }
    setError('');
  }, [slot, isOpen]);

  if (!isOpen) return null;

  const handleSelectCourse = (suggestion: typeof COURSE_SUGGESTIONS[0]) => {
    playSound('droplet');
    setCourse(suggestion.course);
    setCategory(suggestion.category as TimetableSlot['category']);
    if (!venue) setVenue(suggestion.defaultVenue);
    if (!badge) setBadge(suggestion.badge);
  };

  const handleSelectInstructor = (inst: typeof INSTRUCTORS[0]) => {
    playSound('droplet');
    setInstructor(inst.name);
    setInstructorTitle(inst.role);
  };

  const handlePresetTime = (presetTime: string, sH: number, sM: number, eH: number, eM: number) => {
    playSound('droplet');
    setTime(presetTime);
    setStartHour(sH);
    setStartMinute(sM);
    setEndHour(eH);
    setEndMinute(eM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!course.trim()) {
      setError('Please provide a course title.');
      return;
    }
    if (!instructor.trim()) {
      setError('Please provide an instructor name.');
      return;
    }
    if (!time.trim()) {
      setError('Please provide a time slot string.');
      return;
    }
    if (!venue.trim()) {
      setError('Please specify a lab or room venue.');
      return;
    }

    try {
      setIsSaving(true);
      playSound('pulse');

      const slotId = slot?.id || generateSlotId(day);
      const slotData: TimetableSlot = {
        id: slotId,
        day,
        dayIndex: DAYS_OF_WEEK.indexOf(day) + 1,
        time: time.trim(),
        startHour: Number(startHour),
        startMinute: Number(startMinute),
        endHour: Number(endHour),
        endMinute: Number(endMinute),
        course: course.trim(),
        instructor: instructor.trim(),
        instructorTitle: instructorTitle.trim() || undefined,
        venue: venue.trim(),
        category,
        badge: badge.trim() || undefined
      };

      const result = await saveTimetableSlot(slotData);
      playSound('success');
      onSaved(result.slot);
      onClose();
    } catch (err: any) {
      console.error('Error saving timetable slot:', err);
      setError(err?.message || 'Failed to save timetable slot. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#151221] border border-[#332d47] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 relative"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#2e2642] flex items-center justify-between bg-[#191528]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#281f3d] border border-[#40335e] flex items-center justify-center text-[#c084fc]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isEditing ? 'Edit Class Timetable Slot' : 'Add New Class Slot'}
              </h2>
              <p className="text-xs text-[#94a3b8]">
                {isEditing
                  ? `Update schedule details for ${slot?.course} (${slot?.day})`
                  : 'Assign instructor, time, lab venue, and track details'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('release');
              onClose();
            }}
            className="p-2 text-[#94a3b8] hover:text-white hover:bg-[#281f3d] rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* Day & Track Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Day of Week */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#c4c7c8] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#a855f7]" />
                <span>Day of Week *</span>
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as TimetableSlot['day'])}
                className="w-full px-3.5 py-2 rounded-xl bg-[#1d172e] border border-[#382f54] text-xs text-white focus:border-[#a855f7] focus:outline-none"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Track Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#c4c7c8] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#a855f7]" />
                <span>Track Category *</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TimetableSlot['category'])}
                className="w-full px-3.5 py-2 rounded-xl bg-[#1d172e] border border-[#382f54] text-xs text-white focus:border-[#a855f7] focus:outline-none"
              >
                <option value="security">Cybersecurity</option>
                <option value="development">Software Development / UI</option>
                <option value="engineering">Product Engineering</option>
                <option value="data">Data Analysis & Stats</option>
                <option value="creative">Creative Media & Video</option>
                <option value="automation">AI & Automation</option>
              </select>
            </div>

          </div>

          {/* Course Title & Suggestions */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c4c7c8] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#a855f7]" />
                <span>Course / Class Title *</span>
              </span>
              <span className="text-[10px] text-[#94a3b8]">Click a preset or type custom</span>
            </label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. Cyber Security, Front End Development"
              className="w-full px-3.5 py-2 rounded-xl bg-[#1d172e] border border-[#382f54] text-xs text-white focus:border-[#a855f7] focus:outline-none"
            />
            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COURSE_SUGGESTIONS.map((item) => (
                <button
                  type="button"
                  key={item.course}
                  onClick={() => handleSelectCourse(item)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                    course === item.course
                      ? 'bg-[#a855f7]/30 border-[#a855f7] text-white'
                      : 'bg-[#181326] border-[#31284a] text-[#a19cb5] hover:text-white hover:border-[#4b3c72]'
                  }`}
                >
                  {item.course}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot & Quick Time Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c4c7c8] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#a855f7]" />
                <span>Time Slot Display *</span>
              </span>
              <span className="text-[10px] text-[#94a3b8]">Common lecture hours</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 11:00 AM–1:00 PM, 2:00–4:00 PM"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1d172e] border border-[#382f54] text-xs text-white font-mono focus:border-[#a855f7] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePresetTime('11:00 AM–1:00 PM', 11, 0, 13, 0)}
                  className="flex-1 text-[10px] py-2 px-2 bg-[#1d172e] hover:bg-[#271f3e] border border-[#382f54] text-[#c084fc] rounded-xl font-mono text-center cursor-pointer transition-colors"
                >
                  11AM–1PM
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetTime('12:00–2:00 PM', 12, 0, 14, 0)}
                  className="flex-1 text-[10px] py-2 px-2 bg-[#1d172e] hover:bg-[#271f3e] border border-[#382f54] text-[#c084fc] rounded-xl font-mono text-center cursor-pointer transition-colors"
                >
                  12–2PM
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetTime('2:00–4:00 PM', 14, 0, 16, 0)}
                  className="flex-1 text-[10px] py-2 px-2 bg-[#1d172e] hover:bg-[#271f3e] border border-[#382f54] text-[#c084fc] rounded-xl font-mono text-center cursor-pointer transition-colors"
                >
                  2–4PM
                </button>
              </div>
            </div>
          </div>

          {/* Instructor & Instructor Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#c4c7c8] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#a855f7]" />
                  <span>Lead Instructor *</span>
                </span>
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="e.g. Olamide, Lawal, Ayo"
                className="w-full px-3.5 py-2 rounded-xl bg-[#1d172e] border border-[#382f54] text-xs text-white focus:border-[#a855f7] focus:outline-none"
              />
              {/* Instructor quick chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {INSTRUCTORS.map((inst) => (
                  <button
                    type="button"
                    key={inst.name}
                    onClick={() => handleSelectInstructor(inst)}
                    className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                      instructor === inst.name
                        ? 'bg-[#a855f7]/30 border-[#a855f7] text-white'
                        : 'bg-[#181326] border-[#31284a] text-[#a19cb5] hover:text-white'
                    }`}
                  >
                    {inst.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#c4c7c8]">
                Instructor Designation (Optional)
              </label>
              <input
                type="text"
                value={instructorTitle}
                onChange={(e) => setInstructorTitle(e.target.value)}
                placeholder="e.g. Lead Security Engineer & SOC Analyst"
                className="w-full px-3.5 py-2 rounded-xl bg-[#1d172e] border border-[#382f54] text-xs text-white focus:border-[#a855f7] focus:outline-none"
              />
            </div>

          </div>

          {/* Venue & Focus Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#c4c7c8] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#a855f7]" />
                <span>Lab / Studio Venue *</span>
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Cyber Defense Lab (Lab 1)"
                list="venue-list"
                className="w-full px-3.5 py-2 rounded-xl bg-[#1d172e] border border-[#382f54] text-xs text-white focus:border-[#a855f7] focus:outline-none"
              />
              <datalist id="venue-list">
                {VENUE_SUGGESTIONS.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#c4c7c8] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
                <span>Focus Badge / Topic Tag</span>
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Core Track, Hands-on Sprint, Lab Defense"
                className="w-full px-3.5 py-2 rounded-xl bg-[#1d172e] border border-[#382f54] text-xs text-white focus:border-[#a855f7] focus:outline-none"
              />
            </div>

          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-[#2e2642] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                playSound('release');
                onClose();
              }}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-[#1e192c] hover:bg-[#29223c] border border-[#3b3254] text-xs text-[#c4c7c8] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-purple px-5 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Schedule...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Class Slot'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </motion.div>
    </div>
  );
};
