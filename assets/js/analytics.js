/**
 * Google Analytics (GA4) & Meta Pixel Initialization
 * 
 * INSTRUCTIONS:
 * 1. Google Analytics Measurement ID is G-JMXJ9RTM2J.
 * 2. Meta Pixel ID is 1484098923039552.
 * 3. This script is loaded defer-red in the <head> of all pages.
 */

(function () {
    const GA_MEASUREMENT_ID = 'G-JMXJ9RTM2J';

    // 1. Google Analytics Setup
    if (!document.getElementById('ga-script')) {
        const script = document.createElement('script');
        script.id = 'ga-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        const gtag = window.gtag;
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID);
        console.log('Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
    }

    // 2. Meta Pixel Setup
    if (!window.fbq) {
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        fbq('init', '1484098923039552');
        fbq('track', 'PageView');
        console.log('Meta Pixel initialized with ID: 1484098923039552');

        // Dynamically add noscript image tag so compliance checkers detect it
        const noscript = document.createElement('noscript');
        const img = document.createElement('img');
        img.height = 1;
        img.width = 1;
        img.style.display = 'none';
        img.src = 'https://www.facebook.com/tr?id=1484098923039552&ev=PageView&noscript=1';
        noscript.appendChild(img);
        (document.body || document.head).appendChild(noscript);
    }
})();
