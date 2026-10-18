import { blobAvailable, writeParticipation, validAttemptId } from "../lib/blob-store.js";
import { calculateResults, validateCompleteAnswers } from "../lib/scoring.js";

const identityKinds=new Set(["anonymous","x","instagram","name"]);

export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Método não permitido"});}
  if(!blobAvailable())return res.status(503).json({saved:false,error:"Vercel Blob privado ainda não conectado"});
  const origin=req.headers.origin;
  if(origin){try{if(new URL(origin).host!==req.headers.host)return res.status(403).json({error:"Origem inválida"});}catch{return res.status(403).json({error:"Origem inválida"});}}
  try{
    const data=typeof req.body==="string"?JSON.parse(req.body):req.body;
    if(JSON.stringify(data||{}).length>12000)return res.status(413).json({error:"Requisição excedeu limite"});
    if(!data||data.consent!==true||!identityKinds.has(data.identityType)||!validAttemptId(data.attemptId)||!validateCompleteAnswers(data.answers))return res.status(400).json({error:"Participação inválida ou sem consentimento"});
    const identityType=data.identityType;
    const value=String(data.identityValue||"").trim();
    if(identityType!=="anonymous"&&(!value||value.length>60||/[<>\r\n]/.test(value)))return res.status(400).json({error:"Identificador inválido"});
    const identityValue=identityType==="anonymous"?null:value;
    const results=calculateResults(data.answers);
    await writeParticipation(data.attemptId,{identityType,identityValue,consent:true,answers:data.answers},results);
    return res.status(200).json({saved:true,missionPercent:results.missao.percent,mblPercent:results.mbl.percent});
  }catch(error){
    // Retried submissions with the same attemptId must not double-count.
    const message=String(error?.message||"");
    if(/already exists|alreadyexist|BlobAlreadyExists/i.test(message)||error?.name==="BlobAlreadyExistsError")return res.status(200).json({saved:true,duplicate:true});
    console.error("Blob submission error",error?.name||"unknown");
    return res.status(503).json({saved:false,error:"O registro privado está temporariamente indisponível"});
  }
}
