import { getBand } from "./lib/bands.js";
import { initShare } from "./share.js?v=quiz-119-v1";
import {questions, specialScores} from "./questions.js?v=question-78-v2";
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
function restoreResultTop(){
  // Browsers on mobile may restore a scroll position from the previous layout
  // after the result contents are updated. Ensure the card appears first.
  if(document.getElementById("result")?.hidden)return;
  window.scrollTo({top:0,behavior:"instant"});
  requestAnimationFrame(()=>window.scrollTo({top:0,behavior:"instant"}));
  // Mobile engines can apply saved scroll after DOMContentLoaded.
  if(document.readyState!=="complete")window.addEventListener("load",()=>window.scrollTo({top:0,behavior:"instant"}),{once:true});
}
if("scrollRestoration" in history)history.scrollRestoration="manual";
let state={order:[],answers:{},cursor:0,phase:"landing"};
const $=id=>document.getElementById(id);
let shareUI=null;
function goHome(event){if(event)event.preventDefault();reveal("landing");shareUI?.refreshHome();const hasQuiz=state.order?.length===questions.length;$("resume").hidden=!hasQuiz;if(hasQuiz)$("resume").textContent=Object.keys(state.answers||{}).length===questions.length?"VER MEU RESULTADO →":"RETOMAR ONDE PAREI →";}
function openOnboard(){shareUI?.prefillOnboard();reveal("onboard");}
function shuffle(){const a=questions.map(q=>q.id);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function load(){
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||"null");
    if(!saved||!Array.isArray(saved.order)||!saved.answers||typeof saved.answers!=="object"||!Number.isInteger(saved.cursor)||!["landing","quiz","result"].includes(saved.phase))return;
    const total=questions.length;
    // Preserva o progresso de quem iniciou o questionário antes da nova pergunta cultural.
    const isLegacy=saved.order.length===total-1&&saved.order.every(id=>Number.isInteger(id)&&id>=1&&id<total)&&new Set(saved.order).size===total-1;
    if(isLegacy){
      // Preserve every previous answer, and let the participant answer ONLY #119.
      const previouslyComplete=Object.keys(saved.answers).length===total-1;
      saved.order.push(total);
      if(previouslyComplete)saved.cursor=total-1;
      if(saved.phase==="result")saved.phase="quiz";
      // A past submission does NOT include this new question; keep its
      // existing deletion capability and do not falsely claim a new submission.
      if(saved.submission==="saved")saved.legacySaved=true;
    }
    const valid=saved.order.length===total&&new Set(saved.order).size===total&&saved.order.every(id=>Number.isInteger(id)&&id>=1&&id<=total);
    if(valid&&saved.cursor>=0&&saved.cursor<total){
      state=saved;
      if(isLegacy)persist();
    }
  }catch{}
}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function reveal(phase){clearAdvance();["landing","onboard","quiz","result"].forEach(id=>$(id).hidden=id!==phase);state.phase=phase;persist();window.scrollTo({top:0,behavior:"instant"})}
function qById(id){return questions[id-1]}
function score(q,answer){if(answer===7)return 0;const custom=specialScores[q.id];return custom?custom[answer]:base[answer]*q.dir}
function reference(q){return score(q,q.dir===1?1:5)}
function calculate(group){const subset=questions.filter(q=>group==="missao"||q.group===group);let actual=0,target=0,known=0,unknown=0,neutral=0;for(const q of subset){const a=state.answers[q.id];if(a===undefined)continue;if(a===7){unknown++;continue}actual+=score(q,a);target+=reference(q);known++;if(a===3)neutral++}return {actual,target,known,unknown,neutral,total:subset.length,value:target>0?actual/target*100:null}}
function pct(n){return n===null?"—":new Intl.NumberFormat("pt-BR",{maximumFractionDigits:1}).format(n)+"%"}
function start(){
  clearAdvance();
  const identityType=$("identityType").value, identityValue=$("identityValue").value.trim();
  if(identityType!=="anonymous"&&(!identityValue||identityValue.length>60)){$("identityValue").focus();return}
  state={order:shuffle(),answers:{},cursor:0,phase:"quiz",consent:$("dataConsent").checked,identityType,identityValue:identityType==="anonymous"?"":identityValue,attemptId:crypto.randomUUID(),submission:"idle"};
  reveal("quiz");renderQuestion();
}
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
  // Preserva palavras inteiras e encontra a maior fonte que cabe na área fixa.
  const minimum=window.innerWidth<=740?13:15;
  let low=minimum,high=original,best=minimum;
  for(let i=0;i<13;i++){
    const middle=(low+high)/2;
    heading.style.fontSize=middle.toFixed(2)+"px";
    if(heading.scrollHeight<=heightLimit&&heading.scrollWidth<=frame.clientWidth+1){best=middle;low=middle}else{high=middle}
  }
  heading.style.fontSize=best.toFixed(2)+"px";
  frame.scrollTop=0;
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
function next(){clearAdvance();const id=state.order[state.cursor];if(state.answers[id]===undefined)return;if(state.cursor===questions.length-1){if(Object.keys(state.answers).length!==questions.length)return;reveal("result");renderResults();return}state.cursor++;persist();renderQuestion()}
function previous(){clearAdvance();if(state.cursor>0){state.cursor--;persist();renderQuestion()}}
function renderResults(){const m=calculate("missao"),b=calculate("mbl");$("missaoScore").textContent=pct(m.value);$("mblScore").textContent=pct(b.value);$("missaoCoverage").textContent="Respostas consideradas: "+Math.round(m.known/m.total*100)+"%"+(m.unknown?" · “Não sei” desconsiderado":"");$("mblCoverage").textContent="Respostas consideradas: "+Math.round(b.known/b.total*100)+"%"+(b.unknown?" · “Não sei” desconsiderado":"");const names=[...new Set(questions.map(q=>q.chapter))];const table=$("chapters");table.replaceChildren();for(const name of names){const subset=questions.filter(q=>q.chapter===name);let actual=0,target=0,known=0,unknown=0;for(const q of subset){const a=state.answers[q.id];if(a===7){unknown++;continue}if(a===undefined)continue;actual+=score(q,a);target+=reference(q);known++}const row=document.createElement("div");row.className="chapter-row";const title=document.createElement("div");title.className="chapter-name";title.textContent=name;const value=document.createElement("div");value.className="chapter-score";value.textContent=pct(target?actual/target*100:null);const sub=document.createElement("div");sub.className="chapter-small";sub.textContent=Math.round(100*known/subset.length)+"% das respostas consideradas"+(unknown?" · “Não sei” excluído":"");row.append(title,value,sub);table.append(row)}renderExtras();restoreResultTop();}
function download(){const result={method:"Pontuação real ÷ referência moderada × 100",createdAt:new Date().toISOString(),indices:{missao:calculate("missao"),mbl:calculate("mbl")},answers:state.order.map((id,order)=>({questionId:id,order:order+1,chapter:qById(id).chapter,group:qById(id).group,answer:labels[state.answers[id]],points:score(qById(id),state.answers[id])}))};const blob=new Blob([JSON.stringify(result,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="meu-resultado-radar-de-ideias.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),200)}
$("autoAdvance").checked=autoAdvance;
$("autoAdvance").addEventListener("change",e=>{autoAdvance=e.target.checked;clearAdvance();try{localStorage.setItem(MOBILE_PREF_KEY,String(autoAdvance))}catch{}});
$("start").addEventListener("click",openOnboard);$("resume").addEventListener("click",()=>{if(Object.keys(state.answers||{}).length===questions.length){reveal("result");renderResults()}else{reveal("quiz");renderQuestion()}});$("next").addEventListener("click",next);$("prev").addEventListener("click",previous);$("newAttempt").addEventListener("click",()=>{$("dataConsent").checked=false;openOnboard()});$("download").addEventListener("click",download);

function syncIdentityField(){
  const show=$("identityType").value!=="anonymous";
  $("identityValue").hidden=!show;$("identityValueLabel").hidden=!show;
  $("identityValue").placeholder=$("identityType").value==="name"?"Seu nome":"@seuusuario";
}
function renderEditorial(){
  const score=calculate("missao").value,band=getBand(score);
  $("bandTitle").textContent=band?.title??"Resultado não calculável";
  $("bandDescription").textContent=band?.description??"Todas as respostas foram marcadas como “Não sei”. É necessário responder ao menos uma afirmação para calcular o índice.";
  const img=$("bandImage");
  img.hidden=true;img.removeAttribute("src");img.alt="";
  img.onload=()=>{img.hidden=false};img.onerror=()=>{img.onerror=null;img.src="/results/mission-sigil.svg"};img.alt="Arte temática do resultado da Missão";img.src=band?.image||"/results/mission-sigil.svg";
}
function renderStatsNode(values){
  const box=$("participantsStats");box.replaceChildren();
  for(const [value,label] of values){
    const item=document.createElement("div");item.className="participant-stat";
    const strong=document.createElement("strong");strong.textContent=value;
    const text=document.createElement("span");text.textContent=label;
    item.append(strong,text);box.append(item);
  }
}
async function updateParticipantStats(){
  try{
    const response=await fetch("/api/stats");
    if(!response.ok)throw Error("unavailable");
    const body=await response.json();
    if(!body.available)throw Error("unavailable");
    renderStatsNode([[String(body.count),"RESULTADOS REGISTRADOS"],[pct(body.missao),"MÉDIA DE ADERÊNCIA MISSÃO"],[pct(body.mbl),"MÉDIA DE AFINIDADE MBL"]]);
  }catch{renderStatsNode([["Estatísticas indisponíveis","O BANCO AINDA NÃO ESTÁ CONECTADO OU ESTÁ TEMPORARIAMENTE INDISPONÍVEL"]])}
}
async function submitParticipation(){
  if(!state.consent||state.submission==="saved"||!state.attemptId)return;
  $("saveFeedback").textContent="Registrando resultado autorizado...";
  try{
    const r=await fetch("/api/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({consent:true,attemptId:state.attemptId,identityType:state.identityType,identityValue:state.identityValue,answers:state.answers})});
    const result=await r.json().catch(()=>({}));
    if(!r.ok||!result.saved)throw Error(result.error||"erro");
    state.submission="saved";persist();
    $("deleteParticipation").hidden=false;
    $("saveFeedback").textContent="Resultado registrado com seu consentimento.";
    void updateParticipantStats();
  }catch{
    state.submission="unsaved";persist();
    $("saveFeedback").textContent="O registro no banco não está disponível. Seu resultado continua salvo somente neste dispositivo.";
  }
}
function renderExtras(){
  renderEditorial();
  shareUI?.render(calculate("missao"),calculate("mbl"));
  void updateParticipantStats();
  if(state.consent){
    if(state.submission==="saved"){
      $("deleteParticipation").hidden=false;
      $("saveFeedback").textContent=state.legacySaved
        ?"Seu registro anterior corresponde à versão de 118 questões. Esta nova resposta não foi enviada ao servidor; você pode excluir o registro antigo abaixo."
        :"Resultado registrado anteriormente com seu consentimento.";
    }
    else void submitParticipation();
  }else $("saveFeedback").textContent="Você não autorizou armazenar as respostas. Seu resultado permanece neste dispositivo.";
}

async function removeMyParticipation(){
  if(!state.attemptId||state.submission!=="saved")return;
  if(!window.confirm("Confirma a exclusão da sua participação e das respostas armazenadas na Vercel? Esta operação não pode ser desfeita."))return;
  const btn=$("deleteParticipation");
  btn.disabled=true;
  $("saveFeedback").textContent="Solicitando a exclusão da participação...";
  try{
    const response=await fetch("/api/delete",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({attemptId:state.attemptId})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result.deleted)throw Error("Falha ao apagar registro");
    state.submission="deleted";state.consent=false;state.identityValue="";persist();
    btn.hidden=true;
    $("saveFeedback").textContent="Participação excluída do armazenamento. Suas respostas permanecem apenas neste dispositivo.";
    void updateParticipantStats();
  }catch{
    $("saveFeedback").textContent="Não foi possível excluir o registro agora. Tente novamente.";
  }finally{btn.disabled=false}
}
$("deleteParticipation").addEventListener("click",()=>void removeMyParticipation());

$("identityType").addEventListener("change",syncIdentityField);
$("onboardBack").addEventListener("click",goHome);
$("onboardStart").addEventListener("click",start);
syncIdentityField();
shareUI=initShare({readState:()=>state,patchState:changes=>{Object.assign(state,changes);persist()},goHome});
shareUI.refreshHome();

document.addEventListener("keydown",e=>{if(state.phase!=="quiz"||e.altKey||e.ctrlKey||e.metaKey||["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;if(/^[1-8]$/.test(e.key)){const id=state.order[state.cursor];selectAnswer(Number(e.key)-1,{auto:false});e.preventDefault()}else if(e.key==="ArrowLeft"){previous();e.preventDefault()}else if(e.key==="ArrowRight"&&state.answers[state.order[state.cursor]]!==undefined){next();e.preventDefault()}});
const PIX_KEY="vguedes.eth@mail3.me";
async function copyPix(btn){
  const panel=btn.closest(".pix-panel, .result-creator-pix, .header-pix");
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
    const originalContent=btn.innerHTML;
    if(btn.classList.contains("header-pix-copy")){
      btn.innerHTML='<span aria-hidden="true">✓</span><span class="header-copy-text">Copiado</span>';
    }else{
      btn.textContent="CHAVE COPIADA ✓";
    }
    window.setTimeout(()=>{btn.innerHTML=originalContent;status.textContent=""},3000);
  }else{
    input.focus();input.select();
    status.textContent="Selecione e copie a chave Pix manualmente.";
  }
}
document.querySelectorAll("[data-pix-copy]").forEach(btn=>btn.addEventListener("click",()=>copyPix(btn)));
document.querySelectorAll(".pix-key").forEach(input=>input.addEventListener("focus",()=>input.select()));

window.addEventListener("resize",()=>{if(state.phase==="quiz")requestAnimationFrame(fitQuestionText)},{passive:true});
if(document.fonts?.ready)document.fonts.ready.then(()=>{if(state.phase==="quiz")fitQuestionText()});
load();shareUI.refreshHome();if(state.order.length===questions.length){$("resume").hidden=false;if(state.phase==="quiz"){reveal("quiz");renderQuestion()}else if(state.phase==="result"){reveal("result");renderResults()}else if(state.phase==="landing"){goHome()}}