import { getSupabase, isSupabaseConfigured } from './supabase';

export interface CertificateRecord {
  id: string; // Public authentication ID, e.g. "ORB-8F29K2"
  studentName: string;
  course: string;
  certificateNumber: string; // e.g. "ORB/2026/FS-0142"
  dateIssued: string; // YYYY-MM-DD
  courseDuration?: string;
  certificateType?: string;
  studentId?: string;
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

// Zero initial mock certificates - everything is 100% real database records
const DEFAULT_CERTIFICATES: CertificateRecord[] = [];

// Helper to generate unique ID in ORB-XXXXXX format
export function generateCertificateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORB-${result}`;
}

// Supabase Record Mapping
function mapToCertificateRecord(row: Record<string, any>): CertificateRecord {
  return {
    id: row.id,
    studentName: row.student_name,
    course: row.course,
    certificateNumber: row.certificate_number,
    dateIssued: row.date_issued,
    courseDuration: row.course_duration,
    certificateType: row.certificate_type,
    studentId: row.student_id,
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
    course: cert.course,
    certificate_number: cert.certificateNumber,
    date_issued: cert.dateIssued,
    course_duration: cert.courseDuration,
    certificate_type: cert.certificateType,
    student_id: cert.studentId,
    additional_notes: cert.additionalNotes,
    status: cert.status,
    created_at: cert.createdAt,
    document_url: cert.documentUrl,
    file_name: cert.fileName,
    file_size: cert.fileSize,
    file_type: cert.fileType
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

// Asynchronously fetch from Supabase and cache locally
export async function syncCertificatesFromSupabase(): Promise<CertificateRecord[]> {
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

    if (data) {
      // Filter out any IDs that were deleted by the admin
      const records = data
        .map(mapToCertificateRecord)
        .filter(c => !deletedSet.has(c.id.toUpperCase()));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return records;
    }
  } catch (err) {
    console.warn('Could not sync with Supabase, relying on local storage:', err);
  }

  return getCertificates();
}

const LEGACY_MOCK_IDS = new Set(['ORB-8F29K2', 'ORB-73K1M9', 'ORB-42N9X1', 'ORB-33B8P4']);

// Retrieve certificates from local storage or fallback to defaults (filtered by deleted set & legacy mocks)
export function getCertificates(): CertificateRecord[] {
  const deletedSet = getDeletedIds();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    const list: CertificateRecord[] = Array.isArray(parsed) ? parsed : [];
    // Filter out legacy mock data & deleted records
    const realList = list.filter(c => !deletedSet.has(c.id.toUpperCase()) && !LEGACY_MOCK_IDS.has(c.id.toUpperCase()));
    return realList;
  } catch (err) {
    console.error('Error reading certificates from storage:', err);
    return [];
  }
}

// Lookup certificate by ID (case insensitive, tries Supabase first then local)
export async function fetchCertificateByIdAsync(id: string): Promise<CertificateRecord | null> {
  if (!id) return null;
  const cleanId = id.trim().toUpperCase();
  const deletedSet = getDeletedIds();

  // If permanently deleted, immediately return null
  if (deletedSet.has(cleanId)) {
    return null;
  }

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
    course: string;
    certificateNumber?: string;
    dateIssued: string;
    courseDuration?: string;
    certificateType?: string;
    studentId?: string;
    additionalNotes?: string;
    documentUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  }
): Promise<{ success: boolean; certificate?: CertificateRecord; error?: string }> {
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
    studentId: input.studentId?.trim() || undefined,
    additionalNotes: input.additionalNotes?.trim() || undefined,
    status: 'valid',
    createdAt: new Date().toISOString(),
    documentUrl: input.documentUrl,
    fileName: input.fileName,
    fileSize: input.fileSize,
    fileType: input.fileType
  };

  // Update local cache
  const updated = [newRecord, ...all];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save certificate locally:', err);
  }

  // Insert into Supabase
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client
        .from('certificates')
        .insert([mapToSupabaseRow(newRecord)]);

      if (error) {
        console.error('Supabase certificate insert error:', error.message);
        return { success: false, certificate: newRecord, error: error.message };
      }
      console.log('Certificate successfully inserted in Supabase:', newRecord.id);
    } catch (err: any) {
      console.error('Supabase exception on insert:', err);
      return { success: false, certificate: newRecord, error: err?.message || 'Database network error' };
    }
  }

  return { success: true, certificate: newRecord };
}

// Create & persist a new certificate record (synchronous wrapper)
export function createCertificate(
  input: {
    studentName: string;
    course: string;
    certificateNumber?: string;
    dateIssued: string;
    courseDuration?: string;
    certificateType?: string;
    studentId?: string;
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
    studentId: input.studentId?.trim() || undefined,
    additionalNotes: input.additionalNotes?.trim() || undefined,
    status: 'valid',
    createdAt: new Date().toISOString(),
    documentUrl: input.documentUrl,
    fileName: input.fileName,
    fileSize: input.fileSize,
    fileType: input.fileType
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
  course: string;
  certificateNumber: string;
  dateIssued: string;
  courseDuration: string;
  certificateType: string;
  studentId: string;
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
    ...(updates.course !== undefined ? { course: updates.course.trim() } : {}),
    ...(updates.certificateNumber !== undefined ? { certificateNumber: updates.certificateNumber.trim() } : {}),
    ...(updates.dateIssued !== undefined ? { dateIssued: updates.dateIssued } : {}),
    ...(updates.courseDuration !== undefined ? { courseDuration: updates.courseDuration.trim() } : {}),
    ...(updates.certificateType !== undefined ? { certificateType: updates.certificateType.trim() } : {}),
    ...(updates.studentId !== undefined ? { studentId: updates.studentId.trim() || undefined } : {}),
    ...(updates.additionalNotes !== undefined ? { additionalNotes: updates.additionalNotes.trim() || undefined } : {}),
    ...(updates.status !== undefined ? { status: updates.status } : {}),
    ...(updates.documentUrl !== undefined ? { documentUrl: updates.documentUrl } : {}),
    ...(updates.fileName !== undefined ? { fileName: updates.fileName } : {}),
    ...(updates.fileSize !== undefined ? { fileSize: updates.fileSize } : {}),
    ...(updates.fileType !== undefined ? { fileType: updates.fileType } : {})
  };

  all[index] = updatedRecord;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to update certificate locally:', err);
  }

  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client
        .from('certificates')
        .update(mapToSupabaseRow(updatedRecord))
        .eq('id', existing.id);

      if (error) {
        console.error('Supabase update error:', error.message);
        return { success: false, certificate: updatedRecord, error: error.message };
      }
      console.log('Certificate successfully updated in Supabase:', existing.id);
    } catch (err: any) {
      console.error('Supabase update exception:', err);
      return { success: false, certificate: updatedRecord, error: err?.message || 'Database error' };
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

  // 3. Delete directly in Supabase and await result
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client
        .from('certificates')
        .delete()
        .eq('id', cleanId);

      if (error) {
        console.error('Supabase deletion error:', error.message);
        return { success: false, error: error.message };
      }
      console.log('Certificate successfully deleted from Supabase:', cleanId);
    } catch (err: any) {
      console.error('Supabase deletion exception:', err);
      return { success: false, error: err?.message || 'Network error' };
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

// Admin Authentication Service Abstractions
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
  const cleanEmail = email.trim().toLowerCase();
  
  if (!cleanEmail || !pass) {
    throw new Error('Please enter both email and password.');
  }

  const EXACT_ADMIN_EMAIL = 'orbitspace.ilorin@gmail.com';
  const EXACT_ADMIN_PASSWORD = 'Amazing@3';

  // Strict check: only orbitspace.ilorin@gmail.com and Amazing@3 are authorized
  if (cleanEmail === EXACT_ADMIN_EMAIL && pass === EXACT_ADMIN_PASSWORD) {
    const user: AdminUser = {
      email: EXACT_ADMIN_EMAIL,
      name: 'Orbit Space Administrator',
      role: 'Super Administrator'
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
    return user;
  }

  // Any other email or password is completely denied
  throw new Error('Access denied. Invalid administrator email or password.');
}

export function logoutAdmin() {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (err) {
    console.error('Logout error:', err);
  }
}

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
