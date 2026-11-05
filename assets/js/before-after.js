/**
 * LuxCraft - Interactive Before & After Comparison Slider
 * Provides smooth mouse hover tracking, touch/pointer dragging,
 * keyboard navigation, eye preview toggle, and smooth easing reset.
 */
(() => {
  const initBeforeAfter = () => {
    const slider = document.querySelector('.before-after-slider');
    if (!slider) return;

    const beforeLayer = slider.querySelector('.before-after__layer--before');
    const divider = slider.querySelector('.before-after__divider');
    const eyeBtn = slider.querySelector('.before-after__eye-btn');
    
    if (!beforeLayer || !divider) return;

    let isDragging = false;
    let isHovering = false;
    let isEyeActive = false;
    let currentPos = 50; // percentage
    let animFrameId = null;
    let returnTimeoutId = null;
    let savedPosBeforeEye = 50;

    const setPosition = (percent) => {
      currentPos = Math.max(0, Math.min(100, percent));
      
      // Update CSS variable
      slider.style.setProperty('--ba-position', `${currentPos}%`);
      slider.dataset.position = currentPos.toFixed(1);
      
      // Directly update divider position and clip-path for instant, reliable hardware-accelerated rendering
      divider.style.left = `${currentPos}%`;
      const clipValue = `inset(0 ${100 - currentPos}% 0 0)`;
      beforeLayer.style.clipPath = clipValue;
      beforeLayer.style.webkitClipPath = clipValue;
      
      slider.setAttribute('aria-valuenow', Math.round(currentPos));
    };

    // Smooth transition helper
    const animateTo = (dest, duration = 380) => {
      cancelAnimationFrame(animFrameId);
      const startPos = currentPos;
      const startTime = performance.now();

      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const next = startPos + (dest - startPos) * eased;
        setPosition(next);

        if (progress < 1) {
          animFrameId = requestAnimationFrame(step);
        } else {
          setPosition(dest);
        }
      };

      animFrameId = requestAnimationFrame(step);
    };

    const getPercentageFromEvent = (e) => {
      const rect = slider.getBoundingClientRect();
      if (rect.width <= 0) return 50;
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const offsetX = clientX - rect.left;
      const pct = (offsetX / rect.width) * 100;
      return Math.max(0, Math.min(100, pct));
    };

    // Mouse hover tracking
    slider.addEventListener('mouseenter', (e) => {
      if (isEyeActive) return;
      isHovering = true;
      cancelAnimationFrame(animFrameId);
      if (returnTimeoutId) {
        clearTimeout(returnTimeoutId);
        returnTimeoutId = null;
      }
      const pct = getPercentageFromEvent(e);
      setPosition(pct);
    });

    slider.addEventListener('mousemove', (e) => {
      if (isEyeActive) return;
      cancelAnimationFrame(animFrameId);
      const pct = getPercentageFromEvent(e);
      setPosition(pct);
    });

    slider.addEventListener('mouseleave', () => {
      if (isDragging || isEyeActive) return;
      isHovering = false;
      // Smoothly glide back to 50% center after a short delay
      returnTimeoutId = setTimeout(() => {
        if (!isHovering && !isDragging && !isEyeActive) {
          animateTo(50, 450);
        }
      }, 300);
    });

    // Touch and pointer dragging
    const onPointerDown = (e) => {
      if (e.target.closest('.before-after__eye-btn')) return;
      
      isDragging = true;
      cancelAnimationFrame(animFrameId);
      if (slider.setPointerCapture) {
        try {
          slider.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
      slider.classList.add('is-dragging');
      const pct = getPercentageFromEvent(e);
      setPosition(pct);
    };

    const onPointerMove = (e) => {
      if (!isDragging || isEyeActive) return;
      const pct = getPercentageFromEvent(e);
      setPosition(pct);
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      slider.classList.remove('is-dragging');
      if (slider.releasePointerCapture) {
        try {
          slider.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
      if (!isHovering) {
        returnTimeoutId = setTimeout(() => {
          if (!isHovering && !isDragging && !isEyeActive) {
            animateTo(50, 450);
          }
        }, 600);
      }
    };

    slider.addEventListener('pointerdown', onPointerDown);
    slider.addEventListener('pointermove', onPointerMove);
    slider.addEventListener('pointerup', onPointerUp);
    slider.addEventListener('pointercancel', onPointerUp);

    // Eye button: click or hold to preview full Before / After
    if (eyeBtn) {
      const activateEye = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isEyeActive) return;
        isEyeActive = true;
        savedPosBeforeEye = currentPos;
        animateTo(100, 250);
        eyeBtn.classList.add('is-active');
      };

      const deactivateEye = () => {
        if (!isEyeActive) return;
        isEyeActive = false;
        eyeBtn.classList.remove('is-active');
        animateTo(savedPosBeforeEye, 300);
      };

      eyeBtn.addEventListener('pointerdown', activateEye);
      window.addEventListener('pointerup', deactivateEye);
      window.addEventListener('pointercancel', deactivateEye);

      eyeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      eyeBtn.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (isEyeActive) {
            deactivateEye();
          } else {
            activateEye(e);
          }
        }
      });
    }

    // Slider keyboard accessibility
    slider.setAttribute('tabindex', '0');
    slider.setAttribute('role', 'slider');
    slider.setAttribute('aria-label', 'Before and after interior design comparison');
    slider.setAttribute('aria-valuemin', '0');
    slider.setAttribute('aria-valuemax', '100');
    slider.setAttribute('aria-valuenow', '50');

    slider.addEventListener('keydown', (e) => {
      let handled = false;
      let newPos = currentPos;
      if (e.key === 'ArrowLeft') {
        newPos = Math.max(0, currentPos - 5);
        handled = true;
      } else if (e.key === 'ArrowRight') {
        newPos = Math.min(100, currentPos + 5);
        handled = true;
      } else if (e.key === 'Home') {
        newPos = 0;
        handled = true;
      } else if (e.key === 'End') {
        newPos = 100;
        handled = true;
      }

      if (handled) {
        e.preventDefault();
        cancelAnimationFrame(animFrameId);
        setPosition(newPos);
      }
    });

    // Initialize at 50%
    setPosition(50);
    console.log('[BeforeAfter] Initialized successfully at 50%');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBeforeAfter);
  } else {
    initBeforeAfter();
  }
})();
