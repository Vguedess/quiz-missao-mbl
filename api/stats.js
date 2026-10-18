import { getSql, databaseAvailable } from "../lib/db.js";
export default async function handler(req,res) {
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="GET"){res.setHeader("Allow","GET");return res.status(405).json({error:"Método não permitido"});}
  if(!databaseAvailable())return res.status(503).json({available:false,error:"Banco ainda não configurado"});
  try{
    const sql=getSql();
    const rows=await sql`SELECT COUNT(*)::int AS total, AVG(mission_percent)::float8 AS mission_average, AVG(mbl_percent)::float8 AS mbl_average FROM quiz_results WHERE mission_percent IS NOT NULL AND mbl_percent IS NOT NULL`;
    const row=rows[0];
    return res.status(200).json({available:true,count:row.total,missao:row.mission_average,mbl:row.mbl_average});
  }catch(error){console.error("statistics query failed",error?.code||"db-error");return res.status(503).json({available:false,error:"Estatísticas temporariamente indisponíveis"});}
}
