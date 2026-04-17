    const revealItems = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -70px 0px" }
    );

    revealItems.forEach((item, i) => {
      item.style.transitionDelay = (i % 4) * 0.08 + "s";
      observer.observe(item);
    });

    const navWrap = document.querySelector(".nav-wrap");
    const navInner = document.querySelector(".nav-inner");
    const navToggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav");
    const orbs = Array.from(document.querySelectorAll(".orb"));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const smoothScrollTo = (targetY) => {
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    };

    const bindSmoothAnchor = (link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        const navHeight = navWrap?.offsetHeight ?? 0;
        const offset = navHeight + 14;
        const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
        smoothScrollTo(targetY);

        if (window.matchMedia("(max-width: 790px)").matches) {
          navInner?.classList.remove("open");
          navToggle?.setAttribute("aria-expanded", "false");
          navToggle.textContent = "\u2630";
        }
      });
    };

    document.querySelectorAll(".nav-links a[href^='#']").forEach(bindSmoothAnchor);
    document.querySelectorAll(".hero-actions a[href^='#'], .brand[href^='#']").forEach(bindSmoothAnchor);

    navToggle?.addEventListener("click", () => {
      const isOpen = navInner.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.textContent = isOpen ? "\u00D7" : "\u2630";
    });

    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 790px)").matches) {
        navInner?.classList.remove("open");
        navToggle?.setAttribute("aria-expanded", "false");
        if (navToggle) navToggle.textContent = "\u2630";
      }
    });

    const imageModal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const modalClose = document.getElementById("modalClose");
    const expandableImages = document.querySelectorAll(".gallery .screen img, .project-media");

    const closeModal = () => {
      imageModal.classList.remove("show");
      imageModal.setAttribute("aria-hidden", "true");
      modalImage.src = "";
    };

    expandableImages.forEach((img) => {
      img.addEventListener("click", () => {
        modalImage.src = img.src;
        modalImage.alt = img.alt || "Imagem ampliada";
        imageModal.classList.add("show");
        imageModal.setAttribute("aria-hidden", "false");
      });
    });

    modalClose.addEventListener("click", closeModal);
    imageModal.addEventListener("click", (event) => {
      if (event.target === imageModal) closeModal();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && imageModal.classList.contains("show")) {
        closeModal();
      }
    });

    let scrollTicking = false;

    const updateScrollEffects = () => {
      const y = window.scrollY;
      if (nav) {
        nav.style.transform = y > 20 ? "translateY(0) scale(0.992)" : "translateY(0) scale(1)";
      }

      orbs.forEach((orb, i) => {
        const speed = (i + 1) * 0.015;
        orb.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });

      scrollTicking = false;
    };

    const onScroll = () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(updateScrollEffects);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrollEffects();

    const darkToggle = document.getElementById("darkToggle");
    const STORAGE_KEY = "darkMode";

    const applyDarkMode = (enabled) => {
      document.body.classList.toggle("dark", enabled);
      if (!darkToggle) return;
      darkToggle.textContent = enabled ? "\u2600" : "\u263E";
      darkToggle.setAttribute("aria-label", enabled ? "Ativar modo claro" : "Ativar modo escuro");
      darkToggle.setAttribute("title", enabled ? "Modo claro" : "Modo escuro");
    };

    const savedPreference = localStorage.getItem(STORAGE_KEY);
    if (savedPreference === "true" || savedPreference === "false") {
      applyDarkMode(savedPreference === "true");
    } else {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyDarkMode(systemPrefersDark);
    }

    darkToggle?.addEventListener("click", () => {
      const nextState = !document.body.classList.contains("dark");
      applyDarkMode(nextState);
      localStorage.setItem(STORAGE_KEY, String(nextState));
    });
