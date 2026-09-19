/**
 * Sub-Admin Route Obfuscation and Gateway Security
 * 
 * Protects editorial and sub-admin tools from casual URL guessing.
 * Common predictable paths like /editor, /sub-admin, /editorial are strictly rejected with 404.
 * Access is through a non-guessable cryptographic slug that can be managed or customized.
 */

export const DEFAULT_SUBADMIN_SLUG = 'orbit-staff-gate-9x2k';
export const SUBADMIN_SLUG_STORAGE_KEY = 'orbit_subadmin_route_slug_v1';

// Obvious paths that must be blocked to prevent discovery of the editorial interface
export const OBVIOUS_PREDICTABLE_PATHS = [
  'editor',
  'subadmin',
  'sub-admin',
  'editorial',
  'writer',
  'writers',
  'blog-admin',
  'article-editor',
  'staff',
  'staff-portal',
  'cms',
  'publish',
  'admin/editor'
];

export function getSubAdminRouteSlug(): string {
  if (typeof window === 'undefined') return DEFAULT_SUBADMIN_SLUG;
  try {
    const custom = localStorage.getItem(SUBADMIN_SLUG_STORAGE_KEY);
    if (custom && custom.trim().length >= 8) {
      return custom.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    }
  } catch {}
  return DEFAULT_SUBADMIN_SLUG;
}

export function setSubAdminRouteSlug(newSlug: string): string {
  const clean = newSlug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
  if (clean.length < 8) {
    throw new Error('Secret gateway slug must be at least 8 characters long for security entropy.');
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SUBADMIN_SLUG_STORAGE_KEY, clean);
    } catch (e) {
      console.error('Failed to persist custom slug:', e);
    }
  }
  return clean;
}

export function resetSubAdminRouteSlug(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SUBADMIN_SLUG_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset slug:', e);
  }
}

export function isSubAdminPath(cleanPath: string): boolean {
  const target = getSubAdminRouteSlug().toLowerCase();
  const current = cleanPath.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  return current === target;
}

export function isObviousPredictablePath(cleanPath: string): boolean {
  const current = cleanPath.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  return OBVIOUS_PREDICTABLE_PATHS.includes(current);
}

export function getSubAdminFullUrl(): string {
  if (typeof window === 'undefined') return `/${DEFAULT_SUBADMIN_SLUG}`;
  return `${window.location.origin}/${getSubAdminRouteSlug()}`;
}
