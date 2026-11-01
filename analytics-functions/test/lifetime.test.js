'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {lifetimeReport,MONETARY_SCOPE}=require('../youtube-earnings');
const {createLifetimeService}=require('../lifetime-service');
const connection={channelId:'channel',scope:MONETARY_SCOPE};
test('YouTube lifetime starts at verified channel creation, finds the returned-through day and requests one whole-history aggregate',async()=>{
  const calls=[];
  const result=await lifetimeReport(connection,'channel','2026-10-31',async()=>'private-token',async url=>{
    const u=new URL(url);calls.push(u);
    if(u.pathname.endsWith('/channels'))return{items:[{id:'channel',snippet:{publishedAt:'2018-06-10T10:00:00Z'}}]};
    if(u.searchParams.has('dimensions'))return{columnHeaders:[{name:'day'},{name:'estimatedRevenue'}],rows:[['2026-10-29',2]]};
    return{columnHeaders:[{name:'estimatedRevenue'}],rows:[[1234.567]]};
  });
  assert.equal(calls[1].searchParams.get('startDate'),'2018-06-10');
  assert.equal(calls[1].searchParams.get('maxResults'),'1');
  assert.equal(calls[2].searchParams.get('endDate'),'2026-10-29');
  assert.equal(calls[2].searchParams.has('dimensions'),false);
  assert.equal(result.amount,1234.567);assert.equal(result.complete,true);assert.equal(result.lifetime,true);
  assert.equal(JSON.stringify(result).includes('private-token'),false);
});
test('YouTube lifetime rejects empty, malformed, mismatched and incomplete histories instead of inventing zero',async()=>{
  let calls=0;
  assert.equal((await lifetimeReport(connection,'other','2026-10-31',async()=>{calls++;},async()=>{})).amount,undefined);assert.equal(calls,0);
  for(const rows of [[],[['2026-11-01',1]],[['2026-10-29',null]]]){
    const result=await lifetimeReport(connection,'channel','2026-10-31',async()=>'token',async url=>url.includes('/channels?')?{items:[{id:'channel',snippet:{publishedAt:'2018-06-10T00:00:00Z'}}]}:{columnHeaders:[{name:'day'},{name:'estimatedRevenue'}],rows});
    assert.equal(result.amount,undefined);
  }
});
test('YouTube lifetime accepts an explicit aggregate zero without inventing a finalized-through date',async()=>{
  const result=await lifetimeReport(connection,'channel','2026-10-31',async()=>'token',async url=>{
    if(url.includes('/channels?'))return{items:[{id:'channel',snippet:{publishedAt:'2020-01-01T00:00:00Z'}}]};
    if(new URL(url).searchParams.has('dimensions'))return{columnHeaders:[{name:'day'},{name:'estimatedRevenue'}],rows:[]};
    return{columnHeaders:[{name:'estimatedRevenue'}],rows:[[0]]};
  });
  assert.equal(result.amount,0);assert.equal(result.complete,true);assert.equal(result.end,undefined);
  assert.equal(result.requestedThrough,'2026-10-31');
});
test('lifetime service shares in-flight reads and caches successful aggregates independently of period selection',async()=>{
  let calls=0,time=Date.parse('2026-11-01T02:00:00Z');
  const service=createLifetimeService(()=>({lifetimeEarnings:async()=>{calls++;return{sources:{one:{status:'connected'}},fetchedAt:'now'};}}),()=>time);
  await Promise.all([service({}),service({})]);await service({});assert.equal(calls,1);
  time+=6*60*60*1000+1;await service({});assert.equal(calls,2);
});
test('lifetime queries remain workspace-authenticated and the machine reader still accepts only its approved periods',async()=>{
  const {projectAnalytics}=require('../index');
  await assert.rejects(projectAnalytics.run({lifetime:true},{}),error=>error.code==='unauthenticated');
  await assert.rejects(projectAnalytics.run({lifetime:true,days:7},{auth:{uid:'unused'}}),error=>error.code==='invalid-argument');
  const {allowed}=require('../providers');assert.equal(allowed({lifetime:true}),false);
});
