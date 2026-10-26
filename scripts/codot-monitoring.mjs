const finite=value=>typeof value==='number'&&Number.isFinite(value);
const thresholds={views:50,watchHours:25,netFollowers:5,sessions:10,activeUsers:5,impressions:100,outboundClicks:5,saves:5,orders:2,salesAmount:10};
const usable=report=>['connected','partial'].includes(report?.status)&&!report.stale;

export function reviewSnapshot(current,previous){
  const issues=[],changes=[];
  const primary=current.periods['28'];
  for(const [id,source] of Object.entries(primary.sources)){
    const old=previous?.periods?.['28']?.sources?.[id];
    if((old&&usable(old)&&!usable(source))||(!old&&['error','stale'].includes(source.status)))issues.push({source:id,kind:'connection',status:source.status,note:source.note});
    if(id.endsWith('-youtube')&&source.reportedThrough&&Date.parse(primary.range.end)-Date.parse(source.reportedThrough)>5*86400000)issues.push({source:id,kind:'report-delay',reportedThrough:source.reportedThrough,note:'More than five completed days are missing; inspect before treating this as a performance drop.'});
  }
  for(const days of ['7','28']){
    for(const [id,source] of Object.entries(current.periods[days].sources)){
      if(!usable(source))continue;
      for(const [metric,minimum] of Object.entries(thresholds)){
        const value=source.metrics?.[metric],baseline=source.previous?.[metric];
        if(!finite(value)||!finite(baseline)||(baseline<0&&metric!=='netFollowers'))continue;
        const delta=value-baseline,percent=baseline>0?100*delta/baseline:null;
        if(Math.abs(delta)<minimum||(percent!==null&&Math.abs(percent)<30))continue;
        const range=current.periods[days].range;
        const shift=date=>new Date(Date.parse(date+'T00:00:00Z')-Number(days)*86400000).toISOString().slice(0,10);
        changes.push({source:id,days:Number(days),metric,current:value,previous:baseline,delta,percent,dates:source.comparison||{...range,previousStart:shift(range.start),previousEnd:shift(range.end)},provisional:id.endsWith('-youtube')});
      }
      const earnings=source.earnings;
      if(earnings?.status==='connected'&&finite(earnings.amount)&&finite(earnings.previousAmount)&&earnings.currency&&earnings.previousStart&&earnings.previousEnd){
        const delta=earnings.amount-earnings.previousAmount,percent=earnings.previousAmount>0?100*delta/earnings.previousAmount:null;
        if(Math.abs(delta)>=(days==='7'?5:10)&&(percent===null||Math.abs(percent)>=30))changes.push({source:id,days:Number(days),metric:'earnings',currency:earnings.currency,current:earnings.amount,previous:earnings.previousAmount,delta,percent,dates:{start:earnings.start,end:earnings.end,previousStart:earnings.previousStart,previousEnd:earnings.previousEnd},provisional:id.endsWith('-youtube')});
      }
    }
  }
  const expiresAt=primary.reader?.expiresAt;
  if(expiresAt&&Date.parse(expiresAt)-Date.parse(current.checkedAt)<14*86400000)issues.push({kind:'reader-expiring',expiresAt});
  return{issues,changes:changes.sort((a,b)=>Math.abs(b.percent||0)-Math.abs(a.percent||0)).slice(0,12),baseline:!previous};
}
