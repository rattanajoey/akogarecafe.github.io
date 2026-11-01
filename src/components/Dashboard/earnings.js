import { finite } from './data';

const currencyCode = value => /^[A-Z]{3}$/.test(value || '');

// Only period amounts belong in this total. Keep original currencies and bases;
// Patreon lifetime support and duplicate web/iOS Stripe income must not join it.
export function summarizeEarnings(sources, reports, range) {
  const selected = [...new Map(sources.map(source => [source.id, source])).values()];
  const entries = selected.filter(source => ['youtube', 'etsy'].includes(source.kind))
    .map(source => ({ id: source.id, kind: source.kind, report: reports[source.id] }));
  if (selected.some(source => source.project === 'cine' && ['web', 'ios'].includes(source.kind))) {
    entries.push({ id: 'cine-sales', kind: 'stripe', report: reports['cine-web'] });
  }
  if (selected.some(source => source.project === 'pindo' && ['web', 'ios'].includes(source.kind))) {
    entries.push({ id: 'pindo-sales', kind: 'app', report: null });
  }
  const periodEntries = entries.map(entry => {
    const { report } = entry, income = report?.earnings;
    const inRange = income?.start === range.start && /^\d{4}-\d{2}-\d{2}$/.test(income?.end || '') && income.end >= income.start && income.end <= range.end;
    const known = !report?.stale && ['connected', 'partial'].includes(report?.status) && ['connected', 'partial'].includes(income?.status) && finite(income?.amount) && currencyCode(income?.currency) && inRange;
    return { ...entry, known, amount: known ? income.amount : null, currency: known ? income.currency : null, end: known ? income.end : null };
  });
  const totalsFor = rows => [...rows.filter(row => row.known).reduce((totals, row) => {
    totals.set(row.currency, (totals.get(row.currency) || 0) + row.amount);
    return totals;
  }, new Map())].sort(([a], [b]) => a.localeCompare(b)).map(([currency, amount]) => ({ currency, amount }));
  const known = periodEntries.filter(entry => entry.known).length;
  const lifetimeExcluded = selected.some(source => source.kind === 'patreon');
  const delayed = periodEntries.some(entry => entry.known && entry.end < range.end);
  return {
    totals: totalsFor(periodEntries), known, expected: periodEntries.length,
    partial: known < periodEntries.length || lifetimeExcluded || delayed,
    lifetimeExcluded,
    providers: ['youtube', 'etsy', 'stripe', 'app'].flatMap(kind => {
      const rows = periodEntries.filter(entry => entry.kind === kind);
      if (!rows.length) return [];
      const ends = [...new Set(rows.filter(row => row.known).map(row => row.end))];
      return [{ kind, totals: totalsFor(rows), known: rows.filter(row => row.known).length, expected: rows.length, through: ends.length === 1 ? ends[0] : null, delayed: rows.some(row => row.known && row.end < range.end) }];
    }),
  };
}
