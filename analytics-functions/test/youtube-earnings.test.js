'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const{earningsReport,MONETARY_SCOPE}=require('../youtube-earnings');
const connection={channelId:'channel',scope:MONETARY_SCOPE},dates={start:'2026-10-01',end:'2026-10-07'};
const body=rows=>({columnHeaders:[{name:'day'},{name:'estimatedRevenue'}],rows});
test('YouTube money is opt-in and pinned to the authorized channel',async()=>{
 let calls=0;const request=async()=>{calls++;};
 assert.equal((await earningsReport({scope:'readonly'},'channel',dates,request,request)).amount,undefined);
 assert.equal((await earningsReport(connection,'other',dates,request,request)).amount,undefined);
 assert.equal(calls,0);
});
test('YouTube compares matching available revenue days and retains actual currency and dates',async()=>{
 const queries=[];
 const result=await earningsReport(connection,'channel',dates,async()=>'private',async(url,token)=>{
  assert.equal(token,'private');const p=new URL(url).searchParams;queries.push(p);
  assert.equal(p.get('currency'),'USD');assert.equal(p.get('metrics'),'estimatedRevenue');
  return queries.length===1?body([['2026-10-01',1.25],['2026-10-02',0]]):body([['2026-09-24',0.5],['2026-09-25',0.25]]);
 });
 assert.equal(result.amount,1.25);assert.equal(result.previousAmount,0.75);assert.equal(result.end,'2026-10-02');
 assert.equal(queries[1].get('endDate'),'2026-09-25');assert.equal(JSON.stringify(result).includes('private'),false);
});
test('YouTube distinguishes real zero from missing revenue and withholds unmatched comparisons',async()=>{
 const empty=await earningsReport(connection,'channel',dates,async()=>'t',async()=>body([]));
 assert.equal(empty.status,'processing');assert.equal(empty.amount,undefined);
 let calls=0;
 const zero=await earningsReport(connection,'channel',dates,async()=>'t',async()=>++calls===1?body([['2026-10-01',0]]):body([]));
 assert.equal(zero.amount,0);assert.equal(zero.previousAmount,undefined);
 const invalid=await earningsReport(connection,'channel',dates,async()=>'t',async()=>body([['2026-10-01',null]]));
 assert.equal(invalid.amount,undefined);assert.equal(invalid.status,'unavailable');
});
