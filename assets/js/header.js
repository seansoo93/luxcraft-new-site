document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu functionality
  const mobileMenuButton = document.querySelector('.header-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const header = document.querySelector('.site-header');

  if (!header || !mobileMenuButton || !mobileMenu) {
    return;
  }

  const shouldAutoHide = header.classList.contains('site-header--auto-hide');
  let isMenuOpen = false;
  let lastScrollY = window.scrollY;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    mobileMenu.classList.toggle('open');
    
    // Update aria-label and icon
    mobileMenuButton.setAttribute('aria-label', isMenuOpen ? 'Close navigation' : 'Open navigation');
    mobileMenuButton.innerHTML = isMenuOpen 
      ? `<span class="sr-only">Close navigation</span>
         <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
           <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
         </svg>`
      : `<span class="sr-only">Toggle navigation</span>
         <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
           <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
         </svg>`;
  }

  // Handle menu button click
  mobileMenuButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu();
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (isMenuOpen && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
      toggleMenu();
    }
  });

  // Handle scroll behavior
  function handleScroll() {
    if (!shouldAutoHide) {
      return;
    }
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    const scrollOffset = 100; // Start hiding header after scrolling this many pixels

    if (currentScrollY < scrollOffset) {
      header.classList.remove('site-header--hidden');
    } else if (scrollingDown && !isMenuOpen) {
      header.classList.add('site-header--hidden');
    } else if (!scrollingDown) {
      header.classList.remove('site-header--hidden');
    }

    lastScrollY = currentScrollY;
  }

  // Throttle scroll event
  let ticking = false;
  if (shouldAutoHide) {
    document.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }
});
