import test from "node:test";
import assert from "node:assert/strict";
import { questions } from "../questions.js";
import { scoreAnswer, calculateResults, validateCompleteAnswers, referenceScore } from "../lib/scoring.js";
import { getBand } from "../lib/bands.js";
import { resultPath, scoreFromPath, validAttemptId, PREFIX } from "../lib/blob-store.js";

test("118 aprovadas, 105 programáticas, 13 culturais",()=> {
  assert.equal(questions.length,118);
  assert.equal(questions.filter(q=>q.group==="mbl").length,13);
  assert.equal(new Set(questions.map(q=>q.id)).size,118);
  assert.equal(questions[25].dir,-1);
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
  assert.equal(r.missao.valid,13);
  assert.equal(r.mbl.valid,13);
  assert.equal(r.missao.percent,100);
  assert.equal(r.mbl.percent,100);
});
test("não sei exclui e neutro é válido",()=> {
  const a=Object.fromEntries(questions.map(q=>[q.id,7]));
  a[1]=3;
  const r=calculateResults(a);
  assert.equal(r.missao.valid,1);
  assert.equal(r.missao.unknown,117);
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
