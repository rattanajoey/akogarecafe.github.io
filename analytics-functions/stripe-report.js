'use strict';
const ACCOUNT='acct_1U62rMKfAn48i1AY',PRODUCT='prod_V9685GoM7cS2SY';
const PAYMENT_TYPES=new Set(['charge','payment','refund','payment_refund','payment_failure_refund','payment_reversal','refund_failure']);
async function earningsReport(connection,dates,request){
  try{
    if(connection.accountId!==ACCOUNT||connection.productId!==PRODUCT||connection.currency!=='USD'||!String(connection.apiKey||'').startsWith('rk_live_'))throw new Error('Connection mismatch');
    const get=(path,params={})=>request('https://api.stripe.com/v1/'+path+'?'+new URLSearchParams(params),connection.apiKey,{headers:{'Stripe-Version':'2026-07-29.dahlia'}});
    const [products,balance]=await Promise.all([get('products',{limit:'100'}),get('balance')]);
    // Account-level payment activity belongs to CineClub only while every
    // live or archived product is the verified Cafe Regular product.
    if(products.has_more!==false||!Array.isArray(products.data)||products.data.length!==1||products.data[0].id!==PRODUCT||products.data[0].livemode!==true||balance.livemode!==true)throw new Error('Product mapping needs review');
    const total=async(start,end)=>{
      const since=Date.parse(start+'T00:00:00Z')/1000,until=Date.parse(end+'T00:00:00Z')/1000+86400;
      let cursor,amount=0,fees=0;const seen=new Set();
      for(let page=0;page<20;page++){
        const body=await get('balance_transactions',{limit:'100','created[gte]':String(since),'created[lt]':String(until),...(cursor?{starting_after:cursor}:{})});
        if(!Array.isArray(body.data)||typeof body.has_more!=='boolean')throw new Error('Incomplete ledger');
        for(const row of body.data){
          if(typeof row.id!=='string'||seen.has(row.id)||!Number.isFinite(row.created)||row.created<since||row.created>=until)throw new Error('Inconsistent ledger');
          seen.add(row.id);
          if(!PAYMENT_TYPES.has(row.type))continue;
          if(row.currency!=='usd'||![row.amount,row.fee,row.net].every(Number.isSafeInteger)||row.net!==row.amount-row.fee||!Number.isSafeInteger(amount+row.net)||!Number.isSafeInteger(fees+row.fee))throw new Error('Invalid payment total');
          amount+=row.net;fees+=row.fee;
        }
        if(!body.has_more)return{amount:amount/100,fees:fees/100};
        cursor=body.data.at(-1)?.id;if(!cursor)throw new Error('Incomplete ledger');
      }
      throw new Error('Incomplete ledger');
    };
    const current=await total(dates.start,dates.end);
    const result={status:'connected',...current,currency:'USD',start:dates.start,end:dates.end,provider:'stripe',note:'Stripe account payments minus refunds and transaction fees, by completed UTC dates. The verified product catalog contains only CineClub Cafe Regular; this is an account-level report. Payouts and other account adjustments are excluded; this is payment activity, not business profit. Website and iOS memberships paid on the website are counted once.'};
    const days=Math.round((Date.parse(dates.end)-Date.parse(dates.start))/86400000)+1;
    const shift=date=>new Date(Date.parse(date+'T00:00:00Z')-days*86400000).toISOString().slice(0,10);
    try{const previous=await total(shift(dates.start),shift(dates.end));Object.assign(result,{previousAmount:previous.amount,previousStart:shift(dates.start),previousEnd:shift(dates.end)});}catch{ /* Preserve current earnings if comparison history cannot be read. */ }
    return result;
  }catch{return{status:'unavailable',provider:'stripe',note:'Stripe earnings could not be verified. Check the read-only connection, product mapping and complete payment history; missing amounts stay unknown.'};}
}
module.exports={earningsReport,ACCOUNT,PRODUCT};
