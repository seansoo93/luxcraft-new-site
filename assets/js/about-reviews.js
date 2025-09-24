(function () {
  const slider = document.querySelector('[data-reviews-slider]');
  if (!slider) return;

  const track = slider.querySelector('[data-reviews-track]');
  const slides = Array.from(track.querySelectorAll('[data-reviews-slide]'));
  const prevButton = slider.querySelector('[data-reviews-prev]');
  const nextButton = slider.querySelector('[data-reviews-next]');
  const dots = Array.from(slider.parentElement.querySelectorAll('[data-reviews-dot]'));

  if (!slides.length) return;

  let index = 0;

  const setSlideStates = () => {
    slides.forEach((slide, idx) => {
      const isActive = idx === index;
      slide.setAttribute('aria-hidden', (!isActive).toString());
      slide.tabIndex = isActive ? 0 : -1;
    });

    dots.forEach((dot, idx) => {
      const isActive = idx === index;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    track.style.transform = `translateX(-${index * 100}%)`;

    if (prevButton) {
      prevButton.disabled = index === 0;
      prevButton.setAttribute('aria-disabled', (index === 0).toString());
    }

    if (nextButton) {
      const isLast = index === slides.length - 1;
      nextButton.disabled = isLast;
      nextButton.setAttribute('aria-disabled', isLast.toString());
    }
  };

  const goTo = (targetIndex) => {
    if (targetIndex < 0 || targetIndex > slides.length - 1) return;
    index = targetIndex;
    setSlideStates();
  };

  prevButton?.addEventListener('click', () => {
    if (index > 0) goTo(index - 1);
  });

  nextButton?.addEventListener('click', () => {
    if (index < slides.length - 1) goTo(index + 1);
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = Number.parseInt(dot.getAttribute('data-reviews-dot') || '0', 10);
      goTo(target);
    });
  });

  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (index < slides.length - 1) goTo(index + 1);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (index > 0) goTo(index - 1);
    }
  });

  setSlideStates();
})();
