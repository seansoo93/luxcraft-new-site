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
      prevButton.disabled = false;
      prevButton.setAttribute('aria-disabled', 'false');
    }

    if (nextButton) {
      nextButton.disabled = false;
      nextButton.setAttribute('aria-disabled', 'false');
    }
  };

  const goTo = (targetIndex) => {
    if (targetIndex < 0 || targetIndex > slides.length - 1) return;
    index = targetIndex;
    setSlideStates();
  };

  prevButton?.addEventListener('click', () => {
    const targetIndex = (index - 1 + slides.length) % slides.length;
    goTo(targetIndex);
  });

  nextButton?.addEventListener('click', () => {
    const targetIndex = (index + 1) % slides.length;
    goTo(targetIndex);
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
      const targetIndex = (index + 1) % slides.length;
      goTo(targetIndex);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const targetIndex = (index - 1 + slides.length) % slides.length;
      goTo(targetIndex);
    }
  });

  setSlideStates();
})();
