import { DASHBOARD_HOST, DASHBOARD_URL, dashboardAuthDomain, dashboardRedirect, requestsGoogleSignIn } from './dashboard-location';

test('the original dashboard entry and existing bookmarks reach one branded address', () => {
  for (const url of [
    'https://akogarecafe.com/dashboard',
    'https://akogarecafe.com/#/dashboard',
    'https://www.akogarecafe.com/#/dashboard',
    'https://ac-movie-club.firebaseapp.com/#/dashboard',
    'https://ac-movie-club.web.app/#/dashboard',
    'https://analytics.akogarecafe.com/',
    'https://analytics.akogarecafe.com/#/dashboard',
  ]) expect(dashboardRedirect(new URL(url))).toBe(DASHBOARD_URL);
  expect(dashboardRedirect(new URL(DASHBOARD_URL))).toBeNull();
});

test('domain migration carries sign-in intent without carrying credentials or arbitrary redirects', () => {
  expect(dashboardRedirect(new URL('https://akogarecafe.com/#/dashboard?signin=google&token=private&next=https://other.example'))).toBe(`${DASHBOARD_URL}?signin=google`);
  expect(dashboardRedirect(new URL('https://analytics.akogarecafe.com/?token=private'))).toBe(DASHBOARD_URL);
  expect(requestsGoogleSignIn(new URL(`${DASHBOARD_URL}?signin=google`))).toBe(true);
  expect(requestsGoogleSignIn(new URL(`${DASHBOARD_URL}?signin=other`))).toBe(false);
});

test('other projects, local development and authentication handlers do not redirect', () => {
  for (const url of [
    'https://akogarecafe.com/#/music',
    'https://akogarecafe.com/',
    'https://movieclub.akogarecafe.com/#/dashboard',
    'http://localhost:3000/#/dashboard',
    'https://ac-movie-club.firebaseapp.com/__/auth/handler',
    'https://ac-movie-club.firebaseapp.com/#/dashboard-other',
  ]) expect(dashboardRedirect(new URL(url))).toBeNull();
});

test('only the branded dashboard uses its own same-origin authentication helper', () => {
  expect(dashboardAuthDomain(new URL(DASHBOARD_URL), 'ac-movie-club.firebaseapp.com')).toBe(DASHBOARD_HOST);
  expect(dashboardAuthDomain(new URL('https://akogarecafe.com/'), 'ac-movie-club.firebaseapp.com')).toBe('ac-movie-club.firebaseapp.com');
  expect(dashboardAuthDomain(new URL('https://analytics.akogarecafe.com.other.example/'), 'ac-movie-club.firebaseapp.com')).toBe('ac-movie-club.firebaseapp.com');
});
