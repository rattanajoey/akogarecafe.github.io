'use strict';
const crypto=require('node:crypto');
const{approvedScope,SCOPES}=require('./patreon-connection');
const{membershipReport,isWatchCampaign}=require('./patreon-report');
const REDIRECT='https://us-central1-ac-movie-club.cloudfunctions.net/patreonReportingCallback';
async function complete(config,query,{claim,request,write,now=Date.now}){
 const state=String(query.state||''),hash=crypto.createHash('sha256').update(state).digest('hex');
 if(!state || !config.oauth || config.oauth.redirectUri!==REDIRECT || !Number.isFinite(config.oauth.expiresAt) || config.oauth.expiresAt<now() || !/^[a-f0-9]{64}$/.test(config.oauth.stateHash) || !crypto.timingSafeEqual(Buffer.from(hash),Buffer.from(config.oauth.stateHash)))throw new Error('The Patreon authorization expired or could not be verified.');
 if(query.error || typeof query.code!=='string' || !query.code)throw new Error('Patreon reporting authorization was not completed.');
 await claim(hash);
 const token=await request('https://www.patreon.com/api/oauth2/token',null,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',code:query.code,client_id:config.client_id,client_secret:config.client_secret,redirect_uri:REDIRECT})});
 console.log(JSON.stringify({provider:'patreon',status:'authorization-response',scope:token.scope,hasAccessToken:Boolean(token.access_token),hasRefreshToken:Boolean(token.refresh_token),expiresIn:Number(token.expires_in)||null}));
 if(!token.access_token || !token.refresh_token || !approvedScope(token.scope) || !(Number(token.expires_in)>0))throw new Error('Patreon did not grant exactly the approved read-only permissions.');
 const params=new URLSearchParams({'fields[campaign]':'name,vanity,url,patron_count'});
 const body=await request('https://www.patreon.com/api/oauth2/v2/campaigns?'+params,token.access_token);
 const campaign=Array.isArray(body.data)&&body.data.find(isWatchCampaign);
 if(!campaign)throw new Error('The Patreon account does not own Akogare Watch Club.');
 const connection={client_id:config.client_id,client_secret:config.client_secret,campaignId:campaign.id,vanity:'AkogareWatchClub',scope:SCOPES.join(' '),access_token:token.access_token,refresh_token:token.refresh_token,expiresAt:now()+Number(token.expires_in)*1000,connectedAt:new Date(now()).toISOString()};
 const report=await membershipReport(connection,request);
 if(report.status!=='connected')throw new Error('Patreon did not return a complete membership report.');
 await write(connection);return report.metrics;
}
async function request(url,token,options={}){
 const response=await fetch(url,{...options,signal:AbortSignal.timeout(20000),headers:{'User-Agent':'Akogare Studio Analytics - Read-only membership reporting',...(token?{Authorization:'Bearer '+token}:{}),...options.headers}});
 let body;try{body=await response.json();}catch{throw new Error('Patreon returned an unreadable response.');}
 if(!response.ok || body.error || body.errors)throw new Error('Patreon could not complete this reporting request (HTTP '+response.status+').');return body;
}
let googleAuth;
async function secretAccess(path,options={}){
 if(!googleAuth){const{GoogleAuth}=require('google-auth-library');googleAuth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']});}
 const token=(await(await googleAuth.getClient()).getAccessToken()).token;
 const response=await fetch('https://secretmanager.googleapis.com/v1/projects/ac-movie-club/secrets/AKOGARE_PATREON_CONNECTION'+path,{...options,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('The approved Patreon connection could not be loaded or saved.');return response.json();
}
async function handler(req,res){
 res.set({'Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"});
 if(req.method!=='GET'){res.status(405).send('Method not allowed');return;}
 try{
  const config=await secretAccess('/versions/latest:access').then(body=>JSON.parse(Buffer.from(body.payload.data,'base64').toString('utf8')));
  const metrics=await complete(config,req.query,{
   claim:async hash=>{const admin=require('firebase-admin');await admin.firestore().doc('_studioReportingOAuth/'+hash).create({usedAt:admin.firestore.FieldValue.serverTimestamp()});},
   request,
   write:async connection=>{await secretAccess(':addVersion',{method:'POST',body:JSON.stringify({payload:{data:Buffer.from(JSON.stringify(connection)).toString('base64')}})});},
  });
  console.log(JSON.stringify({provider:'patreon',status:'connected',metrics}));res.redirect(303,'http://localhost:8766/result');
 }catch(e){console.log(JSON.stringify({provider:'patreon',status:'connection-failed',reason:/^(The Patreon|Patreon |The approved)/.test(e.message)?e.message:'The authorization could not be completed.'}));res.status(400).send('Patreon authorization could not finish. Return to the local connection page to restart; no report access is exposed here.');}
}
module.exports={complete,handler,REDIRECT};
