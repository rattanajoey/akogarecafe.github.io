'use strict';
const {range,reporter,accountCounts}=require('./providers');
const {recordSnapshot,withAudienceHistory}=require('./audience-history');

// Both readers use the same aggregate reporting path. Authentication belongs
// outside this cache, so a cached report never bypasses a revocation check.
function createReportService(admin,app){
  const cache=new Map();
  return async function reports(config,days){
    const dates=range(days),key=`${days}:${dates.end}`;
    const hit=cache.get(key);if(hit&&Date.now()-hit.at<300000)return hit.value;
    const productsPromise=(async()=>{
      const products={},jobs=[['cine',admin.auth(app)]];
      if(config.pindoServiceAccount){
        const pindo=admin.apps.find(a=>a.name==='dashboard-pindo')||admin.initializeApp({credential:admin.credential.cert(config.pindoServiceAccount),projectId:'pindo-patterns-7a4c9f'},'dashboard-pindo');
        jobs.push(['pindo',admin.auth(pindo)]);
      }
      await Promise.all(jobs.map(async([id,auth])=>{try{products[id]=await accountCounts(auth,dates);}catch{products[id]={error:'Firebase account totals are currently unavailable.'};}}));
      return products;
    })();
    const [currentSources,products]=await Promise.all([reporter(config).sources(days),productsPromise]);
    const sources=await withAudienceHistory(currentSources,dates,(id,observation)=>recordSnapshot(admin.firestore(app),id,observation));
    const value={sources,products,range:dates,fetchedAt:new Date().toISOString()};
    cache.set(key,{at:Date.now(),value});return value;
  };
}
module.exports={createReportService};
