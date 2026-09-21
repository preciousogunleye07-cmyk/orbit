import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  AttendanceSession,
  AttendanceStatus,
  ClassGroup,
  StudentRecord,
  StudentAttendanceStat,
  TeacherAttendanceStat,
  TeacherRecord,
  ClassSessionRecord,
  StudentAttendanceItem,
} from '../types/attendanceTypes';
import { fetchSheetDBStudents } from './sheetdbService';
import { OFFICIAL_ORBIT_STUDENTS } from '../data/officialOrbitStudents';
import { TutorService } from './tutorService';

// Initial pre-seeded classes
export const DEFAULT_CLASSES: ClassGroup[] = [
  {
    id: 'cls-fullstack-2026',
    name: 'Full-Stack Web Development Cohort',
    code: 'FSWD-2026',
    description: 'Comprehensive modern web applications with React, TypeScript, Node.js, and Cloud Infrastructure.',
    category: 'Software Engineering',
    scheduleDays: ['Monday', 'Wednesday', 'Friday'],
    timeSlot: '10:00 AM - 1:00 PM',
    venue: 'Lab 01 - Cloud Architecture Studio',
    assignedTeacherIds: ['tch-precious-ogunleye', 'tch-marcus-okafor'],
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'cls-cybersecurity-2026',
    name: 'Cyber Security & Offensive Defense',
    code: 'CYB-2026',
    description: 'Network defense, penetration testing, threat hunting, and enterprise vulnerability management.',
    category: 'Cybersecurity',
    scheduleDays: ['Tuesday', 'Thursday', 'Saturday'],
    timeSlot: '11:00 AM - 2:00 PM',
    venue: 'Cyber Range & Security Operations Center',
    assignedTeacherIds: ['tch-adebayo-vance'],
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'cls-robotics-2026',
    name: 'Robotics & Embedded Systems Engineering',
    code: 'ROB-2026',
    description: 'Microcontroller programming, sensor telemetry, autonomous actuation, and hardware circuits.',
    category: 'Robotics & IoT',
    scheduleDays: ['Monday', 'Thursday'],
    timeSlot: '2:00 PM - 5:00 PM',
    venue: 'Hardware Fabrication & Prototyping Lab',
    assignedTeacherIds: ['tch-fatima-bello'],
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'cls-uiux-2026',
    name: 'UI/UX & Digital Product Design',
    code: 'DES-2026',
    description: 'Design systems, high-fidelity Figma prototyping, human-computer interaction, and user testing.',
    category: 'Design & Systems',
    scheduleDays: ['Wednesday', 'Friday'],
    timeSlot: '9:00 AM - 12:00 PM',
    venue: 'Creative Studio & Human Factors Lab',
    assignedTeacherIds: ['tch-sophia-chen'],
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'cls-datascience-2026',
    name: 'Data Science & Machine Learning Intelligence',
    code: 'DS-2026',
    description: 'Statistical modeling, Python, PyTorch, predictive intelligence, and big data pipelines.',
    category: 'Data Science & AI',
    scheduleDays: ['Tuesday', 'Friday'],
    timeSlot: '1:00 PM - 4:00 PM',
    venue: 'AI Compute & Data Analytics Wing',
    assignedTeacherIds: ['tch-marcus-okafor'],
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
];

// Initial pre-seeded teachers
export const DEFAULT_TEACHERS: TeacherRecord[] = [
  {
    id: 'tch-precious-ogunleye',
    name: 'Engr. Precious Ogunleye',
    email: 'precious@orbitspace.academy',
    specialization: 'Lead Full-Stack Architect & Cloud Systems',
    phone: '+234 810 456 7890',
    assignedClassIds: ['cls-fullstack-2026'],
    status: 'active',
  },
  {
    id: 'tch-adebayo-vance',
    name: 'Dr. Adebayo Vance',
    email: 'adebayo.vance@orbitspace.academy',
    specialization: 'Principal Security Researcher & Ethical Hacker',
    phone: '+234 803 123 4567',
    assignedClassIds: ['cls-cybersecurity-2026'],
    status: 'active',
  },
  {
    id: 'tch-sophia-chen',
    name: 'Sophia Chen',
    email: 'sophia.chen@orbitspace.academy',
    specialization: 'Senior Design Systems Lead & UX Strategist',
    phone: '+234 812 987 6543',
    assignedClassIds: ['cls-uiux-2026'],
    status: 'active',
  },
  {
    id: 'tch-fatima-bello',
    name: 'Engr. Fatima Bello',
    email: 'fatima.bello@orbitspace.academy',
    specialization: 'Robotics & Hardware Firmware Specialist',
    phone: '+234 809 345 6789',
    assignedClassIds: ['cls-robotics-2026'],
    status: 'active',
  },
  {
    id: 'tch-marcus-okafor',
    name: 'Marcus Okafor',
    email: 'marcus.okafor@orbitspace.academy',
    specialization: 'AI Research Fellow & Distributed Systems Engineer',
    phone: '+234 818 654 3210',
    assignedClassIds: ['cls-fullstack-2026', 'cls-datascience-2026'],
    status: 'active',
  },
];

// Initial pre-seeded students
export const DEFAULT_STUDENTS: StudentRecord[] = [
  // Full-Stack Class
  {
    id: 'std-fs-01',
    name: 'Olumide Emmanuel Adeleke',
    matricNumber: 'ORB/2026/FS-001',
    email: 'olumide.adeleke@student.orbitspace.academy',
    phone: '+234 801 111 2233',
    classId: 'cls-fullstack-2026',
    enrolledAt: '2026-01-20',
    status: 'active',
  },
  {
    id: 'std-fs-02',
    name: 'Chisom Victoria Okonkwo',
    matricNumber: 'ORB/2026/FS-002',
    email: 'chisom.okonkwo@student.orbitspace.academy',
    phone: '+234 802 222 3344',
    classId: 'cls-fullstack-2026',
    enrolledAt: '2026-01-20',
    status: 'active',
  },
  {
    id: 'std-fs-03',
    name: 'Tunde Daniel Balogun',
    matricNumber: 'ORB/2026/FS-003',
    email: 'tunde.balogun@student.orbitspace.academy',
    phone: '+234 803 333 4455',
    classId: 'cls-fullstack-2026',
    enrolledAt: '2026-01-21',
    status: 'active',
  },
  {
    id: 'std-fs-04',
    name: 'Amina Zainab Yusuf',
    matricNumber: 'ORB/2026/FS-004',
    email: 'amina.yusuf@student.orbitspace.academy',
    phone: '+234 804 444 5566',
    classId: 'cls-fullstack-2026',
    enrolledAt: '2026-01-22',
    status: 'active',
  },
  {
    id: 'std-fs-05',
    name: 'Kelechi Paul Eze',
    matricNumber: 'ORB/2026/FS-005',
    email: 'kelechi.eze@student.orbitspace.academy',
    phone: '+234 805 555 6677',
    classId: 'cls-fullstack-2026',
    enrolledAt: '2026-01-22',
    status: 'active',
  },
  {
    id: 'std-fs-06',
    name: 'Blessing Grace Idowu',
    matricNumber: 'ORB/2026/FS-006',
    email: 'blessing.idowu@student.orbitspace.academy',
    phone: '+234 806 666 7788',
    classId: 'cls-fullstack-2026',
    enrolledAt: '2026-01-23',
    status: 'active',
  },

  // Cybersecurity Class
  {
    id: 'std-cy-01',
    name: 'David Ayodele Ajayi',
    matricNumber: 'ORB/2026/CY-001',
    email: 'david.ajayi@student.orbitspace.academy',
    phone: '+234 807 777 8899',
    classId: 'cls-cybersecurity-2026',
    enrolledAt: '2026-01-20',
    status: 'active',
  },
  {
    id: 'std-cy-02',
    name: 'Zainab Binta Abubakar',
    matricNumber: 'ORB/2026/CY-002',
    email: 'zainab.abubakar@student.orbitspace.academy',
    phone: '+234 808 888 9900',
    classId: 'cls-cybersecurity-2026',
    enrolledAt: '2026-01-20',
    status: 'active',
  },
  {
    id: 'std-cy-03',
    name: 'Femi Gabriel Ojo',
    matricNumber: 'ORB/2026/CY-003',
    email: 'femi.ojo@student.orbitspace.academy',
    phone: '+234 809 999 0011',
    classId: 'cls-cybersecurity-2026',
    enrolledAt: '2026-01-21',
    status: 'active',
  },
  {
    id: 'std-cy-04',
    name: 'Somtochukwu Mary Nnamdi',
    matricNumber: 'ORB/2026/CY-004',
    email: 'somto.nnamdi@student.orbitspace.academy',
    phone: '+234 810 000 1122',
    classId: 'cls-cybersecurity-2026',
    enrolledAt: '2026-01-22',
    status: 'active',
  },

  // Robotics Class
  {
    id: 'std-rb-01',
    name: 'Ifeanyi Kingsley Uche',
    matricNumber: 'ORB/2026/RB-001',
    email: 'ifeanyi.uche@student.orbitspace.academy',
    phone: '+234 811 111 2233',
    classId: 'cls-robotics-2026',
    enrolledAt: '2026-01-20',
    status: 'active',
  },
  {
    id: 'std-rb-02',
    name: 'Hauwa Fatima Mohammed',
    matricNumber: 'ORB/2026/RB-002',
    email: 'hauwa.mohammed@student.orbitspace.academy',
    phone: '+234 812 222 3344',
    classId: 'cls-robotics-2026',
    enrolledAt: '2026-01-20',
    status: 'active',
  },
  {
    id: 'std-rb-03',
    name: 'Samuel Oluwaseun Davies',
    matricNumber: 'ORB/2026/RB-003',
    email: 'samuel.davies@student.orbitspace.academy',
    phone: '+234 813 333 4455',
    classId: 'cls-robotics-2026',
    enrolledAt: '2026-01-22',
    status: 'active',
  },

  // UI/UX Class
  {
    id: 'std-ux-01',
    name: 'Simisola Michelle Coker',
    matricNumber: 'ORB/2026/UX-001',
    email: 'simi.coker@student.orbitspace.academy',
    phone: '+234 814 444 5566',
    classId: 'cls-uiux-2026',
    enrolledAt: '2026-01-20',
    status: 'active',
  },
  {
    id: 'std-ux-02',
    name: 'Efe Dennis Osagie',
    matricNumber: 'ORB/2026/UX-002',
    email: 'efe.osagie@student.orbitspace.academy',
    phone: '+234 815 555 6677',
    classId: 'cls-uiux-2026',
    enrolledAt: '2026-01-21',
    status: 'active',
  },
  {
    id: 'std-ux-03',
    name: 'Anuoluwapo Esther Alabi',
    matricNumber: 'ORB/2026/UX-003',
    email: 'anu.alabi@student.orbitspace.academy',
    phone: '+234 816 666 7788',
    classId: 'cls-uiux-2026',
    enrolledAt: '2026-01-22',
    status: 'active',
  },

  // Data Science Class
  {
    id: 'std-ds-01',
    name: 'Babatunde Victor Ogundipe',
    matricNumber: 'ORB/2026/DS-001',
    email: 'babatunde.ogundipe@student.orbitspace.academy',
    phone: '+234 817 777 8899',
    classId: 'cls-datascience-2026',
    enrolledAt: '2026-01-20',
    status: 'active',
  },
  {
    id: 'std-ds-02',
    name: 'Ngozi Clara Chidiebere',
    matricNumber: 'ORB/2026/DS-002',
    email: 'ngozi.chidiebere@student.orbitspace.academy',
    phone: '+234 818 888 9900',
    classId: 'cls-datascience-2026',
    enrolledAt: '2026-01-21',
    status: 'active',
  },
];

// Initial pre-seeded historical sessions for calculating initial percentages
export const DEFAULT_SESSIONS: AttendanceSession[] = [
  {
    id: 'ses-fs-01',
    classId: 'cls-fullstack-2026',
    date: '2026-09-07',
    sessionTopic: 'Architecture & State Management in Next.js/React',
    recordedBy: {
      name: 'Engr. Precious Ogunleye',
      role: 'Super Admin',
      email: 'preciousogunleye07@gmail.com',
    },
    studentAttendance: {
      'std-fs-01': 'present',
      'std-fs-02': 'present',
      'std-fs-03': 'present',
      'std-fs-04': 'late',
      'std-fs-05': 'present',
      'std-fs-06': 'absent',
    },
    teacherAttendance: {
      'tch-precious-ogunleye': 'present',
      'tch-marcus-okafor': 'present',
    },
    notes: 'Covered Context API vs Zustand and server actions.',
    createdAt: '2026-09-07T12:00:00.000Z',
    updatedAt: '2026-09-07T12:00:00.000Z',
  },
  {
    id: 'ses-fs-02',
    classId: 'cls-fullstack-2026',
    date: '2026-09-10',
    sessionTopic: 'Backend REST API Engineering & Express Middleware',
    recordedBy: {
      name: 'Engr. Precious Ogunleye',
      role: 'Super Admin',
      email: 'preciousogunleye07@gmail.com',
    },
    studentAttendance: {
      'std-fs-01': 'present',
      'std-fs-02': 'present',
      'std-fs-03': 'absent',
      'std-fs-04': 'present',
      'std-fs-05': 'present',
      'std-fs-06': 'present',
    },
    teacherAttendance: {
      'tch-precious-ogunleye': 'present',
      'tch-marcus-okafor': 'present',
    },
    notes: 'Students built their first token verification middleware.',
    createdAt: '2026-09-10T12:00:00.000Z',
    updatedAt: '2026-09-10T12:00:00.000Z',
  },
  {
    id: 'ses-fs-03',
    classId: 'cls-fullstack-2026',
    date: '2026-09-14',
    sessionTopic: 'Relational Database Schema Design & Drizzle ORM',
    recordedBy: {
      name: 'Marcus Okafor',
      role: 'Sub-Admin / Instructor',
      email: 'marcus.okafor@orbitspace.academy',
    },
    studentAttendance: {
      'std-fs-01': 'present',
      'std-fs-02': 'present',
      'std-fs-03': 'present',
      'std-fs-04': 'present',
      'std-fs-05': 'late',
      'std-fs-06': 'present',
    },
    teacherAttendance: {
      'tch-precious-ogunleye': 'present',
      'tch-marcus-okafor': 'present',
    },
    notes: 'Hands-on migration and joins practice.',
    createdAt: '2026-09-14T12:00:00.000Z',
    updatedAt: '2026-09-14T12:00:00.000Z',
  },
  {
    id: 'ses-fs-04',
    classId: 'cls-fullstack-2026',
    date: '2026-09-18',
    sessionTopic: 'Cloud Deployment, CI/CD Pipeline & Dockerization',
    recordedBy: {
      name: 'Engr. Precious Ogunleye',
      role: 'Super Admin',
      email: 'preciousogunleye07@gmail.com',
    },
    studentAttendance: {
      'std-fs-01': 'present',
      'std-fs-02': 'present',
      'std-fs-03': 'present',
      'std-fs-04': 'present',
      'std-fs-05': 'present',
      'std-fs-06': 'absent',
    },
    teacherAttendance: {
      'tch-precious-ogunleye': 'present',
      'tch-marcus-okafor': 'present',
    },
    notes: 'Live Cloud Run and Vercel container deployment.',
    createdAt: '2026-09-18T12:00:00.000Z',
    updatedAt: '2026-09-18T12:00:00.000Z',
  },

  // Cybersecurity Sessions
  {
    id: 'ses-cy-01',
    classId: 'cls-cybersecurity-2026',
    date: '2026-09-08',
    sessionTopic: 'Wireshark Packet Analysis & Network Reconnaissance',
    recordedBy: {
      name: 'Dr. Adebayo Vance',
      role: 'Sub-Admin / Instructor',
      email: 'adebayo.vance@orbitspace.academy',
    },
    studentAttendance: {
      'std-cy-01': 'present',
      'std-cy-02': 'present',
      'std-cy-03': 'present',
      'std-cy-04': 'late',
    },
    teacherAttendance: {
      'tch-adebayo-vance': 'present',
    },
    notes: 'Dissecting TCP handshake anomalies and syn flood defense.',
    createdAt: '2026-09-08T13:00:00.000Z',
    updatedAt: '2026-09-08T13:00:00.000Z',
  },
  {
    id: 'ses-cy-02',
    classId: 'cls-cybersecurity-2026',
    date: '2026-09-15',
    sessionTopic: 'OWASP Top 10 Web Exploitation & SQL Injection Hardening',
    recordedBy: {
      name: 'Dr. Adebayo Vance',
      role: 'Sub-Admin / Instructor',
      email: 'adebayo.vance@orbitspace.academy',
    },
    studentAttendance: {
      'std-cy-01': 'present',
      'std-cy-02': 'present',
      'std-cy-03': 'absent',
      'std-cy-04': 'present',
    },
    teacherAttendance: {
      'tch-adebayo-vance': 'present',
    },
    notes: 'Simulated CTF challenge on isolated lab boxes.',
    createdAt: '2026-09-15T13:00:00.000Z',
    updatedAt: '2026-09-15T13:00:00.000Z',
  },
];

const STORAGE_KEYS = {
  CLASSES: 'orbit_attendance_classes_v1',
  TEACHERS: 'orbit_attendance_teachers_v1',
  STUDENTS: 'orbit_attendance_students_v1',
  SESSIONS: 'orbit_attendance_sessions_v1',
};

// ==================== Storage Helper Functions ====================

export function getLocalClasses(): ClassGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading classes from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
  return DEFAULT_CLASSES;
}

export function saveLocalClasses(classes: ClassGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  } catch (e) {
    console.warn('Failed saving classes to localStorage', e);
  }
}

export function getLocalTeachers(): TeacherRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading teachers from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(DEFAULT_TEACHERS));
  return DEFAULT_TEACHERS;
}

export function saveLocalTeachers(teachers: TeacherRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  } catch (e) {
    console.warn('Failed saving teachers to localStorage', e);
  }
}

export function getLocalStudents(): StudentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading students from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
  return DEFAULT_STUDENTS;
}

export function saveLocalStudents(students: StudentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.warn('Failed saving students to localStorage', e);
  }
}

export function getLocalSessions(): AttendanceSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading sessions from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
  return DEFAULT_SESSIONS;
}

export function saveLocalSessions(sessions: AttendanceSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed saving sessions to localStorage', e);
  }
}

// ==================== Firestore Syncing ====================

export async function syncClassesFromFirestore(): Promise<ClassGroup[]> {
  try {
    const colRef = collection(db, 'attendance_classes');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map((d) => d.data() as ClassGroup);
      saveLocalClasses(items);
      return items;
    }
  } catch (err) {
    console.log('Firestore classes fetch fallback to local:', err);
  }
  return getLocalClasses();
}

export async function syncSessionsFromFirestore(): Promise<AttendanceSession[]> {
  try {
    const colRef = collection(db, 'attendance_sessions');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map((d) => d.data() as AttendanceSession);
      saveLocalSessions(items);
      return items;
    }
  } catch (err) {
    console.log('Firestore sessions fetch fallback to local:', err);
  }
  return getLocalSessions();
}

export async function syncTeachersFromFirestore(): Promise<TeacherRecord[]> {
  try {
    const colRef = collection(db, 'attendance_teachers');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map((d) => d.data() as TeacherRecord);
      saveLocalTeachers(items);
      return items;
    }
  } catch (err) {
    console.log('Firestore teachers fetch fallback to local:', err);
  }
  return getLocalTeachers();
}

export async function syncStudentsFromFirestore(): Promise<StudentRecord[]> {
  try {
    const colRef = collection(db, 'attendance_students');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map((d) => d.data() as StudentRecord);
      saveLocalStudents(items);
      return items;
    }
  } catch (err) {
    console.log('Firestore students fetch fallback to local:', err);
  }
  return getLocalStudents();
}

// ==================== Public Attendance Service Methods ====================

export const AttendanceService = {
  // --- Class Operations ---
  async getAllClasses(): Promise<ClassGroup[]> {
    return await syncClassesFromFirestore();
  },

  async saveClass(cls: ClassGroup): Promise<ClassGroup> {
    const classes = getLocalClasses();
    const index = classes.findIndex((c) => c.id === cls.id);
    if (index >= 0) {
      classes[index] = { ...cls, updatedAt: new Date().toISOString() };
    } else {
      classes.unshift(cls);
    }
    saveLocalClasses(classes);

    try {
      await setDoc(doc(db, 'attendance_classes', cls.id), cls);
    } catch (e) {
      console.warn('Firestore setDoc attendance_classes error, local updated', e);
    }
    return cls;
  },

  async deleteClass(classId: string): Promise<void> {
    const classes = getLocalClasses().filter((c) => c.id !== classId);
    saveLocalClasses(classes);

    try {
      await deleteDoc(doc(db, 'attendance_classes', classId));
    } catch (e) {
      console.warn('Firestore deleteDoc attendance_classes error, local updated', e);
    }
  },

  // --- Student Operations ---
  async getStudentsByClass(classId: string): Promise<StudentRecord[]> {
    const all = await syncStudentsFromFirestore();
    return all.filter((s) => s.classId === classId);
  },

  async getAllStudents(): Promise<StudentRecord[]> {
    return await syncStudentsFromFirestore();
  },

  async saveStudent(student: StudentRecord): Promise<StudentRecord> {
    const students = getLocalStudents();
    const idx = students.findIndex((s) => s.id === student.id);
    if (idx >= 0) {
      students[idx] = student;
    } else {
      students.push(student);
    }
    saveLocalStudents(students);

    try {
      await setDoc(doc(db, 'attendance_students', student.id), student);
    } catch (e) {
      console.warn('Firestore setDoc attendance_students error, local updated', e);
    }
    return student;
  },

  async deleteStudent(studentId: string): Promise<void> {
    const students = getLocalStudents().filter((s) => s.id !== studentId);
    saveLocalStudents(students);

    try {
      await deleteDoc(doc(db, 'attendance_students', studentId));
    } catch (e) {
      console.warn('Firestore deleteDoc attendance_students error, local updated', e);
    }
  },

  // --- Teacher Operations ---
  async getAllTeachers(): Promise<TeacherRecord[]> {
    return await syncTeachersFromFirestore();
  },

  async getTeachersForClass(classId: string): Promise<TeacherRecord[]> {
    const all = await syncTeachersFromFirestore();
    const cls = getLocalClasses().find((c) => c.id === classId);
    if (cls && cls.assignedTeacherIds) {
      return all.filter((t) => cls.assignedTeacherIds.includes(t.id) || t.assignedClassIds.includes(classId));
    }
    return all.filter((t) => t.assignedClassIds.includes(classId));
  },

  async saveTeacher(teacher: TeacherRecord): Promise<TeacherRecord> {
    const teachers = getLocalTeachers();
    const idx = teachers.findIndex((t) => t.id === teacher.id);
    if (idx >= 0) {
      teachers[idx] = teacher;
    } else {
      teachers.push(teacher);
    }
    saveLocalTeachers(teachers);

    try {
      await setDoc(doc(db, 'attendance_teachers', teacher.id), teacher);
    } catch (e) {
      console.warn('Firestore setDoc attendance_teachers error, local updated', e);
    }
    return teacher;
  },

  // --- Session & Attendance Operations ---
  async syncSessionsFromFirestore(): Promise<AttendanceSession[]> {
    return await syncSessionsFromFirestore();
  },

  async getAllSessions(): Promise<AttendanceSession[]> {
    return await syncSessionsFromFirestore();
  },

  async getSessionsByClass(classId: string): Promise<AttendanceSession[]> {
    const all = await syncSessionsFromFirestore();
    return all
      .filter((s) => s.classId === classId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async recordSession(session: AttendanceSession): Promise<AttendanceSession> {
    const sessions = getLocalSessions();
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = { ...session, updatedAt: new Date().toISOString() };
    } else {
      sessions.unshift(session);
    }
    saveLocalSessions(sessions);

    try {
      await setDoc(doc(db, 'attendance_sessions', session.id), session);
    } catch (e) {
      console.warn('Firestore setDoc attendance_sessions error, local updated', e);
    }
    return session;
  },

  async deleteSession(sessionId: string): Promise<void> {
    const sessions = getLocalSessions().filter((s) => s.id !== sessionId);
    saveLocalSessions(sessions);

    try {
      await deleteDoc(doc(db, 'attendance_sessions', sessionId));
    } catch (e) {
      console.warn('Firestore deleteDoc attendance_sessions error, local updated', e);
    }
  },

  // --- Statistics & Percentage Calculation Per Student ---
  calculateStudentStats(classId: string, students: StudentRecord[], sessions: AttendanceSession[]): StudentAttendanceStat[] {
    const classSessions = sessions.filter((s) => s.classId === classId);
    const totalSessions = classSessions.length;

    return students.map((student) => {
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;

      classSessions.forEach((session) => {
        const status = session.studentAttendance[student.id] || 'absent';
        if (status === 'present') presentCount++;
        else if (status === 'late') lateCount++;
        else if (status === 'excused') excusedCount++;
        else absentCount++;
      });

      // Attendance percentage: Present counts as 100%, Late counts as 75% punctuality credit or can be counted towards participation
      // Standard academic metric: (Present + Late * 0.75 + Excused * 0.5) / total or pure attendance (Present + Late) / total
      const effectivePresents = presentCount + lateCount;
      const attendancePercentage = totalSessions > 0 ? Math.round((effectivePresents / totalSessions) * 100) : 100;

      let complianceStatus: 'eligible' | 'warning' | 'critical' = 'eligible';
      if (attendancePercentage < 50) {
        complianceStatus = 'critical';
      } else if (attendancePercentage < 75) {
        complianceStatus = 'warning';
      }

      return {
        student,
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendancePercentage,
        complianceStatus,
      };
    });
  },

  // --- Teacher Attendance Statistics ---
  calculateTeacherStats(classId: string, teachers: TeacherRecord[], sessions: AttendanceSession[]): TeacherAttendanceStat[] {
    const classSessions = sessions.filter((s) => s.classId === classId);
    const totalSessions = classSessions.length;

    return teachers.map((teacher) => {
      let presentCount = 0;
      let absentCount = 0;

      classSessions.forEach((session) => {
        const status = session.teacherAttendance[teacher.id];
        if (status === 'present' || status === 'late') {
          presentCount++;
        } else if (status === 'absent') {
          absentCount++;
        }
      });

      const attendancePercentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

      return {
        teacher,
        totalSessions,
        presentCount,
        absentCount,
        attendancePercentage,
      };
    });
  },

  // --- Export to CSV ---
  generateAttendanceCSV(className: string, stats: StudentAttendanceStat[], sessions: AttendanceSession[]): string {
    const headers = [
      'Student Name',
      'Matriculation No',
      'Email',
      'Total Sessions Held',
      'Present Count',
      'Late Count',
      'Absent Count',
      'Excused Count',
      'Attendance Percentage (%)',
      'Status Recommendation',
    ];

    const rows = stats.map((item) => [
      `"${item.student.name}"`,
      `"${item.student.matricNumber}"`,
      `"${item.student.email}"`,
      item.totalSessions,
      item.presentCount,
      item.lateCount,
      item.absentCount,
      item.excusedCount,
      `${item.attendancePercentage}%`,
      `"${item.complianceStatus.toUpperCase()}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  // ==================== Course -> Cohort -> Session Database Operations ====================

  /**
   * Generates a deterministic, unique class_session_id
   * e.g. "cybersecurity_cohort-3_2026-09-20"
   */
  generateClassSessionId(course: string, cohort: string, date: string): string {
    const slugCourse = (course || 'course').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const cleanCohort = (cohort || '1').toLowerCase().replace(/^cohort\s*/i, '').replace(/[^a-z0-9]+/g, '-');
    const slugCohort = `cohort-${cleanCohort || '1'}`;
    const cleanDate = (date || new Date().toISOString().split('T')[0]).trim();
    return `${slugCourse}_${slugCohort}_${cleanDate}`;
  },

  /**
   * Fetches all real students from the existing database (SheetDB + Firestore).
   * Maps all registration fields directly:
   * Matric Number, Full Name, Email Address, Phone Number, Gender, Program 1 / Course.
   */
  async fetchRealStudents(forceRefresh: boolean = false): Promise<StudentRecord[]> {
    const CACHE_KEY = 'orbit_real_students_cache_v4';
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }

    try {
      const sheetStudents = await fetchSheetDBStudents(false);
      if (sheetStudents && sheetStudents.length > 0) {
        const studentMap = new Map<string, StudentRecord>();

        sheetStudents
          .filter((s) => s.fullName && s.fullName.trim().length > 0)
          .forEach((s, idx) => {
            const sid = (s.studentId && s.studentId.trim()) || `STU-${String(idx + 1).padStart(5, '0')}`;
            const key = sid.toUpperCase();
            if (!studentMap.has(key)) {
              studentMap.set(key, {
                id: sid,
                student_id: sid,
                name: s.fullName.trim(),
                matricNumber: s.matricNumber || `ORB/2026/${String(idx + 1).padStart(4, '0')}`,
                email: s.email || '',
                phone: s.phone || '',
                gender: s.gender || 'Not Specified',
                course: s.program || (s.programs && s.programs[0]) || 'Frontend Development',
                cohort: s.cohort || '3',
                status: (s.studentStatus && s.studentStatus.toLowerCase() === 'inactive') ? 'suspended' : 'active',
                enrolledAt: s.registrationDate || new Date().toISOString(),
              });
            }
          });

        const mapped: StudentRecord[] = Array.from(studentMap.values());

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
        } catch (e) {}

        // Sync real students into Firestore collection attendance_students
        try {
          mapped.slice(0, 30).forEach((st) => {
            setDoc(doc(db, 'attendance_students', st.id), st).catch(() => {});
          });
        } catch (e) {}

        return mapped;
      }
    } catch (err) {
      console.warn('SheetDB student fetch error, trying Firestore sync:', err);
    }

    // Fallback to Firestore attendance_students or official students
    try {
      const snap = await getDocs(collection(db, 'attendance_students'));
      if (!snap.empty) {
        const firestoreStudents = snap.docs.map((d) => d.data() as StudentRecord);
        if (firestoreStudents.length > 0) {
          return firestoreStudents;
        }
      }
    } catch (err) {
      console.warn('Firestore students fallback error:', err);
    }

    return OFFICIAL_ORBIT_STUDENTS;
  },

  /**
   * Helper to resolve the assigned tutor for any program/class
   */
  getAssignedTutorForProgram(programName: string): {
    id: string;
    name: string;
    email: string;
    phone?: string;
    specialization?: string;
  } {
    const tutor = TutorService.getAssignedTutorForProgram(programName);
    return {
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      phone: tutor.phone,
      specialization: tutor.specialization,
    };
  },

  /**
   * Automatically groups all registered students by their Program 1 / Class.
   * When students are registered or updated in the registration data, this groups them automatically.
   */
  async getAutomaticClassGroups(): Promise<
    Array<{
      program: string;
      studentCount: number;
      tutor: { id: string; name: string; email: string; phone?: string; specialization?: string };
      students: StudentRecord[];
    }>
  > {
    const allStudents = await this.fetchRealStudents();
    const map = new Map<string, StudentRecord[]>();

    allStudents.forEach((student) => {
      const prog = (student.course && student.course.trim()) || 'General Track';
      if (!map.has(prog)) {
        map.set(prog, []);
      }
      map.get(prog)!.push(student);
    });

    const groups: Array<{
      program: string;
      studentCount: number;
      tutor: { id: string; name: string; email: string; phone?: string; specialization?: string };
      students: StudentRecord[];
    }> = [];

    for (const [program, studentsList] of map.entries()) {
      const tutor = this.getAssignedTutorForProgram(program);
      groups.push({
        program,
        studentCount: studentsList.length,
        tutor,
        students: studentsList.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }

    return groups.sort((a, b) => a.program.localeCompare(b.program));
  },

  /**
   * Register a new student into Firestore (attendance_students) and Google Sheet (SheetDB)
   */
  async registerStudentRecord(newStudent: {
    name: string;
    email: string;
    phone?: string;
    matricNumber?: string;
    studentId?: string;
    course: string;
    cohort?: string;
    gender?: string;
  }): Promise<StudentRecord> {
    const existing = await this.fetchRealStudents();
    const nextIdx = existing.length + 1;
    const studentId = newStudent.studentId?.trim() || `STU-${String(nextIdx).padStart(5, '0')}`;
    const matricNumber = newStudent.matricNumber?.trim() || `ORB/2026/${String(nextIdx).padStart(4, '0')}`;
    const cohort = newStudent.cohort?.trim() || '3';

    const record: StudentRecord = {
      id: studentId,
      student_id: studentId,
      name: newStudent.name.trim(),
      matricNumber,
      email: newStudent.email.trim(),
      phone: newStudent.phone?.trim() || '',
      course: newStudent.course.trim(),
      cohort,
      status: 'active',
      enrolledAt: new Date().toISOString().split('T')[0],
    };

    // 1. Save directly to Firestore attendance_students
    try {
      await setDoc(doc(db, 'attendance_students', record.id), record);
    } catch (e) {
      console.warn('Could not save student to Firestore attendance_students:', e);
    }

    // 2. Also register to Google Sheet / SheetDB in background
    try {
      const { addStudentToSheetDB } = await import('./sheetdbService');
      addStudentToSheetDB({
        studentId: record.id,
        matricNumber: record.matricNumber,
        fullName: record.name,
        email: record.email,
        phone: record.phone || '',
        program: record.course,
        cohort: record.cohort,
        gender: newStudent.gender || 'Other',
        studentStatus: 'Active',
        paymentStatus: 'Paid',
      }).catch((e) => console.warn('Background SheetDB add student error:', e));
    } catch (e) {
      // ignore
    }

    // 3. Clear local storage cache so next fetch reflects new student immediately
    try {
      localStorage.removeItem('orbit_real_students_cache_v3');
      localStorage.removeItem('orbit_space_sheetdb_cached_students_v1');
    } catch (e) {}

    return record;
  },

  /**
   * Get unique courses derived directly from real enrolled database students
   */
  async getAvailableRealCourses(): Promise<string[]> {
    const students = await this.fetchRealStudents();
    const courseSet = new Set<string>();
    students.forEach((s) => {
      if (s.course && s.course.trim()) {
        courseSet.add(s.course.trim());
      }
    });

    if (courseSet.size === 0) {
      return [
        'Cybersecurity',
        'AI Automation',
        'UI/UX Design',
        'Backend Development',
        'Full Stack Development',
        'Data Analysis',
        'Content Creation, Mobile Photography & Videography',
      ];
    }
    return Array.from(courseSet).sort();
  },

  /**
   * Get unique cohorts derived directly from real enrolled database students
   */
  async getAvailableRealCohorts(course?: string): Promise<string[]> {
    const students = await this.fetchRealStudents();
    const cohortSet = new Set<string>();

    students.forEach((s) => {
      if (!course || this.isStudentEnrolledInCourse(s, course)) {
        const raw = s.cohort ? s.cohort.toString().trim() : '';
        if (raw) {
          const num = raw.replace(/[^0-9]/g, '');
          cohortSet.add(num ? `Cohort ${num}` : raw);
        }
      }
    });

    if (cohortSet.size === 0) {
      return ['Cohort 3', 'Cohort 4'];
    }
    return Array.from(cohortSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  },

  isStudentEnrolledInCourse(student: StudentRecord, course: string): boolean {
    if (!course) return true;
    const cNorm = course.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sNorm = (student.course || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return sNorm.includes(cNorm) || cNorm.includes(sNorm);
  },

  isStudentInCohort(student: StudentRecord, cohort: string): boolean {
    if (!cohort) return true;
    const cNum = cohort.replace(/[^0-9]/g, '');
    const sNum = (student.cohort || '').toString().replace(/[^0-9]/g, '');
    if (cNum && sNum) return cNum === sNum;
    return (student.cohort || '').toLowerCase().trim() === cohort.toLowerCase().trim();
  },

  /**
   * Automatically fetch all students registered/enrolled for that course and cohort from database
   */
  async getEnrolledStudents(course: string, cohort: string): Promise<StudentRecord[]> {
    const all = await this.fetchRealStudents();
    const filtered = all.filter((s) => {
      const matchesCourse = this.isStudentEnrolledInCourse(s, course);
      const matchesCohort = this.isStudentInCohort(s, cohort);
      return matchesCourse && matchesCohort;
    });

    const targetList = (filtered.length === 0 && course)
      ? all.filter((s) => this.isStudentEnrolledInCourse(s, course))
      : filtered;

    // Strict deduplication by ID
    const uniqueMap = new Map<string, StudentRecord>();
    targetList.forEach((s) => {
      const key = (s.id || s.student_id || s.name).trim().toUpperCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, s);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Loads existing attendance session for Course -> Cohort -> Date
   * If attendance already exists, loads it so admin can edit without creating duplicates!
   */
  async getSessionAttendance(course: string, cohort: string, date: string): Promise<ClassSessionRecord | null> {
    const sessionId = this.generateClassSessionId(course, cohort, date);

    // 1. Try Firestore class_sessions
    try {
      const snap = await getDoc(doc(db, 'class_sessions', sessionId));
      if (snap.exists()) {
        const d = snap.data() as ClassSessionRecord;
        if (!d.tutor) {
          d.tutor = this.getAssignedTutorForProgram(d.course || course);
        }
        return d;
      }
    } catch (e) {
      console.warn('Firestore getDoc class_sessions check:', e);
    }

    // 2. Try Firestore attendance_sessions
    try {
      const snap2 = await getDoc(doc(db, 'attendance_sessions', sessionId));
      if (snap2.exists()) {
        const d = snap2.data();
        const tutor = d.tutor || this.getAssignedTutorForProgram(d.course || course);
        return {
          class_session_id: sessionId,
          course: d.course || course,
          cohort: d.cohort || cohort,
          date: d.date || date,
          session_topic: d.session_topic || d.sessionTopic || '',
          tutor,
          tutor_attendance: d.tutor_attendance || 'present',
          student_attendance: d.student_attendance || d.studentAttendance || {},
          total_students: d.total_students || 0,
          present_count: d.present_count || 0,
          absent_count: d.absent_count || 0,
          late_count: d.late_count || 0,
          excused_count: d.excused_count || 0,
          recorded_by: d.recorded_by || d.recordedBy || { name: 'Admin', email: '', role: 'Administrator' },
          created_at: d.created_at || d.createdAt || new Date().toISOString(),
          updated_at: d.updated_at || d.updatedAt || new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('Firestore getDoc attendance_sessions fallback:', e);
    }

    // 3. Try LocalStorage fallback
    try {
      const raw = localStorage.getItem(`orbit_session_${sessionId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.tutor) {
          parsed.tutor = this.getAssignedTutorForProgram(parsed.course || course);
        }
        return parsed;
      }
    } catch (e) {}

    return null;
  },

  /**
   * Saves attendance directly to the database.
   * Links to student_id and class_session_id.
   */
  async saveClassSessionAttendance(
    session: ClassSessionRecord,
    students: StudentRecord[]
  ): Promise<{ success: boolean; session: ClassSessionRecord; recordsSaved: number }> {
    const sessionId = session.class_session_id;
    const tutor = session.tutor || this.getAssignedTutorForProgram(session.course);

    // Calculate summary counts
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    students.forEach((st) => {
      const status = session.student_attendance[st.id] || 'present';
      if (status === 'present') present++;
      else if (status === 'late') late++;
      else if (status === 'absent') absent++;
      else if (status === 'excused') excused++;
    });

    // Calculate duration from Check-in / Check-out if provided
    const durationHours = (session.tutor_check_in_time && session.tutor_check_out_time)
      ? this.calculateHoursBetween(session.tutor_check_in_time, session.tutor_check_out_time)
      : (session.duration_hours || 0);

    const checkInStatus = session.check_in_status || 
      (session.tutor_check_out_time ? 'completed' : session.tutor_check_in_time ? 'checked_in' : 'not_started');

    const enrichedSession: ClassSessionRecord = {
      ...session,
      tutor,
      tutor_attendance: session.tutor_attendance || 'present',
      tutor_check_in_time: session.tutor_check_in_time,
      tutor_check_out_time: session.tutor_check_out_time,
      duration_hours: durationHours,
      check_in_status: checkInStatus,
      total_students: students.length,
      present_count: present,
      absent_count: absent,
      late_count: late,
      excused_count: excused,
      updated_at: new Date().toISOString(),
    };

    // Cache locally immediately
    try {
      localStorage.setItem(`orbit_session_${sessionId}`, JSON.stringify(enrichedSession));
      const allSessionsRaw = localStorage.getItem('orbit_all_class_sessions_v2') || '[]';
      const allSessions: ClassSessionRecord[] = JSON.parse(allSessionsRaw);
      const existIdx = allSessions.findIndex((s) => s.class_session_id === sessionId);
      if (existIdx >= 0) {
        allSessions[existIdx] = enrichedSession;
      } else {
        allSessions.unshift(enrichedSession);
      }
      localStorage.setItem('orbit_all_class_sessions_v2', JSON.stringify(allSessions));
    } catch (e) {}

    // Save to Firestore collections: class_sessions & attendance_sessions
    try {
      await setDoc(doc(db, 'class_sessions', sessionId), enrichedSession);
      await setDoc(doc(db, 'attendance_sessions', sessionId), enrichedSession);

      // Save individual records for each student: attendance_records/${sessionId}_${student_id}
      const recordPromises = students.map((st) => {
        const recordId = `${sessionId}_${st.id}`;
        const recordData: StudentAttendanceItem = {
          id: recordId,
          class_session_id: sessionId,
          student_id: st.id,
          student_name: st.name,
          matric_number: st.matricNumber,
          course: session.course,
          cohort: session.cohort,
          date: session.date,
          status: session.student_attendance[st.id] || 'present',
          updated_at: new Date().toISOString(),
        };
        return setDoc(doc(db, 'attendance_records', recordId), recordData).catch((err) => {
          console.warn(`Failed writing record ${recordId}:`, err);
        });
      });

      await Promise.allSettled(recordPromises);
    } catch (err) {
      console.error('Firestore save attendance error:', err);
    }

    return {
      success: true,
      session: enrichedSession,
      recordsSaved: students.length,
    };
  },

  /**
   * Retrieves all recorded sessions for a specific Course and Cohort
   */
  async getAllSessionsForCourseAndCohort(course: string, cohort: string): Promise<ClassSessionRecord[]> {
    const list: ClassSessionRecord[] = [];
    const sessionIdPrefix = `${(course || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}_cohort-${(cohort || '').replace(/[^0-9]/g, '')}`;

    try {
      const snap = await getDocs(collection(db, 'class_sessions'));
      snap.forEach((d) => {
        const data = d.data() as ClassSessionRecord;
        if (
          (data.course && this.isCourseMatch(data.course, course) && this.isCohortMatch(data.cohort, cohort)) ||
          (data.class_session_id && data.class_session_id.startsWith(sessionIdPrefix))
        ) {
          list.push(data);
        }
      });
    } catch (e) {
      console.warn('Error reading class_sessions:', e);
    }

    // Check local storage for any sessions
    try {
      const local = localStorage.getItem('orbit_all_class_sessions_v2');
      if (local) {
        const parsed: ClassSessionRecord[] = JSON.parse(local);
        parsed.forEach((p) => {
          if (
            (this.isCourseMatch(p.course, course) && this.isCohortMatch(p.cohort, cohort)) &&
            !list.some((item) => item.class_session_id === p.class_session_id)
          ) {
            list.push(p);
          }
        });
      }
    } catch (e) {}

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  isCourseMatch(c1: string, c2: string): boolean {
    if (!c1 || !c2) return false;
    const n1 = c1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const n2 = c2.toLowerCase().replace(/[^a-z0-9]/g, '');
    return n1.includes(n2) || n2.includes(n1);
  },

  isCohortMatch(co1: string, co2: string): boolean {
    if (!co1 || !co2) return false;
    const n1 = co1.replace(/[^0-9]/g, '');
    const n2 = co2.replace(/[^0-9]/g, '');
    if (n1 && n2) return n1 === n2;
    return co1.toLowerCase().trim() === co2.toLowerCase().trim();
  },

  /**
   * Computes attendance history and percentage for each student in the course/cohort
   */
  computeStudentAttendanceStats(
    students: StudentRecord[],
    sessions: ClassSessionRecord[]
  ): Record<
    string,
    {
      total: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
      percentage: number;
      history: Array<{ date: string; session_id: string; status: AttendanceStatus; topic?: string }>;
    }
  > {
    const stats: Record<string, any> = {};

    students.forEach((st) => {
      let present = 0;
      let absent = 0;
      let late = 0;
      let excused = 0;
      const history: Array<{ date: string; session_id: string; status: AttendanceStatus; topic?: string }> = [];

      sessions.forEach((sess) => {
        const status = sess.student_attendance[st.id];
        if (status) {
          if (status === 'present') present++;
          else if (status === 'late') late++;
          else if (status === 'absent') absent++;
          else if (status === 'excused') excused++;

          history.push({
            date: sess.date,
            session_id: sess.class_session_id,
            status,
            topic: sess.session_topic,
          });
        }
      });

      const total = sessions.length;
      const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

      stats[st.id] = {
        total,
        present,
        absent,
        late,
        excused,
        percentage,
        history: history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      };
    });

    return stats;
  },

  /**
   * Calculates teaching hours between check-in and check-out times.
   * Formula: Teaching Hours = Check-out time - Check-in time
   */
  calculateHoursBetween(start?: string, end?: string): number {
    if (!start || !end) return 0;

    // 1. Try parsing full ISO timestamps
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const diffMs = endDate.getTime() - startDate.getTime();
      if (diffMs <= 0) return 0;
      const hours = diffMs / (1000 * 60 * 60);
      return Math.round(hours * 10) / 10;
    }

    // 2. Try parsing 12-hour or 24-hour time strings (e.g. "09:30 AM", "12:00 PM", "14:30")
    const parseTimeToMinutes = (t: string): number | null => {
      const trimmed = t.trim();
      const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (!match12) return null;
      let hrs = parseInt(match12[1], 10);
      const mins = parseInt(match12[2], 10);
      const ampm = match12[3]?.toUpperCase();
      if (ampm === 'PM' && hrs < 12) hrs += 12;
      if (ampm === 'AM' && hrs === 12) hrs = 0;
      return hrs * 60 + mins;
    };

    const sMin = parseTimeToMinutes(start);
    const eMin = parseTimeToMinutes(end);
    if (sMin !== null && eMin !== null) {
      let diffMin = eMin - sMin;
      if (diffMin <= 0) return 0;
      return Math.round((diffMin / 60) * 10) / 10;
    }

    return 0;
  },

  /**
   * Retrieves all recorded class sessions across both Firestore and LocalStorage
   */
  async getAllClassSessions(): Promise<ClassSessionRecord[]> {
    const map = new Map<string, ClassSessionRecord>();

    // 1. Local storage records
    try {
      const local = localStorage.getItem('orbit_all_class_sessions_v2');
      if (local) {
        const parsed: ClassSessionRecord[] = JSON.parse(local);
        parsed.forEach((s) => map.set(s.class_session_id, s));
      }
    } catch (e) {}

    // 2. Firestore records
    try {
      const snap = await getDocs(collection(db, 'class_sessions'));
      snap.forEach((d) => {
        const s = d.data() as ClassSessionRecord;
        if (s && s.class_session_id) {
          map.set(s.class_session_id, s);
        }
      });
    } catch (e) {
      console.warn('Firestore getAllClassSessions fallback:', e);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  /**
   * Retrieves all class sessions taught by a specific tutor
   */
  async getClassSessionsForTutor(tutorIdOrName: string): Promise<ClassSessionRecord[]> {
    const all = await this.getAllClassSessions();
    const query = tutorIdOrName.toLowerCase().trim();
    return all.filter((s) => {
      const tutorId = (s.tutor?.id || '').toLowerCase().trim();
      const tutorName = (s.tutor?.name || '').toLowerCase().trim();
      return tutorId === query || tutorName.includes(query) || query.includes(tutorName);
    });
  },

  /**
   * Retrieves unique real students taught by a tutor across all classes and sessions
   */
  async getStudentsTaughtByTutor(
    tutorId: string,
    tutorPrograms: string[]
  ): Promise<StudentRecord[]> {
    const allStudents = await this.fetchRealStudents();
    const sessions = await this.getClassSessionsForTutor(tutorId);

    const studentIdSet = new Set<string>();
    const result: StudentRecord[] = [];

    // 1. Students in sessions where this tutor taught and student was marked present/late/excused
    sessions.forEach((sess) => {
      if (sess.student_attendance) {
        Object.entries(sess.student_attendance).forEach(([stId, status]) => {
          if (status === 'present' || status === 'late' || status === 'excused') {
            studentIdSet.add(stId);
          }
        });
      }
    });

    // 2. Students enrolled in tutor's assigned programs
    allStudents.forEach((st) => {
      const matchesProgram = tutorPrograms.some(
        (p) => this.isCourseMatch(st.course, p)
      );
      if (matchesProgram || studentIdSet.has(st.id) || (st.student_id && studentIdSet.has(st.student_id))) {
        if (!studentIdSet.has(st.id)) {
          studentIdSet.add(st.id);
        }
        result.push(st);
      }
    });

    // Deduplicate by ID
    const uniqueMap = new Map<string, StudentRecord>();
    result.forEach((st) => {
      if (!uniqueMap.has(st.id)) {
        uniqueMap.set(st.id, st);
      }
    });

    return Array.from(uniqueMap.values());
  },
};
