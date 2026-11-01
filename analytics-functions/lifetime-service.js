'use strict';
const {reporter,range}=require('./providers');

function createLifetimeService(makeReporter=reporter,clock=()=>Date.now()){
  let cached,pending;
  return async config=>{
    const day=range(1,new Date(clock())).end;
    if(cached?.day===day&&clock()-cached.at<cached.ttl)return cached.value;
    if(pending)return pending;
    pending=(async()=>{
      const value=await makeReporter(config).lifetimeEarnings();
      const complete=Object.values(value.sources).every(source=>source.status==='connected');
      cached={day,at:clock(),ttl:complete?6*60*60*1000:60000,value};
      return value;
    })();
    try{return await pending;}finally{pending=null;}
  };
}
module.exports={createLifetimeService};
