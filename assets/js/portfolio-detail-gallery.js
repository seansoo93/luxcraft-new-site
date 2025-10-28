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
    let scrollUpdateFrame = null;
    const displayFrame = displayImage.closest('.portfolio-detail-gallery__display') || displayImage;

    const scrollDisplayIntoView = () => {
      if (!(displayFrame instanceof HTMLElement)) return;

      const rect = displayFrame.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      const isAbove = rect.top < 0;
      const isBelow = rect.bottom > viewportHeight;

      if (isAbove || isBelow) {
        displayFrame.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const updateScrollableState = () => {
      if (!buttons.length) return;

      const overflowWidth = thumbnailsHost.scrollWidth - thumbnailsHost.clientWidth;
      const isScrollable = overflowWidth > 1;

      if (isScrollable) {
        thumbnailsHost.setAttribute('data-scrollable', 'true');
      } else {
        thumbnailsHost.removeAttribute('data-scrollable');
        if (thumbnailsHost.scrollLeft !== 0) {
          thumbnailsHost.scrollLeft = 0;
        }
      }
    };

    const scheduleScrollableUpdate = () => {
      if (scrollUpdateFrame !== null) return;
      scrollUpdateFrame = window.requestAnimationFrame(() => {
        scrollUpdateFrame = null;
        updateScrollableState();
      });
    };

    const scrollThumbnailIntoView = (button) => {
      if (!(button instanceof HTMLElement)) {
        return;
      }

      const requiresScroll = thumbnailsHost.scrollWidth - thumbnailsHost.clientWidth > 1;
      if (!requiresScroll) {
        return;
      }

      button.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    };

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
      scrollThumbnailIntoView(nextButton);

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
        scrollDisplayIntoView();
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

      const thumbImage = button.querySelector('img');
      if (thumbImage) {
        if (thumbImage.complete) {
          scheduleScrollableUpdate();
        } else {
          thumbImage.addEventListener('load', scheduleScrollableUpdate, { once: true });
          thumbImage.addEventListener('error', scheduleScrollableUpdate, { once: true });
        }
      }
    });

    if (typeof ResizeObserver === 'function') {
      const resizeObserver = new ResizeObserver(() => {
        scheduleScrollableUpdate();
      });
      resizeObserver.observe(thumbnailsHost);
    }

    const handleResize = () => {
      scheduleScrollableUpdate();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    updateActiveButton(0);
    scheduleScrollableUpdate();
  });
});
