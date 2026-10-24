'use strict';

const VANITY='AkogareWatchClub';
function isWatchCampaign(campaign){
  const a=campaign?.attributes;
  if(a?.vanity)return String(a.vanity).toLowerCase()===VANITY.toLowerCase();
  try{const url=new URL(a?.url);return url.protocol==='https:' && ['patreon.com','www.patreon.com'].includes(url.hostname) && ['/akogarewatchclub','/c/akogarewatchclub'].includes(url.pathname.replace(/\/$/,'').toLowerCase());}catch{return false;}
}
async function membershipReport(connection,request) {
  if(!/^\d+$/.test(String(connection.campaignId)) || connection.vanity!==VANITY)throw new Error('The Patreon connection does not match Akogare Watch Club.');
  const base='https://www.patreon.com/api/oauth2/v2/campaigns/'+connection.campaignId;
  const options={headers:{'User-Agent':'Akogare Studio Analytics - Read-only membership reporting'}};
  const query=new URLSearchParams({'fields[campaign]':'name,vanity,url,patron_count'});
  const campaign=(await request(base+'?'+query,connection.access_token,options)).data;
  if(String(campaign?.id)!==String(connection.campaignId) || !isWatchCampaign(campaign))throw new Error('Patreon returned a different creator page.');
  const count=campaign.attributes.patron_count;
  const result={status:'connected',metrics:{patrons:Number.isSafeInteger(count)&&count>=0?count:null},daily:[],note:'Current Patreon membership totals, independent of the selected dates. Paid memberships have active paid access and are not on a free trial. Members are separate from YouTube subscribers and social followers. Earnings, free-member totals and historical growth are not available from this report.'};
  let cursor,paidMembers=0,trialMembers=0,declinedMembers=0,complete=true;
  const seen=new Set(),cursors=new Set();
  for(let page=0;page<20;page++){
    const params=new URLSearchParams({'fields[member]':'patron_status,currently_entitled_amount_cents,is_free_trial','page[count]':'1000'});
    if(cursor)params.set('page[cursor]',cursor);
    const body=await request(base+'/members?'+params,connection.access_token,options);
    if(!Array.isArray(body.data))throw new Error('Patreon did not return a complete membership report.');
    for(const member of body.data){
      if(!member.id || seen.has(member.id))throw new Error('Patreon returned inconsistent membership pages.');
      seen.add(member.id);
      const a=member.attributes;
      if(!a || !Object.hasOwn(a,'patron_status')){complete=false;continue;}
      if(a.patron_status==='declined_patron')declinedMembers++;
      if(a.patron_status==='active_patron'){
        if(a.is_free_trial===true)trialMembers++;
        else if(a.is_free_trial===false && Number.isSafeInteger(a.currently_entitled_amount_cents) && a.currently_entitled_amount_cents>=0){if(a.currently_entitled_amount_cents>0)paidMembers++;}
        else complete=false;
      }
    }
    cursor=body.meta?.pagination?.cursors?.next;
    if(body.links?.next && !cursor){complete=false;break;}
    if(!cursor)break;
    if(cursors.has(cursor))throw new Error('Patreon returned inconsistent membership pages.');
    cursors.add(cursor);
  }
  if(cursor)complete=false;
  if(complete)Object.assign(result.metrics,{paidMembers,trialMembers,declinedMembers});
  else {result.status='partial';result.note+=' The complete member breakdown is currently unavailable; incomplete counts remain unknown.';}
  return result;
}
module.exports={membershipReport,VANITY,isWatchCampaign};
