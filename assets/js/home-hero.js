document.addEventListener('DOMContentLoaded', () => {
    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const navButtons = Array.from(document.querySelectorAll('[data-hero-nav]'));
    const progressEl = document.querySelector('[data-hero-progress]');
    const transitionMs = 11000;
    const wipeDurationMs = 1000;
    const copySafetyBufferMs = 150;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeIndex = 0;
    let timerId;
    let isDueToScroll = false;
    let leaveTimeout = null;
    const copyTransitions = new WeakMap();

    const isCursorOnHeroButtons = () => {
        const activeSlide = slides[activeIndex];
        if (!activeSlide) return false;
        const actionEl = activeSlide.querySelector('.hero-actions');
        if (actionEl && actionEl.matches(':hover')) {
            return true;
        }
        const buttons = activeSlide.querySelectorAll('.hero-button');
        for (const btn of buttons) {
            if (btn.matches(':hover, :focus-visible')) {
                return true;
            }
        }
        return false;
    };

    const handleCursorLeaveButtons = () => {
        if (leaveTimeout) {
            clearTimeout(leaveTimeout);
        }
        leaveTimeout = setTimeout(() => {
            if (isDueToScroll && !isCursorOnHeroButtons()) {
                isDueToScroll = false;
                const following = (activeIndex + 1) % slides.length;
                applyState(following);
            }
        }, 60);
    };

    const handleCursorEnterButtons = () => {
        if (leaveTimeout) {
            clearTimeout(leaveTimeout);
            leaveTimeout = null;
        }
    };

    const detachCopyListener = (slide) => {
        const record = copyTransitions.get(slide);
        if (!record) return;
        slide.removeEventListener('transitionend', record.listener);
        if (record.fallbackId) {
            window.clearTimeout(record.fallbackId);
        }
        copyTransitions.delete(slide);
    };

    const queueCopyReveal = (slide) => {
        if (!slide) return;
        const reveal = () => {
            detachCopyListener(slide);
            if (!slide.classList.contains('hero-slide--active')) {
                return;
            }
            slide.classList.add('hero-slide--copy-visible');
        };
        const listener = (event) => {
            const property = event.propertyName || '';
            if (property !== 'clip-path' && property !== 'clipPath') {
                return;
            }
            reveal();
        };
        const fallbackId = window.setTimeout(reveal, wipeDurationMs + copySafetyBufferMs);
        copyTransitions.set(slide, {
            listener,
            fallbackId
        });
        slide.addEventListener('transitionend', listener);
    };

    const applyState = (nextIndex, userInitiated = false) => {
        if (!slides.length) return;

        isDueToScroll = false;
        if (leaveTimeout) {
            clearTimeout(leaveTimeout);
            leaveTimeout = null;
        }

        slides.forEach((slide, idx) => {
            const isActive = idx === nextIndex;
            detachCopyListener(slide);
            if (!prefersReduced) {
                slide.classList.remove('hero-slide--copy-visible');
            } else if (!isActive) {
                slide.classList.remove('hero-slide--copy-visible');
            }

            slide.classList.remove('hero-slide--active');
            if (isActive) {
                if (!prefersReduced) {
                    void slide.offsetWidth;
                }
                slide.classList.add('hero-slide--active');
            }

            if (isActive) {
                if (prefersReduced) {
                    slide.classList.add('hero-slide--copy-visible');
                } else {
                    queueCopyReveal(slide);
                }
            }
            slide.setAttribute('aria-hidden', String(!isActive));
        });

        navButtons.forEach((btn, idx) => {
            const selected = idx === nextIndex;
            btn.setAttribute('aria-selected', String(selected));
        });

        if (progressEl && !prefersReduced) {
            progressEl.style.transition = 'none';
            progressEl.style.transform = 'scaleX(0)';
            // Force reflow before animating so the bar restarts cleanly.
            void progressEl.offsetWidth;
            progressEl.style.transition = `transform ${transitionMs}ms linear`;
            progressEl.style.transform = 'scaleX(1)';
        }

        activeIndex = nextIndex;

        if (timerId) {
            clearTimeout(timerId);
        }
        if (!prefersReduced) {
            timerId = setTimeout(() => {
                const following = (activeIndex + 1) % slides.length;
                if (isCursorOnHeroButtons()) {
                    isDueToScroll = true;
                } else {
                    applyState(following);
                }
            }, transitionMs);
        }
    };

    navButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const target = Number(button.dataset.heroNav);
            if (!Number.isNaN(target)) {
                applyState(target, true);
            }
        });
    });

    const heroButtonsAndActions = document.querySelectorAll('.hero-slide .hero-button, .hero-slide .hero-actions');
    heroButtonsAndActions.forEach((el) => {
        el.addEventListener('pointerenter', handleCursorEnterButtons);
        el.addEventListener('pointerleave', handleCursorLeaveButtons);
        el.addEventListener('focusin', handleCursorEnterButtons);
        el.addEventListener('focusout', handleCursorLeaveButtons);
    });

    window.addEventListener('pointermove', () => {
        if (isDueToScroll && !isCursorOnHeroButtons()) {
            handleCursorLeaveButtons();
        }
    });

    window.addEventListener('blur', () => {
        if (isDueToScroll && !isCursorOnHeroButtons()) {
            handleCursorLeaveButtons();
        }
    });

    if (!prefersReduced) {
        slides.forEach((slide) => {
            slide.classList.remove('hero-slide--copy-visible');
            slide.classList.remove('hero-slide--active');
        });
        requestAnimationFrame(() => {
            applyState(0);
        });
    } else {
        applyState(0);
    }

    const cursorEl = document.querySelector('.cursor-follower');
    const supportsFinePointer = window.matchMedia('(any-pointer: fine)').matches;
    if (cursorEl && supportsFinePointer) {
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



    const colorProbe = document.createElement('span');
    colorProbe.style.position = 'absolute';
    colorProbe.style.opacity = '0';
    colorProbe.style.pointerEvents = 'none';
    colorProbe.style.zIndex = '-1';
    document.body.appendChild(colorProbe);

    const parseColor = (value) => {
        if (!value || value === 'transparent') return null;
        colorProbe.style.color = value;
        const computed = window.getComputedStyle(colorProbe).color;
        const matches = computed.match(/[\d.]+/g);
        if (!matches || matches.length < 3) return null;
        const [r, g, b, a = '1'] = matches;
        const red = Number.parseFloat(r);
        const green = Number.parseFloat(g);
        const blue = Number.parseFloat(b);
        const alpha = Number.parseFloat(a);
        if ([red, green, blue].some(Number.isNaN)) return null;
        return {
            r: red,
            g: green,
            b: blue,
            a: Number.isNaN(alpha) ? 1 : alpha,
        };
    };

    const getParentElement = (node) => {
        if (!node) return null;
        if (node.parentElement) return node.parentElement;
        const root = node.getRootNode && node.getRootNode();
        if (root && root.host) return root.host;
        return null;
    };

    const getEffectiveBackground = (node) => {
        let current = node;
        while (current && current !== document.documentElement) {
            const style = window.getComputedStyle(current);
            const color = parseColor(style.backgroundColor);
            if (color && color.a > 0.05) return color;
            current = getParentElement(current);
        }
        const fallback = parseColor(window.getComputedStyle(document.body).backgroundColor);
        return fallback || {
            r: 27,
            g: 27,
            b: 27,
            a: 1
        };
    };

    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        const revealOffset = 480;
        const brightnessThreshold = 175;

        const updateBackToTopTone = () => {
            if (!backToTop.classList.contains('back-to-top--visible')) {
                backToTop.style.backgroundColor = '';
                backToTop.style.color = '';
                return;
            }

            const rect = backToTop.getBoundingClientRect();
            const sampleX = rect.left + rect.width / 2;
            const sampleY = rect.top + rect.height / 2;

            if (sampleX < 0 || sampleX > window.innerWidth || sampleY < 0 || sampleY > window.innerHeight) {
                return;
            }

            const target = document.elementFromPoint(sampleX, sampleY);
            const background = target ? getEffectiveBackground(target) : getEffectiveBackground(document.body);
            const brightness = 0.299 * background.r + 0.587 * background.g + 0.114 * background.b;
            const useDark = brightness > 175;

            if (useDark) {
                backToTop.style.backgroundColor = 'rgba(255,255,255,0.9)';
                backToTop.style.color = '#111';
            } else {
                backToTop.style.backgroundColor = 'rgba(17,17,17,0.9)';
                backToTop.style.color = '#fff';
            }
        };

        const toggleBackToTop = () => {
            if (window.scrollY > revealOffset) {
                backToTop.classList.add('back-to-top--visible');
            } else {
                backToTop.classList.remove('back-to-top--visible');
            }
            updateBackToTopTone();
        };

        window.addEventListener('scroll', () => {
            toggleBackToTop();
        }, {
            passive: true
        });

        window.addEventListener('resize', updateBackToTopTone);
        toggleBackToTop();

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const scrollTriggers = Array.from(document.querySelectorAll('[data-scroll-target]'));
    if (scrollTriggers.length) {
        scrollTriggers.forEach((trigger) => {
            trigger.addEventListener('click', () => {
                const targetSelector = trigger.getAttribute('data-scroll-target');
                if (!targetSelector) return;
                const targetEl = document.querySelector(targetSelector);
                if (!targetEl) return;
                const top = targetEl.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top,
                    behavior: 'smooth'
                });
            });
        });
    }

    const metricCounters = Array.from(document.querySelectorAll('[data-count]'));
    if (metricCounters.length && 'IntersectionObserver' in window) {
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        metricCounters.forEach((counter) => {
            const suffix = counter.dataset.countSuffix || '';
            counter.dataset.countSuffix = suffix;
            counter.dataset.countCurrent = '0';
            counter.textContent = `0${suffix}`;
            counter.dataset.animate = 'true';
        });

        const activeAnimations = new WeakMap();

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const counter = entry.target;
                    if (!entry.isIntersecting) {
                        counter.dataset.countCurrent = '0';
                        counter.textContent = `0${counter.dataset.countSuffix || ''}`;
                        if (activeAnimations.has(counter)) {
                            cancelAnimationFrame(activeAnimations.get(counter));
                            activeAnimations.delete(counter);
                        }
                        return;
                    }

                    const targetValue = Number.parseFloat(counter.dataset.count || '0');
                    if (Number.isNaN(targetValue)) return;

                    const duration = 900;
                    const start = performance.now();

                    const animate = (timestamp) => {
                        const progress = Math.min((timestamp - start) / duration, 1);
                        const eased = easeOutCubic(progress);
                        const currentValue = Math.floor(targetValue * eased);
                        const suffix = counter.dataset.countSuffix || '';
                        counter.textContent = `${currentValue}${suffix}`;
                        if (progress < 1) {
                            const frame = requestAnimationFrame(animate);
                            activeAnimations.set(counter, frame);
                        } else {
                            counter.textContent = `${targetValue}${suffix}`;
                            activeAnimations.delete(counter);
                        }
                    };

                    const frame = requestAnimationFrame(animate);
                    activeAnimations.set(counter, frame);
                });
            }, {
            threshold: 0.45,
        }
        );

        metricCounters.forEach((counter) => observer.observe(counter));
    }

    const gallerySlides = Array.from(document.querySelectorAll('[data-gallery-slide]'));
    const galleryPrev = document.querySelector('[data-gallery-prev]');
    const galleryNext = document.querySelector('[data-gallery-next]');
    const galleryDots = Array.from(document.querySelectorAll('[data-gallery-dot]'));

    if (gallerySlides.length) {
        let galleryIndex = 0;

        const applyGalleryState = (nextIndex) => {
            const total = gallerySlides.length;
            const safeIndex = ((nextIndex % total) + total) % total;

            gallerySlides.forEach((slide, idx) => {
                slide.classList.toggle('is-active', idx === safeIndex);
            });

            galleryDots.forEach((dot, idx) => {
                const isActive = idx === safeIndex;
                dot.classList.toggle('design-gallery__dot--active', isActive);
                dot.setAttribute('aria-selected', String(isActive));
            });

            galleryIndex = safeIndex;
        };

        if (galleryPrev) {
            galleryPrev.addEventListener('click', () => {
                applyGalleryState(galleryIndex - 1);
            });
        }
        if (galleryNext) {
            galleryNext.addEventListener('click', () => {
                applyGalleryState(galleryIndex + 1);
            });
        }
        galleryDots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                applyGalleryState(idx);
            });
        });
    }
});
