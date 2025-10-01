document.addEventListener('DOMContentLoaded', () => {
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

  const shouldAutoHide = true; // Always enable auto-hide
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

  // Handle scroll behavior with Tailwind classes
  function handleScroll() {
    if (!shouldAutoHide) {
      return;
    }
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    const scrollOffset = 100;

    if (currentScrollY < scrollOffset) {
      header.classList.remove('-translate-y-full');
    } else if (scrollingDown && !isMenuOpen) {
      header.classList.add('-translate-y-full');
    } else if (!scrollingDown) {
      header.classList.remove('-translate-y-full');
    }

    lastScrollY = currentScrollY;
  }

  // Use Intersection Observer for better performance
  const scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && !isMenuOpen) {
          handleScroll();
        }
      });
    },
    { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
  );

  // Observe the document body
  scrollObserver.observe(document.body);
});
