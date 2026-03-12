/* ===== V2 Script — doplňkové efekty ===== */
/* Předpokládá, že ../script.js je načten před tímto souborem */

(function () {
  'use strict';

  /* --- Scroll progress bar --- */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  /* --- Hero parallax --- */
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    window.addEventListener('scroll', function () {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroContent.style.transform = 'translateY(' + (y * 0.3) + 'px)';
        heroContent.style.opacity = 1 - (y / (window.innerHeight * 0.8));
      }
    }, { passive: true });
  }

  /* --- FAQ accordion --- */
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(function (el) {
        el.classList.remove('open');
      });
      // Toggle clicked
      if (!isOpen) item.classList.add('open');
    });
  });

  /* --- Dark mode override for v2 --- */
  /* v2 uses body.light instead of body.dark (default is dark) */
  /* Clone toggle to remove root script's event listener */
  var oldToggle = document.getElementById('darkToggle');
  if (oldToggle) {
    var toggle = oldToggle.cloneNode(true);
    oldToggle.parentNode.replaceChild(toggle, oldToggle);

    // On load: check localStorage
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved ? saved === 'dark' : prefersDark;

    // v2: body has no class = dark, body.light = light
    document.body.classList.remove('dark', 'light');
    if (!isDark) document.body.classList.add('light');
    toggle.textContent = isDark ? '☀️' : '🌙';

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      var goLight = !document.body.classList.contains('light');
      document.body.classList.remove('dark', 'light');
      if (goLight) document.body.classList.add('light');
      localStorage.setItem('theme', goLight ? 'light' : 'dark');
      toggle.textContent = goLight ? '🌙' : '☀️';
    });
  }

  /* --- Floating CTA visibility --- */
  const floatingCta = document.getElementById('floatingCta');
  const hero = document.querySelector('.hero');
  if (floatingCta && hero) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          floatingCta.classList.remove('visible');
        } else {
          floatingCta.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    obs.observe(hero);
  }

  /* --- Contact form submission (v2 page) --- */
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');
  if (contactForm && contactStatus) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const action = contactForm.getAttribute('action');
      if (action.includes('tvuj-kod')) {
        contactStatus.textContent = 'Formulář není nakonfigurován (chybí Formspree endpoint).';
        contactStatus.className = 'form-status error';
        return;
      }
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Odesílám…';

      fetch(action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      }).then(function (r) {
        if (r.ok) {
          contactStatus.textContent = 'Děkuji! Ozvu se vám co nejdříve.';
          contactStatus.className = 'form-status success';
          contactForm.reset();
        } else {
          throw new Error('fail');
        }
      }).catch(function () {
        contactStatus.textContent = 'Něco se nepovedlo. Zkuste to prosím znovu.';
        contactStatus.className = 'form-status error';
      }).finally(function () {
        btn.disabled = false;
        btn.innerHTML = 'Odeslat zprávu <i class="fas fa-paper-plane"></i>';
      });
    });
  }

})();
