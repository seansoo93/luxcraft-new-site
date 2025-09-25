(function () {
  const filterGroup = document.querySelector('[data-portfolio-filter]');
  if (!filterGroup) return;

  const buttons = Array.from(filterGroup.querySelectorAll('[data-filter]'));
  const items = Array.from(document.querySelectorAll('[data-portfolio-item]'));

  if (!buttons.length || !items.length) return;

  let activeFilter = 'all';

  const setActiveButton = (buttonToActivate) => {
    buttons.forEach((button) => {
      const isActive = button === buttonToActivate;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const applyFilter = (filter) => {
    activeFilter = filter;
    items.forEach((item) => {
      const categories = (item.dataset.categories || '').trim().split(/\s+/).filter(Boolean);
      const shouldShow = filter === 'all' || categories.includes(filter);
      item.classList.toggle('hidden', !shouldShow);
      item.setAttribute('aria-hidden', (!shouldShow).toString());
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      if (filter === activeFilter) return;
      setActiveButton(button);
      applyFilter(filter);
    });

    button.addEventListener('keydown', (event) => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      button.click();
    });
  });

  filterGroup.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const currentIndex = buttons.findIndex((button) => button.getAttribute('aria-pressed') === 'true');
    if (currentIndex === -1) return;

    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + direction + buttons.length) % buttons.length;
    const nextButton = buttons[nextIndex];
    nextButton.focus();
    nextButton.click();
  });

  // initialize
  setActiveButton(buttons[0]);
  applyFilter(activeFilter);
})();
