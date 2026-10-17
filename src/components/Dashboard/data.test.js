import { coverage, dateRange, change, chartSeries, chartFraction, csv, SOURCES } from './data';
import { fetchGoogle } from './api';

test('missing sources remain unknown and a real zero remains zero', () => {
  expect(coverage(SOURCES, {}, 'views')).toEqual({ value: null, known: 0, total: 5 });
  expect(coverage(SOURCES, { 'cafe-youtube': { metrics: { views: 0 } } }, 'views')).toEqual({ value: 0, known: 1, total: 5 });
});
test('social views do not include lifetime views, Pinterest impressions or website traffic', () => {
  const reports = { 'cafe-youtube': { metrics: { views: 11, lifetimeViews: 900 } }, 'pindo-pinterest': { metrics: { views: 600, impressions: 1000 } }, 'pindo-web': { metrics: { views: 800, sessions: 90 } } };
  expect(coverage(SOURCES, reports, 'views').value).toBe(11);
  expect(coverage(SOURCES, reports, 'sessions').value).toBe(90);
});
test('completed UTC reporting periods handle month and year boundaries', () => {
  expect(dateRange(7, new Date('2026-01-04T01:00:00Z'))).toEqual({ start: '2025-12-28', end: '2026-01-03', previousStart: '2025-12-21', previousEnd: '2025-12-27' });
  expect(change(10, 0)).toBeNull();
  expect(change(0, 20)).toBe(-100);
});
test('charts do not invent zero values for unreported projects', () => {
  const series = chartSeries(SOURCES, { 'cafe-youtube': { daily: [{ date: '2026-10-15', views: 10 }] } }, 'views');
  expect(series).toEqual([{ date: '2026-10-15', cafe: 10 }]);
});
test('exports distinguish current snapshot counts from period metrics', () => {
  const text = csv({ 'cafe-youtube': { status: 'partial', metrics: { followers: 23, views: 0 } } }, [SOURCES[0]], { start: '2026-10-01', end: '2026-10-07' });
  expect(text).toContain('"@akogarecafe","","","partial","followers","23"');
  expect(text).toContain('"@akogarecafe","2026-10-01","2026-10-07","partial","views","0"');
});
test('GA4 uses a period-level unique user report and filters a matching platform and stream', async () => {
  const original = global.fetch;
  const calls = [];
  global.fetch = jest.fn(async (url, options) => {
    const body = JSON.parse(options.body); calls.push(body);
    return { ok: true, json: async () => ({ rows: body.dimensions ? [
      { dimensionValues: [{ value: '20261014' }], metricValues: [{ value: '8' }, { value: '9' }, { value: '10' }, { value: '2' }] },
      { dimensionValues: [{ value: '20261015' }], metricValues: [{ value: '7' }, { value: '8' }, { value: '9' }, { value: '2' }] },
    ] : [{ metricValues: [{ value: '12' }, { value: '17' }, { value: '19' }, { value: '4' }] }] }) };
  });
  try {
    const report = await fetchGoogle(SOURCES.find(s => s.id === 'pindo-ios'), 'test-token', 7, { propertyId: '123', streamId: '456' });
    expect(report.metrics.activeUsers).toBe(12);
    expect(report.daily.reduce((sum, row) => sum + row.activeUsers, 0)).toBe(15);
    expect(calls[0].dimensionFilter.andGroup.expressions).toEqual(expect.arrayContaining([
      { filter: { fieldName: 'streamId', stringFilter: { matchType: 'EXACT', value: '456' } } },
      { filter: { fieldName: 'platform', stringFilter: { matchType: 'EXACT', value: 'iOS', caseSensitive: false } } },
    ]));
  } finally { global.fetch = original; }
});
test('Google authorization failures cannot become successful empty reports', async () => {
  const original = global.fetch;
  global.fetch = jest.fn(async () => ({ ok: false, status: 403, json: async () => ({ error: { message: 'forbidden' } }) }));
  try { await expect(fetchGoogle(SOURCES[0], 'test-token', 7)).rejects.toThrow('Google denied this report'); }
  finally { global.fetch = original; }
});

test('chart positions preserve real calendar spacing and reject dates outside the chosen period', () => {
  const range = { start: '2026-10-01', end: '2026-10-15' };
  const firstDay = chartFraction('2026-10-01', range);
  const nextDay = chartFraction('2026-10-02', range);
  const lastDay = chartFraction('2026-10-15', range);
  expect(firstDay).toBe(0);
  expect(lastDay).toBe(1);
  expect((lastDay - nextDay) / (nextDay - firstDay)).toBeCloseTo(13);
  expect(chartFraction('2026-09-30', range)).toBeNull();
});
