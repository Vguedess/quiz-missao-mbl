import {questions, specialScores} from "./questions.js";
const labels=["Concordo totalmente","Concordo","Concordo parcialmente","Neutro","Discordo parcialmente","Discordo","Discordo totalmente","Não sei"];
const base=[4,2,1,0,-1,-2,-4,0];
const KEY="radar-ideias-v1";
const MOBILE_QUERY="(max-width: 740px) and (pointer: coarse)";
const MOBILE_PREF_KEY="radar-ideias-mobile-auto";
let autoAdvance=true;
let advanceTimer=null;
try{autoAdvance=localStorage.getItem(MOBILE_PREF_KEY)!=="false"}catch{}
function clearAdvance(){if(advanceTimer!==null){clearTimeout(advanceTimer);advanceTimer=null}}
function shouldAutoAdvance(){return autoAdvance&&window.matchMedia(MOBILE_QUERY).matches}
function goTop(){window.scrollTo({top:0,behavior:"instant"})}
let state={order:[],answers:{},cursor:0,phase:"landing"};
const $=id=>document.getElementById(id);
function shuffle(){const a=questions.map(q=>q.id);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function load(){try{const data=JSON.parse(localStorage.getItem(KEY)||"null");if(data&&Array.isArray(data.order)&&data.order.length===118&&new Set(data.order).size===118&&typeof data.answers==="object"&&Number.isInteger(data.cursor)&&data.cursor>=0&&data.cursor<118&&["landing","quiz","result"].includes(data.phase))state=data}catch{}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function reveal(phase){clearAdvance();["landing","quiz","result"].forEach(id=>$(id).hidden=id!==phase);state.phase=phase;persist();window.scrollTo({top:0,behavior:"instant"})}
function qById(id){return questions[id-1]}
function score(q,answer){if(answer===7)return 0;const custom=specialScores[q.id];return custom?custom[answer]:base[answer]*q.dir}
function reference(q){return score(q,q.dir===1?1:5)}
function calculate(group){const subset=questions.filter(q=>group==="missao"||q.group===group);let actual=0,target=0,known=0,unknown=0,neutral=0;for(const q of subset){const a=state.answers[q.id];if(a===undefined)continue;if(a===7){unknown++;continue}actual+=score(q,a);target+=reference(q);known++;if(a===3)neutral++}return {actual,target,known,unknown,neutral,total:subset.length,value:target>0?actual/target*100:null}}
function pct(n){return n===null?"—":new Intl.NumberFormat("pt-BR",{maximumFractionDigits:1}).format(n)+"%"}
function start(){clearAdvance();state={order:shuffle(),answers:{},cursor:0,phase:"quiz"};reveal("quiz");renderQuestion()}
const answerTones=["full-agree","agree","partial-agree","neutral","partial-disagree","disagree","full-disagree","unknown"];
function updateProgress(){
  const done=Object.keys(state.answers).length;
  $("count").textContent=Math.round(done/questions.length*100)+"% RESPONDIDO";
  $("progress").style.width=(done/questions.length*100)+"%";
  $("progressRole").setAttribute("aria-valuenow",String(done));
}
function fitQuestionText(){
  const frame=$("questionFrame"), heading=$("question");
  if(!frame||frame.clientHeight===0)return;
  heading.style.fontSize="";
  const original=parseFloat(getComputedStyle(heading).fontSize)||28;
  const heightLimit=frame.clientHeight-5;
  if(heading.scrollHeight<=heightLimit)return;
  // Redimensiona o enunciado sem alterar a altura da área de respostas.
  let low=13,high=original,best=13;
  for(let i=0;i<12;i++){
    const middle=(low+high)/2;
    heading.style.fontSize=middle.toFixed(2)+"px";
    if(heading.scrollHeight<=heightLimit){best=middle;low=middle}else{high=middle}
  }
  heading.style.fontSize=best.toFixed(2)+"px";
}
function selectAnswer(index,{auto=true}={}){
  clearAdvance();
  const id=state.order[state.cursor];
  state.answers[id]=index;
  persist();
  $("answers").querySelectorAll(".answer").forEach((button,i)=>{
    const selected=i===index;
    button.classList.toggle("selected",selected);
    button.classList.remove("answer-picked");
    button.setAttribute("aria-checked",String(selected));
    if(selected){
      // Reinicia a animação apenas no item escolhido, sem recriar as opções.
      void button.offsetWidth;
      button.classList.add("answer-picked");
    }
  });
  $("next").disabled=false;
  updateProgress();
  if(auto&&shouldAutoAdvance()&&state.cursor<questions.length-1){
    advanceTimer=window.setTimeout(()=>{advanceTimer=null;next()},390);
  }
}
function renderQuestion(){
  const id=state.order[state.cursor],q=qById(id);
  $("question").textContent=q.text;
  fitQuestionText();
  updateProgress();
  $("questionOrdinal").textContent="SUA OPINIÃO";
  $("prev").disabled=state.cursor===0;
  $("next").disabled=state.answers[id]===undefined;
  $("next").innerHTML=state.cursor===questions.length-1?"VER RESULTADOS <span>→</span>":"CONTINUAR <span>→</span>";
  const box=$("answers");
  box.replaceChildren();
  labels.forEach((label,i)=>{
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="answer"+(state.answers[id]===i?" selected":"");
    btn.dataset.choice=answerTones[i];
    btn.setAttribute("role","radio");
    btn.setAttribute("aria-checked",String(state.answers[id]===i));
    btn.innerHTML='<span class="radio" aria-hidden="true"></span><span>'+label+'</span>';
    btn.addEventListener("click",()=>selectAnswer(i));
    box.append(btn);
  });
}
function next(){clearAdvance();const id=state.order[state.cursor];if(state.answers[id]===undefined)return;if(state.cursor===117){if(Object.keys(state.answers).length!==118)return;reveal("result");renderResults();return}state.cursor++;persist();renderQuestion()}
function previous(){clearAdvance();if(state.cursor>0){state.cursor--;persist();renderQuestion()}}
function renderResults(){const m=calculate("missao"),b=calculate("mbl");$("missaoScore").textContent=pct(m.value);$("mblScore").textContent=pct(b.value);$("missaoCoverage").textContent="Respostas consideradas: "+Math.round(m.known/m.total*100)+"%"+(m.unknown?" · “Não sei” desconsiderado":"");$("mblCoverage").textContent="Respostas consideradas: "+Math.round(b.known/b.total*100)+"%"+(b.unknown?" · “Não sei” desconsiderado":"");const names=[...new Set(questions.map(q=>q.chapter))];const table=$("chapters");table.replaceChildren();for(const name of names){const subset=questions.filter(q=>q.chapter===name);let actual=0,target=0,known=0,unknown=0;for(const q of subset){const a=state.answers[q.id];if(a===7){unknown++;continue}if(a===undefined)continue;actual+=score(q,a);target+=reference(q);known++}const row=document.createElement("div");row.className="chapter-row";const title=document.createElement("div");title.className="chapter-name";title.textContent=name;const value=document.createElement("div");value.className="chapter-score";value.textContent=pct(target?actual/target*100:null);const sub=document.createElement("div");sub.className="chapter-small";sub.textContent=Math.round(100*known/subset.length)+"% das respostas consideradas"+(unknown?" · “Não sei” excluído":"");row.append(title,value,sub);table.append(row)}}
function download(){const result={method:"Pontuação real ÷ referência moderada × 100",createdAt:new Date().toISOString(),indices:{missao:calculate("missao"),mbl:calculate("mbl")},answers:state.order.map((id,order)=>({questionId:id,order:order+1,chapter:qById(id).chapter,group:qById(id).group,answer:labels[state.answers[id]],points:score(qById(id),state.answers[id])}))};const blob=new Blob([JSON.stringify(result,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="meu-resultado-radar-de-ideias.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),200)}
$("autoAdvance").checked=autoAdvance;
$("autoAdvance").addEventListener("change",e=>{autoAdvance=e.target.checked;clearAdvance();try{localStorage.setItem(MOBILE_PREF_KEY,String(autoAdvance))}catch{}});
$("start").addEventListener("click",start);$("resume").addEventListener("click",()=>{reveal("quiz");renderQuestion()});$("next").addEventListener("click",next);$("prev").addEventListener("click",previous);$("newAttempt").addEventListener("click",start);$("download").addEventListener("click",download);
document.addEventListener("keydown",e=>{if(state.phase!=="quiz"||e.altKey||e.ctrlKey||e.metaKey||["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;if(/^[1-8]$/.test(e.key)){const id=state.order[state.cursor];selectAnswer(Number(e.key)-1,{auto:false});e.preventDefault()}else if(e.key==="ArrowLeft"){previous();e.preventDefault()}else if(e.key==="ArrowRight"&&state.answers[state.order[state.cursor]]!==undefined){next();e.preventDefault()}});
const PIX_KEY="vguedes.eth@mail3.me";
async function copyPix(btn){
  const panel=btn.closest(".pix-panel, .result-creator-pix");
  const input=panel.querySelector(".pix-key");
  const status=panel.querySelector(".pix-feedback");
  let copied=false;
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(PIX_KEY);copied=true}
  }catch{}
  if(!copied){
    try{input.focus();input.select();input.setSelectionRange(0,input.value.length);copied=document.execCommand("copy")}catch{}
  }
  if(copied){
    status.textContent="Chave Pix copiada. Abra o aplicativo do seu banco.";
    btn.textContent="CHAVE COPIADA ✓";
    window.setTimeout(()=>{btn.textContent="COPIAR CHAVE PIX";status.textContent=""},3000)
  }else{
    input.focus();input.select();
    status.textContent="Selecione e copie a chave Pix manualmente.";
  }
}
document.querySelectorAll("[data-pix-copy]").forEach(btn=>btn.addEventListener("click",()=>copyPix(btn)));
document.querySelectorAll(".pix-key").forEach(input=>input.addEventListener("focus",()=>input.select()));

window.addEventListener("resize",()=>{if(state.phase==="quiz")requestAnimationFrame(fitQuestionText)},{passive:true});
if(document.fonts?.ready)document.fonts.ready.then(()=>{if(state.phase==="quiz")fitQuestionText()});
load();if(state.order.length===118){$("resume").hidden=false;if(state.phase==="quiz"){reveal("quiz");renderQuestion()}else if(state.phase==="result"){reveal("result");renderResults()}}