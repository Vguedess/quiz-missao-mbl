import { blobAvailable, deleteParticipation, validAttemptId } from "../lib/blob-store.js";

export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="DELETE"){res.setHeader("Allow","DELETE");return res.status(405).json({error:"Método não permitido"});}
  if(!blobAvailable())return res.status(503).json({deleted:false,error:"Armazenamento não conectado"});
  const origin=req.headers.origin;
  if(origin){try{if(new URL(origin).host!==req.headers.host)return res.status(403).json({deleted:false,error:"Origem inválida"});}catch{return res.status(403).json({deleted:false,error:"Origem inválida"});}}
  try{
    const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
    if(!validAttemptId(body?.attemptId))return res.status(400).json({deleted:false,error:"Identificador de participação inválido"});
    // The unguessable attempt UUID is retained only in the original participant's browser.
    const removed=await deleteParticipation(body.attemptId);
    return res.status(200).json({deleted:true,count:removed});
  }catch(error){
    console.error("Blob delete error",error?.name||"unknown");
    return res.status(503).json({deleted:false,error:"Não foi possível apagar a participação"});
  }
}
