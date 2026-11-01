import { SOURCES } from './data';
import { summarizeLifetimeEarnings } from './earnings';
const report = (amount, currency = 'USD', extra = {}) => ({ status: 'connected', lifetime: true, complete: true, amount, currency, ...extra });

test('lifetime total combines available history, includes Patreon and counts Stripe once', () => {
  const result = summarizeLifetimeEarnings(SOURCES, { sources: {
    'cafe-youtube': report(5), 'watch-youtube': report(100), 'cine-youtube': report(0),
    'etsy-shop': report(20), 'cine-sales': report(-1), 'watch-patreon': report(12),
  } });
  expect(result.totals).toEqual([{ currency: 'USD', amount: 136 }]);
  expect(result).toMatchObject({ known: 6, expected: 7 });
  expect(result.rows.filter(row => row.id === 'cine-sales')).toHaveLength(1);
});
test('period amounts and incomplete, stale or invalid lifetime data never become lifetime earnings', () => {
  const result = summarizeLifetimeEarnings(SOURCES, { sources: {
    'cafe-youtube': report(50, 'USD', { lifetime: false }),
    'watch-youtube': report(100, 'USD', { complete: false }),
    'cine-youtube': report(Infinity), 'etsy-shop': report(12, 'invalid'),
    'cine-sales': report(500, 'USD', { status: 'unavailable' }),
  } });
  expect(result.totals).toEqual([]);
  expect(result.known).toBe(0);
  expect(summarizeLifetimeEarnings(SOURCES, { stale: true, sources: { 'cafe-youtube': report(100) } }).totals).toEqual([]);
});
test('lifetime filters select only the matching projects/platforms and keep currencies separate', () => {
  const data = { sources: { 'cafe-youtube': report(0), 'watch-youtube': report(50, 'EUR'), 'etsy-shop': report(1000), 'cine-sales': report(500) } };
  const result = summarizeLifetimeEarnings(SOURCES.filter(source => source.kind === 'youtube'), data);
  expect(result.totals).toEqual([{ currency: 'EUR', amount: 50 }, { currency: 'USD', amount: 0 }]);
  expect(result.known).toBe(2);
  expect(summarizeLifetimeEarnings([], data).totals).toEqual([]);
});
