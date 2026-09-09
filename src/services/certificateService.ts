import { getSupabase, isSupabaseConfigured } from './supabase';
import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { canAccessAdminPortal } from '../utils/adminSecurity';

export interface CertificateRecord {
  id: string; // Public authentication ID, e.g. "ORB-8F29K2"
  studentName: string;
  studentEmail?: string; // Student contact email
  course: string;
  certificateNumber: string; // e.g. "ORB/2026/FS-0142"
  dateIssued: string; // YYYY-MM-DD
  courseDuration?: string;
  certificateType?: string;
  studentId?: string;
  completionDate?: string; // Optional completion/graduation date
  additionalNotes?: string;
  status: 'valid' | 'revoked';
  createdAt: string;
  documentUrl?: string; // Optional uploaded certificate file (Data URL or preview URL)
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: string;
}

const STORAGE_KEY = 'orbit_space_certificates_v1';
const DELETED_IDS_KEY = 'orbit_space_deleted_cert_ids_v1';
const ADMIN_SESSION_KEY = 'orbit_space_admin_session_v1';

// Official past certificates issued by Orbit Space Academia
export const DEFAULT_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'ORB-8F29K2',
    studentName: 'Michael Adebayo',
    studentEmail: 'michael.adebayo@gmail.com',
    course: 'Full-Stack Web Development',
    certificateNumber: 'ORB/2026/FS-0142',
    dateIssued: '2026-02-15',
    courseDuration: '12 Weeks (3 Months)',
    certificateType: 'Professional Certificate of Completion',
    studentId: 'OS-2025-089',
    completionDate: '2026-02-10',
    additionalNotes: 'Graduated with Distinction in Full-Stack Web Development. Demonstrated mastery of React, Node.js, TypeScript, and modern distributed architecture.',
    status: 'valid',
    createdAt: '2026-02-15T10:30:00.000Z'
  },
  {
    id: 'ORB-19V8Q3',
    studentName: 'Precious Adewale Ogunleye',
    studentEmail: 'preciousogunleye07@gmail.com',
    course: 'Frontend Engineering',
    certificateNumber: 'ORB/2026/FE-0112',
    dateIssued: '2026-02-28',
    courseDuration: '10 Weeks',
    certificateType: 'Professional Certificate of Completion',
    studentId: 'OS-2025-095',
    completionDate: '2026-02-25',
    additionalNotes: 'Completed production-grade frontend architecture capstone utilizing modern React, Tailwind CSS, component choreography, and state synchronization.',
    status: 'valid',
    createdAt: '2026-02-28T10:00:00.000Z'
  },
  {
    id: 'ORB-73K1M9',
    studentName: 'Blessing Aminat Ibrahim',
    studentEmail: 'blessing.aminat@gmail.com',
    course: 'Data Analysis',
    certificateNumber: 'ORB/2026/DA-0089',
    dateIssued: '2026-01-20',
    courseDuration: '10 Weeks',
    certificateType: 'Professional Certificate of Completion',
    studentId: 'OS-2025-064',
    completionDate: '2026-01-18',
    additionalNotes: 'Completed practical training in Power BI dashboard design, SQL database extraction, Excel business analytics, and exploratory data analysis.',
    status: 'valid',
    createdAt: '2026-01-20T14:15:00.000Z'
  },
  {
    id: 'ORB-42N9X1',
    studentName: 'Chinedu Emmanuel Okafor',
    studentEmail: 'chinedu.okafor@gmail.com',
    course: 'Cybersecurity',
    certificateNumber: 'ORB/2025/CS-0051',
    dateIssued: '2025-11-28',
    courseDuration: '12 Weeks',
    certificateType: 'Professional Certificate of Completion',
    studentId: 'OS-2025-032',
    completionDate: '2025-11-25',
    additionalNotes: 'Demonstrated competencies in ethical hacking, vulnerability scanning, SOC defensive operations, and network incident containment.',
    status: 'valid',
    createdAt: '2025-11-28T09:00:00.000Z'
  },
  {
    id: 'ORB-33B8P4',
    studentName: 'Zainab Folashade Alabi',
    studentEmail: 'zainab.alabi@gmail.com',
    course: 'UI/UX Product Design',
    certificateNumber: 'ORB/2025/UX-0027',
    dateIssued: '2025-10-14',
    courseDuration: '8 Weeks',
    certificateType: 'Professional Certificate of Completion',
    studentId: 'OS-2025-018',
    completionDate: '2025-10-10',
    additionalNotes: 'Prototyped responsive design systems and completed high-fidelity interaction design for enterprise mobile and web applications.',
    status: 'valid',
    createdAt: '2025-10-14T11:45:00.000Z'
  },
  {
    id: 'ORB-91T4K8',
    studentName: 'David Oluwaseun Babatunde',
    studentEmail: 'david.babatunde@gmail.com',
    course: 'Backend Engineering',
    certificateNumber: 'ORB/2025/BE-0074',
    dateIssued: '2025-12-10',
    courseDuration: '12 Weeks',
    certificateType: 'Professional Certificate of Completion',
    studentId: 'OS-2025-045',
    completionDate: '2025-12-05',
    additionalNotes: 'Specialized in relational database modeling, RESTful microservices, containerization, and API security.',
    status: 'valid',
    createdAt: '2025-12-10T16:00:00.000Z'
  },
  {
    id: 'ORB-55M2X7',
    studentName: 'Fatima Khadija Bello',
    studentEmail: 'fatima.bello@gmail.com',
    course: 'AI & Automation',
    certificateNumber: 'ORB/2026/AI-0019',
    dateIssued: '2026-02-01',
    courseDuration: '6 Weeks',
    certificateType: 'Executive Certificate of Completion',
    studentId: 'OS-2026-003',
    completionDate: '2026-01-28',
    additionalNotes: 'Demonstrated excellence in automated workflows, AI agent orchestration, and business productivity intelligence.',
    status: 'valid',
    createdAt: '2026-02-01T12:00:00.000Z'
  }
];

// Helper to generate unique ID in ORB-XXXXXX format
export function generateCertificateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORB-${result}`;
}

/**
 * Recursively strips keys with undefined values from objects/arrays so Firestore setDoc / updateDoc
 * will never fail with "Unsupported field value: undefined (found in field ...)"
 */
export function sanitizeFirestorePayload<T extends Record<string, any>>(data: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        result[key] = sanitizeFirestorePayload(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// Supabase Record Mapping
function mapToCertificateRecord(row: Record<string, any>): CertificateRecord {
  return {
    id: row.id,
    studentName: row.student_name,
    studentEmail: row.student_email || row.studentEmail || undefined,
    course: row.course,
    certificateNumber: row.certificate_number,
    dateIssued: row.date_issued,
    courseDuration: row.course_duration,
    certificateType: row.certificate_type,
    studentId: row.student_id,
    completionDate: row.completion_date || row.completionDate || undefined,
    additionalNotes: row.additional_notes,
    status: row.status as 'valid' | 'revoked',
    createdAt: row.created_at,
    documentUrl: row.document_url,
    fileName: row.file_name,
    fileSize: row.file_size,
    fileType: row.file_type
  };
}

function mapToSupabaseRow(cert: CertificateRecord) {
  return {
    id: cert.id,
    student_name: cert.studentName,
    student_email: cert.studentEmail || null,
    course: cert.course,
    certificate_number: cert.certificateNumber,
    date_issued: cert.dateIssued,
    course_duration: cert.courseDuration || null,
    certificate_type: cert.certificateType || null,
    student_id: cert.studentId || null,
    completion_date: cert.completionDate || null,
    additional_notes: cert.additionalNotes || null,
    status: cert.status,
    created_at: cert.createdAt,
    document_url: cert.documentUrl || null,
    file_name: cert.fileName || null,
    file_size: cert.fileSize !== undefined ? cert.fileSize : null,
    file_type: cert.fileType || null
  };
}

// Track deleted IDs to prevent them from ever resurrecting
function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    return new Set<string>(Array.isArray(parsed) ? parsed.map((id: string) => id.toUpperCase()) : []);
  } catch {
    return new Set<string>();
  }
}

function markIdAsDeleted(id: string) {
  try {
    const deleted = getDeletedIds();
    deleted.add(id.trim().toUpperCase());
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(deleted)));
  } catch (err) {
    console.error('Failed to save deleted ID:', err);
  }
}

// Asynchronously fetch from Firebase Firestore (or fallback to Supabase / local)
export async function syncCertificatesFromFirebase(): Promise<CertificateRecord[]> {
  const deletedSet = getDeletedIds();

  if (!isFirebaseConfigured() || !db) {
    return getCertificates();
  }

  try {
    const certsCol = collection(db, 'certificates');
    const snapshot = await getDocs(certsCol);

    if (snapshot.empty) {
      // Seed default certificates to Firestore so cloud database is pre-populated
      const batchPromises = DEFAULT_CERTIFICATES
        .filter(c => !deletedSet.has(c.id.toUpperCase()))
        .map(cert => setDoc(doc(db, 'certificates', cert.id), sanitizeFirestorePayload(cert)));
      await Promise.all(batchPromises);
      return getCertificates();
    }

    const remoteRecords: CertificateRecord[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as CertificateRecord;
      if (data && data.id && !deletedSet.has(data.id.toUpperCase())) {
        remoteRecords.push(data);
      }
    });

    const localList = getCertificates();
    const remoteIdMap = new Map(remoteRecords.map(r => [r.id.toUpperCase(), r]));
    const merged = [
      ...remoteRecords,
      ...localList.filter(c => !remoteIdMap.has(c.id.toUpperCase()) && !deletedSet.has(c.id.toUpperCase()))
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.warn('Firebase sync notice (fallback to local):', err);
    return getCertificates();
  }
}

// Asynchronously fetch from cloud (Firebase preferred, then Supabase, then local)
export async function syncCertificatesFromSupabase(): Promise<CertificateRecord[]> {
  // If Firebase is available, prefer Firebase Firestore
  if (isFirebaseConfigured() && db) {
    return syncCertificatesFromFirebase();
  }

  const deletedSet = getDeletedIds();
  const client = getSupabase();
  
  if (!client) {
    return getCertificates();
  }

  try {
    const { data, error } = await client
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch notice (using cached data):', error.message);
      return getCertificates();
    }

    if (data && Array.isArray(data) && data.length > 0) {
      // Filter out any IDs that were deleted by the admin
      const remoteRecords = data
        .map(mapToCertificateRecord)
        .filter(c => !deletedSet.has(c.id.toUpperCase()));

      const localList = getCertificates();
      const remoteIdMap = new Map(remoteRecords.map(r => [r.id.toUpperCase(), r]));
      
      const merged = [
        ...remoteRecords,
        ...localList.filter(c => !remoteIdMap.has(c.id.toUpperCase()) && !deletedSet.has(c.id.toUpperCase()))
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('Could not sync with Supabase, relying on local storage:', err);
  }

  return getCertificates();
}

// Retrieve certificates from local storage and ensure all past certificates are preserved
export function getCertificates(): CertificateRecord[] {
  const deletedSet = getDeletedIds();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: CertificateRecord[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }

    // Merge default past certificates so they are never lost
    const existingIds = new Set(list.map(c => c.id.toUpperCase()));
    for (const defCert of DEFAULT_CERTIFICATES) {
      if (!existingIds.has(defCert.id.toUpperCase()) && !deletedSet.has(defCert.id.toUpperCase())) {
        list.push(defCert);
      }
    }

    // Filter out any deleted records
    const realList = list.filter(c => !deletedSet.has(c.id.toUpperCase()));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(realList));
    return realList;
  } catch (err) {
    console.error('Error reading certificates from storage:', err);
    return DEFAULT_CERTIFICATES.filter(c => !deletedSet.has(c.id.toUpperCase()));
  }
}

// Lookup certificate by ID (case insensitive, checks Firebase first, then Supabase, then local)
export async function fetchCertificateByIdAsync(id: string): Promise<CertificateRecord | null> {
  if (!id) return null;
  const cleanId = id.trim().toUpperCase();
  const deletedSet = getDeletedIds();

  // If permanently deleted, immediately return null
  if (deletedSet.has(cleanId)) {
    return null;
  }

  // 1. Check Firebase Firestore
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDoc(doc(db, 'certificates', cleanId));
      if (snap.exists()) {
        const record = snap.data() as CertificateRecord;
        if (!deletedSet.has(record.id.toUpperCase())) {
          // Update local cache
          const all = getCertificates().filter(c => c.id.toUpperCase() !== cleanId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...all]));
          return record;
        }
      }
    } catch (fbErr) {
      console.warn('Firebase certificate fetch notice:', fbErr);
    }
  }

  // 2. Check Supabase
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('certificates')
        .select('*')
        .ilike('id', cleanId)
        .single();

      if (!error && data) {
        const record = mapToCertificateRecord(data);
        if (deletedSet.has(record.id.toUpperCase())) return null;

        // Update local cache
        const all = getCertificates().filter(c => c.id.toUpperCase() !== cleanId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...all]));
        return record;
      }
    } catch (e) {
      console.warn('Supabase single fetch fallback to local:', e);
    }
  }

  return getCertificateById(cleanId);
}

// Synchronous local lookup fallback
export function getCertificateById(id: string): CertificateRecord | null {
  if (!id) return null;
  const cleanId = id.trim().toUpperCase();
  const all = getCertificates();
  return all.find(c => c.id.toUpperCase() === cleanId) || null;
}

// Asynchronously create and insert certificate into Supabase and local cache
export async function createCertificateAsync(
  input: {
    studentName: string;
    studentEmail?: string;
    course: string;
    certificateNumber?: string;
    dateIssued: string;
    courseDuration?: string;
    certificateType?: string;
    studentId?: string;
    completionDate?: string;
    additionalNotes?: string;
    documentUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  }
): Promise<{ success: boolean; certificate?: CertificateRecord; error?: string }> {
  // Security enforcement: Administrative writes are strictly restricted to local machine
  if (!canAccessAdminPortal()) {
    return { 
      success: false, 
      error: 'Security Policy Violation: Certificate issuance is restricted to the local admin workstation (127.0.0.1 / localhost).' 
    };
  }

  const all = getCertificates();
  
  // Ensure unique ID
  let newId = generateCertificateId();
  while (all.some(c => c.id === newId)) {
    newId = generateCertificateId();
  }

  // Fallback cert number if omitted
  const certNum = input.certificateNumber && input.certificateNumber.trim()
    ? input.certificateNumber.trim()
    : `ORB/${new Date().getFullYear()}/CERT-${Math.floor(1000 + Math.random() * 9000)}`;

  const newRecord: CertificateRecord = {
    id: newId,
    studentName: input.studentName.trim(),
    course: input.course.trim(),
    certificateNumber: certNum,
    dateIssued: input.dateIssued || new Date().toISOString().split('T')[0],
    courseDuration: input.courseDuration?.trim() || '3 Months',
    certificateType: input.certificateType?.trim() || 'Professional Certificate',
    status: 'valid',
    createdAt: new Date().toISOString(),
    ...(input.studentEmail?.trim() ? { studentEmail: input.studentEmail.trim() } : {}),
    ...(input.studentId?.trim() ? { studentId: input.studentId.trim() } : {}),
    ...(input.completionDate?.trim() ? { completionDate: input.completionDate.trim() } : {}),
    ...(input.additionalNotes?.trim() ? { additionalNotes: input.additionalNotes.trim() } : {}),
    ...(input.documentUrl ? { documentUrl: input.documentUrl } : {}),
    ...(input.fileName ? { fileName: input.fileName } : {}),
    ...(input.fileSize !== undefined ? { fileSize: input.fileSize } : {}),
    ...(input.fileType ? { fileType: input.fileType } : {})
  };

  // Update local cache
  const updated = [newRecord, ...all];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save certificate locally:', err);
  }

  // 1. Insert into Firebase Firestore
  if (isFirebaseConfigured() && db) {
    try {
      const sanitized = sanitizeFirestorePayload(newRecord);
      await setDoc(doc(db, 'certificates', newRecord.id), sanitized);
      console.log('Certificate successfully inserted in Firebase Firestore:', newRecord.id);
    } catch (fbErr: any) {
      console.warn('Firebase certificate insert notice:', fbErr?.message || fbErr);
    }
  }

  // 2. Insert into Supabase (if configured)
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client
        .from('certificates')
        .insert([mapToSupabaseRow(newRecord)]);

      if (error) {
        console.warn('Supabase certificate insert notice:', error.message);
      } else {
        console.log('Certificate successfully inserted in Supabase:', newRecord.id);
      }
    } catch (err: any) {
      console.warn('Supabase notice on insert:', err?.message || err);
    }
  }

  return { success: true, certificate: newRecord };
}

// Create & persist a new certificate record (synchronous wrapper)
export function createCertificate(
  input: {
    studentName: string;
    studentEmail?: string;
    course: string;
    certificateNumber?: string;
    dateIssued: string;
    courseDuration?: string;
    certificateType?: string;
    studentId?: string;
    completionDate?: string;
    additionalNotes?: string;
    documentUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  }
): CertificateRecord {
  const all = getCertificates();
  
  let newId = generateCertificateId();
  while (all.some(c => c.id === newId)) {
    newId = generateCertificateId();
  }

  const certNum = input.certificateNumber && input.certificateNumber.trim()
    ? input.certificateNumber.trim()
    : `ORB/${new Date().getFullYear()}/CERT-${Math.floor(1000 + Math.random() * 9000)}`;

  const newRecord: CertificateRecord = {
    id: newId,
    studentName: input.studentName.trim(),
    course: input.course.trim(),
    certificateNumber: certNum,
    dateIssued: input.dateIssued || new Date().toISOString().split('T')[0],
    courseDuration: input.courseDuration?.trim() || '3 Months',
    certificateType: input.certificateType?.trim() || 'Professional Certificate',
    status: 'valid',
    createdAt: new Date().toISOString(),
    ...(input.studentEmail?.trim() ? { studentEmail: input.studentEmail.trim() } : {}),
    ...(input.studentId?.trim() ? { studentId: input.studentId.trim() } : {}),
    ...(input.completionDate?.trim() ? { completionDate: input.completionDate.trim() } : {}),
    ...(input.additionalNotes?.trim() ? { additionalNotes: input.additionalNotes.trim() } : {}),
    ...(input.documentUrl ? { documentUrl: input.documentUrl } : {}),
    ...(input.fileName ? { fileName: input.fileName } : {}),
    ...(input.fileSize !== undefined ? { fileSize: input.fileSize } : {}),
    ...(input.fileType ? { fileType: input.fileType } : {})
  };

  const updated = [newRecord, ...all];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save certificate locally:', err);
  }

  // Trigger Supabase in background
  createCertificateAsync(input).catch(console.error);

  return newRecord;
}

// Input type for updating existing certificates
export type CertificateUpdateInput = Partial<{
  studentName: string;
  studentEmail: string;
  course: string;
  certificateNumber: string;
  dateIssued: string;
  courseDuration: string;
  certificateType: string;
  studentId: string;
  completionDate: string;
  additionalNotes: string;
  status: 'valid' | 'revoked';
  documentUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}>;

// Asynchronously update an existing certificate in Supabase and local cache
export async function updateCertificateAsync(
  id: string,
  updates: CertificateUpdateInput
): Promise<{ success: boolean; certificate?: CertificateRecord; error?: string }> {
  const all = getCertificates();
  const cleanId = id.trim().toUpperCase();
  const index = all.findIndex(c => c.id.toUpperCase() === cleanId);
  if (index === -1) {
    return { success: false, error: 'Certificate record not found.' };
  }

  const existing = all[index];
  const updatedRecord: CertificateRecord = {
    ...existing,
    ...(updates.studentName !== undefined ? { studentName: updates.studentName.trim() } : {}),
    ...(updates.studentEmail !== undefined ? { studentEmail: updates.studentEmail.trim() || undefined } : {}),
    ...(updates.course !== undefined ? { course: updates.course.trim() } : {}),
    ...(updates.certificateNumber !== undefined ? { certificateNumber: updates.certificateNumber.trim() } : {}),
    ...(updates.dateIssued !== undefined ? { dateIssued: updates.dateIssued } : {}),
    ...(updates.courseDuration !== undefined ? { courseDuration: updates.courseDuration.trim() } : {}),
    ...(updates.certificateType !== undefined ? { certificateType: updates.certificateType.trim() } : {}),
    ...(updates.completionDate !== undefined ? { completionDate: updates.completionDate.trim() || undefined } : {}),
    ...(updates.status !== undefined ? { status: updates.status } : {}),
    ...(updates.documentUrl !== undefined ? { documentUrl: updates.documentUrl } : {}),
    ...(updates.fileName !== undefined ? { fileName: updates.fileName } : {}),
    ...(updates.fileSize !== undefined ? { fileSize: updates.fileSize } : {}),
    ...(updates.fileType !== undefined ? { fileType: updates.fileType } : {})
  };

  // Explicitly handle studentId update without leaving undefined
  if (updates.studentId !== undefined) {
    const trimmed = updates.studentId.trim();
    if (trimmed) {
      updatedRecord.studentId = trimmed;
    } else {
      delete updatedRecord.studentId;
    }
  }

  // Explicitly handle additionalNotes update without leaving undefined
  if (updates.additionalNotes !== undefined) {
    const trimmed = updates.additionalNotes.trim();
    if (trimmed) {
      updatedRecord.additionalNotes = trimmed;
    } else {
      delete updatedRecord.additionalNotes;
    }
  }

  all[index] = updatedRecord;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to update certificate locally:', err);
  }

  // 1. Update in Firebase Firestore
  if (isFirebaseConfigured() && db) {
    try {
      const sanitized = sanitizeFirestorePayload(updatedRecord);
      await setDoc(doc(db, 'certificates', existing.id), sanitized, { merge: true });
      console.log('Certificate successfully updated in Firebase Firestore:', existing.id);
    } catch (fbErr: any) {
      console.warn('Firebase certificate update notice:', fbErr?.message || fbErr);
    }
  }

  // 2. Update in Supabase (if configured)
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client
        .from('certificates')
        .update(mapToSupabaseRow(updatedRecord))
        .eq('id', existing.id);

      if (error) {
        console.warn('Supabase update notice:', error.message);
      } else {
        console.log('Certificate successfully updated in Supabase:', existing.id);
      }
    } catch (err: any) {
      console.warn('Supabase update notice:', err?.message || err);
    }
  }

  return { success: true, certificate: updatedRecord };
}

// Update certificate status (valid or revoked) in Supabase and locally
export async function updateCertificateStatusAsync(id: string, status: 'valid' | 'revoked'): Promise<{ success: boolean; certificate?: CertificateRecord; error?: string }> {
  return updateCertificateAsync(id, { status });
}

// Revoke a certificate
export function revokeCertificate(id: string): CertificateRecord | null {
  const all = getCertificates();
  const index = all.findIndex(c => c.id.toUpperCase() === id.toUpperCase());
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    status: 'revoked'
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to revoke certificate locally:', err);
  }

  updateCertificateStatusAsync(id, 'revoked').catch(console.error);

  return all[index];
}

// Permanently delete a certificate with async Supabase await
export async function deleteCertificateAsync(id: string): Promise<{ success: boolean; error?: string }> {
  const cleanId = id.trim().toUpperCase();

  // 1. Mark ID as deleted tombstone so defaults and Supabase won't re-seed it
  markIdAsDeleted(cleanId);

  // 2. Remove from local storage cache immediately
  const all = getCertificates();
  const filtered = all.filter(c => c.id.toUpperCase() !== cleanId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to update local storage on delete:', err);
  }

  // 3. Delete directly in Firebase Firestore
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'certificates', cleanId));
      console.log('Certificate successfully deleted from Firebase Firestore:', cleanId);
    } catch (fbErr: any) {
      console.warn('Firebase deletion notice:', fbErr?.message || fbErr);
    }
  }

  // 4. Delete in Supabase (if configured)
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client
        .from('certificates')
        .delete()
        .eq('id', cleanId);

      if (error) {
        console.warn('Supabase deletion notice:', error.message);
      } else {
        console.log('Certificate successfully deleted from Supabase:', cleanId);
      }
    } catch (err: any) {
      console.warn('Supabase deletion notice:', err?.message || err);
    }
  }

  return { success: true };
}

// Synchronous local deletion fallback
export function deleteCertificate(id: string): boolean {
  const cleanId = id.trim().toUpperCase();
  markIdAsDeleted(cleanId);

  const all = getCertificates();
  const filtered = all.filter(c => c.id.toUpperCase() !== cleanId);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete certificate locally:', err);
  }

  // Trigger async delete in background
  deleteCertificateAsync(cleanId).catch(console.error);

  return true;
}





// Dashboard Stats calculation
export function getCertificateStats() {
  const all = getCertificates();
  const total = all.length;
  const active = all.filter(c => c.status === 'valid').length;
  const revoked = all.filter(c => c.status === 'revoked').length;

  // Issued in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recent = all.filter(c => {
    const issueDate = new Date(c.dateIssued);
    return issueDate >= thirtyDaysAgo;
  }).length;

  return { total, active, revoked, recent };
}

// Admin Authentication Service Abstractions & Rate Limiting
const RATE_LIMIT_STORAGE_KEY = 'ORBIT_ADMIN_RATE_LIMIT_V1';
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_SECONDS = 300; // 5 minutes

export interface LoginRateLimitInfo {
  isLocked: boolean;
  remainingLockoutSeconds: number;
  failedAttempts: number;
  remainingAttempts: number;
}

export function getLoginRateLimitInfo(): LoginRateLimitInfo {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!raw) {
      return {
        isLocked: false,
        remainingLockoutSeconds: 0,
        failedAttempts: 0,
        remainingAttempts: MAX_LOGIN_ATTEMPTS
      };
    }

    const data: { failedAttempts: number; lockoutUntil: number | null } = JSON.parse(raw);
    const now = Date.now();

    if (data.lockoutUntil && data.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((data.lockoutUntil - now) / 1000);
      return {
        isLocked: true,
        remainingLockoutSeconds: remainingSeconds,
        failedAttempts: data.failedAttempts,
        remainingAttempts: 0
      };
    }

    // If lockout has elapsed, reset
    if (data.lockoutUntil && data.lockoutUntil <= now) {
      localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
      return {
        isLocked: false,
        remainingLockoutSeconds: 0,
        failedAttempts: 0,
        remainingAttempts: MAX_LOGIN_ATTEMPTS
      };
    }

    return {
      isLocked: false,
      remainingLockoutSeconds: 0,
      failedAttempts: data.failedAttempts || 0,
      remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - (data.failedAttempts || 0))
    };
  } catch {
    return {
      isLocked: false,
      remainingLockoutSeconds: 0,
      failedAttempts: 0,
      remainingAttempts: MAX_LOGIN_ATTEMPTS
    };
  }
}

function recordFailedAttempt(): { errorMsg: string; isNowLocked: boolean; remainingLockoutSeconds: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const currentData = raw ? JSON.parse(raw) : { failedAttempts: 0, lockoutUntil: null };
    const newAttempts = (currentData.failedAttempts || 0) + 1;

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = Date.now() + (LOCKOUT_DURATION_SECONDS * 1000);
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify({
        failedAttempts: newAttempts,
        lockoutUntil
      }));
      return {
        errorMsg: `Too many failed attempts. For security, login is locked for 5 minutes.`,
        isNowLocked: true,
        remainingLockoutSeconds: LOCKOUT_DURATION_SECONDS
      };
    } else {
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify({
        failedAttempts: newAttempts,
        lockoutUntil: null
      }));
      const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
      return {
        errorMsg: `Access denied. Invalid administrator email or password. (${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining before temporary lockout)`,
        isNowLocked: false,
        remainingLockoutSeconds: 0
      };
    }
  } catch {
    return {
      errorMsg: 'Access denied. Invalid administrator email or password.',
      isNowLocked: false,
      remainingLockoutSeconds: 0
    };
  }
}

export function resetLoginRateLimit(): void {
  try {
    localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset rate limit:', err);
  }
}

export function isAdminAuthenticated(): boolean {
  try {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    return !!session;
  } catch {
    return false;
  }
}

export function getAdminSession(): AdminUser | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function loginAdmin(email: string, pass: string): Promise<AdminUser> {
  // 0. Enforce local loopback execution
  if (!canAccessAdminPortal()) {
    throw new Error('Security Policy: Administrative authentication is strictly restricted to local machine access (127.0.0.1 / localhost).');
  }

  // 1. Check rate limiting before processing
  const rateLimit = getLoginRateLimitInfo();
  if (rateLimit.isLocked) {
    const mins = Math.floor(rateLimit.remainingLockoutSeconds / 60);
    const secs = rateLimit.remainingLockoutSeconds % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    throw new Error(`Security Lockout Active: Too many failed login attempts. Please wait ${timeStr} before trying again.`);
  }

  const cleanEmail = email.trim().toLowerCase();
  
  if (!cleanEmail || !pass) {
    throw new Error('Please enter both email and password.');
  }

  const EXACT_ADMIN_EMAIL = 'orbitspace.ilorin@gmail.com';
  const EXACT_ADMIN_PASSWORD = 'Amazing@3';

  // Strict check: only orbitspace.ilorin@gmail.com and Amazing@3 are authorized
  if (cleanEmail === EXACT_ADMIN_EMAIL && pass === EXACT_ADMIN_PASSWORD) {
    // Reset rate limit on successful authentication
    resetLoginRateLimit();

    const user: AdminUser = {
      email: EXACT_ADMIN_EMAIL,
      name: 'Orbit Space Administrator',
      role: 'Super Administrator'
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
    return user;
  }

  // Record failed attempt and compute lockout
  const failResult = recordFailedAttempt();
  throw new Error(failResult.errorMsg);
}

export function logoutAdmin() {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// Secret Admin Route Path Slugs (obfuscated against guessing/bots)
export const SECRET_ADMIN_PREFIX = 'portal-auth-x98k72';
export const SECRET_ADMIN_LOGIN_PATH = `/${SECRET_ADMIN_PREFIX}/login`;
export const SECRET_ADMIN_DASHBOARD_PATH = `/${SECRET_ADMIN_PREFIX}/dashboard`;

// Canonical local administrator paths
export const LOCAL_ADMIN_PATH = '/admin';
export const LOCAL_ADMIN_LOGIN_PATH = '/admin/login';
export const LOCAL_ADMIN_DASHBOARD_PATH = '/admin/dashboard';

// Generate canonical public authentication URL
export function getPublicAuthUrl(certificateId: string): string {
  const origin = window.location.origin || 'https://orbitspace.academy';
  // Standard domain representation
  const domain = origin.includes('localhost') || origin.includes('ais-dev') || origin.includes('run.app')
    ? 'https://orbitspace.academy'
    : origin;
    
  return `${domain}/${certificateId.toUpperCase()}`;
}

export function getActualBrowserAuthUrl(certificateId: string): string {
  const origin = window.location.origin;
  return `${origin}/${certificateId.toUpperCase()}`;
}

// Format date into human-readable representation, e.g. "February 15, 2026"
export function formatFriendlyDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch {
    // Fallback to raw string
  }
  return dateStr;
}

// Safe resolution of student email (preserves database records, with clean fallback for legacy items)
export function getStudentEmail(cert: CertificateRecord): string {
  if (cert.studentEmail && cert.studentEmail.trim()) {
    return cert.studentEmail.trim();
  }
  const knownEmails: Record<string, string> = {
    'ORB-8F29K2': 'michael.adebayo@gmail.com',
    'ORB-19V8Q3': 'preciousogunleye07@gmail.com',
    'ORB-73K1M9': 'blessing.aminat@gmail.com',
    'ORB-42N9X1': 'chinedu.okafor@gmail.com',
    'ORB-33B8P4': 'zainab.alabi@gmail.com',
    'ORB-91T4K8': 'david.babatunde@gmail.com',
    'ORB-55M2X7': 'fatima.bello@gmail.com'
  };
  const idUpper = cert.id ? cert.id.toUpperCase() : '';
  if (knownEmails[idUpper]) {
    return knownEmails[idUpper];
  }
  const parts = cert.studentName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[parts.length - 1]}@gmail.com`;
  } else if (parts.length === 1) {
    return `${parts[0]}@gmail.com`;
  }
  return 'student@orbitspace.academy';
}

export interface AuthLinksExportFields {
  studentName: boolean;
  email: boolean;
  authUrl: boolean;
  course: boolean;
  dateIssued: boolean;
  certificateType: boolean;
  completionDate: boolean;
  credentialId: boolean;
  studentId: boolean;
  status: boolean;
}

export const DEFAULT_AUTH_LINKS_FIELDS: AuthLinksExportFields = {
  studentName: true,
  email: true,
  authUrl: true,
  course: true,
  dateIssued: true,
  certificateType: false,
  completionDate: false,
  credentialId: false,
  studentId: false,
  status: false
};

export type AuthLinksExportFormat = 'simple' | 'with-email' | 'detailed' | 'spreadsheet-tsv' | 'spreadsheet-csv';

export interface GenerateAuthLinksOptions {
  format: AuthLinksExportFormat;
  fields: AuthLinksExportFields;
  customSeparator?: string; // default ' — '
  useBrowserDomain?: boolean; // If true, uses window.location.origin
}

// Generate cleanly formatted string representation of authentication links
export function generateFormattedAuthLinks(
  certificates: CertificateRecord[],
  options: GenerateAuthLinksOptions
): string {
  if (!certificates || certificates.length === 0) {
    return '';
  }

  const separator = options.customSeparator !== undefined ? options.customSeparator : ' — ';
  const getUrl = (id: string) =>
    options.useBrowserDomain ? getActualBrowserAuthUrl(id) : getPublicAuthUrl(id);

  // 1. Spreadsheet formats (TSV / CSV)
  if (options.format === 'spreadsheet-tsv' || options.format === 'spreadsheet-csv') {
    const isCsv = options.format === 'spreadsheet-csv';
    const cellSep = isCsv ? ',' : '\t';

    const colHeaders: string[] = [];
    if (options.fields.studentName) colHeaders.push('Student Name');
    if (options.fields.email) colHeaders.push('Student Email');
    if (options.fields.authUrl) colHeaders.push('Authentication URL');
    if (options.fields.course) colHeaders.push('Course');
    if (options.fields.dateIssued) colHeaders.push('Date Issued');
    if (options.fields.certificateType) colHeaders.push('Certificate Type');
    if (options.fields.completionDate) colHeaders.push('Completion Date');
    if (options.fields.credentialId) colHeaders.push('Credential ID');
    if (options.fields.studentId) colHeaders.push('Student ID');
    if (options.fields.status) colHeaders.push('Status');

    const escapeCell = (str: string) => {
      if (!isCsv) return str.replace(/[\t\n\r]/g, ' ');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = certificates.map(cert => {
      const email = getStudentEmail(cert);
      const url = getUrl(cert.id);
      const cells: string[] = [];
      if (options.fields.studentName) cells.push(escapeCell(cert.studentName));
      if (options.fields.email) cells.push(escapeCell(email));
      if (options.fields.authUrl) cells.push(escapeCell(url));
      if (options.fields.course) cells.push(escapeCell(cert.course));
      if (options.fields.dateIssued) cells.push(escapeCell(formatFriendlyDate(cert.dateIssued)));
      if (options.fields.certificateType) cells.push(escapeCell(cert.certificateType || 'Professional Certificate'));
      if (options.fields.completionDate) cells.push(escapeCell(formatFriendlyDate(cert.completionDate || cert.dateIssued)));
      if (options.fields.credentialId) cells.push(escapeCell(cert.id));
      if (options.fields.studentId) cells.push(escapeCell(cert.studentId || cert.certificateNumber));
      if (options.fields.status) cells.push(escapeCell(cert.status === 'valid' ? 'Valid' : 'Revoked'));
      return cells.join(cellSep);
    });

    return [colHeaders.join(cellSep), ...rows].join('\n');
  }

  // 2. Detailed format (multi-line labeled cards separated by blank line)
  if (options.format === 'detailed') {
    return certificates
      .map(cert => {
        const email = getStudentEmail(cert);
        const url = getUrl(cert.id);
        const lines: string[] = [];
        if (options.fields.studentName) lines.push(`Name: ${cert.studentName}`);
        if (options.fields.email) lines.push(`Email: ${email}`);
        if (options.fields.course) lines.push(`Course: ${cert.course}`);
        if (options.fields.dateIssued) lines.push(`Date Issued: ${formatFriendlyDate(cert.dateIssued)}`);
        if (options.fields.completionDate && cert.completionDate) {
          lines.push(`Completion Date: ${formatFriendlyDate(cert.completionDate)}`);
        }
        if (options.fields.certificateType) {
          lines.push(`Certificate Type: ${cert.certificateType || 'Professional Certificate'}`);
        }
        if (options.fields.credentialId) lines.push(`Credential ID: ${cert.id}`);
        if (options.fields.studentId) lines.push(`Student ID: ${cert.studentId || cert.certificateNumber}`);
        if (options.fields.status) {
          lines.push(`Status: ${cert.status === 'valid' ? 'Valid & Verified' : 'Revoked'}`);
        }
        if (options.fields.authUrl) lines.push(`Authentication Link: ${url}`);
        return lines.join('\n');
      })
      .join('\n\n');
  }

  // 3. Simple & With-Email single line formats
  return certificates
    .map(cert => {
      const email = getStudentEmail(cert);
      const url = getUrl(cert.id);
      const segments: string[] = [];

      // Student name first
      if (options.fields.studentName) segments.push(cert.studentName);

      // In with-email format or if email is explicitly selected
      if (options.format === 'with-email' || options.fields.email) {
        segments.push(email);
      }

      // Authentication URL
      if (options.fields.authUrl) {
        segments.push(url);
      }

      // Any additional selected fields
      if (options.fields.course) segments.push(cert.course);
      if (options.fields.dateIssued) segments.push(formatFriendlyDate(cert.dateIssued));
      if (options.fields.completionDate && cert.completionDate) {
        segments.push(`Graduated: ${formatFriendlyDate(cert.completionDate)}`);
      }
      if (options.fields.certificateType) segments.push(cert.certificateType || 'Certificate');
      if (options.fields.credentialId) segments.push(cert.id);
      if (options.fields.studentId && (cert.studentId || cert.certificateNumber)) {
        segments.push(`ID: ${cert.studentId || cert.certificateNumber}`);
      }
      if (options.fields.status) {
        segments.push(cert.status === 'valid' ? 'Valid' : 'Revoked');
      }

      return segments.join(separator);
    })
    .join('\n');
}
