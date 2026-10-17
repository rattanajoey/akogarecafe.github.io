'use strict';

const SOURCE_IDS = ['cafe-youtube','cafe-instagram','cafe-web','watch-youtube','watch-instagram','pindo-web','pindo-ios','pindo-pinterest','cine-web','cine-ios','cine-youtube'];
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
  if (!response.ok || body.error) {
    // Never include raw provider responses, request URLs, tokens or headers in errors.
    const e = new Error(response.status === 401 || response.status === 403 ? 'This source needs renewed read-only authorization or reporting permission.' : `The provider could not return this report (HTTP ${response.status}).`);
    e.httpStatus = response.status; throw e;
  }
  return body;
}
function reporter(config) {
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
      const params = new URLSearchParams({ ids: `channel==${CHANNELS[id]}`, startDate: dates.start, endDate: dates.end, dimensions: 'day', metrics: 'views,estimatedMinutesWatched,subscribersGained,subscribersLost,likes,comments', sort: 'day' });
      let data;
      try { data = await jsonRequest(`https://youtubeanalytics.googleapis.com/v2/reports?${params}`, token); }
      catch { report.note = 'Current channel totals are live, but the period report could not be loaded. Check the channel reporting authorization; recent reports may still be processing.'; return report; }
      if (!Array.isArray(data.columnHeaders)) throw new Error('YouTube returned an invalid analytics report.');
      const names = data.columnHeaders.map(h => h.name);
      const rows = (data.rows || []).map(row => Object.fromEntries(names.map((name,i) => [name,row[i]])));
      const sum = key => rows.reduce((n,row) => n+(safeNumber(row[key]) || 0),0);
      Object.assign(report.metrics,{ views:sum('views'),watchHours:sum('estimatedMinutesWatched')/60,subscribersGained:sum('subscribersGained'),subscribersLost:sum('subscribersLost'),likes:sum('likes'),comments:sum('comments') });
      report.daily = rows.map(row => ({ date:row.day,views:safeNumber(row.views) }));
      report.status = 'connected'; report.note = 'YouTube reporting uses Pacific time. Recent days may still be processing.';
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
    if (!config.pinterest?.access_token) return unavailable('Pinterest @akogarecafestudio is identified. Automatic reporting needs Pinterest read-only API authorization.');
    const token=config.pinterest.access_token;
    const params=new URLSearchParams({start_date:dates.start,end_date:dates.end,metric_types:'IMPRESSION,OUTBOUND_CLICK,SAVE'});
    const [profile,analytics]=await Promise.all([jsonRequest('https://api.pinterest.com/v5/user_account',token),jsonRequest(`https://api.pinterest.com/v5/user_account/analytics?${params}`,token)]);
    if (profile.username !== 'akogarecafestudio') throw new Error('The Pinterest connection does not match the studio account.');
    const report=analytics.all;
    if (!report?.summary_metrics) throw new Error('Pinterest did not provide a complete report.');
    return {status:'connected',metrics:{followers:safeNumber(profile.follower_count),impressions:safeNumber(report.summary_metrics.IMPRESSION),outboundClicks:safeNumber(report.summary_metrics.OUTBOUND_CLICK),saves:safeNumber(report.summary_metrics.SAVE)},daily:[],note:'Pinterest impressions are shown separately from YouTube and Instagram content views.'};
  }
  async function ga4(id,dates,days){
    const mapping=config.ga4[id];
    if(!/^\d+$/.test(mapping.propertyId)||!/^\d+$/.test(mapping.streamId))throw new Error('The Analytics stream mapping is invalid.');
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
    const[current,previous,daily]=await Promise.all([run(dates.start,dates.end,false),run(previousStart.toISOString().slice(0,10),previousEnd.toISOString().slice(0,10),false),run(dates.start,dates.end,true)]);
    const parse=row=>Object.fromEntries(names.map((name,i)=>[name,safeNumber(row?.metricValues?.[i]?.value??0)]));
    return{status:'connected',metrics:parse(current.rows?.[0]),previous:parse(previous.rows?.[0]),daily:(daily.rows||[]).map(row=>{const d=row.dimensionValues[0].value;return{date:`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`,...parse(row)};}),note:`${mapping.platform==='iOS'?'iOS stream only':'Web stream filtered to '+mapping.hostname}. GA4 uses the property reporting timezone. Period active users are deduplicated within this source.`};
  }
  async function sources(days) {
    const dates=range(days);
    return Object.fromEntries(await Promise.all(SOURCE_IDS.map(async id=>{
      let result;
      try {
        result=CHANNELS[id]?await youtube(id,dates):INSTAGRAM_IDS[id]?await instagram(id,dates):id==='pindo-pinterest'?await pinterest(dates):config.ga4?.[id]?await ga4(id,dates,days):unavailable(id.endsWith('-ios')?'Connect the matching iOS stream in Google Analytics for app activity. App Store download reports require App Store Connect reporting access.':'Connect the matching web stream in Google Analytics for traffic and visitors.');
      } catch(e) { result={status:'error',metrics:{},daily:[],error:e.message,note:'The source could not be refreshed. Other sources remain available.'}; }
      const automatic = ['connected','partial'].includes(result.status) && (CHANNELS[id] ? Boolean(config.youtubeReporting?.[id]) : Boolean(config.ga4?.[id] && config.ga4OAuth?.refresh_token));
      return [id,{...result,...(automatic ? {connectionMode:'automatic'} : {}),fetchedAt:new Date().toISOString()}];
    })));
  }
  return {sources};
}
async function accountCounts(auth, dates) {
  let pageToken, registeredUsers=0, signedInUsers=0, pages=0;
  do {
    const page=await auth.listUsers(1000,pageToken);
    for(const user of page.users){registeredUsers++;const last=Date.parse(user.metadata?.lastSignInTime);if(last>=dates.startSeconds*1000&&last<dates.untilSeconds*1000)signedInUsers++;}
    pageToken=page.pageToken;pages++;
  }while(pageToken&&pages<20);
  return {registeredUsers,signedInUsers,note:pageToken?'Limited to the first 20,000 accounts; counts are partial.':'Registered accounts are current totals. Sign-ins measure authentication activity, not all product usage.'};
}
function allowed(data) { return data && [7,28,90].includes(data.days) && Object.keys(data).length===1; }
module.exports={SOURCE_IDS,CHANNELS,range,safeNumber,reporter,accountCounts,allowed};
