import { getBand } from "./lib/bands.js";

const PROFILE_KEY="quiz-missao-mbl-profile";
const $=id=>document.getElementById(id);
const isSocial=p=>p&&["x","instagram"].includes(p.type)&&typeof p.value==="string"&&p.value.length>1;
const SHORT_HEADLINES={
 "fora-da-onca":"LONGE DA ONÇA","opostos":"OS OPOSTOS SE ATRAEM?",
 "flerte":"UM FLERTE COM A ONÇA","metade":"MAIS DA METADE É MISSÃO",
 "felinas":"AS FELINAS CHEGARAM!","missionario":"VOCÊ É UM MISSIONÁRIO!",
 "glorioso":"O FUTURO É GLORIOSO","conviccao":"MISSÃO COM CONVICÇÃO"
};
function readProfile(){
 try{
  const p=JSON.parse(localStorage.getItem(PROFILE_KEY)||"null");
  return isSocial(p)?p:null;
 }catch{return null}
}
function normalizedHandle(v){
 const h=String(v||"").trim().replace(/^@+/,"");
 return /^[a-zA-Z0-9_.]{1,30}$/.test(h)?"@"+h:null;
}
function mblInterpretation(percent){
 if(percent===null)return ["Afinidade não calculável","Você marcou “Não sei” em todas as afirmações culturais. Não há uma referência suficiente para interpretar este índice."];
 if(percent<0)return ["Distância dos princípios culturais","Sua pontuação aponta discordâncias intensas com posições culturais usadas como referência neste questionário. O índice avalia apenas as 16 afirmações culturais, não suas opiniões sobre todo o programa."];
 if(percent<25)return ["Afinidade cultural muito baixa","Você apresenta poucas convergências com os princípios culturais avaliados. As respostas indicam divergências importantes sobre formação intelectual, compromisso político e convivência com opiniões diferentes."];
 if(percent<50)return ["Afinidade cultural parcial","Você compartilha alguns valores culturais, mas também apresenta diferenças relevantes. O conjunto de respostas aponta concordâncias e discordâncias dentro das 16 afirmações do MBL."];
 if(percent<76)return ["Afinidade cultural significativa","A maioria dos pontos avaliados apresenta convergência com a referência cultural do movimento. Ainda existem discordâncias que tornam seu resultado diferente de um alinhamento integral."];
 if(percent<101)return ["Alta afinidade cultural","Você apresenta forte proximidade com os valores culturais usados como referência. Isso inclui aspectos como formação intelectual, autonomia crítica e compromisso com princípios políticos."];
 return ["Afinidade cultural muito intensa","Seu índice ultrapassou a referência de 100%, definida pelas respostas moderadas alinhadas. Isso revela intensidade das concordâncias neste conjunto cultural — não significa que exista uma pontuação máxima de 100%."];
}
function fitText(ctx,text,x,y,width,lineHeight,maxLines=4){
 const words=String(text||"").split(/\s+/);
 let line="",rows=[];
 for(const word of words){
  const candidate=line?line+" "+word:word;
  if(ctx.measureText(candidate).width>width&&line){rows.push(line);line=word}
  else line=candidate;
 }
 if(line)rows.push(line);
 const sliced=rows.slice(0,maxLines);
 if(rows.length>maxLines)sliced[maxLines-1]=sliced[maxLines-1].replace(/[.,;!? ]+$/,"")+"…";
 sliced.forEach((part,i)=>ctx.fillText(part,x,y+i*lineHeight));
 return y+sliced.length*lineHeight;
}
function rounded(ctx,x,y,w,h,r){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);
}
function loadImage(src){
 return new Promise(resolve=>{
  if(!src)return resolve(null);
  const img=new Image();
  img.onload=()=>resolve(img);img.onerror=()=>resolve(null);
  img.src=src;
 });
}
function drawContained(ctx,img,x,y,w,h){
 // Display the complete photo (equivalent to CSS object-fit: contain).
 const scale=Math.min(w/img.width,h/img.height);
 const dw=img.width*scale,dh=img.height*scale;
 ctx.save();rounded(ctx,x,y,w,h,20);ctx.clip();
 ctx.fillStyle="#111923";ctx.fillRect(x,y,w,h);
 ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
 ctx.restore();
 ctx.save();ctx.strokeStyle="#f5dc5b77";ctx.lineWidth=2;rounded(ctx,x,y,w,h,20);ctx.stroke();ctx.restore();
}
async function makeCanvas(missao,mbl,profile){
 await document.fonts?.ready;
 const canvas=document.createElement("canvas");
 canvas.width=1080;canvas.height=1350;
 const c=canvas.getContext("2d");
 if(!c)throw new Error("Canvas indisponível");
 const grd=c.createLinearGradient(0,0,1080,1350);
 grd.addColorStop(0,"#101722");grd.addColorStop(.55,"#27303d");grd.addColorStop(1,"#0f1924");
 c.fillStyle=grd;c.fillRect(0,0,1080,1350);
 const glow=c.createRadialGradient(850,150,30,850,150,650);
 glow.addColorStop(0,"#594820");glow.addColorStop(1,"#59482000");
 c.fillStyle=glow;c.fillRect(0,0,1080,800);
 c.strokeStyle="rgba(255,220,91,.09)";c.lineWidth=2;
 for(let i=-600;i<1600;i+=100){c.beginPath();c.moveTo(i,0);c.lineTo(i+520,1350);c.stroke();}
 c.fillStyle="#f6dc5f";rounded(c,62,60,82,82,18);c.fill();
 c.fillStyle="#131923";c.font="900 62px 'Space Grotesk',Arial";c.fillText("G",83,126);
 c.fillStyle="#fffaf0";c.font="800 40px 'Space Grotesk',Arial";c.fillText("QUIZ MISSÃO/MBL",171,103);
 c.font="700 19px 'Space Grotesk',Arial";c.fillStyle="#c5cdd6";c.fillText("POR GUEDES · RESULTADO DE AFINIDADE",172,136);
 c.textAlign="right";c.font="800 20px 'Space Grotesk',Arial";c.fillStyle="#f9da6a";c.fillText("EDIÇÃO 2026",1012,100);c.textAlign="left";
 c.fillStyle="#d6b84a";c.fillRect(62,172,956,3);
 const band=getBand(missao.value),title=band?SHORT_HEADLINES[band.id]:"RESULTADO INDEFINIDO";
 c.fillStyle="#ffea8c";c.font="800 20px 'Space Grotesk',Arial";c.fillText("SEU RESULTADO",64,227);
 c.fillStyle="#fffaf1";c.font="800 60px 'Space Grotesk',Arial";
 fitText(c,title,64,290,952,65,2);
 // Match the entire-photo layout of the site, including the chosen source asset.
 const img=await loadImage(band?.image||"/results/mission-sigil.svg")||await loadImage("/results/mission-sigil.svg");
 if(img)drawContained(c,img,64,367,952,590);
 else{
  c.fillStyle="#111923";rounded(c,64,367,952,590,20);c.fill();
  c.font="900 220px Arial";c.fillStyle="#ecca4c";c.fillText("✦",440,735);
 }
 const blocks=[
  {x:64,w:464,color:"#ffe573",border:"#997c33",back:"#4c3d26",label:"MISSÃO",value:missao.value},
  {x:550,w:466,color:"#93f7de",border:"#56baaa",back:"#21433f",label:"MBL",value:mbl.value}
 ];
 for(const block of blocks){
  c.fillStyle=block.back;rounded(c,block.x,978,block.w,221,20);c.fill();
  c.strokeStyle=block.border;c.lineWidth=2;c.stroke();
  const txt=block.value===null?"—":new Intl.NumberFormat("pt-BR",{maximumFractionDigits:1}).format(block.value)+"%";
  c.fillStyle=block.color;
  let size=99;
  do{c.font="800 "+size+"px 'Space Grotesk',Arial";if(c.measureText(txt).width<=block.w-44)break;size-=4;}while(size>42);
  c.textAlign="center";c.fillText(txt,block.x+block.w/2,1103);
  c.font="800 26px 'Space Grotesk',Arial";c.fillText(block.label,block.x+block.w/2,1167);
  c.textAlign="left";
 }
 c.strokeStyle="#f5d55d60";c.beginPath();c.moveTo(63,1240);c.lineTo(1018,1240);c.stroke();
 const profileText=isSocial(profile)?profile.value:"RESULTADO ANÔNIMO";
 c.font="800 26px 'Space Grotesk',Arial";c.fillStyle="#fff0ad";c.fillText(profileText,64,1294);
 c.textAlign="right";c.font="700 22px 'Space Grotesk',Arial";c.fillStyle="#c6d0d8";c.fillText("quiz-missao-mbl.vercel.app",1014,1294);c.textAlign="left";
 return canvas;
}
function toBlob(canvas){
 return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Falha ao gerar PNG")),"image/png"));
}
function saveBlob(blob){
 const url=URL.createObjectURL(blob);const a=document.createElement("a");
 a.href=url;a.download="meu-resultado-quiz-missao-mbl.png";document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),10000);
}
export function initShare({readState,patchState,goHome}){
 let lastResult=null;
 function profile(){
  const state=readState();
  if(isSocial({type:state.identityType,value:state.identityValue}))return {type:state.identityType,value:state.identityValue};
  return readProfile();
 }
 function refreshHome(){
  const p=profile(),inputs=$("homeIdentityInputs");
  $("homeIdentityMessage").textContent="";
  if(p){
   $("homeIdentityStatus").textContent="IDENTIFICAÇÃO SALVA";
   $("homeIdentityDescription").textContent="Seu "+(p.type==="x"?"X":"Instagram")+": "+p.value+". Ele poderá aparecer no cartão compartilhável.";
   $("homeIdentityType").value=p.type;$("homeIdentityValue").value=p.value;
   inputs.hidden=true;$("editHomeIdentity").hidden=false;
  }else{
   $("homeIdentityStatus").textContent="OPCIONAL";
   $("homeIdentityDescription").textContent="Quer que seu @ apareça no cartão? Você pode informar agora ou depois de responder ao quiz.";
   inputs.hidden=false;$("editHomeIdentity").hidden=true;
  }
 }
 function prefillOnboard(){
  const p=profile();
  if(p){$("identityType").value=p.type;$("identityValue").value=p.value}
  else if(!$("identityType").value){$("identityType").value="anonymous";$("identityValue").value=""}
  // The existing app already owns the onboarding field visibility.
  $("identityType").dispatchEvent(new Event("change"));
 }
 function saveHandle(){
  const handle=normalizedHandle($("homeIdentityValue").value);
  const type=$("homeIdentityType").value;
  if(!handle||!["x","instagram"].includes(type)){
   $("homeIdentityMessage").textContent="Digite um @ válido, com letras, números, ponto ou underline.";
   $("homeIdentityValue").focus();
   return;
  }
  try{localStorage.setItem(PROFILE_KEY,JSON.stringify({type,value:handle}))}catch{}
  patchState({identityType:type,identityValue:handle});
  refreshHome();prefillOnboard();
  $("homeIdentityMessage").textContent="Seu @ foi salvo neste dispositivo. Ele será mostrado no cartão ao voltar ao resultado.";
  if(readState().submission==="saved")
   $("homeIdentityMessage").textContent+=" Um registro já enviado ao servidor mantém os dados originais.";
 }
 function render(missao,mbl){
  lastResult={missao,mbl};
  const band=getBand(missao.value);
  $("affinityMissionScore").textContent=missao.value===null?"—":new Intl.NumberFormat("pt-BR",{maximumFractionDigits:1}).format(missao.value)+"%";
  $("affinityMblScore").textContent=mbl.value===null?"—":new Intl.NumberFormat("pt-BR",{maximumFractionDigits:1}).format(mbl.value)+"%";
  $("affinityBandTitle").textContent=band?.title||"Resultado não calculável";
  $("affinityBandCaption").textContent=band?.description||"Não foi possível calcular o índice com as respostas disponíveis.";
  const mblInfo=mblInterpretation(mbl.value);
  $("mblBandTitle").textContent=mblInfo[0];$("mblBandDescription").textContent=mblInfo[1];
  const p=profile();
  $("affinityProfile").textContent=p?.value||"RESULTADO ANÔNIMO";
  $("affinityAddHandle").hidden=Boolean(p);
  const img=$("affinityMissionImage");
  img.onerror=()=>{img.onerror=null;img.src="/results/mission-sigil.svg"};
  // Original photographs are optional. Only use them if the corresponding file exists.
  img.src=band?.image||"/results/mission-sigil.svg";
 }
 async function exportPNG(share=false){
  if(!lastResult)return;
  const button=share?$("affinityImageButton"):$("downloadImage");
  button.disabled=true;$("affinityFeedback").textContent="Preparando imagem em alta resolução…";
  try{
    const canvas=await makeCanvas(lastResult.missao,lastResult.mbl,profile());
    const blob=await toBlob(canvas);
    const file=new File([blob],"resultado-missao-mbl.png",{type:"image/png"});
    if(share&&navigator.canShare?.({files:[file]})&&navigator.share){
      try{await navigator.share({files:[file],title:"Meu resultado no Quiz Missão/MBL"});$("affinityFeedback").textContent="Compartilhamento iniciado.";return}
      catch(err){if(err?.name==="AbortError"){$("affinityFeedback").textContent="Compartilhamento cancelado.";return}}
    }
    saveBlob(blob);
    $("affinityFeedback").textContent="Imagem PNG de 1080 × 1350 salva para compartilhar.";
  }catch(error){
    console.error("share image error",error);
    $("affinityFeedback").textContent="Não foi possível gerar a imagem neste navegador. Você pode tirar um print do cartão acima.";
  }finally{button.disabled=false}
 }
 $("saveHomeIdentity").addEventListener("click",saveHandle);
 $("editHomeIdentity").addEventListener("click",()=>{$("homeIdentityInputs").hidden=false;$("editHomeIdentity").hidden=true;$("homeIdentityValue").focus()});
 $("homeIdentityValue").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();saveHandle()}});
 $("homeLogo").addEventListener("click",goHome);
 $("affinityAddHandle").addEventListener("click",()=>{goHome();$("homeIdentityInputs").hidden=false;$("editHomeIdentity").hidden=true;$("homeIdentityValue").focus()});
 $("downloadImage").addEventListener("click",()=>void exportPNG(false));
 $("affinityImageButton").addEventListener("click",()=>void exportPNG(true));
 return {refreshHome,prefillOnboard,render};
}
