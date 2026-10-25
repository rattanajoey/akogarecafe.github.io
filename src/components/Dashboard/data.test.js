import { coverage, audienceTotal, formatAudience, formatMoney, dateRange, change, chartSeries, chartFraction, periodComparison, signed, csv, SOURCES } from './data';
import { fetchGoogle } from './api';

test('missing sources remain unknown and a real zero remains zero', () => {
  expect(coverage(SOURCES, {}, 'views')).toEqual({ value: null, known: 0, total: 5 });
  expect(coverage(SOURCES, { 'cafe-youtube': { metrics: { views: 0 } } }, 'views')).toEqual({ value: 0, known: 1, total: 5 });
});

test('audience counts distinguish mixed platforms, rounded subscribers, exact small counts and missing data', () => {
  const sources = SOURCES.filter(s => s.project === 'cafe');
  const reports = { 'cafe-youtube': { metrics: { followers: 2630 } }, 'cafe-instagram': { metrics: { followers: 79 } } };
  expect(audienceTotal(sources, reports)).toMatchObject({ value: 2709, rounded: true });
  expect(formatAudience(audienceTotal(sources.filter(s => s.kind === 'youtube'), reports))).toBe('≈2,630');
  expect(formatAudience(audienceTotal(sources.filter(s => s.kind === 'instagram'), reports))).toBe('79');
  reports['cafe-youtube'].metrics.followers = 0;
  expect(formatAudience(audienceTotal(sources.filter(s => s.kind === 'youtube'), reports))).toBe('0');
  reports['cafe-youtube'].metrics.followers = null;
  expect(formatAudience(audienceTotal(sources.filter(s => s.kind === 'youtube'), reports))).toBe('—');
});
test('social views do not include lifetime views, Pinterest impressions or website traffic', () => {
  const reports = { 'cafe-youtube': { metrics: { views: 11, lifetimeViews: 900 } }, 'pindo-pinterest': { metrics: { views: 600, impressions: 1000 } }, 'pindo-web': { metrics: { views: 800, sessions: 90 } } };
  expect(coverage(SOURCES, reports, 'views').value).toBe(11);
  expect(coverage(SOURCES, reports, 'sessions').value).toBe(90);
});
test('completed UTC reporting periods handle month and year boundaries', () => {
  expect(dateRange(7, new Date('2026-01-04T01:00:00Z'))).toEqual({ start: '2025-12-28', end: '2026-01-03', previousStart: '2025-12-21', previousEnd: '2025-12-27' });
  expect(dateRange(1, new Date('2026-01-01T00:05:00Z'))).toEqual({ start: '2025-12-31', end: '2025-12-31', previousStart: '2025-12-30', previousEnd: '2025-12-30' });
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
  expect(chartFraction('2026-10-01', { start: '2026-10-01', end: '2026-10-01' })).toBe(0.5);
});

test('one-day YouTube reports distinguish processing from an explicit zero and request the previous day', async () => {
  const original = global.fetch, requests = [];
  let reported = false;
  global.fetch = jest.fn(async url => {
    const query = new URL(url); requests.push(query);
    return { ok: true, json: async () => url.includes('/channels?')
      ? { items: [{ statistics: { subscriberCount: '10', viewCount: '100', videoCount: '3' } }] }
      : { columnHeaders: ['day','views','estimatedMinutesWatched','subscribersGained','subscribersLost','likes','comments'].map(name => ({name})), rows: reported && query.searchParams.get('startDate') === dateRange(1).start
        ? [query.searchParams.has('dimensions') ? [dateRange(1).start, 0, 0, 0, 0, 0, 0] : [0, 0, 0, 0, 0, 0]] : [] } };
  });
  try {
    const pending = await fetchGoogle(SOURCES[0], 'test-token', 1);
    expect(pending.connectionState).toBe('processing');
    expect(pending.metrics.views).toBeUndefined();
    expect(pending.metrics.followers).toBe(10);
    const periods = requests.filter(url => url.hostname === 'youtubeanalytics.googleapis.com').map(url => [url.searchParams.get('startDate'), url.searchParams.get('endDate')]);
    expect(periods).toEqual([[dateRange(1).start, dateRange(1).end]]);
    reported = true;
    const zero = await fetchGoogle(SOURCES[0], 'test-token', 1);
    expect(zero.connectionState).toBeUndefined();
    expect(zero.metrics.views).toBe(0);
    expect(zero.previous).toEqual({});
    expect(zero.daily[0].views).toBe(0);
  } finally { global.fetch = original; }
});


test('signed comparisons use the same known sources, exclude stale data and handle zero baselines', () => {
  const sources = SOURCES.filter(s => s.kind === 'web');
  const reports = {
    'cafe-web': { metrics: { sessions: 10 }, previous: { sessions: 5 } },
    'cine-web': { metrics: { sessions: 5 }, previous: { sessions: 10 } },
    'pindo-web': { metrics: { sessions: 100 } },
  };
  expect(periodComparison(sources, reports, 'sessions')).toMatchObject({value:0,percent:0,known:2,total:3});
  reports['cafe-web'].stale = true;
  expect(periodComparison(sources, reports, 'sessions')).toMatchObject({value:-5,percent:-50,known:1,total:3});
  reports['cine-web'] = { metrics: { sessions: 8 }, previous: { sessions: 0 } };
  expect(periodComparison(sources, reports, 'sessions')).toMatchObject({value:8,percent:null});
  reports['cine-web'].metrics.sessions = 0;
  expect(periodComparison(sources, reports, 'sessions')).toMatchObject({value:0,percent:null});
  delete reports['cine-web'].previous;
  expect(periodComparison(sources, reports, 'sessions')).toMatchObject({value:null,percent:null,known:0});
  expect(signed(8)).toBe('+8'); expect(signed(-8)).toBe('−8'); expect(signed(0)).toBe('0');
});

test('browser YouTube comparisons match reported dates and preserve current metrics on history failure', async () => {
  const original = global.fetch, requests = [], range = dateRange(7);
  const through = new Date(Date.parse(range.end+'T00:00:00Z')-2*86400000).toISOString().slice(0,10);
  let historyFails = false;
  global.fetch = async url => {
    if(url.includes('/channels?')) return {ok:true,json:async()=>({items:[{statistics:{subscriberCount:'1000',viewCount:'5000',videoCount:'3'}}]})};
    const params = new URL(url).searchParams;requests.push(params);
    const current = params.get('startDate') === range.start;
    return {ok:current || !historyFails,status:403,json:async()=>({columnHeaders:['day','views','estimatedMinutesWatched','subscribersGained','subscribersLost','likes','comments'].map(name=>({name})),rows:[[current?through:range.previousStart,current?50:100,60,10,3,4,1]]})};
  };
  try {
    const report = await fetchGoogle(SOURCES[0], 'test', 7);
    expect(report.metrics.netFollowers).toBe(7);
    expect(report.previous.views).toBe(100);
    expect(report.comparison).toMatchObject({start:range.start,end:through,previousStart:range.previousStart,matchedDays:true});
    expect(requests[1].get('endDate')).toBe(new Date(Date.parse(through+'T00:00:00Z')-7*86400000).toISOString().slice(0,10));
    historyFails = true;
    const retained = await fetchGoogle(SOURCES[0], 'test', 7);
    expect(retained.metrics.views).toBe(50);expect(retained.previous).toEqual({});
  } finally { global.fetch = original; }
});

test('Patreon membership exports are snapshots and do not inflate social followers or views', () => {
  const source=SOURCES.find(s=>s.id==='watch-patreon');
  const reports={'watch-patreon':{status:'connected',metrics:{patrons:4,paidMembers:2,followers:900,views:800}}};
  expect(audienceTotal([source],reports).value).toBeNull();
  expect(coverage([source],reports,'views').value).toBeNull();
  const text=csv(reports,[source],{start:'2026-10-01',end:'2026-10-28'});
  expect(text).toContain('"AkogareWatchClub","","","connected","paidMembers","2"');
});

test('Etsy exports keep money currency and merchandise-sales basis separate from audience metrics',()=>{
  const source=SOURCES.find(s=>s.id==='etsy-shop');
  const report={status:'connected',currency:'USD',metrics:{orders:2,salesAmount:15,processingFees:0.6},earnings:{status:'connected',provider:'etsy',amount:15,currency:'USD',start:'2026-10-01',end:'2026-10-07'}};
  const output=csv({'etsy-shop':report},[source],{start:'2026-10-01',end:'2026-10-07'});
  expect(output).toContain('"salesAmount","15","","USD"');
  expect(output).toContain('"processingFees","0.6","","USD"');
  expect(output).toContain('"merchandiseSales","15","","USD"');
  expect(audienceTotal([source],{'etsy-shop':report}).total).toBe(0);
  const mixed=csv({'etsy-shop':{...report,metrics:{...report.metrics,processingFees:null},processingFeesByCurrency:{USD:0.35,GBP:0.4}}},[source],{start:'2026-10-01',end:'2026-10-07'});
  expect(mixed).toContain('"processingFees","0.35","","USD"');
  expect(mixed).toContain('"processingFees","0.4","","GBP"');
});

test('daily history exports include actual recorded timestamps only within completed dates',()=>{
  const source=SOURCES.find(s=>s.id==='cafe-instagram');
  const output=csv({'cafe-instagram':{status:'partial',metrics:{followers:12},audienceHistory:{daily:[{date:'2026-10-23',at:'2026-10-23T16:00:00Z',followers:11},{date:'2026-10-24',at:'2026-10-24T17:00:00Z',followers:12}]}}},[source],{start:'2026-10-23',end:'2026-10-23'});
  expect(output).toContain('"followersSnapshot","11","2026-10-23T16:00:00Z"');
  expect(output).not.toContain('"followersSnapshot","12"');
});

test('money keeps cents and currency explicit and exports lifetime support without period dates', () => {
  expect(formatMoney(0,'USD')).toMatch(/USD\s0\.00/);
  expect(formatMoney(1234,'EUR')).toMatch(/EUR\s12\.34/);
  expect(formatMoney(null,'USD')).toBe('—');
  expect(formatMoney(100,undefined)).toBe('—');
  const source=SOURCES.find(s=>s.id==='watch-patreon');
  const text=csv({'watch-patreon':{status:'connected',currency:'EUR',metrics:{lifetimeSupportCents:1234}}},[source],{start:'2026-10-01',end:'2026-10-28'});
  expect(text).toContain('"Currency"');
  expect(text).toContain('"AkogareWatchClub","","","connected","lifetimeSupportCents","1234","","EUR"');
});


test('Stripe exports net payment activity with its actual dates and currency', () => {
  const source=SOURCES.find(s=>s.id==='cine-web');
  const text=csv({'cine-web':{status:'connected',earnings:{status:'connected',provider:'stripe',amount:-0.45,currency:'USD',start:'2026-10-01',end:'2026-10-07'}}},[source],{start:'other',end:'other'});
  expect(text).toContain('"2026-10-01","2026-10-07","connected","netPaymentActivity","-0.45","","USD"');
});
