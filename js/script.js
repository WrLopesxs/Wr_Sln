const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const html = document.documentElement;

// THEME
function getThemeIcon(theme) {
  if (theme === "light") {
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8" />
        <path d="M12 2.5v2.7M12 18.8v2.7M21.5 12h-2.7M5.2 12H2.5M18.7 5.3l-1.9 1.9M7.2 16.8l-1.9 1.9M18.7 18.7l-1.9-1.9M7.2 7.2 5.3 5.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7.2 7.2 0 0 0 9.8 9.8Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

function resolveInitialTheme() {
  const storedTheme = localStorage.getItem("wr-theme");
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
  if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}

function applyTheme(theme) {
  const toggle = document.querySelector("[data-theme-toggle]");
  const icon = document.querySelector("[data-theme-icon]");

  html.setAttribute("data-theme", theme);
  localStorage.setItem("wr-theme", theme);
  toggle?.setAttribute("aria-pressed", String(theme === "light"));

  if (icon) {
    icon.innerHTML = getThemeIcon(theme);
  }
}

function initThemeToggle() {
  const toggle = document.querySelector("[data-theme-toggle]");
  const icon = document.querySelector("[data-theme-icon]");
  if (!toggle || !icon) return;

  applyTheme(resolveInitialTheme());

  toggle.addEventListener("click", () => {
    const nextTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.classList.add("theme-transitioning");
    applyTheme(nextTheme);

    if (window.gsap) {
      gsap.fromTo(icon, { rotation: 0 }, { rotation: 360, duration: 0.5, ease: "power2.inOut" });
    }

    window.setTimeout(() => {
      html.classList.remove("theme-transitioning");
    }, 550);
  });
}

// LOADER
function initLoader() {
  const loader = document.querySelector("[data-loader]");
  if (!loader) return;

  if (!window.gsap || prefersReducedMotion) {
    loader.remove();
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => loader.remove()
  });

  tl.from(".loading-screen__brand", { opacity: 0, y: 12, duration: 0.45, ease: "power2.out" })
    .from(".loading-screen__line", { scaleX: 0.2, opacity: 0.3, duration: 0.45, ease: "power2.out" }, "-=0.2")
    .to(loader, { opacity: 0, duration: 0.45, ease: "power2.out", delay: 0.25 });
}

// TEXT SPLIT
function splitWords(scope) {
  document.querySelectorAll(`[data-split="${scope}"]`).forEach((element) => {
    const text = element.textContent.trim().replace(/\s+/g, " ");
    element.innerHTML = text
      .split(" ")
      .map((word) => `<span class="word-mask"><span class="word">${word}</span></span>`)
      .join("");
  });
}

// NAVBAR
function initHeader() {
  const header = document.querySelector("[data-header]");
  const progress = document.querySelector("[data-progress]");

  function updateHeader() {
    const scrollY = window.scrollY;
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    const progressRatio = maxScroll > 0 ? scrollY / maxScroll : 0;

    header?.classList.toggle("is-scrolled", scrollY > 20);
    if (progress) {
      progress.style.width = `${Math.min(progressRatio * 100, 100)}%`;
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", updateHeader);
}

// CURSOR
function initCustomCursor() {
  if (prefersReducedMotion) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const outer = document.querySelector("[data-cursor-outer]");
  const inner = document.querySelector("[data-cursor-inner]");
  if (!outer || !inner) return;

  const state = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    outerX: window.innerWidth / 2,
    outerY: window.innerHeight / 2,
    isActive: false,
    isInteractive: false
  };

  const interactiveSelector = "a, button, [data-lightbox], .feature-card, .project-card, .difference-card, .tech-pill";

  const setInteractive = (value) => {
    state.isInteractive = value;
    outer.style.width = value ? "56px" : "36px";
    outer.style.height = value ? "56px" : "36px";
    outer.style.background = value ? "rgba(109, 241, 216, 0.14)" : "rgba(58, 184, 255, 0.08)";
    outer.style.borderColor = value ? "rgba(109, 241, 216, 0.34)" : "rgba(255, 255, 255, 0.24)";
    inner.style.background = value
      ? "linear-gradient(135deg, var(--accent-tertiary), var(--accent-secondary))"
      : "linear-gradient(135deg, var(--accent-secondary), var(--accent-tertiary))";
  };

  window.addEventListener("pointermove", (event) => {
    state.x = event.clientX;
    state.y = event.clientY;
    if (!state.isActive) {
      outer.style.opacity = "1";
      inner.style.opacity = "1";
      state.isActive = true;
    }

    const target = event.target.closest(interactiveSelector);
    setInteractive(Boolean(target));
  });

  window.addEventListener("pointerleave", () => {
    outer.style.opacity = "0";
    inner.style.opacity = "0";
    state.isActive = false;
  });

  const render = () => {
    state.outerX += (state.x - state.outerX) * 0.16;
    state.outerY += (state.y - state.outerY) * 0.16;

    outer.style.transform = `translate3d(${state.outerX}px, ${state.outerY}px, 0) translate3d(-50%, -50%, 0)`;
    inner.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate3d(-50%, -50%, 0)`;

    requestAnimationFrame(render);
  };

  render();
}

// MOBILE MENU
function initMobileMenu() {
  const menu = document.querySelector("[data-mobile-menu]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const close = document.querySelector("[data-menu-close]");
  const links = menu?.querySelectorAll("a") || [];

  if (!menu || !toggle || !close) return;

  function setOpen(isOpen) {
    menu.classList.toggle("is-open", isOpen);
    menu.setAttribute("aria-hidden", String(!isOpen));
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  toggle.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));
  links.forEach((link) => link.addEventListener("click", () => setOpen(false)));

  menu.addEventListener("click", (event) => {
    if (event.target === menu) setOpen(false);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

// NAV HEADER
function initNavHeader() {
  const nav = document.querySelector("[data-nav-header]");
  const cursor = document.querySelector("[data-nav-cursor]");
  const items = document.querySelectorAll(".nav-header__item");

  if (!nav || !cursor || !items.length) return;

  const showCursor = (item) => {
    const width = item.offsetWidth;
    const left = item.offsetLeft;

    cursor.style.width = `${width}px`;
    cursor.style.transform = `translateX(${left}px)`;
    cursor.style.opacity = "1";
  };

  items.forEach((item) => {
    item.addEventListener("mouseenter", () => showCursor(item));
    item.addEventListener("focusin", () => showCursor(item));
  });

  nav.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });

  nav.addEventListener("focusout", (event) => {
    if (!nav.contains(event.relatedTarget)) {
      cursor.style.opacity = "0";
    }
  });
}

// PAPER SHADERS
function initPaperShaderBackground() {
  const root = document.querySelector("[data-paper-shader]");
  if (!root) return;

  const orbs = root.querySelectorAll(".paper-shader-bg__orb");
  const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.3 };
  const smooth = { x: pointer.x, y: pointer.y };

  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });

  const render = (now) => {
    const time = now * 0.00008;

    smooth.x += (pointer.x - smooth.x) * 0.035;
    smooth.y += (pointer.y - smooth.y) * 0.035;

    root.style.setProperty("--shader-x", `${(smooth.x / window.innerWidth) * 100}%`);
    root.style.setProperty("--shader-y", `${(smooth.y / window.innerHeight) * 100}%`);
    root.style.setProperty("--shader-time", String((Math.sin(time) + 1) * 0.5));

    orbs.forEach((orb, index) => {
      const driftX = Math.sin(time * (index + 1.2) * 8) * (18 + index * 6);
      const driftY = Math.cos(time * (index + 1.5) * 7) * (14 + index * 5);
      orb.style.transform = `translate3d(${driftX}px, ${driftY}px, 0)`;
    });

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}

// HERO TILT
function initTiltCards() {
  if (prefersReducedMotion) return;

  document.querySelectorAll("[data-tilt-card]").forEach((card) => {
    const onMove = (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = Math.max(Math.min((x - 0.5) * 10, 6), -6);
      const rotateX = Math.max(Math.min((0.5 - y) * 8, 5), -5);

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    };

    const reset = () => {
      card.style.transform = "";
    };

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", reset);
  });
}

// SPOTLIGHT CARDS
function initSpotlightCards() {
  const cards = document.querySelectorAll(".spotlight-card");
  if (!cards.length) return;

  const colorMap = {
    blue: { base: 220, spread: 200 },
    purple: { base: 280, spread: 300 },
    green: { base: 120, spread: 200 },
    red: { base: 0, spread: 200 },
    orange: { base: 30, spread: 200 }
  };

  cards.forEach((card, index) => {
    if (!card.querySelector(".spotlight-card__border")) {
      const border = document.createElement("span");
      border.className = "spotlight-card__border";
      border.setAttribute("aria-hidden", "true");
      card.prepend(border);
    }

    if (!card.querySelector(".spotlight-card__glow")) {
      const glow = document.createElement("span");
      glow.className = "spotlight-card__glow";
      glow.setAttribute("aria-hidden", "true");
      card.prepend(glow);
    }

    const palette = index % 5 === 0
      ? colorMap.blue
      : index % 5 === 1
        ? colorMap.purple
        : index % 5 === 2
          ? colorMap.green
          : index % 5 === 3
            ? colorMap.orange
            : colorMap.red;

    card.style.setProperty("--base", String(palette.base));
    card.style.setProperty("--spread", String(palette.spread));
  });

  const syncPointer = (event) => {
    const x = event.clientX;
    const y = event.clientY;
    const xp = (x / window.innerWidth).toFixed(3);
    const yp = (y / window.innerHeight).toFixed(3);

    cards.forEach((card) => {
      card.style.setProperty("--x", x.toFixed(2));
      card.style.setProperty("--y", y.toFixed(2));
      card.style.setProperty("--xp", xp);
      card.style.setProperty("--yp", yp);
    });
  };

  document.addEventListener("pointermove", syncPointer, { passive: true });
}

// PARALLAX
function initAdvancedParallax() {
  if (prefersReducedMotion) return;

  const layers = [...document.querySelectorAll("[data-parallax-layer]")];
  if (!layers.length) return;

  const mouse = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };
  let scrollTarget = window.scrollY;
  let scrollCurrent = window.scrollY;

  window.addEventListener("pointermove", (event) => {
    mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (event.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener("scroll", () => {
    scrollTarget = window.scrollY;
  }, { passive: true });

  const render = () => {
    smooth.x += (mouse.x - smooth.x) * 0.08;
    smooth.y += (mouse.y - smooth.y) * 0.08;
    scrollCurrent += (scrollTarget - scrollCurrent) * 0.08;

    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || 0.1);
      const moveX = smooth.x * depth * 24;
      const moveY = smooth.y * depth * 18 + scrollCurrent * depth * -0.04;
      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    requestAnimationFrame(render);
  };

  render();
}

// LIGHTBOX
function openLightbox(src, alt) {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lb-img");
  if (!lb || !img) return;

  img.src = src;
  img.alt = alt || "Imagem do projeto";
  lb.style.display = "flex";
  document.body.style.overflow = "hidden";

  if (window.gsap && !prefersReducedMotion) {
    gsap.fromTo(
      img,
      { scale: 0.88, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.28, ease: "back.out(1.4)" }
    );
  }
}

function closeLightbox() {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lb-img");
  if (!lb || !img) return;

  const complete = () => {
    lb.style.display = "none";
    document.body.style.overflow = "";
  };

  if (window.gsap && !prefersReducedMotion) {
    gsap.to(img, {
      scale: 0.88,
      opacity: 0,
      duration: 0.18,
      ease: "power2.in",
      onComplete: complete
    });
    return;
  }

  complete();
}

function initLightbox() {
  const selectors = ".case-img-main, .case-img-grid img, .project-card img, [data-lightbox]";
  document.querySelectorAll(selectors).forEach((img) => {
    img.addEventListener("click", () => openLightbox(img.src, img.alt));
  });

  document.getElementById("lb-backdrop")?.addEventListener("click", closeLightbox);
  document.getElementById("lb-close")?.addEventListener("click", closeLightbox);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });
}

// COUNTERS
function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion) {
    counters.forEach((counter) => {
      const suffix = counter.dataset.suffix || "";
      counter.textContent = `${counter.dataset.target}${suffix}`;
    });
    return;
  }

  counters.forEach((counter) => {
    const target = Number(counter.dataset.target || 0);
    const suffix = counter.dataset.suffix || "";
    const state = { value: 0 };

    gsap.to(state, {
      value: target,
      duration: 1.4,
      ease: "power2.out",
      paused: true,
      onUpdate() {
        counter.textContent = `${Math.round(state.value)}${suffix}`;
      },
      scrollTrigger: {
        trigger: counter.closest("[data-counter-card]") || counter,
        start: "top 75%",
        once: true,
        onEnter: () => {
          state.value = 0;
          counter.textContent = `0${suffix}`;
        }
      }
    });
  });
}

// FOOTER
function initFooterMotion() {
  const footer = document.querySelector("[data-footer-stage]");
  const card = document.querySelector("[data-footer-card]");
  const links = document.querySelectorAll("[data-footer-links] .footer-block, [data-footer-bottom]");

  if (!footer || !card || !window.gsap || !window.ScrollTrigger || prefersReducedMotion) return;

  gsap.fromTo(
    card,
    { y: 40, opacity: 0.35 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: footer,
        start: "top 85%",
        end: "top 40%",
        scrub: 1
      }
    }
  );

  gsap.fromTo(
    links,
    { y: 32, opacity: 0.2 },
    {
      y: 0,
      opacity: 1,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: footer,
        start: "top 75%",
        end: "bottom bottom",
        scrub: 1
      }
    }
  );
}

// FALLBACK
function showStaticState() {
  document.querySelectorAll(".reveal, [data-stagger-group] > *, .reveal-media-right, .reveal-media-left, .word").forEach((element) => {
    element.style.opacity = "1";
    element.style.transform = "none";
  });

  document.querySelectorAll(".section-divider").forEach((divider) => {
    divider.style.transform = "scaleX(1)";
  });
}

// ANIMAÇÕES
function initAnimations() {
  if (!window.gsap || !window.ScrollTrigger) {
    showStaticState();
    return;
  }

  if (prefersReducedMotion) {
    showStaticState();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.set(".reveal", { opacity: 0.25, y: 24 });
  gsap.set(".reveal-media-right", { opacity: 0.25, x: 24 });
  gsap.set(".reveal-media-left", { opacity: 0.25, x: -24 });
  gsap.set("[data-stagger-group] > *", { opacity: 0.25, y: 24 });
  gsap.set(".section-divider", { scaleX: 0 });

  // HERO
  const heroTimeline = gsap.timeline();
  heroTimeline
    .from(".site-nav > *", { opacity: 0.25, y: -16, duration: 0.6, stagger: 0.08, ease: "power2.out" })
    .from(".hero__eyebrow-row", { opacity: 0.25, y: 24, duration: 0.6, ease: "power2.out" }, "-=0.2")
    .to(".hero__title .word", { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }, "-=0.15")
    .from(".hero__subtitle", { opacity: 0.25, y: 24, duration: 0.6, ease: "power2.out" }, "-=0.2")
    .from(".hero__actions", { opacity: 0.25, y: 24, duration: 0.6, ease: "back.out(1.2)" }, "-=0.15")
    .from(".hero__proof span", { opacity: 0.25, y: 18, duration: 0.5, stagger: 0.06, ease: "power2.out" }, "-=0.2")
    .from(".stats-grid > *", { opacity: 0.25, y: 24, duration: 0.6, stagger: 0.08, ease: "power2.out" }, "-=0.15")
    .from(".hero__visual", { opacity: 0.25, y: 24, duration: 0.6, ease: "power2.out" }, "-=0.35");

  gsap.to(".hero-dash--main", {
    boxShadow: "0 0 0 1px rgba(58, 184, 255, 0.22), 0 28px 60px rgba(58, 184, 255, 0.14)",
    duration: 2.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // HERO PARALLAX
  gsap.to(".hero__visual", {
    y: 18,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  // DIVISORES
  document.querySelectorAll(".section-divider").forEach((divider) => {
    gsap.to(divider, {
      scaleX: 1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: divider,
        start: "top 75%",
        end: "bottom 15%",
        toggleActions: "play reverse play reverse"
      }
    });
  });

  // TEXTOS E CARDS
  document.querySelectorAll(".reveal").forEach((element) => {
    gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 75%",
        end: "bottom 15%",
        toggleActions: "play reverse play reverse"
      }
    });
  });

  document.querySelectorAll(".reveal-media-right").forEach((element) => {
    gsap.to(element, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 75%",
        end: "bottom 15%",
        toggleActions: "play reverse play reverse"
      }
    });
  });

  document.querySelectorAll(".reveal-media-left").forEach((element) => {
    gsap.to(element, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 75%",
        end: "bottom 15%",
        toggleActions: "play reverse play reverse"
      }
    });
  });

  document.querySelectorAll("[data-stagger-group]").forEach((group) => {
    gsap.to(group.children, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: group,
        start: "top 75%",
        end: "bottom 15%",
        toggleActions: "play reverse play reverse"
      }
    });
  });
}

// APP
function initApp() {
  splitWords("hero");
  initLoader();
  initThemeToggle();
  initHeader();
  initPaperShaderBackground();
  initCustomCursor();
  initMobileMenu();
  initNavHeader();
  initTiltCards();
  initSpotlightCards();
  initAdvancedParallax();
  initLightbox();
  initCounters();
  initAnimations();
  initFooterMotion();
}

initApp();
