'use strict';

async function isWorkspaceMember(auth, config, getUser) {
  const token = auth.token;
  const email = String(token.email || '').toLowerCase();
  const invited = (config.allowedEmails || []).some(value => String(value).toLowerCase() === email);
  if (token.email_verified === true) return invited || token.dashboardViewer === true;
  // Legacy email/password accounts can retain an unverified primary email after
  // Google linking. Accept only a fresh Google sign-in whose server-side Google
  // identity proves the exact invited Gmail address; never trust that email alone.
  if (!invited || !email.endsWith('@gmail.com') || token.firebase?.sign_in_provider !== 'google.com') return false;
  const googleIds = token.firebase.identities?.['google.com'] || [];
  if (!googleIds.length) return false;
  const user = await getUser(auth.uid);
  return !user.disabled && user.providerData.some(provider => provider.providerId === 'google.com'
    && googleIds.includes(provider.uid) && String(provider.email || '').toLowerCase() === email);
}

module.exports = { isWorkspaceMember };
