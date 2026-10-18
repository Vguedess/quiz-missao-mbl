import { blobAvailable, participationStats } from "../lib/blob-store.js";

export default async function handler(req,res){
  if(req.method!=="GET"){res.setHeader("Allow","GET");return res.status(405).json({error:"Método não permitido"});}
  // Cache aggregate results at the edge to conserve Hobby API-operation quotas.
  res.setHeader("Cache-Control","public, s-maxage=900, stale-while-revalidate=1800");
  if(!blobAvailable())return res.status(503).json({available:false,error:"Vercel Blob ainda não conectado"});
  try{
    return res.status(200).json({available:true,...await participationStats()});
  }catch(error){
    console.error("Blob statistics error",error?.name||"unknown");
    return res.status(503).json({available:false,error:"Estatísticas temporariamente indisponíveis"});
  }
}
