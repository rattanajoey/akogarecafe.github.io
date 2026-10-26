import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdir,readFile,writeFile,rename,readdir,unlink,open} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {reviewSnapshot} from './codot-monitoring.mjs';

const root='/Users/rattanajoey/Documents/Codex/Private/akogare-monitor';
const endpoint='https://us-central1-ac-movie-club.cloudfunctions.net/codotAnalytics';
const run=promisify(execFile),now=new Date().toISOString(),day=now.slice(0,10);
const latest=join(root,'latest.json'),lockPath=join(root,'.running');
let lock;
try{
  await mkdir(root,{recursive:true,mode:0o700});
  try{lock=await open(lockPath,'wx',0o600);}catch{throw Error('A monitoring check is already running. Inspect its process before retrying.');}
  await lock.writeFile(JSON.stringify({pid:process.pid,startedAt:now}));
  let previous=null;try{previous=JSON.parse(await readFile(latest,'utf8'));}catch{}
  if(previous?.checkedAt?.slice(0,10)===day&&!process.argv.includes('--refresh')){
    console.log(JSON.stringify({status:'already-checked-today',checkedAt:previous.checkedAt,reports:latest,review:join(root,'review.json')}));
  }else{
    const key=(await run('/usr/bin/python3',[fileURLToPath(new URL('./codot-keychain.py',import.meta.url)),'get'],{maxBuffer:4096})).stdout;
    if(!/^akr_[A-Za-z0-9_-]{43}$/.test(key))throw Error('The dedicated dashboard reader key is invalid.');
    const periods={};
    for(const days of [1,7,28]){
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify({days}),signal:AbortSignal.timeout(75000)});
      if(!response.ok)throw Error(`Dashboard read failed (HTTP ${response.status}); earlier reports have been preserved.`);
      const report=await response.json();
      if(report.schemaVersion!==1||report.reader?.scope!=='analytics:read'||!report.sources||!report.range?.end||!report.fetchedAt)throw Error('The dashboard returned an unsupported report.');
      periods[days]=report;
    }
    const snapshot={checkedAt:new Date().toISOString(),periods},review=reviewSnapshot(snapshot,previous);
    const save=async(path,value)=>{await writeFile(path+'.tmp',JSON.stringify(value,null,2)+'\n',{mode:0o600});await rename(path+'.tmp',path);};
    await save(join(root,day+'.json'),snapshot);await save(latest,snapshot);
    await save(join(root,'review.json'),{checkedAt:now,...review});
    const dated=(await readdir(root)).filter(name=>/^\d{4}-\d{2}-\d{2}\.json$/.test(name)).sort();
    for(const name of dated.slice(0,-90))await unlink(join(root,name));
    console.log(JSON.stringify({status:'checked',checkedAt:now,reports:latest,reviewFile:join(root,'review.json'),...review}));
  }
}catch(error){
  // Do not print child-process errors, request objects, headers or credentials.
  const message=/^(A monitoring|The dedicated|Dashboard read|The dashboard)/.test(error.message)?error.message:'Monitoring could not read the private dashboard. Earlier reports have been preserved; inspect the connection or local Keychain.';
  console.error(JSON.stringify({status:'failed',checkedAt:now,message}));process.exitCode=1;
}finally{if(lock){await lock.close();await unlink(lockPath).catch(()=>{});}}
