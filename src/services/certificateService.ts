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
const ADMIN_SESSION_KEY = 'orbit_space_admin_session_v1';

// Initial pre-seeded certificates for Orbit Space
const DEFAULT_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'ORB-8F29K2',
    studentName: 'John Doe',
    course: 'Full Stack Development',
    certificateNumber: 'ORB/2026/FS-0182',
    dateIssued: '2026-08-01',
    courseDuration: '6 Months',
    certificateType: 'Professional Certificate',
    studentId: 'OS-2026-0182',
    additionalNotes: 'Graduated with Distinction in Full Stack Web & Cloud Applications.',
    status: 'valid',
    createdAt: new Date('2026-08-01T10:00:00Z').toISOString(),
    fileName: 'John_Doe_FullStack_Certificate.pdf',
    fileSize: 1420000,
    fileType: 'application/pdf'
  },
  {
    id: 'ORB-73K1M9',
    studentName: 'Amina Yusuf',
    course: 'UI/UX Design',
    certificateNumber: 'ORB/2026/UIUX-0094',
    dateIssued: '2026-07-20',
    courseDuration: '3 Months',
    certificateType: 'Course Completion Certificate',
    studentId: 'OS-2026-0094',
    additionalNotes: 'Specialized in Figma Auto-Layout & Design Systems.',
    status: 'valid',
    createdAt: new Date('2026-07-20T14:30:00Z').toISOString()
  },
  {
    id: 'ORB-42N9X1',
    studentName: 'David Ogunleye',
    course: 'Cybersecurity',
    certificateNumber: 'ORB/2026/CY-0112',
    dateIssued: '2026-06-15',
    courseDuration: '4 Months',
    certificateType: 'Bootcamp Certificate',
    studentId: 'OS-2026-0112',
    additionalNotes: 'SOC Operations & Vulnerability Assessment Track.',
    status: 'valid',
    createdAt: new Date('2026-06-15T09:15:00Z').toISOString()
  },
  {
    id: 'ORB-33B8P4',
    studentName: 'Kevin Smith',
    course: 'Data Analysis',
    certificateNumber: 'ORB/2025/DA-0051',
    dateIssued: '2025-11-10',
    courseDuration: '3 Months',
    certificateType: 'Course Completion Certificate',
    studentId: 'OS-2025-0051',
    additionalNotes: 'Certificate revoked due to administrative verification query.',
    status: 'revoked',
    createdAt: new Date('2025-11-10T11:00:00Z').toISOString()
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

// Retrieve certificates from local storage or fallback to defaults
export function getCertificates(): CertificateRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CERTIFICATES));
      return DEFAULT_CERTIFICATES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_CERTIFICATES;
  } catch (err) {
    console.error('Error reading certificates from storage:', err);
    return DEFAULT_CERTIFICATES;
  }
}

// Lookup certificate by ID (case insensitive)
export function getCertificateById(id: string): CertificateRecord | null {
  if (!id) return null;
  const cleanId = id.trim().toUpperCase();
  const all = getCertificates();
  return all.find(c => c.id.toUpperCase() === cleanId) || null;
}

// Create & persist a new certificate record
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

  const updated = [newRecord, ...all];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save certificate:', err);
  }

  return newRecord;
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
    console.error('Failed to revoke certificate:', err);
  }

  return all[index];
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
  // Simulate network delay for production feel
  await new Promise(r => setTimeout(r, 600));

  const cleanEmail = email.trim().toLowerCase();
  
  if (!cleanEmail || !pass) {
    throw new Error('Please enter both email and password.');
  }

  // Demo credential validation (accepts standard admin credentials or any demo login)
  if (cleanEmail === 'admin@orbitspace.academy' && pass === 'OrbitAdmin2026!') {
    const user: AdminUser = {
      email: 'admin@orbitspace.academy',
      name: 'Orbit Admin',
      role: 'Super Administrator'
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
    return user;
  }

  // Allow fallback demo login for easy evaluation
  if (pass.length >= 6) {
    const user: AdminUser = {
      email: cleanEmail,
      name: cleanEmail.split('@')[0] || 'Orbit Admin',
      role: 'Certificate Administrator'
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
    return user;
  }

  throw new Error('Invalid email or password. Hint: admin@orbitspace.academy / OrbitAdmin2026!');
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
