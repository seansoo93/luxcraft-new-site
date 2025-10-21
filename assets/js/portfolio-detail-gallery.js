document.addEventListener('DOMContentLoaded', () => {
  const galleries = document.querySelectorAll('[data-portfolio-detail-gallery]');

  const normalizeIndex = (index, total) => ((index % total) + total) % total;

  galleries.forEach((gallery) => {
    const displayImage = gallery.querySelector('[data-gallery-display]');
    const thumbnailsHost = gallery.querySelector('[data-gallery-thumbnails]');

    if (!displayImage || !thumbnailsHost) {
      return;
    }

    const sourceSelector = gallery.dataset.gallerySource;
    const sourceElement = sourceSelector
      ? document.querySelector(sourceSelector)
      : document.querySelector(
          '.portfolio-detail-overview__media .portfolio-card__media[data-portfolio-images]'
        );

    let baseAlt = gallery.dataset.galleryAlt?.trim() || '';
    let images = [];

    if (sourceElement instanceof HTMLElement) {
      const rawImages = sourceElement.dataset.portfolioImages || '[]';

      try {
        images = JSON.parse(rawImages);
      } catch {
        images = [];
      }

      if (!baseAlt) {
        baseAlt = sourceElement.dataset.portfolioAlt?.trim() || 'Project image';
      }
    }

    if (!Array.isArray(images)) {
      images = [];
    }

    const usableImages = images
      .filter((src) => typeof src === 'string' && src.trim().length > 0)
      .map((src) => src.trim());

    if (usableImages.length === 0) {
      gallery.setAttribute('hidden', '');
      return;
    }

    displayImage.decoding = 'async';
    if (!displayImage.dataset.initialized) {
      displayImage.dataset.initialized = 'true';
    }

    const buttons = usableImages.map((src, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'portfolio-detail-gallery__thumb';
      button.dataset.gallerySrc = src;
      button.dataset.galleryIndex = String(index);
      button.setAttribute('aria-label', `${baseAlt} — Image ${index + 1}`);

      const thumbImage = document.createElement('img');
      thumbImage.src = src;
      thumbImage.alt = `${baseAlt} thumbnail ${index + 1}`;
      thumbImage.loading = index === 0 ? 'eager' : 'lazy';
      thumbImage.decoding = 'async';

      button.appendChild(thumbImage);
      thumbnailsHost.appendChild(button);

      return button;
    });

    if (!buttons.length) {
      gallery.setAttribute('hidden', '');
      return;
    }

    let currentIndex = -1;

    const updateActiveButton = (nextIndex, { focus = false } = {}) => {
      const normalizedIndex = normalizeIndex(nextIndex, buttons.length);
      if (normalizedIndex === currentIndex) {
        return;
      }

      const nextButton = buttons[normalizedIndex];
      if (!nextButton) {
        return;
      }

      const previousButton = buttons[currentIndex];
      previousButton?.classList.remove('is-active');
      previousButton?.removeAttribute('aria-current');

      nextButton.classList.add('is-active');
      nextButton.setAttribute('aria-current', 'true');

      const nextSrc = nextButton.dataset.gallerySrc;
      if (nextSrc) {
        displayImage.src = nextSrc;
      }

      const description = `${baseAlt} — Image ${normalizedIndex + 1}`;
      displayImage.alt = description;
      displayImage.dataset.galleryIndex = String(normalizedIndex);

      currentIndex = normalizedIndex;

      if (focus) {
        nextButton.focus();
      }
    };

    const stepGallery = (delta) => {
      updateActiveButton(currentIndex + delta, { focus: true });
    };

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        updateActiveButton(index);
      });

      button.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          stepGallery(1);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          stepGallery(-1);
        }
      });
    });

    updateActiveButton(0);
  });
});
