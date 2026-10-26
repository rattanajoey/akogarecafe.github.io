// Fetch only a public currency pair. Account data, amounts and credentials are
// never sent to the exchange-rate service.
export function createUsdRateLoader(send = (...args) => fetch(...args), clock = () => Date.now()) {
  const cache = new Map();
  return async currency => {
    if (!/^[A-Z]{3}$/.test(currency || '') || currency === 'USD') return null;
    const saved = cache.get(currency);
    if (saved && saved.until > clock()) return saved.promise;
    const entry = { until: clock() + 6 * 60 * 60 * 1000 };
    entry.promise = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      try {
        const response = await send(`https://api.frankfurter.dev/v2/rate/${currency.toLowerCase()}/usd?providers=ecb`, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
        if (!response.ok) throw new Error('Rate unavailable');
        const rate = await response.json();
        const today = Date.parse(new Date(clock()).toISOString().slice(0, 10) + 'T00:00:00Z');
        const date = /^\d{4}-\d{2}-\d{2}$/.test(rate.date || '') ? Date.parse(rate.date + 'T00:00:00Z') : NaN;
        if (rate.base !== currency || rate.quote !== 'USD' || typeof rate.rate !== 'number' || !Number.isFinite(rate.rate) || rate.rate <= 0 || !Number.isFinite(date) || date > today || today - date > 7 * 86400000 || new Date(date).toISOString().slice(0, 10) !== rate.date) throw new Error('Invalid reference rate');
        return { rate: rate.rate, date: rate.date, source: 'ECB' };
      } catch {
        entry.until = clock() + 60000;
        return null;
      } finally { clearTimeout(timeout); }
    })();
    cache.set(currency, entry);
    return entry.promise;
  };
}
export const loadUsdRate = createUsdRateLoader();
