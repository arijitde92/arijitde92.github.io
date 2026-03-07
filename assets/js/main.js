/**
 * main.js
 * Site-wide interactions: navbar, AOS, GSAP, Typed.js, skills tabs, back-to-top.
 */

document.addEventListener('DOMContentLoaded', function () {

  /* ----------------------------------------------------------------
     NAVBAR — scroll shrink + mobile toggle
     ---------------------------------------------------------------- */
  const navbar    = document.getElementById('site-nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ----------------------------------------------------------------
     ACTIVE NAV LINK — highlight current page
     ---------------------------------------------------------------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    const href = a.getAttribute('href');
    if (href && href.split('#')[0] === currentPath) {
      a.classList.add('active');
    }
  });

  /* ----------------------------------------------------------------
     SMOOTH SCROLL — anchor links
     ---------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ----------------------------------------------------------------
     AOS — Animate On Scroll
     ---------------------------------------------------------------- */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing:   'ease-out-cubic',
      once:     true,
      offset:   80,
    });
  }

  /* ----------------------------------------------------------------
     GSAP — section reveals (if GSAP + ScrollTrigger loaded)
     ---------------------------------------------------------------- */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero parallax
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      gsap.to(heroContent, {
        y: 60,
        opacity: 0.6,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start:   'top top',
          end:     'bottom top',
          scrub:   true,
        },
      });
    }

    // Stagger section headings
    gsap.utils.toArray('.section-title').forEach(function (el) {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    });

    // Skill cards stagger
    const skillsSection = document.querySelector('.skills-section');
    if (skillsSection) {
      ScrollTrigger.create({
        trigger: skillsSection,
        start: 'top 80%',
        once: true,
        onEnter: function () {
          gsap.fromTo('.skill-card',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.04, duration: 0.5, ease: 'power2.out' }
          );
        },
      });
    }

    // Work cards
    gsap.utils.toArray('.work-card').forEach(function (card, i) {
      gsap.fromTo(card,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, delay: i * 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 85%', once: true },
        }
      );
    });
  }

  /* ----------------------------------------------------------------
     TYPED.JS
     ---------------------------------------------------------------- */
  if (typeof Typed !== 'undefined') {
    const typedEl = document.getElementById('typed');
    if (typedEl) {
      new Typed('#typed', {
        strings: [
          'ML Engineer',
          'Computer Vision Researcher',
          'Robotics Developer',
          'PhD in AI',
          'Open Source Contributor',
        ],
        typeSpeed:  45,
        backSpeed:  25,
        backDelay:  1800,
        startDelay: 500,
        loop:       true,
        cursorChar: '_',
      });
    }
  }

  /* ----------------------------------------------------------------
     SKILLS TABS
     ---------------------------------------------------------------- */
  const tabs   = document.querySelectorAll('.skills-tab');
  const panels = document.querySelectorAll('.skills-panel');

  if (tabs.length && panels.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const target = tab.dataset.tab;
        tabs.forEach(function (t) { t.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        tab.classList.add('active');
        const panel = document.getElementById('skills-' + target);
        if (panel) panel.classList.add('active');
      });
    });
    // Activate first tab by default
    if (tabs[0]) tabs[0].click();
  }

  /* ----------------------------------------------------------------
     BACK TO TOP
     ---------------------------------------------------------------- */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------------
     NEURAL NETWORK — init on homepage
     ---------------------------------------------------------------- */
  if (typeof NeuralNetwork !== 'undefined' && document.getElementById('neural-canvas')) {
    NeuralNetwork.init('neural-canvas');
  }

});
