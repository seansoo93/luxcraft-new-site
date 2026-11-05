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
    const scrollLeft = brandsContainer.scrollLeft;

    // Aggressive looping logic:
    // We aim to keep the scroll position strictly within the middle set (Set B),
    // which corresponds to the range [segment, 2*segment).
    // This assumes we have 3 identical sets of content (A, B, C).

    // Buffer to avoid floating point issues or single-pixel jitter
    const buffer = 1;

    if (scrollLeft >= 2 * segment - buffer) {
      // If we reach the end of Set B (start of Set C), jump back to start of Set B
      brandsContainer.scrollLeft -= segment;
      return -segment;
    } else if (scrollLeft <= segment - buffer) {
      // If we reach the start of Set B (end of Set A), jump forward to end of Set B
      brandsContainer.scrollLeft += segment;
      return segment;
    }

    return 0;
  };

  // Start from the middle copy (Set B)
  requestAnimationFrame(() => {
    recalcLoopWidth();
    if (loopWidth) {
      brandsContainer.scrollLeft = loopWidth;
    }
  });

  // State
  let isMouseDown = false;
  let isUserInteracting = false;
  let startX = 0;
  let startScrollLeft = 0;
  let autoPaused = false;
  let lastTimestamp = null;
  let userScrollTimeout = null;
  const SPEED_PX_PER_SECOND = 60; // Slightly slower for elegance

  const pauseAuto = () => {
    autoPaused = true;
    isUserInteracting = true;
  };

  const resumeAuto = () => {
    isUserInteracting = false;
    lastTimestamp = null; // Reset timestamp to avoid large delta jumps
    autoPaused = false;
  };

  // --- Wheel / Trackpad Support ---
  // Detects manual scrolling via trackpad or mouse wheel
  brandsContainer.addEventListener('wheel', () => {
    // Pause immediately on wheel event
    pauseAuto();

    // Clear existing timeout to keep it paused while scrolling continues
    if (userScrollTimeout) {
      clearTimeout(userScrollTimeout);
    }

    // Resume after a short delay of no scrolling (0.5 seconds)
    userScrollTimeout = setTimeout(() => {
      resumeAuto();
    }, 500);
  }, { passive: true });

  // --- Mouse Drag Support ---
  // We keep this because "grab and drag" is nice on desktop.
  brandsContainer.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    pauseAuto();
    brandsContainer.classList.add('scrolling');
    startX = event.pageX - brandsContainer.offsetLeft;
    startScrollLeft = brandsContainer.scrollLeft;
    // Prevent default text selection
    event.preventDefault();
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
    const walk = (x - startX) * 2; // Scroll-fast
    brandsContainer.scrollLeft = startScrollLeft - walk;
    // We do NOT call normaliseScrollPosition here to avoid fighting the user.
  });

  // --- Touch Support ---
  brandsContainer.addEventListener('touchstart', () => {
    pauseAuto();
  }, { passive: true });

  brandsContainer.addEventListener('touchend', () => {
    // Resume shortly after touch ends
    setTimeout(resumeAuto, 500); // Consistent 0.5s delay
  }, { passive: true });

  // --- Scroll Event ---
  // Handles the infinite loop logic seamlessly
  brandsContainer.addEventListener('scroll', () => {
    // We only normalise if NOT currently dragging with mouse,
    // as mouse dragging calculates position manually and normalisation might conflict
    // slightly during the drag (though end of drag normalises).
    // Actually, for wheel/touch/auto, we absolutely need this.
    // For mouse drag, it might be safer to skip or handle carefully.
    // Given the aggressive check, let's allow it but be careful.
    if (!isMouseDown) {
      normaliseScrollPosition();
    }
  });

  // --- Auto Scroll ---
  const autoScroll = (timestamp) => {
    if (!loopWidth) {
      recalcLoopWidth();
    }

    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }

    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // Only auto-scroll if user is NOT interacting
    if (!autoPaused && !isMouseDown && !isUserInteracting && loopWidth) {
      brandsContainer.scrollLeft += (SPEED_PX_PER_SECOND * delta) / 1000;
    }

    requestAnimationFrame(autoScroll);
  };

  requestAnimationFrame(autoScroll);

  // Keep measurements up to date
  window.addEventListener('resize', () => {
    const previousLoopWidth = loopWidth;
    recalcLoopWidth();
    if (loopWidth && previousLoopWidth !== loopWidth) {
      brandsContainer.scrollLeft = loopWidth;
    }
  });
});
