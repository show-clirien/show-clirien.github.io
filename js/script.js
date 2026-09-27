/**
 * Interactions pour Les Show_Clirien
 * Menu burger mobile, fermeture au clavier, animations au scroll.
 */

document.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('.burger-menu');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setMenuState = (isOpen) => {
        if (!burger || !nav) return;

        nav.classList.toggle('active', isOpen);
        burger.classList.toggle('open', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
        burger.setAttribute(
            'aria-label',
            isOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'
        );
        body.classList.toggle('no-scroll', isOpen);
    };

    if (burger && nav) {
        burger.setAttribute('aria-expanded', 'false');

        burger.addEventListener('click', () => {
            setMenuState(!nav.classList.contains('active'));
        });

        navLinks.forEach((link) => {
            link.addEventListener('click', () => setMenuState(false));
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && nav.classList.contains('active')) {
                setMenuState(false);
                burger.focus();
            }
        });
    }

    const revealElements = document.querySelectorAll('.reveal');

    if (prefersReducedMotion) {
        revealElements.forEach((element) => element.classList.add('active'));
        return;
    }

    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach((element) => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < triggerBottom) {
                element.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll();
});
