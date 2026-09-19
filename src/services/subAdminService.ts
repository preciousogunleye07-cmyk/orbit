import { AdminUser, getAdminSession } from './certificateService';

export interface SubAdminUser {
  email: string;
  name: string;
  role: 'Sub-Administrator' | 'Super Administrator';
  permissions: {
    canManageArticles: boolean;
    canDeployArticles: boolean;
    canViewCertificates: boolean;
    canCreateCertificates: boolean;
    canDeleteCertificates: boolean;
    canRevokeCertificates: boolean;
    canManageTimetable: boolean;
  };
}

const SUBADMIN_SESSION_KEY = 'orbit_space_subadmin_session_v1';
const SUBADMIN_RATE_LIMIT_KEY = 'orbit_space_subadmin_rate_limit_v1';

// Single authorized Sub-Admin account credentials
// Email: editor@orbitspace.academy | Passkey: OrbitEditor2026!
const SINGLE_SUBADMIN_EMAIL = 'editor@orbitspace.academy';
const SINGLE_SUBADMIN_HASH = '80e15576b926134a6c891fd2d2c543219c568b5e8f2e6c92746ac03c87200d4c';

// Super Admin hash for "orbitspace.ilorin@gmail.com" with password "OrbitSpaceAdmin2025!"
const SUPER_ADMIN_HASH = '0a2314d07ce49be779f4363ce4c378c412d07a3cb6e618fa7e4315f80b0b5cce';

interface RateLimitState {
  attempts: number;
  lockedUntil: number; // timestamp in ms
}

function getRateLimitState(): RateLimitState {
  try {
    const raw = localStorage.getItem(SUBADMIN_RATE_LIMIT_KEY);
    if (!raw) return { attempts: 0, lockedUntil: 0 };
    return JSON.parse(raw);
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}

function recordSubAdminFailedAttempt(): { isLocked: boolean; remainingLockoutSeconds: number } {
  const state = getRateLimitState();
  state.attempts += 1;
  let isLocked = false;
  let remainingLockoutSeconds = 0;

  if (state.attempts >= 5) {
    state.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins
    isLocked = true;
    remainingLockoutSeconds = 15 * 60;
  }

  try {
    localStorage.setItem(SUBADMIN_RATE_LIMIT_KEY, JSON.stringify(state));
  } catch {}

  return { isLocked, remainingLockoutSeconds };
}

function resetSubAdminRateLimit(): void {
  try {
    localStorage.removeItem(SUBADMIN_RATE_LIMIT_KEY);
  } catch {}
}

export function getSubAdminSession(): SubAdminUser | null {
  try {
    // 1. Check if super-admin session exists in localStorage
    const superAdmin = getAdminSession();
    if (superAdmin) {
      return {
        email: superAdmin.email,
        name: superAdmin.name,
        role: 'Super Administrator',
        permissions: {
          canManageArticles: true,
          canDeployArticles: true,
          canViewCertificates: true,
          canCreateCertificates: true,
          canDeleteCertificates: true,
          canRevokeCertificates: true,
          canManageTimetable: true
        }
      };
    }

    // 2. Check dedicated sub-admin session
    const raw = localStorage.getItem(SUBADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isSubAdminAuthenticated(): boolean {
  return getSubAdminSession() !== null;
}

export async function loginSubAdmin(email: string, pass: string): Promise<SubAdminUser> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !pass) {
    throw new Error('Please enter both work email and security passkey.');
  }

  // Rate limiting check
  const rateLimit = getRateLimitState();
  if (rateLimit.lockedUntil > Date.now()) {
    const remainingSeconds = Math.ceil((rateLimit.lockedUntil - Date.now()) / 1000);
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    throw new Error(`Security Lockout Active: Too many failed login attempts. Please wait ${mins}m ${secs}s before retrying.`);
  }

  // Compute SHA-256 hash using native Web Crypto API
  let computedHash = '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(pass);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    throw new Error('Cryptographic verification failed in current browser environment.');
  }

  // Check 1: Super Admin log in through sub-admin portal
  if (cleanEmail === 'orbitspace.ilorin@gmail.com' && computedHash === SUPER_ADMIN_HASH) {
    resetSubAdminRateLimit();
    const user: SubAdminUser = {
      email: 'orbitspace.ilorin@gmail.com',
      name: 'Orbit Space Super Administrator',
      role: 'Super Administrator',
      permissions: {
        canManageArticles: true,
        canDeployArticles: true,
        canViewCertificates: true,
        canCreateCertificates: true,
        canDeleteCertificates: true,
        canRevokeCertificates: true,
        canManageTimetable: true
      }
    };
    localStorage.setItem(SUBADMIN_SESSION_KEY, JSON.stringify(user));
    return user;
  }

  // Check 2: Single authorized Sub-Admin account
  if (cleanEmail === SINGLE_SUBADMIN_EMAIL && computedHash === SINGLE_SUBADMIN_HASH) {
    resetSubAdminRateLimit();
    const user: SubAdminUser = {
      email: SINGLE_SUBADMIN_EMAIL,
      name: 'Orbit Space Sub-Admin',
      role: 'Sub-Administrator',
      permissions: {
        canManageArticles: true,
        canDeployArticles: true,
        canViewCertificates: true,
        canCreateCertificates: false, // Restricted to Native Super-Admin
        canDeleteCertificates: false, // Restricted to Native Super-Admin
        canRevokeCertificates: false, // Restricted to Native Super-Admin
        canManageTimetable: true
      }
    };
    localStorage.setItem(SUBADMIN_SESSION_KEY, JSON.stringify(user));
    return user;
  }

  // Record failed attempt
  const fail = recordSubAdminFailedAttempt();
  if (fail.isLocked) {
    throw new Error('Security Lockout: 5 consecutive invalid credentials entered. Sub-Admin portal locked for 15 minutes.');
  }
  const remaining = 5 - getRateLimitState().attempts;
  throw new Error(`Invalid email or passkey credentials. ${remaining} attempt(s) remaining before security lockout.`);
}

export function logoutSubAdmin(): void {
  try {
    localStorage.removeItem(SUBADMIN_SESSION_KEY);
  } catch (err) {
    console.error('Logout error:', err);
  }
}
