'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const{membershipReport}=require('../patreon-report');
const{connectionManager,approvedScope}=require('../patreon-connection');
const connection={campaignId:'42',vanity:'AkogareWatchClub',access_token:'private-access'};
const campaign={data:{id:'42',attributes:{vanity:'AkogareWatchClub',patron_count:4}}};
const member=(id,status,amount=0,trial=false)=>({id,attributes:{patron_status:status,currently_entitled_amount_cents:amount,is_free_trial:trial,full_name:'MUST NOT BE RETURNED'}});
test('Patreon aggregates complete paginated memberships without exposing identities, amounts or credentials',async()=>{
 const calls=[];
 const report=await membershipReport(connection,async(url,token,options)=>{
  calls.push(new URL(url));assert.equal(token,'private-access');assert.ok(options.headers['User-Agent']);
  if(!url.includes('/members?'))return campaign;
  const p=new URL(url).searchParams;assert.equal(p.get('fields[member]'),'patron_status,currently_entitled_amount_cents,is_free_trial,campaign_lifetime_support_cents');
  return p.has('page[cursor]')?{data:[member('c','declined_patron'),member('d','former_patron')]}
   :{data:[member('a','active_patron',500),member('b','active_patron',200,true)],meta:{pagination:{cursors:{next:'page2'}}}};
 });
 assert.deepEqual(report.metrics,{patrons:4,paidMembers:1,trialMembers:1,declinedMembers:1});assert.equal(report.status,'connected');
 assert.equal(calls.length,3);assert.equal(report.previous,undefined);assert.deepEqual(report.daily,[]);
 assert.equal(JSON.stringify(report).includes('private-access'),false);assert.equal(JSON.stringify(report).includes('MUST NOT'),false);assert.equal(JSON.stringify(report).includes('500'),false);
});
test('Patreon preserves zero and suppresses incomplete breakdowns, never guessing unavailable history',async()=>{
 const empty=await membershipReport(connection,async url=>url.includes('/members?')?{data:[]}:{data:{...campaign.data,attributes:{...campaign.data.attributes,patron_count:0}}});
 assert.deepEqual(empty.metrics,{patrons:0,paidMembers:0,trialMembers:0,declinedMembers:0});
 const partial=await membershipReport(connection,async url=>url.includes('/members?')?{data:[{id:'a',attributes:{patron_status:'active_patron'}}]}:campaign);
 assert.equal(partial.status,'partial');assert.deepEqual(partial.metrics,{patrons:4});assert.equal(partial.previous,undefined);
});
test('Patreon rejects a mismatched creator, duplicate pages and untrusted next-page links',async()=>{
 await assert.rejects(membershipReport(connection,async()=>({data:{...campaign.data,attributes:{vanity:'SomeoneElse'}}})),/different creator/);
 let pages=0;
 await assert.rejects(membershipReport(connection,async url=>url.includes('/members?')?{data:[member('a','active_patron',100)],meta:{pagination:{cursors:{next:'page'+(++pages)}}}}:campaign),/inconsistent membership/);
 const {isWatchCampaign}=require('../patreon-report');assert.equal(isWatchCampaign({attributes:{url:'https://www.patreon.com/c/AkogareWatchClub/'}}),true);assert.equal(isWatchCampaign({attributes:{url:'https://patreon.com.evil.example/c/AkogareWatchClub'}}),false);
 const partial=await membershipReport(connection,async url=>url.includes('/members?')?{data:[],links:{next:'https://evil.example/steal'}}:campaign);
 assert.equal(partial.status,'partial');assert.deepEqual(partial.metrics,{patrons:4});
});
test('Patreon lifetime support uses campaign currency and includes former members across every page',async()=>{
 const paid=(id,status,cents)=>({...member(id,status),attributes:{...member(id,status).attributes,campaign_lifetime_support_cents:cents}});
 const report=await membershipReport(connection,async url=>{
  if(!url.includes('/members?')){assert.ok(new URL(url).searchParams.get('fields[campaign]').includes('currency'));return{data:{...campaign.data,attributes:{...campaign.data.attributes,currency:'EUR'}}};}
  return new URL(url).searchParams.has('page[cursor]')?{data:[paid('former','former_patron',5000)]}:{data:[paid('active','active_patron',1234)],meta:{pagination:{cursors:{next:'page2'}}}};
 });
 assert.equal(report.currency,'EUR');assert.equal(report.metrics.lifetimeSupportCents,6234);
 assert.equal(report.previous,undefined);assert.deepEqual(report.daily,[]);
 for(const secret of ['MUST NOT','private-access','campaign_lifetime_support_cents','1234','5000'])assert.equal(JSON.stringify(report).includes(secret),false);
});
test('Patreon money preserves known zero and never totals missing, invalid or incomplete payment data',async()=>{
 const currencyCampaign=currency=>({data:{...campaign.data,attributes:{...campaign.data.attributes,currency}}});
 const report=async(amounts,currency='USD',incomplete=false)=>membershipReport(connection,async url=>url.includes('/members?')?{data:amounts.map((amount,i)=>({...member(String(i),'former_patron'),attributes:{patron_status:'former_patron',campaign_lifetime_support_cents:amount}})),...(incomplete?{links:{next:'https://evil.example/'}}:{})}:currencyCampaign(currency));
 assert.equal((await report([0,0])).metrics.lifetimeSupportCents,0);
 assert.equal((await report([])).metrics.lifetimeSupportCents,0);
 for(const amounts of [[undefined],[null],[-1],[1.5],[100,undefined],[Number.MAX_SAFE_INTEGER,1]])assert.equal((await report(amounts)).metrics.lifetimeSupportCents,undefined);
 for(const currency of [null,'','usd','not-a-currency'])assert.equal((await report([100],currency)).metrics.lifetimeSupportCents,undefined);
 assert.equal((await report([100],'USD',true)).metrics.lifetimeSupportCents,undefined);
});
test('Patreon renewals preserve exactly the approved read-only scopes and save rotation before use',async()=>{
 const saved={...connection,client_id:'client',client_secret:'private-client',refresh_token:'old-refresh',scope:'campaigns campaigns.members',expiresAt:0};
 let writes=0,requests=0;const events=[];
 const options={now:()=>1000,read:async()=>saved,write:async value=>{writes++;assert.equal(value.refresh_token,'rotated');events.push('saved');},request:async(url,options)=>{requests++;assert.equal(url,'https://www.patreon.com/api/oauth2/token');assert.equal(options.body.get('refresh_token'),'old-refresh');return{access_token:'renewed',refresh_token:'rotated',scope:'campaigns.members campaigns',expires_in:3600};}};
 const get=connectionManager(options);const[a,b]=await Promise.all([get(),get()]);events.push('used');assert.equal(a,b);assert.deepEqual(events,['saved','used']);assert.equal(writes,1);assert.equal(requests,1);await get();assert.equal(requests,1);
 assert.equal(approvedScope('campaigns campaigns.members campaigns.members[email]'),false);assert.equal(approvedScope('campaigns campaigns.members'),true);assert.equal(approvedScope(['campaigns','campaigns.members']),true);assert.equal(approvedScope(['campaigns','campaigns.members','identity[email]']),false);
 options.request=async()=>({access_token:'bad',refresh_token:'bad',scope:'campaigns campaigns.members w:campaigns.webhook',expires_in:3600});await assert.rejects(connectionManager(options)(),/approved read-only/);
 options.request=async()=>({access_token:'renewed',refresh_token:'rotated',scope:'campaigns campaigns.members',expires_in:3600});options.write=async()=>{throw new Error('storage failed');};await assert.rejects(connectionManager(options)(),/storage failed/);
});

test('server OAuth handoff validates state, expiry, creator and scopes before saving, with an atomic replay claim',async()=>{
 const crypto=require('node:crypto'),{complete,REDIRECT}=require('../patreon-callback');
 const config={client_id:'app',client_secret:'private-client',oauth:{redirectUri:REDIRECT,stateHash:crypto.createHash('sha256').update('random-state').digest('hex'),expiresAt:2000}};
 const events=[];let requests=0,writes=0;
 const dependencies={now:()=>1000,claim:async()=>events.push('claimed'),write:async saved=>{writes++;assert.equal(saved.vanity,'AkogareWatchClub');assert.equal(saved.oauth,undefined);events.push('saved');},request:async(url,token,options)=>{
  requests++;events.push('requested');
  if(url.endsWith('/token')){assert.equal(options.body.get('redirect_uri'),REDIRECT);return{access_token:'private-access',refresh_token:'private-refresh',scope:'campaigns campaigns.members',expires_in:3600};}
  if(url.includes('/members?'))return{data:[]};
  if(url.includes('/campaigns?'))return{data:[campaign.data]};
  return campaign;
 }};
 await assert.rejects(complete(config,{state:'wrong',code:'code'},dependencies),/could not be verified/);assert.equal(requests,0);
 await assert.rejects(complete({...config,oauth:{...config.oauth,expiresAt:999}},{state:'random-state',code:'code'},dependencies),/expired/);assert.equal(requests,0);
 const result=await complete(config,{state:'random-state',code:'code'},dependencies);assert.equal(result.paidMembers,0);assert.equal(writes,1);assert.equal(events[0],'claimed');assert.equal(events.at(-1),'saved');
 dependencies.claim=async()=>{throw new Error('already used');};const before=requests;await assert.rejects(complete(config,{state:'random-state',code:'code'},dependencies),/already used/);assert.equal(requests,before);
});
