'use strict';

const TRACKED=new Set(['cafe-youtube','watch-youtube','cine-youtube','cafe-instagram','watch-instagram','pindo-pinterest']);
const KEEP_DAYS=400,DAY=86400000;
const validPoint=point=>Number.isSafeInteger(point?.followers)&&point.followers>=0&&Number.isFinite(Date.parse(point.at));
const dayOf=at=>new Date(at).toISOString().slice(0,10);

// Each UTC day has one latest successful observation, never a sum of refreshes.
function mergeDaily(saved,observation){
  if(!validPoint(observation))throw new Error('Invalid audience observation');
  const day=dayOf(observation.at),cutoff=dayOf(Date.parse(observation.at)-(KEEP_DAYS-1)*DAY);
  const snapshots=Object.fromEntries(Object.entries(saved?.snapshots||{}).filter(([date,point])=>validPoint(point)&&dayOf(point.at)===date&&date>=cutoff));
  const previous=snapshots[day];
  if(previous&&Date.parse(previous.at)>=Date.parse(observation.at))return{changed:false,history:{version:1,snapshots}};
  snapshots[day]={followers:observation.followers,at:new Date(observation.at).toISOString()};
  // An old in-flight request cannot make retention grow or evict newer records.
  const retained=Object.entries(snapshots).sort(([a],[b])=>a.localeCompare(b)).slice(-KEEP_DAYS);
  return{changed:true,history:{version:1,snapshots:Object.fromEntries(retained)}};
}

function historySummary(history,dates){
  const points=Object.entries(history?.snapshots||{}).filter(([date,point])=>validPoint(point)&&dayOf(point.at)===date).map(([date,point])=>({date,...point})).sort((a,b)=>a.date.localeCompare(b.date));
  if(!points.length)return{state:'recording'};
  const baseline=dayOf(Date.parse(dates.start+'T00:00:00Z')-DAY);
  const selected=points.filter(point=>point.date>=baseline&&point.date<=dates.end);
  const result={state:'recording',startedAt:points[0].at,latestAt:points.at(-1).at,daily:points.filter(point=>point.date>=baseline)};
  if(selected.length<2)return result;
  const first=selected[0],last=selected.at(-1),complete=first.date===baseline&&last.date===dates.end;
  result.state=complete?'ready':'partial';
  result.change={value:last.followers-first.followers,from:first.date,to:last.date,baselineAt:first.at,asOf:last.at,complete};
  return result;
}

async function recordSnapshot(db,id,observation){
  if(!TRACKED.has(id))throw new Error('Unknown audience source');
  const ref=db.collection('_studioAudienceHistory').doc(id);
  return db.runTransaction(async transaction=>{
    const saved=await transaction.get(ref),next=mergeDaily(saved.exists?saved.data():null,observation);
    if(next.changed)transaction.set(ref,next.history);
    return next.history;
  });
}

async function withAudienceHistory(sources,dates,record,now=Date.now()){
  return Object.fromEntries(await Promise.all(Object.entries(sources).map(async([id,report])=>{
    if(!TRACKED.has(id)||report.stale||!['connected','partial'].includes(report.status)||!Number.isSafeInteger(report.metrics?.followers)||report.metrics.followers<0)return[id,report];
    const at=Date.parse(report.fetchedAt);
    if(!Number.isFinite(at)||at>now+60000)return[id,report];
    try{
      const history=await record(id,{followers:report.metrics.followers,at:new Date(at).toISOString()});
      const summary=historySummary(history,dates),updated={...report,audienceHistory:summary};
      // YouTube's native gained-minus-lost report is more accurate than its
      // rounded public count. Snapshot deltas fill only other social sources.
      if(!id.endsWith('-youtube')&&summary.change?.complete&&!Number.isFinite(report.metrics.netFollowers)){
        updated.metrics={...report.metrics,netFollowers:summary.change.value};
        updated.audienceGrowth={method:'daily-snapshot',...summary.change};
      }
      return[id,updated];
    }catch{return[id,{...report,audienceHistory:{state:'unavailable'}}];}
  })));
}

module.exports={mergeDaily,historySummary,recordSnapshot,withAudienceHistory,KEEP_DAYS};
