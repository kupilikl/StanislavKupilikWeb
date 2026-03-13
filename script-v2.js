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

  /* --- Certificate lightbox gallery --- */
  var CERT_GALLERY = [
    { src: 'img/certs/cert-kapitalovy-trh.jpg', title: 'Kapitálový trh', desc: 'z. 256/2004 Sb.', type: 'image' },
    { src: 'img/certs/cert-spotrebitelsky-uver.jpg', title: 'Spotřebitelský úvěr', desc: 'z. 257/2016 Sb.', type: 'image' },
    { src: 'img/certs/cert-penzijni-sporeni.jpg', title: 'Penzijní spoření', desc: 'z. 427/2011 Sb.', type: 'image' },
    { src: 'img/certs/cert-distribuce-pojisteni.pdf', title: 'Distribuce pojištění', desc: 'PDF ke stažení', type: 'pdf' }
  ];

  var certIndex = 0;
  var certOverlay, certBox, certMedia, certCaption, certCounter;

  function buildCertLightbox() {
    certOverlay = document.createElement('div');
    certOverlay.className = 'cert-lightbox-overlay';
    document.body.appendChild(certOverlay);

    certBox = document.createElement('div');
    certBox.className = 'cert-lightbox';
    certBox.innerHTML =
      '<button class="cert-lightbox-close" aria-label="Zavřít">&times;</button>' +
      '<div class="cert-lightbox-media"></div>' +
      '<div class="cert-lightbox-footer">' +
        '<button class="cert-lightbox-nav" id="certPrev" aria-label="Předchozí"><i class="fas fa-chevron-left"></i></button>' +
        '<div class="cert-lightbox-caption"></div>' +
        '<button class="cert-lightbox-nav" id="certNext" aria-label="Další"><i class="fas fa-chevron-right"></i></button>' +
      '</div>' +
      '<div class="cert-lightbox-counter"></div>';
    document.body.appendChild(certBox);

    certMedia = certBox.querySelector('.cert-lightbox-media');
    certCaption = certBox.querySelector('.cert-lightbox-caption');
    certCounter = certBox.querySelector('.cert-lightbox-counter');

    certBox.querySelector('.cert-lightbox-close').addEventListener('click', closeCertLightbox);
    certOverlay.addEventListener('click', closeCertLightbox);
    document.getElementById('certPrev').addEventListener('click', function () { showCert(certIndex - 1); });
    document.getElementById('certNext').addEventListener('click', function () { showCert(certIndex + 1); });
  }

  function showCert(i) {
    if (i < 0) i = CERT_GALLERY.length - 1;
    if (i >= CERT_GALLERY.length) i = 0;
    certIndex = i;
    var item = CERT_GALLERY[i];

    if (item.type === 'pdf') {
      certMedia.innerHTML =
        '<div class="cert-lightbox-pdf">' +
          '<i class="fas fa-file-pdf"></i>' +
          '<strong>' + item.title + '</strong>' +
          '<p style="color:var(--text-muted);font-size:0.9rem">Osvědčení o odborné zkoušce</p>' +
          '<a href="' + item.src + '" target="_blank" rel="noopener"><i class="fas fa-download"></i> Stáhnout PDF</a>' +
        '</div>';
    } else {
      certMedia.innerHTML = '<img src="' + item.src + '" alt="Certifikát – ' + item.title + '" loading="lazy">';
    }
    certCaption.innerHTML = '<strong>' + item.title + '</strong><span>' + item.desc + '</span>';
    certCounter.textContent = (i + 1) + ' / ' + CERT_GALLERY.length;
  }

  function openCertLightbox() {
    if (!certOverlay) buildCertLightbox();
    showCert(0);
    certOverlay.classList.add('visible');
    certBox.classList.add('visible');
    document.body.classList.add('no-scroll');
  }

  function closeCertLightbox() {
    certOverlay.classList.remove('visible');
    certBox.classList.remove('visible');
    document.body.classList.remove('no-scroll');
  }

  var galleryBtn = document.getElementById('certGalleryBtn');
  if (galleryBtn) {
    galleryBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openCertLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!certBox || !certBox.classList.contains('visible')) return;
    if (e.key === 'Escape') closeCertLightbox();
    if (e.key === 'ArrowLeft') showCert(certIndex - 1);
    if (e.key === 'ArrowRight') showCert(certIndex + 1);
  });

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
