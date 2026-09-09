/**
 * SheetDB Integration Service for Orbit Space Admin
 * Connects directly to the Google Sheet via SheetDB REST API:
 * https://sheetdb.io/api/v1/jaa32wk9mncqz
 */

export const DEFAULT_SHEETDB_URL = 'https://sheetdb.io/api/v1/jaa32wk9mncqz';
const SHEETDB_CONFIG_KEY = 'orbit_space_sheetdb_endpoint_v1';
const SHEETDB_CACHE_KEY = 'orbit_space_sheetdb_cached_students_v1';
const SHEETDB_PROGRAMS_CACHE_KEY = 'orbit_space_sheetdb_cached_programs_v1';

export const DEFAULT_PROGRAMS: string[] = [
  'Cybersecurity',
  'Data Analysis',
  'Frontend Development',
  'Backend Development',
  'UI/UX Design',
  'Video Editing',
  'AI Web Development & Brand Identity',
  'Full Stack Development',
  'AI Automation',
  'Content Creation, Mobile Photography & Videography'
];

export interface SheetDBStudent {
  studentId: string;          // "Student ID" (e.g. STU-00001)
  matricNumber: string;       // "Matric Number" (e.g. ORB/2026/0001)
  fullName: string;           // "Full Name"
  email: string;              // "Email Address"
  phone: string;              // "Phone Number"
  gender: string;             // "Gender"
  institution: string;        // "Institution / School"
  courseOfStudy: string;      // "Course of Study"
  academicLevel: string;      // "Academic Level"
  program: string;            // "Program"
  studentType: string;        // "Student Type"
  cohort: string;             // "Cohort"
  registrationDate: string;   // "Registration Date"
  startDate: string;          // "Start Date"
  endDate: string;            // "End Date"
  trainingMode: string;       // "Training Mode"
  baseFee: string;            // "Base Fee"
  siwesDiscount: string;      // "SIWES Discount"
  netFee: string;             // "Net Fee"
  totalPaid: string;          // "Total Paid"
  outstandingBalance: string; // "Outstanding Balance"
  paymentStatus: string;      // "Payment Status"
  studentStatus: string;      // "Student Status"
  rawRowIndex?: number;
}

export interface SheetDBHealth {
  ok: boolean;
  endpoint: string;
  latencyMs: number;
  sheets: string[];
  error?: string;
}

/**
 * Retrieves configured SheetDB endpoint
 */
export function getSheetDBEndpoint(): string {
  try {
    const saved = localStorage.getItem(SHEETDB_CONFIG_KEY);
    if (saved && saved.trim().startsWith('http')) {
      return saved.trim().replace(/\/+$/, '');
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_SHEETDB_URL;
}

/**
 * Sets custom SheetDB endpoint
 */
export function setSheetDBEndpoint(url: string): void {
  try {
    const cleaned = url.trim().replace(/\/+$/, '');
    localStorage.setItem(SHEETDB_CONFIG_KEY, cleaned);
  } catch (e) {
    console.warn('Failed to save SheetDB URL to storage', e);
  }
}

/**
 * Resets SheetDB endpoint to default
 */
export function resetSheetDBEndpoint(): void {
  try {
    localStorage.removeItem(SHEETDB_CONFIG_KEY);
  } catch (e) {
    console.warn('Failed to reset SheetDB URL', e);
  }
}

/**
 * Resilient fetch helper that attempts same-origin Vite proxy (/api/sheetdb)
 * to avoid browser iframe CORS / tracking-blocker issues, falling back to direct URL.
 */
async function fetchFromSheetDB(pathAndQuery: string, options: RequestInit = {}): Promise<Response> {
  const endpoint = getSheetDBEndpoint();
  const cleanPath = pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`;

  // 1. If in browser and pointing to sheetdb.io, attempt same-origin Vite proxy first
  if (typeof window !== 'undefined' && endpoint.includes('sheetdb.io')) {
    try {
      const proxyUrl = `/api/sheetdb${endpoint.replace('https://sheetdb.io', '')}${cleanPath}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(proxyUrl, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return res;
      }
    } catch {
      // Proceed to direct URL fallback
    }
  }

  // 2. Direct endpoint
  const directUrl = `${endpoint}${cleanPath}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(directUrl, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Test connectivity to SheetDB endpoint
 */
export async function checkSheetDBHealth(): Promise<SheetDBHealth> {
  const endpoint = getSheetDBEndpoint();
  const startTime = Date.now();
  try {
    const response = await fetchFromSheetDB('/sheets', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const latencyMs = Date.now() - startTime;
    if (!response.ok) {
      return {
        ok: false,
        endpoint,
        latencyMs,
        sheets: ['Students', 'Settings'],
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();
    const sheets = Array.isArray(data?.sheets) ? data.sheets : ['Students', 'Settings'];

    return {
      ok: true,
      endpoint,
      latencyMs,
      sheets
    };
  } catch (err: any) {
    return {
      ok: false,
      endpoint,
      latencyMs: Date.now() - startTime,
      sheets: ['Students', 'Settings'],
      error: err?.message || 'Failed to connect to SheetDB endpoint'
    };
  }
}

/**
 * Maps raw SheetDB row to clean SheetDBStudent object
 */
function mapRawRowToStudent(row: Record<string, any>, index: number): SheetDBStudent {
  return {
    studentId: (row['Student ID'] || row['student_id'] || row['ID'] || `STU-${String(index + 1).padStart(5, '0')}`).toString().trim(),
    matricNumber: (row['Matric Number'] || row['matric_number'] || row['Matric'] || '').toString().trim(),
    fullName: (row['Full Name'] || row['full_name'] || row['Name'] || row['Student Name'] || '').toString().trim(),
    email: (row['Email Address'] || row['email'] || row['Email'] || '').toString().trim(),
    phone: (row['Phone Number'] || row['phone'] || row['Phone'] || '').toString().trim(),
    gender: (row['Gender'] || row['gender'] || '').toString().trim(),
    institution: (row['Institution / School'] || row['institution'] || row['School'] || '').toString().trim(),
    courseOfStudy: (row['Course of Study'] || row['course_of_study'] || '').toString().trim(),
    academicLevel: (row['Academic Level'] || row['academic_level'] || '').toString().trim(),
    program: (row['Program'] || row['program'] || row['Course'] || '').toString().trim(),
    studentType: (row['Student Type'] || row['student_type'] || 'Regular').toString().trim(),
    cohort: (row['Cohort'] || row['cohort'] || '1').toString().trim(),
    registrationDate: (row['Registration Date'] || row['registration_date'] || '').toString().trim(),
    startDate: (row['Start Date'] || row['start_date'] || '').toString().trim(),
    endDate: (row['End Date'] || row['end_date'] || '').toString().trim(),
    trainingMode: (row['Training Mode'] || row['training_mode'] || 'Physical').toString().trim(),
    baseFee: (row['Base Fee'] || row['base_fee'] || '').toString().trim(),
    siwesDiscount: (row['SIWES Discount'] || row['siwes_discount'] || '').toString().trim(),
    netFee: (row['Net Fee'] || row['net_fee'] || '').toString().trim(),
    totalPaid: (row['Total Paid'] || row['total_paid'] || '').toString().trim(),
    outstandingBalance: (row['Outstanding Balance'] || row['outstanding_balance'] || '').toString().trim(),
    paymentStatus: (row['Payment Status'] || row['payment_status'] || '').toString().trim(),
    studentStatus: (row['Student Status'] || row['student_status'] || '').toString().trim(),
    rawRowIndex: index
  };
}

/**
 * Fetch all students from the "Students" sheet
 */
export async function fetchSheetDBStudents(includeEmptySlots: boolean = false): Promise<SheetDBStudent[]> {
  try {
    const response = await fetchFromSheetDB('?sheet=Students', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`SheetDB responded with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    const mapped: SheetDBStudent[] = data.map((row, idx) => mapRawRowToStudent(row, idx));

    // Cache to localStorage for fast initial render or offline resilience
    try {
      localStorage.setItem(SHEETDB_CACHE_KEY, JSON.stringify(mapped));
    } catch {
      // cache write failed
    }

    if (includeEmptySlots) {
      return mapped;
    }

    // Filter to rows that have at least a Name, Email, or Program filled out
    return mapped.filter(s => s.fullName.length > 0 || s.email.length > 0 || s.program.length > 0);
  } catch (err: any) {
    console.warn('SheetDB student fetch warning, checking cache:', err?.message || err);
    // Try returning cached copy if available
    try {
      const cached = localStorage.getItem(SHEETDB_CACHE_KEY);
      if (cached) {
        const parsed: SheetDBStudent[] = JSON.parse(cached);
        if (includeEmptySlots) return parsed;
        return parsed.filter(s => s.fullName.length > 0 || s.email.length > 0);
      }
    } catch {
      // ignore
    }
    return [];
  }
}

/**
 * Fetch lookup programs and settings from the "Settings" sheet
 */
export async function fetchSheetDBSettings(): Promise<string[]> {
  try {
    const response = await fetchFromSheetDB('?sheet=Settings', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const programs: string[] = [];
        const key = Object.keys(data[0] || {})[0];
        if (key) {
          for (const row of data) {
            const val = row[key];
            if (val && typeof val === 'string' && val.trim().length > 0) {
              if (!val.includes('Master configuration') && !val.includes('Program / Course Name')) {
                programs.push(val.trim());
              }
            }
          }
        }
        if (programs.length > 0) {
          try {
            localStorage.setItem(SHEETDB_PROGRAMS_CACHE_KEY, JSON.stringify(programs));
          } catch {
            // ignore cache write error
          }
          return programs;
        }
      }
    }
  } catch (err: any) {
    console.warn('SheetDB settings unavailable, using cached/default programs:', err?.message || err);
  }

  // Fallback to cached or defaults
  try {
    const cached = localStorage.getItem(SHEETDB_PROGRAMS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }

  return DEFAULT_PROGRAMS;
}

/**
 * Register a new student into the Google Sheet via SheetDB POST
 */
export async function addStudentToSheetDB(student: Partial<SheetDBStudent>): Promise<boolean> {
  const payload = {
    data: [
      {
        'Student ID': student.studentId || '',
        'Matric Number': student.matricNumber || '',
        'Full Name': student.fullName || '',
        'Email Address': student.email || '',
        'Phone Number': student.phone || '',
        'Gender': student.gender || '',
        'Institution / School': student.institution || '',
        'Course of Study': student.courseOfStudy || '',
        'Academic Level': student.academicLevel || '',
        'Program': student.program || '',
        'Student Type': student.studentType || 'Regular',
        'Cohort': student.cohort || '1',
        'Registration Date': student.registrationDate || new Date().toISOString().split('T')[0],
        'Start Date': student.startDate || '',
        'End Date': student.endDate || '',
        'Training Mode': student.trainingMode || 'Physical',
        'Base Fee': student.baseFee || '',
        'SIWES Discount': student.siwesDiscount || '₦0',
        'Net Fee': student.netFee || '',
        'Total Paid': student.totalPaid || '₦0',
        'Outstanding Balance': student.outstandingBalance || '',
        'Payment Status': student.paymentStatus || 'Pending',
        'Student Status': student.studentStatus || 'Active'
      }
    ]
  };

  const response = await fetchFromSheetDB('?sheet=Students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add student to SheetDB (HTTP ${response.status}): ${errorText}`);
  }

  return true;
}

/**
 * Update an existing student in SheetDB via PATCH
 */
export async function updateStudentInSheetDB(studentId: string, updates: Partial<SheetDBStudent>): Promise<boolean> {
  const patchData: Record<string, any> = {};

  if (updates.fullName !== undefined) patchData['Full Name'] = updates.fullName;
  if (updates.email !== undefined) patchData['Email Address'] = updates.email;
  if (updates.phone !== undefined) patchData['Phone Number'] = updates.phone;
  if (updates.program !== undefined) patchData['Program'] = updates.program;
  if (updates.paymentStatus !== undefined) patchData['Payment Status'] = updates.paymentStatus;
  if (updates.studentStatus !== undefined) patchData['Student Status'] = updates.studentStatus;
  if (updates.totalPaid !== undefined) patchData['Total Paid'] = updates.totalPaid;
  if (updates.outstandingBalance !== undefined) patchData['Outstanding Balance'] = updates.outstandingBalance;

  const response = await fetchFromSheetDB(`/Student%20ID/${encodeURIComponent(studentId)}?sheet=Students`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ data: patchData })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update student in SheetDB (HTTP ${response.status}): ${errorText}`);
  }

  return true;
}
