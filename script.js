function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePrompt(autoMode = false) {
  const subjects = ["cat","dog","rabbit","lion","flower","mountain","city skyline","girl","boy","tree","pizza","car","guitar","galaxy","house","logo"];
  const tools = ["pencil","ink pen","brush pen","marker pen","colored pencil","chalk","crayon","charcoal stick"];
  const colorTools = ["color markers","watercolor brush","pastel","acrylic brush","oil brush","digital stylus","ink brush"];
  const palettes = ["vibrant tones","soft pastel","warm earthy colors","cool neon tones","cartoon style","illustration style","realistic tone"];
  const backgrounds = ["white paper","kraft paper","wooden desk","black paper","sketchbook texture"];
  const speeds = ["smoothly","quickly","rapidly at 2x speed"];
  const modes = ["Normal","Fast Draw","ASMR","Artistic"];

  const subject = autoMode || document.getElementById("subject").value === "auto" ? randomChoice(subjects) : document.getElementById("subject").value;
  const tool = autoMode || document.getElementById("tool").value === "auto" ? randomChoice(tools) : document.getElementById("tool").value;
  const colorTool = autoMode || document.getElementById("colorTool").value === "auto" ? randomChoice(colorTools) : document.getElementById("colorTool").value;
  const palette = autoMode || document.getElementById("palette").value === "auto" ? randomChoice(palettes) : document.getElementById("palette").value;
  const background = autoMode || document.getElementById("background").value === "auto" ? randomChoice(backgrounds) : document.getElementById("background").value;
  const speed = autoMode || document.getElementById("speed").value === "auto" ? randomChoice(speeds) : document.getElementById("speed").value;
  const totalTime = document.getElementById("totalTime").value;
  const sketchTime = Math.floor(totalTime * 0.45);
  const colorTime = totalTime - sketchTime;

  const prompt = `
A realistic human hand ${speed} sketching a ${subject} on ${background}, using a ${tool}, in one continuous line within ${sketchTime} seconds.
Then the same hand starts coloring it with ${colorTool}, applying ${palette} for about ${colorTime} seconds,
showing the transformation from sketch to finished artwork.
A subtle watermark "by Andy." is visible in the bottom-right corner, semi-transparent and minimalistic.
The entire process completes naturally within ${totalTime} seconds, cinematic lighting, 9:16 aspect ratio, 1080p resolution, clean background, top-down camera focus on hand and paper.
  `.trim();

  document.getElementById("output").value = prompt;
}

function randomAll() {
  generatePrompt(true);
}

function copyPrompt() {
  const text = document.getElementById("output");
  text.select();
  document.execCommand("copy");
  alert("✅ Prompt copied!");
}
