import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,statSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {getBand,missionBands} from "../lib/bands.js";

const expected=[
  {score:30,band:"flerte",name:"renan romântico.jpg"},
  {score:62,band:"metade",name:"cute japa segurando livro amarelo.jpg"},
  {score:83,band:"felinas",name:"Amanda Vettorazo.jpg"},
  {score:95,band:"missionario",name:"Poster onça estilizada.jpg"},
  {score:105,band:"glorioso",name:"Renan com Microfone.jpg"},
  {score:120,band:"conviccao",name:"onça fumando.jpg"}
];
test("six results point to actual tracked JPGs, matching their published URLs",()=>{
  assert.equal(expected.length,6);
  for(const {score,band,name} of expected){
    const entry=getBand(score);
    assert.equal(entry?.id,band);
    const encoded="/results/imagens/"+encodeURIComponent(name);
    assert.equal(entry.image,encoded,band+" image path");
    const path=fileURLToPath(new URL("../results/imagens/"+name,import.meta.url));
    const data=readFileSync(path);
    assert.ok(statSync(path).size>10000,"Empty asset: "+name);
    assert.deepEqual([...data.subarray(0,3)],[255,216,255],"Not a JPEG: "+name);
  }
});
test("every band that has an image uses an existing JPEG",()=>{
  assert.equal(missionBands.filter(x=>x.image).length,6);
  for(const band of missionBands.filter(x=>x.image)){
    assert.match(band.image,/^\/results\/imagens\/.*\.jpg$/);
    const decoded=decodeURIComponent(band.image.slice(1));
    const path=fileURLToPath(new URL("../"+decoded,import.meta.url));
    assert.deepEqual([...readFileSync(path).subarray(0,3)],[255,216,255]);
  }
});
test("band thresholds do not shift after matching images",()=>{
  assert.equal(getBand(9.99).id,"fora-da-onca");
  assert.equal(getBand(24.99).id,"opostos");
  assert.equal(getBand(25).id,"flerte");
  assert.equal(getBand(49.99).id,"flerte");
  assert.equal(getBand(50).id,"metade");
  assert.equal(getBand(75.99).id,"metade");
  assert.equal(getBand(76).id,"felinas");
  assert.equal(getBand(89.99).id,"felinas");
  assert.equal(getBand(90).id,"missionario");
  assert.equal(getBand(100).id,"missionario");
  assert.equal(getBand(101).id,"glorioso");
  assert.equal(getBand(110).id,"glorioso");
  assert.equal(getBand(111).id,"conviccao");
});
