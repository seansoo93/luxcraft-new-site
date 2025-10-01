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
    let isAnimating = false;

    const normalizeIndex = (index) => ((index % images.length) + images.length) % images.length;

    const renderImage = (index) => {
      const safeIndex = normalizeIndex(index);
      currentIndex = safeIndex;

      const nextSrc = images[safeIndex];
      if (typeof nextSrc === 'string' && nextSrc.length) {
        imageEl.src = nextSrc;
      }

      imageEl.alt = `${baseAlt} — Image ${safeIndex + 1}`;
      block.dataset.portfolioCurrent = String(safeIndex);
    };

    const waitForAnimation = (animation) => {
      if (!animation) return Promise.resolve();
      const { finished } = animation;
      if (finished && typeof finished.then === 'function') {
        return finished;
      }

      if (animation.playState === 'finished') {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const handle = () => {
          animation.removeEventListener('finish', handle);
          animation.removeEventListener('cancel', handle);
          resolve();
        };

        animation.addEventListener('finish', handle, { once: true });
        animation.addEventListener('cancel', handle, { once: true });
      });
    };

    const finishAnimationState = () => {
      imageEl.style.transform = '';
      imageEl.style.opacity = '';
      isAnimating = false;
    };

    const animateToIndex = async (nextIndex, direction) => {
      if (typeof imageEl.animate !== 'function') {
        renderImage(nextIndex);
        finishAnimationState();
        return;
      }

      const travel = 48;

      try {
        const exitAnimation = imageEl.animate(
          [
            { transform: 'translateX(0px)', opacity: 1 },
            { transform: `translateX(${direction * travel}px)`, opacity: 0 }
          ],
          {
            duration: 220,
            easing: 'ease-out',
            fill: 'forwards'
          }
        );

        await waitForAnimation(exitAnimation);
        exitAnimation.cancel();

        renderImage(nextIndex);
        imageEl.style.transform = `translateX(${-direction * travel}px)`;
        imageEl.style.opacity = '0';

        const enterAnimation = imageEl.animate(
          [
            { transform: `translateX(${-direction * travel}px)`, opacity: 0 },
            { transform: 'translateX(0px)', opacity: 1 }
          ],
          {
            duration: 260,
            easing: 'ease-out',
            fill: 'forwards'
          }
        );

        await waitForAnimation(enterAnimation);
        enterAnimation.cancel();
      } catch (error) {
        renderImage(nextIndex);
      } finally {
        finishAnimationState();
      }
    };

    const stepImage = (delta) => {
      if (isAnimating) return;

      const nextIndex = normalizeIndex(currentIndex + delta);
      if (nextIndex === currentIndex) {
        return;
      }

      isAnimating = true;
      const direction = delta > 0 ? -1 : 1;
      animateToIndex(nextIndex, direction).catch(() => {
        renderImage(nextIndex);
        finishAnimationState();
      });
    };

    renderImage(currentIndex);

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
