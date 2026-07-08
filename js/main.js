/* =============================================
   CLEANING WITH CARE — Main JS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Mobile Menu ── */
  const hamburger   = document.querySelector('.hamburger');
  const mobileMenu  = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);

      // Animate bars
      const bars = hamburger.querySelectorAll('span');
      if (isOpen) {
        bars[0].style.transform = 'translateY(7px) rotate(45deg)';
        bars[1].style.opacity   = '0';
        bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        bars[0].style.transform = '';
        bars[1].style.opacity   = '';
        bars[2].style.transform = '';
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        const bars = hamburger.querySelectorAll('span');
        bars[0].style.transform = '';
        bars[1].style.opacity   = '';
        bars[2].style.transform = '';
      }
    });

    // Close on nav link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        const bars = hamburger.querySelectorAll('span');
        bars[0].style.transform = '';
        bars[1].style.opacity   = '';
        bars[2].style.transform = '';
      });
    });
  }

  /* ── Set Active Nav Link ── */
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('.navbar-nav a, .mobile-menu a').forEach(link => {
    const linkPath = new URL(link.href, window.location.href).pathname.replace(/\/$/, '');
    if (linkPath === currentPath || (currentPath === '' && linkPath === '')) {
      link.classList.add('active');
    }
  });

  /* ── Quote Form ── */
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formCard    = quoteForm.closest('.quote-form-card') || quoteForm.parentElement;
      const successMsg  = document.getElementById('formSuccess');

      // Build mailto
      const name    = document.getElementById('firstName')?.value || '';
      const last    = document.getElementById('lastName')?.value  || '';
      const email   = document.getElementById('email')?.value     || '';
      const phone   = document.getElementById('phone')?.value     || '';
      const service = document.getElementById('service')?.value   || '';
      const details = document.getElementById('details')?.value   || '';

      const subject = encodeURIComponent(`Quote Request from ${name} ${last}`);
      const body    = encodeURIComponent(
        `Name: ${name} ${last}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\n\nDetails:\n${details}`
      );
      window.location.href = `mailto:cleaningwithcare.team@gmail.com?subject=${subject}&body=${body}`;

      // Show success
      if (successMsg) {
        quoteForm.style.display = 'none';
        successMsg.classList.add('visible');
      }
    });
  }

  /* ── Scroll reveal (lightweight) ── */
  const revealEls = document.querySelectorAll(
    '.service-card, .why-card, .testimonial-card, .service-section'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealEls.forEach(el => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  }

});

/* ============================================
   RESULTS — BEFORE & AFTER SLIDER
   ============================================ */
(function () {
  const section   = document.querySelector('.results-section');
  if (!section) return;                          // not on this page — bail

  const pairs     = section.querySelectorAll('.results-pair');
  const thumbs    = section.querySelectorAll('.thumb-item');
  const prevBtn   = section.querySelector('.results-arrow--prev');
  const nextBtn   = section.querySelector('.results-arrow--next');
  const total     = pairs.length;
  let   current   = 0;

  /* ── Utility: go to slide N ── */
  function goTo(index) {
    // bounds
    index = Math.max(0, Math.min(total - 1, index));

    // deactivate old
    pairs[current].classList.remove('active');
    thumbs[current].classList.remove('active');
    thumbs[current].setAttribute('aria-selected', 'false');

    // activate new
    current = index;
    pairs[current].classList.add('active');
    thumbs[current].classList.add('active');
    thumbs[current].setAttribute('aria-selected', 'true');

    // reset the comparison handle to 50%
    resetHandle(pairs[current]);

    // update arrow states
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  /* ── Utility: reset a pair's handle to 50% ── */
  function resetHandle(pair) {
    const before = pair.querySelector('.rp-before');
    const handle = pair.querySelector('.rp-handle');
    if (!before || !handle) return;
    setPosition(pair, before, handle, 50);
    const slider = handle;
    slider.setAttribute('aria-valuenow', '50');
  }

  /* ── Utility: apply a percentage position ── */
  function setPosition(pair, before, handle, pct) {
    pct = Math.max(2, Math.min(98, pct));
    before.style.width = pct + '%';
    handle.style.left  = pct + '%';
    // Make the before-image feel full-size inside its clip
    const stageW = pair.offsetWidth;
    before.querySelector('img').style.width = stageW + 'px';
  }

  /* ── Utility: get x% from a pointer/touch event ── */
  function getPct(pair, clientX) {
    const rect = pair.getBoundingClientRect();
    const x    = clientX - rect.left;
    return (x / rect.width) * 100;
  }

  /* ── Bind comparison drag on a single pair ── */
  function bindComparison(pair) {
    const before = pair.querySelector('.rp-before');
    const handle = pair.querySelector('.rp-handle');
    if (!before || !handle) return;

    let dragging = false;

    // ── Mouse ──
    function onMouseMove(e) {
      if (!dragging) return;
      e.preventDefault();
      const pct = getPct(pair, e.clientX);
      setPosition(pair, before, handle, pct);
      handle.setAttribute('aria-valuenow', Math.round(pct));
    }
    function onMouseUp() {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',   onMouseUp);
    }

    pair.addEventListener('mousedown', (e) => {
      // Only act if clicking inside this pair (not on thumbs/arrows)
      if (!pair.classList.contains('active')) return;
      dragging = true;
      handle.classList.add('dragging');
      const pct = getPct(pair, e.clientX);
      setPosition(pair, before, handle, pct);
      handle.setAttribute('aria-valuenow', Math.round(pct));
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup',   onMouseUp);
      e.preventDefault();
    });

    // ── Touch ──
    pair.addEventListener('touchstart', (e) => {
      if (!pair.classList.contains('active')) return;
      // Allow vertical scroll if touch starts far from handle — only hijack horizontal
      const touch = e.touches[0];
      const rect  = pair.getBoundingClientRect();
      const handleX = parseFloat(handle.style.left || '50') / 100 * rect.width;
      const distFromHandle = Math.abs(touch.clientX - rect.left - handleX);

      // Only take over if finger is within 40px of handle OR on the handle itself
      if (distFromHandle > 60) return;

      dragging = true;
      handle.classList.add('dragging');
      e.preventDefault();
    }, { passive: false });

    pair.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const pct   = getPct(pair, touch.clientX);
      setPosition(pair, before, handle, pct);
      handle.setAttribute('aria-valuenow', Math.round(pct));
    }, { passive: false });

    pair.addEventListener('touchend', () => {
      dragging = false;
      handle.classList.remove('dragging');
    });

    // ── Keyboard (arrow keys while handle focused) ──
    handle.addEventListener('keydown', (e) => {
      if (!pair.classList.contains('active')) return;
      const step = e.shiftKey ? 10 : 3;
      let pct    = parseFloat(handle.style.left || '50');
      if (e.key === 'ArrowLeft')  { pct -= step; e.preventDefault(); }
      if (e.key === 'ArrowRight') { pct += step; e.preventDefault(); }
      setPosition(pair, before, handle, pct);
      handle.setAttribute('aria-valuenow', Math.round(pct));
    });
  }

  /* ── Arrows ── */
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  /* ── Keyboard navigation on the section (left/right = slide; not when handle focused) ── */
  section.addEventListener('keydown', (e) => {
    if (document.activeElement && document.activeElement.classList.contains('rp-handle')) return;
    if (e.key === 'ArrowLeft')  { goTo(current - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); e.preventDefault(); }
  });

  /* ── Thumbnails ── */
  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const target = parseInt(thumb.dataset.target, 10);
      goTo(target);
    });
  });

  /* ── Bind comparison to every pair ── */
  pairs.forEach(bindComparison);

  /* ── Init: set arrow states + reset all handles ── */
  pairs.forEach(resetHandle);
  prevBtn.disabled = true;           // starts on first
  nextBtn.disabled = total <= 1;

  /* ── Re-calculate image widths on window resize ── */
  window.addEventListener('resize', () => {
    pairs.forEach((pair) => {
      const before = pair.querySelector('.rp-before');
      const handle = pair.querySelector('.rp-handle');
      if (!before || !handle) return;
      const pct = parseFloat(handle.style.left || '50');
      setPosition(pair, before, handle, pct);
    });
  });

})();
/* ══ END RESULTS SLIDER ══ */