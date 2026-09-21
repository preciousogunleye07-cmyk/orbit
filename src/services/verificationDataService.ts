import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { isAdminAuthenticated } from './certificateService';
import { TutorProfile, TutorService } from './tutorService';

// Teaching Session Record
export interface TeachingHourRecord {
  id: string; // e.g. "th-202603-001"
  tutorId: string;
  tutorName: string;
  program: string;
  date: string; // YYYY-MM-DD
  durationHours: number; // e.g. 2, 2.5, 3
  studentsCount: number;
  topicCovered: string;
  sessionNotes?: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

// Student Supervised Project Record
export interface SupervisedProjectRecord {
  id: string; // e.g. "proj-9f8a2e"
  verificationSlug: string; // unique slug for /project/verify/[slug]
  title: string;
  description: string;
  studentName: string;
  studentIdOrRef?: string; // privacy safe identifier (e.g. "OS-2025-089")
  program: string;
  category: 'web' | 'mobile' | 'security' | 'data' | 'ai' | 'creative' | 'embedded';
  projectUrl?: string;
  repoUrl?: string;
  documentUrl?: string; // PDF or file presentation data URL / link
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  tutorId: string;
  tutorName: string;
  tutorRole?: string;
  supervisionDate: string; // YYYY-MM-DD
  visibility: 'public' | 'private' | 'certificate-only';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  linkedCertificateId?: string; // Links to CertificateRecord e.g. "ORB-8F29K2"
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

const TEACHING_HOURS_STORAGE = 'orbit_space_teaching_hours_v1';
const SUPERVISED_PROJECTS_STORAGE = 'orbit_space_supervised_projects_v1';

// Seed authentic historical teaching hours and supervised projects
export const DEFAULT_TEACHING_HOURS: TeachingHourRecord[] = [
  {
    id: 'th-lawal-001',
    tutorId: 'tch-lawal-frontend',
    tutorName: 'Lawal',
    program: 'Front End Development',
    date: '2026-03-10',
    durationHours: 2.5,
    studentsCount: 16,
    topicCovered: 'Modern React Architecture & Custom State Stores with TypeScript',
    sessionNotes: 'Deep dive into performant state reconciliation and design tokens.',
    verificationStatus: 'verified',
    verifiedBy: 'Academic Director (Precious Ogunleye)',
    verifiedAt: '2026-03-10T16:00:00Z',
    createdAt: '2026-03-10T14:30:00Z'
  },
  {
    id: 'th-lawal-002',
    tutorId: 'tch-lawal-frontend',
    tutorName: 'Lawal',
    program: 'Web Development',
    date: '2026-03-12',
    durationHours: 3.0,
    studentsCount: 18,
    topicCovered: 'RESTful Endpoints, Microservices & PostgreSQL ORM Integration',
    verificationStatus: 'verified',
    verifiedBy: 'Academic Director',
    verifiedAt: '2026-03-12T17:00:00Z',
    createdAt: '2026-03-12T15:00:00Z'
  },
  {
    id: 'th-olamide-001',
    tutorId: 'tch-olamide-sec',
    tutorName: 'Olamide',
    program: 'Cyber Security',
    date: '2026-03-11',
    durationHours: 3.0,
    studentsCount: 14,
    topicCovered: 'SOC Defense, Wireshark Network Packet Inspection & SIEM Triage',
    verificationStatus: 'verified',
    verifiedBy: 'Academic Director',
    verifiedAt: '2026-03-11T18:00:00Z',
    createdAt: '2026-03-11T15:30:00Z'
  },
  {
    id: 'th-olamide-002',
    tutorId: 'tch-olamide-sec',
    tutorName: 'Olamide',
    program: 'Cyber Security',
    date: '2026-03-14',
    durationHours: 2.5,
    studentsCount: 12,
    topicCovered: 'OWASP Top 10 Web Exploits & Defense Simulations in Lab 1',
    verificationStatus: 'verified',
    verifiedBy: 'Academic Director',
    verifiedAt: '2026-03-14T17:30:00Z',
    createdAt: '2026-03-14T15:00:00Z'
  },
  {
    id: 'th-stat-001',
    tutorId: 'tch-stat-data',
    tutorName: 'Mr. Stat',
    program: 'Data Analysis',
    date: '2026-03-09',
    durationHours: 2.5,
    studentsCount: 19,
    topicCovered: 'Power BI DAX Formulas, ETL Pipelines & Interactive KPI Dashboards',
    verificationStatus: 'verified',
    verifiedBy: 'Academic Director',
    verifiedAt: '2026-03-09T18:00:00Z',
    createdAt: '2026-03-09T15:30:00Z'
  },
  {
    id: 'th-precious-001',
    tutorId: 'tch-precious-video',
    tutorName: 'Precious',
    program: 'Video Editing',
    date: '2026-03-13',
    durationHours: 3.0,
    studentsCount: 15,
    topicCovered: 'Premiere Pro Lumetri Color Grading, Motion Graphics & Audio Mix',
    verificationStatus: 'verified',
    verifiedBy: 'Admin Office',
    verifiedAt: '2026-03-13T17:00:00Z',
    createdAt: '2026-03-13T14:00:00Z'
  }
];

export const DEFAULT_SUPERVISED_PROJECTS: SupervisedProjectRecord[] = [
  {
    id: 'proj-8f29k2-ecommerce',
    verificationSlug: 'michael-adebayo-fintech-ledger',
    title: 'Distributed Enterprise Multi-Vendor Escrow & Inventory Engine',
    description: 'A production-grade multi-vendor platform featuring real-time socket inventory synchronization, automated paystack escrow settlement, and idempotent webhook routing.',
    studentName: 'Michael Adebayo',
    studentIdOrRef: 'OS-2025-089',
    program: 'Full-Stack Web Development',
    category: 'web',
    projectUrl: 'https://orbitspace.academy/projects/michael-escrow',
    repoUrl: 'https://github.com/orbitspace-capstone/escrow-engine',
    tutorId: 'tch-lawal-frontend',
    tutorName: 'Lawal (Senior Frontend Lead)',
    tutorRole: 'Senior Full Stack Lead & Mentor',
    supervisionDate: '2026-02-12',
    visibility: 'public',
    verificationStatus: 'verified',
    linkedCertificateId: 'ORB-8F29K2',
    verifiedBy: 'Precious Ogunleye (Admin Director)',
    verifiedAt: '2026-02-15T10:30:00Z',
    createdAt: '2026-02-12T11:00:00Z'
  },
  {
    id: 'proj-19v8q3-dashboard',
    verificationSlug: 'precious-adewale-design-tokens-suite',
    title: 'High-Density Accessible Analytics & Design Token Engine',
    description: 'Micro-frontend user interface system built with React 19, strict accessibility compliance, dynamic canvas data visualizers, and offline caching.',
    studentName: 'Precious Adewale Ogunleye',
    studentIdOrRef: 'OS-2025-014',
    program: 'Frontend Engineering',
    category: 'web',
    projectUrl: 'https://orbitspace.academy/projects/precious-analytics',
    repoUrl: 'https://github.com/orbitspace-capstone/design-system',
    tutorId: 'tch-lawal-frontend',
    tutorName: 'Lawal (Senior Frontend Lead)',
    tutorRole: 'Senior Full Stack Lead',
    supervisionDate: '2026-02-25',
    visibility: 'public',
    verificationStatus: 'verified',
    linkedCertificateId: 'ORB-19V8Q3',
    verifiedBy: 'Admin Office',
    verifiedAt: '2026-02-28T09:00:00Z',
    createdAt: '2026-02-25T14:00:00Z'
  },
  {
    id: 'proj-47n3k1-soc-defense',
    verificationSlug: 'amina-bello-enterprise-siem-defense',
    title: 'Automated SOC Incident Response & Threat Hunting Framework',
    description: 'An operational honeypot network integrated with Wazuh SIEM and Suricata IDS to detect and automatically quarantine credential brute-force and DDoS vectors.',
    studentName: 'Amina Bello',
    studentIdOrRef: 'OS-2025-102',
    program: 'Cybersecurity',
    category: 'security',
    projectUrl: 'https://orbitspace.academy/projects/amina-soc',
    tutorId: 'tch-olamide-sec',
    tutorName: 'Olamide (Lead Security Engineer)',
    tutorRole: 'Lead Security Engineer & SOC Analyst',
    supervisionDate: '2026-03-01',
    visibility: 'public',
    verificationStatus: 'verified',
    linkedCertificateId: 'ORB-47N3K1',
    verifiedBy: 'Academic Director',
    verifiedAt: '2026-03-05T12:00:00Z',
    createdAt: '2026-03-01T16:00:00Z'
  },
  {
    id: 'proj-23x7m8-churn-analysis',
    verificationSlug: 'emmanuel-fashola-telecom-churn-bi',
    title: 'Predictive Customer Churn Model & Executive Power BI Dashboard',
    description: 'Exploratory data analytics and predictive classification on 75,000 subscriber records with executive KPI dashboards in PowerBI.',
    studentName: 'Emmanuel Fashola',
    studentIdOrRef: 'OS-2025-077',
    program: 'Data Analysis',
    category: 'data',
    projectUrl: 'https://orbitspace.academy/projects/emmanuel-churn',
    tutorId: 'tch-stat-data',
    tutorName: 'Mr. Stat (Lead Data Science Mentor)',
    tutorRole: 'Statistics & Analytics Lead',
    supervisionDate: '2026-02-18',
    visibility: 'public',
    verificationStatus: 'verified',
    linkedCertificateId: 'ORB-23X7M8',
    verifiedBy: 'Academic Director',
    verifiedAt: '2026-02-20T11:00:00Z',
    createdAt: '2026-02-18T10:00:00Z'
  }
];

let hoursMemory: TeachingHourRecord[] | null = null;
let projectsMemory: SupervisedProjectRecord[] | null = null;

export const VerificationDataService = {
  // --- TEACHING HOURS ---
  getAllTeachingHours(): TeachingHourRecord[] {
    if (hoursMemory) return hoursMemory;
    try {
      const raw = localStorage.getItem(TEACHING_HOURS_STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          hoursMemory = parsed;
          return hoursMemory;
        }
      }
    } catch {}
    hoursMemory = [...DEFAULT_TEACHING_HOURS];
    return hoursMemory;
  },

  getTeachingHoursForTutor(tutorIdOrName: string): TeachingHourRecord[] {
    const all = this.getAllTeachingHours();
    const query = tutorIdOrName.toLowerCase().trim();
    return all.filter(h => 
      h.tutorId.toLowerCase() === query || 
      h.tutorName.toLowerCase().includes(query) ||
      query.includes(h.tutorName.toLowerCase())
    );
  },

  getTotalVerifiedHours(tutorIdOrName: string, verifiedBaseHours: number = 0): number {
    const sessions = this.getTeachingHoursForTutor(tutorIdOrName).filter(s => s.verificationStatus === 'verified');
    const loggedSum = sessions.reduce((acc, curr) => acc + (curr.durationHours || 0), 0);
    return Math.max(verifiedBaseHours, verifiedBaseHours + loggedSum);
  },

  async recordTeachingSession(session: Omit<TeachingHourRecord, 'id' | 'createdAt'>): Promise<TeachingHourRecord> {
    const id = `th-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: TeachingHourRecord = {
      ...session,
      id,
      createdAt: new Date().toISOString()
    };

    const all = this.getAllTeachingHours();
    const updated = [newRecord, ...all];
    hoursMemory = updated;
    try {
      localStorage.setItem(TEACHING_HOURS_STORAGE, JSON.stringify(updated));
    } catch {}

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'teaching_hours', id), newRecord);
      } catch (e) {
        console.warn('Firestore teaching hour write:', e);
      }
    }

    window.dispatchEvent(new Event('storage'));
    return newRecord;
  },

  async verifyTeachingSession(sessionId: string, verified: boolean, adminName: string): Promise<boolean> {
    if (!isAdminAuthenticated()) {
      throw new Error('Unauthorized: Admin access required.');
    }

    const all = this.getAllTeachingHours();
    const idx = all.findIndex(h => h.id === sessionId);
    if (idx < 0) return false;

    all[idx] = {
      ...all[idx],
      verificationStatus: verified ? 'verified' : 'rejected',
      verifiedBy: adminName,
      verifiedAt: new Date().toISOString()
    };

    hoursMemory = [...all];
    try {
      localStorage.setItem(TEACHING_HOURS_STORAGE, JSON.stringify(hoursMemory));
    } catch {}

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'teaching_hours', sessionId), all[idx], { merge: true });
      } catch (e) {
        console.warn('Firestore session update:', e);
      }
    }

    window.dispatchEvent(new Event('storage'));
    return true;
  },

  // --- SUPERVISED PROJECTS ---
  getAllSupervisedProjects(): SupervisedProjectRecord[] {
    if (projectsMemory) return projectsMemory;
    try {
      const raw = localStorage.getItem(SUPERVISED_PROJECTS_STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          projectsMemory = parsed;
          return projectsMemory;
        }
      }
    } catch {}
    projectsMemory = [...DEFAULT_SUPERVISED_PROJECTS];
    return projectsMemory;
  },

  getProjectsForTutor(tutorIdOrName: string, publicOnly: boolean = false): SupervisedProjectRecord[] {
    const all = this.getAllSupervisedProjects();
    const query = tutorIdOrName.toLowerCase().trim();
    return all.filter(p => {
      const match = (
        p.tutorId.toLowerCase() === query || 
        p.tutorName.toLowerCase().includes(query) ||
        query.includes(p.tutorName.toLowerCase())
      );
      if (!match) return false;
      if (publicOnly) {
        return p.verificationStatus === 'verified' && p.visibility !== 'private';
      }
      return true;
    });
  },

  getProjectBySlug(slug: string): SupervisedProjectRecord | undefined {
    const all = this.getAllSupervisedProjects();
    const norm = slug.toLowerCase().trim();
    return all.find(p => p.verificationSlug.toLowerCase() === norm || p.id.toLowerCase() === norm);
  },

  getProjectByCertificateId(certId: string): SupervisedProjectRecord | undefined {
    const all = this.getAllSupervisedProjects();
    const norm = certId.toUpperCase().trim();
    return all.find(p => (p.linkedCertificateId || '').toUpperCase() === norm);
  },

  async uploadStudentProject(project: Omit<SupervisedProjectRecord, 'id' | 'verificationSlug' | 'createdAt'>): Promise<SupervisedProjectRecord> {
    const id = `proj-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const slug = `${project.studentName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.substring(0, 60);

    const newRecord: SupervisedProjectRecord = {
      ...project,
      id,
      verificationSlug: slug,
      createdAt: new Date().toISOString()
    };

    const all = this.getAllSupervisedProjects();
    const updated = [newRecord, ...all];
    projectsMemory = updated;
    try {
      localStorage.setItem(SUPERVISED_PROJECTS_STORAGE, JSON.stringify(updated));
    } catch {}

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'supervised_projects', id), newRecord);
      } catch (e) {
        console.warn('Firestore project write:', e);
      }
    }

    window.dispatchEvent(new Event('storage'));
    return newRecord;
  },

  async setProjectVerification(projectId: string, status: 'verified' | 'rejected', adminName: string): Promise<boolean> {
    if (!isAdminAuthenticated()) {
      throw new Error('Unauthorized: Admin access required.');
    }

    const all = this.getAllSupervisedProjects();
    const idx = all.findIndex(p => p.id === projectId);
    if (idx < 0) return false;

    all[idx] = {
      ...all[idx],
      verificationStatus: status,
      verifiedBy: adminName,
      verifiedAt: new Date().toISOString()
    };

    projectsMemory = [...all];
    try {
      localStorage.setItem(SUPERVISED_PROJECTS_STORAGE, JSON.stringify(projectsMemory));
    } catch {}

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'supervised_projects', projectId), all[idx], { merge: true });
      } catch (e) {
        console.warn('Firestore project update:', e);
      }
    }

    window.dispatchEvent(new Event('storage'));
    return true;
  },

  /**
   * Safe file validation
   */
  validateProjectFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 12 * 1024 * 1024; // 12 MB
    const ALLOWED_TYPES = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/zip',
      'text/plain'
    ];

    if (file.size > MAX_SIZE) {
      return { valid: false, error: 'File size exceeds 12 MB limit. Please upload a smaller summary PDF or archive.' };
    }

    if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.zip')) {
      return { valid: false, error: 'File format not supported. Allowed: PDF, PNG, JPG, ZIP, TXT.' };
    }

    return { valid: true };
  }
};
