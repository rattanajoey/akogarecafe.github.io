export const DASHBOARD_HOST = 'analytics.akogarecafe.com';
export const DASHBOARD_ORIGIN = `https://${DASHBOARD_HOST}`;
export const DASHBOARD_PATH = '/dashboard';
export const DASHBOARD_URL = `${DASHBOARD_ORIGIN}${DASHBOARD_PATH}`;

const legacyHosts = new Set([
  'akogarecafe.com', 'www.akogarecafe.com',
  'ac-movie-club.firebaseapp.com', 'ac-movie-club.web.app',
]);

export const isBrandedDashboard = location => location.hostname === DASHBOARD_HOST;
export const dashboardAuthDomain = (location, fallback) => isBrandedDashboard(location) ? DASHBOARD_HOST : fallback;

export function requestsGoogleSignIn(location) {
  return new URLSearchParams(location.search || '').get('signin') === 'google'
    || new URLSearchParams((location.hash || '').split('?')[1] || '').get('signin') === 'google';
}

export function dashboardRedirect(location) {
  const hashRoute = (location.hash || '').split('?')[0];
  const legacyRoute = hashRoute === '#/dashboard' || hashRoute === '#/dashboard/';
  const dashboardPath = /^\/dashboard\/?$/.test(location.pathname);
  const branded = isBrandedDashboard(location);
  if (!(branded && (location.pathname === '/' || legacyRoute || location.pathname === '/dashboard/'))
    && !(legacyHosts.has(location.hostname) && (legacyRoute || dashboardPath))) return null;
  // Forward only the known sign-in intent. Never carry tokens, arbitrary URLs,
  // or unrelated query parameters between the public and workspace origins.
  return DASHBOARD_URL + (requestsGoogleSignIn(location) ? '?signin=google' : '');
}
