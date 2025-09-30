document.addEventListener('DOMContentLoaded', () => {
  const mediaBlocks = document.querySelectorAll('.portfolio-card__media[data-portfolio-images]');

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
  });
});
