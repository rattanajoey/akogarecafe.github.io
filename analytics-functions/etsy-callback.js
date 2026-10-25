'use strict';
const crypto=require('node:crypto');
const{SHOP,SCOPE,verifyScope,headers,request,read,write}=require('./etsy-connection');
const REDIRECT='https://us-central1-ac-movie-club.cloudfunctions.net/etsyReportingCallback';
async function complete(config,query,{claim,send=request,save=write,now=Date.now}){
  const state=typeof query.state==='string'?query.state:'',hash=crypto.createHash('sha256').update(state).digest('hex');
  if(!state||!config.oauth||config.oauth.redirectUri!==REDIRECT||!Number.isFinite(config.oauth.expiresAt)||config.oauth.expiresAt<now()||!/^[a-f0-9]{64}$/.test(config.oauth.stateHash)||!crypto.timingSafeEqual(Buffer.from(hash),Buffer.from(config.oauth.stateHash)))throw Error('Invalid or expired Etsy authorization');
  if(query.error||typeof query.code!=='string'||!query.code)throw Error('Etsy authorization was not completed');
  await claim(hash);
  const token=await send('https://api.etsy.com/v3/public/oauth/token',null,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',client_id:config.client_id,redirect_uri:REDIRECT,code:query.code,code_verifier:config.oauth.verifier})});
  const userId=String(token.access_token||'').split('.')[0];
  if(!/^\d+$/.test(userId)||!token.refresh_token||!(Number(token.expires_in)>0)||userId!==String(config.userId))throw Error('Unexpected Etsy owner identity');
  await verifyScope(config,token.access_token,send);
  const shop=await send('https://openapi.etsy.com/v3/application/users/'+userId+'/shops',token.access_token,{headers:headers(config)});
  if(shop.shop_name!==SHOP||String(shop.shop_id)!==String(config.shopId)||String(shop.user_id)!==userId)throw Error('Etsy shop did not match');
  const connection={client_id:config.client_id,client_secret:config.client_secret,shopId:config.shopId,shopName:SHOP,userId,currency:config.currency,scope:SCOPE,access_token:token.access_token,refresh_token:token.refresh_token,expiresAt:now()+Number(token.expires_in)*1000,connectedAt:new Date(now()).toISOString()};
  await save(connection);return{shopName:SHOP,scope:SCOPE};
}
async function handler(req,res){
  res.set({'Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"});
  if(req.method!=='GET'){res.status(405).send('Method not allowed');return;}
  try{
    const config=await read();
    const result=await complete(config,req.query,{claim:async hash=>{const admin=require('firebase-admin');await admin.firestore().doc('_studioReportingOAuth/'+hash).create({usedAt:admin.firestore.FieldValue.serverTimestamp()});}});
    console.log(JSON.stringify({provider:'etsy',status:'connected',...result}));
    res.redirect(303,'http://localhost:8768/result');
  }catch{console.log(JSON.stringify({provider:'etsy',status:'authorization-not-completed'}));res.status(400).send('Etsy reporting authorization could not finish. Return to the private setup page to restart.');}
}
module.exports={complete,handler,REDIRECT};
