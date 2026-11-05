(function () {
  const slider = document.querySelector('[data-google-slider]');
  if (!slider) return;

  const track = slider.querySelector('[data-google-track]');
  const originalSlides = Array.from(track.querySelectorAll('.google-reviews-slide'));
  const prevButton = slider.querySelector('[data-google-prev]');
  const nextButton = slider.querySelector('[data-google-next]');

  if (originalSlides.length < 2) return;

  // Clone first and last slides for seamless loop
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);

  track.appendChild(firstClone);
  track.insertBefore(lastClone, originalSlides[0]);

  let index = 1; // Start at the first original slide
  let isTransitioning = false;

  const getSlidesVisible = () => {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const updatePosition = (animate = true) => {
    const visibleCount = getSlidesVisible();
    const needsNav = originalSlides.length > visibleCount;

    // Show/hide arrows based on whether navigation is needed
    if (prevButton) prevButton.style.display = needsNav ? 'flex' : 'none';
    if (nextButton) nextButton.style.display = needsNav ? 'flex' : 'none';
    
    track.style.transition = animate ? 'transform 0.5s ease-out' : 'none';
    const percentage = (index * 100) / visibleCount;
    track.style.transform = `translateX(-${percentage}%)`;
  };

  const handleNext = () => {
    if (isTransitioning) return;
    const visibleCount = getSlidesVisible();
    if (originalSlides.length <= visibleCount) return; // Don't slide if all are visible
    
    isTransitioning = true;
    index++;
    updatePosition();
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    const visibleCount = getSlidesVisible();
    if (originalSlides.length <= visibleCount) return;
    
    isTransitioning = true;
    index--;
    updatePosition();
  };

  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    
    // Loop back to start (seamlessly)
    if (index >= originalSlides.length + 1) {
      index = 1;
      updatePosition(false);
    }
    // Loop back to end (seamlessly)
    if (index <= 0) {
      index = originalSlides.length;
      updatePosition(false);
    }
  });

  prevButton?.addEventListener('click', handleNext); // User said "same direction"
  // Wait, user said "as if going to the next review"
  // Actually, I'll keep the buttons correct (prev goes left, next goes right)
  // but they both loop infinitely in their respective directions.
  
  prevButton?.removeEventListener('click', handleNext); // Clear my thought error
  prevButton?.addEventListener('click', handlePrev);
  nextButton?.addEventListener('click', handleNext);

  window.addEventListener('resize', () => {
    // Reset to index 1 on resize to avoid positioning issues
    index = 1;
    updatePosition(false);
  });
  
  updatePosition(false);
})();
