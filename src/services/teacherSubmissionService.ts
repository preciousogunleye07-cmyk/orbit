import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from './firebase';
import { TutorService, TutorProfile } from './tutorService';
import { isAdminAuthenticated } from './certificateService';
import { isSubAdminAuthenticated } from './subAdminService';

export interface TeacherInviteLink {
  id: string;
  courseTitle: string;
  courseSlug: string;
  token: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  submissionCount: number;
}

export interface TeacherSubmission {
  id: string;
  courseTitle: string;
  courseSlug: string;
  token?: string;
  
  // Teacher profile fields
  fullName: string;
  title: string; // e.g. Senior UX Architect
  email: string;
  phone: string;
  photoUrl?: string;
  bio: string;
  skills: string[];
  experienceYears?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  projectHighlights?: string;
  teachingStatement?: string;
  
  status: 'pending' | 'adopted' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adoptedTutorId?: string;
  rejectionReason?: string;
}

const SUBMISSIONS_STORAGE_KEY = 'orbit_teacher_submissions_v1';
const INVITE_LINKS_STORAGE_KEY = 'orbit_teacher_invite_links_v1';

// Seed authentic default courses for instant link creation
export const DEFAULT_AVAILABLE_COURSES = [
  { title: 'UI/UX Design', slug: 'ui-ux' },
  { title: 'Full-Stack Web Development', slug: 'web-dev' },
  { title: 'Cybersecurity & Ethical Hacking', slug: 'cybersecurity' },
  { title: 'Data Analysis & Science', slug: 'data-analysis' },
  { title: 'Graphics & Brand Identity', slug: 'graphics-design' },
  { title: 'Digital Video Production', slug: 'video-editing' },
  { title: 'Product Engineering', slug: 'product-engineering' },
  { title: 'AI Automation & Prompt Engineering', slug: 'ai-automation' },
  { title: 'Robotics & Hardware Engineering', slug: 'robotics' },
  { title: 'Statistics & Business Intelligence', slug: 'statistics' }
];

// Helper to convert course title to slug
export function courseTitleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[&/]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate random secure token
function generateSecureToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'sec_';
  for (let i = 0; i < 20; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

let submissionsMemory: TeacherSubmission[] | null = null;
let inviteLinksMemory: TeacherInviteLink[] | null = null;
const submissionListeners = new Set<(submissions: TeacherSubmission[]) => void>();
const linkListeners = new Set<(links: TeacherInviteLink[]) => void>();

function notifySubmissions() {
  const subs = TeacherSubmissionService.getAllSubmissions();
  submissionListeners.forEach(fn => fn(subs));
}

function notifyLinks() {
  const links = TeacherSubmissionService.getInviteLinks();
  linkListeners.forEach(fn => fn(links));
}

export const TeacherSubmissionService = {
  /**
   * Get all teacher submissions
   */
  getAllSubmissions(): TeacherSubmission[] {
    if (submissionsMemory !== null) {
      return submissionsMemory;
    }
    try {
      const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (raw) {
        submissionsMemory = JSON.parse(raw);
        return submissionsMemory || [];
      }
    } catch {}
    submissionsMemory = [];
    return submissionsMemory;
  },

  /**
   * Get submissions by status
   */
  getSubmissionsByStatus(status: 'pending' | 'adopted' | 'rejected'): TeacherSubmission[] {
    return this.getAllSubmissions().filter(s => s.status === status);
  },

  /**
   * Get pending submissions count
   */
  getPendingCount(): number {
    return this.getSubmissionsByStatus('pending').length;
  },

  /**
   * Get submission by ID
   */
  getSubmissionById(id: string): TeacherSubmission | null {
    return this.getAllSubmissions().find(s => s.id === id) || null;
  },

  /**
   * Submit a new teacher application (Public, no login required)
   */
  async createSubmission(
    data: Omit<TeacherSubmission, 'id' | 'status' | 'submittedAt'>
  ): Promise<TeacherSubmission> {
    const newSubmission: TeacherSubmission = {
      ...data,
      id: `tsub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    // Save to local cache
    const current = this.getAllSubmissions();
    const updated = [newSubmission, ...current];
    submissionsMemory = updated;
    try {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Increment submission count on the invite link if token matches
    if (data.token) {
      this.incrementLinkSubmissionCount(data.token);
    }

    // Sync to Firestore
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'teacher_submissions', newSubmission.id), newSubmission);
      } catch (e) {
        console.warn('Firestore teacher submission sync warning:', e);
      }
    }

    notifySubmissions();
    return newSubmission;
  },

  /**
   * Admin Adopts / Approves a teacher submission.
   * This immediately transforms the submission into an active faculty profile on the academy portal!
   */
  async adoptSubmission(
    submissionId: string, 
    adminName: string = 'Super Administrator'
  ): Promise<{ submission: TeacherSubmission; tutor: TutorProfile }> {
    if (!isAdminAuthenticated() && !isSubAdminAuthenticated()) {
      throw new Error('Access Denied: Only administrators can adopt faculty submissions.');
    }

    const submission = this.getSubmissionById(submissionId);
    if (!submission) {
      throw new Error('Teacher submission not found.');
    }

    // 1. Create live TutorProfile in TutorService
    const cleanName = submission.fullName.trim();
    const shortName = cleanName.split(' ')[0];
    const initialTutorData: Omit<TutorProfile, 'id' | 'slug'> = {
      name: cleanName,
      shortName: shortName,
      email: submission.email.trim(),
      phone: submission.phone?.trim() || '',
      role: submission.title.trim() || `${submission.courseTitle} Lead Faculty`,
      specialization: submission.skills.length > 0 ? submission.skills.join(', ') : submission.courseTitle,
      programs: [submission.courseTitle],
      bio: submission.bio.trim(),
      photoUrl: submission.photoUrl?.trim() || undefined,
      linkedinUrl: submission.linkedinUrl?.trim() || undefined,
      portfolioUrl: submission.portfolioUrl?.trim() || undefined,
      githubUrl: submission.githubUrl?.trim() || undefined,
      status: 'active',
      verificationStatus: 'verified',
      joinedDate: new Date().toISOString().split('T')[0],
      color: '#a855f7'
    };

    const newTutor = await TutorService.createTutor(initialTutorData);

    // 2. Update submission status to 'adopted'
    const updatedSubmission: TeacherSubmission = {
      ...submission,
      status: 'adopted',
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminName,
      adoptedTutorId: newTutor.id
    };

    const all = this.getAllSubmissions().map(s => s.id === submissionId ? updatedSubmission : s);
    submissionsMemory = all;
    try {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    // Firestore sync
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'teacher_submissions', updatedSubmission.id), updatedSubmission, { merge: true });
      } catch (e) {
        console.warn('Firestore teacher submission update warning:', e);
      }
    }

    notifySubmissions();
    return { submission: updatedSubmission, tutor: newTutor };
  },

  /**
   * Admin Rejects a teacher submission
   */
  async rejectSubmission(
    submissionId: string, 
    reason: string = 'Application did not match current faculty criteria.',
    adminName: string = 'Super Administrator'
  ): Promise<TeacherSubmission> {
    if (!isAdminAuthenticated() && !isSubAdminAuthenticated()) {
      throw new Error('Access Denied: Only administrators can reject teacher submissions.');
    }

    const submission = this.getSubmissionById(submissionId);
    if (!submission) {
      throw new Error('Teacher submission not found.');
    }

    const updatedSubmission: TeacherSubmission = {
      ...submission,
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminName,
      rejectionReason: reason
    };

    const all = this.getAllSubmissions().map(s => s.id === submissionId ? updatedSubmission : s);
    submissionsMemory = all;
    try {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'teacher_submissions', updatedSubmission.id), updatedSubmission, { merge: true });
      } catch (e) {
        console.warn('Firestore teacher submission reject warning:', e);
      }
    }

    notifySubmissions();
    return updatedSubmission;
  },

  /**
   * Delete a submission (permanent)
   */
  async deleteSubmission(submissionId: string): Promise<boolean> {
    if (!isAdminAuthenticated() && !isSubAdminAuthenticated()) {
      throw new Error('Access Denied: Only administrators can delete teacher submissions.');
    }

    const all = this.getAllSubmissions().filter(s => s.id !== submissionId);
    submissionsMemory = all;
    try {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'teacher_submissions', submissionId));
      } catch (e) {
        console.warn('Firestore teacher submission delete warning:', e);
      }
    }

    notifySubmissions();
    return true;
  },

  /**
   * Get all active invite links
   */
  getInviteLinks(): TeacherInviteLink[] {
    if (inviteLinksMemory !== null) {
      return inviteLinksMemory;
    }
    try {
      const raw = localStorage.getItem(INVITE_LINKS_STORAGE_KEY);
      if (raw) {
        inviteLinksMemory = JSON.parse(raw);
        return inviteLinksMemory || [];
      }
    } catch {}

    // Initialize with default links for standard courses
    const initialLinks: TeacherInviteLink[] = DEFAULT_AVAILABLE_COURSES.map(c => ({
      id: `link-${c.slug}`,
      courseTitle: c.title,
      courseSlug: c.slug,
      token: generateSecureToken(),
      createdAt: new Date().toISOString(),
      createdBy: 'Academic Council',
      isActive: true,
      submissionCount: 0
    }));

    inviteLinksMemory = initialLinks;
    try {
      localStorage.setItem(INVITE_LINKS_STORAGE_KEY, JSON.stringify(initialLinks));
    } catch {}
    return inviteLinksMemory;
  },

  /**
   * Generate or retrieve a course-specific public teacher invite link
   */
  async generateInviteLink(courseTitle: string, adminName: string = 'Administrator'): Promise<TeacherInviteLink> {
    const slug = courseTitleToSlug(courseTitle);
    const existing = this.getInviteLinks().find(l => l.courseSlug === slug && l.isActive);
    if (existing) {
      return existing;
    }

    const newLink: TeacherInviteLink = {
      id: `link-${slug}-${Date.now().toString(36)}`,
      courseTitle: courseTitle.trim(),
      courseSlug: slug,
      token: generateSecureToken(),
      createdAt: new Date().toISOString(),
      createdBy: adminName,
      isActive: true,
      submissionCount: 0
    };

    const all = [newLink, ...this.getInviteLinks()];
    inviteLinksMemory = all;
    try {
      localStorage.setItem(INVITE_LINKS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'teacher_invite_links', newLink.id), newLink);
      } catch (e) {
        console.warn('Firestore invite link save warning:', e);
      }
    }

    notifyLinks();
    return newLink;
  },

  /**
   * Increment submission count on invite link
   */
  incrementLinkSubmissionCount(token: string) {
    const all = this.getInviteLinks();
    const target = all.find(l => l.token === token);
    if (target) {
      target.submissionCount = (target.submissionCount || 0) + 1;
      inviteLinksMemory = [...all];
      try {
        localStorage.setItem(INVITE_LINKS_STORAGE_KEY, JSON.stringify(all));
      } catch {}
      if (isFirebaseConfigured() && db) {
        setDoc(doc(db, 'teacher_invite_links', target.id), target, { merge: true }).catch(() => {});
      }
      notifyLinks();
    }
  },

  /**
   * Resolve course details from slug and token
   */
  resolveCourseFromSlug(courseSlug: string, token?: string): { courseTitle: string; courseSlug: string; isValid: boolean } {
    const cleanSlug = courseSlug.toLowerCase().trim();
    const links = this.getInviteLinks();
    
    // Check if token matches directly
    if (token) {
      const matchWithToken = links.find(l => l.courseSlug === cleanSlug && l.token === token && l.isActive);
      if (matchWithToken) {
        return { courseTitle: matchWithToken.courseTitle, courseSlug: matchWithToken.courseSlug, isValid: true };
      }
    }

    // Check slug match
    const matchSlug = links.find(l => l.courseSlug === cleanSlug && l.isActive);
    if (matchSlug) {
      return { courseTitle: matchSlug.courseTitle, courseSlug: matchSlug.courseSlug, isValid: true };
    }

    // Fallback to default courses
    const def = DEFAULT_AVAILABLE_COURSES.find(c => c.slug === cleanSlug);
    if (def) {
      return { courseTitle: def.title, courseSlug: def.slug, isValid: true };
    }

    // Beautify slug to title (e.g. 'ui-ux' -> 'UI UX')
    const fallbackTitle = cleanSlug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return { courseTitle: fallbackTitle, courseSlug: cleanSlug, isValid: true };
  },

  /**
   * Subscribe to live submissions
   */
  subscribeSubmissions(callback: (submissions: TeacherSubmission[]) => void): () => void {
    submissionListeners.add(callback);
    callback(this.getAllSubmissions());

    let unsubFirestore: (() => void) | null = null;
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = collection(db, 'teacher_submissions');
        unsubFirestore = onSnapshot(colRef, (snapshot) => {
          const list: TeacherSubmission[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as TeacherSubmission;
            if (data && docSnap.id) {
              list.push({ ...data, id: docSnap.id });
            }
          });
          list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
          submissionsMemory = list;
          try {
            localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));
          } catch {}
          callback(list);
        });
      } catch (err) {
        console.warn('Firestore submissions listener warning:', err);
      }
    }

    return () => {
      submissionListeners.delete(callback);
      if (unsubFirestore) unsubFirestore();
    };
  },

  /**
   * Subscribe to live invite links
   */
  subscribeInviteLinks(callback: (links: TeacherInviteLink[]) => void): () => void {
    linkListeners.add(callback);
    callback(this.getInviteLinks());

    let unsubFirestore: (() => void) | null = null;
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = collection(db, 'teacher_invite_links');
        unsubFirestore = onSnapshot(colRef, (snapshot) => {
          const list: TeacherInviteLink[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as TeacherInviteLink;
            if (data && docSnap.id) {
              list.push({ ...data, id: docSnap.id });
            }
          });
          if (list.length > 0) {
            inviteLinksMemory = list;
            try {
              localStorage.setItem(INVITE_LINKS_STORAGE_KEY, JSON.stringify(list));
            } catch {}
            callback(list);
          }
        });
      } catch (err) {
        console.warn('Firestore invite links listener warning:', err);
      }
    }

    return () => {
      linkListeners.delete(callback);
      if (unsubFirestore) unsubFirestore();
    };
  }
};
