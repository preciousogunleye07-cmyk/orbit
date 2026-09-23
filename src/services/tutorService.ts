import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from './firebase';
import { isAdminAuthenticated, getCertificates } from './certificateService';
import { isSubAdminAuthenticated } from './subAdminService';
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


export interface TutorAccountCredentials {
  hasAccount: boolean;
  username: string; // login identifier / email
  initialPassword?: string; // admin-set initial password or temporary pin
  lastLoginAt?: string;
  accountStatus: "active" | "deactivated";
}

export interface TutorProfile {
  account?: TutorAccountCredentials;
  id: string;
  slug: string; // URL slug for public link /tutor/[slug]
  name: string;
  shortName: string;
  email: string;
  phone?: string;
  specialization: string;
  role: string;
  programs: string[]; // multi-course assignment
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
  portfolioUrl?: string; // Portfolio / website URL
  aliasIds?: string[]; // IDs of any merged profiles (e.g. ['tch-lawal-frontend', 'tch-lawal-backend'])
  aliasSlugs?: string[]; // Slugs of any merged profiles
  historicalBaseline?: TutorHistoricalBaseline; // Admin-Entered Historical Records
  baseTeachingHours?: number; // Legacy compatibility
  baseStudentsCount?: number; // Legacy compatibility
  isCustom?: boolean;
}

export const AVAILABLE_COURSES = [
  'UI/UX Design',
  'Graphics Design',
  'Brand Identity',
  'Product Design',
  'UI/UX & Product Engineering',
  'Front End Development',
  'Back End Development',
  'Full Stack Development',
  'Web Development',
  'Software Engineering',
  'Cybersecurity',
  'Network Defense',
  'Ethical Hacking',
  'Data Analysis',
  'Data Science',
  'Statistics',
  'AI & Automation',
  'Artificial Intelligence',
  'Video Editing',
  'Creative Media',
  'Content Creation',
  'Digital Storytelling',
  'Robotics & IoT',
  'Hardware & System Design',
  'Embedded Systems'
];

const TUTORS_STORAGE_KEY = 'orbit_space_tutors_v1';
const TUTORS_DELETED_KEY = 'orbit_space_tutors_deleted_v2';

export function getDeletedTutorIds(): Set<string> {
  try {
    const raw = localStorage.getItem(TUTORS_DELETED_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr.map(s => String(s).toLowerCase().trim()));
      }
    }
  } catch {}
  return new Set();
}

export function saveDeletedTutorIds(ids: string[]): void {
  const current = getDeletedTutorIds();
  ids.forEach(id => {
    if (id && typeof id === 'string') {
      current.add(id.toLowerCase().trim());
    }
  });
  try {
    localStorage.setItem(TUTORS_DELETED_KEY, JSON.stringify(Array.from(current)));
  } catch {}
}

export function isTutorDeleted(t: TutorProfile | null | undefined, deletedSet: Set<string>): boolean {
  if (!t || !t.id) return true;
  const idNorm = t.id.toLowerCase().trim();
  if (deletedSet.has(idNorm)) return true;
  if (t.slug && deletedSet.has(t.slug.toLowerCase().trim())) return true;
  if (t.name && deletedSet.has(t.name.toLowerCase().trim())) return true;
  if (t.aliasIds && t.aliasIds.some(a => deletedSet.has(a.toLowerCase().trim()))) return true;
  return false;
}

export const DEFAULT_TUTORS: TutorProfile[] = [
  {
    id: 'tch-lawal',
    slug: 'lawal-lead',
    name: 'Lawal Kehinde',
    shortName: 'Lawal',
    email: 'lawal.engineering@orbitspace.academy',
    phone: '+234 803 234 5678',
    specialization: 'Full Stack Architecture, React, Node.js, TypeScript & Cloud Systems',
    role: 'Senior Full Stack & Cloud Architect',
    programs: [
      'Front End Development',
      'Back End Development',
      'Full Stack Development',
      'Web Development',
      'Software Engineering'
    ],
    avatar: 'LK',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    color: '#38bdf8',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-03-15',
    bio: 'Senior engineering mentor specializing in high-performance frontend micro-architectures, React design tokens, Node.js cloud APIs, and distributed microservices.',
    linkedinUrl: 'https://linkedin.com/in/orbitspace-lawal',
    portfolioUrl: 'https://lawal.dev',
    aliasIds: ['tch-lawal-frontend', 'tch-lawal-backend'],
    aliasSlugs: ['lawal-frontend-lead', 'lawal-backend-architect'],
  account: {
      hasAccount: true,
      username: "lawal.engineering@orbitspace.academy",
      initialPassword: "OrbitTeacher2026!",
      accountStatus: "active"
    },
  },
  {
    id: 'tch-precious',
    slug: 'precious-creative-lead',
    name: 'Engr. Precious Ogunleye',
    shortName: 'Precious',
    email: 'creative.media@orbitspace.academy',
    phone: '+234 810 456 7890',
    specialization: 'Premiere Pro, DaVinci Resolve, AI Workflows & Autonomous Bots',
    role: 'Creative Director & AI Automation Mentor',
    programs: [
      'Video Editing',
      'Creative Media',
      'AI & Automation',
      'Artificial Intelligence',
      'Content Creation'
    ],
    avatar: 'PO',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    color: '#10b981',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2023-11-01',
    bio: 'Award-winning video producer, AI systems architect, and creative technologist training developers in commercial media editing, visual storytelling, and autonomous agent workflows.',
    linkedinUrl: 'https://linkedin.com/in/precious-ogunleye',
    portfolioUrl: 'https://preciousogunleye.com',
    aliasIds: ['tch-precious-video', 'tch-precious-auto', 'tch-precious-ogunleye'],
    aliasSlugs: ['precious-creative-director', 'precious-ai-automation'],
  account: {
      hasAccount: true,
      username: "creative.media@orbitspace.academy",
      initialPassword: "OrbitTeacher2026!",
      accountStatus: "active"
    },
  },
  {
    id: 'tch-olamide-sec',
    slug: 'olamide-security-lead',
    name: 'Olamide Akintola',
    shortName: 'Olamide',
    email: 'olamide.cyber@orbitspace.academy',
    phone: '+234 809 111 2233',
    specialization: 'SOC Defense, Penetration Testing & Network Security',
    role: 'Lead Security Engineer & SOC Analyst',
    programs: ['Cybersecurity', 'Network Defense', 'Ethical Hacking'],
    avatar: 'OA',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    color: '#a855f7',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-01-20',
    bio: 'Cybersecurity defense lead managing active threat hunting, incident mitigation pipelines, and enterprise SIEM architectures in Ilorin.',
    linkedinUrl: 'https://linkedin.com/in/olamide-security',
    aliasIds: ['tch-olamide', 'tch-adebayo-vance'],
  account: {
      hasAccount: true,
      username: "olamide.cyber@orbitspace.academy",
      initialPassword: "OrbitTeacher2026!",
      accountStatus: "active"
    },
  },
  {
    id: 'tch-stat-data',
    slug: 'mr-stat-data-science',
    name: 'Babatunde Adeleke (Mr. Stat)',
    shortName: 'Mr. Stat',
    email: 'data.mentor@orbitspace.academy',
    phone: '+234 812 345 6789',
    specialization: 'PowerBI, Statistics, Python Data Science & SQL',
    role: 'Lead Data Science & Analytics Mentor',
    programs: ['Data Analysis', 'Statistics', 'Data Science'],
    avatar: 'ST',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    color: '#06b6d4',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-02-14',
    bio: 'Data strategist and statistical modeler equipping students with real-world business intelligence, automated ETL scripts, and predictive modeling.',
    linkedinUrl: 'https://linkedin.com/in/mr-stat-orbitspace',
    aliasIds: ['tch-stat', 'tch-mr-stat', 'tch-marcus-okafor'],
  account: {
      hasAccount: true,
      username: "data.mentor@orbitspace.academy",
      initialPassword: "OrbitTeacher2026!",
      accountStatus: "active"
    },
  },
  {
    id: 'tch-rekay-content',
    slug: 'rekay-content-strategist',
    name: 'Rebekah Ayomide (Rekay)',
    shortName: 'Rekay',
    email: 'rekay.content@orbitspace.academy',
    phone: '+234 805 678 9012',
    specialization: 'Mobile Photography, Brand Storytelling & Videography',
    role: 'Lead Content Strategist & Media Producer',
    programs: ['Content Creation', 'Digital Storytelling', 'Brand Identity'],
    avatar: 'RK',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    color: '#f59e0b',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-04-10',
    bio: 'Viral content architect helping brand creators and influencers execute viral marketing campaigns and high-engagement reels.',
    linkedinUrl: 'https://linkedin.com/in/rekay-orbitspace',
    aliasIds: ['tch-rekay'],
  account: {
      hasAccount: true,
      username: "rekay.content@orbitspace.academy",
      initialPassword: "OrbitTeacher2026!",
      accountStatus: "active"
    },
  },
  {
    id: 'tch-ayo-product',
    slug: 'ayo-product-engineer',
    name: 'Ayodeji Adeleke (Ayo)',
    shortName: 'Ayo',
    email: 'ayo.product@orbitspace.academy',
    phone: '+234 802 345 6789',
    specialization: 'System Architecture, Hardware Prototyping & Embedded Robotics',
    role: 'Principal Product Engineer & Robotics Lead',
    programs: [
      'Product Engineering',
      'Hardware & System Design',
      'Full Stack Development',
      'Robotics & Embedded Systems',
      'Robotics & Hardware Engineering',
      'Robotics & IoT'
    ],
    avatar: 'AY',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
    color: '#ec4899',
    status: 'active',
    verificationStatus: 'verified',
    joinedDate: '2024-03-01',
    bio: 'Product systems engineer combining industrial hardware prototyping, embedded microcontrollers, IoT telemetry, and cloud scale backends.',
    linkedinUrl: 'https://linkedin.com/in/ayo-orbitspace',
    aliasIds: ['tch-ayo', 'tch-fatima-bello'],
  account: {
      hasAccount: true,
      username: "ayo.product@orbitspace.academy",
      initialPassword: "OrbitTeacher2026!",
      accountStatus: "active"
    },
  }
];

let tutorsMemoryCache: TutorProfile[] | null = null;
const tutorListeners = new Set<(tutors: TutorProfile[]) => void>();

export interface ComputedTutorStats {
  tutor: TutorProfile;
  // 1. Teaching hours
  historicalTeachingHours: number;
  newAttendanceHours: number;
  adjustmentHours: number;
  totalTeachingHours: number;
  attendanceSessionsCount: number;
  ledgerEntries: any[];

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

const DUMMY_TEACHER_IDS = new Set([
  'tch-sophia-chen',
  'tch-fatima-bello',
  'tch-adebayo-vance',
  'tch-marcus-okafor'
]);

const DUMMY_TEACHER_NAMES = ['sophia chen', 'fatima bello', 'adebayo vance', 'marcus okafor'];

function isDummyTeacher(t: TutorProfile): boolean {
  if (!t) return true;
  if (DUMMY_TEACHER_IDS.has(t.id)) return true;
  const lowerName = (t.name || '').toLowerCase();
  const lowerShort = (t.shortName || '').toLowerCase();
  return DUMMY_TEACHER_NAMES.some(dn => lowerName.includes(dn) || lowerShort.includes(dn));
}

function consolidateAndMigrateTutors(savedTutors: TutorProfile[]): TutorProfile[] {
  const deletedSet = getDeletedTutorIds();
  const canonicalMap = new Map<string, TutorProfile>();

  DEFAULT_TUTORS.forEach(t => {
    if (isDummyTeacher(t) || isTutorDeleted(t, deletedSet)) {
      return;
    }
    const entry: TutorProfile = { ...t };
    delete (entry as any).historicalBaseline;
    delete (entry as any).baseTeachingHours;
    delete (entry as any).baseStudentsCount;
    if (!entry.account) {
      entry.account = {
        hasAccount: true,
        username: entry.email,
        initialPassword: "OrbitTeacher2026!",
        accountStatus: entry.status || "active"
      };
    }
    canonicalMap.set(t.id, entry);
  });

  const findCanonical = (t: TutorProfile): TutorProfile | undefined => {
    if (isDummyTeacher(t) || isTutorDeleted(t, deletedSet)) return undefined;
    if (canonicalMap.has(t.id)) return canonicalMap.get(t.id);
    for (const [_, canon] of canonicalMap.entries()) {
      if (canon.aliasIds?.includes(t.id)) return canon;
      if (canon.aliasSlugs && t.slug && canon.aliasSlugs.includes(t.slug)) return canon;
    }
    const normName = t.name.toLowerCase();
    const normShort = (t.shortName || '').toLowerCase();
    if (normName.includes('lawal') || normShort === 'lawal') return canonicalMap.get('tch-lawal');
    if (normName.includes('precious') || normShort === 'precious') return canonicalMap.get('tch-precious');
    if (normName.includes('olamide') || normShort === 'olamide') return canonicalMap.get('tch-olamide-sec');
    if (normName.includes('stat') || normShort.includes('stat')) return canonicalMap.get('tch-stat-data');
    if (normName.includes('rekay') || normShort === 'rekay') return canonicalMap.get('tch-rekay-content');
    if (normName.includes('ayo') || normShort === 'ayo') return canonicalMap.get('tch-ayo-product');
    return undefined;
  };

  savedTutors.forEach((t) => {
    if (!t || !t.id || isDummyTeacher(t) || isTutorDeleted(t, deletedSet)) return;
    const canon = findCanonical(t);
    if (canon) {
      const mergedPrograms = Array.from(new Set([...(canon.programs || []), ...(t.programs || [])]));
      const mergedAliases = Array.from(new Set([...(canon.aliasIds || []), ...(t.aliasIds || []), t.id].filter(id => id !== canon.id)));
      canon.programs = mergedPrograms;
      canon.aliasIds = mergedAliases;
      if (t.portfolioUrl && !canon.portfolioUrl) canon.portfolioUrl = t.portfolioUrl;
      if (t.phone && !canon.phone) canon.phone = t.phone;
      if (t.linkedinUrl && !canon.linkedinUrl) canon.linkedinUrl = t.linkedinUrl;
      if (t.githubUrl && !canon.githubUrl) canon.githubUrl = t.githubUrl;
      if (t.status === 'deactivated' && canon.status !== 'deactivated') {
        canon.status = t.status;
      }
    } else {
      canonicalMap.set(t.id, t);
    }
  });

  return Array.from(canonicalMap.values()).filter(t => !isTutorDeleted(t, deletedSet));
}

export const TutorService = {
  /**
   * Get all tutors (active & deactivated)
   */
  getAllTutors(): TutorProfile[] {
    const deletedSet = getDeletedTutorIds();
    if (tutorsMemoryCache !== null && Array.isArray(tutorsMemoryCache)) {
      return tutorsMemoryCache.filter(t => !isTutorDeleted(t, deletedSet));
    }

    try {
      const raw = localStorage.getItem(TUTORS_STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const consolidated = consolidateAndMigrateTutors(parsed);
          tutorsMemoryCache = consolidated;
          try {
            localStorage.setItem(TUTORS_STORAGE_KEY, JSON.stringify(consolidated));
          } catch {}
          return consolidated;
        }
      }
    } catch (e) {
      console.warn('Could not read tutors from localStorage:', e);
    }

    const initial = DEFAULT_TUTORS.filter(t => !isTutorDeleted(t, deletedSet));
    tutorsMemoryCache = initial;
    try {
      localStorage.setItem(TUTORS_STORAGE_KEY, JSON.stringify(initial));
    } catch {}
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
    if (!slug) return undefined;
    const all = this.getAllTutors();
    const clean = slug.toLowerCase().trim();
    // 1. Direct slug match
    const direct = all.find(t => t.slug.toLowerCase() === clean);
    if (direct) return direct;
    // 2. Alias slugs
    const byAliasSlug = all.find(t => t.aliasSlugs && t.aliasSlugs.some(s => s.toLowerCase() === clean));
    if (byAliasSlug) return byAliasSlug;
    // 3. ID match or Alias ID match
    const byId = this.getTutorById(slug);
    if (byId) return byId;
    // 4. Short name / sanitized name match
    return all.find(t => 
      t.shortName.toLowerCase() === clean || 
      t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean ||
      clean.includes(t.shortName.toLowerCase())
    );
  },

  /**
   * Find tutor by ID
   */
  getTutorById(id: string): TutorProfile | undefined {
    if (!id) return undefined;
    const all = this.getAllTutors();
    const clean = id.toLowerCase().trim();
    const direct = all.find(t => t.id.toLowerCase() === clean);
    if (direct) return direct;
    const byAlias = all.find(t => t.aliasIds && t.aliasIds.some(a => a.toLowerCase() === clean));
    if (byAlias) return byAlias;
    const bySlug = all.find(t => t.slug.toLowerCase() === clean || (t.aliasSlugs && t.aliasSlugs.some(s => s.toLowerCase() === clean)));
    if (bySlug) return bySlug;
    return all.find(t => 
      t.name.toLowerCase() === clean || 
      t.shortName.toLowerCase() === clean ||
      t.name.toLowerCase().includes(clean) ||
      clean.includes(t.name.toLowerCase())
    );
  },

  /**
   * Resolve an instructor from a name string or ID
   */
  resolveInstructor(nameOrId: string): TutorProfile | undefined {
    if (!nameOrId) return undefined;
    return this.getTutorById(nameOrId) || this.getTutorBySlug(nameOrId);
  },

  /**
   * Get all mentors assigned to a specific course title
   */
  getMentorsForCourse(courseTitle: string): TutorProfile[] {
    if (!courseTitle) return [];
    const norm = courseTitle.toLowerCase().trim();
    return this.getActiveTutors().filter(t => 
      t.programs?.some(p => {
        const pNorm = p.toLowerCase().trim();
        return pNorm === norm || norm.includes(pNorm) || pNorm.includes(norm);
      })
    );
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
          const deletedSet = getDeletedTutorIds();
          const map = new Map<string, TutorProfile>();
          DEFAULT_TUTORS.forEach(t => {
            if (!isTutorDeleted(t, deletedSet)) {
              map.set(t.id, t);
            }
          });
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as TutorProfile;
            if (data && docSnap.id) {
              const fullData = { ...data, id: docSnap.id };
              if (!isTutorDeleted(fullData, deletedSet)) {
                const existing = map.get(docSnap.id);
                map.set(docSnap.id, { 
                  ...existing,
                  ...data, 
                  id: docSnap.id,
                  slug: data.slug || existing?.slug || docSnap.id
                });
              } else {
                map.delete(docSnap.id);
              }
            }
          });
          const merged = Array.from(map.values()).filter(t => !isTutorDeleted(t, deletedSet));
          tutorsMemoryCache = merged;
          try {
            localStorage.setItem(TUTORS_STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          callback(merged);
        }, (err) => {
          if (err?.code === 'permission-denied' || String(err?.message || '').includes('permission')) {
            handleFirestoreError(err, OperationType.GET, 'tutors');
          } else {
            console.warn('Firestore tutors subscription notice:', err.message);
          }
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
    if (norm.includes('front') || norm.includes('web dev') || norm.includes('software') || norm.includes('back') || norm.includes('full stack') || norm.includes('node') || norm.includes('react')) {
      const match = tutors.find(t => t.id === 'tch-lawal' || t.aliasIds?.includes('tch-lawal-frontend') || t.aliasIds?.includes('tch-lawal-backend'));
      if (match) return match;
    }
    if (norm.includes('cyber') || norm.includes('security') || norm.includes('ethical') || norm.includes('network')) {
      const match = tutors.find(t => t.id === 'tch-olamide-sec');
      if (match) return match;
    }
    if (norm.includes('data') || norm.includes('stat') || norm.includes('anal') || norm.includes('powerbi') || norm.includes('sql')) {
      const match = tutors.find(t => t.id === 'tch-stat-data');
      if (match) return match;
    }
    if (norm.includes('video') || norm.includes('media') || norm.includes('edit') || norm.includes('davinci') || norm.includes('premiere') || norm.includes('auto') || norm.includes('ai')) {
      const match = tutors.find(t => t.id === 'tch-precious' || t.aliasIds?.includes('tch-precious-video') || t.aliasIds?.includes('tch-precious-auto'));
      if (match) return match;
    }
    if (norm.includes('content') || norm.includes('photo') || norm.includes('story')) {
      const match = tutors.find(t => t.id === 'tch-rekay-content');
      if (match) return match;
    }
    if (norm.includes('design') || norm.includes('ui') || norm.includes('ux') || norm.includes('figma') || norm.includes('brand') || norm.includes('graphic')) {
      const match = tutors.find(t => 
        t.programs?.some(p => p.toLowerCase().includes('design') || p.toLowerCase().includes('graphic')) ||
        t.id === 'tch-precious' || 
        t.id === 'tch-rekay-content'
      );
      if (match) return match;
    }
    if (norm.includes('robot') || norm.includes('hardw') || norm.includes('iot') || norm.includes('embedded')) {
      const match = tutors.find(t => 
        t.programs?.some(p => p.toLowerCase().includes('robot') || p.toLowerCase().includes('hardw') || p.toLowerCase().includes('iot')) ||
        t.id === 'tch-ayo-product'
      );
      if (match) return match;
    }
    if (norm.includes('product') || norm.includes('engineer')) {
      const match = tutors.find(t => t.id === 'tch-ayo-product');
      if (match) return match;
    }

    return tutors[0] || DEFAULT_TUTORS[0];
  },

  /**
   * Get all tutors assigned to a specific program or subject
   */
  getTutorsForProgram(programName: string): TutorProfile[] {
    const tutors = this.getActiveTutors();
    if (!programName) return tutors;
    const norm = programName.toLowerCase().trim();
    return tutors.filter(t => 
      t.programs?.some(p => p.toLowerCase() === norm || norm.includes(p.toLowerCase()) || p.toLowerCase().includes(norm))
    );
  },

  /**
   * Assign multiple programs/subjects to a tutor
   */
  async assignProgramsToTutor(tutorId: string, programs: string[]): Promise<TutorProfile> {
    const tutor = this.getTutorById(tutorId);
    if (!tutor) throw new Error('Tutor not found');
    const updated: TutorProfile = {
      ...tutor,
      programs: Array.from(new Set(programs.map(p => p.trim()).filter(Boolean)))
    };
    return await this.updateTutor(updated);
  },

  /**
   * Create a new Faculty Mentor
   */
  async createTutor(tutorData: Omit<TutorProfile, 'id' | 'slug'> & { id?: string; slug?: string }): Promise<TutorProfile> {
    if (!isAdminAuthenticated() && !isSubAdminAuthenticated()) {
      throw new Error('Access Denied: Only authenticated administrators can add new faculty mentors.');
    }

    const cleanName = tutorData.name.trim();
    const baseSlug = (tutorData.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'mentor';
    let slug = baseSlug;
    const all = this.getAllTutors();
    
    // Ensure slug uniqueness
    let counter = 1;
    while (all.some(t => t.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const newId = tutorData.id || `tch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newTutor: TutorProfile = {
      ...tutorData,
      id: newId,
      slug,
      shortName: tutorData.shortName || cleanName.split(' ')[0],
      programs: Array.isArray(tutorData.programs) && tutorData.programs.length > 0 ? tutorData.programs : ['General Mentorship'],
      status: tutorData.status || 'active',
      verificationStatus: tutorData.verificationStatus || 'verified',
      joinedDate: tutorData.joinedDate || new Date().toISOString().split('T')[0],
      color: tutorData.color || '#a855f7',
      isCustom: true
    };

    const updatedList = [...all, newTutor];
    tutorsMemoryCache = updatedList;
    try {
      localStorage.setItem(TUTORS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch {}

    tutorListeners.forEach(cb => cb(updatedList));

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'tutors', newTutor.id), {
          ...newTutor,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Notice saving new tutor to Firebase:', e);
      }
    }

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('orbit-tutors-updated', { detail: newTutor }));

    return newTutor;
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
    if (!isAdminAuthenticated() && !isSubAdminAuthenticated()) {
      throw new Error('Access Denied: Only authenticated academic administrators or authorized sub-admins can edit tutor information.');
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
    const { TeachingHoursLedgerService } = await import('./teachingHoursLedgerService');

    // 1. Admin-Entered Historical Baseline (Distinct from digital platform attendance)
    const baseline = tutor.historicalBaseline;
    const historicalStudentsTaught = Number(baseline?.historicalStudentsTaught ?? tutor.baseStudentsCount ?? 0);
    const historicalStudentsCertified = Number(baseline?.historicalStudentsCertified ?? 0);
    const historicalProjectsSupervised = Number(baseline?.historicalProjectsSupervised ?? 0);

    const allTargetIds = new Set<string>([tutor.id.toLowerCase(), ...(tutor.aliasIds || []).map(a => a.toLowerCase())]);
    const cleanShort = tutor.shortName.toLowerCase().trim();
    const cleanName = tutor.name.toLowerCase().trim();
    const cleanSlug = tutor.slug.toLowerCase().trim();
    const cleanId = tutor.id.toLowerCase().trim();

    // 2. Real Verified Teaching Sessions from Attendance check-in / check-out across canonical ID and aliases
    const allClassSessions = await AttendanceService.getAllClassSessions();
    const sessions = allClassSessions.filter(s => {
      const sId = (s.tutor?.id || '').toLowerCase().trim();
      const sName = (s.tutor?.name || '').toLowerCase().trim();
      return (sId && allTargetIds.has(sId)) || (sName && (sName.includes(cleanShort) || cleanName.includes(sName)));
    });

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

    // Sync any un-recorded digital sessions into TeachingHoursLedger (avoiding duplicate entries via sessionId)
    teachingHistory.forEach((s) => {
      if (s.durationHours > 0) {
        TeachingHoursLedgerService.recordAttendanceSession({
          sessionId: s.sessionId,
          lecturerId: tutor.id,
          lecturerName: tutor.name,
          course: s.course,
          cohort: s.cohort,
          date: s.date,
          durationHours: s.durationHours,
          sessionTopic: s.topic
        }).catch(() => {});
      }
    });

    // Also sync verified teaching hours from VerificationDataService into ledger if needed
    allTargetIds.forEach(targetId => {
      const additionalHours = VerificationDataService.getTeachingHoursForTutor(targetId)
        .filter((h) => h.verificationStatus === 'verified');
      additionalHours.forEach((h) => {
        if (h.durationHours > 0) {
          TeachingHoursLedgerService.recordAttendanceSession({
            sessionId: h.id,
            lecturerId: tutor.id,
            lecturerName: tutor.name,
            course: h.program,
            date: h.date,
            durationHours: h.durationHours,
            sessionTopic: h.topicCovered
          }).catch(() => {});
        }
      });
    });

    // Compute verified ledger summary across all target IDs
    let historicalTeachingHours = 0;
    let newAttendanceHours = 0;
    let adjustmentHours = 0;
    const allLedgerEntries = TeachingHoursLedgerService.getAllEntries();
    const lecturerLedgerEntries = allLedgerEntries.filter(e => {
      const eId = (e.lecturerId || '').toLowerCase().trim();
      const eName = (e.lecturerName || '').toLowerCase().trim();
      return allTargetIds.has(eId) || (eName && (eName.includes(cleanShort) || cleanName.includes(eName)));
    });
    lecturerLedgerEntries.forEach(e => {
      const h = Number(e.hours) || 0;
      if (e.type === 'historical') historicalTeachingHours += h;
      else if (e.type === 'attendance') newAttendanceHours += h;
      else if (e.type === 'adjustment') adjustmentHours += h;
    });

    historicalTeachingHours = 0;
    newAttendanceHours = Math.round(newAttendanceHours * 10) / 10;
    adjustmentHours = Math.round(adjustmentHours * 10) / 10;
    const totalTeachingHours = Math.max(0, Math.round((newAttendanceHours + adjustmentHours) * 10) / 10);

    // 3. Students Taught (from actual class enrollment & session attendance across all tutor's programs)
    const realStudents = await AttendanceService.getStudentsTaughtByTutor(tutor.id, tutor.programs);
    const studentsTaughtList = realStudents.map((st) => ({
      id: st.id,
      name: st.name,
      course: st.course,
      matricNumber: st.matricNumber
    }));
    // 4. Students Certified (calculated from students taught who subsequently received certificates)
    const allCerts = getCertificates().filter((c) => c.status !== 'revoked');

    const studentNamesTaughtSet = new Set(studentsTaughtList.map((s) => s.name.toLowerCase().trim()));

    const matchingCerts = allCerts.filter((cert) => {
      const supId = (cert.supervisingTutorId || '').toLowerCase().trim();
      const supSlug = (cert.supervisingTutorSlug || '').toLowerCase().trim();
      const supName = (cert.supervisingTutorName || '').toLowerCase().trim();
      const certStudent = (cert.studentName || '').toLowerCase().trim();
      const certCourse = (cert.course || '').toLowerCase().trim();
      const certNotes = (cert.additionalNotes || '').toLowerCase();

      // 1. Direct tutor match on certificate record or aliases
      if (supId) {
        if (allTargetIds.has(supId) || (supSlug && (supSlug === cleanSlug || (tutor.aliasSlugs && tutor.aliasSlugs.includes(supSlug))))) return true;
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

      // 4. Certified student was taught by this tutor in verified attendance/enrolment AND course matches
      if (studentNamesTaughtSet.has(certStudent)) {
        const matchesProgram = (tutor.programs || []).some(p => {
          const normP = p.toLowerCase().trim();
          return certCourse === normP || certCourse.includes(normP) || normP.includes(certCourse);
        });
        if (matchesProgram) {
          return true;
        }
      }

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
    const totalStudentsCertified = newStudentsCertified;

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
    const totalStudentsTaught = newStudentsTaught;

    // 5. Student Projects Supervised (from verified projects across canonical ID and aliases)
    const allProjects = VerificationDataService.getAllSupervisedProjects();
    const supervisedProjectsList = allProjects.filter((p) => {
      const pTutorId = (p.tutorId || '').toLowerCase().trim();
      const pTutorName = (p.tutorName || '').toLowerCase().trim();
      const matches = allTargetIds.has(pTutorId) || pTutorName.includes(cleanShort) || cleanName.includes(pTutorName);
      return matches && p.verificationStatus === 'verified';
    });
    const newProjectsSupervised = supervisedProjectsList.length;
    const totalProjectsSupervised = newProjectsSupervised;

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
      adjustmentHours,
      totalTeachingHours,
      attendanceSessionsCount: teachingHistory.length,
      ledgerEntries: lecturerLedgerEntries,

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
    if (!isAdminAuthenticated() && !isSubAdminAuthenticated()) {
      throw new Error('Access Denied: Only authenticated administrators can remove tutors.');
    }

    const all = this.getAllTutors();
    const tutorToDelete = all.find(t => 
      t.id.toLowerCase() === tutorId.toLowerCase() || 
      t.slug.toLowerCase() === tutorId.toLowerCase() || 
      t.aliasIds?.some(a => a.toLowerCase() === tutorId.toLowerCase())
    );

    const idsToRecord: string[] = [tutorId];
    if (tutorToDelete) {
      idsToRecord.push(tutorToDelete.id);
      if (tutorToDelete.slug) idsToRecord.push(tutorToDelete.slug);
      if (tutorToDelete.name) idsToRecord.push(tutorToDelete.name);
      if (tutorToDelete.shortName) idsToRecord.push(tutorToDelete.shortName);
      if (tutorToDelete.aliasIds && Array.isArray(tutorToDelete.aliasIds)) {
        idsToRecord.push(...tutorToDelete.aliasIds);
      }
    }

    saveDeletedTutorIds(idsToRecord);
    const deletedSet = getDeletedTutorIds();

    const filtered = all.filter(t => !isTutorDeleted(t, deletedSet));
    tutorsMemoryCache = filtered;

    try {
      localStorage.setItem(TUTORS_STORAGE_KEY, JSON.stringify(filtered));
    } catch {}

    tutorListeners.forEach(cb => cb(filtered));

    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'tutors', tutorId));
      } catch (err: any) {
        if (err?.code === 'permission-denied' || String(err?.message || '').includes('permission')) {
          handleFirestoreError(err, OperationType.DELETE, `tutors/${tutorId}`);
        } else {
          console.warn('Firestore tutor delete notice:', err?.message || err);
        }
      }

      if (tutorToDelete && tutorToDelete.id !== tutorId) {
        try {
          await deleteDoc(doc(db, 'tutors', tutorToDelete.id));
        } catch {
          // ignore alias delete failure
        }
      }

      try {
        await setDoc(doc(db, 'system_metadata', 'deleted_tutors'), {
          deletedIds: Array.from(deletedSet),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err: any) {
        if (err?.code === 'permission-denied' || String(err?.message || '').includes('permission')) {
          handleFirestoreError(err, OperationType.WRITE, 'system_metadata/deleted_tutors');
        } else {
          console.warn('Firestore metadata write notice:', err?.message || err);
        }
      }
    }

    // Cascade to Timetable slots
    try {
      const slots = getLocalTimetableSlots();
      const matchInstructor = (slotInstructor: string) => {
        if (!slotInstructor) return false;
        const norm = slotInstructor.toLowerCase().trim();
        return idsToRecord.some(id => norm.includes(id.toLowerCase().trim()));
      };

      for (const slot of slots) {
        if (matchInstructor(slot.instructor)) {
          await saveTimetableSlot({
            ...slot,
            instructor: 'Faculty (To Be Announced)'
          });
        }
      }
    } catch (err) {
      console.warn('Notice clearing instructor from timetable slots:', err);
    }

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('orbit-tutors-updated', { detail: { deletedId: tutorId } }));
    return true;
  },

  /**
   * Set or update tutor account credentials
   */
  async setTutorAccount(tutorId: string, account: TutorAccountCredentials): Promise<boolean> {
    const tutor = this.getTutorById(tutorId);
    if (!tutor) return false;

    await this.updateTutor({
      ...tutor,
      account
    });
    return true;
  },

  /**
   * Reset or update tutor password
   */
  async resetTutorPassword(tutorId: string, newPassword: string): Promise<boolean> {
    const tutor = this.getTutorById(tutorId);
    if (!tutor) return false;

    const currentAccount = tutor.account || {
      hasAccount: true,
      username: tutor.email,
      accountStatus: tutor.status || 'active'
    };

    await this.updateTutor({
      ...tutor,
      account: {
        ...currentAccount,
        initialPassword: newPassword
      }
    });
    return true;
  },

  /**
   * Toggle teacher account status (active vs deactivated)
   */
  async toggleTutorAccountStatus(tutorId: string): Promise<boolean> {
    const tutor = this.getTutorById(tutorId);
    if (!tutor) return false;

    const nextStatus = tutor.status === 'active' ? 'deactivated' : 'active';
    const currentAccount = tutor.account || {
      hasAccount: true,
      username: tutor.email,
      accountStatus: nextStatus
    };

    await this.updateTutor({
      ...tutor,
      status: nextStatus,
      account: {
        ...currentAccount,
        accountStatus: nextStatus
      }
    });
    return true;
  },

  /**
   * Add a single program to tutor
   */
  async addProgramToTutor(tutorId: string, program: string): Promise<boolean> {
    const tutor = this.getTutorById(tutorId);
    if (!tutor) return false;

    const currentPrograms = tutor.programs || [];
    if (!currentPrograms.includes(program.trim())) {
      await this.updateTutor({
        ...tutor,
        programs: [...currentPrograms, program.trim()]
      });
    }
    return true;
  },

  /**
   * Remove a program from tutor
   */
  async removeProgramFromTutor(tutorId: string, program: string): Promise<boolean> {
    const tutor = this.getTutorById(tutorId);
    if (!tutor) return false;

    const currentPrograms = tutor.programs || [];
    await this.updateTutor({
      ...tutor,
      programs: currentPrograms.filter(p => p.toLowerCase() !== program.toLowerCase().trim())
    });
    return true;
  }
};
