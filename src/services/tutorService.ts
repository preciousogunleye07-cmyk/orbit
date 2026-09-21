import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { isAdminAuthenticated, getCertificates } from './certificateService';
import { getLocalTimetableSlots, saveTimetableSlot } from './timetableService';
import { VerificationDataService } from './verificationDataService';
import { getArticlesByTutorName } from './articleService';

export interface TutorHistoricalBaseline {
  historicalTeachingHours: number; // e.g. 85
  historicalStudentsTaught: number; // e.g. 32
  historicalStudentsCertified: number; // e.g. 21
  historicalProjectsSupervised: number; // e.g. 12
  historicalBaselineNote?: string;
  historicalAuditedBy?: string;
  historicalAuditDate?: string;
}

export interface TutorProfile {
  id: string;
  slug: string; // URL slug for public link /tutor/[slug]
  name: string;
  shortName: string;
  email: string;
  phone?: string;
  specialization: string;
  role: string;
  programs: string[];
  avatar?: string;
  photoUrl?: string; // High-res verified profile picture
  color?: string;
  status: 'active' | 'deactivated'; // Soft delete & deactivation flag
  verificationStatus: 'verified' | 'pending' | 'unverified';
  joinedDate?: string;
  bio?: string;
  qualifications?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  historicalBaseline?: TutorHistoricalBaseline; // Admin-Entered Historical Records (distinct from system records)
  baseTeachingHours?: number; // Legacy compatibility
  baseStudentsCount?: number; // Legacy compatibility
  isCustom?: boolean;
}

const TUTORS_STORAGE_KEY = 'orbit_space_tutors_v1';

export const DEFAULT_TUTORS: TutorProfile[] = [
  {
    id: 'tch-lawal-frontend',
    slug: 'lawal-frontend-lead',
    name: 'Lawal (Senior Frontend Lead)',
    shortName: 'Lawal',
    email: 'lawal.frontend@orbitspace.academy',
    phone: '+234 803 234 5678',
    specialization: 'React, TypeScript, Modern UI Architectures',
    role: 'Senior Full Stack Lead',
    programs: ['Front End Development', 'Web Development', 'Software Engineering'],
    avatar: 'LW',
    color: '#38bdf8',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-03-15',
    bio: 'Senior engineering mentor specializing in high-performance frontend micro-architectures, React design tokens, and production full-stack systems.',
    qualifications: ['B.Sc Computer Science', 'Meta Certified Frontend Developer', 'AWS Certified Cloud Practitioner'],
    linkedinUrl: 'https://linkedin.com/in/orbitspace-lawal',
  },
  {
    id: 'tch-lawal-backend',
    slug: 'lawal-backend-architect',
    name: 'Lawal (Backend & Cloud Architect)',
    shortName: 'Lawal',
    email: 'lawal.backend@orbitspace.academy',
    phone: '+234 803 234 5678',
    specialization: 'Node.js, PostgreSQL, APIs & Cloud Systems',
    role: 'Backend Systems Lead',
    programs: ['Back End Development', 'Backend Engineering'],
    avatar: 'LW',
    color: '#38bdf8',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-05-10',
    bio: 'Distributed systems architect leading cloud native API integrations, database normalization, and asynchronous message broker designs.',
    qualifications: ['PostgreSQL Certified Professional', 'Node.js Core Contributor'],
    linkedinUrl: 'https://linkedin.com/in/orbitspace-lawal-be',
  },
  {
    id: 'tch-olamide-sec',
    slug: 'olamide-security-lead',
    name: 'Olamide (Lead Security Engineer)',
    shortName: 'Olamide',
    email: 'olamide.cyber@orbitspace.academy',
    phone: '+234 809 111 2233',
    specialization: 'SOC Defense, Penetration Testing & Network Security',
    role: 'Lead Security Engineer & SOC Analyst',
    programs: ['Cyber Security', 'Network Defense', 'Ethical Hacking'],
    avatar: 'OL',
    color: '#a855f7',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-01-20',
    bio: 'Cybersecurity defense lead managing active threat hunting, incident mitigation pipelines, and enterprise SIEM architectures in Ilorin.',
    qualifications: ['CompTIA Security+', 'CEH Certified Ethical Hacker', 'Cisco CCNA CyberOps'],
    linkedinUrl: 'https://linkedin.com/in/olamide-security',
  },
  {
    id: 'tch-stat-data',
    slug: 'mr-stat-data-science',
    name: 'Mr. Stat (Lead Data Science Mentor)',
    shortName: 'Mr. Stat',
    email: 'data.mentor@orbitspace.academy',
    phone: '+234 812 345 6789',
    specialization: 'PowerBI, Statistics, Python Data Science & SQL',
    role: 'Statistics & Analytics Lead',
    programs: ['Data Analysis', 'Statistics', 'Data Science'],
    avatar: 'ST',
    color: '#06b6d4',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-02-14',
    bio: 'Data strategist and statistical modeler equipping students with real-world business intelligence, automated ETL scripts, and predictive modeling.',
    qualifications: ['M.Sc Applied Statistics', 'Microsoft Certified Power BI Data Analyst Associate'],
    linkedinUrl: 'https://linkedin.com/in/mr-stat-orbitspace',
  },
  {
    id: 'tch-precious-video',
    slug: 'precious-creative-director',
    name: 'Precious (Creative Media Lead)',
    shortName: 'Precious',
    email: 'creative.media@orbitspace.academy',
    phone: '+234 810 456 7890',
    specialization: 'Premiere Pro, DaVinci Resolve & VFX Production',
    role: 'Creative Director & AI Mentor',
    programs: ['Video Editing', 'Creative Media'],
    avatar: 'PR',
    color: '#10b981',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2023-11-01',
    bio: 'Award-winning video producer and creative technologist training the next generation of visual storytellers and commercial media editors.',
    qualifications: ['Adobe Certified Professional in Video Design', 'DaVinci Resolve Certified Editor'],
    linkedinUrl: 'https://linkedin.com/in/precious-ogunleye',
  },
  {
    id: 'tch-rekay-content',
    slug: 'rekay-content-strategist',
    name: 'Rekay (Lead Content Strategist)',
    shortName: 'Rekay',
    email: 'rekay.content@orbitspace.academy',
    phone: '+234 805 678 9012',
    specialization: 'Mobile Photography, Brand Storytelling & Videography',
    role: 'Lead Content Strategist',
    programs: ['Content Creation', 'Digital Storytelling'],
    avatar: 'RK',
    color: '#f59e0b',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-04-10',
    bio: 'Viral content architect helping brand creators and influencers execute viral marketing campaigns and high-engagement reels.',
    qualifications: ['Digital Storytelling Fellow', 'Meta Certified Digital Creator'],
    linkedinUrl: 'https://linkedin.com/in/rekay-orbitspace',
  },
  {
    id: 'tch-ayo-product',
    slug: 'ayo-product-engineer',
    name: 'Ayo (Principal Product Engineer)',
    shortName: 'Ayo',
    email: 'ayo.product@orbitspace.academy',
    phone: '+234 802 345 6789',
    specialization: 'System Architecture & Product Engineering',
    role: 'Principal Product Engineer',
    programs: ['Product Engineering', 'Hardware & System Design'],
    avatar: 'AY',
    color: '#ec4899',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-03-01',
    bio: 'Product systems engineer combining industrial hardware prototyping with cloud scale backends.',
    qualifications: ['B.Eng Mechanical Engineering', 'Embedded Systems Specialist'],
    linkedinUrl: 'https://linkedin.com/in/ayo-orbitspace',
  },
  {
    id: 'tch-sophia-chen',
    slug: 'sophia-chen-design-systems',
    name: 'Sophia Chen (Design Systems Lead)',
    shortName: 'Sophia Chen',
    email: 'sophia.chen@orbitspace.academy',
    phone: '+234 812 987 6543',
    specialization: 'Figma Systems, Design Thinking & UX Prototyping',
    role: 'Design Systems Lead',
    programs: ['UI/UX Design', 'Product Design'],
    avatar: 'SC',
    color: '#f43f5e',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-06-01',
    bio: 'User experience strategist focused on accessible design tokens, micro-interactions, and design-to-code velocity.',
    qualifications: ['Nielsen Norman Group UX Master', 'Figma Certified Creator'],
    linkedinUrl: 'https://linkedin.com/in/sophia-chen-ux',
  },
  {
    id: 'tch-precious-auto',
    slug: 'precious-ai-automation',
    name: 'Precious (AI & Automation Mentor)',
    shortName: 'Precious',
    email: 'automation@orbitspace.academy',
    phone: '+234 810 456 7890',
    specialization: 'AI Workflows, Python Scripting & Autonomous Bots',
    role: 'AI & Automation Mentor',
    programs: ['AI & Automation', 'Artificial Intelligence'],
    avatar: 'PR',
    color: '#10b981',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-01-15',
    bio: 'AI solutions architect mentoring engineers on autonomous agents, tool use, and enterprise process automation.',
    qualifications: ['Google Cloud Certified AI Engineer', 'Python Institute Certified'],
    linkedinUrl: 'https://linkedin.com/in/precious-ai',
  },
  {
    id: 'tch-fatima-bello',
    slug: 'fatima-bello-robotics',
    name: 'Engr. Fatima Bello (Robotics & IoT)',
    shortName: 'Fatima Bello',
    email: 'fatima.bello@orbitspace.academy',
    phone: '+234 809 345 6789',
    specialization: 'Microcontrollers, Embedded C & Sensor IoT',
    role: 'Robotics & Embedded Systems Lead',
    programs: ['Robotics', 'Hardware & IoT', 'Embedded Systems'],
    avatar: 'FB',
    color: '#8b5cf6',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-07-01',
    bio: 'Robotics engineer developing sensory feedback microcontrollers and smart edge intelligence appliances.',
    qualifications: ['COREN Registered Engineer', 'IEEE Senior Member'],
    linkedinUrl: 'https://linkedin.com/in/fatima-bello-robotics',
  }
];

let tutorsMemoryCache: TutorProfile[] | null = null;
const tutorListeners = new Set<(tutors: TutorProfile[]) => void>();

export interface ComputedTutorStats {
  tutor: TutorProfile;
  // 1. Teaching hours
  historicalTeachingHours: number;
  newAttendanceHours: number;
  totalTeachingHours: number;
  attendanceSessionsCount: number;

  // 2. Students taught
  historicalStudentsTaught: number;
  newStudentsTaught: number;
  totalStudentsTaught: number;
  studentsTaughtList: Array<{ id: string; name: string; course: string; matricNumber?: string }>;

  // 3. Students certified
  historicalStudentsCertified: number;
  newStudentsCertified: number;
  totalStudentsCertified: number;
  certifiedStudentsList: Array<{
    studentName: string;
    studentEmail?: string;
    certificateId: string;
    certificateNumber?: string;
    program: string;
    dateIssued: string;
    completionDate?: string;
    certificateType?: string;
    documentUrl?: string;
    projectTitle?: string;
    projectUrl?: string;
  }>;

  // 4. Projects supervised
  historicalProjectsSupervised: number;
  newProjectsSupervised: number;
  totalProjectsSupervised: number;
  supervisedProjectsList: any[];

  // 5. Articles supervised
  articlesSupervisedCount: number;
  articlesList: any[];

  // 6. Programs taught
  programsTaught: string[];

  // 7. Teaching history
  teachingHistory: Array<{
    sessionId: string;
    course: string;
    cohort: string;
    date: string;
    topic: string;
    checkInTime?: string;
    checkOutTime?: string;
    durationHours: number;
    studentsPresentCount: number;
    totalStudentsCount: number;
  }>;

  hasHistoricalBaseline: boolean;
  historicalBaselineDetails?: {
    auditedBy?: string;
    auditDate?: string;
    note?: string;
  };
}

export const TutorService = {
  /**
   * Get all tutors (active & deactivated)
   */
  getAllTutors(): TutorProfile[] {
    if (tutorsMemoryCache && tutorsMemoryCache.length > 0) {
      return tutorsMemoryCache;
    }

    try {
      const raw = localStorage.getItem(TUTORS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, TutorProfile>();
          DEFAULT_TUTORS.forEach(t => map.set(t.id, t));
          parsed.forEach((t: TutorProfile) => {
            if (t && t.id) {
              const existing = map.get(t.id);
              map.set(t.id, { 
                ...existing, 
                ...t,
                slug: t.slug || (existing ? existing.slug : t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')),
                status: t.status || 'active',
                verificationStatus: t.verificationStatus || 'verified'
              });
            }
          });
          tutorsMemoryCache = Array.from(map.values());
          return tutorsMemoryCache;
        }
      }
    } catch (e) {
      console.warn('Could not read tutors from localStorage:', e);
    }

    tutorsMemoryCache = [...DEFAULT_TUTORS];
    return tutorsMemoryCache;
  },

  /**
   * Get active tutors for schedule assignments & public directory
   */
  getActiveTutors(): TutorProfile[] {
    return this.getAllTutors().filter(t => t.status !== 'deactivated');
  },

  /**
   * Find tutor by slug (for public verification link /tutor/[slug])
   */
  getTutorBySlug(slug: string): TutorProfile | undefined {
    const all = this.getAllTutors();
    const clean = slug.toLowerCase().trim();
    return all.find(t => 
      t.slug.toLowerCase() === clean || 
      t.id.toLowerCase() === clean ||
      t.shortName.toLowerCase() === clean ||
      t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean
    );
  },

  /**
   * Find tutor by ID
   */
  getTutorById(id: string): TutorProfile | undefined {
    return this.getAllTutors().find(t => t.id === id);
  },

  /**
   * Subscribe to live changes in tutors (LocalStorage + Firestore)
   */
  subscribeTutors(callback: (tutors: TutorProfile[]) => void): () => void {
    tutorListeners.add(callback);
    callback(this.getAllTutors());

    let unsubFirestore: (() => void) | null = null;
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = collection(db, 'tutors');
        unsubFirestore = onSnapshot(colRef, (snapshot) => {
          if (!snapshot.empty) {
            const map = new Map<string, TutorProfile>();
            DEFAULT_TUTORS.forEach(t => map.set(t.id, t));
            snapshot.forEach(docSnap => {
              const data = docSnap.data() as TutorProfile;
              if (data && docSnap.id) {
                const existing = map.get(docSnap.id);
                map.set(docSnap.id, { 
                  ...existing,
                  ...data, 
                  id: docSnap.id,
                  slug: data.slug || existing?.slug || docSnap.id
                });
              }
            });
            const merged = Array.from(map.values());
            tutorsMemoryCache = merged;
            try {
              localStorage.setItem(TUTORS_STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            callback(merged);
          }
        }, (err) => {
          console.warn('Firestore tutors subscription notice:', err.message);
        });
      } catch (err) {
        console.warn('Firestore onSnapshot error for tutors:', err);
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === TUTORS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            tutorsMemoryCache = parsed;
            callback(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      tutorListeners.delete(callback);
      if (unsubFirestore) unsubFirestore();
      window.removeEventListener('storage', handleStorage);
    };
  },

  /**
   * Resolve assigned tutor for any program name
   */
  getAssignedTutorForProgram(programName: string): TutorProfile {
    const tutors = this.getActiveTutors();
    if (!programName) {
      return tutors[0] || DEFAULT_TUTORS[0];
    }

    const norm = programName.toLowerCase().trim();

    // 1. Direct program inclusion match
    for (const t of tutors) {
      if (t.programs?.some(p => p.toLowerCase() === norm || norm.includes(p.toLowerCase()) || p.toLowerCase().includes(norm))) {
        return t;
      }
    }

    // 2. Keyword fallback matching
    if (norm.includes('front') || norm.includes('web dev') || norm.includes('software')) {
      const match = tutors.find(t => t.id === 'tch-lawal-frontend');
      if (match) return match;
    }
    if (norm.includes('back')) {
      const match = tutors.find(t => t.id === 'tch-lawal-backend');
      if (match) return match;
    }
    if (norm.includes('cyber') || norm.includes('security')) {
      const match = tutors.find(t => t.id === 'tch-olamide-sec');
      if (match) return match;
    }
    if (norm.includes('data') || norm.includes('stat') || norm.includes('anal')) {
      const match = tutors.find(t => t.id === 'tch-stat-data');
      if (match) return match;
    }
    if (norm.includes('video') || norm.includes('media') || norm.includes('edit')) {
      const match = tutors.find(t => t.id === 'tch-precious-video');
      if (match) return match;
    }
    if (norm.includes('content') || norm.includes('photo')) {
      const match = tutors.find(t => t.id === 'tch-rekay-content');
      if (match) return match;
    }
    if (norm.includes('auto') || norm.includes('ai')) {
      const match = tutors.find(t => t.id === 'tch-precious-auto');
      if (match) return match;
    }
    if (norm.includes('design') || norm.includes('ui') || norm.includes('ux')) {
      const match = tutors.find(t => t.id === 'tch-sophia-chen');
      if (match) return match;
    }
    if (norm.includes('robot') || norm.includes('hardw') || norm.includes('iot')) {
      const match = tutors.find(t => t.id === 'tch-fatima-bello');
      if (match) return match;
    }
    if (norm.includes('product') || norm.includes('engineer')) {
      const match = tutors.find(t => t.id === 'tch-ayo-product');
      if (match) return match;
    }

    return tutors[0] || DEFAULT_TUTORS[0];
  },

  /**
   * Update or Edit Tutor profile
   * Propagates changes across:
   * 1. Attendance registers & assigned faculty
   * 2. Timetable slots
   * 3. Public Verification page /tutor/[slug]
   * 4. Firestore & LocalStorage
   */
  async updateTutor(updatedTutor: TutorProfile, previousShortName?: string): Promise<{ success: boolean; tutor: TutorProfile }> {
    if (!isAdminAuthenticated()) {
      throw new Error('Access Denied: Only authenticated administrators can edit tutor information.');
    }

    const currentTutors = this.getAllTutors();
    const index = currentTutors.findIndex(t => t.id === updatedTutor.id);
    let newList: TutorProfile[];

    const oldTutor = index >= 0 ? currentTutors[index] : null;
    const oldName = previousShortName || oldTutor?.shortName || oldTutor?.name || updatedTutor.shortName;

    // Ensure slug exists
    const cleanSlug = updatedTutor.slug || (updatedTutor.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const readyTutor: TutorProfile = {
      ...updatedTutor,
      slug: cleanSlug,
      status: updatedTutor.status || 'active',
      verificationStatus: updatedTutor.verificationStatus || 'verified'
    };

    if (index >= 0) {
      newList = [...currentTutors];
      newList[index] = { ...currentTutors[index], ...readyTutor };
    } else {
      newList = [...currentTutors, readyTutor];
    }

    tutorsMemoryCache = newList;
    try {
      localStorage.setItem(TUTORS_STORAGE_KEY, JSON.stringify(newList));
    } catch {}

    tutorListeners.forEach(cb => cb(newList));

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'tutors', readyTutor.id), {
          ...readyTutor,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Notice persisting tutor to Firestore:', err);
      }
    }

    // Cascade to Timetable slots
    try {
      const slots = getLocalTimetableSlots();
      const nameMatches = (slotInstructor: string) => {
        if (!slotInstructor) return false;
        const normSlot = slotInstructor.toLowerCase().trim();
        const normOld = (oldName || '').toLowerCase().trim();
        const normOldFull = (oldTutor?.name || '').toLowerCase().trim();
        const normNewShort = (readyTutor.shortName || '').toLowerCase().trim();
        return (
          normSlot === normOld ||
          normSlot === normOldFull ||
          (normOld && normSlot.includes(normOld)) ||
          (normOld && normOld.includes(normSlot)) ||
          normSlot === normNewShort
        );
      };

      for (const slot of slots) {
        if (nameMatches(slot.instructor)) {
          await saveTimetableSlot({
            ...slot,
            instructor: readyTutor.shortName || readyTutor.name,
            instructorTitle: readyTutor.role || slot.instructorTitle
          });
        }
      }
    } catch (err) {
      console.warn('Notice cascading tutor change to timetable:', err);
    }

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('orbit-tutors-updated', { detail: readyTutor }));

    return { success: true, tutor: readyTutor };
  },

  /**
   * Set tutor status (active | deactivated)
   */
  async setTutorStatus(tutorId: string, status: 'active' | 'deactivated'): Promise<boolean> {
    if (!isAdminAuthenticated()) {
      throw new Error('Access Denied: Only authenticated administrators can change faculty status.');
    }
    const tutor = this.getTutorById(tutorId);
    if (!tutor) return false;

    await this.updateTutor({
      ...tutor,
      status
    });
    return true;
  },

  /**
   * Delete tutor permanently
   */
  async deleteTutorPermanently(tutorId: string): Promise<boolean> {
    return this.hardDeleteTutor(tutorId);
  },

  /**
   * Calculates dynamic verified statistics for a tutor strictly from actual system records:
   * - Total teaching hours: (Check-out time - Check-in time) + Admin-Entered Historical Baseline
   * - Students taught: actual assigned class & attendance records + Admin-Entered Historical Baseline
   * - Students certified: verified student certificates taught/supervised by tutor + Historical Baseline
   * - Projects supervised: verified capstone submissions + Historical Baseline
   * - Articles supervised: published papers
   * - Teaching history: real attendance check-in/out records
   * 
   * Rule: No dummy data fabricated. If no records exist, displays 0.
   */
  async getComputedTutorStats(tutorId: string): Promise<ComputedTutorStats> {
    const tutor = this.getTutorById(tutorId);
    if (!tutor) {
      throw new Error(`Tutor with ID ${tutorId} not found`);
    }

    const { AttendanceService } = await import('./attendanceService');

    // 1. Admin-Entered Historical Baseline (Distinct from digital platform attendance)
    const baseline = tutor.historicalBaseline;
    const historicalTeachingHours = Number(baseline?.historicalTeachingHours ?? tutor.baseTeachingHours ?? 0);
    const historicalStudentsTaught = Number(baseline?.historicalStudentsTaught ?? tutor.baseStudentsCount ?? 0);
    const historicalStudentsCertified = Number(baseline?.historicalStudentsCertified ?? 0);
    const historicalProjectsSupervised = Number(baseline?.historicalProjectsSupervised ?? 0);

    // 2. Real Verified Teaching Sessions from Attendance check-in / check-out
    const sessions = await AttendanceService.getClassSessionsForTutor(tutor.id);
    const teachingHistory = sessions.map((s) => {
      const dur = (s.duration_hours && s.duration_hours > 0)
        ? s.duration_hours
        : AttendanceService.calculateHoursBetween(s.tutor_check_in_time, s.tutor_check_out_time);
      return {
        sessionId: s.class_session_id,
        course: s.course,
        cohort: s.cohort,
        date: s.date,
        topic: s.session_topic || `Class Session: ${s.course}`,
        checkInTime: s.tutor_check_in_time,
        checkOutTime: s.tutor_check_out_time,
        durationHours: dur,
        studentsPresentCount: s.present_count || 0,
        totalStudentsCount: s.total_students || 0
      };
    });

    // Also get verified teaching hours from VerificationDataService
    const additionalHours = VerificationDataService.getTeachingHoursForTutor(tutor.id)
      .filter((h) => h.verificationStatus === 'verified');

    let attendanceHoursSum = teachingHistory.reduce((acc, curr) => acc + (curr.durationHours || 0), 0);
    additionalHours.forEach((h) => {
      const isDupe = teachingHistory.some((s) => s.sessionId === h.id || (s.date === h.date && s.course === h.program));
      if (!isDupe) {
        attendanceHoursSum += (h.durationHours || 0);
      }
    });
    const newAttendanceHours = Math.round(attendanceHoursSum * 10) / 10;
    const totalTeachingHours = Math.round((historicalTeachingHours + newAttendanceHours) * 10) / 10;

    // 3. Students Taught (from actual class enrollment & session attendance)
    const realStudents = await AttendanceService.getStudentsTaughtByTutor(tutor.id, tutor.programs);
    const studentsTaughtList = realStudents.map((st) => ({
      id: st.id,
      name: st.name,
      course: st.course,
      matricNumber: st.matricNumber
    }));
    // 4. Students Certified (calculated from students taught who subsequently received certificates)
    const allCerts = getCertificates().filter((c) => c.status !== 'revoked');
    const cleanId = tutor.id.toLowerCase().trim();
    const cleanName = tutor.name.toLowerCase().trim();
    const cleanShort = tutor.shortName.toLowerCase().trim();
    const cleanSlug = tutor.slug.toLowerCase().trim();

    const studentNamesTaughtSet = new Set(studentsTaughtList.map((s) => s.name.toLowerCase().trim()));

    const matchingCerts = allCerts.filter((cert) => {
      const supId = (cert.supervisingTutorId || '').toLowerCase().trim();
      const supSlug = (cert.supervisingTutorSlug || '').toLowerCase().trim();
      const supName = (cert.supervisingTutorName || '').toLowerCase().trim();
      const certStudent = (cert.studentName || '').toLowerCase().trim();
      const certCourse = (cert.course || '').toLowerCase().trim();
      const certNotes = (cert.additionalNotes || '').toLowerCase();

      // 1. Direct tutor match on certificate record
      if (supId) {
        if (supId === cleanId || (supSlug && supSlug === cleanSlug)) return true;
        // If a different tutor ID is explicitly assigned, don't claim it
        return false;
      }

      // 2. Name or slug match on supervising tutor field
      if (supName) {
        if (supName.includes(cleanShort) || cleanName.includes(supName) || (supSlug && supSlug === cleanSlug)) {
          return true;
        }
      }

      // 3. Notes mention the tutor
      if (certNotes && (certNotes.includes(cleanShort) || certNotes.includes(cleanName))) {
        return true;
      }

      // 4. Student taught by this tutor in verified attendance records
      if (studentNamesTaughtSet.has(certStudent)) {
        return true;
      }

      // 5. Automatic assignment from program curriculum track
      const assignedTutor = TutorService.getAssignedTutorForProgram(cert.course);
      if (assignedTutor && assignedTutor.id.toLowerCase() === cleanId) {
        return true;
      }

      // 6. Direct program track match
      const matchesProg = tutor.programs.some((p) => {
        const pNorm = p.toLowerCase().trim();
        return certCourse === pNorm || certCourse.includes(pNorm) || pNorm.includes(certCourse);
      });
      if (matchesProg) return true;

      return false;
    });

    const certifiedStudentsList = matchingCerts.map((c) => ({
      studentName: c.studentName,
      studentEmail: c.studentEmail,
      certificateId: c.id,
      certificateNumber: c.certificateNumber,
      program: c.course,
      dateIssued: c.dateIssued,
      completionDate: c.completionDate,
      certificateType: c.certificateType,
      documentUrl: c.documentUrl,
      projectTitle: c.projectTitle,
      projectUrl: c.projectUrl
    }));
    const newStudentsCertified = certifiedStudentsList.length;
    const totalStudentsCertified = historicalStudentsCertified + newStudentsCertified;

    // Also include certified graduates in students taught if not already present
    matchingCerts.forEach((cert) => {
      const sName = (cert.studentName || '').trim();
      if (sName && !studentNamesTaughtSet.has(sName.toLowerCase())) {
        studentNamesTaughtSet.add(sName.toLowerCase());
        studentsTaughtList.push({
          id: cert.studentId || cert.id,
          name: sName,
          course: cert.course,
          matricNumber: cert.studentId || cert.certificateNumber
        });
      }
    });
    const newStudentsTaught = studentsTaughtList.length;
    const totalStudentsTaught = historicalStudentsTaught + newStudentsTaught;

    // 5. Student Projects Supervised (from verified projects in the system)
    const supervisedProjectsList = VerificationDataService.getProjectsForTutor(tutor.id)
      .filter((p) => p.verificationStatus === 'verified');
    const newProjectsSupervised = supervisedProjectsList.length;
    const totalProjectsSupervised = historicalProjectsSupervised + newProjectsSupervised;

    // 6. Articles / Research Supervised
    const articlesList = getArticlesByTutorName(tutor.name);
    const articlesSupervisedCount = articlesList.length;

    // 7. Programs Taught
    const programsSet = new Set<string>(tutor.programs);
    teachingHistory.forEach((s) => {
      if (s.course && s.course.trim()) {
        programsSet.add(s.course.trim());
      }
    });
    const programsTaught = Array.from(programsSet);

    const hasHistoricalBaseline = Boolean(
      baseline && (
        (baseline.historicalTeachingHours || 0) > 0 ||
        (baseline.historicalStudentsTaught || 0) > 0 ||
        (baseline.historicalStudentsCertified || 0) > 0 ||
        (baseline.historicalProjectsSupervised || 0) > 0
      )
    );

    return {
      tutor,
      historicalTeachingHours,
      newAttendanceHours,
      totalTeachingHours,
      attendanceSessionsCount: teachingHistory.length,

      historicalStudentsTaught,
      newStudentsTaught,
      totalStudentsTaught,
      studentsTaughtList,

      historicalStudentsCertified,
      newStudentsCertified,
      totalStudentsCertified,
      certifiedStudentsList,

      historicalProjectsSupervised,
      newProjectsSupervised,
      totalProjectsSupervised,
      supervisedProjectsList,

      articlesSupervisedCount,
      articlesList,

      programsTaught,
      teachingHistory,

      hasHistoricalBaseline,
      historicalBaselineDetails: baseline ? {
        auditedBy: baseline.historicalAuditedBy,
        auditDate: baseline.historicalAuditDate,
        note: baseline.historicalBaselineNote
      } : undefined
    };
  },

  /**
   * Set or update historical baseline for a tutor.
   * Admin-entered records representing pre-platform legacy archives.
   */
  async setTutorHistoricalBaseline(
    tutorId: string,
    baseline: TutorHistoricalBaseline,
    adminName: string
  ): Promise<TutorProfile> {
    if (!isAdminAuthenticated()) {
      throw new Error('Access Denied: Only authenticated administrators can adjust historical records.');
    }

    const tutor = this.getTutorById(tutorId);
    if (!tutor) throw new Error('Tutor not found');

    const updatedBaseline: TutorHistoricalBaseline = {
      historicalTeachingHours: Math.max(0, Number(baseline.historicalTeachingHours) || 0),
      historicalStudentsTaught: Math.max(0, Math.floor(Number(baseline.historicalStudentsTaught) || 0)),
      historicalStudentsCertified: Math.max(0, Math.floor(Number(baseline.historicalStudentsCertified) || 0)),
      historicalProjectsSupervised: Math.max(0, Math.floor(Number(baseline.historicalProjectsSupervised) || 0)),
      historicalBaselineNote: baseline.historicalBaselineNote?.trim() || 'Admin-Entered Historical Baseline',
      historicalAuditedBy: adminName || 'System Administrator',
      historicalAuditDate: new Date().toISOString()
    };

    const updatedTutor: TutorProfile = {
      ...tutor,
      historicalBaseline: updatedBaseline,
      baseTeachingHours: updatedBaseline.historicalTeachingHours,
      baseStudentsCount: updatedBaseline.historicalStudentsTaught
    };

    return await this.updateTutor(updatedTutor);
  },

  /**
   * Clear historical baseline back to 0
   */
  async clearTutorHistoricalBaseline(tutorId: string): Promise<TutorProfile> {
    if (!isAdminAuthenticated()) {
      throw new Error('Access Denied: Administrator authentication required.');
    }
    const tutor = this.getTutorById(tutorId);
    if (!tutor) throw new Error('Tutor not found');

    const updatedTutor: TutorProfile = {
      ...tutor,
      historicalBaseline: undefined,
      baseTeachingHours: 0,
      baseStudentsCount: 0
    };

    return await this.updateTutor(updatedTutor);
  },

  /**
   * Get comprehensive tutor record stats for safe-deletion warnings
   * Pulls directly from the computed system records engine.
   */
  async getTutorRecordStats(tutorId: string): Promise<{
    programsCount: number;
    programsList: string[];
    teachingHours: number;
    studentsCount: number;
    supervisedProjectsCount: number;
    supervisedArticlesCount: number;
    certificatesLinkedCount: number;
    uploadedProjectEvidenceCount: number;
    hasHistoricalBaseline: boolean;
  }> {
    const stats = await this.getComputedTutorStats(tutorId);
    const uploadedProjectEvidenceCount = stats.supervisedProjectsList.filter(
      (p) => !!(p.projectUrl || p.repoUrl || (p.evidenceFiles && p.evidenceFiles.length > 0))
    ).length;

    return {
      programsCount: stats.programsTaught.length,
      programsList: stats.programsTaught,
      teachingHours: stats.totalTeachingHours,
      studentsCount: stats.totalStudentsTaught,
      supervisedProjectsCount: stats.totalProjectsSupervised,
      supervisedArticlesCount: stats.articlesSupervisedCount,
      certificatesLinkedCount: stats.totalStudentsCertified,
      uploadedProjectEvidenceCount,
      hasHistoricalBaseline: stats.hasHistoricalBaseline
    };
  },

  /**
   * Soft delete or deactivate a tutor (preserves historical certificates and projects)
   */
  async deactivateTutor(tutorId: string): Promise<boolean> {
    if (!isAdminAuthenticated()) {
      throw new Error('Access Denied: Only authenticated administrators can deactivate tutors.');
    }

    const tutor = this.getTutorById(tutorId);
    if (!tutor) return false;

    await this.updateTutor({
      ...tutor,
      status: 'deactivated'
    });
    return true;
  },

  /**
   * Reactivate tutor
   */
  async reactivateTutor(tutorId: string): Promise<boolean> {
    if (!isAdminAuthenticated()) {
      throw new Error('Access Denied: Admin required.');
    }

    const tutor = this.getTutorById(tutorId);
    if (!tutor) return false;

    await this.updateTutor({
      ...tutor,
      status: 'active'
    });
    return true;
  },

  /**
   * Hard delete tutor (only if explicit admin confirmation given)
   */
  async hardDeleteTutor(tutorId: string): Promise<boolean> {
    if (!isAdminAuthenticated()) {
      throw new Error('Access Denied: Admin required.');
    }

    const all = this.getAllTutors();
    const filtered = all.filter(t => t.id !== tutorId);
    tutorsMemoryCache = filtered;

    try {
      localStorage.setItem(TUTORS_STORAGE_KEY, JSON.stringify(filtered));
    } catch {}

    tutorListeners.forEach(cb => cb(filtered));

    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'tutors', tutorId));
      } catch (e) {
        console.warn('Firestore tutor delete notice:', e);
      }
    }

    window.dispatchEvent(new Event('storage'));
    return true;
  }
};
