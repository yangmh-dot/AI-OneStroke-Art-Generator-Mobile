function generatePrompt() {
  const subject = document.getElementById('subject').value;
  const tool = document.getElementById('tool').value;
  const colorTool = document.getElementById('colorTool').value;
  const speed = document.getElementById('speed').value;
  const totalTime = document.getElementById('totalTime').value;
  const sketchTime = Math.floor(totalTime * 0.45);
  const colorTime = totalTime - sketchTime;

  const prompt = `
A realistic human hand ${speed} sketching a ${subject} in one continuous line within ${sketchTime} seconds,
top-down camera angle, on white paper, using a ${tool}, smooth and confident strokes.
Then the same hand starts coloring with ${colorTool}, using vibrant tones for about ${colorTime} seconds,
showing the transformation from sketch to finished artwork.
A small, elegant text watermark "by Andy." is visible in the bottom-right corner of the frame,
semi-transparent, minimalistic style. The entire process completes naturally within ${totalTime} seconds,
cinematic lighting, 9:16 aspect ratio, 1080p resolution, clean background, focus on hand and paper.
  `.trim();

  document.getElementById('output').value = prompt;
}

function copyPrompt() {
  const text = document.getElementById('output');
  text.select();
  document.execCommand('copy');
  alert('✅ Prompt copied to clipboard!');
}