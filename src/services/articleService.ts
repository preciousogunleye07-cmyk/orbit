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

export const DEFAULT_ARTICLES: ArticleRecord[] = [
  {
    id: 'art-distributed-microservices-pos',
    slug: 'distributed-realtime-inventory-microservices',
    title: 'Architecting a Resilient Distributed Microservices Inventory System for High-Concurrency Retail',
    subtitle: 'A comprehensive technical deep-dive into event-driven state synchronization, optimistic locking, and offline-tolerant point-of-sale systems.',
    category: 'Web Engineering',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    readTime: '6 min read',
    status: 'published',
    publishedAt: '2026-02-18',
    deployedBy: {
      name: 'Editorial Board',
      role: 'Sub-Administrator',
      email: 'editor@orbitspace.academy'
    },
    studentAuthors: [
      {
        name: 'Michael Adebayo',
        studentId: 'OS-2025-089',
        certificateId: 'ORB-8F29K2',
        certificateNumber: 'ORB/2026/FS-0142',
        courseTrack: 'Full-Stack Web Development',
        projectTitle: 'Distributed Microservices POS & Real-Time Sync Engine',
        roleInProject: 'Lead System Architect & Backend Engineer'
      }
    ],
    supervisingTutor: {
      name: 'Engr. David Babatunde',
      role: 'Principal Web Architecture Fellow & Senior Instructor',
      email: 'david.b@orbitspace.academy'
    },
    tags: ['React', 'TypeScript', 'Node.js', 'Distributed Systems', 'Event-Driven', 'Capstone'],
    createdAt: '2026-02-18T09:00:00.000Z',
    updatedAt: '2026-02-18T09:00:00.000Z',
    content: `## 1. Executive Abstract

In high-concurrency retail environments across West Africa, network dropouts and rapid inventory turns frequently trigger race conditions and overselling. During his 12-week Full-Stack Web Development capstone at Orbit Space Ilorin, **Michael Adebayo** conceptualized, engineered, and benchmarked an event-driven point-of-sale synchronization platform capable of resolving local cache transactions into cloud state with zero data loss.

Supervised by **Engr. David Babatunde**, the project underwent extensive stress testing simulating 10,000 parallel checkout requests under degraded 2G/3G mobile telemetry.

---

## 2. Engineering Architecture & The Problem

Traditional retail setups rely on direct database transactions over synchronous HTTP. When connection jitter occurs at the cash register, operations fail, stalling checkout lines.

To solve this, the architecture utilizes three decoupled planes:
* **The Edge Client**: Built with React, TypeScript, and IndexedDB for local-first transaction logging.
* **The Message Broker**: An append-only transaction stream that buffers edge sales events in chronological order.
* **The Reconciler Daemon**: A resilient Node.js worker that evaluates conflict vectors using vector clocks and idempotency keys.

\`\`\`typescript
// Idempotency token validation & conflict resolution
interface SalePayload {
  transactionId: string;
  timestamp: number;
  terminalId: string;
  items: Array<{ sku: string; quantity: number }>;
  signature: string;
}

export async function processSale(payload: SalePayload): Promise<SyncResult> {
  const isDuplicate = await redisClient.get(\`tx:\${payload.transactionId}\`);
  if (isDuplicate) {
    return { status: 'acknowledged', cached: true };
  }
  return await executeAtomicDecrement(payload.items);
}
\`\`\`

---

## 3. Implementation Benchmarks

During validation in the Orbit Space Hardware & Networking Sandbox:
* **Latency under burst**: Reduced 99th percentile response time from 1,240ms to 42ms on local edge cashiers.
* **Offline durability**: Simulated 4 hours of complete power and internet outage with 850 queued purchases; zero transaction discrepancies recorded upon cloud reconnection.
* **Memory footprint**: Edge engine consumes under 35MB of browser memory.

---

## 4. Supervising Tutor Commendation

> "Michael exhibited an exceptional grasp of system resilience far beyond conventional junior engineering. Rather than simply querying standard SQL endpoints, he challenged real-world network latency constraints common to physical merchants in Kwara State. This capstone exemplifies Orbit Space's commitment to building practical, world-class technical talent."
> — **Engr. David Babatunde**, Orbit Space Academia`
  },
  {
    id: 'art-component-choreography-nextgen',
    slug: 'high-performance-component-choreography-react',
    title: 'Harmonizing Complex Component Choreography & 60FPS Micro-Interactions in Production React',
    subtitle: 'A study on GPU-accelerated motion choreography, layout recalculation prevention, and token-based design systems.',
    category: 'Web Engineering',
    coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    readTime: '5 min read',
    status: 'published',
    publishedAt: '2026-03-01',
    deployedBy: {
      name: 'Editorial Board',
      role: 'Sub-Administrator',
      email: 'editor@orbitspace.academy'
    },
    studentAuthors: [
      {
        name: 'Precious Adewale Ogunleye',
        studentId: 'OS-2025-095',
        certificateId: 'ORB-19V8Q3',
        certificateNumber: 'ORB/2026/FE-0112',
        courseTrack: 'Frontend Engineering',
        projectTitle: 'Choreographed Design System & High-Performance UI Engine',
        roleInProject: 'Lead Frontend Engineer'
      }
    ],
    supervisingTutor: {
      name: 'Mr. Emmanuel Okafor',
      role: 'Lead UI Architecture & Frontend Instructor',
      email: 'emmanuel.o@orbitspace.academy'
    },
    tags: ['React', 'Motion', 'Tailwind CSS', 'Performance', 'Web Vitals'],
    createdAt: '2026-03-01T11:00:00.000Z',
    updatedAt: '2026-03-01T11:00:00.000Z',
    content: `## 1. Executive Abstract

Modern web interfaces frequently suffer from perceptible jank, unoptimized layout shifts, and CPU thermal throttling when rich micro-animations are rendered on budget smartphones and entry-level laptops. 

In this capstone paper, **Precious Adewale Ogunleye**, under the mentorship of **Mr. Emmanuel Okafor**, presents a comprehensive methodology for architecting smooth 60fps component animations using hardware composite layers and strict layout isolation.

---

## 2. The Bottleneck: Reflow vs Composite

Many developer libraries trigger geometric recalculations (\`width\`, \`height\`, \`top\`, \`left\`), forcing browser main threads to recalculate styles across the entire DOM tree. 

By restructuring interaction choreographies to strictly utilize \`transform\` (translate3d, scale) and \`opacity\`, tasks are offloaded straight to the GPU compositor thread.

\`\`\`css
/* Anti-Jank GPU Composite Isolation */
.animated-card-surface {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  contain: layout paint;
}
\`\`\`

---

## 3. Student Author Commentary

> "Building web software isn't just about outputting divs; it's about crafting interfaces that respond with tactile feedback, respect battery life, and honor the user's attention. Through Orbit Space's intensive studio critiques, we refined every single millisecond of our spring curves."
> — **Precious Adewale Ogunleye**, Certified Frontend Alum

---

## 4. Supervisor Endorsement

> "Precious developed an acute eye for technical precision. The capstone produced passes Google Core Web Vitals with straight 100/100 performance marks while maintaining fluid visual panache."
> — **Mr. Emmanuel Okafor**`
  },
  {
    id: 'art-predictive-agricultural-yield-data',
    slug: 'predictive-agricultural-yield-analytics-kwara',
    title: 'Data-Driven Yield Prediction & Soil Nutrient Analytics for Middle-Belt Smallholder Farms',
    subtitle: 'Exploratory data analysis and interactive Power BI models transforming local agro-meteorological metrics into actionable planting recommendations.',
    category: 'Data Science',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    readTime: '7 min read',
    status: 'published',
    publishedAt: '2026-01-25',
    deployedBy: {
      name: 'Editorial Board',
      role: 'Sub-Administrator',
      email: 'editor@orbitspace.academy'
    },
    studentAuthors: [
      {
        name: 'Blessing Aminat Ibrahim',
        studentId: 'OS-2025-064',
        certificateId: 'ORB-73K1M9',
        certificateNumber: 'ORB/2026/DA-0089',
        courseTrack: 'Data Analysis',
        projectTitle: 'Predictive Agro-Meteorological BI Intelligence Dashboard',
        roleInProject: 'Lead Data Analyst & Modeling Specialist'
      }
    ],
    supervisingTutor: {
      name: 'Dr. K. A. Adeleke',
      role: 'Principal Analytics Fellow & Applied Data Science Lead',
      email: 'adeleke.k@orbitspace.academy'
    },
    tags: ['Data Science', 'Power BI', 'SQL', 'Predictive Modeling', 'Agriculture', 'Kwara'],
    createdAt: '2026-01-25T14:30:00.000Z',
    updatedAt: '2026-01-25T14:30:00.000Z',
    content: `## 1. Executive Summary

Agriculture remains the primary economic engine of Kwara State and surrounding Middle-Belt territories. However, erratic rainfall variance and unmonitored soil acidification regularly lead to sub-optimal harvest yields for smallholder cassava, maize, and soybean growers.

**Blessing Aminat Ibrahim**, completing her Data Analysis track at Orbit Space, gathered and synthesized 5 years of regional precipitation datasets, remote soil sensor feeds, and market pricing logs to construct an intuitive predictive model.

---

## 2. Methodology & Pipeline

1. **Extraction & Ingestion**: Cleaned multi-source CSV and SQL exports with automated Python validation pipelines.
2. **Outlier Filtering**: Imputed missing rain-gauge telemetry via nearest-neighbor interpolation.
3. **Interactive Power BI Dashboard**: Formatted with high-contrast color palettes and accessible summary KPIs for cooperative agricultural extension workers.

---

## 3. Verified Student Project Findings

* Predicted crop yield variance with 91.4% accuracy across 12 local government areas.
* Identified an optimal 14-day planting window shifting based on El Niño precipitation cycles.
* Designed an automated mobile-friendly summary report viewable without desktop software.`
  },
  {
    id: 'art-soc-threat-containment-cyber',
    slug: 'defensive-soc-automated-threat-containment',
    title: 'Engineering an Automated SOC Defense Pipeline & Lateral Movement Containment in Isolated LANs',
    subtitle: 'A practical deployment of Wazuh SIEM, custom Suricata detection rules, and automated firewall isolation scripts.',
    category: 'Cybersecurity',
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    readTime: '8 min read',
    status: 'published',
    publishedAt: '2025-12-02',
    deployedBy: {
      name: 'Orbit Space Security Lab',
      role: 'Super Administrator',
      email: 'orbitspace.ilorin@gmail.com'
    },
    studentAuthors: [
      {
        name: 'Chinedu Emmanuel Okafor',
        studentId: 'OS-2025-032',
        certificateId: 'ORB-42N9X1',
        certificateNumber: 'ORB/2025/CS-0051',
        courseTrack: 'Cybersecurity',
        projectTitle: 'Automated SOC Incident Response & Endpoint Containment Matrix',
        roleInProject: 'Lead Security Analyst & Threat Hunter'
      }
    ],
    supervisingTutor: {
      name: 'Inspector Aliyu Mohammed',
      role: 'Senior Cyber Defense Instructor & Certified Ethical Hacker',
      email: 'aliyu.m@orbitspace.academy'
    },
    tags: ['Cybersecurity', 'SOC', 'SIEM', 'Threat Hunting', 'Incident Response', 'Network Security'],
    createdAt: '2025-12-02T10:00:00.000Z',
    updatedAt: '2025-12-02T10:00:00.000Z',
    content: `## 1. Executive Abstract

When an internal machine is compromised by a malicious payload or unauthorized reverse shell, the speed of network containment determines whether an incident is stopped or escalates into a catastrophic enterprise breach.

In this practical research capstone executed in the Orbit Space Cyber Range, **Chinedu Emmanuel Okafor** designed and configured an automated SOC telemetry pipeline that detects suspicious PowerShell executions, unauthorized ARP spoofing, and privilege escalation attempts within seconds.

---

## 2. Threat Detection Architecture

* **Sensor Layer**: Deployed lightweight Wazuh endpoint agents across simulated Windows and Ubuntu virtual machines.
* **Network Inspection**: Real-time packet parsing with Suricata inline IDS/IPS rules.
* **Active Response Scripting**: When high-severity rule triggers occur (Level 12+), an automated Python hook drops host traffic on the firewall interface while keeping the management port open for forensic capture.

---

## 3. Results & Supervisor Commentary

> "Chinedu proved that robust security operations center (SOC) capabilities do not require millions of dollars in proprietary software licenses. Using rigorous open-source tooling and customized telemetry hooks, his capstone achieved enterprise-grade response metrics."
> — **Inspector Aliyu Mohammed**`
  }
];

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

export function getArticles(): ArticleRecord[] {
  try {
    const deletedIds = getDeletedIds();
    const stored = localStorage.getItem(STORAGE_KEY);
    let items: ArticleRecord[] = [];

    if (stored) {
      items = JSON.parse(stored);
    } else {
      items = [...DEFAULT_ARTICLES];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    return items.filter(a => !deletedIds.includes(a.id));
  } catch (err) {
    console.error('Error loading articles from storage:', err);
    return DEFAULT_ARTICLES;
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
