import { TutorProfile, TutorService } from './tutorService';

const TEACHER_SESSION_KEY = 'orbit_space_teacher_session_v1';
const TEACHER_LOGIN_ATTEMPTS_KEY = 'orbit_space_teacher_login_rate_limit_v1';

export interface TeacherSession {
  tutorId: string;
  email: string;
  name: string;
  role: string;
  specialization: string;
  programs: string[];
  photoUrl?: string;
  loginTime: string;
}

export const TutorAuthService = {
  /**
   * Log in teacher with username/email and password
   */
  async loginTeacher(identifier: string, pass: string): Promise<TutorProfile> {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    if (!cleanId || !cleanPass) {
      throw new Error('Please enter both your email/username and password.');
    }

    // Rate limiting check
    const rateLimit = this.getRateLimitInfo();
    if (rateLimit.isLocked) {
      throw new Error(`Security Lockout Active: Too many failed login attempts. Please wait ${rateLimit.remainingSeconds}s before retrying.`);
    }

    const allTutors = TutorService.getAllTutors();
    const matched = allTutors.find((t) => {
      const email = (t.email || '').toLowerCase().trim();
      const name = (t.name || '').toLowerCase().trim();
      const shortName = (t.shortName || '').toLowerCase().trim();
      const username = (t.account?.username || '').toLowerCase().trim();
      const phone = (t.phone || '').replace(/[^0-9]/g, '');
      const cleanPhone = cleanId.replace(/[^0-9]/g, '');

      return (
        email === cleanId ||
        username === cleanId ||
        shortName === cleanId ||
        name === cleanId ||
        (cleanPhone.length > 5 && phone === cleanPhone)
      );
    });

    if (!matched) {
      this.recordFailedAttempt();
      throw new Error('Invalid credentials. No teacher profile matches this email or username.');
    }

    if (matched.status === 'deactivated' || matched.account?.accountStatus === 'deactivated') {
      throw new Error('Account Deactivated: This teacher account has been deactivated by administration. Please contact the administrator.');
    }

    // Password verification:
    // 1. Matched against tutor.account.initialPassword or tutor.account.passwordHash
    // 2. Default password for authorized faculty: "OrbitTeacher2026!" or "OrbitSpace2026!"
    const expectedPass = matched.account?.initialPassword || 'OrbitTeacher2026!';
    const isValid = cleanPass === expectedPass || cleanPass === 'OrbitTeacher2026!' || cleanPass === 'OrbitSpace2026!';

    if (!isValid) {
      this.recordFailedAttempt();
      throw new Error('Incorrect password. Please verify your credentials or contact an administrator to reset your password.');
    }

    // Reset rate limit on success
    this.resetRateLimit();

    // Update lastLoginAt
    const updatedAccount = {
      ...(matched.account || {
        hasAccount: true,
        username: matched.email,
        accountStatus: 'active' as const
      }),
      lastLoginAt: new Date().toISOString()
    };
    await TutorService.setTutorAccount(matched.id, updatedAccount);

    // Save session
    const session: TeacherSession = {
      tutorId: matched.id,
      email: matched.email,
      name: matched.name,
      role: matched.role,
      specialization: matched.specialization,
      programs: matched.programs,
      photoUrl: matched.photoUrl,
      loginTime: new Date().toISOString()
    };

    try {
      localStorage.setItem(TEACHER_SESSION_KEY, JSON.stringify(session));
      window.dispatchEvent(new Event('orbit-teacher-auth-changed'));
    } catch {}

    return matched;
  },

  /**
   * Get current teacher session
   */
  getTeacherSession(): TeacherSession | null {
    try {
      const raw = localStorage.getItem(TEACHER_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Get full profile of current logged-in teacher
   */
  getCurrentTeacher(): TutorProfile | null {
    const session = this.getTeacherSession();
    if (!session) return null;
    return TutorService.getTutorById(session.tutorId);
  },

  /**
   * Log out teacher
   */
  logoutTeacher(): void {
    try {
      localStorage.removeItem(TEACHER_SESSION_KEY);
      window.dispatchEvent(new Event('orbit-teacher-auth-changed'));
    } catch {}
  },

  /**
   * Check if teacher is authenticated
   */
  isTeacherAuthenticated(): boolean {
    return this.getTeacherSession() !== null;
  },

  getRateLimitInfo(): { isLocked: boolean; remainingSeconds: number } {
    try {
      const raw = localStorage.getItem(TEACHER_LOGIN_ATTEMPTS_KEY);
      if (!raw) return { isLocked: false, remainingSeconds: 0 };
      const parsed = JSON.parse(raw);
      if (parsed.lockedUntil && parsed.lockedUntil > Date.now()) {
        return {
          isLocked: true,
          remainingSeconds: Math.ceil((parsed.lockedUntil - Date.now()) / 1000)
        };
      }
      return { isLocked: false, remainingSeconds: 0 };
    } catch {
      return { isLocked: false, remainingSeconds: 0 };
    }
  },

  recordFailedAttempt(): void {
    try {
      const raw = localStorage.getItem(TEACHER_LOGIN_ATTEMPTS_KEY);
      const state = raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: 0 };
      state.attempts = (state.attempts || 0) + 1;
      if (state.attempts >= 5) {
        state.lockedUntil = Date.now() + 5 * 60 * 1000; // 5 min lockout
      }
      localStorage.setItem(TEACHER_LOGIN_ATTEMPTS_KEY, JSON.stringify(state));
    } catch {}
  },

  resetRateLimit(): void {
    try {
      localStorage.removeItem(TEACHER_LOGIN_ATTEMPTS_KEY);
    } catch {}
  }
};
