document.addEventListener('DOMContentLoaded', function() {
    const brandsList = document.querySelector('.why-panel__logos');
    if (!brandsList) return;
    
    // Stop any existing scroll behavior
    brandsList.scrollLeft = 0;
    
    // Pause animation on hover
    brandsList.addEventListener('mouseenter', () => {
        brandsList.style.animationPlayState = 'paused';
    });
    
    brandsList.addEventListener('mouseleave', () => {
        brandsList.style.animationPlayState = 'running';
    });

    // Prevent manual scrolling
    brandsList.addEventListener('scroll', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, { passive: false });
});