'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {authorized,handler,machineReport,createRateLoader}=require('../codot-reader');
const token='akr_'+'a'.repeat(43),header='Bearer '+token;
const access={enabled:true,scope:'analytics:read',tokenHash:createHash('sha256').update(token).digest('hex'),expiresAt:'2099-01-01T00:00:00Z'};

test('reader capability requires exact key, live enabled state, read scope and expiry',()=>{
  assert.equal(authorized(header,access),true);
  for(const value of [{...access,enabled:false},{...access,scope:'admin'},{...access,expiresAt:'2000-01-01'},{...access,expiresAt:'bad'},{...access,tokenHash:'x'.repeat(64)},{...access,tokenHash:'f'.repeat(64)}])assert.equal(authorized(header,value),false);
  for(const bad of [null,'Bearer '+token+'x','Bearer wrong','Bearer '+token+'\n',header.replace('Bearer','Basic')])assert.equal(authorized(bad,access),false);
});

function response(){return{code:200,set(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};}
test('kill switch checked again before cached reports; denied, invalid and write requests cannot fetch',async()=>{
  let current=access,calls=0,registryReads=0;
  const run=handler({reader:async()=>{registryReads++;return current;},reports:async()=>{calls++;return{};},project:async()=>({sources:{}}),config:()=>({})});
  const req={method:'POST',path:'/',body:{days:7},get:()=>header};
  const a=response();await run(req,a);assert.equal(a.code,200);assert.equal(calls,1);
  current={...access,enabled:false};const b=response();await run(req,b);assert.equal(b.code,403);assert.equal(calls,1);assert.equal(registryReads,2);
  current=access;
  for(const change of [{method:'DELETE'},{body:{days:90}},{body:{days:7,action:'publish'}},{path:'/admin'},{get:()=>''}]){const r=response();await run({...req,...change},r);assert.ok(r.code>=400);assert.equal(calls,1);}
});
test('registry failure fails closed without leaking error or accessing providers',async()=>{
  const run=handler({reader:async()=>{throw Error('secret-credential');},reports:async()=>{throw Error('Should not fetch');}});
  const r=response();await run({method:'POST',body:{days:7},get:()=>header},r);assert.equal(r.code,503);assert.ok(!JSON.stringify(r).includes('secret-credential'));
});

test('machine reports expose known aggregates only and preserve separate currency estimates',async()=>{
  const raw={fetchedAt:'2026-10-26T01:00:00Z',range:{start:'2026-10-01',end:'2026-10-25'},sources:{'etsy-shop':{status:'connected',metrics:{orders:2,salesAmount:18.68,email:'private',access_token:'secret'},processingFeesByCurrency:{GBP:0.65,USD:0.48},access_token:'secret',members:[{name:'private'}],earnings:{provider:'etsy',amount:18.68,currency:'USD',refresh_token:'secret'}},'cafe-x':{metrics:{followers:21},fetchedAt:'2026-10-01T00:00:00Z'},unexpected:{metrics:{followers:100}}},products:{cine:{registeredUsers:15,emails:['private']}}};
  const result=await machineReport(raw,async()=>({rate:1.3368,date:'2026-10-23',source:'ECB via Frankfurter'}));
  assert.deepEqual(result.sources['etsy-shop'].metrics,{orders:2,salesAmount:18.68});
  assert.equal(result.sources['etsy-shop'].processingFeeUsdEstimates.GBP.amount,0.87);
  assert.deepEqual(result.sources['etsy-shop'].processingFeesByCurrency,{GBP:0.65,USD:0.48});
  assert.equal(result.sources['cafe-x'].fetchedAt,raw.sources['cafe-x'].fetchedAt);
  for(const hidden of ['private','secret','unexpected','access_token','refresh_token','emails'])assert.ok(!JSON.stringify(result).includes(hidden));
  assert.equal(result.sources['etsy-shop'].members,undefined);
  const unavailable=await machineReport(raw,async()=>null);assert.equal(unavailable.sources['etsy-shop'].processingFeeUsdEstimates.GBP,null);
});
test('server FX validation rejects stale, future and wrong currency rates; no account data sent',async()=>{
  const now=()=>Date.parse('2026-10-26T10:00:00Z');
  for(const row of [{date:'2026-10-01',base:'GBP',quote:'USD',rate:1.3},{date:'2026-10-27',base:'GBP',quote:'USD',rate:1.3},{date:'2026-10-23',base:'EUR',quote:'USD',rate:1.3},{date:'2026-10-23',base:'GBP',quote:'USD',rate:-1}]){
    assert.equal(await createRateLoader(async()=>({ok:true,json:async()=>row}),now)('GBP'),null);
  }
  let calls=0;
  const load=createRateLoader(async(url,options)=>{calls++;assert.equal(url,'https://api.frankfurter.dev/v2/rate/gbp/usd?providers=ecb');assert.equal(options.headers,undefined);return{ok:true,json:async()=>({date:'2026-10-23',base:'GBP',quote:'USD',rate:1.3368})};},now);
  assert.equal((await load('GBP')).rate,1.3368);await load('GBP');assert.equal(calls,1);
});
