import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { TutorService, TutorProfile } from './tutorService';

export type LedgerEntryType = 'historical' | 'attendance' | 'adjustment';

export interface TeachingHourLedgerEntry {
  id: string;
  lecturerId: string;
  lecturerName: string;
  date: string; // YYYY-MM-DD
  type: LedgerEntryType;
  description: string;
  hours: number; // positive or negative (+146, +2, -2)
  addedBy: string;
  createdAt: string; // ISO timestamp
  attendanceSessionId?: string; // used to uniquely track attendance contribution and prevent double-counting
  auditReason?: string;
  referenceNote?: string;
  adjustmentDirection?: 'add' | 'subtract';
}

export interface LecturerLedgerSummary {
  lecturerId: string;
  lecturerName: string;
  historicalHours: number;
  attendanceHours: number;
  adjustmentHours: number;
  totalTeachingHours: number;
  entriesCount: number;
  entries: TeachingHourLedgerEntry[];
}

const LEDGER_STORAGE_KEY = 'orbit_teaching_hours_ledger_v2';
let ledgerMemoryCache: TeachingHourLedgerEntry[] | null = null;
const ledgerListeners = new Set<(entries: TeachingHourLedgerEntry[]) => void>();

// Default baseline ledger entries for pre-seeded faculty members
export const DEFAULT_HISTORICAL_ENTRIES: TeachingHourLedgerEntry[] = [
  {
    id: 'led-hist-lawal-01',
    lecturerId: 'tch-lawal-frontend',
    lecturerName: 'Lawal (Senior Frontend Lead)',
    date: '2026-01-15',
    type: 'historical',
    description: 'Imported manual attendance records (Q1 2024 – Q4 2025 Foundation Cohorts)',
    hours: 146,
    addedBy: 'Super Admin (Engr. Precious Ogunleye)',
    createdAt: '2026-01-15T09:00:00.000Z',
    auditReason: 'Verified institutional manual attendance registry prior to digital platform deployment.',
    referenceNote: 'Audit Log Vol 2 / Registry Page 42',
  },
  {
    id: 'led-hist-olamide-01',
    lecturerId: 'tch-olamide-sec',
    lecturerName: 'Olamide (Lead Security Engineer)',
    date: '2026-01-15',
    type: 'historical',
    description: 'Manual Cyber Security & SOC Lab registers (2024 – 2025 Cohorts)',
    hours: 132,
    addedBy: 'Super Admin (Engr. Precious Ogunleye)',
    createdAt: '2026-01-15T09:15:00.000Z',
    auditReason: 'Verified laboratory instructor logs and student defense reviews.',
    referenceNote: 'Audit Log Vol 2 / Registry Page 55',
  },
  {
    id: 'led-hist-stat-01',
    lecturerId: 'tch-stat-data',
    lecturerName: 'Mr. Stat (Lead Data Science Mentor)',
    date: '2026-01-15',
    type: 'historical',
    description: 'Verified statistics, SQL & data lab instruction logbook (2024 – 2025)',
    hours: 118,
    addedBy: 'Super Admin (Engr. Precious Ogunleye)',
    createdAt: '2026-01-15T09:30:00.000Z',
    auditReason: 'Audited physical attendance registers for Python and PowerBI cohorts.',
    referenceNote: 'Audit Log Vol 2 / Registry Page 68',
  },
  {
    id: 'led-hist-precious-vid-01',
    lecturerId: 'tch-precious-video',
    lecturerName: 'Precious (Creative Media Lead)',
    date: '2026-01-15',
    type: 'historical',
    description: 'Verified video editing & creative studio logbook (2024 – 2025)',
    hours: 95,
    addedBy: 'Super Admin (Engr. Precious Ogunleye)',
    createdAt: '2026-01-15T09:45:00.000Z',
    auditReason: 'Audited post-production suite studio logs.',
    referenceNote: 'Audit Log Vol 2 / Registry Page 81',
  },
];

function notifyListeners(entries: TeachingHourLedgerEntry[]) {
  ledgerListeners.forEach((listener) => {
    try {
      listener(entries);
    } catch (err) {
      console.error('Error in ledger listener:', err);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('orbit-teaching-hours-ledger-updated', { detail: entries }));
  }
}

function saveLocal(entries: TeachingHourLedgerEntry[]) {
  ledgerMemoryCache = entries;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.warn('Failed saving ledger to localStorage', e);
    }
  }
  notifyListeners(entries);
}

function loadLocal(): TeachingHourLedgerEntry[] {
  if (ledgerMemoryCache && ledgerMemoryCache.length > 0) {
    return ledgerMemoryCache;
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
      if (raw) {
        const parsed: TeachingHourLedgerEntry[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          ledgerMemoryCache = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading local teaching hours ledger:', e);
    }
  }

  // Fallback to default historical entries
  ledgerMemoryCache = [...DEFAULT_HISTORICAL_ENTRIES];
  return ledgerMemoryCache;
}

export const TeachingHoursLedgerService = {
  /**
   * Retrieves all ledger entries (sorted by date descending)
   */
  getAllEntries(): TeachingHourLedgerEntry[] {
    const list = loadLocal();
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Subscribe to ledger changes
   */
  subscribe(callback: (entries: TeachingHourLedgerEntry[]) => void): () => void {
    ledgerListeners.add(callback);
    callback(this.getAllEntries());
    return () => {
      ledgerListeners.delete(callback);
    };
  },

  /**
   * Syncs ledger from Firestore in background
   */
  async syncFromFirestore(): Promise<TeachingHourLedgerEntry[]> {
    try {
      const snap = await getDocs(collection(db, 'teaching_hours_ledger'));
      if (!snap.empty) {
        const cloudEntries: TeachingHourLedgerEntry[] = [];
        snap.forEach((d) => {
          const item = d.data() as TeachingHourLedgerEntry;
          if (item && item.id) {
            cloudEntries.push(item);
          }
        });

        if (cloudEntries.length > 0) {
          const local = loadLocal();
          const map = new Map<string, TeachingHourLedgerEntry>();
          local.forEach((e) => map.set(e.id, e));
          cloudEntries.forEach((e) => map.set(e.id, e));

          const merged = Array.from(map.values());
          saveLocal(merged);
          return merged;
        }
      }
    } catch (err) {
      console.warn('Firestore sync failed for teaching_hours_ledger, using local cache:', err);
    }
    return loadLocal();
  },

  /**
   * Get all ledger entries for a specific lecturer
   */
  getEntriesForLecturer(lecturerIdOrSlug: string): TeachingHourLedgerEntry[] {
    const all = this.getAllEntries();
    const query = (lecturerIdOrSlug || '').toLowerCase().trim();
    return all.filter((e) => {
      const eId = (e.lecturerId || '').toLowerCase().trim();
      return eId === query || e.lecturerName.toLowerCase().includes(query);
    });
  },

  /**
   * Calculates dynamic teaching hours breakdown from the immutable ledger
   * Total = SUM(historical) + SUM(attendance) + SUM(adjustment)
   */
  getLecturerLedgerSummary(lecturerIdOrSlug: string): LecturerLedgerSummary {
    const entries = this.getEntriesForLecturer(lecturerIdOrSlug);
    let lecturerName = '';

    const tutor = TutorService.getTutorById(lecturerIdOrSlug) || TutorService.getTutorBySlug(lecturerIdOrSlug);
    if (tutor) {
      lecturerName = tutor.name;
    } else if (entries.length > 0) {
      lecturerName = entries[0].lecturerName;
    }

    let historicalHours = 0;
    let attendanceHours = 0;
    let adjustmentHours = 0;

    entries.forEach((e) => {
      const h = Number(e.hours) || 0;
      if (e.type === 'historical') {
        historicalHours += h;
      } else if (e.type === 'attendance') {
        attendanceHours += h;
      } else if (e.type === 'adjustment') {
        adjustmentHours += h;
      }
    });

    historicalHours = Math.round(historicalHours * 10) / 10;
    attendanceHours = Math.round(attendanceHours * 10) / 10;
    adjustmentHours = Math.round(adjustmentHours * 10) / 10;
    const totalTeachingHours = Math.round((historicalHours + attendanceHours + adjustmentHours) * 10) / 10;

    return {
      lecturerId: tutor ? tutor.id : lecturerIdOrSlug,
      lecturerName: lecturerName || 'Faculty Member',
      historicalHours,
      attendanceHours,
      adjustmentHours,
      totalTeachingHours,
      entriesCount: entries.length,
      entries,
    };
  },

  /**
   * Adds an entry to the ledger and persists to Firestore & LocalStorage
   */
  async addEntry(entry: TeachingHourLedgerEntry): Promise<TeachingHourLedgerEntry> {
    const all = loadLocal();
    const existingIdx = all.findIndex((e) => e.id === entry.id);
    if (existingIdx >= 0) {
      all[existingIdx] = entry;
    } else {
      all.unshift(entry);
    }

    saveLocal(all);

    // Save to Firestore in background
    try {
      await setDoc(doc(db, 'teaching_hours_ledger', entry.id), entry);
    } catch (e) {
      console.warn('Could not save ledger entry to Firestore:', e);
    }

    return entry;
  },

  /**
   * Records or updates attendance-based teaching hours from completed class sessions.
   * STRICT AVOID DOUBLE-COUNTING:
   * Checks if an entry with attendanceSessionId already exists for this lecturer.
   * If it exists, updates duration if altered; does not create a duplicate transaction.
   */
  async recordAttendanceSession(params: {
    sessionId: string;
    lecturerId: string;
    lecturerName?: string;
    course: string;
    cohort?: string;
    date: string;
    durationHours: number;
    recordedBy?: string;
    sessionTopic?: string;
  }): Promise<TeachingHourLedgerEntry | null> {
    const { sessionId, lecturerId, course, cohort, date, durationHours, recordedBy, sessionTopic } = params;
    if (!sessionId || !lecturerId || durationHours <= 0) return null;

    const all = loadLocal();
    const lecturer = TutorService.getTutorById(lecturerId) || TutorService.getTutorBySlug(lecturerId);
    const lecturerName = params.lecturerName || (lecturer ? lecturer.name : 'Assigned Lecturer');

    // Look for existing attendance ledger entry matching this session and lecturer
    const existing = all.find(
      (e) => e.type === 'attendance' && e.attendanceSessionId === sessionId && e.lecturerId === lecturerId
    );

    const roundedHours = Math.round(durationHours * 10) / 10;

    if (existing) {
      // If duration hasn't changed, keep as is
      if (existing.hours === roundedHours) {
        return existing;
      }
      // If duration changed, update in place without duplicate transaction
      existing.hours = roundedHours;
      existing.description = `Class Attendance: ${course}${cohort ? ` (Cohort ${cohort})` : ''}${sessionTopic ? ` - ${sessionTopic}` : ''}`;
      saveLocal(all);
      try {
        await setDoc(doc(db, 'teaching_hours_ledger', existing.id), existing);
      } catch (e) {}
      return existing;
    }

    // Create new attendance ledger transaction
    const newEntry: TeachingHourLedgerEntry = {
      id: `led-att-${sessionId.replace(/[^a-z0-9_-]/gi, '')}-${lecturerId.replace(/[^a-z0-9_-]/gi, '')}`,
      lecturerId,
      lecturerName,
      date: date || new Date().toISOString().split('T')[0],
      type: 'attendance',
      description: `Class Attendance: ${course}${cohort ? ` (Cohort ${cohort})` : ''}${sessionTopic ? ` - ${sessionTopic}` : ''}`,
      hours: roundedHours,
      addedBy: recordedBy || 'Attendance System',
      createdAt: new Date().toISOString(),
      attendanceSessionId: sessionId,
      referenceNote: `Verified Digital Class Session ID: ${sessionId}`,
    };

    return await this.addEntry(newEntry);
  },

  /**
   * Super Admin: Add historical manual teaching hours entry (starting balance)
   */
  async addHistoricalEntry(params: {
    lecturerId: string;
    lecturerName?: string;
    hours: number;
    date?: string;
    reason: string;
    note?: string;
    addedBy?: string;
  }): Promise<TeachingHourLedgerEntry> {
    const { lecturerId, hours, date, reason, note, addedBy } = params;
    const tutor = TutorService.getTutorById(lecturerId) || TutorService.getTutorBySlug(lecturerId);
    const resolvedLecturerName = params.lecturerName || (tutor ? tutor.name : 'Faculty Member');

    const cleanHours = Math.abs(Math.round(hours * 10) / 10);
    const entryId = `led-hist-${lecturerId.replace(/[^a-z0-9_-]/gi, '')}-${Date.now().toString(36)}`;

    const entry: TeachingHourLedgerEntry = {
      id: entryId,
      lecturerId,
      lecturerName: resolvedLecturerName,
      date: date || new Date().toISOString().split('T')[0],
      type: 'historical',
      description: reason.trim() || 'Imported manual attendance records before digital system',
      hours: cleanHours,
      addedBy: addedBy || 'Super Admin (Engr. Precious Ogunleye)',
      createdAt: new Date().toISOString(),
      auditReason: reason.trim() || 'Verified manual paper logbook records prior to digital attendance introduction.',
      referenceNote: note?.trim() || 'Audited institutional historical archive.',
    };

    return await this.addEntry(entry);
  },

  /**
   * Super Admin: Add manual adjustment entry (+ or - hours)
   * Audit Trail: Date, Type, Description, Hours, Added by, Reason
   */
  async addAdjustmentEntry(params: {
    lecturerId: string;
    lecturerName?: string;
    hours: number;
    isAddition: boolean;
    reason: string;
    note?: string;
    addedBy?: string;
  }): Promise<TeachingHourLedgerEntry> {
    const { lecturerId, hours, isAddition, reason, note, addedBy } = params;
    const tutor = TutorService.getTutorById(lecturerId) || TutorService.getTutorBySlug(lecturerId);
    const resolvedLecturerName = params.lecturerName || (tutor ? tutor.name : 'Faculty Member');

    const absHours = Math.abs(Math.round(hours * 10) / 10);
    const signedHours = isAddition ? absHours : -absHours;

    const entryId = `led-adj-${lecturerId.replace(/[^a-z0-9_-]/gi, '')}-${Date.now().toString(36)}`;

    const entry: TeachingHourLedgerEntry = {
      id: entryId,
      lecturerId,
      lecturerName: resolvedLecturerName,
      date: new Date().toISOString().split('T')[0],
      type: 'adjustment',
      description: reason.trim() || (isAddition ? 'Manual hour credit adjustment' : 'Manual hour deduction correction'),
      hours: signedHours,
      addedBy: addedBy || 'Super Admin (Engr. Precious Ogunleye)',
      createdAt: new Date().toISOString(),
      auditReason: reason.trim(),
      referenceNote: note?.trim() || undefined,
      adjustmentDirection: isAddition ? 'add' : 'subtract',
    };

    return await this.addEntry(entry);
  },

  /**
   * Super Admin: Delete an adjustment or historical entry
   */
  async deleteEntry(entryId: string): Promise<boolean> {
    const all = loadLocal();
    const filtered = all.filter((e) => e.id !== entryId);
    if (filtered.length !== all.length) {
      saveLocal(filtered);
      try {
        await deleteDoc(doc(db, 'teaching_hours_ledger', entryId));
      } catch (e) {
        console.warn('Failed deleting from Firestore teaching_hours_ledger:', e);
      }
      return true;
    }
    return false;
  },

  /**
   * Super Admin: Bulk CSV / Text Import of Historical Teaching Hours
   * Format supported:
   * Lecturer, Historical Hours, Reason
   * e.g.:
   * Lawal, 146, Manual attendance records 2024-2025
   * Olamide, 132, SOC lab manual registers
   */
  async bulkImportHistoricalEntries(
    csvContent: string,
    addedBy: string = 'Super Admin (Engr. Precious Ogunleye)'
  ): Promise<{
    successCount: number;
    errors: string[];
    importedEntries: TeachingHourLedgerEntry[];
  }> {
    const lines = csvContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const allTutors = TutorService.getAllTutors();
    const importedEntries: TeachingHourLedgerEntry[] = [];
    const errors: string[] = [];

    let lineIdx = 0;
    for (const rawLine of lines) {
      lineIdx++;
      // Check if header row
      if (lineIdx === 1 && (rawLine.toLowerCase().includes('lecturer') || rawLine.toLowerCase().includes('tutor'))) {
        continue;
      }

      // Split by comma or tab or semicolon
      const parts = rawLine.includes('\t')
        ? rawLine.split('\t')
        : rawLine.includes(';')
        ? rawLine.split(';')
        : rawLine.split(',');

      if (parts.length < 2) {
        errors.push(`Line ${lineIdx}: Invalid format. Expected 'Lecturer, Hours, [Reason]'`);
        continue;
      }

      const lecturerQuery = parts[0].trim().replace(/^["']|["']$/g, '');
      const hoursStr = parts[1].trim().replace(/[^0-9.-]/g, '');
      const reason = parts[2] ? parts[2].trim().replace(/^["']|["']$/g, '') : 'Imported historical attendance';

      const parsedHours = parseFloat(hoursStr);
      if (isNaN(parsedHours) || parsedHours <= 0) {
        errors.push(`Line ${lineIdx}: Invalid hours value '${hoursStr}' for ${lecturerQuery}`);
        continue;
      }

      // Find matching tutor
      const qLower = lecturerQuery.toLowerCase();
      const matchedTutor = allTutors.find((t) => {
        return (
          t.id.toLowerCase() === qLower ||
          t.name.toLowerCase() === qLower ||
          t.shortName.toLowerCase() === qLower ||
          t.slug.toLowerCase() === qLower ||
          t.name.toLowerCase().includes(qLower) ||
          qLower.includes(t.shortName.toLowerCase())
        );
      });

      if (!matchedTutor) {
        errors.push(`Line ${lineIdx}: Lecturer '${lecturerQuery}' not found in active faculty registry`);
        continue;
      }

      const entry = await this.addHistoricalEntry({
        lecturerId: matchedTutor.id,
        lecturerName: matchedTutor.name,
        hours: parsedHours,
        reason: reason || `Imported historical manual attendance for ${matchedTutor.name}`,
        addedBy,
        note: `Bulk CSV Import batch ${new Date().toLocaleDateString()}`,
      });

      importedEntries.push(entry);
    }

    return {
      successCount: importedEntries.length,
      errors,
      importedEntries,
    };
  },
};

// Auto-sync from Firestore on client start
if (typeof window !== 'undefined') {
  setTimeout(() => {
    TeachingHoursLedgerService.syncFromFirestore().catch(() => {});
  }, 1000);
}
