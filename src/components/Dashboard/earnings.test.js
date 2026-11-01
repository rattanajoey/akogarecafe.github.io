import { SOURCES } from './data';
import { summarizeEarnings } from './earnings';

const range = { start: '2026-10-04', end: '2026-10-31' };
const report = (amount, currency = 'USD', extra = {}) => ({
  status: 'connected', earnings: { status: 'connected', amount, currency, ...range, ...extra },
});

test('total adds connected period income, counts Stripe once and excludes Patreon lifetime support', () => {
  const result = summarizeEarnings(SOURCES, {
    'cafe-youtube': report(3.123), 'watch-youtube': report(12.087), 'cine-youtube': report(0),
    'etsy-shop': report(10.99), 'cine-web': report(-1.2),
    'watch-patreon': { status: 'connected', currency: 'USD', metrics: { lifetimeSupportCents: 999999 } },
  }, range);
  expect(result.totals).toHaveLength(1);
  expect(result.totals[0].currency).toBe('USD');
  expect(result.totals[0].amount).toBeCloseTo(25, 8);
  expect(result).toMatchObject({ known: 5, expected: 6, partial: true, lifetimeExcluded: true });
  expect(result.providers.find(provider => provider.kind === 'stripe')).toMatchObject({ known: 1, expected: 1, totals: [{ currency: 'USD', amount: -1.2 }] });
});

test('unknown and processing amounts never become zero, but reported zero stays known', () => {
  const selected = SOURCES.filter(source => source.kind === 'youtube');
  expect(summarizeEarnings(selected, {}, range).totals).toEqual([]);
  const result = summarizeEarnings(selected, {
    'cafe-youtube': report(0),
    'watch-youtube': report(50, 'USD', { status: 'processing' }),
    'cine-youtube': report(null),
  }, range);
  expect(result).toMatchObject({ totals: [{ currency: 'USD', amount: 0 }], known: 1, partial: true });
});

test('keeps currencies separate and respects selected project/platform sources', () => {
  const result = summarizeEarnings(SOURCES.filter(source => source.kind === 'youtube'), {
    'cafe-youtube': report(5, 'USD'), 'watch-youtube': report(7, 'EUR'), 'cine-youtube': report(2, 'USD'),
    'cine-web': report(1000), 'etsy-shop': report(1000),
  }, range);
  expect(result.totals).toEqual([{ currency: 'EUR', amount: 7 }, { currency: 'USD', amount: 7 }]);
  expect(result.providers.map(provider => provider.kind)).toEqual(['youtube']);
});

test('stale, failed, invalid and different-period reports cannot inflate the current total', () => {
  const selected = SOURCES.filter(source => ['youtube', 'etsy'].includes(source.kind));
  const result = summarizeEarnings(selected, {
    'cafe-youtube': { ...report(100), stale: true },
    'watch-youtube': { ...report(200), status: 'error' },
    'cine-youtube': report(Infinity),
    'etsy-shop': report(300, 'USD', { start: '2026-10-03' }),
  }, range);
  expect(result.totals).toEqual([]);
  expect(result.known).toBe(0);
  expect(summarizeEarnings(selected, { 'cafe-youtube': report(5, 'bad currency') }, range).known).toBe(0);
});

test('delayed YouTube amounts retain their returned-through date and mark the total partial', () => {
  const result = summarizeEarnings([SOURCES[0]], { 'cafe-youtube': report(5, 'USD', { end: '2026-10-29' }) }, range);
  expect(result).toMatchObject({ partial: true, known: 1 });
  expect(result.providers[0]).toMatchObject({ through: '2026-10-29', delayed: true });
  expect(summarizeEarnings([SOURCES[0]], { 'cafe-youtube': report(5) }, range).partial).toBe(false);
});

test('does not invent a period total for a Patreon-only filter or duplicate a repeated source', () => {
  const patreon = SOURCES.filter(source => source.kind === 'patreon');
  expect(summarizeEarnings(patreon, { 'watch-patreon': report(500) }, range)).toMatchObject({ totals: [], expected: 0, lifetimeExcluded: true });
  expect(summarizeEarnings([SOURCES[0], SOURCES[0]], { 'cafe-youtube': report(5) }, range)).toMatchObject({ totals: [{ currency: 'USD', amount: 5 }], known: 1, expected: 1 });
});
