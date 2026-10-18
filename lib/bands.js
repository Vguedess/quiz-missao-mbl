export const missionBands=[
  {id:"fora-da-onca",max:10,title:"Você definitivamente não é amigo da onça... você chegou aqui de propósito?",description:"Sua compatibilidade com a Missão é baixíssima. O resultado aponta uma distância expressiva entre suas posições e as propostas avaliadas.",accent:"#e9807a",image:null,cta:"Conheça as ideias antes de julgar."},
  {id:"opostos",max:25,title:"Os opostos se atraem?",description:"Sua compatibilidade com a Missão é baixa. Talvez valha a pena conhecer os argumentos do movimento e descobrir onde estão suas principais divergências.",accent:"#d2a479",image:null,cta:"Descubra onde começa a divergência."},
  {id:"flerte",max:50,title:"Você flerta (bastante) com a Onça, mas nunca rolou nada...",description:"Existe compatibilidade em vários pontos, mas também divergências relevantes. Seu resultado mostra aproximações e distâncias em diferentes temas.",accent:"#d4b878",image:null,cta:"Explore melhor as propostas."},
  {id:"metade",max:76,title:"Mais da metade de você é Missionário!",description:"Há alinhamento relevante com muitas das posições avaliadas, acompanhado de algumas discordâncias que merecem atenção.",accent:"#eacb63",image:null,cta:"Veja onde você mais concordou."},
  {id:"felinas",max:90,title:"AS FELINAS CHEGARAM!",description:"Você apresenta uma compatibilidade muito elevada com as propostas e os valores avaliados neste questionário.",accent:"#a8d2c0",image:"/results/amanda-oculos.png",cta:"Você já está muito perto da Onça."},
  {id:"missionario",max:100.000000001,title:"VOCÊ É UM MISSIONÁRIO!",description:"Sua compatibilidade com as posições da Missão é extremamente alta. Seu resultado demonstra alinhamento consistente com as referências deste questionário.",accent:"#f5dc5b",image:"/results/onca-poster.png",cta:"Explore as posições em que houve maior alinhamento."},
  {id:"glorioso",max:110.000000001,title:"O Futuro é Glorioso e Você fará parte disso",description:"Você não apenas concorda com muitas das posições avaliadas: suas respostas mostram uma intensidade de concordância superior à referência moderada.",accent:"#ffcc65",image:"/results/renan-microfone.png",cta:"O seu resultado ultrapassou a referência moderada."},
  {id:"conviccao",max:Infinity,title:"Você é Missão com convicção.",description:"Você demonstra alinhamento muito intenso com as posições avaliadas, em um nível que ultrapassa bastante a referência de concordância moderada.",accent:"#f7e685",image:"/results/onca-patch.png",cta:"Explore onde suas ideias mais convergiram."}
];
export function getBand(percent) {
  if(percent===null || !Number.isFinite(percent))return null;
  return missionBands.find(band=>percent<band.max) || missionBands.at(-1);
}
