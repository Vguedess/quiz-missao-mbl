import { getSql, databaseAvailable } from "../lib/db.js";
import { calculateResults, validateCompleteAnswers } from "../lib/scoring.js";
const kinds=new Set(["anonymous","x","instagram","name"]);
const tokenRE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Método não permitido"});}
  if(!databaseAvailable())return res.status(503).json({saved:false,error:"Banco ainda não configurado"});
  const origin=req.headers.origin;
  if(origin){try{if(new URL(origin).host!==req.headers.host)return res.status(403).json({error:"Origem inválida"});}catch{return res.status(403).json({error:"Origem inválida"});}}
  try{
    const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
    if(JSON.stringify(body||{}).length>12000)return res.status(413).json({error:"Requisição grande demais"});
    if(!body || body.consent!==true || !kinds.has(body.identityType) || !tokenRE.test(body.attemptId||"") || !validateCompleteAnswers(body.answers))return res.status(400).json({error:"Dados inválidos ou consentimento ausente"});
    const identityType=body.identityType,handle=String(body.identityValue||"").trim();
    if(identityType!=="anonymous" && (!handle || handle.length>60 || /[<>\r\n]/.test(handle)))return res.status(400).json({error:"Identificador inválido"});
    const value=identityType==="anonymous"?null:handle;
    const scores=calculateResults(body.answers);
    const sql=getSql();
    const result=await sql`INSERT INTO quiz_results (attempt_id,identity_type,identity_value,consent,answers,mission_points,mission_reference,mission_percent,mbl_points,mbl_reference,mbl_percent,mission_valid,mbl_valid)
      VALUES (${body.attemptId}::uuid,${identityType},${value},true,${JSON.stringify(body.answers)}::jsonb,${scores.missao.points},${scores.missao.reference},${scores.missao.percent},${scores.mbl.points},${scores.mbl.reference},${scores.mbl.percent},${scores.missao.valid},${scores.mbl.valid})
      ON CONFLICT (attempt_id) DO NOTHING RETURNING id`;
    return res.status(200).json({saved:true,duplicate:result.length===0,missionPercent:scores.missao.percent,mblPercent:scores.mbl.percent});
  }catch(error){console.error("submission failed",error?.code||"db-error");return res.status(503).json({saved:false,error:"Não foi possível registrar o resultado"});}
}
