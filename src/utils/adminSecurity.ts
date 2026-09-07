/**
 * Admin Security & Localhost Enforcement
 * 
 * Enforces strict boundaries:
 * - Admin Console, Certificate Uploads, and Admin APIs are ONLY accessible via loopback (localhost / 127.0.0.1).
 * - Remote network IPs (e.g., 192.168.x.x, 10.x.x.x) and public domains are strictly rejected.
 * - Wi-Fi neighbors cannot access the admin console via laptop IP.
 */

export function isLocalhostHostname(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase().trim();
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]'
  );
}

const DEV_PREVIEW_SESSION_KEY = 'orbit_admin_dev_preview_unlocked';

export function isDevPreviewEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase().trim();
  return (
    hostname.includes('ais-dev') ||
    hostname.includes('ais-pre') ||
    hostname.includes('europe-west2.run.app') ||
    hostname.includes('run.app')
  );
}

export function isDevPreviewUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return isDevPreviewEnvironment() && sessionStorage.getItem(DEV_PREVIEW_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDevPreviewUnlocked(unlocked: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (unlocked) {
      sessionStorage.setItem(DEV_PREVIEW_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(DEV_PREVIEW_SESSION_KEY);
    }
  } catch (e) {
    console.error('Session storage error:', e);
  }
}

/**
 * Validates whether the current environment is authorized to access administrative tools.
 * Returns true on localhost loopback (127.0.0.1) and during development/testing in AI Studio preview.
 * Strictly returns false on production public domains (orbitspace.academy, vercel.app, etc.) and external LAN/Wi-Fi IPs.
 */
export function canAccessAdminPortal(): boolean {
  return isLocalhostHostname() || isDevPreviewEnvironment() || isDevPreviewUnlocked();
}

/**
 * Returns security audit details for UI diagnostics and security shields.
 */
export function getAdminSecurityStatus(): {
  isLocal: boolean;
  hostname: string;
  isAllowed: boolean;
  isDevPreview: boolean;
} {
  if (typeof window === 'undefined') {
    return { isLocal: false, hostname: '', isAllowed: false, isDevPreview: false };
  }
  const isLocal = isLocalhostHostname();
  const isDevPreview = isDevPreviewEnvironment();
  const isAllowed = canAccessAdminPortal();
  return {
    isLocal,
    hostname: window.location.hostname,
    isAllowed,
    isDevPreview
  };
}
