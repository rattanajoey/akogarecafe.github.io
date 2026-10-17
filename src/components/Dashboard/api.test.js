import { googleConsent, completeGoogleConsent } from './api';
import * as appSdk from 'firebase/app';
import * as authSdk from 'firebase/auth';

jest.mock('../../config/firebase', () => ({}));
jest.mock('firebase/app', () => ({
  getApps: jest.fn(() => []), getApp: jest.fn(() => ({ options: { projectId: 'test-project' } })),
  initializeApp: jest.fn((options, name) => ({ options, name })),
}));
jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(), getAuth: jest.fn(app => ({ app })),
  browserSessionPersistence: 'session', inMemoryPersistence: 'memory', browserPopupRedirectResolver: 'resolver',
  setPersistence: jest.fn(async () => {}), signOut: jest.fn(async () => {}),
  signInWithRedirect: jest.fn(async () => {}), getRedirectResult: jest.fn(),
  GoogleAuthProvider: Object.assign(jest.fn(() => ({ setCustomParameters: jest.fn(), addScope: jest.fn() })),
    { credentialFromResult: jest.fn(() => ({ accessToken: 'test-access-token' })) }),
}));

beforeEach(() => {
  sessionStorage.clear(); jest.clearAllMocks();
  appSdk.getApps.mockReturnValue([]);
  appSdk.getApp.mockReturnValue({ options: { projectId: 'test-project' } });
  appSdk.initializeApp.mockImplementation((options, name) => ({ options, name }));
  authSdk.getAuth.mockImplementation(app => ({ app }));
  authSdk.GoogleAuthProvider.mockImplementation(() => ({ setCustomParameters: jest.fn(), addScope: jest.fn() }));
  authSdk.GoogleAuthProvider.credentialFromResult.mockReturnValue({ accessToken: 'test-access-token' });
});

test('reporting redirects use a separate tab-session auth instance and read-only scopes', async () => {
  const pending = { sourceId: 'cafe-web', uid: 'workspace-owner', days: 28 };
  await googleConsent('web', pending);
  expect(appSdk.initializeApp).toHaveBeenCalledWith({ projectId: 'test-project' }, 'dashboard-reporting');
  expect(authSdk.initializeAuth).toHaveBeenCalledWith(expect.objectContaining({ name: 'dashboard-reporting' }),
    { persistence: 'session', popupRedirectResolver: 'resolver' });
  const provider = authSdk.GoogleAuthProvider.mock.results[0].value;
  expect(provider.addScope.mock.calls).toEqual([['https://www.googleapis.com/auth/analytics.readonly']]);
  expect(JSON.parse(sessionStorage.getItem('studio-reporting-redirect'))).toEqual(pending);
  expect(sessionStorage.getItem('studio-reporting-redirect')).not.toContain('token');
});

test('redirect completion returns reporting access in memory and clears its secondary login', async () => {
  sessionStorage.setItem('studio-reporting-redirect', JSON.stringify({ sourceId: 'cine-ios', uid: 'owner', days: 7 }));
  authSdk.getRedirectResult.mockResolvedValue({ user: { uid: 'reporting-account' } });
  expect(await completeGoogleConsent()).toEqual({ sourceId: 'cine-ios', uid: 'owner', days: 7, token: 'test-access-token' });
  expect(sessionStorage.length).toBe(0);
  expect(authSdk.signOut).toHaveBeenCalledWith(expect.objectContaining({ app: expect.objectContaining({ name: 'dashboard-reporting' }) }));
  expect(authSdk.setPersistence).toHaveBeenLastCalledWith(expect.anything(), 'memory');
});

test('a failed reporting return still clears temporary auth state', async () => {
  sessionStorage.setItem('studio-reporting-redirect', JSON.stringify({ sourceId: 'cafe-web', uid: 'owner', days: 28 }));
  authSdk.getRedirectResult.mockRejectedValue(new Error('Google authorization did not finish'));
  await expect(completeGoogleConsent()).rejects.toThrow('Google authorization did not finish');
  expect(sessionStorage.length).toBe(0);
  expect(authSdk.signOut).toHaveBeenCalledTimes(1);
  expect(authSdk.setPersistence).toHaveBeenLastCalledWith(expect.anything(), 'memory');
});
