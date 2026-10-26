'use strict';

const SOURCE_IDS = ['cafe-youtube','cafe-instagram','cafe-x','cafe-web','watch-youtube','watch-instagram','watch-patreon','pindo-web','pindo-ios','pindo-pinterest','cine-web','cine-ios','cine-youtube','etsy-shop'];
const CHANNELS = { 'cafe-youtube': 'UCP77ij2ue_xEz2f5TmH0Rbw', 'watch-youtube': 'UC6MT4WM8saZSk4B4pt4aFwA', 'cine-youtube': 'UCpilsdPRmwBxCTLxCZmBXDg' };
const INSTAGRAM_IDS = { 'cafe-instagram': '17841443596200565', 'watch-instagram': '28974337878870504' };
const SCOPES = { youtube: 'https://www.googleapis.com/auth/yt-analytics.readonly' };
function range(days, now = new Date()) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 86400000);
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  return { start: start.toISOString().slice(0,10), end: end.toISOString().slice(0,10), startSeconds: Math.floor(start.getTime()/1000), untilSeconds: Math.floor(end.getTime()/1000)+86400 };
}
function safeNumber(value) { return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null; }
function unavailable(note) { return { status: 'unavailable', metrics: {}, daily: [], note }; }
async function jsonRequest(url, token, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20000), headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  let body; try { body = await response.json(); } catch { throw new Error('The provider returned an unreadable report.'); }
  if (!response.ok || body.error || body.errors) {
    // Never include raw provider responses, request URLs, tokens or headers in errors.
    const e = new Error(response.status === 401 || response.status === 403 ? 'This source needs renewed read-only authorization or reporting permission.' : `The provider could not return this report (HTTP ${response.status}).`);
    e.httpStatus = response.status; throw e;
  }
  return body;
}
function reporter(config, dependencies = {}) {
  const tokenPromises = new Map();
  let googleAccess;
  const youtubeConnection = id => config.youtubeReporting?.[id] || config.youtube?.[id];
  async function refreshGoogle(connection, key, client) {
    if (!tokenPromises.has(key)) tokenPromises.set(key, (async () => {
      const body = await jsonRequest('https://oauth2.googleapis.com/token', null, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: client.client_id, client_secret: client.client_secret, refresh_token: connection.refresh_token, grant_type: 'refresh_token' }) });
      if (!body.access_token) throw new Error('Google did not issue reporting access.');
      return body.access_token;
    })());
    return tokenPromises.get(key);
  }
  async function youtubeToken(id) {
    const connection = youtubeConnection(id);
    if (!connection?.refresh_token || connection.channelId !== CHANNELS[id]) throw new Error('The saved YouTube connection does not match this channel.');
    return refreshGoogle(connection, id, config.youtubeReporting?.[id] ? config.googleReportingClient : config.youtubeClient);
  }
  async function youtube(id, dates) {
    const connection = youtubeConnection(id);
    const fallbackId = youtubeConnection('cafe-youtube') ? 'cafe-youtube' : 'watch-youtube';
    const token = await youtubeToken(connection ? id : fallbackId);
    const body = await jsonRequest(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNELS[id]}`, token);
    const stats = body.items?.find(item => item.id === CHANNELS[id])?.statistics;
    if (!stats) throw new Error('YouTube could not find this channel.');
    const report = { status: 'partial', metrics: { followers: stats.hiddenSubscriberCount ? null : safeNumber(stats.subscriberCount), lifetimeViews: safeNumber(stats.viewCount), publishedItems: safeNumber(stats.videoCount) }, daily: [], note: 'Current channel totals are live. Connect YouTube Analytics for views, watch time and growth during the selected period. YouTube subscriber totals may be rounded.' };
    if (String(connection?.scope || '').split(' ').includes(SCOPES.youtube)) {
      const query = (start, end) => {
        const params = new URLSearchParams({ ids: `channel==${CHANNELS[id]}`, startDate: start, endDate: end, dimensions: 'day', metrics: 'views,estimatedMinutesWatched,subscribersGained,subscribersLost,likes,comments', sort: 'day' });
        return jsonRequest(`https://youtubeanalytics.googleapis.com/v2/reports?${params}`, token);
      };
      const parse = data => {
        if (!Array.isArray(data.columnHeaders)) throw new Error('YouTube returned an invalid analytics report.');
        const names = data.columnHeaders.map(h => h.name);
        const rows = (data.rows || []).map(row => Object.fromEntries(names.map((name,i) => [name,row[i]])));
        const sum = key => names.includes(key) && rows.every(row => safeNumber(row[key]) !== null) ? rows.reduce((n,row) => n + safeNumber(row[key]),0) : null;
        const minutes = sum('estimatedMinutesWatched'), gained = sum('subscribersGained'), lost = sum('subscribersLost');
        return { rows, metrics: { views:sum('views'),watchHours:minutes === null ? null : minutes/60,subscribersGained:gained,subscribersLost:lost,netFollowers:gained === null || lost === null ? null : gained-lost,likes:sum('likes'),comments:sum('comments') } };
      };
      let current;
      try { current = parse(await query(dates.start, dates.end)); }
      catch { report.note = 'Current channel totals are live, but the period report could not be loaded. Check the channel reporting authorization; recent reports may still be processing.'; return report; }
      if (dates.start === dates.end && !current.rows.length) {
        report.status = 'connected'; report.connectionState = 'processing';
        report.note = 'YouTube has not returned a report for this day yet. Daily reports can take 48–72 hours to process. Current channel totals are available; missing daily metrics stay unknown.';
        return report;
      }
      Object.assign(report.metrics,current.metrics);
      report.daily = current.rows.map(row => ({ date:row.day,views:safeNumber(row.views) }));
      report.status = 'connected'; report.note = 'YouTube reporting uses Pacific time. Recent days may still be processing.';
      const through = current.rows.map(row => row.day).filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day) && day >= dates.start && day <= dates.end).sort().at(-1);
      if (through) {
        report.reportedThrough = through;
        const days = Math.round((Date.parse(dates.end)-Date.parse(dates.start))/86400000)+1;
        const shift = date => new Date(Date.parse(date+'T00:00:00Z')-days*86400000).toISOString().slice(0,10);
        const comparison = {start:dates.start,end:through,previousStart:shift(dates.start),previousEnd:shift(through),matchedDays:through !== dates.end};
        try {
          const previous = parse(await query(comparison.previousStart, comparison.previousEnd));
          // An empty response cannot prove whether the comparison history is available.
          if (previous.rows.length) { report.previous = previous.metrics; report.comparison = comparison; }
        } catch { /* Keep the current report when comparison history cannot be loaded. */ }
        report.note += ` Reports are available through ${through}. Changes compare the same dates shifted back one selected period.`;
      }
    }
    return report;
  }
  async function instagram(id, dates) {
    const connection = config.instagram?.[id];
    if (!connection) return unavailable('Connect this Instagram professional account for automatic reporting.');
    if (String(connection.id) !== INSTAGRAM_IDS[id]) throw new Error('The saved Instagram connection does not match this account.');
    const base = id === 'cafe-instagram' ? 'https://graph.facebook.com' : 'https://graph.instagram.com';
    if (!/^v\d+\.\d+$/.test(connection.version)) throw new Error('The Instagram API version must be configured.');
    const url = `${base}/${connection.version}/${connection.id}`;
    const profile = await jsonRequest(`${url}?fields=id,username,followers_count,media_count`, connection.access_token);
    if (profile.username !== (id === 'cafe-instagram' ? 'akogarecafe' : 'akogarewatchclub')) throw new Error('Instagram returned a different account.');
    const report = { status: 'partial', metrics: { followers: safeNumber(profile.followers_count), publishedItems: safeNumber(profile.media_count) }, daily: [], note: 'Current profile counts are live. Views, reach and saves need Instagram Insights permission; publishing access alone does not grant it.' };
    const permissions = (connection.permissions || []).map(p => typeof p === 'string' ? p : p.permission);
    if (permissions.some(p => ['instagram_manage_insights','instagram_business_manage_insights'].includes(p))) {
      if ((dates.untilSeconds-dates.startSeconds)>30*86400) { report.note = 'Profile counts are live. Instagram period insights are available here for up to 28 days; choose Last 7 days or Last 28 days.'; return report; }
      const params = new URLSearchParams({ metric:'views',period:'day',metric_type:'total_value',since:String(dates.startSeconds),until:String(dates.untilSeconds) });
      try {
        const insights = await jsonRequest(`${url}/insights?${params}`, connection.access_token);
        const value = safeNumber(insights.data?.find(d => d.name==='views')?.total_value?.value);
        if (value !== null) { report.metrics.views=value;report.status='connected';report.note='Instagram views for the selected period. Profile counts are current snapshots.'; }
      } catch { report.note='Profile counts are live, but Instagram Insights could not be loaded. Renew Insights access to see period views.'; }
    }
    return report;
  }
  async function pinterest(dates) {
    const automatic=config.pinterest?.connectionSecret === 'AKOGARE_PINTEREST_CONNECTION';
    if (!automatic && !config.pinterest?.access_token) return config.pinterest?.approvalStatus === 'pending'
      ? {...unavailable('Your reporting application has been submitted. Pinterest is reviewing access; reports can be connected after approval and read-only authorization.'),connectionState:'pending-review'}
      : unavailable(config.pinterest?.approvalStatus === 'approved' ? 'Pinterest approved the reporting app. Authorize @akogarecafestudio for read-only account analytics to activate reports.' : 'Pinterest @akogarecafestudio is identified. Automatic reporting needs Pinterest read-only API authorization.');
    const connection=automatic ? await (dependencies.pinterestConnection || require('./pinterest-connection').getConnection)() : config.pinterest;
    const token=connection.access_token;
    const profile=await jsonRequest('https://api.pinterest.com/v5/user_account',token);
    if (connection.userId ? String(profile.id)!==String(connection.userId) : profile.username!=='akogarecafestudio') throw new Error('The Pinterest connection does not match the studio account.');
    const query=async(start,end)=>{
      const params=new URLSearchParams({start_date:start,end_date:end,metric_types:'IMPRESSION,OUTBOUND_CLICK,SAVE',content_type:'ORGANIC',source:'YOUR_PINS',split_field:'NO_SPLIT'});
      return jsonRequest(`https://api.pinterest.com/v5/user_account/analytics?${params}`,token);
    };
    const analytics=await query(dates.start,dates.end),report=analytics.all;
    if (!report?.summary_metrics) throw new Error('Pinterest did not provide a complete report.');
    const parse=metrics=>({impressions:safeNumber(metrics.IMPRESSION),outboundClicks:safeNumber(metrics.OUTBOUND_CLICK),saves:safeNumber(metrics.SAVE)});
    const rows=report.daily_metrics||[];
    const ready=(items,start,end)=>items.filter(row=>row.data_status==='READY' && /^\d{4}-\d{2}-\d{2}$/.test(row.date) && row.date>=start && row.date<=end).map(row=>({date:row.date,...parse(row.metrics||{})})).sort((a,b)=>a.date.localeCompare(b.date));
    const daily=ready(rows,dates.start,dates.end);
    if(!daily.length && (dates.start===dates.end || rows.length))return{status:'connected',connectionState:'processing',metrics:{followers:safeNumber(profile.follower_count)},daily:[],note:'Pinterest has not finalized reports for these dates yet. Current followers are available; daily metrics stay unknown until processing finishes.'};
    const totals=items=>Object.fromEntries(['impressions','outboundClicks','saves'].map(key=>[key,items.every(row=>safeNumber(row[key])!==null)?items.reduce((sum,row)=>sum+row[key],0):null]));
    const complete=(items,start,end)=>items.length===Math.round((Date.parse(end)-Date.parse(start))/86400000)+1 && new Set(items.map(row=>row.date)).size===items.length;
    const result={status:'connected',metrics:{followers:safeNumber(profile.follower_count),...(daily.length?totals(daily):parse(report.summary_metrics))},daily,note:'Organic activity on pins created or saved by @akogarecafestudio, in UTC. Pinterest impressions are separate from video views. Only finalized daily metrics are included.'};
    const days=Math.round((Date.parse(dates.end)-Date.parse(dates.start))/86400000)+1;
    const shift=date=>new Date(Date.parse(date+'T00:00:00Z')-days*86400000).toISOString().slice(0,10);
    const through=daily.at(-1)?.date;
    if(through){result.reportedThrough=through;result.note+=` Finalized reports are available through ${through}; ${daily.length} of ${days} selected days are included.`;}
    // Shift the same finalized span back by one selected period. Do not invent
    // a comparison when history has gaps or exceeds Pinterest's 90-day limit.
    const previousStart=shift(dates.start),previousEnd=through?shift(through):null;
    if(through && previousStart>=range(90).start && complete(daily,dates.start,through)){
      try{
        const previous=(await query(previousStart,previousEnd)).all;
        const previousDaily=ready(previous?.daily_metrics||[],previousStart,previousEnd);
        if(complete(previousDaily,previousStart,previousEnd)){
          result.previous=totals(previousDaily);
          result.comparison={start:dates.start,end:through,previousStart,previousEnd,matchedDays:through!==dates.end};
          result.note+=' Changes compare the same finalized dates shifted back one selected period.';
        }
      }catch{/* Current reports remain available without comparison history. */}
    }
    return result;
  }
  async function ga4(id,dates,days){
    const mapping=config.ga4[id];
    if(!/^\d+$/.test(mapping.propertyId)||!/^\d+$/.test(mapping.streamId))throw new Error('The Analytics stream mapping is invalid.');
    const startDate=mapping.startDate||null;
    if(startDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!Number.isFinite(Date.parse(startDate+'T00:00:00Z'))))throw new Error('The Analytics collection start date is invalid.');
    const historyNote=startDate?`This Analytics property started on ${startDate}; earlier traffic is unavailable. `:'';
    if(startDate&&dates.end<startDate)return{status:'connected',connectionState:'collecting',metrics:{},daily:[],note:historyNote+'The first period report will appear after a completed reporting day and provider processing.'};
    if(!googleAccess)googleAccess=config.ga4OAuth?.refresh_token
      ?refreshGoogle(config.ga4OAuth,'ga4',config.googleReportingClient)
      :(async()=>{const{GoogleAuth}=require('google-auth-library');const client=await new GoogleAuth({scopes:['https://www.googleapis.com/auth/analytics.readonly']}).getClient();return(await client.getAccessToken()).token;})();
    const token=await googleAccess;
    const names=['activeUsers','sessions','screenPageViews','newUsers'];
    const expressions=[{filter:{fieldName:'streamId',stringFilter:{matchType:'EXACT',value:mapping.streamId}}},{filter:{fieldName:'platform',stringFilter:{matchType:'EXACT',value:mapping.platform,caseSensitive:false}}}];
    if(mapping.hostname){if(!['akogarecafe.com','movieclub.akogarecafe.com','pindo.akogarecafe.com'].includes(mapping.hostname))throw new Error('The website hostname is not an approved dashboard source.');expressions.push({filter:{fieldName:'hostName',stringFilter:{matchType:'FULL_REGEXP',value:`^(www\\.)?${mapping.hostname.replace(/\./g,'\\.')}$`,caseSensitive:false}}});}
    const run=(startDate,endDate,daily)=>jsonRequest(`https://analyticsdata.googleapis.com/v1beta/properties/${mapping.propertyId}:runReport`,token,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dateRanges:[{startDate,endDate}],metrics:names.map(name=>({name})),dimensionFilter:{andGroup:{expressions}},...(daily?{dimensions:[{name:'date'}],orderBys:[{dimension:{dimensionName:'date'}}]}:{})})});
    const previousStart=new Date(dates.start+'T00:00:00Z');previousStart.setUTCDate(previousStart.getUTCDate()-days);
    const previousEnd=new Date(dates.start+'T00:00:00Z');previousEnd.setUTCDate(previousEnd.getUTCDate()-1);
    const currentStart=startDate&&dates.start<startDate?startDate:dates.start;
    const previousFrom=previousStart.toISOString().slice(0,10);
    const[current,previous,daily]=await Promise.all([run(currentStart,dates.end,false),!startDate||previousFrom>=startDate?run(previousFrom,previousEnd.toISOString().slice(0,10),false):Promise.resolve(null),run(currentStart,dates.end,true)]);
    const parse=row=>Object.fromEntries(names.map((name,i)=>[name,safeNumber(row?.metricValues?.[i]?.value??0)]));
    return{status:'connected',metrics:parse(current.rows?.[0]),...(previous?{previous:parse(previous.rows?.[0])}:{}),daily:(daily.rows||[]).map(row=>{const d=row.dimensionValues[0].value;return{date:`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`,...parse(row)};}),note:`${historyNote}${mapping.platform==='iOS'?'iOS stream only':'Web stream filtered to '+mapping.hostname}. GA4 uses the property reporting timezone. Period active users are deduplicated within this source.`};
  }
  async function patreon(){
    if(config.patreon?.connectionSecret!=='AKOGARE_PATREON_CONNECTION')return unavailable('Akogare Watch Club on Patreon is identified. Authorize its creator account for automatic read-only membership reports.');
    const connection=await(dependencies.patreonConnection || require('./patreon-connection').getConnection)();
    return require('./patreon-report').membershipReport(connection,jsonRequest);
  }
  async function etsy(dates){
    if(config.etsyReporting?.connectionSecret!=='AKOGARE_ETSY_CONNECTION')return require('./etsy-report').missing();
    const connection=await(dependencies.etsyConnection||require('./etsy-connection').getConnection)();
    return require('./etsy-report').salesReport(connection,dates,jsonRequest);
  }
  async function sources(days) {
    const dates=range(days);
    return Object.fromEntries(await Promise.all(SOURCE_IDS.map(async id=>{
      let result;
      try {
        result=CHANNELS[id]?await youtube(id,dates):INSTAGRAM_IDS[id]?await instagram(id,dates):id==='cafe-x'?await require('./x-report').report(config.xReporting):id==='pindo-pinterest'?await pinterest(dates):id==='watch-patreon'?await patreon():id==='etsy-shop'?await etsy(dates):config.ga4?.[id]?await ga4(id,dates,days):unavailable(id.endsWith('-ios')?'Connect the matching iOS stream in Google Analytics for app activity. App Store download reports require App Store Connect reporting access.':'Connect the matching web stream in Google Analytics for traffic and visitors.');
      } catch(e) { result={status:'error',metrics:{},daily:[],error:e.message,note:'The source could not be refreshed. Other sources remain available.'}; }
      if(CHANNELS[id])result.earnings=await require('./youtube-earnings').earningsReport(youtubeConnection(id),CHANNELS[id],dates,()=>youtubeToken(id),jsonRequest);
      if(id==='cine-web'&&config.stripeReporting?.connectionSecret==='AKOGARE_STRIPE_REPORTING_CONNECTION'){try{const connection=await(dependencies.stripeConnection||require('./stripe-connection').getConnection)();result.earnings=await require('./stripe-report').earningsReport(connection,dates,jsonRequest);}catch{result.earnings={status:'unavailable',provider:'stripe',note:'The read-only Stripe reporting connection is unavailable.'};}}
      const automatic = ['connected','partial'].includes(result.status) && (CHANNELS[id] ? Boolean(config.youtubeReporting?.[id]) : id==='pindo-pinterest' ? config.pinterest?.connectionSecret==='AKOGARE_PINTEREST_CONNECTION' : id==='watch-patreon' ? config.patreon?.connectionSecret==='AKOGARE_PATREON_CONNECTION' : id==='etsy-shop' ? config.etsyReporting?.connectionSecret==='AKOGARE_ETSY_CONNECTION' : Boolean(config.ga4?.[id] && config.ga4OAuth?.refresh_token));
      return [id,{...result,...(automatic ? {connectionMode:'automatic'} : {}),fetchedAt:result.fetchedAt||new Date().toISOString()}];
    })));
  }
  return {sources};
}
async function accountCounts(auth, dates) {
  let pageToken, registeredUsers=0, signedInUsers=0, newAccounts=0, creationDatesKnown=true, pages=0;
  do {
    const page=await auth.listUsers(1000,pageToken);
    for(const user of page.users){registeredUsers++;const last=Date.parse(user.metadata?.lastSignInTime);if(last>=dates.startSeconds*1000&&last<dates.untilSeconds*1000)signedInUsers++;const created=Date.parse(user.metadata?.creationTime);if(!Number.isFinite(created))creationDatesKnown=false;else if(created>=dates.startSeconds*1000&&created<dates.untilSeconds*1000)newAccounts++;}
    pageToken=page.pageToken;pages++;
  }while(pageToken&&pages<20);
  return {registeredUsers,signedInUsers,newAccounts:creationDatesKnown&&!pageToken?newAccounts:null,note:pageToken?'Limited to the first 20,000 accounts; counts are partial.':'Registered accounts are current totals. Sign-ins measure authentication activity, not all product usage.'};
}
function allowed(data) { return data && [1,7,28,90].includes(data.days) && Object.keys(data).length===1; }
module.exports={SOURCE_IDS,CHANNELS,range,safeNumber,reporter,accountCounts,allowed};
