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
      
      let cleanedPath = src;
      if (!cleanedPath.startsWith('/')) cleanedPath = '/' + cleanedPath;
      const tag = (typeof window.galleryTags !== 'undefined' && window.galleryTags[cleanedPath]) ? window.galleryTags[cleanedPath] : 'Others';
      button.dataset.galleryTag = tag;
      
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

    const filterContainer = gallery.querySelector('.portfolio-detail-gallery__filters');
    if (filterContainer && typeof window.galleryTags !== 'undefined') {
      const uniqueTags = new Set();
      buttons.forEach(btn => uniqueTags.add(btn.dataset.galleryTag));
      
      if (uniqueTags.size > 1) {
        const tagsArray = ['All', ...Array.from(uniqueTags)];
        tagsArray.forEach(tag => {
          const btn = document.createElement('button');
          const isActive = tag === 'All';
          btn.className = 'px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full border transition-colors ' + 
            (isActive ? 'bg-white text-lux-dark border-lux-dark' : 'bg-white text-lux-dark border-lux-dark/20 hover:bg-lux-dark/5');
          btn.textContent = tag;
          
          btn.addEventListener('click', () => {
             Array.from(filterContainer.children).forEach(b => {
                 b.className = 'px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full border transition-colors bg-white text-lux-dark border-lux-dark/20 hover:bg-lux-dark/5';
             });
             btn.className = 'px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full border transition-colors bg-white text-lux-dark border-lux-dark';
             
             let firstVisibleIndex = -1;
             buttons.forEach((b, idx) => {
                 if (tag === 'All' || b.dataset.galleryTag === tag) {
                     b.style.display = '';
                     if (firstVisibleIndex === -1) firstVisibleIndex = idx;
                 } else {
                     b.style.display = 'none';
                 }
             });
             
             thumbnailsHost.scrollLeft = 0;
             scheduleScrollableUpdate();
             if (firstVisibleIndex !== -1) {
                 updateActiveButton(firstVisibleIndex);
             }
          });
          filterContainer.appendChild(btn);
        });
      }
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

      const leftBtn = gallery.querySelector('[data-gallery-scroll="left"]');
      const rightBtn = gallery.querySelector('[data-gallery-scroll="right"]');

      if (isScrollable) {
        thumbnailsHost.setAttribute('data-scrollable', 'true');
        thumbnailsHost.parentElement?.setAttribute('data-scrollable', 'true');

        // Update button disabled states based on scroll position
        if (leftBtn) {
          leftBtn.disabled = thumbnailsHost.scrollLeft <= 2;
        }
        if (rightBtn) {
          rightBtn.disabled = thumbnailsHost.scrollLeft >= overflowWidth - 2;
        }
      } else {
        thumbnailsHost.removeAttribute('data-scrollable');
        thumbnailsHost.parentElement?.removeAttribute('data-scrollable');
        if (leftBtn) leftBtn.disabled = true;
        if (rightBtn) rightBtn.disabled = true;

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
      let nextIndex = currentIndex;
      let iterations = 0;
      do {
        nextIndex = normalizeIndex(nextIndex + delta, buttons.length);
        iterations++;
      } while (buttons[nextIndex].style.display === 'none' && iterations < buttons.length);
      
      if (buttons[nextIndex].style.display !== 'none') {
        updateActiveButton(nextIndex, { focus: true });
      }
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

    thumbnailsHost.addEventListener('scroll', scheduleScrollableUpdate, { passive: true });

    const scrollButtons = gallery.querySelectorAll('[data-gallery-scroll]');
    scrollButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const direction = btn.dataset.galleryScroll;
        const scrollAmount = thumbnailsHost.clientWidth * 0.75;
        thumbnailsHost.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
      });
    });

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    updateActiveButton(0);
    scheduleScrollableUpdate();
  });
});
