// Native Vercel Blob, not a relational database.
// One immutable private object per opt-in participation. No identifiers in pathnames.
import { list, put, del } from "@vercel/blob";

export const PREFIX="quiz-participations/v1/";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SCORE=/^m(-?\d+)_([0-9]+)-b(-?\d+)_([0-9]+)\.json$/;

export function blobAvailable(){return Boolean(process.env.BLOB_STORE_ID||process.env.BLOB_READ_WRITE_TOKEN);}

export function validAttemptId(id){return typeof id==="string"&&UUID.test(id);}

export function resultPath(attemptId,results){
  const {missao,mbl}=results;
  if(!validAttemptId(attemptId))throw new Error("Attempt ID inválido");
  return PREFIX+attemptId+"/m"+missao.points+"_"+missao.reference+"-b"+mbl.points+"_"+mbl.reference+".json";
}

export function scoreFromPath(pathname){
  if(!pathname.startsWith(PREFIX))return null;
  const remainder=pathname.slice(PREFIX.length),pieces=remainder.split("/");
  if(pieces.length!==2||!validAttemptId(pieces[0]))return null;
  const matched=pieces[1].match(SCORE);
  if(!matched)return null;
  const [,mp,mr,bp,br]=matched;
  const values=[+mp,+mr,+bp,+br];
  if(values.some(x=>!Number.isSafeInteger(x))||values[1]<0||values[3]<0)return null;
  return {mission:values[1]>0?100*values[0]/values[1]:null,mbl:values[3]>0?100*values[2]/values[3]:null};
}

export async function writeParticipation(attemptId,payload,results){
  const path=resultPath(attemptId,results);
  const content=JSON.stringify({version:1,createdAt:new Date().toISOString(),...payload,results});
  await put(path,content,{access:"private",contentType:"application/json",addRandomSuffix:false});
  return path;
}

export async function participationStats(){
  let cursor=undefined,total=0,missionCount=0,mblCount=0,missionSum=0,mblSum=0;
  let pages=0;
  do{
    const response=await list({prefix:PREFIX,cursor,limit:1000});
    for(const item of response.blobs){
      const values=scoreFromPath(item.pathname);
      if(!values)continue;
      total++;
      if(values.mission!==null){missionCount++;missionSum+=values.mission;}
      if(values.mbl!==null){mblCount++;mblSum+=values.mbl;}
    }
    pages++;
    if(response.hasMore&&!response.cursor)throw new Error("Pagination cursor missing");
    if(response.hasMore&&pages>=30)throw new Error("Participation data exceeds affordable scan capacity");
    cursor=response.hasMore?response.cursor:undefined;
  }while(cursor);
  return {count:total,missao:missionCount?missionSum/missionCount:null,mbl:mblCount?mblSum/mblCount:null,missionRespondents:missionCount,mblRespondents:mblCount};
}

export async function deleteParticipation(attemptId){
  if(!validAttemptId(attemptId))throw new Error("Attempt ID inválido");
  const items=await list({prefix:PREFIX+attemptId+"/",limit:25});
  if(items.hasMore)throw new Error("Unexpected duplicate records");
  for(const item of items.blobs){
    if(scoreFromPath(item.pathname))await del(item.pathname);
  }
  return items.blobs.filter(item=>scoreFromPath(item.pathname)).length;
}
