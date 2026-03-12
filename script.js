
document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ===== Mobile menu =====
  const hamburger = $("#hamburger");
  const navLinks = $("#navLinks");

  const setMenuOpen = (open) => {
    if (!hamburger || !navLinks) return;
    navLinks.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
  };

  if (hamburger && navLinks) {
    hamburger.setAttribute("aria-controls", "navLinks");
    hamburger.setAttribute("aria-expanded", "false");

    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      setMenuOpen(!navLinks.classList.contains("open"));
    });

    $$("#navLinks a").forEach((a) => a.addEventListener("click", () => setMenuOpen(false)));

    document.addEventListener("click", (e) => {
      if (!navLinks.classList.contains("open")) return;
      const inside = navLinks.contains(e.target) || hamburger.contains(e.target);
      if (!inside) setMenuOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    });
  }

  // ===== Dark mode =====
  const darkToggle = $("#darkToggle");
  const THEME_KEY = "theme";

  const applyTheme = (theme) => {
    document.body.classList.toggle("dark", theme === "dark");
    if (darkToggle) darkToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  };

  const getPreferredTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };

  applyTheme(getPreferredTheme());

  if (darkToggle) {
    darkToggle.addEventListener("click", () => {
      const next = document.body.classList.contains("dark") ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  // ===== Smooth scroll for anchors =====
  const nav = $("nav");
  const navOffset = () => (nav ? nav.offsetHeight : 0);

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (!el) return;

      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.pageYOffset - navOffset() - 10;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // ===== Fade-in =====
  const fadeEls = $$(".fade-in");
  if ("IntersectionObserver" in window && fadeEls.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach((el) => io.observe(el));
  } else {
    fadeEls.forEach((el) => el.classList.add("visible"));
  }

  // ===== Counters (index) =====
  const counters = $$(".counter[data-target]");
  if (counters.length) {
    const animateCounter = (el, target, duration = 1200) => {
      const startTime = performance.now();
      const suffix = el.dataset.suffix || "";
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.round(target * easeOutCubic(progress));
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const startCounters = () => {
      counters.forEach((el) => {
        if (el.dataset.done === "true") return;
        const target = parseInt(el.dataset.target, 10);
        if (!Number.isFinite(target)) return;
        el.dataset.done = "true";
        animateCounter(el, target);
      });
    };

    if ("IntersectionObserver" in window) {
      const counterIO = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCounters();
            counters.forEach((c) => obs.unobserve(c));
          }
        });
      }, { threshold: 0.25 });

      counters.forEach((c) => counterIO.observe(c));
    } else {
      startCounters();
    }
  }
});
