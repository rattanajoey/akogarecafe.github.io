'use strict';
const functions=require('firebase-functions/v1');
const admin=require('firebase-admin');
const {allowed}=require('./providers');
const {isWorkspaceMember}=require('./authorization');
const app=admin.apps.find(a=>a.name==='[DEFAULT]')||admin.initializeApp();
const reports=require('./report-service').createReportService(admin,app);

exports.projectAnalytics=functions.runWith({secrets:['AKOGARE_ANALYTICS_CONNECTIONS'],timeoutSeconds:60,memory:'512MB',maxInstances:3}).region('us-central1').https.onCall(async(data,context)=>{
  if(!context.auth)throw new functions.https.HttpsError('unauthenticated','Sign in to your Akogare workspace first.');
  if(!allowed(data))throw new functions.https.HttpsError('invalid-argument','Choose a supported reporting period: 1, 7, 28 or 90 days.');
  let config;try{config=JSON.parse(process.env.AKOGARE_ANALYTICS_CONNECTIONS||'');}catch{throw new functions.https.HttpsError('failed-precondition','The private analytics connection is not configured.');}
  const authorized=await isWorkspaceMember(context.auth,config,uid=>admin.auth(app).getUser(uid));
  if(!authorized)throw new functions.https.HttpsError('permission-denied','This account has not been invited to the analytics workspace. Sign out and use your Akogare admin account.');
  // Authorization precedes all cached data access. Only this approved workspace
  // audience shares these reports. Provider tokens never leave the server.
  return reports(config,data.days);
});

// A separate capability cannot sign in to Firebase or any provider. It grants
// only this aggregate endpoint. Its hash/kill switch is read afresh on each call.
exports.codotAnalytics=functions.runWith({secrets:['AKOGARE_ANALYTICS_CONNECTIONS'],timeoutSeconds:60,memory:'512MB',maxInstances:1}).region('us-central1').https.onRequest(require('./codot-reader').handler({reports}));

// The one-time server handoff uses an expiring, creator-approved state and an
// atomic replay claim. Its secret has no pending state after setup completes.
exports.patreonReportingCallback=functions.runWith({secrets:['AKOGARE_PATREON_CONNECTION'],timeoutSeconds:60,memory:'256MB',maxInstances:1}).region('us-central1').https.onRequest(require('./patreon-callback').handler);
exports.etsyReportingCallback=functions.runWith({secrets:['AKOGARE_ETSY_CONNECTION'],timeoutSeconds:60,memory:'256MB',maxInstances:1}).region('us-central1').https.onRequest(require('./etsy-callback').handler);
