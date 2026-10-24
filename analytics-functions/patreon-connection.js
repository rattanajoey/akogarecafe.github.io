'use strict';

const SECRET='projects/ac-movie-club/secrets/AKOGARE_PATREON_CONNECTION';
const SCOPES=['campaigns','campaigns.members'];
const approvedScope=value=>{const scopes=Array.isArray(value)?value:String(value||'').trim().split(/\s+/);return scopes.length===SCOPES.length && SCOPES.every(scope=>scopes.includes(scope));};
function connectionManager({read,write,request,now=Date.now}) {
  let cached,pending;
  return async function connection(){
    if(cached && cached.expiresAt>now()+300000)return cached;
    if(!pending)pending=(async()=>{
      const saved=await read();
      if(!/^\d+$/.test(String(saved.campaignId)) || saved.vanity!=='AkogareWatchClub' || !approvedScope(saved.scope))throw new Error('The saved Patreon page or read-only permissions are invalid.');
      if(saved.access_token && saved.expiresAt>now()+300000){cached=saved;return saved;}
      if(!saved.refresh_token || !saved.client_id || !saved.client_secret)throw new Error('Patreon needs renewed read-only authorization.');
      const token=await request('https://www.patreon.com/api/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Akogare Studio Analytics - Read-only membership reporting'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:saved.refresh_token,client_id:saved.client_id,client_secret:saved.client_secret})});
      if(!token.access_token || !token.refresh_token || !approvedScope(token.scope) || !(Number(token.expires_in)>0))throw new Error('Patreon did not renew the approved read-only connection.');
      const updated={...saved,access_token:token.access_token,refresh_token:token.refresh_token,scope:SCOPES.join(' '),expiresAt:now()+Number(token.expires_in)*1000,refreshedAt:new Date(now()).toISOString()};
      await write(updated);cached=updated;return updated;
    })().finally(()=>{pending=null;});
    return pending;
  };
}
let googleAuth;
async function privateRequest(url,options){
  try{const response=await fetch(url,{...options,signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error();const body=await response.json();if(body.error || body.errors)throw new Error();return body;}
  catch{throw new Error('The private Patreon connection could not be renewed. Reconnect Patreon if access was revoked.');}
}
async function secretRequest(path,options={}){
  if(!googleAuth){const{GoogleAuth}=require('google-auth-library');googleAuth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']});}
  const token=(await(await googleAuth.getClient()).getAccessToken()).token;
  return privateRequest('https://secretmanager.googleapis.com/v1/'+SECRET+path,{...options,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...options.headers}});
}
const getConnection=connectionManager({read:async()=>{const response=await secretRequest('/versions/latest:access');return JSON.parse(Buffer.from(response.payload.data,'base64').toString('utf8'));},write:async config=>{await secretRequest(':addVersion',{method:'POST',body:JSON.stringify({payload:{data:Buffer.from(JSON.stringify(config)).toString('base64')}})});},request:privateRequest});
module.exports={getConnection,connectionManager,approvedScope,SCOPES};
