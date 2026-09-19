const fallbackContent = {
  identity: {
    name: "Mayank Verma",
    eyebrow: "Game & Unity Developer",
    headline: "Junior Unity Developer building gameplay mechanics, AR/VR experiences, PlayFab cloud integrations, and interactive Unity projects.",
    role: "Junior Unity Developer",
    certification: "Unity Certified Associate: Game Developer",
    certificationUrl: "https://www.credly.com/badges/0579c099-e34f-4c74-a5a1-331111efb068/public_url",
    focus: "Gameplay, AR/VR, PlayFab, Multiplayer",
    level: "LV 23",
    availability: "Open to Full-Time Roles",
    location: "Delhi / Noida, India",
    email: "mayankvermacod@gmail.com",
    phone: "+91 7610278231",
    resume: "assets/MayankVerma_Resume.pdf",
    logo: "assets/logo.jpg",
    favicon: "assets/favicon.png",
    quote: "Be the change that you want to see in the world."
  },
  dialogue: [
    "Junior Unity Developer experienced in mobile, WebGL, AR, and VR projects at Hapz Software Solutions.",
    "I enjoy making games, playing games, and talking about game design—you can catch me livestreaming on my YouTube channel and making dev videos on Instagram!",
    "Hands-on with C#, ScriptableObjects, state machines, and connecting games to PlayFab for cloud saves and leaderboards.",
    "Always building and learning—experimenting with everything from 2D platformers and 3D cooking prototypes to multiplayer and XR.",
    "The thought of building great games fills you with DETERMINATION."
  ],
  experience: [],
  professionalWork: [],
  games: [],
  skills: {},
  links: [],
  contentCreation: { description: "" },
  contact: { formspreeEndpoint: "https://formspree.io/f/xrpbbwle" }
};

let portfolio = fallbackContent;
let dialogueIndex = 0;
let typingTimer;
let isTyping = false;
let currentFullLine = "";
let toastTimer;

function byId(id) {
  return document.getElementById(id);
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function externalLink(label, href, className = "text-link") {
  const link = element("a", className, label);
  link.href = href;
  if (href.startsWith("http")) {
    link.target = "_blank";
    link.rel = "noreferrer";
  }
  return link;
}

/* ==========================================================================
   Background Music Controller (Undertale BGM)
   ========================================================================== */
const BGM = (() => {
  const audio = new Audio("assets/audio/bgm.mp3");
  audio.loop = true;
  audio.volume = 0.15; // Low volume as requested
  let isPlaying = false;
  let enabled = localStorage.getItem("mayank-bgm") === "true";

  function updateUi() {
    const btn = byId("music-toggle");
    if (!btn) return;
    if (enabled && isPlaying) {
      btn.classList.add("active");
      btn.setAttribute("aria-label", "Pause background music (BGM: ON)");
      btn.title = "Pause background music (BGM: ON)";
    } else {
      btn.classList.remove("active");
      btn.setAttribute("aria-label", "Play background music (BGM: OFF)");
      btn.title = "Play background music (BGM: OFF)";
    }
  }

  function play() {
    audio.play().then(() => {
      isPlaying = true;
      updateUi();
    }).catch(() => {
      isPlaying = false;
      updateUi();
    });
  }

  function pause() {
    audio.pause();
    isPlaying = false;
    updateUi();
  }

  function toggle() {
    enabled = !enabled;
    localStorage.setItem("mayank-bgm", enabled ? "true" : "false");
    if (enabled) {
      play();
      showRetroToast("* Playing background music ♫ (Vol: 15%)");
    } else {
      pause();
      showRetroToast("* Background music paused.");
    }
  }

  function handleFirstUserGesture() {
    if (enabled && !isPlaying) {
      play();
    }
  }

  return {
    play,
    pause,
    toggle,
    updateUi,
    handleFirstUserGesture,
    isEnabled: () => enabled,
    isPlaying: () => isPlaying
  };
})();

/* ==========================================================================
   Retro Web Audio Synthesizer & Sans Voice Engine
   ========================================================================== */
const RetroAudio = (() => {
  let ctx = null;
  // Default to enabled unless explicitly turned off by user
  let enabled = localStorage.getItem("mayank-sfx") !== "false";
  let sansBuffer = null;

  function getContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  function ensureContext() {
    const c = getContext();
    if (c && c.state === "suspended") {
      c.resume();
    }
    if (!sansBuffer) {
      loadSansVoice();
    }
  }

  async function loadSansVoice() {
    try {
      const c = getContext();
      if (!c) return;
      const response = await fetch("assets/audio/sans_voice.wav");
      if (!response.ok) return;
      const arrayBuffer = await response.arrayBuffer();
      sansBuffer = await c.decodeAudioData(arrayBuffer);
    } catch {
      // safe fallback to synth if fetch fails
    }
  }

  function isEnabled() {
    return enabled;
  }

  function setEnabled(val) {
    enabled = Boolean(val);
    localStorage.setItem("mayank-sfx", enabled ? "true" : "false");
    updateUi();
  }

  function updateUi() {
    const btn = byId("sfx-toggle");
    if (!btn) return;
    if (enabled) {
      btn.classList.add("active");
      btn.setAttribute("aria-label", "Mute sound effects (SFX: ON)");
      btn.title = "Mute sound effects (SFX: ON)";
    } else {
      btn.classList.remove("active");
      btn.setAttribute("aria-label", "Enable sound effects (SFX: OFF)");
      btn.title = "Enable sound effects (SFX: OFF)";
    }
  }

  function tone(freq, type, duration, gainStart = 0.08, gainEnd = 0.001) {
    if (!enabled) return;
    try {
      const c = getContext();
      if (!c) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      const now = c.currentTime;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(gainStart, now);
      gain.gain.exponentialRampToValueAtTime(gainEnd, now + duration);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // AudioContext policy catch
    }
  }

  let lastVoiceTime = 0;

  function playSansVoice() {
    if (!enabled) return;
    try {
      const c = getContext();
      if (!c) return;

      // Crisper spacing between voice blips (~65ms cooldown) for brisk, lively pacing
      const now = performance.now();
      if (now - lastVoiceTime < 65) return;
      lastVoiceTime = now;

      if (sansBuffer) {
        const source = c.createBufferSource();
        const gain = c.createGain();

        // Subtle random pitch variation (+/- 6-8%) so each blip sounds organic rather than a robotic loop
        const pitchJitter = 0.94 + Math.random() * 0.12;
        source.playbackRate.setValueAtTime(pitchJitter, c.currentTime);

        // Subtle volume jitter
        const volume = 0.32 + Math.random() * 0.08;
        gain.gain.setValueAtTime(volume, c.currentTime);

        source.buffer = sansBuffer;
        source.connect(gain);
        gain.connect(c.destination);
        source.start();
      } else {
        // Fallback tone with randomized pitch
        const freq = 118 + Math.random() * 26;
        tone(freq, "square", 0.035, 0.045, 0.001);
      }
    } catch {
      // safe audio catch
    }
  }

  return {
    isEnabled,
    setEnabled,
    updateUi,
    ensureContext,
    loadSansVoice,
    playSansVoice,
    menuBlip() {
      tone(260, "square", 0.03, 0.038, 0.001);
    },
    clickBlip() {
      tone(480, "square", 0.045, 0.05, 0.001);
    },
    selectChime() {
      if (!enabled) return;
      tone(440, "square", 0.07, 0.06, 0.001);
      setTimeout(() => tone(660, "square", 0.1, 0.06, 0.001), 60);
    },
    saveChime() {
      if (!enabled) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        setTimeout(() => tone(freq, "triangle", 0.22, 0.06, 0.001), idx * 75);
      });
    }
  };
})();

/* ==========================================================================
   Retro Toast Notification System
   ========================================================================== */
function showRetroToast(message) {
  const toast = byId("retro-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  toast.setAttribute("aria-hidden", "false");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
    toast.setAttribute("aria-hidden", "true");
  }, 2800);
}

function setBoundText() {
  document.querySelectorAll("[data-bind]").forEach((node) => {
    const value = node.dataset.bind.split(".").reduce((source, key) => source?.[key], portfolio);
    node.textContent = value ?? "";
  });
  document.title = `${portfolio.identity.name} | ${portfolio.identity.role || "Junior Unity Developer"}`;
}

function getPlatformIcon(label) {
  const l = (label || "").toLowerCase();
  if (l.includes("linkedin")) {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>`;
  }
  if (l.includes("github")) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
    </svg>`;
  }
  if (l.includes("itch")) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2.5 4.5a2 2 0 0 0-2 2v9a4 4 0 0 0 4 4h.5a2.5 2.5 0 0 0 2.5-2.5v-.5h9v.5a2.5 2.5 0 0 0 2.5 2.5h.5a4 4 0 0 0 4-4v-9a2 2 0 0 0-2-2h-19zm5.5 3a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 1-1zm7.5 1a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm2.5 2a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/>
    </svg>`;
  }
  if (l.includes("youtube")) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>`;
  }
  if (l.includes("instagram")) {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>`;
  }
  if (l.includes("email") || l.includes("mail")) {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>`;
  }
  return `<span aria-hidden="true">🔗</span>`;
}

function renderHero() {
  const status = byId("status-panel");
  status.replaceChildren();

  const badge = element("div", "status-badge");
  const avatar = document.createElement("img");
  avatar.className = "status-badge-img";
  avatar.src = portfolio.identity.logo || "assets/logo.jpg";
  avatar.alt = `${portfolio.identity.name} logo`;
  avatar.width = 50;
  avatar.height = 50;
  avatar.loading = "lazy";

  const badgeMeta = element("div", "status-badge-info");
  const badgeName = element("p", "status-badge-name", portfolio.identity.name);
  const badgeLevel = element("p", "status-badge-level", `${portfolio.identity.level || "LV 23"} // READY`);
  badgeMeta.append(badgeName, badgeLevel);
  badge.append(avatar, badgeMeta);

  const title = element("p", "status-title", "SAVE FILE 02");
  const state = element("span", "status-state", "SAVED");
  title.append(state);
  const list = element("dl", "status-list");
  const rows = [
    ["Role", portfolio.identity.role || "Junior Unity Developer"],
    ["Credential", portfolio.identity.certification || "Unity Certified Associate: Game Developer"],
    ["Base", portfolio.identity.location || "Delhi / Noida, India"],
    ["Focus", portfolio.identity.focus || "Gameplay, AR/VR, PlayFab, Multiplayer"],
    ["Status", portfolio.identity.availability || "Open to Full-Time Roles"]
  ];
  rows.forEach(([label, value]) => {
    const row = element("div");
    const dd = element("dd");
    if (label === "Status") {
      const dot = element("span", "status-dot");
      dot.setAttribute("aria-hidden", "true");
      dd.append(dot, document.createTextNode(value));
    } else if (label === "Credential" && portfolio.identity.certificationUrl) {
      const link = externalLink(`${value} ↗`, portfolio.identity.certificationUrl, "hud-cert-link");
      link.title = "Verify official Unity Certified Associate credential on Credly";
      dd.append(link);
    } else {
      dd.textContent = value;
    }
    row.append(element("dt", "", label), dd);
    list.append(row);
  });

  const platformLinks = element("div", "status-links");
  platformLinks.setAttribute("aria-label", "Platform profiles");

  const linksToRender = [
    ...(portfolio.links || []),
    ...(portfolio.identity.email ? [{ label: "Email", url: `mailto:${portfolio.identity.email}` }] : [])
  ];

  linksToRender.forEach((link) => {
    const a = externalLink("", link.url, "status-link-circle");
    a.innerHTML = getPlatformIcon(link.label);
    a.title = `${link.label} (${portfolio.identity.name})`;
    a.setAttribute("aria-label", link.label);
    a.addEventListener("mouseenter", () => RetroAudio.menuBlip());
    platformLinks.append(a);
  });

  status.append(badge, title, list, platformLinks);

  const actions = byId("hero-actions");
  actions.replaceChildren(
    externalLink("View professional work", "#professional-work", "button primary"),
    externalLink("Download resume", portfolio.identity.resume, "button")
  );
}

/* ==========================================================================
   Typewriter Dialogue Box with Sans Voice & Fast-Forward QoL
   ========================================================================== */
function setDialogueInstant(line) {
  const target = byId("dialogue-line");
  if (!target) return;
  window.clearTimeout(typingTimer);
  const formatted = line.startsWith("* ") ? line : `* ${line}`;
  currentFullLine = formatted;
  target.textContent = formatted;
  isTyping = false;
}

function typeDialogue(line) {
  const target = byId("dialogue-line");
  if (!target) return;
  window.clearTimeout(typingTimer);
  const formatted = line.startsWith("* ") ? line : `* ${line}`;
  currentFullLine = formatted;
  target.textContent = "* ";
  let index = 2;
  isTyping = true;

  function typeNext() {
    if (!isTyping) return;
    if (index < currentFullLine.length) {
      const char = currentFullLine.charAt(index);
      target.textContent += char;
      index += 1;

      // Brisk character delay ~40-48ms (snappier dialogue speed)
      let delay = 44 + Math.floor(Math.random() * 8 - 4);

      if (/[a-zA-Z0-9]/.test(char)) {
        RetroAudio.playSansVoice();
      } else if (char === "," || char === ";") {
        delay = 120; // Snappy breath on commas
      } else if (char === "." || char === "!" || char === "?") {
        delay = 200; // Brief pause at end of sentences
      } else if (char === "-" || char === "—") {
        delay = 110;
      } else if (char === " ") {
        delay = 30;
      }

      typingTimer = window.setTimeout(typeNext, delay);
    } else {
      isTyping = false;
    }
  }

  typeNext();
}

function handleDialogueClick() {
  RetroAudio.ensureContext();
  if (isTyping) {
    window.clearTimeout(typingTimer);
    byId("dialogue-line").textContent = currentFullLine;
    isTyping = false;
    RetroAudio.selectChime();
  } else {
    showDialogue(dialogueIndex + 1);
  }
}

function showDialogue(nextIndex, instant = false) {
  dialogueIndex = (nextIndex + portfolio.dialogue.length) % portfolio.dialogue.length;
  if (instant) {
    setDialogueInstant(portfolio.dialogue[dialogueIndex]);
  } else {
    typeDialogue(portfolio.dialogue[dialogueIndex]);
  }
}

function renderExperience() {
  const root = byId("experience-list");
  root.replaceChildren();
  portfolio.experience.forEach((entry) => {
    const item = element("article", "timeline-item");
    const date = element("p", "timeline-date", entry.dates);
    const content = element("div", "timeline-content");
    content.append(element("p", "timeline-company", entry.company));
    content.append(element("h3", "", entry.role));
    content.append(element("p", "timeline-location", entry.location));
    const list = element("ul", "feature-list");
    entry.highlights.forEach((highlight) => list.append(element("li", "", highlight)));
    content.append(list);
    item.append(date, content);
    root.append(item);
  });
}

function renderTags(tags) {
  const container = element("div", "tag-list");
  tags.forEach((tag) => container.append(element("span", "tag", tag)));
  return container;
}

function getProjectCategory(project) {
  const text = `${project.title} ${project.type} ${project.stack.join(" ")}`.toLowerCase();
  const categories = [];
  if (text.includes("ar") || text.includes("vr") || text.includes("xr") || text.includes("quest")) {
    categories.push("ar-vr");
  }
  if (text.includes("puzzle") || text.includes("match-3") || text.includes("gameplay") || text.includes("detective") || text.includes("game")) {
    categories.push("gameplay");
  }
  if (text.includes("playfab") || text.includes("auth") || text.includes("tool") || text.includes("arcweave") || text.includes("localization")) {
    categories.push("tools");
  }
  return categories.join(" ");
}

function getProjectRetroIcon(title) {
  const t = (title || "").toLowerCase();
  if (t.includes("teleporto")) {
    return `<svg class="retro-icon" width="38" height="28" viewBox="0 0 38 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <ellipse cx="9" cy="14" rx="6" ry="11" stroke="#00f0ff"/>
      <ellipse cx="29" cy="14" rx="6" ry="11" stroke="#ff9d00"/>
      <path d="M15 14h8m-3-3l3 3-3 3" stroke="#ffff00"/>
    </svg>`;
  }
  if (t.includes("globe")) {
    return `<svg class="retro-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="16" cy="16" r="12" stroke="#00f0ff"/>
      <ellipse cx="16" cy="16" rx="5.5" ry="12" stroke="#8a5cf6"/>
      <line x1="4" y1="16" x2="28" y2="16" stroke="#00f0ff"/>
      <circle cx="23" cy="10" r="1.8" fill="#ffff00" stroke="none"/>
    </svg>`;
  }
  if (t.includes("emory") || t.includes("detective")) {
    return `<svg class="retro-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="13" cy="13" r="8" stroke="#ffff00"/>
      <line x1="19" y1="19" x2="28" y2="28" stroke="#ff9d00" stroke-width="3"/>
      <path d="M10 13h6m-3-3v6" stroke="#8a5cf6"/>
    </svg>`;
  }
  if (t.includes("earth") || t.includes("match")) {
    return `<svg class="retro-icon" width="36" height="30" viewBox="0 0 36 30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="18,2 24,11 18,20 12,11" stroke="#ff2a4b" fill="none"/>
      <polygon points="7,9 12,17 7,25 2,17" stroke="#00f0ff" fill="none"/>
      <polygon points="29,9 34,17 29,25 24,17" stroke="#ffff00" fill="none"/>
    </svg>`;
  }
  if (t.includes("vr") || t.includes("fire")) {
    return `<svg class="retro-icon" width="36" height="26" viewBox="0 0 36 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="4" y="5" width="28" height="16" rx="4" stroke="#8a5cf6"/>
      <line x1="18" y1="5" x2="18" y2="21" stroke="#00f0ff"/>
      <circle cx="11" cy="13" r="3" stroke="#00f0ff"/>
      <circle cx="25" cy="13" r="3" stroke="#ff9d00"/>
      <path d="M1 11h3m28 0h3" stroke="#8a5cf6"/>
    </svg>`;
  }
  return `<span class="retro-soul-glyph" aria-hidden="true">♥</span>`;
}

function renderProfessionalWork() {
  const root = byId("professional-grid");
  root.replaceChildren();
  portfolio.professionalWork.forEach((project) => {
    const card = element("article", "project-card");
    card.dataset.categories = getProjectCategory(project);

    const media = element("div", "project-media");
    const image = document.createElement("img");
    image.className = "project-cover";
    image.src = project.cover;
    image.alt = `${project.title} gameplay screenshot`;
    image.loading = "lazy";

    const retroCover = element("div", "project-retro-cover");
    retroCover.setAttribute("aria-hidden", "true");
    retroCover.innerHTML = `
      <div class="retro-cover-top">
        <span class="retro-cover-cart">CART // 0${project.order || 1}</span>
        <span class="retro-cover-soul">♥</span>
      </div>
      <div class="retro-cover-body">
        <div class="retro-cover-glyph">${getProjectRetroIcon(project.title)}</div>
        <h4 class="retro-cover-title">${project.title}</h4>
        <p class="retro-cover-type">${project.type}</p>
      </div>
      <div class="retro-cover-bot">
        <span class="retro-cover-prompt">[ ▶ HOVER TO REVEAL ]</span>
      </div>
    `;

    media.append(image, retroCover);

    const body = element("div", "project-body");
    body.append(element("p", "project-type", project.type));
    body.append(element("h3", "", project.title));
    body.append(element("p", "project-summary", project.summary));
    body.append(renderTags(project.stack));

    const open = element("button", "button project-open", "Watch demo + screenshots");
    open.type = "button";
    open.addEventListener("click", () => openProject(project));
    body.append(open);

    card.append(media, body);
    card.addEventListener("mouseenter", () => RetroAudio.menuBlip());
    root.append(card);
  });
}

function setupProjectFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      RetroAudio.menuBlip();
      const filter = btn.dataset.filter;
      const cards = document.querySelectorAll("#professional-grid .project-card");
      cards.forEach((card) => {
        if (filter === "all" || card.dataset.categories?.includes(filter)) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });
    });
  });
}

function renderGames() {
  const root = byId("games-grid");
  root.replaceChildren();
  portfolio.games.forEach((game) => {
    const card = element("article", "game-card");
    const image = document.createElement("img");
    image.src = game.cover;
    image.alt = `${game.title} placeholder cover art`;
    image.loading = "lazy";
    const body = element("div", "game-body");
    body.append(element("p", "project-type", game.status));
    body.append(element("h3", "", game.title));
    body.append(element("p", "project-summary", game.summary));
    body.append(renderTags(game.stack));
    const actions = element("div", "game-actions");
    actions.append(externalLink("View on itch.io", game.itchUrl, "button"));
    const details = element("button", "button secondary", "Game details");
    details.type = "button";
    details.addEventListener("click", () => openProject(game));
    actions.append(details);
    body.append(actions);
    card.append(image, body);
    root.append(card);
  });
}

function openProject(project) {
  RetroAudio.selectChime();
  const dialog = byId("project-dialog");
  const root = byId("dialog-content");
  root.replaceChildren();
  root.append(element("p", "kicker", project.type || project.status));
  root.append(element("h2", "dialog-title", project.title));
  root.append(element("p", "dialog-summary", project.summary));
  root.append(renderTags(project.stack));

  if (project.video) {
    const video = document.createElement("video");
    video.className = "project-video";
    video.controls = true;
    video.preload = "metadata";
    video.poster = project.cover;
    const source = document.createElement("source");
    source.src = project.video;
    source.type = "video/mp4";
    video.append(source);
    root.append(video);
  }

  if (project.embedUrl) {
    const frame = document.createElement("iframe");
    frame.className = "game-embed";
    frame.src = project.embedUrl;
    frame.title = `Play ${project.title}`;
    frame.loading = "lazy";
    frame.allowFullscreen = true;
    root.append(frame);
  }

  if (project.gallery?.length) {
    const gallery = element("div", "media-gallery");
    project.gallery.forEach((imagePath, imageIndex) => {
      const image = document.createElement("img");
      image.src = imagePath;
      image.alt = `${project.title} screenshot ${imageIndex + 1}`;
      image.loading = "lazy";
      gallery.append(image);
    });
    root.append(gallery);
  }

  if (project.highlights?.length) {
    const heading = element("h3", "dialog-subtitle", "My contribution");
    const list = element("ul", "feature-list");
    project.highlights.forEach((highlight) => list.append(element("li", "", highlight)));
    root.append(heading, list);
  }

  if (project.itchUrl) root.append(externalLink("Open on itch.io", project.itchUrl, "button primary"));
  dialog.showModal();
}

function renderSkills() {
  const root = byId("skills-grid");
  root.replaceChildren();
  Object.entries(portfolio.skills).forEach(([group, skills]) => {
    const section = element("article", "skill-group");
    if (group === "Certifications" && portfolio.identity.certificationUrl) {
      const container = element("div", "tag-list");
      skills.forEach((skill) => {
        const tag = externalLink(
          `${skill} ↗`,
          portfolio.identity.certificationUrl,
          "tag cert-tag-link"
        );
        tag.title = "Verify official Unity Certified Associate credential on Credly";
        container.append(tag);
      });
      section.append(element("h3", "", group), container);
    } else {
      section.append(element("h3", "", group), renderTags(skills));
    }
    root.append(section);
  });
}

function renderLinks() {
  const creator = byId("creator-links");
  const contact = byId("contact-links");
  if (creator) creator.replaceChildren();
  if (contact) contact.replaceChildren();

  portfolio.links.forEach((link) => {
    const isCreator = link.kind === "creator";
    const target = externalLink(link.label, link.url, isCreator ? "creator-link" : "contact-link");
    if (isCreator) {
      const lower = link.label.toLowerCase();
      const img = document.createElement("img");
      img.className = "creator-img";
      img.src = lower.includes("youtube") ? "assets/youtube.png" : "assets/instagram.png";
      img.alt = `${link.label} logo`;
      img.loading = "lazy";
      target.prepend(img);
      if (creator) creator.append(target);
    } else {
      if (contact) contact.append(target);
    }
  });

  // Email with one-click copy to clipboard QoL
  if (contact) {
    const emailLink = element("button", "contact-link email-copyable", portfolio.identity.email);
    emailLink.type = "button";
    emailLink.setAttribute("title", "Click to copy email address");
    emailLink.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(portfolio.identity.email);
        RetroAudio.selectChime();
        showRetroToast("* Copied email to clipboard! (+10 HP)");
      } catch {
        window.location.href = `mailto:${portfolio.identity.email}`;
      }
    });
    contact.append(emailLink);
    contact.append(externalLink("Download resume", portfolio.identity.resume, "contact-link"));
  }
}

function setupContactForm() {
  const form = byId("contact-form");
  const status = byId("form-status");
  form.action = portfolio.contact.formspreeEndpoint || "";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!portfolio.contact.formspreeEndpoint || portfolio.contact.formspreeEndpoint.includes("REPLACE")) {
      status.textContent = "* The contact form is being connected. Please use the email link for now.";
      return;
    }
    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    status.textContent = "* Dispatching message...";
    try {
      const response = await fetch(portfolio.contact.formspreeEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      });
      if (!response.ok) throw new Error("Form service error");
      form.reset();
      RetroAudio.selectChime();
      status.textContent = "* Message sent! You are filled with DETERMINATION.";
      showRetroToast("* Transmission dispatched successfully! (+50 EXP)");
    } catch {
      status.textContent = "* Something went wrong. Please use the direct email link instead.";
    } finally {
      submitButton.disabled = false;
    }
  });
}

function setupTheme() {
  const toggle = byId("theme-toggle");
  const savedTheme = localStorage.getItem("mayank-theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    toggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  };
  applyTheme(savedTheme || (prefersLight ? "light" : "dark"));
  toggle.addEventListener("click", () => {
    RetroAudio.menuBlip();
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("mayank-theme", nextTheme);
    applyTheme(nextTheme);
  });
}

/* ==========================================================================
   Modal Dialog with Video Auto-Pause Bugfix
   ========================================================================== */
function setupDialog() {
  const dialog = byId("project-dialog");

  function stopMedia() {
    const video = dialog.querySelector("video");
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }

  byId("dialog-close").addEventListener("click", () => {
    stopMedia();
    dialog.close();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      stopMedia();
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    stopMedia();
  });
}

function setupRevealAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const targets = document.querySelectorAll(
    ".section-intro, .timeline-item, .project-card, .game-card, .skill-group, .creator-link, .contact-encounter-frame"
  );
  document.body.classList.add("motion-ready");
  targets.forEach((target) => target.classList.add("reveal"));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );
  targets.forEach((target) => observer.observe(target));
}

/* ==========================================================================
   Determination Save Stars Particle Canvas (Twinkling 4-Point Save Stars)
   ========================================================================== */
function setupStarField() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches) return;
  const canvas = byId("star-canvas");
  const context = canvas.getContext("2d");
  const stars = [];
  const ripples = [];
  const mouse = { x: -1000, y: -1000, active: false };
  const radius = 280;

  function drawSaveStar(ctx, cx, cy, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.quadraticCurveTo(cx, cy, cx + size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + size);
    ctx.quadraticCurveTo(cx, cy, cx - size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function resize() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const count = Math.min(180, Math.max(90, Math.round((window.innerWidth * window.innerHeight) / 9200)));
    while (stars.length < count) {
      stars.push({
        homeX: Math.random() * window.innerWidth,
        homeY: Math.random() * window.innerHeight,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3.2 + 1.2,
        isSpecial: Math.random() < 0.28,
        phase: Math.random() * Math.PI * 2
      });
    }
    stars.splice(count);
  }

  function draw(time) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const isLight = document.documentElement.dataset.theme === "light";
    const gold = isLight ? "#b45309" : (getComputedStyle(document.documentElement).getPropertyValue("--save-gold").trim() || "#ffeb3b");
    const purple = getComputedStyle(document.documentElement).getPropertyValue("--purple").trim() || "#ca6cff";

    stars.forEach((star) => {
      const driftX = Math.cos(time / 1900 + star.phase) * 0.08;
      const driftY = Math.sin(time / 1700 + star.phase) * 0.08;
      star.x += (star.homeX - star.x) * 0.012 + driftX;
      star.y += (star.homeY - star.y) * 0.012 + driftY;

      if (mouse.active) {
        const deltaX = mouse.x - star.x;
        const deltaY = mouse.y - star.y;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance < radius && distance > 1) {
          const pull = (1 - distance / radius) * 0.085;
          star.x += deltaX * pull;
          star.y += deltaY * pull;
          const orbit = (1 - distance / radius) * 0.75;
          const angle = Math.atan2(deltaY, deltaX) + Math.PI / 2;
          star.x += Math.cos(angle + time / 1300 + star.phase) * orbit;
          star.y += Math.sin(angle + time / 1100 + star.phase) * orbit;
        }
      }

      ripples.forEach((ripple) => {
        const age = time - ripple.started;
        const waveRadius = 10 + (age / 780) * 128;
        const deltaX = star.x - ripple.x;
        const deltaY = star.y - ripple.y;
        const distance = Math.hypot(deltaX, deltaY);
        const waveDistance = Math.abs(distance - waveRadius);
        if (age >= 0 && age <= 780 && waveDistance < 42 && distance > 1) {
          const waveForce = (1 - waveDistance / 42) * 2.2;
          star.x += (deltaX / distance) * waveForce;
          star.y += (deltaY / distance) * waveForce;
        }
      });

      const shimmer = 0.5 + Math.sin(time / 850 + star.phase) * 0.35;
      const color = star.isSpecial ? gold : purple;

      if (star.isSpecial) {
        drawSaveStar(context, star.x, star.y, star.size * 1.8, color, shimmer);
      } else {
        context.save();
        context.fillStyle = color;
        context.globalAlpha = shimmer;
        context.fillRect(star.x, star.y, star.size, star.size);
        context.restore();
      }
    });

    for (let index = ripples.length - 1; index >= 0; index -= 1) {
      const ripple = ripples[index];
      const age = time - ripple.started;
      if (age > 780) {
        ripples.splice(index, 1);
        continue;
      }
      const progress = age / 780;
      context.save();
      context.globalAlpha = (1 - progress) * 0.75;
      context.lineWidth = 2.5 - progress;
      context.strokeStyle = gold;
      context.beginPath();
      context.arc(ripple.x, ripple.y, 10 + progress * 128, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }

    window.requestAnimationFrame(draw);
  }

  window.addEventListener("pointermove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  });

  window.addEventListener("pointerdown", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
    ripples.push({ x: event.clientX, y: event.clientY, started: performance.now() });
  });

  window.addEventListener("pointerleave", () => {
    mouse.active = false;
  });

  window.addEventListener("resize", resize);
  resize();
  window.requestAnimationFrame(draw);
}

/* ==========================================================================
   Active Navigation Scroll Spy
   ========================================================================== */
function setupNavSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".site-nav a");

  window.addEventListener(
    "scroll",
    () => {
      let current = "";
      const scrollPos = window.scrollY + 140;
      sections.forEach((section) => {
        if (scrollPos >= section.offsetTop) {
          current = section.getAttribute("id");
        }
      });
      navLinks.forEach((link) => {
        const href = link.getAttribute("href")?.replace("#", "");
        if (href === current) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    },
    { passive: true }
  );
}

/* ==========================================================================
   Save Point Back to Top
   ========================================================================== */
function setupSavePoint() {
  const btn = byId("save-point-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    RetroAudio.saveChime();
    window.scrollTo({ top: 0, behavior: "smooth" });
    showRetroToast("* At the checkpoint, you are filled with DETERMINATION.");
  });
}

/* ==========================================================================
   Music & SFX Header Toggles & Sound Hooks
   ========================================================================== */
function setupMusicToggle() {
  const btn = byId("music-toggle");
  if (!btn) return;
  BGM.updateUi();
  btn.addEventListener("click", () => {
    RetroAudio.ensureContext();
    BGM.toggle();
  });
}

function setupSfxToggle() {
  const btn = byId("sfx-toggle");
  if (!btn) return;
  RetroAudio.updateUi();
  btn.addEventListener("click", () => {
    RetroAudio.ensureContext();
    const next = !RetroAudio.isEnabled();
    RetroAudio.setEnabled(next);
    if (next) {
      RetroAudio.selectChime();
      showRetroToast("* 8-bit sound effects activated!");
    } else {
      showRetroToast("* Sound effects muted.");
    }
  });
}

function setupInteractiveAudio() {
  // Unlock audio on any first gesture
  const unlock = () => {
    RetroAudio.ensureContext();
    BGM.handleFirstUserGesture();
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });

  // Hover sound on buttons, links, cards, filters
  let lastHoverEl = null;
  let lastHoverTime = 0;
  document.addEventListener(
    "mouseover",
    (event) => {
      const el = event.target.closest && event.target.closest(
        "button, .button, a, .creator-link, .contact-link, .project-card, .game-card, .filter-btn, .encounter-submit-btn, .dialogue-next, .save-point-btn"
      );
      if (el && el !== lastHoverEl) {
        lastHoverEl = el;
        const now = performance.now();
        if (now - lastHoverTime > 50) {
          lastHoverTime = now;
          RetroAudio.ensureContext();
          RetroAudio.menuBlip();
        }
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "mouseout",
    (event) => {
      if (lastHoverEl && (!event.relatedTarget || !lastHoverEl.contains(event.relatedTarget))) {
        lastHoverEl = null;
      }
    },
    { passive: true }
  );

  // Click sound on clickable items
  document.addEventListener(
    "click",
    (event) => {
      const el = event.target.closest && event.target.closest(
        "button, .button, a, .creator-link, .contact-link, .filter-btn"
      );
      if (el && el.id !== "music-toggle" && el.id !== "sfx-toggle" && !el.closest("#dialogue-box") && el.id !== "save-point-btn") {
        RetroAudio.clickBlip();
      }
    },
    { passive: true }
  );
}

function init() {
  setBoundText();
  renderHero();
  renderExperience();
  renderProfessionalWork();
  renderGames();
  renderSkills();
  renderLinks();
  setupContactForm();
  setupTheme();
  setupDialog();
  setupProjectFilters();
  setupSavePoint();
  setupNavSpy();
  setupMusicToggle();
  setupSfxToggle();
  setupInteractiveAudio();
  setupRevealAnimations();
  setupStarField();

  // Preload Sans voice
  RetroAudio.loadSansVoice();

  const dialogueBox = byId("dialogue-box");
  if (dialogueBox) {
    dialogueBox.addEventListener("click", handleDialogueClick);
  } else {
    byId("next-dialogue")?.addEventListener("click", handleDialogueClick);
  }

  // On first landing of the user, load all text at once so the user can read it immediately
  // and understand where the retro voice sound comes from when they tap on the dialogue box.
  showDialogue(0, true);
}

fetch("content.json")
  .then((response) => {
    if (!response.ok) throw new Error("Unable to load content.json");
    return response.json();
  })
  .then((content) => {
    portfolio = content;
    init();
  })
  .catch(() => {
    init();
  });
