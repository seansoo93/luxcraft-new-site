const NAV_LINKS = [
  { href: 'about.html', label: 'Who We Are' },
  { href: 'services.html', label: 'What We Do' },
  { href: 'portfolio.html', label: 'Our Past Works' },
  { href: 'contact.html', label: 'Contact Us' },
];

const socialMarkup = `
      <div aria-label="Social media" class="site-footer__socials">
        <a aria-label="Instagram" class="site-footer__social" href="https://www.instagram.com/luxcraft.studio/" rel="noreferrer" target="_blank">
          <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4" viewBox="0 0 24 24">
            <rect height="18" rx="5" ry="5" width="18" x="3" y="3"></rect>
            <circle cx="12" cy="12" r="3.5"></circle>
            <circle cx="17.5" cy="6.5" fill="currentColor" r="0.9" stroke="none"></circle>
          </svg>
        </a>
        <a aria-label="Facebook" class="site-footer__social" href="https://www.facebook.com/luxcraft.studio" rel="noreferrer" target="_blank">
          <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4" viewBox="0 0 24 24">
            <path d="M15 7h-2.2c-.6 0-.8.3-.8.8V11h3l-.4 3h-2.6v8h-3.1v-8H7v-3h2.9V7.5C9.9 5.6 11 4 13.6 4H15v3z"></path>
          </svg>
        </a>
        <a aria-label="TikTok" class="site-footer__social" href="https://www.tiktok.com/@luxcraft.studio" rel="noreferrer" target="_blank">
          <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4" viewBox="0 0 24 24">
            <path d="M16.5 3.5C16.9 5.1 18.2 6.3 19.8 6.6v2.6c-1.5-.1-2.9-.6-4.1-1.4v6.5a5.1 5.1 0 1 1-5.1-5.1c.3 0 .7 0 1 .1v2.8a2.2 2.2 0 1 0 1.5 2.1V3.5h2.7z"></path>
          </svg>
        </a>
      </div>`;

const buildFooter = () => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const navLinks = NAV_LINKS.map(({ href, label }) => {
    const isCurrent = currentPath === href;
    const ariaAttr = isCurrent ? ' aria-current="page"' : '';
    return `<a href="${href}"${ariaAttr}>${label}</a>`;
  }).join('\n        ');

  return `
<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__top">
      <a aria-label="LuxCraft Home" class="site-footer__brand" href="index.html">
        <img alt="LuxCraft" src="assets/images/logo.png" />
      </a>
      <nav aria-label="Footer navigation" class="site-footer__nav">
        ${navLinks}
      </nav>
    </div>
    <div aria-hidden="true" class="site-footer__divider"></div>
    <div class="site-footer__content">
      <div class="site-footer__column">
        <p>190 Woodlands Industrial Park E5</p>
        <p>Woodlands Bizhub, #04-05</p>
        <p>Singapore 757516</p>
      </div>
      <div class="site-footer__column site-footer__column--contact">
        <a href="https://wa.me/6583126212">+65 8312 6212 <span>(Shamim)</span></a>
        <a href="https://wa.me/6588991245">+65 8899 1245 <span>(Manfred)</span></a>
        <a class="site-footer__email" href="mailto:contact@luxcraft.sg">contact@luxcraft.sg</a>
      </div>
${socialMarkup}
    </div>
    <p class="site-footer__legal">LuxCraft Pte. Ltd © 2025. All Rights Reserved.</p>
  </div>
</footer>`;
};

const initFooter = () => {
  const containers = document.querySelectorAll('[data-footer]');
  if (!containers.length) return;

  const markup = buildFooter();
  containers.forEach((el) => {
    el.innerHTML = markup;
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFooter);
} else {
  initFooter();
}
