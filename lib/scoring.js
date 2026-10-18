import { questions,specialScores } from "../questions.js";
export const answerOptions=["Concordo totalmente","Concordo","Concordo parcialmente","Neutro","Discordo parcialmente","Discordo","Discordo totalmente","Não sei"];
const standard=[3,2,1,0,-1,-2,-3,0];
export function scoreAnswer(q,answer){
 if(!Number.isInteger(answer)||answer<0||answer>7)throw new Error("Resposta inválida");
 if(answer===7)return 0;
 return specialScores[q.id]?.[answer]??standard[answer]*q.dir;
}
export function referenceScore(q){return scoreAnswer(q,q.dir===1?1:5);}
export function calculateIndex(answers,scope="missao"){
 let points=0,reference=0,valid=0,unknown=0,missing=0;
 const subset=questions.filter(q=>scope==="missao"||(scope==="mbl"?q.group==="mbl":q.chapter===scope));
 for(const q of subset){
  const a=answers[q.id];
  if(a===undefined||a===null){missing++;continue}
  if(!Number.isInteger(a)||a<0||a>7)throw new Error("Resposta inválida "+q.id);
  if(a===7){unknown++;continue}
  points+=scoreAnswer(q,a);reference+=referenceScore(q);valid++;
 }
 return {points,reference,valid,unknown,missing,total:subset.length,percent:reference?100*points/reference:null};
}
export function validateCompleteAnswers(answers){
 if(!answers||typeof answers!=="object"||Array.isArray(answers))return false;
 return Object.keys(answers).length===questions.length&&questions.every(q=>Number.isInteger(answers[q.id])&&answers[q.id]>=0&&answers[q.id]<=7);
}
export function calculateResults(answers){return {missao:calculateIndex(answers,"missao"),mbl:calculateIndex(answers,"mbl")};}
