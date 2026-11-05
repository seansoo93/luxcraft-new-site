document.addEventListener('DOMContentLoaded', () => {
  if (document.body) {
    document.body.classList.add('has-fixed-header');
    
    // Check if homepage to add layout class
    const isHomepage = !!document.querySelector('.hero-shell') || 
                       window.location.pathname === '/' || 
                       window.location.pathname.endsWith('/index.html') ||
                       window.location.pathname.endsWith('/');
    if (isHomepage) {
      document.body.classList.add('homepage');
    }
  }

  const navLinks = Array.from(document.querySelectorAll('.header-nav a, #mobile-menu nav a'));
  if (navLinks.length) {
    const prefetched = new Set();

    const prefetchLink = (url) => {
      if (prefetched.has(url)) return;
      prefetched.add(url);

      try {
        const linkEl = document.createElement('link');
        linkEl.rel = 'prefetch';
        linkEl.href = url;
        linkEl.as = 'document';
        document.head.appendChild(linkEl);
      } catch (error) {
        // Prefetch is best-effort; ignore failures silently.
      }
    };

    const currentPath = (() => {
      const { pathname } = window.location;
      const file = pathname.split('/').pop();
      if (!file || file === '/') {
        return 'index.html';
      }
      return file;
    })();

    const explicitNavTarget = document.body?.dataset?.activeNav || null;
    const matchTarget = explicitNavTarget || currentPath;

    navLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const target = href.split('/').pop();

      const absoluteHref = link.href;
      if (absoluteHref) {
        try {
          const url = new URL(absoluteHref, window.location.href);
          if (url.origin === window.location.origin) {
            const triggerPrefetch = () => prefetchLink(url.href);
            link.addEventListener('mouseenter', triggerPrefetch, { once: true });
            link.addEventListener('focus', triggerPrefetch, { once: true });
          }
        } catch (error) {
          // Skip invalid URLs
        }
      }

      if (target === matchTarget) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  // Mobile menu functionality
  const mobileMenuButton = document.querySelector('.header-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const header = document.querySelector('header');

  if (!header || !mobileMenuButton || !mobileMenu) {
    return;
  }

  mobileMenu.classList.remove('open');
  mobileMenu.style.transform = 'translateY(-12px)';
  mobileMenu.style.opacity = '0';
  mobileMenu.style.pointerEvents = 'none';
  mobileMenu.setAttribute('aria-hidden', 'true');

  let isMenuOpen = false;
  let lastScrollY = window.scrollY;
  
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;

    mobileMenu.classList.toggle('open', isMenuOpen);
    document.body.classList.toggle('overflow-hidden', isMenuOpen);

    if (isMenuOpen) {
      mobileMenu.style.transform = 'translateY(0)';
      mobileMenu.style.opacity = '1';
      mobileMenu.style.pointerEvents = 'auto';
      mobileMenu.setAttribute('aria-hidden', 'false');
    } else {
      mobileMenu.style.transform = 'translateY(-12px)';
      mobileMenu.style.opacity = '0';
      mobileMenu.style.pointerEvents = 'none';
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
    
    // Update aria-label and icon with Tailwind classes
    mobileMenuButton.setAttribute('aria-label', isMenuOpen ? 'Close navigation' : 'Open navigation');
    mobileMenuButton.innerHTML = isMenuOpen 
      ? `<span class="sr-only">Close navigation</span>
         <svg class="h-5 w-5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
           <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
         </svg>`
      : `<span class="sr-only">Toggle navigation</span>
         <svg class="h-5 w-5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
           <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
         </svg>`;
  }

  // Handle menu button click
  mobileMenuButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu();
  });

  const closeButton = mobileMenu.querySelector('#mobile-menu__close');
  if (closeButton) {
    closeButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (isMenuOpen) {
        toggleMenu();
      }
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (isMenuOpen && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
      toggleMenu();
    }
  });

  // Create and append floating consultation button
  const floatingBtn = document.createElement('a');
  floatingBtn.id = 'floating-consultation-btn';
  floatingBtn.className = 'floating-consultation-btn';
  floatingBtn.href = '/contact.html';
  floatingBtn.innerHTML = `
    <span class="border-glow" aria-hidden="true"></span>
    <span class="border-beam" aria-hidden="true"></span>
    <span class="btn-text">Book Free Consultation</span>
    <span class="btn-icon" aria-hidden="true">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" style="width: 1.1rem; height: 1.1rem;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
      </svg>
    </span>
  `;
  document.body.appendChild(floatingBtn);

  // Handle smooth scroll on homepage click
  floatingBtn.addEventListener('click', (e) => {
    const isHomepage = !!document.querySelector('.hero-shell') || 
                       window.location.pathname === '/' || 
                       window.location.pathname.endsWith('/index.html') ||
                       window.location.pathname.endsWith('/');
    
    if (isHomepage) {
      const contactSection = document.querySelector('[data-contact-form="true"]')?.closest('section');
      if (contactSection) {
        e.preventDefault();
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  const contactForm = document.querySelector('[data-contact-form="true"]');

  // Handle scroll behavior for shrinking effect
  let accumulatedDelta = 0;
  lastScrollY = window.scrollY;
  const SHRINK_THRESHOLD = 300;
  const ACTION_THRESHOLD = 50; // require 50px of scroll in one direction to switch states

  function handleScroll() {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    
    // Reset if we are near the top of the page
    if (currentScrollY <= 50) {
      if (document.body.classList.contains('has-shrunk-header')) {
        document.body.classList.remove('has-shrunk-header');
        header.classList.remove('site-header--shrunk');
        accumulatedDelta = 0;
      }
    } 
    else if (currentScrollY > SHRINK_THRESHOLD) {
      // Check if we've scrolled enough in one direction to warrant a state change
      if (delta > 0) { // Scrolling down
        if (accumulatedDelta < 0) accumulatedDelta = 0;
        accumulatedDelta += delta;
        if (accumulatedDelta > ACTION_THRESHOLD && !document.body.classList.contains('has-shrunk-header')) {
          document.body.classList.add('has-shrunk-header');
          header.classList.add('site-header--shrunk');
          accumulatedDelta = 0; // Reset after action to prevent immediate re-trigger
        }
      } else { // Scrolling up
        if (accumulatedDelta > 0) accumulatedDelta = 0;
        accumulatedDelta += delta;
        if (Math.abs(accumulatedDelta) > ACTION_THRESHOLD && document.body.classList.contains('has-shrunk-header')) {
          document.body.classList.remove('has-shrunk-header');
          header.classList.remove('site-header--shrunk');
          accumulatedDelta = 0; // Reset after action
        }
      }
    }

    // Show button almost immediately — just 80px into the first scroll
    const triggerThreshold = 80;

    // Check if the contact form is currently visible in the viewport
    let isFormVisible = false;
    if (contactForm) {
      const rect = contactForm.getBoundingClientRect();
      isFormVisible = (rect.top < window.innerHeight && rect.bottom > 0);
    }

    // Hide the button when the contact form is visible in the viewport
    if (isFormVisible) {
      floatingBtn.classList.remove('is-visible');
    } else if (currentScrollY >= triggerThreshold) {
      floatingBtn.classList.add('is-visible');
    } else {
      floatingBtn.classList.remove('is-visible');
    }
    
    lastScrollY = currentScrollY;

    // Desktop Filter Cross-fade Logic
    if (window.innerWidth >= 1024) {
      const currentScrollY = window.scrollY;
      // Toggle body class for cross-fading
      if (currentScrollY > 120) {
        document.body.classList.add('show-sidebar-filters');
      } else if (currentScrollY < 40) {
        document.body.classList.remove('show-sidebar-filters');
      }
    }
  }

  // Use passive scroll listener for better performance
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Initial check in case page is refreshed while scrolled
  handleScroll();

  // Track all consultation button/link clicks globally
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href') || '';
    const text = (link.textContent || '').trim().toLowerCase();

    // Check if it's a contact or consultation link
    const isContactLink = href.includes('/contact') || href.includes('#consultation');
    const isConsultationText = text.includes('consultation');

    if (isContactLink || isConsultationText) {
      const isFloating = link.id === 'floating-consultation-btn' || link.classList.contains('floating-consultation-btn');
      if (typeof gtag === 'function') {
        gtag('event', 'click_consultation_button', {
          'event_category': 'engagement',
          'event_label': link.textContent.trim() || href,
          'link_url': href,
          'button_type': isFloating ? 'floating' : 'inline',
          'transport_type': 'beacon'
        });
      }
    }
  });
});
