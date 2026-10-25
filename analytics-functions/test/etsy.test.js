'use strict';
const{test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const{salesReport,SHOP_ID}=require('../etsy-report');
const{complete,REDIRECT}=require('../etsy-callback');
const{connectionManager}=require('../etsy-connection');
const config={client_id:'private-app-id',client_secret:'private-app-secret',shopId:SHOP_ID,userId:'1',shopName:'AkogareCafeStudio',currency:'USD',scope:'transactions_r',access_token:'1.private-access',refresh_token:'1.private-refresh'};
const money=amount=>({amount,divisor:100,currency_code:'USD'});
const dates={start:'2026-10-24',end:'2026-10-24'},created=Date.parse(dates.start+'T12:00:00Z')/1000;
const receipt={receipt_id:1,seller_user_id:1,is_paid:true,created_timestamp:created,subtotal:money(1500),refunds:[{status:'completed',amount:money(200)}],name:'private buyer name',first_line:'private address'};

test('Etsy separates merchandise sales, buyer refunds and card-processing fees without returning buyer records',async()=>{
  const request=async(url,token,options)=>{
    assert.equal(token,config.access_token);assert.equal(options.headers['x-api-key'],config.client_id+':'+config.client_secret);
    const u=new URL(url);
    if(u.pathname.endsWith('/receipts/1/payments'))return{count:1,results:[{receipt_id:1,shop_id:Number(SHOP_ID),adjusted_fees:money(30),amount_fees:money(50)}]};
    if(u.pathname.endsWith('/receipts'))return Number(u.searchParams.get('min_created'))===created-43200?{count:1,results:[receipt]}:{count:0,results:[]};
    return{shop_id:Number(SHOP_ID),shop_name:config.shopName,user_id:1,currency_code:'USD'};
  };
  const result=await salesReport(config,dates,request);
  assert.equal(result.metrics.orders,1);assert.equal(result.metrics.salesAmount,15);assert.equal(result.metrics.buyerRefunds,2);assert.equal(result.metrics.processingFees,0.3);
  assert.equal(result.earnings.amount,15);assert.equal(result.earnings.previousAmount,0);assert.equal(result.earnings.basis,'merchandiseSales');
  assert.equal(result.metrics.followers,undefined);assert.equal(result.metrics.profit,undefined);
  for(const privateValue of ['private buyer','private address','private-app-secret','private-access'])assert(!JSON.stringify(result).includes(privateValue));
});

test('Etsy preserves a verified empty period and rejects partial or mixed-currency sales',async()=>{
  const request=async url=>new URL(url).pathname.endsWith('/receipts')?{count:0,results:[]}:{shop_name:config.shopName,user_id:1,currency_code:'USD'};
  assert.equal((await salesReport(config,dates,request)).metrics.salesAmount,0);
  const bad=await salesReport(config,dates,async url=>new URL(url).pathname.endsWith('/receipts')?{count:1,results:[]}:{shop_name:config.shopName,user_id:1,currency_code:'USD'});
  assert.equal(bad.status,'unavailable');assert.equal(bad.metrics.salesAmount,undefined);
  const mixed=await salesReport(config,dates,async url=>new URL(url).pathname.endsWith('/receipts')?{count:1,results:[{...receipt,subtotal:{...money(1000),currency_code:'EUR'}}]}:{shop_name:config.shopName,user_id:1,currency_code:'USD'});
  assert.equal(mixed.status,'unavailable');
  assert.equal((await salesReport({...config,scope:'transactions_r transactions_w'},dates,request)).status,'unavailable');
});

test('Etsy keeps sales usable when processing-fee or refund status is unavailable',async()=>{
  const result=await salesReport(config,dates,async url=>{
    const u=new URL(url);if(u.pathname.endsWith('/payments'))throw Error('unavailable');
    if(u.pathname.endsWith('/receipts'))return Number(u.searchParams.get('min_created'))===created-43200?{count:1,results:[{...receipt,refunds:[{amount:money(200),status:'processing'}]}]}:{count:0,results:[]};
    return{shop_name:config.shopName,user_id:1,currency_code:'USD'};
  });
  assert.equal(result.metrics.salesAmount,15);assert.equal(result.metrics.processingFees,null);assert.equal(result.metrics.buyerRefunds,null);
});

test('Etsy authorization validates state, one-time claim, exact read scope and pinned owner before saving',async()=>{
  const state='approved-one-time-state',now=Date.now(),pending={...config,oauth:{redirectUri:REDIRECT,stateHash:crypto.createHash('sha256').update(state).digest('hex'),verifier:'private-pkce',expiresAt:now+60000}};
  let claimed=0,saved;
  const send=async url=>url.endsWith('/oauth/token')?{access_token:'1.new-access',refresh_token:'1.new-refresh',expires_in:3600}:url.endsWith('/scopes')?{scopes:['transactions_r']}:{shop_id:Number(SHOP_ID),shop_name:config.shopName,user_id:1};
  await assert.rejects(()=>complete(pending,{state:'wrong',code:'private-code'},{claim:()=>{throw Error('must not claim');},send,save:()=>{throw Error('must not save');}}));
  await complete(pending,{state,code:'private-code'},{claim:async()=>{if(claimed++)throw Error('replay');},send,save:async connection=>{saved=connection;},now:()=>now});
  assert.equal(saved.scope,'transactions_r');assert.equal(saved.oauth,undefined);assert.equal(saved.shopName,config.shopName);
  await assert.rejects(()=>complete(pending,{state,code:'private-code'},{claim:async()=>{throw Error('replay');},send:()=>{throw Error('must not exchange twice');}}));
  await assert.rejects(()=>complete(pending,{state,code:'private-code'},{claim:async()=>{},send:async url=>url.endsWith('/scopes')?{scopes:['transactions_r','transactions_w']}:send(url),save:()=>{throw Error('must not save broader access');}}));
});

test('Etsy refresh is shared and cannot use rotated credentials before their private save succeeds',async()=>{
  let reads=0,writes=0,requests=0;
  const get=connectionManager({read:async()=>{reads++;return{...config,expiresAt:0};},write:async value=>{writes++;assert.equal(value.scope,'transactions_r');},send:async url=>{requests++;return url.endsWith('/scopes')?{scopes:['transactions_r']}:{access_token:'1.new-access',refresh_token:'1.new-refresh',expires_in:3600};}});
  const[a,b]=await Promise.all([get(),get()]);assert.equal(a,b);assert.equal(reads,1);assert.equal(writes,1);assert.equal(requests,2);
  const failure=connectionManager({read:async()=>({...config,expiresAt:0}),write:async()=>{throw Error('cannot persist');},send:async url=>url.endsWith('/scopes')?{scopes:['transactions_r']}:{access_token:'1.new-access',refresh_token:'1.new-refresh',expires_in:3600}});
  await assert.rejects(()=>failure());
});
