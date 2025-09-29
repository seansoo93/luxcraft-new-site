document.addEventListener('DOMContentLoaded', () => {
  const brandsContainer = document.querySelector('.why-panel__logos');
  if (!brandsContainer) return;

  const scrollTrack = brandsContainer.querySelector('.brand-scroll-track');
  if (!scrollTrack) return;

  // Disable the CSS animation – scrolling is handled in JS for better control.
  scrollTrack.style.animation = 'none';

  let loopWidth = 0;
  const recalcLoopWidth = () => {
    const totalWidth = scrollTrack.scrollWidth;
    loopWidth = totalWidth > 0 ? totalWidth / 3 : 0;
  };

  recalcLoopWidth();

  const normaliseScrollPosition = () => {
    if (!loopWidth) return 0;

    const segment = loopWidth;
    const viewport = brandsContainer.clientWidth || 0;
    const forwardThreshold = segment * 3 - viewport;
    const backwardThreshold = segment - viewport;
    let adjustment = 0;

    if (brandsContainer.scrollLeft >= forwardThreshold) {
      brandsContainer.scrollLeft -= segment;
      adjustment -= segment;
    } else if (brandsContainer.scrollLeft <= backwardThreshold) {
      brandsContainer.scrollLeft += segment;
      adjustment += segment;
    }

    return adjustment;
  };

  // Start from the middle copy so users can drag both directions seamlessly.
  requestAnimationFrame(() => {
    recalcLoopWidth();
    if (loopWidth) {
      brandsContainer.scrollLeft = loopWidth;
    }
  });

  let isMouseDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let autoPaused = false;

  const pauseAuto = () => {
    autoPaused = true;
  };

  const resumeAuto = () => {
    autoPaused = false;
    lastTimestamp = null;
  };

  // Mouse drag support
  brandsContainer.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    pauseAuto();
    brandsContainer.classList.add('scrolling');
    startX = event.pageX - brandsContainer.offsetLeft;
    startScrollLeft = brandsContainer.scrollLeft;
  });

  const stopMouseDrag = () => {
    if (!isMouseDown) return;
    isMouseDown = false;
    brandsContainer.classList.remove('scrolling');
    normaliseScrollPosition();
    resumeAuto();
  };

  brandsContainer.addEventListener('mouseleave', stopMouseDrag);
  brandsContainer.addEventListener('mouseup', stopMouseDrag);

  brandsContainer.addEventListener('mousemove', (event) => {
    if (!isMouseDown) return;
    event.preventDefault();
    const x = event.pageX - brandsContainer.offsetLeft;
    const walk = (x - startX) * 2;
    brandsContainer.scrollLeft = startScrollLeft - walk;
    const adjustment = normaliseScrollPosition();
    if (adjustment !== 0) {
      startScrollLeft += adjustment;
    }
  });

  // Touch support
  brandsContainer.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1) return;
    pauseAuto();
    startX = event.touches[0].pageX - brandsContainer.offsetLeft;
    startScrollLeft = brandsContainer.scrollLeft;
  });

  brandsContainer.addEventListener('touchmove', (event) => {
    if (event.touches.length !== 1) return;
    const x = event.touches[0].pageX - brandsContainer.offsetLeft;
    const walk = (x - startX) * 2;
    brandsContainer.scrollLeft = startScrollLeft - walk;
    const adjustment = normaliseScrollPosition();
    if (adjustment !== 0) {
      startScrollLeft += adjustment;
    }
  }, { passive: true });

  const stopTouch = () => {
    normaliseScrollPosition();
    resumeAuto();
  };

  brandsContainer.addEventListener('touchend', stopTouch);
  brandsContainer.addEventListener('touchcancel', stopTouch);

  brandsContainer.addEventListener('scroll', normaliseScrollPosition);

  // Auto scroll (deliberately gentle to match the brand aesthetic)
  const SPEED_PX_PER_SECOND = 90;
  let lastTimestamp = null;

  const autoScroll = (timestamp) => {
    if (!loopWidth) {
      recalcLoopWidth();
    }

    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }

    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (!autoPaused && !isMouseDown && loopWidth) {
      brandsContainer.scrollLeft += (SPEED_PX_PER_SECOND * delta) / 1000;
      normaliseScrollPosition();
    }

    requestAnimationFrame(autoScroll);
  };

  requestAnimationFrame(autoScroll);

  // Keep measurements up to date when the viewport changes.
  window.addEventListener('resize', () => {
    const previousLoopWidth = loopWidth;
    recalcLoopWidth();
    if (loopWidth && previousLoopWidth !== loopWidth) {
      brandsContainer.scrollLeft = loopWidth;
      normaliseScrollPosition();
    }
  });
});
