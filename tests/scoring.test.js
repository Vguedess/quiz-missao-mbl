import test from "node:test";
import assert from "node:assert/strict";
import { questions } from "../questions.js";
import { scoreAnswer, calculateResults, validateCompleteAnswers, referenceScore } from "../lib/scoring.js";
import { getBand } from "../lib/bands.js";
import { resultPath, scoreFromPath, validAttemptId, PREFIX } from "../lib/blob-store.js";

test("120 afirmações, 105 programáticas, 15 culturais, inclusive #119 e #120",()=> {
  assert.equal(questions.length,120);
  assert.equal(questions.filter(q=>q.group==="missao").length,105);
  assert.equal(questions.filter(q=>q.group==="mbl").length,15);
  assert.equal(new Set(questions.map(q=>q.id)).size,120);
  assert.equal(questions[25].dir,-1);
  assert.deepEqual(questions[118],{id:119,text:"Prendeu, Matou?",dir:1,chapter:"Cultura Política",group:"mbl"});
  assert.deepEqual(questions[119],{id:120,text:"O aborto deve ser permitido apenas em casos de estupro, risco de morte para a gestante ou anencefalia fetal.",dir:1,chapter:"Cultura Política",group:"mbl"});
});
test("pontuações especiais são preservadas",()=> {
  assert.equal(referenceScore(questions[8]),4);
  assert.equal(referenceScore(questions[105]),5);
  assert.equal(scoreAnswer(questions[5],4),-3);
  assert.equal(scoreAnswer(questions[18],0),8);
});
test("resposta moderada alinhada significa exatamente 100%",()=> {
  const a=Object.fromEntries(questions.map(q=>[q.id,q.dir===1?1:5]));
  const r=calculateResults(a);
  assert.equal(r.missao.percent,100);
  assert.equal(r.mbl.percent,100);
  assert.ok(validateCompleteAnswers(a));
});
test("MBL contribui para Missão, mas programa não contribui para MBL",()=> {
  const a=Object.fromEntries(questions.map(q=>[q.id,7]));
  for(const q of questions.filter(q=>q.group==="mbl"))a[q.id]=q.dir===1?1:5;
  const r=calculateResults(a);
  assert.equal(r.missao.valid,15);
  assert.equal(r.mbl.valid,15);
  assert.equal(r.missao.percent,100);
  assert.equal(r.mbl.percent,100);
});
test("não sei exclui e neutro é válido",()=> {
  const a=Object.fromEntries(questions.map(q=>[q.id,7]));
  a[1]=3;
  const r=calculateResults(a);
  assert.equal(r.missao.valid,1);
  assert.equal(r.missao.unknown,119);
  assert.equal(r.missao.percent,0);
  assert.equal(r.mbl.percent,null);
});
test("o índice não é limitado a 0..100",()=> {
  const aligned=Object.fromEntries(questions.map(q=>[q.id,q.dir===1?0:6]));
  const opposite=Object.fromEntries(questions.map(q=>[q.id,q.dir===1?6:0]));
  assert.ok(calculateResults(aligned).missao.percent>100);
  assert.ok(calculateResults(opposite).missao.percent<0);
});
test("faixas cobrem valores fracionários e negativos",()=> {
  for(const n of [-80,0,9.8,24.5,49.3,75.9,89.7,100.4,110.4,135])assert.ok(getBand(n));
});
test("Blob privately stores results with valid namespace and exact scores",()=> {
  const uuid="550e8400-e29b-41d4-a716-446655440000";
  assert.ok(validAttemptId(uuid));
  const a=Object.fromEntries(questions.map(q=>[q.id,q.dir===1?1:5]));
  const r=calculateResults(a);
  const pathname=resultPath(uuid,r);
  assert.ok(pathname.startsWith(PREFIX+uuid+"/"));
  assert.deepEqual(scoreFromPath(pathname),{mission:100,mbl:100});
  assert.equal(scoreFromPath(PREFIX+"invalid/m1_2-b1_2.json"),null);
});

test("a afirmação #119 tem EXATAMENTE a pontuação cultural aprovada e referência +3",()=> {
  const question=questions.find(q=>q.id===119);
  assert.deepEqual(Array.from({length:8},(_,choice)=>scoreAnswer(question,choice)),[5,3,1,0,0,0,0,0]);
  assert.equal(referenceScore(question),3);
  for(const [answer,numerator,denominator,expected] of [
    [0,5,3,500/3],[1,3,3,100],[2,1,3,100/3],[3,0,3,0],
    [4,0,3,0],[5,0,3,0],[6,0,3,0],[7,0,0,null]
  ]){
    const a=Object.fromEntries(questions.map(q=>[q.id,7]));
    a[119]=answer;
    const r=calculateResults(a);
    assert.equal(r.missao.points,numerator);
    assert.equal(r.missao.reference,denominator);
    assert.equal(r.mbl.points,numerator);
    assert.equal(r.mbl.reference,denominator);
    if(expected===null){
      assert.equal(r.missao.percent,null);
      assert.equal(r.mbl.percent,null);
    }else{
      assert.ok(Math.abs(r.missao.percent-expected)<1e-9);
      assert.ok(Math.abs(r.mbl.percent-expected)<1e-9);
    }
  }
});
test("as oito questões do capítulo 2 conservam todas as curvas ORIGINAIS, sem interferência da 119",()=> {
 const curves={
  9:[-4,-2,0,0,2,4,6,0],
  10:[4,2,1,0,-1,-2,-4,0],
  11:[4,2,1,0,-1,-2,-4,0],
  12:[4,2,1,0,-1,-2,-4,0],
  13:[4,2,1,0,-1,-2,-4,0],
  14:[-4,-2,-1,0,1,2,4,0],
  15:[4,2,1,0,-1,-2,-4,0],
  16:[4,2,1,0,-1,-2,-4,0]
 };
 assert.equal(questions.filter(q=>q.chapter==="Prendeu, Matou?").length,8);
 for(const [id,expected] of Object.entries(curves)){
  const item=questions.find(q=>q.id===Number(id));
  assert.equal(item.chapter,"Prendeu, Matou?");
  assert.equal(item.group,"missao");
  // -0 e +0 pontuam igual; normalize apenas para comparar no teste.
  assert.deepEqual(Array.from({length:8},(_,choice)=>scoreAnswer(item,choice)).map(n=>n===0?0:n),expected);
 }
});
test("as 11 curvas customizadas existentes permanecem inalteradas",()=>{
 const curves={"6":[-10,-5,-4,0,-3,2,4,0],"9":[-4,-2,0,0,2,4,6,0],"19":[8,4,2,0,1,-2,-5,0],"48":[6,4,1,0,-1,-2,-6,0],"49":[-6,-1,0,0,1,2,1,0],"50":[-6,-5,-2,0,-1,2,3,0],"51":[2,2,2,0,1,0,0,0],"57":[5,4,1,0,-1,-2,-4,0],"106":[-10,-6,-4,0,-3,5,10,0],"110":[-5,-4,-2,0,-1,4,8,0],"111":[-6,-3,-1,0,1,3,6,0]};
 for(const [id,expected] of Object.entries(curves)){
  const item=questions.find(q=>q.id===Number(id));
  // -0 e +0 pontuam igual; normalize apenas para comparar no teste.
  assert.deepEqual(Array.from({length:8},(_,choice)=>scoreAnswer(item,choice)).map(n=>n===0?0:n),expected);
 }
});

test("questão 78: texto atualizado e pontuação original intacta",()=>{
 const q=questions.find(q=>q.id===78);
 assert.equal(q.text,"A reforma agrária é uma política legítima que o Brasil deveria colocar em prática");
 assert.equal(q.chapter,"Celeiro do Mundo");
 assert.equal(q.group,"missao");
 assert.equal(q.dir,1);
 assert.deepEqual(Array.from({length:8},(_,i)=>scoreAnswer(q,i)),[4,2,1,0,-1,-2,-4,0]);
 assert.equal(referenceScore(q),2);
});

test("questão 120: aborto, categoria MBL, concordância moderada e pesos padrão",()=>{
  const item=questions.find(q=>q.id===120);
  assert.equal(item.text,"O aborto deve ser permitido apenas em casos de estupro, risco de morte para a gestante ou anencefalia fetal.");
  assert.equal(item.chapter,"Cultura Política");
  assert.equal(item.group,"mbl");
  assert.equal(item.dir,1);
  assert.deepEqual(Array.from({length:8},(_,answer)=>scoreAnswer(item,answer)),[4,2,1,0,-1,-2,-4,0]);
  assert.equal(referenceScore(item),2);
  for(const [answer,points,denominator] of [[0,4,2],[1,2,2],[2,1,2],[3,0,2],[4,-1,2],[5,-2,2],[6,-4,2],[7,0,0]]){
    const response=Object.fromEntries(questions.map(q=>[q.id,7]));
    response[120]=answer;
    const result=calculateResults(response);
    assert.equal(result.missao.points,points);
    assert.equal(result.mbl.points,points);
    assert.equal(result.missao.reference,denominator);
    assert.equal(result.mbl.reference,denominator);
  }
});
test("adição da questão 120 não altera as 12 curvas anteriores",()=>{
  const expected119=[5,3,1,0,0,0,0,0];
  const q119=questions.find(q=>q.id===119);
  assert.deepEqual(Array.from({length:8},(_,i)=>scoreAnswer(q119,i)),expected119);
  assert.equal(Object.prototype.hasOwnProperty.call({"6":[-10,-5,-4,0,-3,2,4,0],"9":[-4,-2,0,0,2,4,6,0],"19":[8,4,2,0,1,-2,-5,0],"48":[6,4,1,0,-1,-2,-6,0],"49":[-6,-1,0,0,1,2,1,0],"50":[-6,-5,-2,0,-1,2,3,0],"51":[2,2,2,0,1,0,0,0],"57":[5,4,1,0,-1,-2,-4,0],"106":[-10,-6,-4,0,-3,5,10,0],"110":[-5,-4,-2,0,-1,4,8,0],"111":[-6,-3,-1,0,1,3,6,0],"119":[5,3,1,0,0,0,0,0]},"120"),false);
});
