import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Save,
  RotateCcw,
  Search,
  Download,
  Eye,
  RefreshCw,
  ShieldCheck,
  Lock,
  History,
  FileSpreadsheet,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Info,
  UserPlus,
  Plus,
  X,
  GraduationCap,
  Edit3,
} from 'lucide-react';
import { AttendanceService } from '../../services/attendanceService';
import { TutorService, TutorProfile } from '../../services/tutorService';
import { EditTutorModal } from './EditTutorModal';
import {
  AttendanceStatus,
  StudentRecord,
  ClassSessionRecord,
} from '../../types/attendanceTypes';
import { playSound } from '../../utils/soundEffects';

interface AdminAttendanceManagerProps {
  currentUser?: {
    name: string;
    email: string;
    role: string;
  };
}

export const AdminAttendanceManager: React.FC<AdminAttendanceManagerProps> = ({
  currentUser = {
    name: 'Super Administrator',
    email: 'orbitspace.ilorin@gmail.com',
    role: 'Super Administrator',
  },
}) => {
  // Determine if current user has Admin privileges (Only Admin can mark, edit, and manage attendance)
  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    const roleLower = (currentUser.role || '').toLowerCase();
    const emailLower = (currentUser.email || '').toLowerCase();
    
    // Explicitly check for Tutor or Sub-Admin restrictions
    if (roleLower.includes('tutor') || roleLower.includes('sub-admin') || roleLower.includes('editor') || roleLower.includes('student')) {
      return false;
    }
    
    return (
      roleLower.includes('admin') ||
      roleLower.includes('super') ||
      emailLower === 'preciousogunleye07@gmail.com' ||
      emailLower === 'orbitspace.ilorin@gmail.com' ||
      emailLower.includes('admin')
    );
  }, [currentUser]);

  // --- Course, Cohort, Date Selection State ---
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [cohorts, setCohorts] = useState<string[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [sessionTopic, setSessionTopic] = useState<string>('');

  // --- Automatic Class Groups State (Grouped directly from registration database) ---
  const [classGroups, setClassGroups] = useState<
    Array<{
      program: string;
      studentCount: number;
      tutor: { id: string; name: string; email: string; phone?: string; specialization?: string };
      students: StudentRecord[];
    }>
  >([]);
  const [tutorAttendanceStatus, setTutorAttendanceStatus] = useState<AttendanceStatus>('present');

  // --- Data Loading States ---
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(false);
  const [savingAttendance, setSavingAttendance] = useState<boolean>(false);

  // --- Students & Attendance Map State ---
  const [students, setStudents] = useState<StudentRecord[]>([]);
  // student_id -> AttendanceStatus ('present' | 'absent' | 'late' | 'excused')
  const [attendanceMarks, setAttendanceMarks] = useState<Record<string, AttendanceStatus>>({});
  const [isExistingSession, setIsExistingSession] = useState<boolean>(false);
  const [loadedSessionInfo, setLoadedSessionInfo] = useState<ClassSessionRecord | null>(null);

  // --- Edit Tutor Modal State ---
  const [editingTutor, setEditingTutor] = useState<TutorProfile | null>(null);
  const [isEditTutorModalOpen, setIsEditTutorModalOpen] = useState<boolean>(false);
  const [tutorVersion, setTutorVersion] = useState<number>(0);

  // Subscribe to Tutor updates globally
  useEffect(() => {
    const unsub = TutorService.subscribeTutors(() => {
      setTutorVersion(v => v + 1);
    });
    return () => unsub();
  }, []);

  // Selected tutor override if admin manually chooses a different instructor for this class
  const [selectedTutorIdOverride, setSelectedTutorIdOverride] = useState<string>('');

  const activeTutors = useMemo(() => {
    void tutorVersion;
    return TutorService.getActiveTutors();
  }, [tutorVersion]);

  // When selectedCourse changes, clear manual override so program default is used
  useEffect(() => {
    setSelectedTutorIdOverride('');
  }, [selectedCourse, selectedCohort]);

  // Currently resolved assigned tutor for selected class
  const currentAssignedTutor = useMemo(() => {
    // tutorVersion ensures reactive re-eval when tutors update
    void tutorVersion;
    if (loadedSessionInfo?.tutor) return loadedSessionInfo.tutor;
    if (selectedTutorIdOverride) {
      const match = activeTutors.find(t => t.id === selectedTutorIdOverride);
      if (match) {
        return {
          id: match.id,
          name: match.name,
          email: match.email,
          phone: match.phone,
          specialization: match.specialization
        };
      }
    }
    return AttendanceService.getAssignedTutorForProgram(selectedCourse);
  }, [selectedCourse, loadedSessionInfo, tutorVersion, selectedTutorIdOverride, activeTutors]);

  // --- All Recorded Sessions for History & Stats ---
  const [courseSessions, setCourseSessions] = useState<ClassSessionRecord[]>([]);

  // --- Search & Filters ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'attendance' | 'history' | 'stats'>('attendance');

  // --- Student History Modal ---
  const [historyStudent, setHistoryStudent] = useState<StudentRecord | null>(null);

  // --- Register Student Modal State ---
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [registering, setRegistering] = useState<boolean>(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    matricNumber: '',
    studentId: '',
    course: '',
    cohort: '3',
    gender: 'Male',
  });

  // --- Toast Notification ---
  const [toast, setToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // 1. Initial Load: Fetch Courses & Cohorts from Real Database and Automatic Class Groups
  const initializeDatabaseData = useCallback(async (forceRefresh = false) => {
    try {
      setInitialLoading(true);
      const [availableCourses, availableCohorts, autoGroups] = await Promise.all([
        AttendanceService.getAvailableRealCourses(),
        AttendanceService.getAvailableRealCohorts(),
        AttendanceService.getAutomaticClassGroups(),
      ]);

      setCourses(availableCourses);
      setCohorts(availableCohorts);
      setClassGroups(autoGroups);

      if (availableCourses.length > 0 && !selectedCourse) {
        setSelectedCourse(availableCourses[0]);
      }
      if (availableCohorts.length > 0 && !selectedCohort) {
        setSelectedCohort(availableCohorts[0]);
      }
    } catch (err) {
      console.error('Error initializing database data:', err);
      showToast('Could not load course lists from database.', 'error');
    } finally {
      setInitialLoading(false);
    }
  }, [selectedCourse, selectedCohort, showToast]);

  useEffect(() => {
    initializeDatabaseData();
  }, [initializeDatabaseData]);

  // 2. When Course or Cohort changes, fetch Enrolled Students from Existing Database & Load Past Sessions
  useEffect(() => {
    if (!selectedCourse || !selectedCohort) return;

    let isMounted = true;

    async function loadCourseData() {
      setStudentsLoading(true);
      try {
        const [enrolledStudents, pastSessions] = await Promise.all([
          AttendanceService.getEnrolledStudents(selectedCourse, selectedCohort),
          AttendanceService.getAllSessionsForCourseAndCohort(selectedCourse, selectedCohort),
        ]);

        if (!isMounted) return;

        setStudents(enrolledStudents);
        setCourseSessions(pastSessions);

        // Load attendance for the selected date
        await loadSessionForDate(selectedCourse, selectedCohort, selectedDate, enrolledStudents);
      } catch (err) {
        console.error('Error loading enrolled students:', err);
        if (isMounted) {
          showToast('Failed to load registered students from database.', 'error');
        }
      } finally {
        if (isMounted) setStudentsLoading(false);
      }
    }

    loadCourseData();

    return () => {
      isMounted = false;
    };
  }, [selectedCourse, selectedCohort]);

  // 3. Load or initialize session for Course -> Cohort -> Date
  const loadSessionForDate = async (
    course: string,
    cohort: string,
    date: string,
    currentStudents: StudentRecord[]
  ) => {
    try {
      const existing = await AttendanceService.getSessionAttendance(course, cohort, date);
      if (existing) {
        // Attendance already exists for this session! Load it so admin can edit it without creating duplicates
        setIsExistingSession(true);
        setLoadedSessionInfo(existing);
        setSessionTopic(existing.session_topic || '');
        setAttendanceMarks(existing.student_attendance || {});
        setTutorAttendanceStatus(existing.tutor_attendance || 'present');
      } else {
        // New session: start fresh
        setIsExistingSession(false);
        setLoadedSessionInfo(null);
        setSessionTopic('');
        setTutorAttendanceStatus('present');
        // Initialize all students with 'present' as a sensible default or empty
        const initialMap: Record<string, AttendanceStatus> = {};
        currentStudents.forEach((s) => {
          initialMap[s.id] = 'present';
        });
        setAttendanceMarks(initialMap);
      }
    } catch (err) {
      console.error('Error loading session attendance:', err);
    }
  };

  // 4. When Date changes, reload session for that date
  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    if (selectedCourse && selectedCohort) {
      await loadSessionForDate(selectedCourse, selectedCohort, newDate, students);
    }
  };

  // 5. Select a past session from history to edit or review
  const handleSelectPastSession = async (sess: ClassSessionRecord) => {
    setSelectedDate(sess.date);
    setSelectedCourse(sess.course);
    setSelectedCohort(sess.cohort);
    setIsExistingSession(true);
    setLoadedSessionInfo(sess);
    setSessionTopic(sess.session_topic || '');
    setAttendanceMarks(sess.student_attendance || {});
    setTutorAttendanceStatus(sess.tutor_attendance || 'present');
    setActiveTab('attendance');
    showToast(`Loaded session from ${sess.date}. Editing mode active.`, 'info');
  };

  // 6. Mark All Present (Quick Attendance requirement)
  const handleMarkAllPresent = () => {
    if (!isAdmin) return;
    playSound('button');
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = 'present';
    });
    setAttendanceMarks(updated);
    showToast('All enrolled students marked as Present.', 'success');
  };

  // 7. Individual status toggling (Admin Only)
  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    if (!isAdmin) return;
    playSound('click');
    setAttendanceMarks((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Open register student modal pre-filled with current course & cohort
  const handleOpenRegisterModal = () => {
    setNewStudentForm({
      name: '',
      email: '',
      phone: '',
      matricNumber: '',
      studentId: '',
      course: selectedCourse || (courses[0] || 'Cybersecurity'),
      cohort: selectedCohort || '3',
      gender: 'Male',
    });
    setIsRegisterModalOpen(true);
  };

  // Submit new student registration to database
  const handleRegisterStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Only Administrators can register new students.', 'error');
      return;
    }

    if (!newStudentForm.name.trim()) {
      showToast('Student full name is required.', 'error');
      return;
    }

    if (!newStudentForm.course.trim()) {
      showToast('Course / Program is required.', 'error');
      return;
    }

    setRegistering(true);
    playSound('button');

    try {
      const added = await AttendanceService.registerStudentRecord({
        name: newStudentForm.name.trim(),
        email: newStudentForm.email.trim(),
        phone: newStudentForm.phone.trim(),
        matricNumber: newStudentForm.matricNumber.trim() || undefined,
        studentId: newStudentForm.studentId.trim() || undefined,
        course: newStudentForm.course.trim(),
        cohort: newStudentForm.cohort.trim() || '3',
        gender: newStudentForm.gender,
      });

      playSound('success');
      showToast(`Student ${added.name} successfully registered to database!`, 'success');
      setIsRegisterModalOpen(false);

      // Refresh database data and current course list
      await initializeDatabaseData(true);
      if (selectedCourse === added.course && selectedCohort === added.cohort) {
        const enrolled = await AttendanceService.getEnrolledStudents(selectedCourse, selectedCohort);
        setStudents(enrolled);
        setAttendanceMarks((prev) => ({
          ...prev,
          [added.id]: 'present',
        }));
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      showToast(err?.message || 'Failed to register student.', 'error');
    } finally {
      setRegistering(false);
    }
  };

  // 8. Save Attendance Directly to Database (Linked to student_id and class_session_id)
  const handleSaveAttendance = async () => {
    if (!isAdmin) {
      showToast('Unauthorized: Only Administrators can save attendance.', 'error');
      return;
    }

    if (!selectedCourse || !selectedCohort || !selectedDate) {
      showToast('Please select Course, Cohort, and Date.', 'error');
      return;
    }

    if (students.length === 0) {
      showToast('No students enrolled in this Course and Cohort to record.', 'error');
      return;
    }

    playSound('success');
    setSavingAttendance(true);

    try {
      const sessionId = AttendanceService.generateClassSessionId(selectedCourse, selectedCohort, selectedDate);

      const sessionData: ClassSessionRecord = {
        class_session_id: sessionId,
        course: selectedCourse,
        cohort: selectedCohort,
        date: selectedDate,
        session_topic: sessionTopic.trim() || `Regular Class Session - ${selectedDate}`,
        tutor: currentAssignedTutor,
        tutor_attendance: tutorAttendanceStatus,
        student_attendance: attendanceMarks,
        total_students: students.length,
        present_count: 0, // will be auto-calculated in service
        absent_count: 0,
        late_count: 0,
        excused_count: 0,
        recorded_by: {
          name: currentUser.name || 'Orbit Space Administrator',
          email: currentUser.email || 'admin@orbitspace.academy',
          role: currentUser.role || 'Super Administrator',
        },
        created_at: loadedSessionInfo?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await AttendanceService.saveClassSessionAttendance(sessionData, students);

      if (result.success) {
        setIsExistingSession(true);
        setLoadedSessionInfo(result.session);
        // Refresh sessions list
        const updatedSessions = await AttendanceService.getAllSessionsForCourseAndCohort(selectedCourse, selectedCohort);
        setCourseSessions(updatedSessions);
        showToast(`Attendance saved successfully to database! (${sessionId})`, 'success');
      } else {
        showToast('Failed to commit attendance to database.', 'error');
      }
    } catch (err) {
      console.error('Save attendance error:', err);
      showToast('Error saving attendance. Check network connection.', 'error');
    } finally {
      setSavingAttendance(false);
    }
  };

  // 9. Statistics & History for each student
  const studentStatsMap = useMemo(() => {
    return AttendanceService.computeStudentAttendanceStats(students, courseSessions);
  }, [students, courseSessions]);

  // 10. Summary Counters for the current active date
  const currentSummary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    students.forEach((s) => {
      const st = attendanceMarks[s.id] || 'present';
      if (st === 'present') present++;
      else if (st === 'absent') absent++;
      else if (st === 'late') late++;
      else if (st === 'excused') excused++;
    });

    return {
      present,
      absent,
      late,
      excused,
      total: students.length,
    };
  }, [students, attendanceMarks]);

  // 11. Filtered students by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.matricNumber && s.matricNumber.toLowerCase().includes(q)) ||
        s.id.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // 12. CSV Export
  const handleExportCSV = () => {
    playSound('button');
    const headers = ['#', 'Student Name', 'Matric Number', 'Student ID', 'Status', 'Date', 'Course', 'Cohort'];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.name}"`,
      `"${s.matricNumber || ''}"`,
      `"${s.id}"`,
      `"${attendanceMarks[s.id] || 'present'}"`,
      `"${selectedDate}"`,
      `"${selectedCourse}"`,
      `"${selectedCohort}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_${selectedCourse.replace(/\s+/g, '_')}_${selectedCohort}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report exported to CSV.', 'success');
  };

  return (
    <div id="admin-attendance-manager-root" className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all animate-in fade-in slide-in-from-top-3 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 backdrop-blur-md'
              : toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 backdrop-blur-md'
              : 'bg-purple-950/90 text-purple-200 border-purple-500/40 backdrop-blur-md'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-purple-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner & Security Mode Indicator */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Class Attendance System
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              {isAdmin
                ? 'Select Course, Cohort, and Date to mark, edit, and record attendance directly to the database. Linked automatically to registered student profiles.'
                : 'Tutors and students have view-only access to live attendance records, percentages, and historical logs.'}
            </p>
          </div>

          {/* Quick Refresh & Database Sync & Register Student */}
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                id="register-student-top-btn"
                onClick={handleOpenRegisterModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition cursor-pointer shrink-0"
                title="Register a new student to database"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Student</span>
              </button>
            )}

            <button
              id="refresh-database-btn"
              onClick={() => initializeDatabaseData(true)}
              disabled={initialLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition disabled:opacity-50 shrink-0"
              title="Refresh database students from SheetDB and Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${initialLoading ? 'animate-spin text-purple-400' : ''}`} />
              <span>Sync Database</span>
            </button>

            {/* Navigation Tabs */}
            <div className="flex items-center p-1 bg-neutral-950 border border-neutral-800 rounded-xl shrink-0">
              <button
                id="tab-attendance-btn"
                onClick={() => setActiveTab('attendance')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'attendance'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Mark Attendance
              </button>
              <button
                id="tab-history-btn"
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'history'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Past Sessions ({courseSessions.length})
              </button>
              <button
                id="tab-stats-btn"
                onClick={() => setActiveTab('stats')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'stats'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Student Statistics
              </button>
            </div>
          </div>
        </div>

        {/* View-Only Security Alert for non-admins */}
        {!isAdmin && (
          <div className="mt-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>View-Only Mode:</strong> Only Orbit Space Administrators can mark, edit, or manage attendance records. You can view attendance records, historical stats, and student compliance.
            </span>
          </div>
        )}
      </div>

      {/* Automatic Class Groups: One Attendance Tab Per Class (Program 1) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Class Attendance Tabs (Auto-grouped from Registration)
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Select a class tab below. Students registered under each Program automatically populate together with their assigned tutor.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => initializeDatabaseData(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition"
              title="Sync latest registration data from SheetDB"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${initialLoading ? 'animate-spin' : ''}`} />
              <span>Sync Registrations</span>
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenRegisterModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-200 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/50 transition cursor-pointer"
                title="Register a new student directly into this class"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Register Student</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Class Tabs (Program 1) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-800">
          {(classGroups.length > 0
            ? classGroups
            : courses.map((c) => ({
                program: c,
                studentCount: selectedCourse === c ? students.length : 0,
                tutor: AttendanceService.getAssignedTutorForProgram(c),
                students: [],
              }))
          ).map((group) => {
            const isSelected = selectedCourse === group.program;
            return (
              <button
                key={group.program}
                type="button"
                onClick={() => setSelectedCourse(group.program)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30'
                    : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <span className="font-medium">{group.program}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isSelected
                      ? 'bg-purple-800 text-white'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {group.studentCount > 0 ? group.studentCount : students.length > 0 && isSelected ? students.length : 0} students
                </span>
              </button>
            );
          })}
        </div>

        {/* Session Details: Assigned Tutor, Date Picker, Cohort, and Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Assigned Tutor Card */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-neutral-400">
                Assigned Tutor / Instructor
              </label>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    const profile =
                      TutorService.getTutorById(currentAssignedTutor.id) ||
                      TutorService.getAssignedTutorForProgram(selectedCourse);
                    setEditingTutor(profile);
                    setIsEditTutorModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium transition cursor-pointer"
                  title="Assign multiple subjects or edit mentor profile"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Assign Subjects</span>
                </button>
              )}
            </div>
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs shrink-0">
                    {currentAssignedTutor.name ? currentAssignedTutor.name.charAt(0) : 'T'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-neutral-200 truncate flex items-center gap-1.5">
                      <span>{currentAssignedTutor.name}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">
                      {currentAssignedTutor.specialization || currentAssignedTutor.email}
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      const profile =
                        TutorService.getTutorById(currentAssignedTutor.id) ||
                        TutorService.getAssignedTutorForProgram(selectedCourse);
                      setEditingTutor(profile);
                      setIsEditTutorModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-purple-300 transition shrink-0"
                    title="Edit tutor and assign subjects"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Selector to change instructor for this session or course */}
              {activeTutors.length > 0 && !isExistingSession && (
                <div className="pt-1.5 border-t border-neutral-850 flex items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 shrink-0">Switch:</span>
                  <select
                    value={selectedTutorIdOverride || currentAssignedTutor.id}
                    onChange={(e) => setSelectedTutorIdOverride(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-lg px-2 py-1 text-[11px] text-neutral-300 outline-none transition truncate"
                  >
                    {activeTutors.map((tut) => (
                      <option key={tut.id} value={tut.id}>
                        {tut.name} ({tut.programs?.length || 0} subjects)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Select Cohort */}
          <div className="space-y-1.5">
            <label htmlFor="select-cohort" className="block text-xs font-medium text-neutral-400">
              Cohort
            </label>
            <select
              id="select-cohort"
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-sm text-neutral-200 outline-none transition"
            >
              {cohorts.map((ch) => (
                <option key={ch} value={ch}>
                  Cohort {ch}
                </option>
              ))}
            </select>
          </div>

          {/* Select Date */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="select-date" className="block text-xs font-medium text-neutral-400">
                Session Date
              </label>
              <button
                type="button"
                onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-medium"
              >
                Today
              </button>
            </div>
            <input
              id="select-date"
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-sm text-neutral-200 outline-none transition"
            />
          </div>

          {/* Session Topic (Optional) */}
          <div className="space-y-1.5">
            <label htmlFor="input-session-topic" className="block text-xs font-medium text-neutral-400">
              Session Topic
            </label>
            <input
              id="input-session-topic"
              type="text"
              placeholder="e.g. React Components & Hooks"
              value={sessionTopic}
              disabled={!isAdmin}
              onChange={(e) => setSessionTopic(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-sm text-neutral-200 outline-none transition placeholder:text-neutral-600 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Existing Session Notification or New Session Banner */}
        <div className="pt-2">
          {isExistingSession ? (
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-purple-200">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  <strong>Existing session record loaded:</strong> Session ID:{' '}
                  <code className="px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-200 font-mono text-[11px]">
                    {loadedSessionInfo?.class_session_id}
                  </code>
                  {loadedSessionInfo?.recorded_by?.name && ` • Recorded by ${loadedSessionInfo.recorded_by.name}`}
                  . Editing will update this session directly without duplicates.
                </span>
              </div>
              <span className="text-[11px] text-purple-400 font-medium shrink-0">
                {loadedSessionInfo?.updated_at
                  ? `Last updated: ${new Date(loadedSessionInfo.updated_at).toLocaleDateString()}`
                  : 'Active Record'}
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3 text-xs text-neutral-400">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>
                  New class session for <strong>{selectedDate}</strong>. Mark attendance and save directly to the database.
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">
                {AttendanceService.generateClassSessionId(selectedCourse, selectedCohort, selectedDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Quick Attendance Action Bar */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Live Counters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <span className="text-neutral-400 font-medium mr-1">Summary:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {currentSummary.present} Present
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                {currentSummary.absent} Absent
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {currentSummary.late} Late
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                {currentSummary.excused} Excused
              </span>
              <span className="text-neutral-500 text-[11px] ml-1">
                ({currentSummary.total} Total)
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-purple-500 w-44 sm:w-52"
                />
              </div>

              {/* Mark All Present (Admin Only) */}
              {isAdmin && (
                <button
                  id="mark-all-present-btn"
                  onClick={handleMarkAllPresent}
                  disabled={students.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition disabled:opacity-50"
                  title="Mark all listed students as present"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark All Present</span>
                </button>
              )}

              {/* Save Attendance to Database (Admin Only) */}
              {isAdmin && (
                <button
                  id="save-attendance-btn"
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance || students.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition disabled:opacity-50"
                >
                  <Save className={`w-3.5 h-3.5 ${savingAttendance ? 'animate-spin' : ''}`} />
                  <span>{savingAttendance ? 'Saving...' : isExistingSession ? 'Update Attendance' : 'Save Attendance'}</span>
                </button>
              )}

              {/* Export CSV */}
              <button
                id="export-csv-btn"
                onClick={handleExportCSV}
                disabled={students.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition disabled:opacity-50"
                title="Export this session as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Simple, Fast Student Attendance Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
            {studentsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-7 h-7 text-purple-400 animate-spin" />
                <p className="text-sm text-neutral-400">Fetching enrolled students from database...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Users className="w-10 h-10 text-neutral-600 mx-auto" />
                <h3 className="text-base font-semibold text-neutral-300">No Students Found</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  No registered students were found for <strong>{selectedCourse}</strong> ({selectedCohort}). Verify student enrollment records or sync the database.
                </p>
                <button
                  onClick={() => initializeDatabaseData(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium text-purple-300 bg-purple-950/60 border border-purple-500/30 hover:bg-purple-900/60 transition mt-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-fetch from Database</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-950/60 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4 min-w-[200px]">Student Name</th>
                      <th className="py-3 px-4 min-w-[140px]">Matric Number</th>
                      <th className="py-3 px-4 min-w-[320px]">
                        Attendance Status {isAdmin ? '(Click to toggle)' : '(View-Only)'}
                      </th>
                      <th className="py-3 px-4 min-w-[110px] text-center">Overall %</th>
                      <th className="py-3 px-4 w-24 text-center">History</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-sm">
                    {/* Assigned Tutor Attendance Row */}
                    <tr className="bg-purple-950/20 border-b border-purple-500/20 hover:bg-purple-950/30 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-purple-900/60 border border-purple-500/30 text-purple-300 font-bold text-[10px]">
                          TUTOR
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/30 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center justify-center shrink-0">
                            {currentAssignedTutor.name ? currentAssignedTutor.name.charAt(0) : 'T'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-white truncate">{currentAssignedTutor.name}</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap shrink-0">
                                Assigned Tutor
                              </span>
                            </div>
                            <div className="text-[11px] text-purple-300/80 truncate mt-0.5">
                              {currentAssignedTutor.email} {currentAssignedTutor.phone ? `• ${currentAssignedTutor.phone}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block font-mono text-xs text-purple-300 px-2 py-0.5 rounded bg-purple-900/40 border border-purple-700/40 whitespace-nowrap">
                          {currentAssignedTutor.id || 'TUTOR'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
                            <button
                              type="button"
                              onClick={() => {
                                playSound('click');
                                setTutorAttendanceStatus('present');
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                tutorAttendanceStatus === 'present'
                                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                                  : 'text-neutral-400 hover:text-emerald-300 hover:bg-emerald-950/30'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playSound('click');
                                setTutorAttendanceStatus('absent');
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                tutorAttendanceStatus === 'absent'
                                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                                  : 'text-neutral-400 hover:text-rose-300 hover:bg-rose-950/30'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playSound('click');
                                setTutorAttendanceStatus('late');
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                tutorAttendanceStatus === 'late'
                                  ? 'bg-amber-600 text-white font-semibold shadow-sm'
                                  : 'text-neutral-400 hover:text-amber-300 hover:bg-amber-950/30'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playSound('click');
                                setTutorAttendanceStatus('excused');
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                tutorAttendanceStatus === 'excused'
                                  ? 'bg-purple-600 text-white font-semibold shadow-sm'
                                  : 'text-neutral-400 hover:text-purple-300 hover:bg-purple-950/30'
                              }`}
                            >
                              Excused
                            </button>
                          </div>
                        ) : (
                          <div>
                            {tutorAttendanceStatus === 'present' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Present
                              </span>
                            )}
                            {tutorAttendanceStatus === 'absent' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                                <XCircle className="w-3.5 h-3.5" /> Absent
                              </span>
                            )}
                            {tutorAttendanceStatus === 'late' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                <Clock className="w-3.5 h-3.5" /> Late
                              </span>
                            )}
                            {tutorAttendanceStatus === 'excused' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                                <HelpCircle className="w-3.5 h-3.5" /> Excused
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[11px] font-medium text-purple-300">
                          Class Faculty
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-neutral-500">
                        —
                      </td>
                    </tr>

                    {filteredStudents.map((student, idx) => {
                      const currentStatus = attendanceMarks[student.id] || 'present';
                      const stat = studentStatsMap[student.id] || { percentage: 100, total: 0 };
                      const rowKey = `${student.id || 'stu'}-${student.matricNumber || 'nomatric'}-${idx}`;

                      return (
                        <tr
                          key={rowKey}
                          className="hover:bg-neutral-800/30 transition-colors group"
                        >
                          {/* Index */}
                          <td className="py-3.5 px-4 text-center text-xs text-neutral-500 font-mono">
                            {idx + 1}
                          </td>

                          {/* Student Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold text-xs flex items-center justify-center shrink-0">
                                {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-neutral-200 truncate">
                                  {student.name}
                                </div>
                                <div className="text-[11px] text-neutral-500 font-mono">
                                  {student.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Matric Number */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-xs text-neutral-300 px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">
                              {student.matricNumber || 'Pending'}
                            </span>
                          </td>

                          {/* Present, Absent, Late, Excused Controls */}
                          <td className="py-3.5 px-4">
                            {isAdmin ? (
                              <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
                                {/* Present */}
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(student.id, 'present')}
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    currentStatus === 'present'
                                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                                      : 'text-neutral-400 hover:text-emerald-300 hover:bg-emerald-950/30'
                                  }`}
                                >
                                  Present
                                </button>

                                {/* Absent */}
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(student.id, 'absent')}
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    currentStatus === 'absent'
                                      ? 'bg-rose-600 text-white font-semibold shadow-sm'
                                      : 'text-neutral-400 hover:text-rose-300 hover:bg-rose-950/30'
                                  }`}
                                >
                                  Absent
                                </button>

                                {/* Late */}
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(student.id, 'late')}
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    currentStatus === 'late'
                                      ? 'bg-amber-600 text-white font-semibold shadow-sm'
                                      : 'text-neutral-400 hover:text-amber-300 hover:bg-amber-950/30'
                                  }`}
                                >
                                  Late
                                </button>

                                {/* Excused */}
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(student.id, 'excused')}
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    currentStatus === 'excused'
                                      ? 'bg-purple-600 text-white font-semibold shadow-sm'
                                      : 'text-neutral-400 hover:text-purple-300 hover:bg-purple-950/30'
                                  }`}
                                >
                                  Excused
                                </button>
                              </div>
                            ) : (
                              // View-only mode badge for tutors/students
                              <div>
                                {currentStatus === 'present' && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Present
                                  </span>
                                )}
                                {currentStatus === 'absent' && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                                    <XCircle className="w-3.5 h-3.5" /> Absent
                                  </span>
                                )}
                                {currentStatus === 'late' && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                    <Clock className="w-3.5 h-3.5" /> Late
                                  </span>
                                )}
                                {currentStatus === 'excused' && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                                    <HelpCircle className="w-3.5 h-3.5" /> Excused
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Attendance Percentage */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${
                                stat.percentage >= 75
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : stat.percentage >= 50
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {stat.percentage}%
                            </span>
                          </td>

                          {/* History action */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setHistoryStudent(student)}
                              className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-purple-300 hover:underline p-1 rounded transition"
                              title="View full attendance history for this student"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Past Sessions History */}
      {activeTab === 'history' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white">
                Past Recorded Sessions ({selectedCourse} • {selectedCohort})
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                All attendance sessions saved to the database. Click any session to load and edit it.
              </p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-500/30">
              {courseSessions.length} Total Sessions
            </span>
          </div>

          {courseSessions.length === 0 ? (
            <div className="py-14 text-center text-neutral-500 text-xs">
              No sessions have been recorded yet for this course and cohort. Go to <strong>Mark Attendance</strong> to record the first session!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseSessions.map((sess) => (
                <div
                  key={sess.class_session_id}
                  className="bg-neutral-950 border border-neutral-800 hover:border-purple-500/50 rounded-xl p-4 transition space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-neutral-200">
                        {sess.date}
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {sess.session_topic || 'Regular Class Session'}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                      {sess.class_session_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs pt-1 border-t border-neutral-900">
                    <span className="text-emerald-400 font-medium">
                      {sess.present_count} Present
                    </span>
                    <span className="text-rose-400 font-medium">
                      {sess.absent_count} Absent
                    </span>
                    <span className="text-amber-400 font-medium">
                      {sess.late_count} Late
                    </span>
                    <span className="text-purple-400 font-medium">
                      {sess.excused_count} Excused
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                    <span>Recorded by: {sess.recorded_by?.name || 'Administrator'}</span>
                    <button
                      onClick={() => handleSelectPastSession(sess)}
                      className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 group-hover:underline"
                    >
                      {isAdmin ? 'Edit Session' : 'View Session'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Student Statistics & Compliance */}
      {activeTab === 'stats' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white">
                Student Attendance Statistics & Compliance
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Computed across all {courseSessions.length} sessions held for {selectedCourse} ({selectedCohort}).
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Summary CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/60 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Matric No</th>
                  <th className="py-3 px-4 text-center">Sessions Held</th>
                  <th className="py-3 px-4 text-center text-emerald-400">Present</th>
                  <th className="py-3 px-4 text-center text-rose-400">Absent</th>
                  <th className="py-3 px-4 text-center text-amber-400">Late</th>
                  <th className="py-3 px-4 text-center text-purple-400">Excused</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-sm">
                {students.map((student, idx) => {
                  const stat = studentStatsMap[student.id] || {
                    total: 0,
                    present: 0,
                    absent: 0,
                    late: 0,
                    excused: 0,
                    percentage: 100,
                  };

                  const isEligible = stat.percentage >= 75;
                  const isWarning = stat.percentage >= 50 && stat.percentage < 75;
                  const statKey = `stat-${student.id || 'stu'}-${student.matricNumber || 'nomatric'}-${idx}`;

                  return (
                    <tr key={statKey} className="hover:bg-neutral-800/30 transition">
                      <td className="py-3 px-4 font-medium text-neutral-200">
                        {student.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-neutral-400">
                        {student.matricNumber || 'Pending'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-neutral-300">
                        {stat.total}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-400">
                        {stat.present}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-rose-400">
                        {stat.absent}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-amber-400">
                        {stat.late}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-purple-400">
                        {stat.excused}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span
                          className={
                            isEligible
                              ? 'text-emerald-400'
                              : isWarning
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }
                        >
                          {stat.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isEligible
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isWarning
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isEligible ? 'Eligible' : isWarning ? 'Warning' : 'Critical'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Attendance History Modal */}
      {historyStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setHistoryStudent(null)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {historyStudent.matricNumber || historyStudent.id}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    {selectedCourse} • {selectedCohort}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {historyStudent.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Complete chronological attendance records for this student.
                </p>
              </div>

              <button
                onClick={() => setHistoryStudent(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Overall Percentage Card */}
              {(() => {
                const stat = studentStatsMap[historyStudent.id] || {
                  total: 0,
                  present: 0,
                  absent: 0,
                  late: 0,
                  excused: 0,
                  percentage: 100,
                  history: [],
                };

                return (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs text-neutral-400">Attendance Percentage</div>
                        <div className="text-2xl font-bold font-mono text-purple-300 mt-0.5">
                          {stat.percentage}%
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono">
                        <div className="text-center">
                          <div className="text-emerald-400 font-bold">{stat.present}</div>
                          <div className="text-neutral-500 text-[10px]">Present</div>
                        </div>
                        <div className="text-center">
                          <div className="text-rose-400 font-bold">{stat.absent}</div>
                          <div className="text-neutral-500 text-[10px]">Absent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-amber-400 font-bold">{stat.late}</div>
                          <div className="text-neutral-500 text-[10px]">Late</div>
                        </div>
                        <div className="text-center">
                          <div className="text-purple-400 font-bold">{stat.excused}</div>
                          <div className="text-neutral-500 text-[10px]">Excused</div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Session Logs
                      </h4>

                      {stat.history.length === 0 ? (
                        <p className="text-xs text-neutral-500 py-4 text-center">
                          No session entries recorded for this student yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {stat.history.map((h, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="font-semibold text-neutral-200">
                                  {h.date}
                                </div>
                                <div className="text-[11px] text-neutral-500 font-mono">
                                  Session ID: {h.session_id}
                                </div>
                                {h.topic && (
                                  <div className="text-[11px] text-neutral-400 mt-0.5">
                                    Topic: {h.topic}
                                  </div>
                                )}
                              </div>

                              <div>
                                {h.status === 'present' && (
                                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                    Present
                                  </span>
                                )}
                                {h.status === 'absent' && (
                                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                                    Absent
                                  </span>
                                )}
                                {h.status === 'late' && (
                                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                    Late
                                  </span>
                                )}
                                {h.status === 'excused' && (
                                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                                    Excused
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REGISTER NEW STUDENT MODAL (Database Integrated) */}
      {/* ========================================================================= */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Register New Student
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Saves directly to Firestore database and syncs with Google Sheet
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleRegisterStudentSubmit} className="p-5 space-y-4 overflow-y-auto">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-neutral-300">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adebayo Blessing Funmilayo"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-purple-500 transition"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-neutral-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. student@gmail.com"
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-purple-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-neutral-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={newStudentForm.phone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* Course & Cohort */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-neutral-300">
                    Course / Track <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newStudentForm.course}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, course: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500 transition"
                  >
                    {courses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-neutral-300">
                    Cohort <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newStudentForm.cohort}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, cohort: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500 transition"
                  >
                    {cohorts.length > 0 ? (
                      cohorts.map((ch) => (
                        <option key={ch} value={ch}>
                          Cohort {ch}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="1">Cohort 1</option>
                        <option value="2">Cohort 2</option>
                        <option value="3">Cohort 3</option>
                        <option value="4">Cohort 4</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Matric Number & Student ID (Optional Auto-generation) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-neutral-300">
                    Matric Number <span className="text-neutral-500 text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ORB/2026/0026"
                    value={newStudentForm.matricNumber}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, matricNumber: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-purple-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-neutral-300">
                    Gender
                  </label>
                  <select
                    value={newStudentForm.gender}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, gender: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500 transition"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition disabled:opacity-50 shadow-md cursor-pointer"
                >
                  {registering ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Confirm & Register</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tutor Global Modal */}
      {isEditTutorModalOpen && editingTutor && (
        <EditTutorModal
          tutor={editingTutor}
          isOpen={isEditTutorModalOpen}
          onClose={() => setIsEditTutorModalOpen(false)}
          onTutorUpdated={(updated) => {
            showToast(`Tutor "${updated.name}" updated successfully across attendance and timetable!`, 'success');
            setTutorVersion(v => v + 1);
            // Refresh automatic class groups so tabs display latest tutor info
            AttendanceService.getAutomaticClassGroups().then(groups => setClassGroups(groups));
          }}
        />
      )}
    </div>
  );
};
