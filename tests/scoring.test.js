import test from "node:test";
import assert from "node:assert/strict";
import { questions } from "../questions.js";
import { scoreAnswer, calculateResults, validateCompleteAnswers, referenceScore } from "../lib/scoring.js";
import { getBand } from "../lib/bands.js";
import { resultPath, scoreFromPath, validAttemptId, PREFIX } from "../lib/blob-store.js";

test("119 afirmações, 105 programáticas, 14 culturais, inclusive a nova cultural #119",()=> {
  assert.equal(questions.length,119);
  assert.equal(questions.filter(q=>q.group==="missao").length,105);
  assert.equal(questions.filter(q=>q.group==="mbl").length,14);
  assert.equal(new Set(questions.map(q=>q.id)).size,119);
  assert.equal(questions[25].dir,-1);
  assert.deepEqual(questions[118],{id:119,text:"Prendeu, Matou?",dir:1,chapter:"Cultura Política",group:"mbl"});
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
  assert.equal(r.missao.valid,14);
  assert.equal(r.mbl.valid,14);
  assert.equal(r.missao.percent,100);
  assert.equal(r.mbl.percent,100);
});
test("não sei exclui e neutro é válido",()=> {
  const a=Object.fromEntries(questions.map(q=>[q.id,7]));
  a[1]=3;
  const r=calculateResults(a);
  assert.equal(r.missao.valid,1);
  assert.equal(r.missao.unknown,118);
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
  assert.deepEqual(Array.from({length:8},(_,choice)=>scoreAnswer(item,choice)),expected);
 }
});
test("as 11 curvas customizadas existentes permanecem inalteradas",()=>{
 const curves={"6":[-10,-5,-4,0,-3,2,4,0],"9":[-4,-2,0,0,2,4,6,0],"19":[8,4,2,0,1,-2,-5,0],"48":[6,4,1,0,-1,-2,-6,0],"49":[-6,-1,0,0,1,2,1,0],"50":[-6,-5,-2,0,-1,2,3,0],"51":[2,2,2,0,1,0,0,0],"57":[5,4,1,0,-1,-2,-4,0],"106":[-10,-6,-4,0,-3,5,10,0],"110":[-5,-4,-2,0,-1,4,8,0],"111":[-6,-3,-1,0,1,3,6,0]};
 for(const [id,expected] of Object.entries(curves)){
  const item=questions.find(q=>q.id===Number(id));
  assert.deepEqual(Array.from({length:8},(_,choice)=>scoreAnswer(item,choice)),expected);
 }
});
