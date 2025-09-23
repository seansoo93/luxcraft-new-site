document.addEventListener('DOMContentLoaded', function() {
    const brandsContainer = document.querySelector('.why-panel__logos');
    const scrollContent = document.querySelector('.brand-scroll-content');
    if (!brandsContainer || !scrollContent) return;

    let isMouseDown = false;
    let startX;
    let scrollLeft;

    // Handle mouse events for dragging
    brandsContainer.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        brandsContainer.classList.add('scrolling');
        startX = e.pageX - brandsContainer.offsetLeft;
        scrollLeft = brandsContainer.scrollLeft;
    });

    brandsContainer.addEventListener('mouseleave', () => {
        isMouseDown = false;
        brandsContainer.classList.remove('scrolling');
    });

    brandsContainer.addEventListener('mouseup', () => {
        isMouseDown = false;
        brandsContainer.classList.remove('scrolling');
    });

    brandsContainer.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        e.preventDefault();
        const x = e.pageX - brandsContainer.offsetLeft;
        const walk = (x - startX) * 2;
        brandsContainer.scrollLeft = scrollLeft - walk;
    });

    // Handle touch events for mobile
    brandsContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - brandsContainer.offsetLeft;
        scrollLeft = brandsContainer.scrollLeft;
    });

    brandsContainer.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1) return;
        const x = e.touches[0].pageX - brandsContainer.offsetLeft;
        const walk = (x - startX) * 2;
        brandsContainer.scrollLeft = scrollLeft - walk;
    });

    // Pause animation on interaction
    brandsContainer.addEventListener('mouseenter', () => {
        scrollContent.style.animationPlayState = 'paused';
    });

    brandsContainer.addEventListener('mouseleave', () => {
        scrollContent.style.animationPlayState = 'running';
    });

    // Handle touch events for mobile
    brandsContainer.addEventListener('touchstart', () => {
        scrollContent.style.animationPlayState = 'paused';
    });

    brandsContainer.addEventListener('touchend', () => {
        scrollContent.style.animationPlayState = 'running';
    });
});