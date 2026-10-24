'use strict';
let cached,until=0;
async function getConnection(){
  if(cached&&Date.now()<until)return cached;
  const{GoogleAuth}=require('google-auth-library');
  const client=await new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']}).getClient();
  const response=await client.request({url:'https://secretmanager.googleapis.com/v1/projects/ac-movie-club/secrets/AKOGARE_STRIPE_REPORTING_CONNECTION/versions/latest:access'});
  const connection=JSON.parse(Buffer.from(response.data.payload.data,'base64').toString('utf8'));
  if(!String(connection.apiKey||'').startsWith('rk_live_'))throw new Error('The dedicated read-only Stripe connection is unavailable.');
  cached=connection;until=Date.now()+300000;return cached;
}
module.exports={getConnection};
