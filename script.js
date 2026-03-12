
document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const scrollBehavior = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

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
    if (darkToggle) darkToggle.textContent = theme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19";
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
      window.scrollTo({ top: y, behavior: scrollBehavior() });
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

  // ===== Utility functions =====
  const czk = (n) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(n);
  window.czk = czk;

  const parseNum = (el) =>
    parseFloat(String(el.value || "0").replace(/\s/g, "").replace(",", ".")) || 0;

  const showEl = (id) => { const e = document.getElementById(id); if (e) e.style.display = ""; };
  const hideEl = (id) => { const e = document.getElementById(id); if (e) e.style.display = "none"; };

  const isPlaceholder = (form) => {
    const action = form ? form.getAttribute("action") : "";
    return !action || action.includes("tvuj-kod");
  };

  const submitLead = async (form, statusId) => {
    const statusEl = document.getElementById(statusId);
    const btn = form.querySelector('button[type="submit"]');
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Odes\u00edl\u00e1m\u2026";
    if (statusEl) statusEl.textContent = "";
    try {
      const resp = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!resp.ok) throw new Error();
      return true;
    } catch {
      if (statusEl) statusEl.textContent = "Nepoda\u0159ilo se odeslat. Zkuste to znovu.";
      return false;
    } finally {
      btn.disabled = false;
      btn.textContent = origText;
    }
  };

  // ===== Auto-format numeric inputs =====
  const formatNumericInputs = (root) => {
    $$('input[inputmode="numeric"]', root).forEach((inp) => {
      const raw = inp.value.replace(/[^\d]/g, "");
      if (raw) inp.value = new Intl.NumberFormat("cs-CZ").format(parseInt(raw, 10));
    });
  };

  formatNumericInputs(document);

  $$('input[inputmode="numeric"]').forEach((inp) => {
    inp.addEventListener("input", () => {
      const raw = inp.value.replace(/[^\d]/g, "");
      if (raw) inp.value = new Intl.NumberFormat("cs-CZ").format(parseInt(raw, 10));
    });
  });

  // ===== Mortgage Calculator =====
  const mortgageForm = $("#mortgageCalc");
  if (mortgageForm) {
    const gateForm = $("#leadGateForm_mortgage");
    const placeholder = isPlaceholder(gateForm);
    let mData = {};

    mortgageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const P = parseNum($("#amount"));
      const annualRate = parseFloat($("#rate").value) || 0;
      const years = parseInt($("#years").value, 10) || 1;
      const fee = parseNum($("#fee"));
      const n = years * 12;
      const r = annualRate / 100 / 12;
      const M = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      const monthlyTotal = M + fee;
      const totalPaid = monthlyTotal * n;
      const totalInterest = totalPaid - P;
      mData = { P, annualRate, years, fee, monthlyTotal, totalPaid, totalInterest };

      if (placeholder) {
        showMortgageResult();
      } else {
        showEl("calcGate");
        document.getElementById("calcGate").scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }
    });

    const showMortgageResult = () => {
      hideEl("calcGate");
      $("#m_out_monthly").textContent = czk(mData.monthlyTotal);
      $("#m_out_totalPaid").textContent = czk(mData.totalPaid);
      $("#m_out_totalInterest").textContent = czk(mData.totalInterest);
      const note = $("#mNote");
      if (note) note.textContent = "V\u00fdpo\u010det: \u00fav\u011br " + czk(mData.P) + ", sazba " + mData.annualRate + " %, doba " + mData.years + " let.";
      showEl("mortgageResult");
      showEl("mCTA");
      document.getElementById("mortgageResult").scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      document.dispatchEvent(new CustomEvent('calcResult', { detail: { type: 'mortgage', data: mData } }));
    };

    if (gateForm) {
      gateForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        $("#m_h_amount").value = czk(mData.P);
        $("#m_h_rate").value = mData.annualRate + " %";
        $("#m_h_years").value = mData.years + " let";
        $("#m_h_fee").value = czk(mData.fee);
        $("#m_h_monthly").value = czk(mData.monthlyTotal);
        $("#m_h_totalPaid").value = czk(mData.totalPaid);
        $("#m_h_totalInterest").value = czk(mData.totalInterest);
        $("#m_h_summary").value = "Spl\u00e1tka: " + czk(mData.monthlyTotal) + ", \u00fav\u011br: " + czk(mData.P) + ", sazba: " + mData.annualRate + " %, doba: " + mData.years + " let";
        const ok = await submitLead(gateForm, "mLeadStatus");
        if (ok) showMortgageResult();
      });
    }

    const mReset = $("#calcReset");
    if (mReset) {
      mReset.addEventListener("click", () => {
        mortgageForm.reset();
        hideEl("calcGate");
        hideEl("mortgageResult");
        hideEl("mCTA");
        formatNumericInputs(mortgageForm);
        document.dispatchEvent(new CustomEvent('calcReset', { detail: { type: 'mortgage' } }));
      });
    }
  }

  // ===== Investment Calculator =====
  const investForm = $("#investCalc");
  if (investForm) {
    const gateForm = $("#leadGateForm_invest");
    const placeholder = isPlaceholder(gateForm);
    let iData = {};

    investForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const initial = parseNum($("#inv_initial"));
      const monthly = parseNum($("#inv_monthly"));
      const rate = parseFloat($("#inv_rate").value) || 0;
      const years = parseInt($("#inv_years").value, 10) || 1;
      const fee = parseFloat($("#inv_fee").value) || 0;
      const netRate = (rate - fee) / 100;
      const r = netRate / 12;
      const n = years * 12;
      const fv = r === 0
        ? initial + monthly * n
        : initial * Math.pow(1 + r, n) + monthly * (Math.pow(1 + r, n) - 1) / r;
      const contrib = initial + monthly * n;
      const gain = fv - contrib;
      iData = { initial, monthly, rate, years, fee, fv, contrib, gain };

      if (placeholder) {
        showInvestResult();
      } else {
        showEl("invGate");
        document.getElementById("invGate").scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }
    });

    const showInvestResult = () => {
      hideEl("invGate");
      $("#i_out_fv").textContent = czk(iData.fv);
      $("#i_out_contrib").textContent = czk(iData.contrib);
      $("#i_out_gain").textContent = czk(iData.gain);
      const note = $("#iNote");
      if (note) note.textContent = "V\u00fdpo\u010det: po\u010d\u00e1te\u010dn\u00ed " + czk(iData.initial) + ", m\u011bs\u00ed\u010dn\u011b " + czk(iData.monthly) + ", zhodnocen\u00ed " + iData.rate + " % p.a., poplatky " + iData.fee + " % p.a., doba " + iData.years + " let.";
      showEl("investResult");
      showEl("iCTA");
      document.getElementById("investResult").scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      document.dispatchEvent(new CustomEvent('calcResult', { detail: { type: 'invest', data: iData } }));
    };

    if (gateForm) {
      gateForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        $("#i_h_initial").value = czk(iData.initial);
        $("#i_h_monthly").value = czk(iData.monthly);
        $("#i_h_rate").value = iData.rate + " %";
        $("#i_h_years").value = iData.years + " let";
        $("#i_h_fee").value = iData.fee + " %";
        $("#i_h_fv").value = czk(iData.fv);
        $("#i_h_contrib").value = czk(iData.contrib);
        $("#i_h_gain").value = czk(iData.gain);
        $("#i_h_summary").value = "Budouc\u00ed hodnota: " + czk(iData.fv) + ", vlo\u017eeno: " + czk(iData.contrib) + ", zisk: " + czk(iData.gain);
        const ok = await submitLead(gateForm, "iLeadStatus");
        if (ok) showInvestResult();
      });
    }

    const iReset = $("#invReset");
    if (iReset) {
      iReset.addEventListener("click", () => {
        investForm.reset();
        hideEl("invGate");
        hideEl("investResult");
        hideEl("iCTA");
        formatNumericInputs(investForm);
        document.dispatchEvent(new CustomEvent('calcReset', { detail: { type: 'invest' } }));
      });
    }
  }

  // ===== Life Insurance Calculator =====
  const lifeForm = $("#lifeCalc");
  if (lifeForm) {
    const gateForm = $("#leadGateForm_life");
    const placeholder = isPlaceholder(gateForm);
    let lData = {};

    lifeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const debts = parseNum($("#life_debts"));
      const income = parseNum($("#life_income"));
      const years = parseInt($("#life_years").value, 10) || 1;
      const savings = parseNum($("#life_savings"));
      const goals = parseNum($("#life_goals"));
      const funeral = parseNum($("#life_funeral"));
      const recommended = Math.max(0, debts + income * 12 * years + goals + funeral - savings);
      lData = { debts, income, years, savings, goals, funeral, recommended };

      if (placeholder) {
        showLifeResult();
      } else {
        showEl("lifeGate");
        document.getElementById("lifeGate").scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }
    });

    const showLifeResult = () => {
      hideEl("lifeGate");
      $("#l_out_rec").textContent = czk(lData.recommended);
      const note = $("#lNote");
      if (note) note.textContent = "Z\u00e1vazky " + czk(lData.debts) + ", p\u0159\u00edjem " + czk(lData.income) + "/m\u011bs. \u00d7 " + lData.years + " let, c\u00edle " + czk(lData.goals) + ", rezerva " + czk(lData.funeral) + ", \u00faspory " + czk(lData.savings) + ".";
      showEl("lifeResult");
      showEl("lCTA");
      document.getElementById("lifeResult").scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      document.dispatchEvent(new CustomEvent('calcResult', { detail: { type: 'life', data: lData } }));
    };

    if (gateForm) {
      gateForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        $("#l_h_debts").value = czk(lData.debts);
        $("#l_h_income").value = czk(lData.income);
        $("#l_h_years").value = lData.years + " let";
        $("#l_h_savings").value = czk(lData.savings);
        $("#l_h_goals").value = czk(lData.goals);
        $("#l_h_funeral").value = czk(lData.funeral);
        $("#l_h_rec").value = czk(lData.recommended);
        $("#l_h_summary").value = "Doporu\u010den\u00e1 \u010d\u00e1stka: " + czk(lData.recommended);
        const ok = await submitLead(gateForm, "lLeadStatus");
        if (ok) showLifeResult();
      });
    }

    const lReset = $("#lifeReset");
    if (lReset) {
      lReset.addEventListener("click", () => {
        lifeForm.reset();
        hideEl("lifeGate");
        hideEl("lifeResult");
        hideEl("lCTA");
        formatNumericInputs(lifeForm);
        document.dispatchEvent(new CustomEvent('calcReset', { detail: { type: 'life' } }));
      });
    }
  }

  // ===== Floating CTA =====
  const floatingCta = $("#floatingCta");
  if (floatingCta) {
    const hero = $(".hero-bg");
    if (hero && "IntersectionObserver" in window) {
      const ctaIO = new IntersectionObserver(([entry]) => {
        floatingCta.classList.toggle("visible", !entry.isIntersecting);
      }, { threshold: 0 });
      ctaIO.observe(hero);
    } else {
      floatingCta.classList.add("visible");
    }
  }
});
