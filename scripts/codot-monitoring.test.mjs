import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewSnapshot} from './codot-monitoring.mjs';
const snapshot=source=>({checkedAt:'2026-10-26T02:00:00Z',periods:Object.fromEntries(['1','7','28'].map(days=>[days,{range:{start:'2026-10-01',end:'2026-10-25'},sources:source}]))});
test('monitor leaves missing, tiny baselines, ordinary daily processing and expected limited access alone',()=>{
  const data=snapshot({'cine-ios':{status:'connected',metrics:{activeUsers:1},previous:{activeUsers:0}},'cafe-youtube':{status:'connected',connectionState:'processing',metrics:{followers:3000}},'cafe-instagram':{status:'partial',metrics:{followers:100}},'pindo-ios':{status:'unavailable',metrics:{}}});
  assert.deepEqual(reviewSnapshot(data,data),{issues:[],changes:[],baseline:false});
});
test('monitor reports connection loss and material period changes with exact baselines and dates',()=>{
  const old=snapshot({'pindo-pinterest':{status:'connected'}});
  const data=snapshot({'pindo-pinterest':{status:'error'},'cafe-web':{status:'connected',metrics:{sessions:30},previous:{sessions:10}},'etsy-shop':{status:'connected',metrics:{orders:3},previous:{orders:0}}});
  const result=reviewSnapshot(data,old);assert.equal(result.issues[0].source,'pindo-pinterest');
  const traffic=result.changes.find(x=>x.metric==='sessions');assert.equal(traffic.percent,200);assert.equal(traffic.delta,20);
  assert.equal(result.changes.find(x=>x.metric==='orders').percent,null);
});
test('monetary candidates preserve currency and actual matched reporting dates; lifetime support is not period earnings',()=>{
  const data=snapshot({'watch-youtube':{status:'connected',earnings:{status:'connected',amount:22.42,previousAmount:11.731,currency:'USD',start:'2026-10-19',end:'2026-10-23',previousStart:'2026-10-12',previousEnd:'2026-10-16'}},'watch-patreon':{status:'connected',metrics:{lifetimeSupportCents:10000}}});
  const result=reviewSnapshot(data,null);
  const money=result.changes.find(row=>row.metric==='earnings');assert.equal(money.currency,'USD');assert.equal(money.dates.end,'2026-10-23');assert.equal(money.provisional,true);
  assert.equal(result.changes.some(row=>row.source==='watch-patreon'),false);
});
