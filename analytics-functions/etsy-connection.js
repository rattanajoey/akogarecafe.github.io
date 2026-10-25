'use strict';
const SECRET='projects/ac-movie-club/secrets/AKOGARE_ETSY_CONNECTION';
const SCOPE='transactions_r',SHOP='AkogareCafeStudio';
const approvedScope=value=>{const scopes=Array.isArray(value)?value:String(value||'').trim().split(/\s+/);return scopes.length===1&&scopes[0]===SCOPE;};
async function request(url,token,options={}){
  try{
    const response=await fetch(url,{...options,signal:AbortSignal.timeout(20000),headers:{...(token?{Authorization:'Bearer '+token}:{}),...options.headers}});
    const body=await response.json();if(!response.ok||body.error||body.errors)throw Error();return body;
  }catch{throw new Error('Etsy could not complete the read-only reporting request.');}
}
const headers=config=>({'x-api-key':config.client_id+':'+config.client_secret});
async function verifyScope(config,token,send=request){
  const result=await send('https://openapi.etsy.com/v3/application/scopes',token,{method:'POST',headers:{...headers(config),'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({token})});
  const scopes=Array.isArray(result)?result:result.scopes;
  if(!approvedScope(scopes))throw new Error('Etsy did not grant exactly the approved transaction-read permission.');
}
function connectionManager({read,write,send=request,now=Date.now}){
  let cached,pending;
  return async()=>{
    if(cached&&cached.expiresAt>now()+300000)return cached;
    if(!pending)pending=(async()=>{
      const config=await read();
      if(config.shopName!==SHOP||!/^\d+$/.test(String(config.shopId))||!approvedScope(config.scope))throw new Error('Etsy reporting authorization is incomplete.');
      if(config.access_token&&config.expiresAt>now()+300000){cached=config;return config;}
      if(!config.refresh_token)throw new Error('Etsy needs renewed read-only authorization.');
      const token=await send('https://api.etsy.com/v3/public/oauth/token',null,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',client_id:config.client_id,refresh_token:config.refresh_token})});
      if(!token.access_token||!token.refresh_token||String(token.access_token).split('.')[0]!==String(config.userId)||!(Number(token.expires_in)>0))throw new Error('Etsy could not renew the approved connection.');
      await verifyScope(config,token.access_token,send);
      const updated={...config,access_token:token.access_token,refresh_token:token.refresh_token,scope:SCOPE,expiresAt:now()+Number(token.expires_in)*1000};
      await write(updated);cached=updated;return cached;
    })().finally(()=>{pending=null;});
    return pending;
  };
}
let auth;
async function secretAccess(path,options={}){
  if(!auth){const{GoogleAuth}=require('google-auth-library');auth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']});}
  const token=(await(await auth.getClient()).getAccessToken()).token;
  return request('https://secretmanager.googleapis.com/v1/'+SECRET+path,token,{...options,headers:{'Content-Type':'application/json'}});
}
const read=async()=>{const body=await secretAccess('/versions/latest:access');return JSON.parse(Buffer.from(body.payload.data,'base64').toString('utf8'));};
const write=async config=>secretAccess(':addVersion',{method:'POST',body:JSON.stringify({payload:{data:Buffer.from(JSON.stringify(config)).toString('base64')}})});
const getConnection=connectionManager({read,write});
module.exports={SHOP,SCOPE,approvedScope,verifyScope,headers,request,read,write,getConnection,connectionManager};
