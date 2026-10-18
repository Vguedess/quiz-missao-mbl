import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=readFileSync(new URL("../styles.css",import.meta.url),"utf8");
const ui=readFileSync(new URL("../share.js",import.meta.url),"utf8");
const app=readFileSync(new URL("../app.js",import.meta.url),"utf8");
test("the main result card uses neutral naming to avoid social-share cosmetic filters",()=>{
 assert.match(html,/class="affinity-section"/);
 assert.match(html,/id="affinityCard"/);
 assert.match(html,/id="affinityBandTitle"/);
 assert.match(html,/id="affinityMissionImage"/);
 assert.doesNotMatch(html,/class="share-section"/);
 assert.match(css,/#result \.affinity-section\{display:block/);
 assert.match(ui,/\$\("affinityMissionImage"\)/);
});
test("result order is title, full photo, score boxes, interpretation, themes",()=>{
 const positions=[
  html.indexOf('id="affinityBandTitle"'),
  html.indexOf('id="affinityMissionImage"'),
  html.indexOf('id="missaoScore"'),
  html.indexOf('id="bandDescription"'),
  html.indexOf('id="chapters"')
 ];
 assert.ok(positions.every(n=>n>=0),String(positions));
 for(let i=1;i<positions.length;i++)assert.ok(positions[i]>positions[i-1],String(positions));
 assert.equal((html.match(/id="chapters"/g)||[]).length,1);
 assert.doesNotMatch(css,/#result \.result-heading,#result \.affinity-intro,#result \.result-editorial\{display:none\}/);
});
test("photo containment and large colored mobile scores",()=>{
 assert.match(css,/#result \.affinity-card-art img\{[^}]*object-fit:contain/);
 assert.match(css,/#result \.result-grid \.score-label\{[^}]*text-align:center/);
 assert.match(css,/#result \.result-grid \.score-value\{[^}]*white-space:nowrap/);
 assert.match(css,/@media\(max-width:740px\)/);
 assert.match(app,/restoreResultTop/);
});
test("result-specific copy still derives from approved range classification",()=>{
 assert.match(ui,/affinityBandTitle"\)\.textContent=band\?\.title/);
 assert.match(app,/bandDescription"\)\.textContent=band\?\.description/);
});
