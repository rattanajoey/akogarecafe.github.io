'use strict';
const{SHOP,approvedScope,headers}=require('./etsy-connection');
const SHOP_ID='54363020';
const missing=()=>({status:'unavailable',metrics:{},daily:[],note:'Connect the approved Etsy seller app with transaction-read access for AkogareCafeStudio.'});
async function salesReport(connection,dates,request){
  if(connection?.shopName!==SHOP||String(connection.shopId)!==SHOP_ID||!approvedScope(connection.scope))return missing();
  try{
    const get=(path,params={})=>request('https://openapi.etsy.com/v3/application/'+path+'?'+new URLSearchParams(params),connection.access_token,{headers:headers(connection)});
    const shop=await get('shops/'+SHOP_ID);
    if(shop.shop_name!==SHOP||String(shop.user_id)!==String(connection.userId)||shop.currency_code!==connection.currency)throw Error('Shop mismatch');
    const currency=connection.currency;
    // Etsy Money carries its own divisor and currency. This shop reports USD;
    // reject mixed currencies rather than silently converting or combining.
    const cents=value=>{if(currency!=='USD'||value?.currency_code!==currency||value.divisor!==100||!Number.isSafeInteger(value.amount)||value.amount<0)throw Error('Invalid money');return value.amount;};
    async function total(start,end){
      const since=Date.parse(start+'T00:00:00Z')/1000,until=Date.parse(end+'T00:00:00Z')/1000+86400;
      let expected,orders=0,sales=0,refunds=0,refundsKnown=true;const receipts=[],seen=new Set(),daily=new Map();
      for(let page=0;page<20;page++){
        const body=await get('shops/'+SHOP_ID+'/receipts',{min_created:String(since),max_created:String(until-1),was_paid:'true',sort_on:'created',sort_order:'asc',limit:'100',offset:String(page*100)});
        if(!Number.isSafeInteger(body.count)||body.count<0||!Array.isArray(body.results)||body.results.length>100||(expected!==undefined&&body.count!==expected))throw Error('Incomplete orders');
        expected=body.count;
        for(const receipt of body.results){
          const created=receipt.created_timestamp??receipt.create_timestamp;
          if(!Number.isSafeInteger(receipt.receipt_id)||seen.has(receipt.receipt_id)||String(receipt.seller_user_id)!==String(connection.userId)||receipt.is_paid!==true||!Number.isFinite(created)||created<since||created>=until)throw Error('Invalid order');
          seen.add(receipt.receipt_id);orders++;
          const value=cents(receipt.subtotal);if(!Number.isSafeInteger(sales+value))throw Error('Invalid sales total');sales+=value;
          const date=new Date(created*1000).toISOString().slice(0,10);daily.set(date,(daily.get(date)||0)+value/100);
          if(!Array.isArray(receipt.refunds))refundsKnown=false;
          else for(const refund of receipt.refunds){
            if(!['success','succeeded','completed'].includes(String(refund.status||'').toLowerCase())){refundsKnown=false;continue;}
            try{const value=cents(refund.amount);if(!Number.isSafeInteger(refunds+value))throw Error();refunds+=value;}catch{refundsKnown=false;}
          }
          receipts.push(receipt.receipt_id);
        }
        if(seen.size===expected)break;
        if(!body.results.length||page===19)throw Error('Incomplete orders');
      }
      if(seen.size!==expected)throw Error('Incomplete orders');
      let processingFees=0,feesKnown=receipts.length<=50;
      // Only card-processing fees are represented by Payment.amount_fees.
      // Listing, advertising and other shop charges are not inferred from it.
      if(feesKnown)for(const receiptId of receipts){
        try{
          const body=await get('shops/'+SHOP_ID+'/receipts/'+receiptId+'/payments');
          if(body.count!==1||body.results?.length!==1)throw Error();
          const payment=body.results[0];
          if(String(payment.shop_id)!==SHOP_ID||payment.receipt_id!==receiptId)throw Error();
          const value=cents(payment.adjusted_fees??payment.posted_fees??payment.amount_fees);
          if(!Number.isSafeInteger(processingFees+value))throw Error();processingFees+=value;
        }catch{feesKnown=false;break;}
      }
      return{orders,salesAmount:sales/100,buyerRefunds:refundsKnown?refunds/100:null,processingFees:feesKnown?processingFees/100:null,daily:[...daily].map(([date,salesAmount])=>({date,salesAmount}))};
    }
    const current=await total(dates.start,dates.end),{daily,...metrics}=current;
    const note='Item sales after discounts for paid orders placed in these UTC dates, before refunds and fees; excludes tax and shipping. Card-processing fees and confirmed buyer refunds are separate. Listing, advertising and other shop costs are not included; open Etsy for its complete profit and payment-account report.';
    const result={status:'connected',currency,metrics,daily,note,earnings:{status:'connected',provider:'etsy',basis:'merchandiseSales',amount:metrics.salesAmount,currency,start:dates.start,end:dates.end,note}};
    const days=Math.round((Date.parse(dates.end)-Date.parse(dates.start))/86400000)+1;
    const shift=date=>new Date(Date.parse(date+'T00:00:00Z')-days*86400000).toISOString().slice(0,10);
    try{
      const previous=await total(shift(dates.start),shift(dates.end));
      result.previous={orders:previous.orders,salesAmount:previous.salesAmount,buyerRefunds:previous.buyerRefunds,processingFees:previous.processingFees};
      Object.assign(result.earnings,{previousAmount:previous.salesAmount,previousStart:shift(dates.start),previousEnd:shift(dates.end)});
    }catch{ /* Current sales remain usable if comparison history is unavailable. */ }
    return result;
  }catch{return{status:'unavailable',metrics:{},daily:[],note:'Etsy sales could not be verified. Check the read-only shop connection and complete order history; missing amounts stay unknown.'};}
}
module.exports={salesReport,SHOP_ID,missing};
