export const PROJECTS = [
  { id: 'cafe', name: 'Akogare Cafe', short: 'AC', category: 'Gaming · Culture', color: '#d4e8bc', chartColor: '#52773b', url: 'https://akogarecafe.com' },
  { id: 'watch', name: 'Akogare Watch Club', short: 'AW', category: 'Anime · Commentary', color: '#d5ccf0', chartColor: '#795aa0', url: 'https://www.youtube.com/channel/UC6MT4WM8saZSk4B4pt4aFwA' },
  { id: 'pindo', name: 'PinDo.', short: 'Pi', category: 'Create · Make · Share', color: '#f3d0ac', chartColor: '#aa622b', url: 'https://pindo.akogarecafe.com' },
  { id: 'cine', name: 'CineClub Cafe', short: 'CC', category: 'Films · Community', color: '#bfdae8', chartColor: '#377b8a', url: 'https://movieclub.akogarecafe.com' },
];
export const SOURCES = [
  { id: 'cafe-youtube', project: 'cafe', kind: 'youtube', label: 'YouTube', account: '@akogarecafe', channelId: 'UCP77ij2ue_xEz2f5TmH0Rbw', url: 'https://www.youtube.com/@akogarecafe' },
  { id: 'cafe-instagram', project: 'cafe', kind: 'instagram', label: 'Instagram', account: '@akogarecafe', url: 'https://www.instagram.com/akogarecafe/' },
  { id: 'cafe-web', project: 'cafe', kind: 'web', label: 'Website', account: 'akogarecafe.com', url: 'https://akogarecafe.com' },
  { id: 'watch-youtube', project: 'watch', kind: 'youtube', label: 'YouTube', account: '@akogarewatchclub', channelId: 'UC6MT4WM8saZSk4B4pt4aFwA', url: 'https://www.youtube.com/channel/UC6MT4WM8saZSk4B4pt4aFwA' },
  { id: 'watch-instagram', project: 'watch', kind: 'instagram', label: 'Instagram', account: '@akogarewatchclub', url: 'https://www.instagram.com/akogarewatchclub/' },
  { id: 'pindo-web', project: 'pindo', kind: 'web', label: 'Website', account: 'pindo.akogarecafe.com', url: 'https://pindo.akogarecafe.com' },
  { id: 'pindo-ios', project: 'pindo', kind: 'ios', label: 'iOS app', account: 'PinDo · iOS' },
  { id: 'pindo-pinterest', project: 'pindo', kind: 'pinterest', label: 'Pinterest', account: '@akogarecafestudio', url: 'https://www.pinterest.com/akogarecafestudio/' },
  { id: 'cine-web', project: 'cine', kind: 'web', label: 'Website', account: 'movieclub.akogarecafe.com', url: 'https://movieclub.akogarecafe.com' },
  { id: 'cine-ios', project: 'cine', kind: 'ios', label: 'iOS app', account: 'CineClub Cafe · iOS' },
  { id: 'cine-youtube', project: 'cine', kind: 'youtube', label: 'YouTube', account: '@CineClubCafe', channelId: 'UCpilsdPRmwBxCTLxCZmBXDg', url: 'https://www.youtube.com/@CineClubCafe' },
];
export const METRICS = {
  followers: { label: 'Combined audience', detail: 'YouTube subscribers + social followers', kinds: ['youtube', 'instagram', 'pinterest'] },
  netFollowers: { label: 'Net subscribers', detail: 'Gained minus lost · selected period', kinds: ['youtube', 'instagram', 'pinterest'] },
  views: { label: 'Content views', detail: 'YouTube + Instagram · selected period', kinds: ['youtube', 'instagram'] },
  lifetimeViews: { label: 'YouTube views', detail: 'Lifetime views · current channel totals', kinds: ['youtube'] },
  sessions: { label: 'Website sessions', detail: 'Website visits · selected period', kinds: ['web'] },
  activeUsers: { label: 'App active users', detail: 'iOS activity · selected period', kinds: ['ios'] },
};
export const finite = value => typeof value === 'number' && Number.isFinite(value);
export function sumKnown(values) {
  const known = values.filter(finite);
  return known.length ? known.reduce((a, b) => a + b, 0) : null;
}
export function coverage(sources, reports, metric) {
  const eligible = sources.filter(s => METRICS[metric].kinds.includes(s.kind));
  const known = eligible.filter(s => finite(reports[s.id]?.metrics?.[metric]));
  return { value: sumKnown(known.map(s => reports[s.id].metrics[metric])), known: known.length, total: eligible.length };
}
export function audienceTotal(sources, reports) {
  return { ...coverage(sources, reports, 'followers'), rounded: sources.some(source => source.kind === 'youtube' && finite(reports[source.id]?.metrics?.followers) && reports[source.id].metrics.followers >= 1000) };
}
export const formatAudience = total => `${finite(total.value) && total.rounded ? '≈' : ''}${format(total.value)}`;
export function change(current, previous) {
  if (!finite(current) || !finite(previous) || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
export function periodComparison(sources, reports, metric) {
  const eligible = sources.filter(source => (METRICS[metric]?.kinds || []).includes(source.kind) || !METRICS[metric]);
  const comparable = eligible.filter(source => !reports[source.id]?.stale && reports[source.id]?.status !== 'error' && finite(reports[source.id]?.metrics?.[metric]) && finite(reports[source.id]?.previous?.[metric]));
  const current = sumKnown(comparable.map(source => reports[source.id].metrics[metric]));
  const previous = sumKnown(comparable.map(source => reports[source.id].previous[metric]));
  return { value: finite(current) && finite(previous) ? current - previous : null, percent: change(current, previous), known: comparable.length, total: eligible.length, matchedDays: comparable.some(source => reports[source.id].comparison?.matchedDays), details: comparable.map(source => { const dates = reports[source.id].comparison; return dates ? `${source.account}: ${dates.start}–${dates.end} vs ${dates.previousStart}–${dates.previousEnd}` : source.account; }).join('; ') };
}
export const signed = value => finite(value) ? `${value > 0 ? '+' : value < 0 ? '−' : ''}${format(Math.abs(value))}` : '—';
export function dateRange(days, now = new Date()) {
  // Completed calendar days, in the dashboard's explicit UTC reporting window.
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 86400000);
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  const previousEnd = new Date(start.getTime() - 86400000);
  const previousStart = new Date(previousEnd.getTime() - (days - 1) * 86400000);
  const iso = d => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end), previousStart: iso(previousStart), previousEnd: iso(previousEnd) };
}
export function chartSeries(sources, reports, metric) {
  const result = new Map();
  for (const source of sources.filter(s => METRICS[metric].kinds.includes(s.kind))) {
    for (const point of reports[source.id]?.daily || []) {
      if (!finite(point[metric])) continue;
      const row = result.get(point.date) || { date: point.date };
      row[source.project] = (row[source.project] || 0) + point[metric];
      result.set(point.date, row);
    }
  }
  return [...result.values()].sort((a, b) => a.date.localeCompare(b.date));
}
// A calendar axis preserves gaps between provider reporting dates.
export function chartFraction(date, range) {
  const value = Date.parse(`${date}T00:00:00Z`);
  const start = Date.parse(`${range.start}T00:00:00Z`);
  const end = Date.parse(`${range.end}T00:00:00Z`);
  if (![value, start, end].every(Number.isFinite) || end < start || value < start || value > end) return null;
  return end === start ? 0.5 : (value - start) / (end - start);
}
export const format = value => finite(value) ? new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format(value) : '—';
export const compact = value => finite(value) ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value) : '—';
export function csv(reports, sources, range) {
  const cell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = [['Project', 'Source', 'Account', 'Start date', 'End date', 'Status', 'Metric', 'Value', 'Refreshed at']];
  for (const source of sources) {
    const report = reports[source.id];
    for (const [metric, value] of Object.entries(report?.metrics || {})) {
      if (finite(value)) rows.push([PROJECTS.find(p => p.id === source.project).name, source.label, source.account, metric === 'followers' || metric === 'lifetimeViews' || metric === 'publishedItems' ? '' : range.start, metric === 'followers' || metric === 'lifetimeViews' || metric === 'publishedItems' ? '' : range.end, report.status, metric, value, report.fetchedAt]);
    }
  }
  return rows.map(row => row.map(cell).join(',')).join('\r\n');
}
