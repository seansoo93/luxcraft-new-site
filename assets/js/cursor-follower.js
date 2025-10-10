document.addEventListener('DOMContentLoaded', () => {
  const cursorEl = document.querySelector('.cursor-follower');
  const supportsFinePointer = window.matchMedia('(any-pointer: fine)').matches;
  const prefersCoarseOrMobile = window.matchMedia('(max-width: 640px)').matches;
  const isMobileDisabled = cursorEl?.dataset.mobileDisabled === 'true' && prefersCoarseOrMobile;

  if (cursorEl && supportsFinePointer && !isMobileDisabled) {
    const offsetX = 33;
    const offsetY = 27;
    let targetX = window.innerWidth / 2 + offsetX;
    let targetY = window.innerHeight / 2 + offsetY;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = null;

    const render = () => {
      const ease = 0.18;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      cursorEl.style.left = `${currentX}px`;
      cursorEl.style.top = `${currentY}px`;

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        rafId = requestAnimationFrame(render);
      } else {
        rafId = null;
      }
    };

    const startRendering = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(render);
      }
    };

    const showFollower = (event) => {
      targetX = event.clientX + offsetX;
      targetY = event.clientY + offsetY;

      if (!cursorEl.classList.contains('is-visible')) {
        cursorEl.classList.add('is-visible');
        currentX = targetX;
        currentY = targetY;
        cursorEl.style.left = `${currentX}px`;
        cursorEl.style.top = `${currentY}px`;
      }

      startRendering();
    };

    const hideFollower = () => {
      cursorEl.classList.remove('is-visible');
      cursorEl.classList.remove('is-active');
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    window.addEventListener('pointermove', showFollower);
    window.addEventListener('pointerdown', () => cursorEl.classList.add('is-active'));
    window.addEventListener('pointerup', () => cursorEl.classList.remove('is-active'));
    window.addEventListener('pointerleave', hideFollower);
    window.addEventListener('blur', hideFollower);
  } else if (cursorEl) {
    cursorEl.remove();
  }
});
