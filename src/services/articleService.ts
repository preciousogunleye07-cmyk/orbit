import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getCertificates, CertificateRecord } from './certificateService';

export interface StudentAuthor {
  name: string;
  studentId?: string;
  certificateId?: string; // e.g. "ORB-8F29K2"
  certificateNumber?: string; // e.g. "ORB/2026/FS-0142"
  courseTrack?: string;
  projectTitle?: string;
  roleInProject?: string; // e.g. "Lead Developer", "Firmware Engineer", "UI/UX Researcher"
}

export type ArticleAuthorType = 'student' | 'think-academy';

export interface ThinkAcademyAuthor {
  name: string; // e.g. "Obitt"
  role?: string; // e.g. "Founder & Research Lead, Think Academy"
  institution?: string; // e.g. "Think Academy"
  badge?: string; // e.g. "Founder", "Research Fellow"
  bio?: string;
}

export interface SupervisingTutor {
  name: string;
  role: string; // e.g. "Senior Embedded Systems & Robotics Supervisor"
  email?: string;
}

export interface ArticleRecord {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string; // Formatted markdown/rich text
  category: string;
  coverImage: string;
  readTime: string;
  status: 'published' | 'draft';
  publishedAt: string;
  authorType?: ArticleAuthorType; // 'student' (default) or 'think-academy' (written by Obitt / Think Academy faculty)
  thinkAcademyAuthor?: ThinkAcademyAuthor;
  deployedBy: {
    name: string;
    role: string;
    email: string;
  };
  studentAuthors: StudentAuthor[];
  supervisingTutor: SupervisingTutor;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'orbit_space_articles_v1';
const DELETED_ARTICLES_KEY = 'orbit_space_deleted_article_ids_v1';

export const PRESET_ARTICLE_IMAGES = [
  {
    label: 'Robotics & Hardware Lab',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    category: 'Embedded Systems & IoT'
  },
  {
    label: 'Cloud & Web Architecture',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    category: 'Web Engineering'
  },
  {
    label: 'Cybersecurity SOC Matrix',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    category: 'Cybersecurity'
  },
  {
    label: 'Data Visualizations & Analytics',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    category: 'Data Science'
  },
  {
    label: 'Design Systems & UX Prototyping',
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    category: 'UI/UX & Product Design'
  },
  {
    label: 'Smart Agriculture & Sensor Technology',
    url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
    category: 'Embedded Systems & IoT'
  }
];

export const DEFAULT_ARTICLES: ArticleRecord[] = [];

function getDeletedIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_ARTICLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDeletedIds(ids: string[]): void {
  try {
    localStorage.setItem(DELETED_ARTICLES_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Error saving deleted article ids:', e);
  }
}

const DUMMY_ARTICLE_IDS = new Set([
  'art-distributed-microservices-pos',
  'art-component-choreography-nextgen',
  'art-predictive-agricultural-yield-data',
  'art-iot-smart-agriculture-irrigation',
  'art-automated-soc-incident-response',
  'art-orbit-official-foundations-obitt',
  'art-think-academy-foundations-obitt'
]);

export function getArticles(): ArticleRecord[] {
  try {
    const deletedIds = getDeletedIds();
    const stored = localStorage.getItem(STORAGE_KEY);
    let items: ArticleRecord[] = [];

    if (stored) {
      items = JSON.parse(stored);
      // Purge legacy dummy articles
      const filtered = items.filter(a => !DUMMY_ARTICLE_IDS.has(a.id) && !deletedIds.includes(a.id));
      if (filtered.length !== items.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
      return filtered;
    } else {
      items = [...DEFAULT_ARTICLES];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    return items.filter(a => !DUMMY_ARTICLE_IDS.has(a.id) && !deletedIds.includes(a.id));
  } catch (err) {
    console.error('Error loading articles from storage:', err);
    return [];
  }
}

export function saveArticles(articles: ArticleRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  } catch (e) {
    console.error('Error saving articles to storage:', e);
  }
}

export async function syncArticlesFromFirebase(): Promise<ArticleRecord[]> {
  const localArticles = getArticles();
  const deletedIds = getDeletedIds();

  if (!isFirebaseConfigured || !db) {
    return localArticles;
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'articles'));
    if (querySnapshot.empty) {
      // Seed default articles to Firestore for persistence
      for (const art of localArticles) {
        if (!deletedIds.includes(art.id)) {
          await setDoc(doc(db, 'articles', art.id), {
            ...art,
            authorType: art.authorType || 'student',
            thinkAcademyAuthor: art.thinkAcademyAuthor ? JSON.stringify(art.thinkAcademyAuthor) : '',
            studentAuthors: JSON.stringify(art.studentAuthors),
            supervisingTutor: JSON.stringify(art.supervisingTutor),
            tags: JSON.stringify(art.tags),
            deployedBy: JSON.stringify(art.deployedBy)
          });
        }
      }
      return localArticles;
    }

    const firestoreArticles: ArticleRecord[] = [];
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!deletedIds.includes(docSnap.id)) {
        let parsedThinkAuthor: ThinkAcademyAuthor | undefined = undefined;
        if (data.thinkAcademyAuthor) {
          try {
            parsedThinkAuthor = typeof data.thinkAcademyAuthor === 'string' 
              ? JSON.parse(data.thinkAcademyAuthor) 
              : data.thinkAcademyAuthor;
          } catch {
            parsedThinkAuthor = undefined;
          }
        }

        firestoreArticles.push({
          id: docSnap.id,
          slug: data.slug || docSnap.id,
          title: data.title || 'Untitled Article',
          subtitle: data.subtitle || '',
          content: data.content || '',
          category: data.category || 'General',
          coverImage: data.coverImage || PRESET_ARTICLE_IMAGES[0].url,
          readTime: data.readTime || '5 min read',
          status: data.status || 'published',
          publishedAt: data.publishedAt || new Date().toISOString().split('T')[0],
          authorType: (data.authorType as ArticleAuthorType) || (data.thinkAcademyAuthor ? 'think-academy' : 'student'),
          thinkAcademyAuthor: parsedThinkAuthor,
          deployedBy: typeof data.deployedBy === 'string' ? JSON.parse(data.deployedBy) : (data.deployedBy || { name: 'Admin', role: 'Staff', email: '' }),
          studentAuthors: typeof data.studentAuthors === 'string' ? JSON.parse(data.studentAuthors) : (data.studentAuthors || []),
          supervisingTutor: typeof data.supervisingTutor === 'string' ? JSON.parse(data.supervisingTutor) : (data.supervisingTutor || { name: 'Instructor', role: 'Supervisor' }),
          tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : (Array.isArray(data.tags) ? data.tags : []),
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      }
    });

    if (firestoreArticles.length > 0) {
      saveArticles(firestoreArticles);
      return firestoreArticles;
    }
    return localArticles;
  } catch (error) {
    console.warn('Firebase article sync failed, using local cache:', error);
    return localArticles;
  }
}

export function getArticleBySlug(slug: string): ArticleRecord | null {
  const articles = getArticles();
  const clean = slug.toLowerCase().trim();
  return articles.find(a => a.slug.toLowerCase() === clean || a.id.toLowerCase() === clean) || null;
}

export function getArticleById(id: string): ArticleRecord | null {
  const articles = getArticles();
  return articles.find(a => a.id === id) || null;
}

export function getArticlesByStudentCertificateId(certId: string): ArticleRecord[] {
  if (!certId) return [];
  const articles = getArticles();
  const targetId = certId.trim().toUpperCase();
  return articles.filter(art => 
    art.status === 'published' && 
    art.studentAuthors.some(author => author.certificateId && author.certificateId.trim().toUpperCase() === targetId)
  );
}

export function getArticlesByStudentName(studentName: string): ArticleRecord[] {
  if (!studentName) return [];
  const articles = getArticles();
  const nameClean = studentName.trim().toLowerCase();
  return articles.filter(art =>
    art.status === 'published' &&
    art.studentAuthors.some(author => author.name.trim().toLowerCase().includes(nameClean) || nameClean.includes(author.name.trim().toLowerCase()))
  );
}

export function getArticlesByTutorName(tutorName: string): ArticleRecord[] {
  if (!tutorName) return [];
  const articles = getArticles();
  const nameClean = tutorName.trim().toLowerCase();
  return articles.filter(art => {
    if (art.status !== 'published') return false;
    const supName = (art.supervisingTutor?.name || '').trim().toLowerCase();
    return supName.includes(nameClean) || nameClean.includes(supName);
  });
}

export async function createOrDeployArticleAsync(
  articleData: Omit<ArticleRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<{ success: boolean; article?: ArticleRecord; error?: string }> {
  try {
    const all = getArticles();
    const cleanId = articleData.id?.trim() || `art-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const slug = articleData.slug?.trim() || articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const newArticle: ArticleRecord = {
      ...articleData,
      id: cleanId,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save locally
    const updatedList = [newArticle, ...all.filter(a => a.id !== newArticle.id)];
    saveArticles(updatedList);

    // Save to Firestore if available
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'articles', newArticle.id), {
          ...newArticle,
          authorType: newArticle.authorType || 'student',
          thinkAcademyAuthor: newArticle.thinkAcademyAuthor ? JSON.stringify(newArticle.thinkAcademyAuthor) : '',
          studentAuthors: JSON.stringify(newArticle.studentAuthors),
          supervisingTutor: JSON.stringify(newArticle.supervisingTutor),
          tags: JSON.stringify(newArticle.tags),
          deployedBy: JSON.stringify(newArticle.deployedBy)
        });
      } catch (fbErr) {
        console.warn('Firestore article write fallback:', fbErr);
      }
    }

    return { success: true, article: newArticle };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to deploy article' };
  }
}

export async function updateArticleAsync(
  id: string,
  updates: Partial<ArticleRecord>
): Promise<{ success: boolean; article?: ArticleRecord; error?: string }> {
  try {
    const all = getArticles();
    const existingIndex = all.findIndex(a => a.id === id);
    if (existingIndex === -1) {
      return { success: false, error: 'Article not found' };
    }

    const updatedArticle: ArticleRecord = {
      ...all[existingIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    all[existingIndex] = updatedArticle;
    saveArticles(all);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'articles', id), {
          ...updatedArticle,
          authorType: updatedArticle.authorType || 'student',
          thinkAcademyAuthor: updatedArticle.thinkAcademyAuthor ? JSON.stringify(updatedArticle.thinkAcademyAuthor) : '',
          studentAuthors: JSON.stringify(updatedArticle.studentAuthors),
          supervisingTutor: JSON.stringify(updatedArticle.supervisingTutor),
          tags: JSON.stringify(updatedArticle.tags),
          deployedBy: JSON.stringify(updatedArticle.deployedBy)
        });
      } catch (fbErr) {
        console.warn('Firestore article update fallback:', fbErr);
      }
    }

    return { success: true, article: updatedArticle };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update article' };
  }
}

export async function deleteArticleAsync(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const all = getArticles();
    const filtered = all.filter(a => a.id !== id);
    saveArticles(filtered);

    // Track in deleted IDs
    const deleted = getDeletedIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      saveDeletedIds(deleted);
    }

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'articles', id));
      } catch (fbErr) {
        console.warn('Firestore article delete fallback:', fbErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete article' };
  }
}

/**
 * Intelligent Article Draft Generator
 * Crafts an academic and technical publication draft connecting student author capstone work,
 * supervising instructor guidance, problem statements, and real-world results.
 */
export function generateTechnicalArticleDraft(params: {
  studentName: string;
  projectTitle: string;
  courseTrack: string;
  supervisingTutorName: string;
  supervisingTutorRole: string;
  category: string;
  keyHighlights?: string;
  certificateId?: string;
}): {
  title: string;
  subtitle: string;
  content: string;
  category: string;
  tags: string[];
} {
  const {
    studentName,
    projectTitle,
    courseTrack,
    supervisingTutorName,
    supervisingTutorRole,
    category,
    keyHighlights,
    certificateId
  } = params;

  const title = `${projectTitle}: Engineering Case Study & Architecture`;
  const subtitle = `How ${studentName} designed and benchmarked "${projectTitle}" during the Orbit Space ${courseTrack} capstone, under the supervision of ${supervisingTutorName}.`;

  const highlightsSection = keyHighlights
    ? `### Key Breakthroughs & Technical Milestones:\n${keyHighlights
        .split('\n')
        .map(line => line.trim().startsWith('*') || line.trim().startsWith('-') ? line : `* ${line}`)
        .join('\n')}\n\n`
    : `### Key Breakthroughs & Technical Milestones:
* Built with production-grade modular components, rigorous error boundaries, and state synchronization.
* Documented end-to-end architecture with complete unit and integration test coverage.
* Designed with localized network resilience, optimized for real-world conditions.\n\n`;

  const certReference = certificateId 
    ? `This research corresponds directly to official Orbit Space Certificate of Completion **#${certificateId}**.` 
    : `This research corresponds directly to official graduation from Orbit Space's intensive ${courseTrack} program.`;

  const content = `## 1. Executive Abstract

As digital systems expand across Nigerian industry, engineering solutions must satisfy high reliability, low-latency performance, and operational durability. During the ${courseTrack} curriculum at Orbit Space Academia in Ilorin, **${studentName}** undertook the development of **"${projectTitle}"**.

Supervised by **${supervisingTutorName}** (${supervisingTutorRole}), this project addresses critical architectural challenges in ${category.toLowerCase()} through practical experimentation, rigorous testing, and localized problem-solving.

${certReference}

---

## 2. Problem Statement & Design Objectives

Many theoretical software architectures fail when deployed in field environments characterized by fluctuating power, intermittent network connectivity, and constrained client hardware. 

The core requirements established for this capstone included:
1. **Fault Tolerance**: Automatic fallback mechanisms ensuring non-stop operations during connection disruptions.
2. **Speed & Ergonomics**: Sub-100ms response times for core user actions and clean, accessible user interfaces.
3. **Data Integrity**: Cryptographic or transactional verification preventing race conditions and corrupted storage states.

---

## 3. System Architecture & Methodology

The architecture was designed following modern industry patterns in ${category}:

${highlightsSection}
\`\`\`text
[ Client Application / Hardware Node ]
                │
                ▼ (Encrypted Telemetry / State Sync)
    [ Resilient API & Worker Layer ]
                │
                ▼ (Transactional Data Store)
    [ Persistent Cloud Storage & Backups ]
\`\`\`

Throughout the development lifecycle, weekly architectural audits and code reviews were conducted in the Orbit Space labs to eliminate anti-patterns and optimize memory overhead.

---

## 4. Student Author Reflections

> "${projectTitle} allowed me to move beyond standard textbook examples into real-world engineering constraints. With direct guidance from ${supervisingTutorName}, I learned how to structure scalable solutions that solve real community and industry problems."
> — **${studentName}**, Student Author & Certified Alum

---

## 5. Supervising Tutor Evaluation & Endorsement

> "${studentName} demonstrated remarkable technical discipline and curiosity throughout the ${courseTrack} track. This project represents not just successful academic completion, but a production-ready demonstration of technical competence."
> — **${supervisingTutorName}**, ${supervisingTutorRole}`;

  const tags = [
    courseTrack.replace(/\s+/g, ''),
    category.replace(/\s+/g, ''),
    'OrbitSpaceResearch',
    'StudentCapstone',
    'TechInnovation'
  ];

  return {
    title,
    subtitle,
    content,
    category: category || 'Web Engineering',
    tags
  };
}

/**
 * Orbit Official Blog Post Draft Generator
 * Crafts an authoritative publication from Orbit Space authored by Obitt or engineering leads.
 */
export function generateThinkAcademyDraft(params: {
  authorName?: string;
  authorRole?: string;
  topicTitle?: string;
  topic?: string;
  category: string;
  keyPrinciples?: string;
}): {
  title: string;
  subtitle: string;
  content: string;
  category: string;
  tags: string[];
  thinkAcademyAuthor: ThinkAcademyAuthor;
} {
  const authorName = params.authorName?.trim() || 'Obitt';
  const authorRole = params.authorRole?.trim() || 'Lead Researcher & Engineer, Orbit';
  const topic = (params.topicTitle || params.topic || 'Engineering Foundations').trim();
  const category = params.category || 'Web Engineering';

  const title = topic.includes(':') ? topic : `${topic}: Architectural Foundations & Cognitive Models`;
  const subtitle = `An Orbit Official Blog Post by ${authorName} examining high-leverage mental models, systemic rigor, and technical craftsmanship.`;

  const principlesList = params.keyPrinciples
    ? params.keyPrinciples
        .split('\n')
        .map(l => l.trim().startsWith('*') || l.trim().startsWith('-') ? l : `* ${l}`)
        .join('\n')
    : `* **First-Principles Scaffolding**: Deconstruct systems down to immutable physics, memory boundaries, and network latencies.
* **Deterministic Contracts**: Write resilient code with explicit invariants, idempotency, and automated recovery.
* **Cognitive Mastery**: Move beyond tutorial replication to deep structural engineering.`;

  const content = `## 1. The Orbit Engineering Thesis

At **Orbit Space**, we emphasize deep conceptual mastery over ephemeral syntactic trends. In the modern computational landscape, true technical competence requires understanding how state behaves across asynchronous boundaries, hardware caches, and distributed networks.

This official publication by **${authorName}** (${authorRole}) provides a rigorous analysis of **${topic}**.

---

## 2. Core Engineering Principles

${principlesList}

\`\`\`typescript
// The Orbit Space Contract Pattern
export interface ArchitecturalInvariant<TContext> {
  validate: (ctx: TContext) => boolean;
  execute: () => Promise<void>;
  rollback: (err: Error) => Promise<void>;
}
\`\`\`

---

## 3. Practical Implementation Guidelines

When implementing solutions in ${category.toLowerCase()}, maintain:
1. **Zero Silent Failures**: Every error must either be self-healed or bubbled with precise contextual telemetry.
2. **Predictable Memory Footprints**: Profile heap allocations and minimize unnecessary runtime garbage collection cycles.
3. **Ergonomic Composition**: Build software where components can be reasoned about in isolation.

---

## 4. Orbit Space Closing Perspective

> "Excellence in technology is not an accident of talent; it is the compounding output of deliberate practice, cognitive rigor, and unyielding standards."
> — **${authorName}**, Orbit Space`;

  const tags = [
    'OrbitOfficial',
    authorName.replace(/\s+/g, ''),
    category.replace(/\s+/g, ''),
    'SystemArchitecture',
    'TechLeadership'
  ];

  return {
    title,
    subtitle,
    content,
    category,
    tags,
    thinkAcademyAuthor: {
      name: authorName,
      role: authorRole,
      institution: 'Orbit Space',
      badge: 'Orbit Official Author',
      bio: 'Author of foundational engineering monographs and mental models at Orbit Space.'
    }
  };
}

