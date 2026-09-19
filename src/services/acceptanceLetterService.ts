import { AcceptanceLetterData, DEFAULT_ACCEPTANCE_LETTER } from '../types/letterTypes';
import { SheetDBStudent } from './sheetdbService';

const STORAGE_KEY = 'orbit_space_acceptance_letters_v1';

export function getStoredAcceptanceLetters(): AcceptanceLetterData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial default letter
      const initial = [DEFAULT_ACCEPTANCE_LETTER];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load acceptance letters:', err);
    return [DEFAULT_ACCEPTANCE_LETTER];
  }
}

export function saveAcceptanceLetter(letter: AcceptanceLetterData): AcceptanceLetterData {
  const letters = getStoredAcceptanceLetters();
  const existingIdx = letters.findIndex((l) => l.id === letter.id);
  
  if (existingIdx >= 0) {
    letters[existingIdx] = letter;
  } else {
    letters.unshift(letter);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
  return letter;
}

export function deleteAcceptanceLetter(id: string): void {
  const letters = getStoredAcceptanceLetters().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
}

export function generateLetterRefNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `OS/SIWES/${year}/${randomNum}`;
}

export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'OS-SIWES-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function createLetterFromStudent(student: SheetDBStudent): AcceptanceLetterData {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return {
    id: `letter-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    refNumber: generateLetterRefNumber(),
    issueDate: formattedDate,
    recipientTitle: 'The SIWES Coordinator / Head of Department',
    institution: student.institution || 'University of Ilorin (UNILORIN)',
    department: student.courseOfStudy || 'Department of Computer Science',
    institutionAddress: 'Industrial Training Coordinating Centre (ITCC)',
    studentName: student.fullName,
    matricNumber: student.matricNumber || 'Pending Verification',
    academicLevel: student.academicLevel || '300 Level',
    programTrack: student.program || 'Frontend Development',
    duration: student.studentType?.toLowerCase().includes('siwes') ? '6 Months' : '3 Months',
    startDate: student.startDate || 'Next Available Cohort',
    endDate: student.endDate || '6 Months Subsequent',
    schedule: 'Monday – Friday | 9:00 AM – 4:00 PM',
    signatoryName: 'Engr. Precious Ogunleye',
    signatoryTitle: 'Academy Director & Technical Supervisor',
    verificationCode: generateVerificationCode(),
    createdAt: new Date().toISOString()
  };
}
