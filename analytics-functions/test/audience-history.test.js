'use strict';
const{test}=require('node:test'),assert=require('node:assert/strict');
const{mergeDaily,historySummary,recordSnapshot,withAudienceHistory}=require('../audience-history');
const point=(day,followers,hour='20')=>({followers,at:`2026-10-${day}T${hour}:00:00.000Z`});
const dates={start:'2026-10-19',end:'2026-10-25'};

test('refreshing the same UTC date keeps its latest count, including decreases and zero',()=>{
  let history=mergeDaily(null,point('25',20,'09')).history;
  history=mergeDaily(history,point('25',18,'21')).history;
  const old=mergeDaily(history,point('25',25,'10'));
  assert.equal(old.changed,false);assert.equal(old.history.snapshots['2026-10-25'].followers,18);
  history=mergeDaily(history,point('25',0,'23')).history;
  assert.equal(Object.keys(history.snapshots).length,1);assert.equal(history.snapshots['2026-10-25'].followers,0);
  assert.throws(()=>mergeDaily(history,point('25',NaN)));
});

test('growth uses recorded endpoints and completed days, and labels shorter spans',()=>{
  const history={snapshots:{'2026-10-22':point('22',10),'2026-10-25':point('25',14),'2026-10-26':point('26',100)}};
  const partial=historySummary(history,dates);
  assert.equal(partial.state,'partial');assert.equal(partial.change.value,4);assert.equal(partial.change.from,'2026-10-22');assert.equal(partial.change.to,'2026-10-25');
  history.snapshots['2026-10-18']=point('18',20);
  const full=historySummary(history,dates);
  assert.equal(full.state,'ready');assert.equal(full.change.value,-6);assert.equal(full.change.complete,true);
  assert.equal(historySummary(history,{start:'2026-09-01',end:'2026-09-30'}).state,'recording');
});

test('a single day or missing end boundary never becomes a full-period growth metric',async()=>{
  const report={status:'partial',metrics:{followers:14},fetchedAt:point('26',14).at};
  const partial={snapshots:{'2026-10-22':point('22',10),'2026-10-24':point('24',14)}};
  const result=await withAudienceHistory({'cafe-instagram':report},dates,async()=>partial,Date.parse(report.fetchedAt));
  assert.equal(result['cafe-instagram'].metrics.netFollowers,undefined);
  assert.equal(result['cafe-instagram'].audienceHistory.change.complete,false);
  assert.equal(historySummary({snapshots:{'2026-10-25':point('25',14)}},dates).change,undefined);
});

test('only validated fresh sources are recorded; storage failure leaves live reports usable',async()=>{
  const report={status:'connected',metrics:{followers:14},fetchedAt:point('26',14).at};let calls=0;
  const sources={'cafe-instagram':report,'watch-instagram':{...report,stale:true},'pindo-pinterest':{...report,status:'error'},'cine-web':report,'watch-youtube':{...report,metrics:{followers:null}}};
  const result=await withAudienceHistory(sources,dates,async()=>{calls++;throw Error('storage offline');},Date.parse(report.fetchedAt));
  assert.equal(calls,1);assert.equal(result['cafe-instagram'].audienceHistory.state,'unavailable');assert.equal(result['cafe-instagram'].metrics.followers,14);
});

test('full snapshot growth supplements Instagram and never replaces native YouTube growth',async()=>{
  const report={status:'connected',metrics:{followers:14},fetchedAt:point('26',14).at};
  const history={snapshots:{'2026-10-18':point('18',20),'2026-10-25':point('25',14)}};
  const result=await withAudienceHistory({'cafe-instagram':report,'cafe-youtube':{...report,metrics:{followers:1000,netFollowers:8}}},dates,async()=>history,Date.parse(report.fetchedAt));
  assert.equal(result['cafe-instagram'].metrics.netFollowers,-6);assert.equal(result['cafe-instagram'].audienceGrowth.method,'daily-snapshot');
  assert.equal(result['cafe-youtube'].metrics.netFollowers,8);assert.equal(result['cafe-youtube'].audienceGrowth,undefined);
});

test('retention is bounded and a transaction retry cannot overwrite a newer fetch',async()=>{
  const snapshots={};for(let i=0;i<405;i++){const at=new Date(Date.UTC(2025,0,1)+i*86400000).toISOString();snapshots[at.slice(0,10)]={at,followers:i};}
  const bounded=mergeDaily({snapshots},{at:new Date(Date.UTC(2025,0,1)+405*86400000).toISOString(),followers:500});
  assert.equal(Object.keys(bounded.history.snapshots).length,400);
  let writes=0;const newer=mergeDaily(null,point('25',9,'23')).history;
  const db={collection:name=>{assert.equal(name,'_studioAudienceHistory');return{doc:id=>({id})};},runTransaction:async callback=>{
    await callback({get:async()=>({exists:false}),set:()=>{writes++;}});
    return callback({get:async()=>({exists:true,data:()=>newer}),set:()=>{throw Error('older retry wrote over newer data');}});
  }};
  const result=await recordSnapshot(db,'cafe-instagram',point('25',10,'21'));
  assert.equal(result.snapshots['2026-10-25'].followers,9);assert.equal(writes,1);
});
