'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const{report,USER_ID,USERNAME}=require('../x-report');
const{reporter}=require('../providers');
const{withAudienceHistory,mergeDaily}=require('../audience-history');
const config={userId:USER_ID,username:USERNAME,snapshot:{at:'2026-10-26T03:05:55.818Z',followers:21,publishedItems:134}};

test('the no-cost X snapshot makes no API calls and preserves its original observation time across periods',async()=>{
  const original=global.fetch;let calls=0;
  global.fetch=async()=>{calls++;throw Error('No paid X requests are allowed');};
  try{
    for(const days of [1,7,28,90]){
      const x=(await reporter({xReporting:{...config,bearerToken:'must-not-be-used'}}).sources(days))['cafe-x'];
      assert.equal(x.connectionMode,'manual');assert.equal(x.connectionState,'snapshot');
      assert.deepEqual(x.metrics,{followers:21,publishedItems:134});
      assert.equal(x.fetchedAt,config.snapshot.at);assert.deepEqual(x.daily,[]);
      assert.equal(x.metrics.views,undefined);assert.equal(x.previous,undefined);
      assert.equal(JSON.stringify(x).includes('must-not-be-used'),false);
    }
    assert.equal(calls,0);
  }finally{global.fetch=original;}
});

test('unverified identities, invalid counts and future observations never produce a reported count',()=>{
  const now=Date.parse('2026-10-27T00:00:00Z');
  for(const input of [undefined,{...config,userId:'different'},{...config,username:'someone_else'},{...config,snapshot:{...config.snapshot,followers:-1}},{...config,snapshot:{...config.snapshot,publishedItems:null}},{...config,snapshot:{...config.snapshot,at:'2026-11-01T00:00:00Z'}}]){
    assert.equal(report(input,now).status,'unavailable');assert.deepEqual(report(input,now).metrics,{});
  }
  assert.equal(report({...config,snapshot:{...config.snapshot,followers:0,publishedItems:0}},now).metrics.followers,0);
});

test('refreshes retain one manual history date instead of inventing a fresh daily observation',async()=>{
  let saved;
  const record=async(id,point)=>{assert.equal(id,'cafe-x');saved=mergeDaily(saved,point).history;return saved;};
  for(const now of ['2026-10-26T04:00:00Z','2026-10-27T04:00:00Z','2026-10-28T04:00:00Z']){
    const result=await withAudienceHistory({'cafe-x':report(config,Date.parse(now))},{start:'2026-10-01',end:now.slice(0,10)},record,Date.parse(now));
    assert.equal(result['cafe-x'].metrics.netFollowers,undefined);
  }
  assert.deepEqual(Object.keys(saved.snapshots),['2026-10-26']);
});
