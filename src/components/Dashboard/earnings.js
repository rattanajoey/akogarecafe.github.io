import { finite } from './data';

// Lifetime reports are independent of the selected period. Keep currencies and
// accounting bases labelled, and count shared website/iOS payments only once.
export function summarizeLifetimeEarnings(sources, lifetime) {
  const selected = [...new Map(sources.map(source => [source.id, source])).values()];
  const entries = selected.filter(source => ['youtube', 'etsy', 'patreon'].includes(source.kind)).map(source => ({ id: source.id, kind: source.kind }));
  if (selected.some(source => source.project === 'cine' && ['web', 'ios'].includes(source.kind))) entries.push({ id: 'cine-sales', kind: 'stripe' });
  if (selected.some(source => source.project === 'pindo' && ['web', 'ios'].includes(source.kind))) entries.push({ id: 'pindo-sales', kind: 'app' });
  const rows = entries.map(entry => {
    const report = lifetime?.sources?.[entry.id];
    const known = !lifetime?.stale && report?.status === 'connected' && report.complete === true && report.lifetime === true && finite(report.amount) && /^[A-Z]{3}$/.test(report.currency || '');
    return { ...entry, report, known, amount: known ? report.amount : null, currency: known ? report.currency : null };
  });
  const amounts = new Map();
  for (const row of rows.filter(row => row.known)) amounts.set(row.currency, (amounts.get(row.currency) || 0) + row.amount);
  const totals = [...amounts].sort(([a], [b]) => a.localeCompare(b)).map(([currency, amount]) => ({ currency, amount }));
  return { rows, totals, known: rows.filter(row => row.known).length, expected: rows.length };
}
