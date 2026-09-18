const fallbackContent = {
  identity: {
    name: "Mayank Verma",
    eyebrow: "Unity Developer",
    headline: "Gameplay programmer building polished Unity experiences across game systems, AR/XR, PlayFab, and interactive training.",
    location: "Delhi / Noida, India",
    email: "mayankvermacod@gmail.com",
    phone: "+91 7610278231",
    resume: "assets/MayankVerma_Resume.pdf",
    quote: "Be the change that you want to see in the world."
  },
  dialogue: ["I build gameplay systems that make interaction feel clear, responsive, and satisfying."],
  experience: [],
  professionalWork: [],
  games: [],
  skills: {},
  links: [],
  contentCreation: { description: "" },
  contact: { formspreeEndpoint: "" }
};

let portfolio = fallbackContent;
let dialogueIndex = 0;
let typingTimer;

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

function setBoundText() {
  document.querySelectorAll("[data-bind]").forEach((node) => {
    const value = node.dataset.bind.split(".").reduce((source, key) => source?.[key], portfolio);
    node.textContent = value ?? "";
  });
  document.title = `${portfolio.identity.name} | Unity Developer`;
}

function renderHero() {
  const status = byId("status-panel");
  status.replaceChildren();
  const title = element("p", "status-title", "SAVE FILE 01");
  const state = element("span", "status-state", "READY");
  title.append(state);
  const list = element("dl", "status-list");
  const rows = [
    ["Role", portfolio.identity.role],
    ["Base", portfolio.identity.location],
    ["Focus", portfolio.identity.focus],
    ["Status", portfolio.identity.availability]
  ];
  rows.forEach(([label, value]) => {
    const row = element("div");
    row.append(element("dt", "", label), element("dd", "", value));
    list.append(row);
  });
  status.append(title, list);

  const actions = byId("hero-actions");
  actions.replaceChildren(
    externalLink("View professional work", "#professional-work", "button primary"),
    externalLink("Download resume", portfolio.identity.resume, "button")
  );
}

function typeDialogue(line) {
  const target = byId("dialogue-line");
  window.clearInterval(typingTimer);
  target.textContent = "";
  let index = 0;
  typingTimer = window.setInterval(() => {
    target.textContent += line.charAt(index);
    index += 1;
    if (index >= line.length) window.clearInterval(typingTimer);
  }, 14);
}

function showDialogue(nextIndex) {
  dialogueIndex = (nextIndex + portfolio.dialogue.length) % portfolio.dialogue.length;
  typeDialogue(portfolio.dialogue[dialogueIndex]);
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

function renderProfessionalWork() {
  const root = byId("professional-grid");
  root.replaceChildren();
  portfolio.professionalWork.forEach((project) => {
    const card = element("article", "project-card");
    const media = element("div", "project-media");
    const image = document.createElement("img");
    image.className = "project-cover";
    image.src = project.cover;
    image.alt = `${project.title} screenshot`;
    image.loading = "lazy";
    const mask = element("div", "project-mask");
    mask.setAttribute("aria-hidden", "true");
    mask.append(element("span", "mask-symbol", "//"), element("span", "mask-title", project.title), element("span", "mask-index", `0${project.order || 1}`));
    const body = element("div", "project-body");
    body.append(element("p", "project-type", project.type));
    body.append(element("h3", "", project.title));
    body.append(element("p", "project-summary", project.summary));
    body.append(renderTags(project.stack));
    const open = element("button", "button project-open", "Watch demo + screenshots");
    open.type = "button";
    open.addEventListener("click", () => openProject(project));
    body.append(open);
    media.append(image, mask);
    card.append(media, body);
    root.append(card);
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
    section.append(element("h3", "", group), renderTags(skills));
    root.append(section);
  });
}

function renderLinks() {
  const creator = byId("creator-links");
  const contact = byId("contact-links");
  creator.replaceChildren();
  contact.replaceChildren();
  portfolio.links.forEach((link) => {
    const target = externalLink(link.label, link.url, link.kind === "creator" ? "creator-link" : "contact-link");
    if (link.kind === "creator") {
      const icon = element("span", `creator-icon ${link.label.toLowerCase()}`);
      icon.setAttribute("aria-hidden", "true");
      target.prepend(icon);
    }
    if (link.kind === "creator") creator.append(target);
    else contact.append(target);
  });
  contact.append(externalLink(portfolio.identity.email, `mailto:${portfolio.identity.email}`, "contact-link"));
  contact.append(externalLink("Download resume", portfolio.identity.resume, "contact-link"));
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
      status.textContent = "The contact form is being connected. Please use the email link for now.";
      return;
    }
    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    status.textContent = "Sending message...";
    try {
      const response = await fetch(portfolio.contact.formspreeEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      });
      if (!response.ok) throw new Error("Form service error");
      form.reset();
      status.textContent = "Message sent. Thank you.";
    } catch {
      status.textContent = "Something went wrong. Please use the email link instead.";
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
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("mayank-theme", nextTheme);
    applyTheme(nextTheme);
  });
}

function setupDialog() {
  const dialog = byId("project-dialog");
  byId("dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function setupRevealAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const targets = document.querySelectorAll(".section-intro, .timeline-item, .project-card, .game-card, .skill-group, .creator-link, .contact-copy, .contact-form");
  document.body.classList.add("motion-ready");
  targets.forEach((target) => target.classList.add("reveal"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  targets.forEach((target) => observer.observe(target));
}

function setupStarField() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches) return;
  const canvas = byId("star-canvas");
  const context = canvas.getContext("2d");
  const stars = [];
  const ripples = [];
  const mouse = { x: -1000, y: -1000, active: false };
  const radius = 300;

  function resize() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const count = Math.min(260, Math.max(120, Math.round((window.innerWidth * window.innerHeight) / 7800)));
    while (stars.length < count) {
      stars.push({
        homeX: Math.random() * window.innerWidth,
        homeY: Math.random() * window.innerHeight,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.9 + .55,
        phase: Math.random() * Math.PI * 2
      });
    }
    stars.splice(count);
  }

  function draw(time) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const color = getComputedStyle(document.documentElement).getPropertyValue("--purple").trim();
    context.shadowColor = color;
    context.shadowBlur = 7;
    stars.forEach((star) => {
      const driftX = Math.cos(time / 1900 + star.phase) * .08;
      const driftY = Math.sin(time / 1700 + star.phase) * .08;
      star.x += (star.homeX - star.x) * .012 + driftX;
      star.y += (star.homeY - star.y) * .012 + driftY;
      if (mouse.active) {
        const deltaX = mouse.x - star.x;
        const deltaY = mouse.y - star.y;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance < radius && distance > 1) {
          const pull = (1 - distance / radius) * .085;
          star.x += deltaX * pull;
          star.y += deltaY * pull;
          const orbit = (1 - distance / radius) * .75;
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
      const shimmer = .58 + Math.sin(time / 850 + star.phase) * .25;
      context.fillStyle = color;
      context.globalAlpha = shimmer;
      context.fillRect(star.x, star.y, star.size, star.size);
    });
    for (let index = ripples.length - 1; index >= 0; index -= 1) {
      const ripple = ripples[index];
      const age = time - ripple.started;
      if (age > 780) {
        ripples.splice(index, 1);
        continue;
      }
      const progress = age / 780;
      context.globalAlpha = (1 - progress) * .7;
      context.lineWidth = 2 - progress;
      context.strokeStyle = color;
      context.beginPath();
      context.arc(ripple.x, ripple.y, 10 + progress * 128, 0, Math.PI * 2);
      context.stroke();
    }
    context.shadowBlur = 0;
    context.globalAlpha = 1;
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
  window.addEventListener("pointerleave", () => { mouse.active = false; });
  window.addEventListener("resize", resize);
  resize();
  window.requestAnimationFrame(draw);
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
  setupRevealAnimations();
  setupStarField();
  byId("next-dialogue").addEventListener("click", () => showDialogue(dialogueIndex + 1));
  showDialogue(0);
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
