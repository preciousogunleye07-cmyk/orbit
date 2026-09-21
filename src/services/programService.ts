import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { COURSES_DATA } from '../data/coursesData';
import { Course } from '../types';
import { isAdminAuthenticated, getCertificates } from './certificateService';
import { TutorService } from './tutorService';
import { getLocalClasses, getLocalStudents } from './attendanceService';
import { getLocalTimetableSlots } from './timetableService';

export interface ProgramRecord {
  id: string;
  title: string;
  description: string;
  category: 'security' | 'data' | 'development' | 'design' | 'ai' | 'creative' | 'media' | 'engineering' | 'automation';
  duration: string;
  level: string;
  schedule: string;
  badge?: string;
  iconName: string;
  priceFormatted: string;
  curriculum: string[];
  careerOutcomes: string[];
  imageUrl?: string;
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
  updatedAt: string;
  isCustom?: boolean;
}

const PROGRAMS_STORAGE_KEY = 'orbit_space_programs_v1';

// Seed default programs from COURSES_DATA
function getDefaultPrograms(): ProgramRecord[] {
  return COURSES_DATA.map((c: Course) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category as ProgramRecord['category'],
    duration: c.duration,
    level: c.level,
    schedule: c.schedule,
    badge: c.badge,
    iconName: c.iconName,
    priceFormatted: c.priceFormatted,
    curriculum: c.curriculum || [],
    careerOutcomes: c.careerOutcomes || [],
    imageUrl: c.imageUrl,
    status: 'active',
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date('2026-01-01').toISOString(),
    isCustom: false
  }));
}

let programsMemoryCache: ProgramRecord[] | null = null;
const programListeners = new Set<(programs: ProgramRecord[]) => void>();

export const ProgramService = {
  /**
   * Get all programs (active, archived, draft)
   */
  getAllPrograms(): ProgramRecord[] {
    if (programsMemoryCache && programsMemoryCache.length > 0) {
      return programsMemoryCache;
    }

    try {
      const raw = localStorage.getItem(PROGRAMS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, ProgramRecord>();
          getDefaultPrograms().forEach(p => map.set(p.id, p));
          parsed.forEach((p: ProgramRecord) => {
            if (p && p.id) {
              const existing = map.get(p.id);
              map.set(p.id, { ...existing, ...p });
            }
          });
          programsMemoryCache = Array.from(map.values());
          return programsMemoryCache;
        }
      }
    } catch (e) {
      console.warn('Could not read programs from storage:', e);
    }

    programsMemoryCache = getDefaultPrograms();
    return programsMemoryCache;
  },

  /**
   * Get only active programs for public-facing courses page & enrollment
   */
  getActivePrograms(): ProgramRecord[] {
    return this.getAllPrograms().filter(p => p.status === 'active');
  },

  /**
   * Get program by ID
   */
  getProgramById(id: string): ProgramRecord | undefined {
    return this.getAllPrograms().find(p => p.id === id || p.title.toLowerCase() === id.toLowerCase());
  },

  /**
   * Subscribe to real-time program updates
   */
  subscribePrograms(callback: (programs: ProgramRecord[]) => void): () => void {
    programListeners.add(callback);
    callback(this.getAllPrograms());

    if (isFirebaseConfigured() && db) {
      try {
        const colRef = collection(db, 'programs');
        const unsub = onSnapshot(colRef, (snapshot) => {
          if (!snapshot.empty) {
            const map = new Map<string, ProgramRecord>();
            getDefaultPrograms().forEach(p => map.set(p.id, p));
            snapshot.docs.forEach((docSnap) => {
              const data = docSnap.data() as ProgramRecord;
              if (data && data.id) {
                map.set(data.id, { ...map.get(data.id), ...data });
              }
            });
            programsMemoryCache = Array.from(map.values());
            try {
              localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(programsMemoryCache));
            } catch {}
            programListeners.forEach(cb => cb(programsMemoryCache!));
          }
        }, (err) => {
          console.warn('Programs snapshot listener error:', err);
        });

        return () => {
          programListeners.delete(callback);
          unsub();
        };
      } catch (err) {
        console.warn('Firebase programs subscription error:', err);
      }
    }

    return () => {
      programListeners.delete(callback);
    };
  },

  /**
   * Save, add or edit a program
   */
  async saveProgram(program: Partial<ProgramRecord> & { title: string }): Promise<ProgramRecord> {
    if (!isAdminAuthenticated()) {
      throw new Error('Unauthorized: Admin access required to manage programs.');
    }

    const all = this.getAllPrograms();
    const id = program.id || program.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    const existingIndex = all.findIndex(p => p.id === id);
    const existing = existingIndex >= 0 ? all[existingIndex] : null;

    const fullRecord: ProgramRecord = {
      id,
      title: program.title.trim(),
      description: program.description || 'Professional tech track at Orbit Space Academia.',
      category: program.category || 'development',
      duration: program.duration || '10 Weeks',
      level: program.level || 'Beginner to Advanced',
      schedule: program.schedule || 'Flexible schedules',
      badge: program.badge || 'Professional',
      iconName: program.iconName || 'BookOpen',
      priceFormatted: program.priceFormatted || '₦165,000',
      curriculum: program.curriculum || [],
      careerOutcomes: program.careerOutcomes || [],
      imageUrl: program.imageUrl || existing?.imageUrl,
      status: program.status || existing?.status || 'active',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      isCustom: existing ? existing.isCustom : true
    };

    let updatedList: ProgramRecord[];
    if (existingIndex >= 0) {
      updatedList = [...all];
      updatedList[existingIndex] = fullRecord;
    } else {
      updatedList = [fullRecord, ...all];
    }

    programsMemoryCache = updatedList;
    try {
      localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch {}

    programListeners.forEach(cb => cb(updatedList));

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'programs', fullRecord.id), fullRecord, { merge: true });
      } catch (e) {
        console.warn('Notice saving program to Firestore:', e);
      }
    }

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('orbit-programs-updated', { detail: fullRecord }));
    return fullRecord;
  },

  /**
   * Archive or Deactivate a Program (Recommended over hard deletion to maintain historical certificates and attendance)
   */
  async setProgramStatus(id: string, status: 'active' | 'archived'): Promise<ProgramRecord> {
    if (!isAdminAuthenticated()) {
      throw new Error('Unauthorized: Admin access required.');
    }

    const prog = this.getProgramById(id);
    if (!prog) throw new Error('Program not found.');

    return this.saveProgram({
      ...prog,
      status
    });
  },

  /**
   * Check dependencies for a program before deletion
   */
  async checkProgramDependencies(id: string, title: string): Promise<{
    attachedTutors: string[];
    attachedStudentsCount: number;
    attachedStudents: string[];
    hasCertificates: boolean;
    certificatesCount: number;
    hasTimetableSlots: boolean;
    timetableSlotsCount: number;
  }> {
    const normTitle = title.toLowerCase().trim();
    const normId = id.toLowerCase().trim();

    // 1. Attached Tutors
    const tutors = TutorService.getAllTutors();
    const attachedTutors: string[] = [];
    tutors.forEach(t => {
      const match = t.programs.some(p => {
        const np = p.toLowerCase().trim();
        return np === normTitle || np === normId || normTitle.includes(np) || np.includes(normTitle);
      });
      if (match) {
        attachedTutors.push(t.name);
      }
    });

    // 2. Attached Classes & Students
    const classes = getLocalClasses();
    const matchedClassIds = new Set<string>();
    classes.forEach(c => {
      const nc = c.name.toLowerCase().trim();
      const ncat = (c.category || '').toLowerCase().trim();
      if (nc === normTitle || nc.includes(normTitle) || normTitle.includes(nc) || ncat.includes(normTitle)) {
        matchedClassIds.add(c.id);
      }
    });

    const students = getLocalStudents();
    const attachedStudents: string[] = [];
    students.forEach(s => {
      if (matchedClassIds.has(s.classId)) {
        attachedStudents.push(s.name);
      }
    });

    // 3. Certificates Issued
    const certificates = getCertificates();
    const matchedCerts = certificates.filter(c => {
      const courseNorm = (c.course || '').toLowerCase().trim();
      return courseNorm === normTitle || courseNorm.includes(normTitle) || normTitle.includes(courseNorm);
    });

    // 4. Timetable Slots
    const slots = getLocalTimetableSlots();
    const matchedSlots = slots.filter(s => {
      const slotCourse = (s.course || '').toLowerCase().trim();
      return slotCourse === normTitle || slotCourse.includes(normTitle) || normTitle.includes(slotCourse);
    });

    return {
      attachedTutors,
      attachedStudentsCount: attachedStudents.length,
      attachedStudents: attachedStudents.slice(0, 10),
      hasCertificates: matchedCerts.length > 0,
      certificatesCount: matchedCerts.length,
      hasTimetableSlots: matchedSlots.length > 0,
      timetableSlotsCount: matchedSlots.length
    };
  },

  /**
   * Permanently delete program (with safety guard)
   */
  async deleteProgram(id: string): Promise<boolean> {
    if (!isAdminAuthenticated()) {
      throw new Error('Unauthorized: Admin access required.');
    }

    const all = this.getAllPrograms();
    const filtered = all.filter(p => p.id !== id);

    programsMemoryCache = filtered;
    try {
      localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(filtered));
    } catch {}

    programListeners.forEach(cb => cb(filtered));

    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'programs', id));
      } catch (e) {
        console.warn('Notice deleting program from Firestore:', e);
      }
    }

    window.dispatchEvent(new Event('storage'));
    return true;
  }
};
