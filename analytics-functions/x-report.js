'use strict';

const USER_ID='1612374960',USERNAME='AkogareCafe_JR';
const count=value=>Number.isSafeInteger(value)&&value>=0?value:null;

// This account is deliberately manual: the owner declined paid API access.
// Reusing a snapshot never turns its observation time into a fresh fetch.
function report(config,now=Date.now()){
  const snapshot=config?.snapshot,at=Date.parse(snapshot?.at);
  if(config?.userId!==USER_ID||config?.username!==USERNAME||!Number.isFinite(at)||at>now+60000||count(snapshot?.followers)===null||count(snapshot?.publishedItems)===null)return{status:'unavailable',connectionState:'snapshot',connectionMode:'manual',metrics:{},daily:[],note:'@AkogareCafe_JR belongs to Akogare Cafe. Its profile has been identified; a verified dated snapshot is not available.'};
  return{
    status:'partial',connectionState:'snapshot',connectionMode:'manual',
    metrics:{followers:snapshot.followers,publishedItems:snapshot.publishedItems},
    daily:[],fetchedAt:new Date(at).toISOString(),
    note:`Profile checked in Chrome on ${new Date(at).toISOString().slice(0,10)}. This is a manually verified snapshot, not a live X connection. Automatic X reports are off to avoid API costs. Impressions, engagement, clicks and earnings are unavailable. Changing the reporting period or refreshing does not update this snapshot.`,
  };
}
module.exports={USER_ID,USERNAME,report};
