import test from "node:test";import assert from "node:assert/strict";
import {questions} from "../questions.js";import {scoreAnswer,calculateResults,validateCompleteAnswers,referenceScore} from "../lib/scoring.js";import {getBand} from "../lib/bands.js";
test("banco válido e identidades coerentes",()=>{assert.equal(questions.length,119);assert.equal(questions.filter(q=>q.group==="mbl").length,14);assert.equal(new Set(questions.map(q=>q.id)).size,119);});
test("curvas especiais preservadas",()=>{assert.equal(referenceScore(questions[8]),4);assert.equal(referenceScore(questions[105]),5);assert.equal(scoreAnswer(questions[5],4),-3);assert.equal(scoreAnswer(questions[18],0),8);assert.equal(scoreAnswer(questions[118],0),5);});
test("respostas moderadas alinhadas equivalem a 100%",()=>{const a=Object.fromEntries(questions.map(q=>[q.id,q.dir===1?1:5]));const r=calculateResults(a);assert.equal(r.missao.percent,100);assert.equal(r.mbl.percent,100);assert.ok(validateCompleteAnswers(a));});
test("não sei exclui numerador e denominador",()=>{const a=Object.fromEntries(questions.map(q=>[q.id,7]));a[1]=3;const r=calculateResults(a);assert.equal(r.missao.valid,1);assert.equal(r.missao.unknown,118);assert.equal(r.missao.percent,0);assert.equal(r.mbl.percent,null);});
test("sem limite artificial em 100%",()=>{const a=Object.fromEntries(questions.map(q=>[q.id,q.dir===1?0:6]));const r=calculateResults(a);assert.ok(r.missao.percent>100);});
test("faixas cobrem porcentagens fracionárias",()=>{for(const n of [-80,0,9.8,24.5,49.3,75.9,89.7,100.4,110.4,135])assert.ok(getBand(n));});
