document.addEventListener('DOMContentLoaded', () => {
  const mediaBlocks = document.querySelectorAll('.portfolio-card__media[data-portfolio-images]');
  const cards = new Set();

  mediaBlocks.forEach((block) => {
    const rawImages = block.dataset.portfolioImages || '[]';
    let images;
    try {
      images = JSON.parse(rawImages);
    } catch {
      images = [];
    }

    if (!Array.isArray(images) || images.length === 0) {
      return;
    }

    const baseAlt = block.dataset.portfolioAlt || 'Portfolio image';
    const imageEl = block.querySelector('img');
    const prevBtn = block.querySelector('[data-portfolio-prev]');
    const nextBtn = block.querySelector('[data-portfolio-next]');

    let currentIndex = 0;

    const updateImage = () => {
      const safeIndex = ((currentIndex % images.length) + images.length) % images.length;
      currentIndex = safeIndex;

      const nextSrc = images[safeIndex];
      if (typeof nextSrc === 'string' && nextSrc.length) {
        imageEl.src = nextSrc;
      }

      imageEl.alt = `${baseAlt} — Image ${safeIndex + 1}`;
      block.dataset.portfolioCurrent = String(safeIndex);
    };

    const stepImage = (delta) => {
      currentIndex += delta;
      updateImage();
    };

    updateImage();

    if (images.length <= 1) {
      if (prevBtn) prevBtn.classList.add('hidden');
      if (nextBtn) nextBtn.classList.add('hidden');
      return;
    }

    const handlePrev = (event) => {
      event.preventDefault();
      event.stopPropagation();
      stepImage(-1);
    };

    const handleNext = (event) => {
      event.preventDefault();
      event.stopPropagation();
      stepImage(1);
    };

    prevBtn?.addEventListener('click', handlePrev);
    nextBtn?.addEventListener('click', handleNext);

    const card = block.closest('.portfolio-card');
    if (card) {
      cards.add(card);
    }
  });

  const mobileViewportQuery = window.matchMedia('(max-width: 1023px)');
  const coarsePointerQuery = window.matchMedia('(hover: none) and (pointer: coarse)');

  const hasTouchSupport = () =>
    coarsePointerQuery.matches ||
    (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0) ||
    'ontouchstart' in window;

  const shouldAnimateOnScroll = () => mobileViewportQuery.matches && hasTouchSupport();

  let observer = null;

  const setupObserver = () => {
    if (!shouldAnimateOnScroll()) {
      teardownObserver();
      cards.forEach((card) => card.classList.remove('is-nav-visible'));
      return;
    }

    if (observer) return;

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const { target } = entry;
          if (!(target instanceof HTMLElement)) return;
          if (entry.isIntersecting) {
            target.classList.add('is-nav-visible');
          } else {
            target.classList.remove('is-nav-visible');
          }
        });
      },
      {
        threshold: 0.4,
        rootMargin: '0px 0px -40% 0px',
      }
    );

    cards.forEach((card) => observer?.observe(card));
  };

  const teardownObserver = () => {
    if (!observer) return;
    observer.disconnect();
    observer = null;
  };

  setupObserver();

  const attachListener = (query) => {
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', setupObserver);
    } else if (typeof query.addListener === 'function') {
      query.addListener(setupObserver);
    } else {
      query.onchange = setupObserver;
    }
  };

  attachListener(mobileViewportQuery);
  attachListener(coarsePointerQuery);
});
