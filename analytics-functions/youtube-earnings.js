'use strict';
const MONETARY_SCOPE='https://www.googleapis.com/auth/yt-analytics-monetary.readonly';
async function earningsReport(connection,channelId,dates,getToken,request){
  if(!String(connection?.scope||'').split(/\s+/).includes(MONETARY_SCOPE))return{status:'unavailable',note:'Additional read-only YouTube revenue permission is needed.'};
  if(connection.channelId!==channelId)return{status:'unavailable',note:'The revenue connection does not match this channel.'};
  try{
    const token=await getToken();
    const query=async(start,end)=>{
      const params=new URLSearchParams({ids:'channel=='+channelId,startDate:start,endDate:end,metrics:'estimatedRevenue',dimensions:'day',sort:'day',currency:'USD'});
      const body=await request('https://youtubeanalytics.googleapis.com/v2/reports?'+params,token);
      const names=body.columnHeaders?.map(h=>h.name),day=names?.indexOf('day'),amount=names?.indexOf('estimatedRevenue');
      if(!Array.isArray(names)||day<0||amount<0||!Array.isArray(body.rows||[]))throw new Error('Invalid report');
      const seen=new Set();
      return(body.rows||[]).map(row=>{
        const date=row[day],value=row[amount];
        if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<start||date>end||seen.has(date)||typeof value!=='number'||!Number.isFinite(value))throw new Error('Invalid report');
        seen.add(date);return{date,value};
      }).sort((a,b)=>a.date.localeCompare(b.date));
    };
    const rows=await query(dates.start,dates.end);
    if(!rows.length)return{status:'processing',currency:'USD',note:'YouTube has not returned revenue for these dates. Missing reports are not zero earnings.'};
    const amount=rows.reduce((sum,row)=>sum+row.value,0);
    if(!Number.isFinite(amount))throw new Error('Invalid total');
    const result={status:'connected',amount,currency:'USD',start:rows[0].date,end:rows.at(-1).date,reportedDays:rows.length,note:'Estimated YouTube revenue in USD for the returned reporting days. Recent days may be delayed and estimates can be adjusted.'};
    const days=Math.round((Date.parse(dates.end)-Date.parse(dates.start))/86400000)+1;
    const shift=date=>new Date(Date.parse(date+'T00:00:00Z')-days*86400000).toISOString().slice(0,10);
    try{
      const previous=await query(shift(result.start),shift(result.end));
      if(previous.length===rows.length&&previous.every((row,i)=>row.date===shift(rows[i].date))){
        const previousAmount=previous.reduce((sum,row)=>sum+row.value,0);
        if(Number.isFinite(previousAmount))Object.assign(result,{previousAmount,previousStart:shift(result.start),previousEnd:shift(result.end)});
      }
    }catch{ /* Current earnings remain usable without matching comparison days. */ }
    return result;
  }catch{return{status:'unavailable',note:'YouTube revenue is unavailable. Check revenue permission and channel monetization; activity reports remain separate.'};}
}
module.exports={earningsReport,MONETARY_SCOPE};
