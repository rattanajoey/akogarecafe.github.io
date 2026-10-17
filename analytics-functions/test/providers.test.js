'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {range,safeNumber,allowed,accountCounts,reporter}=require('../providers');
test('reporting inputs and missing values are validated',()=>{
  assert.equal(allowed({days:28}),true);assert.equal(allowed({days:29}),false);assert.equal(allowed({days:7,url:'https://example.com'}),false);
  assert.equal(safeNumber(null),null);assert.equal(safeNumber(''),null);assert.equal(safeNumber('0'),0);
  assert.equal(range(7,new Date('2026-01-04T00:00:00Z')).start,'2025-12-28');
});
test('account counts paginate and never return account identities',async()=>{
  const dates=range(7,new Date('2026-10-17T00:00:00Z'));const calls=[];
  const auth={listUsers:async(limit,page)=>{calls.push(page);return page?{users:[{email:'private@example.com',metadata:{lastSignInTime:'2026-10-01T00:00:00Z'}}]}:{users:[{uid:'private-id',metadata:{lastSignInTime:'2026-10-16T23:00:00Z'}}],pageToken:'next'};}};
  const result=await accountCounts(auth,dates);assert.equal(result.registeredUsers,2);assert.equal(result.signedInUsers,1);assert.deepEqual(calls,[undefined,'next']);assert.equal(JSON.stringify(result).includes('private'),false);
});
test('provider failures are independent and do not expose credential or provider errors',async()=>{
  const original=global.fetch;
  global.fetch=async()=>({ok:false,status:403,json:async()=>({error:{message:'private-token-secret'}})});
  try{
    const reports=await reporter({instagram:{'cafe-instagram':{id:'17841443596200565',version:'v26.0',access_token:'private-token-secret'}}}).sources(7);
    assert.equal(reports['cafe-instagram'].status,'error');assert.equal(reports['pindo-web'].status,'unavailable');assert.equal(JSON.stringify(reports).includes('private-token-secret'),false);
  }finally{global.fetch=original;}
});
test('private callable denies anonymous and uninvited accounts before reporting',async()=>{
  const {projectAnalytics}=require('../index');
  await assert.rejects(projectAnalytics.run({days:7},{}),e=>e.code==='unauthenticated');
  const original=process.env.AKOGARE_ANALYTICS_CONNECTIONS;
  process.env.AKOGARE_ANALYTICS_CONNECTIONS=JSON.stringify({allowedEmails:['owner@example.com']});
  try{
    await assert.rejects(projectAnalytics.run({days:7},{auth:{uid:'other',token:{email:'other@example.com',email_verified:true}}}),e=>e.code==='permission-denied');
    await assert.rejects(projectAnalytics.run({days:7},{auth:{uid:'forged',token:{email:'owner@example.com',email_verified:false}}}),e=>e.code==='permission-denied');
  }finally{if(original===undefined)delete process.env.AKOGARE_ANALYTICS_CONNECTIONS;else process.env.AKOGARE_ANALYTICS_CONNECTIONS=original;}
});
test('shared GA4 streams are separated by website hostname and period users are deduplicated',async()=>{
  const{GoogleAuth}=require('google-auth-library');const originalGetClient=GoogleAuth.prototype.getClient;const originalFetch=global.fetch;const requests=[];
  GoogleAuth.prototype.getClient=async()=>({getAccessToken:async()=>({token:'test-google-token'})});
  global.fetch=async(url,options)=>{const body=JSON.parse(options.body);requests.push(body);return{ok:true,json:async()=>({rows:body.dimensions?[{dimensionValues:[{value:'20261015'}],metricValues:[{value:'7'},{value:'8'},{value:'9'},{value:'2'}]},{dimensionValues:[{value:'20261016'}],metricValues:[{value:'8'},{value:'9'},{value:'10'},{value:'2'}]}]:[{metricValues:[{value:'12'},{value:'17'},{value:'19'},{value:'4'}]}]})};};
  try{
    const reports=await reporter({ga4:{'cine-web':{propertyId:'123',streamId:'456',platform:'web',hostname:'movieclub.akogarecafe.com'}}}).sources(7);
    assert.equal(reports['cine-web'].status,'connected');assert.equal(reports['cine-web'].metrics.activeUsers,12);assert.equal(reports['cine-web'].daily.reduce((n,d)=>n+d.activeUsers,0),15);
    assert.equal(requests[0].dimensionFilter.andGroup.expressions.find(e=>e.filter.fieldName==='hostName').filter.stringFilter.value,'^(www\\.)?movieclub\\.akogarecafe\\.com$');
  }finally{GoogleAuth.prototype.getClient=originalGetClient;global.fetch=originalFetch;}
});
test('automatic reports use their own read-only client and share each refresh without changing publishing connections',async()=>{
  const originalFetch=global.fetch;
  const config={
    youtubeClient:{client_id:'publishing-client',client_secret:'publishing-secret'},
    googleReportingClient:{client_id:'reporting-client',client_secret:'reporting-secret'},
    youtube:{'cafe-youtube':{channelId:'UCP77ij2ue_xEz2f5TmH0Rbw',refresh_token:'publishing-cafe'},'watch-youtube':{channelId:'UC6MT4WM8saZSk4B4pt4aFwA',refresh_token:'publishing-watch'}},
    youtubeReporting:{'cafe-youtube':{channelId:'UCP77ij2ue_xEz2f5TmH0Rbw',refresh_token:'reporting-cafe',scope:'https://www.googleapis.com/auth/yt-analytics.readonly'}},
    ga4OAuth:{refresh_token:'reporting-ga4'},
    ga4:{'cafe-web':{propertyId:'123',streamId:'456',platform:'web',hostname:'akogarecafe.com'},'cine-web':{propertyId:'123',streamId:'456',platform:'web',hostname:'movieclub.akogarecafe.com'}},
  };
  const before=JSON.stringify(config),refreshes=[];
  global.fetch=async(url,options)=>{
    let data;
    if(url==='https://oauth2.googleapis.com/token'){
      const body=options.body;refreshes.push({client:body.get('client_id'),refresh:body.get('refresh_token')});
      data={access_token:'access-'+body.get('refresh_token')};
    }else if(url.startsWith('https://www.googleapis.com/youtube/v3/channels')){
      data={items:[{id:new URL(url).searchParams.get('id'),statistics:{subscriberCount:'10',viewCount:'50',videoCount:'3'}}]};
    }else if(url.startsWith('https://youtubeanalytics.googleapis.com')){
      assert.equal(options.headers.Authorization,'Bearer access-reporting-cafe');
      data={columnHeaders:[{name:'day'},{name:'views'},{name:'estimatedMinutesWatched'}],rows:[['2026-10-16',24,120]]};
    }else if(url.startsWith('https://analyticsdata.googleapis.com')){
      assert.equal(options.headers.Authorization,'Bearer access-reporting-ga4');data={rows:[]};
    }else throw new Error('Unexpected provider request');
    return{ok:true,json:async()=>data};
  };
  try{
    const reports=await reporter(config).sources(7);
    assert.equal(reports['cafe-youtube'].status,'connected');assert.equal(reports['cafe-youtube'].metrics.watchHours,2);
    assert.equal(reports['cafe-web'].status,'connected');assert.equal(reports['cine-web'].status,'connected');
    assert.equal(reports['cafe-web'].connectionMode,'automatic');assert.equal(reports['cafe-youtube'].connectionMode,'automatic');assert.equal(reports['watch-youtube'].connectionMode,undefined);
    assert.deepEqual(refreshes.sort((a,b)=>a.refresh.localeCompare(b.refresh)),[{client:'publishing-client',refresh:'publishing-watch'},{client:'reporting-client',refresh:'reporting-cafe'},{client:'reporting-client',refresh:'reporting-ga4'}]);
    assert.equal(JSON.stringify(config),before);
    assert.equal(JSON.stringify(reports).includes('reporting-secret'),false);
  }finally{global.fetch=originalFetch;}
});
test('a YouTube period permission failure preserves fresh public totals and hides provider details',async()=>{
  const originalFetch=global.fetch;
  global.fetch=async(url)=>url.includes('/token')?{ok:true,json:async()=>({access_token:'test-access'})}:url.includes('/channels?')?{ok:true,json:async()=>({items:[{id:new URL(url).searchParams.get('id'),statistics:{subscriberCount:'0',viewCount:'0',videoCount:'0'}}]})}:{ok:false,status:403,json:async()=>({error:{message:'private-provider-details'}})};
  try{
    const reports=await reporter({googleReportingClient:{client_id:'test',client_secret:'test'},youtubeReporting:{'cafe-youtube':{channelId:'UCP77ij2ue_xEz2f5TmH0Rbw',refresh_token:'test-refresh',scope:'https://www.googleapis.com/auth/yt-analytics.readonly'}}}).sources(7);
    assert.equal(reports['cafe-youtube'].status,'partial');assert.equal(reports['cafe-youtube'].metrics.lifetimeViews,0);
    assert.equal(reports['cafe-youtube'].metrics.views,undefined);assert.equal(JSON.stringify(reports).includes('private-provider-details'),false);
  }finally{global.fetch=originalFetch;}
});

test('a new Analytics property does not invent zero traffic before collection starts',async()=>{
  const originalFetch=global.fetch;const calls=[];
  global.fetch=async(url)=>{calls.push(url);throw new Error('Historical traffic should not be requested');};
  try{
    const startDate=new Date().toISOString().slice(0,10);
    const reports=await reporter({ga4OAuth:{refresh_token:'test'},ga4:{'pindo-web':{propertyId:'123',streamId:'456',platform:'web',hostname:'pindo.akogarecafe.com',startDate}}}).sources(7);
    assert.equal(reports['pindo-web'].status,'connected');assert.equal(reports['pindo-web'].connectionMode,'automatic');
    assert.deepEqual(reports['pindo-web'].metrics,{});assert.deepEqual(reports['pindo-web'].daily,[]);
    assert.match(reports['pindo-web'].note,/earlier traffic is unavailable/);assert.equal(calls.length,0);
  }finally{global.fetch=originalFetch;}
});
test('new Analytics collection keeps available traffic but suppresses unavailable history comparisons',async()=>{
  const{GoogleAuth}=require('google-auth-library');const originalGetClient=GoogleAuth.prototype.getClient,originalFetch=global.fetch;const requests=[];
  GoogleAuth.prototype.getClient=async()=>({getAccessToken:async()=>({token:'test-google-token'})});
  global.fetch=async(url,options)=>{const body=JSON.parse(options.body);requests.push(body);return{ok:true,json:async()=>({rows:body.dimensions?[]:[{metricValues:[{value:'2'},{value:'3'},{value:'4'},{value:'2'}]}]})};};
  try{
    const startDate=range(7).end;
    const reports=await reporter({ga4:{'pindo-web':{propertyId:'123',streamId:'456',platform:'web',hostname:'pindo.akogarecafe.com',startDate}}}).sources(7);
    assert.equal(reports['pindo-web'].metrics.sessions,3);assert.equal(reports['pindo-web'].previous,undefined);
    assert.equal(requests.length,2);assert.equal(requests.every(r=>r.dateRanges[0].startDate===startDate),true);
  }finally{GoogleAuth.prototype.getClient=originalGetClient;global.fetch=originalFetch;}
});
