'use strict';
const functions=require('firebase-functions/v1');
const admin=require('firebase-admin');
const {range,reporter,accountCounts,allowed}=require('./providers');
const {isWorkspaceMember}=require('./authorization');
const app=admin.apps.find(a=>a.name==='[DEFAULT]')||admin.initializeApp();
const cache=new Map();

exports.projectAnalytics=functions.runWith({secrets:['AKOGARE_ANALYTICS_CONNECTIONS'],timeoutSeconds:60,memory:'512MB',maxInstances:3}).region('us-central1').https.onCall(async(data,context)=>{
  if(!context.auth)throw new functions.https.HttpsError('unauthenticated','Sign in to your Akogare workspace first.');
  if(!allowed(data))throw new functions.https.HttpsError('invalid-argument','Choose a supported reporting period: 1, 7, 28 or 90 days.');
  let config;try{config=JSON.parse(process.env.AKOGARE_ANALYTICS_CONNECTIONS||'');}catch{throw new functions.https.HttpsError('failed-precondition','The private analytics connection is not configured.');}
  const authorized=await isWorkspaceMember(context.auth,config,uid=>admin.auth(app).getUser(uid));
  if(!authorized)throw new functions.https.HttpsError('permission-denied','This account has not been invited to the analytics workspace. Sign out and use your Akogare admin account.');
  // Authorization precedes all cached data access. Only this approved workspace
  // audience shares these reports. Provider tokens never leave the server.
  const key=`${data.days}:${range(data.days).end}`;
  const hit=cache.get(key);if(hit&&Date.now()-hit.at<300000)return hit.value;
  const report=reporter(config);
  const productsPromise=(async()=>{
    const products={};
    const jobs=[['cine',admin.auth(app)]];
    if(config.pindoServiceAccount){
      const pindo=admin.apps.find(a=>a.name==='dashboard-pindo')||admin.initializeApp({credential:admin.credential.cert(config.pindoServiceAccount),projectId:'pindo-patterns-7a4c9f'},'dashboard-pindo');
      jobs.push(['pindo',admin.auth(pindo)]);
    }
    await Promise.all(jobs.map(async([id,auth])=>{try{products[id]=await accountCounts(auth,range(data.days));}catch{products[id]={error:'Firebase account totals are currently unavailable.'};}}));
    return products;
  })();
  const [sources,products]=await Promise.all([report.sources(data.days),productsPromise]);
  const value={sources,products,range:range(data.days),fetchedAt:new Date().toISOString()};
  cache.set(key,{at:Date.now(),value});
  return value;
});

// The one-time server handoff uses an expiring, creator-approved state and an
// atomic replay claim. Its secret has no pending state after setup completes.
exports.patreonReportingCallback=functions.runWith({secrets:['AKOGARE_PATREON_CONNECTION'],timeoutSeconds:60,memory:'256MB',maxInstances:1}).region('us-central1').https.onRequest(require('./patreon-callback').handler);
