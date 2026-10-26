'use strict';
const {createHash,timingSafeEqual}=require('node:crypto');
const {SOURCE_IDS}=require('./providers');
const METRICS=new Set(['followers','lifetimeViews','publishedItems','views','watchHours','subscribersGained','subscribersLost','netFollowers','likes','comments','impressions','outboundClicks','saves','activeUsers','sessions','screenPageViews','newUsers','patrons','paidMembers','trialMembers','declinedMembers','lifetimeSupportCents','orders','salesAmount','buyerRefunds','processingFees']);
const finite=value=>typeof value==='number'&&Number.isFinite(value);
const pick=(value,keys)=>Object.fromEntries(keys.filter(key=>value?.[key]!==undefined).map(key=>[key,value[key]]));
const numbers=value=>Object.fromEntries(Object.entries(value||{}).filter(([key,n])=>METRICS.has(key)&&(n===null||finite(n))));
const points=rows=>(Array.isArray(rows)?rows:[]).slice(-401).map(row=>({date:row.date,...numbers(row)}));

function authorized(authorization,reader,now=Date.now()){
  if(!/^Bearer akr_[A-Za-z0-9_-]{43}$/.test(authorization||'')||reader?.enabled!==true||reader.scope!=='analytics:read'
    ||!/^\w{64}$/.test(reader.tokenHash||'')||!/^[a-f0-9]{64}$/.test(reader.tokenHash)
    ||!Number.isFinite(Date.parse(reader.expiresAt))||Date.parse(reader.expiresAt)<=now)return false;
  const hash=createHash('sha256').update(authorization.slice(7)).digest();
  return timingSafeEqual(hash,Buffer.from(reader.tokenHash,'hex'));
}

// Never cache the reader registry. Disabling it or rotating its hash in the
// private secret takes effect on the next call, including report-cache hits.
async function loadReader(){
  const {GoogleAuth}=require('google-auth-library');
  const auth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']});
  const client=await auth.getClient();
  const response=await client.request({url:'https://secretmanager.googleapis.com/v1/projects/ac-movie-club/secrets/AKOGARE_ANALYTICS_CONNECTIONS/versions/latest:access',timeout:10000});
  return JSON.parse(Buffer.from(response.data.payload.data,'base64').toString('utf8')).codotReader;
}

function createRateLoader(send=fetch,clock=Date.now){
  const cache=new Map();
  return async currency=>{
    if(!/^[A-Z]{3}$/.test(currency)||currency==='USD')return null;
    const saved=cache.get(currency);if(saved&&saved.until>clock())return saved.value;
    let value=null;
    try{
      const response=await send(`https://api.frankfurter.dev/v2/rate/${currency.toLowerCase()}/usd?providers=ecb`,{signal:AbortSignal.timeout(6000),credentials:'omit',referrerPolicy:'no-referrer'});
      if(!response.ok)throw Error();const rate=await response.json();
      const today=Date.parse(new Date(clock()).toISOString().slice(0,10)+'T00:00:00Z');
      const date=/^\d{4}-\d{2}-\d{2}$/.test(rate.date||'')?Date.parse(rate.date+'T00:00:00Z'):NaN;
      if(rate.base!==currency||rate.quote!=='USD'||!finite(rate.rate)||rate.rate<=0||!Number.isFinite(date)||date>today||today-date>7*86400000||new Date(date).toISOString().slice(0,10)!==rate.date)throw Error();
      value={rate:rate.rate,date:rate.date,source:'ECB via Frankfurter'};
    }catch{/* Preserve original currencies when the reference feed is unavailable. */}
    cache.set(currency,{until:clock()+(value?21600000:60000),value});return value;
  };
}
const loadRate=createRateLoader();

async function machineReport(report,rateLoader=loadRate){
  const sources={};
  for(const id of SOURCE_IDS){
    const source=report.sources?.[id];if(!source)continue;
    const result={...pick(source,['status','note','fetchedAt','reportedThrough','currency','connectionMode','connectionState']),metrics:numbers(source.metrics),daily:points(source.daily)};
    if(source.error)result.error='This source could not be refreshed.';
    if(source.previous)result.previous=numbers(source.previous);
    if(source.comparison)result.comparison=pick(source.comparison,['start','end','previousStart','previousEnd','matchedDays']);
    if(source.earnings)result.earnings=pick(source.earnings,['status','provider','basis','amount','fees','currency','start','end','previousAmount','previousStart','previousEnd','note']);
    if(source.audienceHistory){
      const history=source.audienceHistory;
      result.audienceHistory={...pick(history,['state','startedAt','latestAt']),daily:(history.daily||[]).slice(-401).map(row=>pick(row,['date','followers','at']))};
      if(history.change)result.audienceHistory.change=pick(history.change,['value','from','to','baselineAt','asOf','complete']);
    }
    if(source.audienceGrowth)result.audienceGrowth=pick(source.audienceGrowth,['method','value','from','to','baselineAt','asOf','complete']);
    if(source.processingFeesByCurrency){
      result.processingFeesByCurrency=Object.fromEntries(Object.entries(source.processingFeesByCurrency).filter(([currency,amount])=>/^[A-Z]{3}$/.test(currency)&&finite(amount)));
      result.processingFeeUsdEstimates={};
      await Promise.all(Object.entries(result.processingFeesByCurrency).filter(([currency])=>currency!=='USD').map(async([currency,amount])=>{
        const rate=await rateLoader(currency);
        result.processingFeeUsdEstimates[currency]=rate?{amount:Math.round(amount*rate.rate*100)/100,currency:'USD',...rate,basis:'Approximate current reference conversion; not settlement FX'}:null;
      }));
    }
    sources[id]=result;
  }
  const products=Object.fromEntries(['cine','pindo'].filter(id=>report.products?.[id]).map(id=>[id,pick(report.products[id],['registeredUsers','signedInUsers','newAccounts','note','error'])]));
  return{schemaVersion:1,range:pick(report.range,['start','end']),fetchedAt:report.fetchedAt,sources,products,
    guidance:{window:'Completed calendar dates ending yesterday; provider timezones differ.',youtube:'Activity and estimated revenue can lag 48–72 hours. Use reportedThrough and matched comparison dates.',snapshots:'Followers and membership counts are current snapshots. Audience history begins only when observed; X remains a dated manual snapshot with no paid API.',money:'Keep currencies and reporting bases separate. Patreon lifetime support is not period earnings; Stripe activity and Etsy item sales are not profit.',unknown:'Missing, unavailable and partial data are not zero. Avoid percentages from zero or tiny baselines.'}};
}

function handler({reports,reader=loadReader,project=machineReport,config=()=>JSON.parse(process.env.AKOGARE_ANALYTICS_CONNECTIONS||'')}){
  return async(req,res)=>{
    res.set('Cache-Control','no-store');res.set('X-Content-Type-Options','nosniff');
    if(req.method!=='POST')return res.status(405).json({error:'Use POST for a read-only reporting request.'});
    if(req.path&&req.path!=='/')return res.status(404).json({error:'Report route not found.'});
    if(!/^Bearer akr_[A-Za-z0-9_-]{43}$/.test(req.get('Authorization')||''))return res.status(401).json({error:'Dashboard reader authentication required.'});
    try{
      const access=await reader();
      if(!authorized(req.get('Authorization'),access))return res.status(403).json({error:'Dashboard reader access is inactive or expired.'});
      if(!req.body||Object.keys(req.body).length!==1||![1,7,28].includes(req.body.days))return res.status(400).json({error:'Choose 1, 7 or 28 completed days.'});
      const result=await project(await reports(config(),req.body.days));
      return res.status(200).json({...result,reader:{id:'codot',scope:'analytics:read',expiresAt:access.expiresAt}});
    }catch{return res.status(503).json({error:'The private reports could not be verified. Try again later.'});}
  };
}
module.exports={authorized,machineReport,createRateLoader,handler};
