/**
 * Helper to determine if the application is running locally on the administrator's workstation
 * or in development mode, versus running publicly on external devices or production domains.
 */

export function isLocalAdminEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname.toLowerCase();

  // 1. Check for standard local machine hostnames
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.')
  ) {
    return true;
  }

  // 2. Development container environment (e.g. AI Studio development preview)
  if (
    import.meta.env.DEV ||
    hostname.includes('ais-dev') ||
    hostname.includes('localhost')
  ) {
    return true;
  }

  // 3. Optional local administrative override flag or query param (?admin_key=orbit_local)
  try {
    if (localStorage.getItem('orbit_admin_local_override') === 'true') {
      return true;
    }
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('admin_key') === 'orbit_local') {
      localStorage.setItem('orbit_admin_local_override', 'true');
      return true;
    }
  } catch {}

  // Any other public domain or external device: restricted
  return false;
}
