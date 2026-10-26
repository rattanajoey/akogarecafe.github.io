'use strict';

async function isWorkspaceMember(auth, config, getUser) {
  const token = auth.token;
  const email = String(token.email || '').toLowerCase();
  const invited = (config.allowedEmails || []).some(value => String(value).toLowerCase() === email);
  if (!invited && token.dashboardViewer !== true) return false;
  if (token.email_verified !== true && (!invited || !email.endsWith('@gmail.com')
    || token.firebase?.sign_in_provider !== 'google.com' || !token.firebase.identities?.['google.com']?.length)) return false;
  // Check live identity state before every response, including cache hits.
  // A disabled account, removed viewer claim or revoked session must stop now,
  // rather than waiting for an already issued ID token to expire.
  const user = await getUser(auth.uid);
  const validAfter = Date.parse(user.tokensValidAfterTime);
  if (user.disabled || String(user.email || '').toLowerCase() !== email
    || (Number.isFinite(validAfter) && (!Number.isFinite(token.auth_time)
      || token.auth_time < Math.floor(validAfter / 1000)))) return false;
  if (token.email_verified === true) return invited || user.customClaims?.dashboardViewer === true;
  // Legacy email/password accounts can retain an unverified primary email after
  // Google linking. Accept only a fresh Google sign-in whose server-side Google
  // identity proves the exact invited Gmail address; never trust that email alone.
  if (!invited || !email.endsWith('@gmail.com') || token.firebase?.sign_in_provider !== 'google.com') return false;
  const googleIds = token.firebase.identities?.['google.com'] || [];
  if (!googleIds.length) return false;
  return !user.disabled && user.providerData.some(provider => provider.providerId === 'google.com'
    && googleIds.includes(provider.uid) && String(provider.email || '').toLowerCase() === email);
}

module.exports = { isWorkspaceMember };
