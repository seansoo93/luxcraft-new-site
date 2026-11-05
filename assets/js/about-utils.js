(() => {
    // Clamp each review to 3 lines and add a "See more…" toggle only when needed.
    const quotes = document.querySelectorAll('.about-reviews__quote');
    if (!quotes.length) return;

    quotes.forEach((q) => {
        // Temporarily expand to measure real height (avoid measuring the clamped height)
        const wasExpanded = q.getAttribute('data-expanded') === 'true';
        q.setAttribute('data-expanded', 'true');

        const computed = getComputedStyle(q);
        const lineHeight = parseFloat(computed.lineHeight) || 24;
        const totalLines = Math.round(q.scrollHeight / lineHeight);
        const needsToggle = totalLines > 3;

        // Restore collapsed by default unless it was already expanded
        if (!wasExpanded) q.removeAttribute('data-expanded');

        if (!needsToggle) return;

        // Ensure collapsed state initially
        q.removeAttribute('data-expanded');

        // Build the toggle button
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'review-toggle';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Expand full review');
        btn.textContent = '▼';

        btn.addEventListener('click', () => {
            const expanded = q.getAttribute('data-expanded') === 'true';
            if (expanded) {
                q.removeAttribute('data-expanded');
                btn.setAttribute('aria-expanded', 'false');
                btn.setAttribute('aria-label', 'Expand full review');
                btn.textContent = '▼';
            } else {
                q.setAttribute('data-expanded', 'true');
                btn.setAttribute('aria-expanded', 'true');
                btn.setAttribute('aria-label', 'Collapse review');
                btn.textContent = '▲';
            }
        });

        // Insert right after the <blockquote> (inside the same <figure>)
        q.insertAdjacentElement('afterend', btn);
    });
})();
