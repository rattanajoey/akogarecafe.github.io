'use strict';

const SECRET='projects/ac-movie-club/secrets/AKOGARE_PINTEREST_CONNECTION';
const SCOPE='user_accounts:read';

// Refresh tokens rotate. Save each replacement before using the new access token.
// The dedicated secret keeps rotation separate from other providers' settings.
function connectionManager({read,write,request,now=Date.now}) {
  let cached,pending;
  return async function connection() {
    if(cached && cached.expiresAt>now()+300000)return cached;
    if(!pending)pending=(async()=>{
      const saved=await read();
      if(!saved.userId || saved.scope!==SCOPE)throw new Error('The saved Pinterest identity or reporting permissions are invalid.');
      if(saved.access_token && saved.expiresAt>now()+300000){cached=saved;return saved;}
      if(!saved.refresh_token || !saved.client_id || !saved.client_secret)throw new Error('Pinterest needs renewed read-only authorization.');
      const token=await request('https://api.pinterest.com/v5/oauth/token',{
        method:'POST',headers:{Authorization:'Basic '+Buffer.from(saved.client_id+':'+saved.client_secret).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams({grant_type:'refresh_token',refresh_token:saved.refresh_token,scope:SCOPE}),
      });
      if(!token.access_token || !token.refresh_token || token.scope!==SCOPE || !(Number(token.expires_in)>0))throw new Error('Pinterest did not renew the approved read-only connection.');
      const updated={...saved,access_token:token.access_token,refresh_token:token.refresh_token,expiresAt:now()+Number(token.expires_in)*1000,refreshedAt:new Date(now()).toISOString()};
      await write(updated);
      cached=updated;return updated;
    })().finally(()=>{pending=null;});
    return pending;
  };
}

let googleAuth;
async function secretRequest(path,options={}) {
  if(!googleAuth){const{GoogleAuth}=require('google-auth-library');googleAuth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']});}
  const client=await googleAuth.getClient(),token=(await client.getAccessToken()).token;
  return privateRequest('https://secretmanager.googleapis.com/v1/'+SECRET+path,{...options,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...options.headers}});
}
async function privateRequest(url,options) {
  try {
    const response=await fetch(url,{...options,signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error();
    const body=await response.json();if(body.error)throw new Error();return body;
  }catch{throw new Error('The private Pinterest connection could not be renewed. Reconnect Pinterest if access was revoked.');}
}
const getConnection=connectionManager({
  read:async()=>{const saved=await secretRequest('/versions/latest:access');return JSON.parse(Buffer.from(saved.payload.data,'base64').toString('utf8'));},
  write:async config=>{await secretRequest(':addVersion',{method:'POST',body:JSON.stringify({payload:{data:Buffer.from(JSON.stringify(config)).toString('base64')}})});},
  request:privateRequest,
});
module.exports={connectionManager,getConnection};
