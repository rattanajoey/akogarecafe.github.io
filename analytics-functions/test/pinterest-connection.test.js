'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const{connectionManager}=require('../pinterest-connection');
const saved={client_id:'app',client_secret:'private-client',userId:'123',scope:'user_accounts:read',refresh_token:'private-refresh',access_token:'old-access',expiresAt:0};
test('Pinterest refresh rotates securely once, persists before use and reuses valid access',async()=>{
  let writes=0,requests=0,clock=1000;const events=[];
  const connection=connectionManager({now:()=>clock,read:async()=>({...saved}),write:async value=>{writes++;events.push('saved');assert.equal(value.refresh_token,'new-refresh');},request:async(url,options)=>{requests++;assert.equal(url,'https://api.pinterest.com/v5/oauth/token');assert.equal(options.body.get('scope'),'user_accounts:read');assert.equal(options.body.get('refresh_token'),'private-refresh');return{access_token:'new-access',refresh_token:'new-refresh',scope:'user_accounts:read',expires_in:3600};}});
  const[a,b]=await Promise.all([connection(),connection()]);events.push('used');assert.equal(a.access_token,'new-access');assert.equal(a,b);assert.deepEqual(events,['saved','used']);assert.equal(writes,1);assert.equal(requests,1);clock+=1000;assert.equal(await connection(),a);assert.equal(requests,1);
});
test('Pinterest never uses a rotated token whose storage failed, or accepts extra scopes',async()=>{
  let stored=false;
  const options={read:async()=>({...saved}),write:async()=>{stored=true;throw new Error('storage unavailable');},request:async()=>({access_token:'access',refresh_token:'rotated',scope:'user_accounts:read',expires_in:3600})};
  await assert.rejects(connectionManager(options)(),/storage unavailable/);assert.equal(stored,true);
  stored=false;options.request=async()=>({access_token:'access',refresh_token:'rotated',scope:'user_accounts:read pins:write',expires_in:3600});
  await assert.rejects(connectionManager(options)(),/approved read-only/);assert.equal(stored,false);
});
test('valid saved Pinterest access avoids token exchange and requires a pinned account',async()=>{
  let requests=0;const options={now:()=>1000,read:async()=>({...saved,expiresAt:1000000}),write:async()=>assert.fail(),request:async()=>{requests++;}};
  assert.equal((await connectionManager(options)()).access_token,'old-access');assert.equal(requests,0);
  options.read=async()=>({...saved,userId:undefined});await assert.rejects(connectionManager(options)(),/identity/);
});
