/**
 * Interactions pour Les Show_Clirien
 * Menu burger mobile, animations au scroll, formulaire Tally.
 */

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    initBurgerMenu();
    initRevealOnScroll(prefersReducedMotion.matches);
    initInscriptionForm(prefersReducedMotion);
});

function initBurgerMenu() {
    const burger = document.querySelector('.burger-menu');
    const nav = document.getElementById('main-nav');
    const navLinks = nav ? nav.querySelectorAll('.nav-link') : [];
    const body = document.body;
    const desktopQuery = window.matchMedia('(min-width: 769px)');

    if (!burger || !nav) return;

    const isDesktop = () => desktopQuery.matches;

    const syncInert = (isOpen) => {
        if (isDesktop()) {
            nav.removeAttribute('inert');
            return;
        }
        nav.toggleAttribute('inert', !isOpen);
    };

    const setMenuState = (isOpen) => {
        nav.classList.toggle('is-open', isOpen);
        burger.classList.toggle('open', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
        burger.setAttribute(
            'aria-label',
            isOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'
        );
        body.classList.toggle('no-scroll', isOpen && !isDesktop());
        syncInert(isOpen);
    };

    setMenuState(false);

    burger.addEventListener('click', () => {
        setMenuState(!nav.classList.contains('is-open'));
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) {
            setMenuState(false);
            burger.focus();
            return;
        }

        if (event.key !== 'Tab' || !nav.classList.contains('is-open') || isDesktop()) {
            return;
        }

        const focusable = [burger, ...nav.querySelectorAll('a')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    document.addEventListener('click', (event) => {
        if (!nav.classList.contains('is-open') || isDesktop()) return;
        if (nav.contains(event.target) || burger.contains(event.target)) return;
        setMenuState(false);
    });

    const onViewportChange = () => {
        if (isDesktop()) setMenuState(false);
        else syncInert(nav.classList.contains('is-open'));
    };

    desktopQuery.addEventListener('change', onViewportChange);
}

function initRevealOnScroll(reduceMotion) {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
        revealElements.forEach((element) => element.classList.add('active'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: '0px 0px -8% 0px'
        }
    );

    revealElements.forEach((element) => observer.observe(element));
}

function initInscriptionForm(prefersReducedMotion) {
    const trigger = document.getElementById('show-form-btn');
    const wrapper = document.getElementById('tally-form-wrapper');
    if (!trigger || !wrapper) return;

    const TALLY_SCRIPT = 'https://tally.so/widgets/embed.js';
    let isOpen = false;

    trigger.hidden = false;

    const loadTallyScript = () => new Promise((resolve) => {
        if (window.Tally) {
            resolve();
            return;
        }

        const existing = document.querySelector(`script[src="${TALLY_SCRIPT}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => resolve(), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = TALLY_SCRIPT;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.body.appendChild(script);
    });

    const activateEmbed = () => {
        if (window.Tally && typeof window.Tally.loadEmbeds === 'function') {
            window.Tally.loadEmbeds();
            return;
        }

        wrapper.querySelectorAll('iframe[data-tally-src]:not([src])').forEach((frame) => {
            frame.src = frame.dataset.tallySrc;
        });
    };

    const revealForm = async () => {
        if (isOpen) return;
        isOpen = true;

        wrapper.hidden = false;
        wrapper.classList.add('is-visible');
        trigger.setAttribute('aria-expanded', 'true');
        trigger.hidden = true;

        const hero = trigger.closest('.join-hero');
        if (hero) hero.classList.add('is-compact');

        await loadTallyScript();
        activateEmbed();

        const reduceMotion = prefersReducedMotion.matches;
        const target = wrapper.querySelector('.form-frame') || wrapper;

        requestAnimationFrame(() => {
            target.scrollIntoView({
                behavior: reduceMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        });

        const heading = wrapper.querySelector('.form-heading');
        if (heading) heading.focus({ preventScroll: true });
    };

    trigger.addEventListener('click', () => {
        revealForm();
    });
}
