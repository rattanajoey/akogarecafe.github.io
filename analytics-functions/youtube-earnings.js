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
async function lifetimeReport(connection,channelId,end,getToken,request){
  if(!String(connection?.scope||'').split(/\s+/).includes(MONETARY_SCOPE)||connection.channelId!==channelId)return{status:'unavailable',note:'The matching read-only YouTube revenue connection is required.'};
  try{
    const token=await getToken();
    const info=await request('https://www.googleapis.com/youtube/v3/channels?'+new URLSearchParams({part:'snippet',id:channelId}),token);
    const published=info.items?.find(item=>item.id===channelId)?.snippet?.publishedAt;
    if(typeof published!=='string'||!Number.isFinite(Date.parse(published)))throw Error('Channel creation unavailable');
    const start=new Date(published).toISOString().slice(0,10);
    if(start>end)throw Error('Channel has no completed reporting day');
    const base={ids:'channel=='+channelId,startDate:start,endDate:end,metrics:'estimatedRevenue',currency:'USD'};
    // Find the last returned revenue day, then request one aggregate row for
    // the entire channel history. Never sum a truncated page of daily rows.
    const latest=await request('https://youtubeanalytics.googleapis.com/v2/reports?'+new URLSearchParams({...base,dimensions:'day',sort:'-day',maxResults:'1'}),token);
    const names=latest.columnHeaders?.map(header=>header.name),day=names?.indexOf('day'),value=names?.indexOf('estimatedRevenue');
    if(day<0||value<0||!Array.isArray(latest.rows)||latest.rows.length>1)throw Error('Invalid daily report');
    const through=latest.rows.length?latest.rows[0][day]:null;
    if(through!==null&&(!/^\d{4}-\d{2}-\d{2}$/.test(through)||through<start||through>end||typeof latest.rows[0][value]!=='number'||!Number.isFinite(latest.rows[0][value])))throw Error('Invalid reporting day');
    const body=await request('https://youtubeanalytics.googleapis.com/v2/reports?'+new URLSearchParams({...base,endDate:through||end}),token);
    const index=body.columnHeaders?.findIndex(header=>header.name==='estimatedRevenue');
    const amount=body.rows?.[0]?.[index];
    if(index>=0&&Array.isArray(body.rows)&&!body.rows.length)return{status:'processing',note:'YouTube has not returned lifetime revenue for this channel. Missing reports stay unknown.'};
    if(index<0||body.rows?.length!==1||typeof amount!=='number'||!Number.isFinite(amount))throw Error('Invalid lifetime total');
    return{status:'connected',amount,currency:'USD',start,...(through?{end:through}:{}),requestedThrough:end,lifetime:true,complete:true,basis:'estimatedRevenue',note:`Estimated YouTube revenue since channel creation. ${through?'Through the latest returned revenue day.':'YouTube returned an aggregate without dated revenue rows; the finalized-through date is unavailable and recent days may be processing.'} Estimates may be adjusted; this is not an AdSense payout balance.`};
  }catch{return{status:'unavailable',note:'Lifetime YouTube revenue could not be verified. Period reports remain separate; missing lifetime earnings stay unknown.'};}
}
module.exports={earningsReport,lifetimeReport,MONETARY_SCOPE};
