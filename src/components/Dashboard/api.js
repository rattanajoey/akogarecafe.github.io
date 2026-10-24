import { dateRange } from './data';

export const ENDPOINT = 'https://us-central1-ac-movie-club.cloudfunctions.net/projectAnalytics';
export async function loadWorkspace(user, days, signal) {
  const token = await user.getIdToken();
  const response = await fetch(ENDPOINT, {
    method: 'POST', signal, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data: { days } }), cache: 'no-store',
  });
  const body = await response.json();
  if (!response.ok || body.error) throw new Error(body.error?.message || 'The analytics service could not be reached. Please retry.');
  return body.result;
}
async function googleRequest(url, token, options = {}) {
  const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, cache: 'no-store' });
  const body = await response.json();
  if (!response.ok) {
    if (response.status === 401) throw new Error('Google authorization expired. Connect this source again.');
    if (response.status === 403) throw new Error('Google denied this report. Check account access, read-only consent, and that the Analytics APIs are enabled.');
    throw new Error(body.error?.message || 'Google could not return this report.');
  }
  return body;
}
const REPORTING_REDIRECT = 'studio-reporting-redirect';
async function reportingAuth() {
  const [{ initializeApp, getApp, getApps }, sdk] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
  await import('../../config/firebase');
  const name = 'dashboard-reporting';
  let app = getApps().find(a => a.name === name);
  if (!app) {
    app = initializeApp(getApp().options, name);
    sdk.initializeAuth(app, { persistence: sdk.browserSessionPersistence, popupRedirectResolver: sdk.browserPopupRedirectResolver });
  }
  return { auth: sdk.getAuth(app), sdk };
}
export async function googleConsent(kind, pending) {
  // Only non-secret source IDs and the workspace identity survive the navigation.
  // The separate Firebase session is cleared immediately after the redirect.
  const { auth, sdk } = await reportingAuth();
  await sdk.setPersistence(auth, sdk.browserSessionPersistence);
  const provider = new sdk.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  if (kind === 'youtube') {
    provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
    provider.addScope('https://www.googleapis.com/auth/yt-analytics.readonly');
  } else provider.addScope('https://www.googleapis.com/auth/analytics.readonly');
  sessionStorage.setItem(REPORTING_REDIRECT, JSON.stringify(pending));
  try { await sdk.signInWithRedirect(auth, provider); }
  catch (err) { sessionStorage.removeItem(REPORTING_REDIRECT); throw err; }
}
export async function completeGoogleConsent() {
  const saved = sessionStorage.getItem(REPORTING_REDIRECT);
  if (!saved) return null;
  const { auth, sdk } = await reportingAuth();
  try {
    const pending = JSON.parse(saved);
    const result = await sdk.getRedirectResult(auth);
    const token = result && sdk.GoogleAuthProvider.credentialFromResult(result)?.accessToken;
    if (!token) throw new Error('Google did not return reporting access. Connect this source again.');
    return { ...pending, token };
  } finally {
    sessionStorage.removeItem(REPORTING_REDIRECT);
    await sdk.signOut(auth);
    await sdk.setPersistence(auth, sdk.inMemoryPersistence);
  }
}
export async function listProperties(token) {
  const properties = [];
  let nextPageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '200' });
    if (nextPageToken) query.set('pageToken', nextPageToken);
    const body = await googleRequest(`https://analyticsadmin.googleapis.com/v1beta/accountSummaries?${query}`, token);
    for (const account of body.accountSummaries || []) for (const p of account.propertySummaries || []) properties.push({ id: p.property.split('/').pop(), name: p.displayName });
    nextPageToken = body.nextPageToken;
  } while (nextPageToken && properties.length < 1000);
  return properties;
}
export async function listStreams(token, propertyId) {
  if (!/^\d+$/.test(propertyId)) throw new Error('Choose a valid Google Analytics property.');
  const body = await googleRequest(`https://analyticsadmin.googleapis.com/v1beta/properties/${propertyId}/dataStreams?pageSize=200`, token);
  return (body.dataStreams || []).map(s => ({ id: s.name.split('/').pop(), name: s.displayName, type: s.type }));
}
export async function fetchGoogle(source, token, days, mapping = {}) {
  const range = dateRange(days);
  const result = { status: 'connected', fetchedAt: new Date().toISOString(), metrics: {}, previous: {}, daily: [], note: '' };
  if (source.kind === 'youtube') {
    const info = await googleRequest(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${source.channelId}`, token);
    const stats = info.items?.[0]?.statistics;
    if (stats) result.metrics = { followers: stats.hiddenSubscriberCount ? null : Number(stats.subscriberCount), lifetimeViews: Number(stats.viewCount), publishedItems: Number(stats.videoCount) };
    const query = async (start, end) => {
      const params = new URLSearchParams({ ids: `channel==${source.channelId}`, startDate: start, endDate: end, metrics: 'views,estimatedMinutesWatched,subscribersGained,subscribersLost,likes,comments', dimensions: 'day', sort: 'day' });
      return googleRequest(`https://youtubeanalytics.googleapis.com/v2/reports?${params}`, token);
    };
    const parse = data => {
      if (!Array.isArray(data.columnHeaders)) throw new Error('YouTube returned an invalid analytics report.');
      const names = data.columnHeaders.map(h => h.name);
      const rows = (data.rows || []).map(row => Object.fromEntries(names.map((name, i) => [name, row[i]])));
      const sum = key => names.includes(key) && rows.every(row => typeof row[key] === 'number' && Number.isFinite(row[key])) ? rows.reduce((n, row) => n + row[key], 0) : null;
      const minutes = sum('estimatedMinutesWatched'), gained = sum('subscribersGained'), lost = sum('subscribersLost');
      return { rows, metrics: { views: sum('views'), watchHours: minutes === null ? null : minutes / 60, subscribersGained: gained, subscribersLost: lost, netFollowers: gained === null || lost === null ? null : gained - lost, likes: sum('likes'), comments: sum('comments') } };
    };
    const current = parse(await query(range.start, range.end));
    if (days === 1 && !current.rows.length) {
      result.connectionState = 'processing';
      result.note = 'YouTube has not returned a report for this day yet. Daily reports can take 48–72 hours to process. Current channel totals are available; missing daily metrics stay unknown.';
      return result;
    }
    Object.assign(result.metrics, current.metrics);
    result.daily = current.rows.map(row => ({ date: row.day, views: row.views }));
    result.note = 'YouTube reporting dates use Pacific time. Recent days may still be processing.';
    const through = current.rows.map(row => row.day).filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day) && day >= range.start && day <= range.end).sort().at(-1);
    if (through) {
      result.reportedThrough = through;
      const shift = date => new Date(Date.parse(date + 'T00:00:00Z') - days * 86400000).toISOString().slice(0, 10);
      const comparison = { start: range.start, end: through, previousStart: range.previousStart, previousEnd: shift(through), matchedDays: through !== range.end };
      try {
        const previous = parse(await query(comparison.previousStart, comparison.previousEnd));
        if (previous.rows.length) { result.previous = previous.metrics; result.comparison = comparison; }
      } catch { /* Current reporting remains usable without comparison history. */ }
      result.note += ` Reports are available through ${through}. Changes compare the same dates shifted back one selected period.`;
    }
    return result;
  }
  if (!/^\d+$/.test(mapping.propertyId || '') || !/^\d+$/.test(mapping.streamId || '')) throw new Error('Choose a property and its matching web or iOS stream first.');
  const ios = source.kind === 'ios';
  const names = ['activeUsers', 'sessions', 'screenPageViews', 'newUsers'];
  const dimensionFilter = { andGroup: { expressions: [
    { filter: { fieldName: 'streamId', stringFilter: { matchType: 'EXACT', value: mapping.streamId } } },
    { filter: { fieldName: 'platform', stringFilter: { matchType: 'EXACT', value: ios ? 'iOS' : 'web', caseSensitive: false } } },
  ] } };
  if (!ios) dimensionFilter.andGroup.expressions.push({ filter: { fieldName: 'hostName', stringFilter: { matchType: 'FULL_REGEXP', value: `^(www\\.)?${new URL(source.url).hostname.replace(/\./g, '\\.').replace(/^www\\\./, '')}$`, caseSensitive: false } } });
  const run = (startDate, endDate, daily) => googleRequest(`https://analyticsdata.googleapis.com/v1beta/properties/${mapping.propertyId}:runReport`, token, { method: 'POST', body: JSON.stringify({ dateRanges: [{ startDate, endDate }], metrics: names.map(name => ({ name })), dimensionFilter, ...(daily ? { dimensions: [{ name: 'date' }], orderBys: [{ dimension: { dimensionName: 'date' } }] } : {}) }) });
  const [current, previous, daily] = await Promise.all([run(range.start, range.end, false), run(range.previousStart, range.previousEnd, false), run(range.start, range.end, true)]);
  const parse = row => Object.fromEntries(names.map((name, i) => [name, Number(row?.metricValues?.[i]?.value || 0)]));
  result.metrics = parse(current.rows?.[0]);
  result.previous = parse(previous.rows?.[0]);
  result.daily = (daily.rows || []).map(row => { const d = row.dimensionValues[0].value; return { date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, ...parse(row) }; });
  result.note = `${ios ? 'iOS' : 'Web'} stream only. GA4 uses the property's reporting timezone. Active users are deduplicated within this stream and period.`;
  return result;
}
