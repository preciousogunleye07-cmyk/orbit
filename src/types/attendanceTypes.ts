export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface ClassGroup {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: string; // e.g. 'Software Engineering', 'Cybersecurity', 'Robotics & IoT', 'Design'
  scheduleDays: string[]; // e.g. ['Monday', 'Wednesday', 'Friday']
  timeSlot: string; // e.g. '10:00 AM - 1:00 PM'
  venue: string; // e.g. 'Lab 01 - Cloud Studio'
  assignedTeacherIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TeacherRecord {
  id: string;
  name: string;
  email: string;
  specialization: string;
  phone?: string;
  assignedClassIds: string[];
  status: 'active' | 'inactive';
}

export interface StudentRecord {
  id: string;
  student_id?: string;
  name: string;
  matricNumber: string;
  email: string;
  phone?: string;
  gender?: string;
  classId?: string;
  course?: string; // Derived from Program 1
  cohort?: string;
  enrolledAt?: string;
  status?: 'active' | 'graduated' | 'suspended' | string;
}

export interface ClassSessionRecord {
  class_session_id: string;
  course: string;
  cohort: string;
  date: string; // YYYY-MM-DD
  session_topic?: string;
  mentorId?: string; // Canonical mentor ID
  tutor?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    specialization?: string;
  };
  tutor_attendance?: AttendanceStatus; // Status of tutor for this session
  tutor_check_in_time?: string; // ISO string or time string e.g. "2026-03-21T09:00:00Z"
  tutor_check_out_time?: string; // ISO string or time string e.g. "2026-03-21T11:30:00Z"
  duration_hours?: number; // Calculated: Check-out time - Check-in time in decimal hours e.g. 2.5
  check_in_status?: 'not_started' | 'checked_in' | 'completed';
  student_attendance: Record<string, AttendanceStatus>; // student_id -> status
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  recorded_by: {
    name: string;
    email: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
}

export interface StudentAttendanceItem {
  id: string;
  class_session_id: string;
  student_id: string;
  student_name: string;
  matric_number: string;
  course: string;
  cohort: string;
  date: string;
  status: AttendanceStatus;
  updated_at: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  sessionTopic: string;
  recordedBy: {
    name: string;
    role: string;
    email: string;
  };
  studentAttendance: Record<string, AttendanceStatus>; // studentId -> status
  teacherAttendance: Record<string, AttendanceStatus>; // teacherId -> status
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAttendanceStat {
  student: StudentRecord;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number; // 0 to 100
  complianceStatus: 'eligible' | 'warning' | 'critical'; // eligible >= 75%, warning 50-74%, critical < 50%
}

export interface TeacherAttendanceStat {
  teacher: TeacherRecord;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
}
