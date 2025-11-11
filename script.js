// ===== Helpers =====
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isLocked(id) {
  const lock = document.querySelector(`.lock[data-target="${id}"]`);
  return lock && lock.checked;
}

function getValOrAuto(id, pool, autoMode = false) {
  const el = document.getElementById(id);
  if (!el) return randomChoice(pool);
  if (isLocked(id)) return el.value;
  if (!autoMode && el.value && el.value !== "auto") return el.value;
  return randomChoice(pool);
}

// ===== Data =====
const subjectsFree = [
  "simple abstract single-line shape",
  "minimal geometric single-line loop",
  "single-line contour path"
];

const backgrounds = [
  "clean white paper",
  "ivory sketch paper",
  "kraft paper",
  "black paper with a white gel pen",
  "a single blank sketchbook page"
];

const tools = [
  "fine ink pen",
  "pencil",
  "brush pen",
  "fine marker pen"
];

const speeds = ["fast", "2x", "4x"];
const times = [10, 15];
const patterns = ["smooth", "snappy", "reveal"];

const platformProfiles = {
  sora: ({ core }) =>
    `${core} Steady overhead camera, cinematic minimal look, 9:16 vertical, 1080p.`,
  runway: ({ core }) =>
    `${core} Clean, high-contrast minimal frame, ideal for Runway, 9:16, 1080p.`,
  pika: ({ core }) =>
    `${core} Smooth controlled motion, loop-friendly framing, for Pika, 9:16 vertical, 1080p.`
};

const presets = {
  infinity: {
    label: "Infinity loop",
    subject:
      "a clean infinity symbol drawn as one continuous loop that crosses only once at the center"
  },
  spiral: {
    label: "Spiral",
    subject:
      "a simple center-out spiral line, 3–4 smooth loops expanding outward without crossing itself"
  },
  heart: {
    label: "Heart loop",
    subject:
      "a single-line heart shape drawn as one smooth loop that starts at the bottom point, goes around both arcs, and returns cleanly"
  },
  wave: {
    label: "Wave line",
    subject:
      "a continuous horizontal wave line with 4–6 smooth peaks and valleys in one stroke"
  },
  zigzag: {
    label: "Zigzag path",
    subject:
      "a clean zigzag line moving in one direction with sharp turns, no overlaps"
  }
};

// ===== Hook / Pattern / Finish text =====
function hookText(style) {
  if (style === "challenge") {
    return "From the very first frame, the hand is already in motion, framed as a one-stroke challenge to see if it can be done without lifting.";
  }
  if (style === "satisfying") {
    return "The movement is presented as oddly satisfying continuous motion that is relaxing to watch.";
  }
  // default: mystery
  return "At the beginning the line looks abstract, inviting the viewer to guess what the one-stroke shape will become before it is fully revealed.";
}

function patternText(pattern) {
  if (pattern === "snappy") {
    return "The stroke starts slightly faster to grab attention, then becomes controlled and stable near the end to clearly reveal the final shape.";
  }
  if (pattern === "reveal") {
    return "Early strokes feel abstract; the recognizable shape emerges clearly in the last part of the video for a strong reveal moment.";
  }
  // smooth
  return "The stroke speed is smooth and consistent from start to finish, with no hesitation or jitter.";
}

function finishText(ratio) {
  const r = parseFloat(ratio);
  if (!r || r <= 0 || r >= 1) return "";
  const percent = Math.round(r * 100);
  const remain = 100 - percent;
  return `The drawing is fully completed at about ${percent}% of the video duration, with the final ${remain}% holding on the finished one-stroke artwork so viewers can clearly see the result.`;
}

// pattern 對應預設完成比例
function autoFinishForPattern(pattern) {
  if (pattern === "reveal") return "0.95";
  if (pattern === "snappy") return "0.9";
  return "0.85"; // smooth
}

// auto pattern：偏向 reveal 提升留存
function autoPatternWeighted() {
  const r = Math.random();
  if (r < 0.5) return "reveal";      // 50%
  if (r < 0.8) return "smooth";      // 接下來 30%
  return "snappy";                   // 剩下 20%
}

// ===== Core prompt builder =====
function buildCorePrompt({
  subject,
  background,
  tool,
  speed,
  totalTime,
  strict,
  useHook,
  hookStyle,
  pattern,
  finishRatio
}) {
  const speedPhrase =
    speed === "2x" ? "at 2x speed" :
    speed === "4x" ? "at 4x speed" :
    "quickly";

  const strictPart = strict
    ? "strictly as a single continuous unbroken stroke with no lifting the pen, no breaks, no retracing, no sketching, no shading, no coloring, and no extra symbols"
    : "as one clean continuous stroke without messy corrections";

  let base =
    `Top-down shot of a realistic human hand ${speedPhrase} drawing ${subject} ${strictPart}. ` +
    `On ${background} using a ${tool}. ` +
    `The entire one-stroke drawing is fully completed within ${totalTime} seconds. ` +
    `Only one visible line forms the artwork, no background illustrations, no extra text or logos ` +
    `except a tiny subtle watermark "by Andy." fixed at the bottom-right corner. ` +
    `Minimal clean desk, no clutter, steady overhead camera, no shake.`;

  // Pattern 描述
  base += " " + patternText(pattern);

  // 完成時機
  if (finishRatio) {
    base += " " + finishText(finishRatio);
  }

  // Hook（預設 ON，比較有勾子）
  if (useHook) {
    base += " " + hookText(hookStyle);
  }

  return base.trim();
}

function buildYTMeta({ subject, speed, totalTime, label }) {
  const sp =
    speed === "2x" ? "2x Speed" :
    speed === "4x" ? "4x Speed" :
    "Fast";
  const prefix = label ? `(${label}) ` : "";
  const title = `${prefix}One-Stroke ${subject} | ${sp} | ${totalTime}s #Shorts`;
  const tags = [
    "OneStroke",
    "SingleLine",
    "MinimalArt",
    "AIart",
    "Prompt",
    "Sora2",
    "Runway",
    "Pika",
    "Shorts",
    "byAndy"
  ];
  return `${title}\nTags: ${tags.map(t => "#" + t).join(" ")}`;
}

// ===== Main generate =====
function generatePrompt(autoMode = false) {
  const presetKey = document.getElementById("preset").value;
  const strict = document.getElementById("strict")?.checked ?? true;
  const platform = document.getElementById("platform").value || "sora";
  const seriesMode = document.getElementById("seriesMode")?.checked || false;
  const abTest = document.getElementById("abTest")?.checked || false;

  // Hook 預設啟用：如果元素存在，讀它；如果沒找到，就當作 true
  const hookEl = document.getElementById("hookEnabled");
  const hookEnabled = hookEl ? hookEl.checked : true;
  const hookStyle = document.getElementById("hookStyle")?.value || "mystery";

  let finishRatio = document.getElementById("finishRatio")?.value || "auto";
  let pattern = document.getElementById("pattern")?.value || "auto";

  let batchCount = parseInt(document.getElementById("batchCount")?.value || "1", 10);
  if (isNaN(batchCount) || batchCount < 1) batchCount = 1;
  if (batchCount > 10) batchCount = 10;

  // 使用 A/B 測試時，固定輸出兩組
  if (abTest) batchCount = 2;

  const results = [];
  const ytResults = [];

  // 系列模式：第一組決定風格，其餘沿用
  let seriesBackground, seriesTool, seriesSpeed, seriesTime;

  if (seriesMode) {
    seriesBackground = getValOrAuto("background", backgrounds, autoMode);
    seriesTool = getValOrAuto("tool", tools, autoMode);
    seriesSpeed = getValOrAuto("speed", speeds, autoMode);
    seriesTime = Number(getValOrAuto("totalTime", times, autoMode));
  }

  // 解析 pattern / finish
  function resolvePattern() {
    if (pattern !== "auto" && patterns.includes(pattern)) return pattern;
    return autoPatternWeighted(); // 偏向 reveal
  }

  function resolveFinish(pat) {
    if (finishRatio !== "auto") return finishRatio;
    return autoFinishForPattern(pat);
  }

  // ===== A/B 測試模式 =====
  if (abTest) {
    let subject;
    if (presetKey && presets[presetKey]) {
      subject = presets[presetKey].subject;
    } else {
      subject = getValOrAuto("subject", subjectsFree, autoMode);
    }

    const bg = seriesMode
      ? seriesBackground
      : getValOrAuto("background", backgrounds, autoMode);
    const tool = seriesMode
      ? seriesTool
      : getValOrAuto("tool", tools, autoMode);
    const baseSpeed = seriesMode
      ? seriesSpeed
      : getValOrAuto("speed", speeds, autoMode);
    const baseTime = seriesMode
      ? seriesTime
      : Number(getValOrAuto("totalTime", times, autoMode));

    const variants = [
      { label: "A", pattern: "smooth", finishRatio: "0.85" },
      { label: "B", pattern: "reveal", finishRatio: "0.95" }
    ];

    variants.forEach(v => {
      const core = buildCorePrompt({
        subject,
        background: bg,
        tool,
        speed: baseSpeed,
        totalTime: baseTime,
        strict,
        useHook: hookEnabled,
        hookStyle,
        pattern: v.pattern,
        finishRatio: v.finishRatio
      });

      const profile = platformProfiles[platform] || platformProfiles.sora;
      const full = profile({ core });

      results.push(`(${v.label}) ${full}`);
      ytResults.push(buildYTMeta({
        subject,
        speed: baseSpeed,
        totalTime: baseTime,
        label: v.label
      }));
    });
  } else {
    // ===== 一般 / Batch 模式 =====
    for (let i = 0; i < batchCount; i++) {
      let subject;
      if (presetKey && presets[presetKey]) {
        subject = presets[presetKey].subject;
      } else {
        subject = getValOrAuto("subject", subjectsFree, autoMode);
      }

      const bg = seriesMode && i > 0
        ? seriesBackground
        : getValOrAuto("background", backgrounds, autoMode);

      const tool = seriesMode && i > 0
        ? seriesTool
        : getValOrAuto("tool", tools, autoMode);

      const speed = seriesMode && i > 0
        ? seriesSpeed
        : getValOrAuto("speed", speeds, autoMode);

      const totalTime = seriesMode && i > 0
        ? seriesTime
        : Number(getValOrAuto("totalTime", times, autoMode));

      const pat = resolvePattern();
      const fin = resolveFinish(pat);

      const core = buildCorePrompt({
        subject,
        background: bg,
        tool,
        speed,
        totalTime,
        strict,
        useHook: hookEnabled,
        hookStyle,
        pattern: pat,
        finishRatio: fin
      });

      const profile = platformProfiles[platform] || platformProfiles.sora;
      const full = profile({ core });

      if (batchCount === 1) {
        results.push(full);
      } else {
        results.push(`(${i + 1}) ${full}`);
      }

      ytResults.push(buildYTMeta({ subject, speed, totalTime }));
    }
  }

  const out = document.getElementById("output");
  const yt = document.getElementById("ytmeta");

  out.value = results.join("\n\n");
  if (yt) yt.value = ytResults.join("\n\n");

  out.focus();
  out.select();

  try {
    localStorage.setItem("one_stroke_last", out.value);
  } catch (e) {}
}

// ===== Buttons =====
function randomAll() {
  generatePrompt(true);
}

function copyPrompt() {
  const ta = document.getElementById("output");
  if (!ta.value.trim()) return;
  ta.focus();
  ta.select();
  document.execCommand("copy");
  alert("✅ Prompt copied");
}

function copyYT() {
  const ta = document.getElementById("ytmeta");
  if (!ta || !ta.value.trim()) return;
  ta.focus();
  ta.select();
  document.execCommand("copy");
  alert("✅ Title & Tags copied");
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  const proToggle = document.getElementById("proToggle");
  if (proToggle) {
    proToggle.addEventListener("change", () => {
      document.body.classList.toggle("pro-mode", proToggle.checked);
    });
  }

  // 預設 Basic 模式（看起來乾淨），但 Hook/Pattern 邏輯仍運作
  document.body.classList.remove("pro-mode");

  try {
    const last = localStorage.getItem("one_stroke_last");
    if (last) document.getElementById("output").value = last;
  } catch (e) {}
});
