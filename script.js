// === Options & helpers ===
function randomChoice(arr){return arr[Math.floor(Math.random()*arr.length)];}

const subjects=["cat","dog","rabbit","bird","lion","tiger","elephant","fish","girl","boy","artist","dancer","face portrait","hand gesture","house","castle","bridge","temple","street scene","city skyline","tree","mountain","sunrise","ocean","flower","galaxy","clouds","car","motorcycle","airplane","guitar","camera","book","coffee cup","ice cream","pizza","burger","sushi","fruit bowl","cake","logo","geometric pattern","zentangle art","heart symbol","spiral design","infinity shape"];
const tools=["pencil","ink pen","brush pen","marker pen","colored pencil","chalk","crayon","charcoal stick"];
const colorTools=["color markers","watercolor brush","pastel","acrylic brush","oil brush","digital stylus","ink brush"];
const palettes=["vibrant tones","soft pastel","warm earthy colors","cool neon tones","cartoon style","illustration style","realistic tone"];
const backgrounds=["white paper","kraft paper","wooden desk","sketchbook texture","black paper"];
const speeds=["fast","2x speed","4x speed"];
const times=[10,15];

// Audio assets (royalty-free examples)
const drawSounds=[
  "https://cdn.pixabay.com/download/audio/2023/01/13/audio_c5dd2b0ef8.mp3?filename=pencil-drawing-135397.mp3",
  "https://cdn.pixabay.com/download/audio/2022/09/21/audio_2d9e7a.mp3?filename=writing-pencil-120-bpm-121349.mp3"
];
const bgMusic=[
  "https://cdn.pixabay.com/download/audio/2023/03/10/audio_3e2ad8.mp3?filename=lofi-chill-140290.mp3",
  "https://cdn.pixabay.com/download/audio/2023/02/05/audio_8a6d9d.mp3?filename=soft-relax-136809.mp3",
  "https://cdn.pixabay.com/download/audio/2023/01/15/audio_b2d1f0.mp3?filename=dreamy-lofi-133077.mp3"
];
let drawAudio=null,musicAudio=null;
function playSound(){
  stopSound();
  try{
    drawAudio=new Audio(randomChoice(drawSounds));
    musicAudio=new Audio(randomChoice(bgMusic));
    drawAudio.volume=0.15; // low pencil sound
    musicAudio.volume=0.4; // soft bgm
    drawAudio.play().catch(()=>{});
    musicAudio.play().catch(()=>{});
  }catch(e){}
}
function stopSound(){
  if(drawAudio){drawAudio.pause();drawAudio=null;}
  if(musicAudio){musicAudio.pause();musicAudio=null;}
}

function speedPhrase(val){
  if(val==="fast") return "quickly";
  if(val==="2x speed") return "at 2x speed";
  if(val==="4x speed") return "at 4x speed";
  return "smoothly";
}

function valueOrAuto(id, pool, autoMode){
  const el=document.getElementById(id);
  return autoMode || el.value==="auto" ? randomChoice(pool) : el.value;
}

function generatePrompt(autoMode=false){
  const subject=valueOrAuto("subject", subjects, autoMode);
  const tool=valueOrAuto("tool", tools, autoMode);
  const colorTool=valueOrAuto("colorTool", colorTools, autoMode);
  const palette=valueOrAuto("palette", palettes, autoMode);
  const background=valueOrAuto("background", backgrounds, autoMode);
  const sp=valueOrAuto("speed", speeds, autoMode);
  const totalTimeStr=valueOrAuto("totalTime", times, autoMode);
  const totalTime=Number(totalTimeStr);

  const sketchTime=Math.floor(totalTime*0.45);
  const colorTime=totalTime-sketchTime;

  const prompt=(`
A realistic human hand ${speedPhrase(sp)} sketching a ${subject} on ${background}, using a ${tool}, in one continuous line within ${sketchTime} seconds.
Then the same hand starts coloring it with ${colorTool}, applying ${palette} for about ${colorTime} seconds,
showing the transformation from sketch to fully finished artwork.
A subtle watermark "by Andy." is visible in the bottom-right corner, semi-transparent and minimalistic.
The entire process completes naturally within ${totalTime} seconds, cinematic lighting, 9:16 aspect ratio, 1080p resolution, clean background, steady top-down camera focusing on the hand and paper.
`).trim();

  const out=document.getElementById("output");
  out.value=prompt;

  // Save last prompt
  try{ localStorage.setItem("last_prompt", prompt); }catch(e){}

  // Play sounds
  playSound();
}

function randomAll(){ generatePrompt(true); }

function copyPrompt(){
  const ta=document.getElementById("output");
  ta.select();
  document.execCommand("copy");
  alert("✅ Prompt copied!");
}

// Restore last prompt if exists
document.addEventListener("DOMContentLoaded",()=>{
  try{
    const last=localStorage.getItem("last_prompt");
    if(last){ document.getElementById("output").value=last; }
  }catch(e){}
});
