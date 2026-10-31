import { createUsdRateLoader, summarizeFees } from './currency';

const now = () => Date.parse('2026-10-26T03:00:00Z');
const reference = { base: 'GBP', quote: 'USD', rate: 1.3368, date: '2026-10-23' };

test('USD estimates use the dated reference rate, share cached requests and send no account data', async () => {
  const send = jest.fn(async () => ({ ok: true, json: async () => reference }));
  const load = createUsdRateLoader(send, now);
  const [first, second] = await Promise.all([load('GBP'), load('GBP')]);
  expect(first).toEqual({ rate: 1.3368, date: '2026-10-23', source: 'ECB' });
  expect(first).toBe(second);
  expect((0.65 * first.rate).toFixed(2)).toBe('0.87');
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toBe('https://api.frankfurter.dev/v2/rate/gbp/usd?providers=ecb');
  expect(send.mock.calls[0][1]).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer' });
  expect(send.mock.calls[0][1].headers).toBeUndefined();
  await load('USD'); await load('not-a-currency');
  expect(send).toHaveBeenCalledTimes(1);
});

test('missing, stale, mismatched or invalid rates stay unavailable instead of implying parity', async () => {
  for (const value of [{ ...reference, rate: 0 }, { ...reference, rate: '1.3' }, { ...reference, rate: Infinity }, { ...reference, base: 'EUR' }, { ...reference, quote: 'EUR' }, { ...reference, date: '2026-10-27' }, { ...reference, date: '2026-10-01' }, { ...reference, date: '2026-02-30' }]) {
    const load = createUsdRateLoader(async () => ({ ok: true, json: async () => value }), now);
    expect(await load('GBP')).toBeNull();
  }
  expect(await createUsdRateLoader(async () => { throw new Error('offline'); }, now)('GBP')).toBeNull();
});

test('mixed fee totals convert every currency before summing and preserve each original amount',()=>{
  const fees={GBP:0.65,USD:0.48,EUR:0.64};
  const total=summarizeFees(fees,{GBP:{rate:1.3328,date:'2026-10-27'},EUR:{rate:1.115,date:'2026-10-27'}});
  expect(total.total.toFixed(2)).toBe('2.06');
  expect(total.approximate).toBe(true);
  expect(total.pending).toBe(false);
  expect(total.rows.map(row=>[row.currency,row.amount])).toEqual([['USD',0.48],['EUR',0.64],['GBP',0.65]]);
  expect(fees).toEqual({GBP:0.65,USD:0.48,EUR:0.64});
  expect(summarizeFees(fees,{GBP:null,EUR:{rate:1.115}}).total).toBeNull();
  expect(summarizeFees(fees,{}).pending).toBe(true);
  expect(summarizeFees(fees,{GBP:null,EUR:null}).pending).toBe(false);
  expect(summarizeFees({USD:0}).total).toBe(0);
  expect(summarizeFees({USD:0}).approximate).toBe(false);
  expect(summarizeFees({EUR:0})).toMatchObject({total:0,approximate:true,pending:false});
  for(const fees of [null,{}, {USD:null}, {USD:-1}, {usd:1}, {USD:Infinity}])expect(summarizeFees(fees)).toBeNull();
});
