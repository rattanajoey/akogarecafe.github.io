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
