'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const{earningsReport,ACCOUNT,PRODUCT}=require('../stripe-report');
const connection={apiKey:'rk_live_private',accountId:ACCOUNT,productId:PRODUCT,currency:'USD'},dates={start:'2026-10-01',end:'2026-10-07'};
const products={data:[{id:PRODUCT,livemode:true}],has_more:false};
const txn=(id,type,amount,fee,created)=>({id,type,amount,fee,net:amount-fee,currency:'usd',created,description:'PRIVATE CUSTOMER'});
test('Stripe aggregates complete live payment activity after refunds and fees without payout double counting',async()=>{
 const result=await earningsReport(connection,dates,async(url,key,options)=>{
  assert.equal(key,'rk_live_private');assert.equal(options.method,undefined);
  const u=new URL(url);if(u.pathname.endsWith('/products'))return products;if(u.pathname.endsWith('/balance'))return{livemode:true};
  const time=Number(u.searchParams.get('created[gte]'));
  if(u.searchParams.has('starting_after'))return{data:[txn('txn_2','refund',-400,0,time)],has_more:false};
  return{data:[txn('txn_1','charge',1000,59,time),txn('txn_p','payout',-541,0,time)],has_more:true};
 });
 assert.equal(result.amount,5.41);assert.equal(result.fees,0.59);assert.equal(result.previousAmount,5.41);assert.equal(result.currency,'USD');
 for(const secret of ['PRIVATE CUSTOMER','rk_live_private','txn_1'])assert.equal(JSON.stringify(result).includes(secret),false);
});
test('Stripe verifies the exact product and live restricted connection before returning known zero',async()=>{
 const request=async url=>url.includes('/products?')?products:url.includes('/balance?')?{livemode:true}:{data:[],has_more:false};
 assert.equal((await earningsReport(connection,dates,request)).amount,0);
 for(const patch of [{apiKey:'sk_live_broad'},{apiKey:'rk_test_wrong'},{productId:'other'},{accountId:'other'}])assert.equal((await earningsReport({...connection,...patch},dates,request)).amount,undefined);
 const extra=async url=>url.includes('/products?')?{data:[...products.data,{id:'another-product',livemode:true}],has_more:false}:request(url);
 assert.equal((await earningsReport(connection,dates,extra)).amount,undefined);
});
test('Stripe suppresses incomplete or invalid ledgers instead of displaying partial money',async()=>{
 for(const mode of ['duplicate','currency','invalid','empty-page']){
  const result=await earningsReport(connection,dates,async url=>{
   if(url.includes('/products?'))return products;if(url.includes('/balance?'))return{livemode:true};
   const u=new URL(url),time=Number(u.searchParams.get('created[gte]'));
   const row=txn('txn_one','charge',100,0,time);
   if(mode==='currency')row.currency='eur';if(mode==='invalid')row.net=101;
   return{data:mode==='empty-page'?[]:[row],has_more:mode==='duplicate'||mode==='empty-page'};
  });
  assert.equal(result.amount,undefined);assert.equal(result.status,'unavailable');
 }
});
