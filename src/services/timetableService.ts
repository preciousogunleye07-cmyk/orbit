import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { TIMETABLE_DATA, TimetableSlot, DAYS_OF_WEEK } from '../data/timetableData';

const TIMETABLE_STORAGE_KEY = 'orbit_space_timetable_v1';

// In-memory cache for ultra-fast sync
let memoryCache: TimetableSlot[] | null = null;
const listeners = new Set<(slots: TimetableSlot[]) => void>();

export function calculateDayIndex(day: string): number {
  const index = DAYS_OF_WEEK.indexOf(day as any);
  return index !== -1 ? index + 1 : 1;
}

export function sortTimetableSlots(slots: TimetableSlot[]): TimetableSlot[] {
  return [...slots].sort((a, b) => {
    if (a.dayIndex !== b.dayIndex) {
      return a.dayIndex - b.dayIndex;
    }
    if (a.startHour !== b.startHour) {
      return a.startHour - b.startHour;
    }
    return a.startMinute - b.startMinute;
  });
}

/**
 * Retrieve slots from cache or localStorage, falling back to default TIMETABLE_DATA
 */
export function getLocalTimetableSlots(): TimetableSlot[] {
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  try {
    const raw = localStorage.getItem(TIMETABLE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache = sortTimetableSlots(parsed);
        return memoryCache;
      }
    }
  } catch (err) {
    console.warn('Could not read timetable from localStorage:', err);
  }

  // Fallback to static data
  memoryCache = sortTimetableSlots(TIMETABLE_DATA);
  try {
    localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(memoryCache));
  } catch {
    // Ignore storage quota errors
  }
  return memoryCache;
}

function notifyListeners(slots: TimetableSlot[]) {
  listeners.forEach(listener => {
    try {
      listener(slots);
    } catch (err) {
      console.error('Error notifying timetable listener:', err);
    }
  });
}

function updateLocalCache(slots: TimetableSlot[]) {
  const sorted = sortTimetableSlots(slots);
  memoryCache = sorted;
  try {
    localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(sorted));
  } catch (err) {
    console.warn('Failed to cache timetable locally:', err);
  }
  notifyListeners(sorted);
}

/**
 * Seed initial default timetable to Firestore if collection is empty
 */
async function seedDefaultTimetableToFirestore(): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  try {
    const colRef = collection(db, 'timetable');
    for (const slot of TIMETABLE_DATA) {
      await setDoc(doc(colRef, slot.id), {
        ...slot,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    console.log('Seeded default timetable to Firestore');
  } catch (err) {
    console.warn('Notice seeding timetable to Firestore:', err);
  }
}

/**
 * Fetch latest slots from Cloud Firestore
 */
export async function syncTimetableFromFirestore(): Promise<TimetableSlot[]> {
  if (!isFirebaseConfigured() || !db) {
    return getLocalTimetableSlots();
  }

  try {
    const colRef = collection(db, 'timetable');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      // Seed Firestore with default data
      await seedDefaultTimetableToFirestore();
      return getLocalTimetableSlots();
    }

    const fetched: TimetableSlot[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      fetched.push({
        id: docSnap.id,
        day: data.day,
        dayIndex: data.dayIndex ?? calculateDayIndex(data.day),
        time: data.time || '',
        startHour: Number(data.startHour ?? 12),
        startMinute: Number(data.startMinute ?? 0),
        endHour: Number(data.endHour ?? 14),
        endMinute: Number(data.endMinute ?? 0),
        course: data.course || 'Tech Track',
        instructor: data.instructor || 'Instructor',
        instructorTitle: data.instructorTitle || '',
        venue: data.venue || 'Orbit Space Hub',
        category: data.category || 'development',
        badge: data.badge || ''
      });
    });

    const sorted = sortTimetableSlots(fetched);
    updateLocalCache(sorted);
    return sorted;
  } catch (err) {
    console.warn('Notice syncing timetable from Firestore (operating in local fallback):', err);
    return getLocalTimetableSlots();
  }
}

/**
 * Real-time subscription to timetable updates
 */
export function subscribeTimetable(callback: (slots: TimetableSlot[]) => void): () => void {
  listeners.add(callback);
  
  // Immediately pass cached slots
  callback(getLocalTimetableSlots());

  let unsubscribeFirestore: (() => void) | null = null;

  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'timetable');
      unsubscribeFirestore = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const fetched: TimetableSlot[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            fetched.push({
              id: docSnap.id,
              day: data.day,
              dayIndex: data.dayIndex ?? calculateDayIndex(data.day),
              time: data.time || '',
              startHour: Number(data.startHour ?? 12),
              startMinute: Number(data.startMinute ?? 0),
              endHour: Number(data.endHour ?? 14),
              endMinute: Number(data.endMinute ?? 0),
              course: data.course || 'Tech Track',
              instructor: data.instructor || 'Instructor',
              instructorTitle: data.instructorTitle || '',
              venue: data.venue || 'Orbit Space Hub',
              category: data.category || 'development',
              badge: data.badge || ''
            });
          });
          const sorted = sortTimetableSlots(fetched);
          updateLocalCache(sorted);
        } else {
          // If empty, initiate initial background seeding
          seedDefaultTimetableToFirestore();
        }
      }, (err) => {
        console.warn('Firestore timetable real-time listener notice:', err.message);
      });
    } catch (err) {
      console.warn('Firestore onSnapshot subscription error:', err);
    }
  }

  // Also listen to storage events across tabs
  const handleStorage = (e: StorageEvent) => {
    if (e.key === TIMETABLE_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          memoryCache = sortTimetableSlots(parsed);
          callback(memoryCache);
        }
      } catch {
        // ignore
      }
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(callback);
    if (unsubscribeFirestore) unsubscribeFirestore();
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Save or Edit a Timetable Slot
 */
export async function saveTimetableSlot(slot: TimetableSlot): Promise<{ success: boolean; slot: TimetableSlot }> {
  const normalizedSlot: TimetableSlot = {
    ...slot,
    dayIndex: calculateDayIndex(slot.day),
    startHour: Number(slot.startHour),
    startMinute: Number(slot.startMinute || 0),
    endHour: Number(slot.endHour),
    endMinute: Number(slot.endMinute || 0)
  };

  const current = getLocalTimetableSlots();
  const existingIndex = current.findIndex(s => s.id === normalizedSlot.id);
  let updated: TimetableSlot[];

  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = normalizedSlot;
  } else {
    updated = [normalizedSlot, ...current];
  }

  updateLocalCache(updated);

  // Sync with Firestore
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'timetable', normalizedSlot.id), {
        ...normalizedSlot,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('Timetable slot persisted to Firestore:', normalizedSlot.id);
    } catch (err: any) {
      console.warn('Notice saving timetable slot to Firestore:', err?.message || err);
    }
  }

  return { success: true, slot: normalizedSlot };
}

/**
 * Delete a timetable slot
 */
export async function deleteTimetableSlot(slotId: string): Promise<{ success: boolean }> {
  const current = getLocalTimetableSlots();
  const filtered = current.filter(s => s.id !== slotId);
  updateLocalCache(filtered);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'timetable', slotId));
      console.log('Timetable slot deleted from Firestore:', slotId);
    } catch (err: any) {
      console.warn('Notice deleting timetable slot from Firestore:', err?.message || err);
    }
  }

  return { success: true };
}

/**
 * Reset Timetable back to default template
 */
export async function resetTimetableToDefault(): Promise<{ success: boolean; slots: TimetableSlot[] }> {
  updateLocalCache(TIMETABLE_DATA);

  if (isFirebaseConfigured() && db) {
    try {
      // Clear existing and rewrite
      const current = await getDocs(collection(db, 'timetable'));
      for (const docSnap of current.docs) {
        await deleteDoc(doc(db, 'timetable', docSnap.id));
      }
      for (const slot of TIMETABLE_DATA) {
        await setDoc(doc(db, 'timetable', slot.id), {
          ...slot,
          updatedAt: new Date().toISOString()
        });
      }
      console.log('Timetable reset to defaults in Firestore');
    } catch (err) {
      console.warn('Notice resetting timetable in Firestore:', err);
    }
  }

  return { success: true, slots: TIMETABLE_DATA };
}

/**
 * Generate a friendly unique slot ID
 */
export function generateSlotId(day: string): string {
  const prefix = day.substring(0, 3).toLowerCase();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${Date.now().toString().slice(-4)}-${randomSuffix}`;
}
