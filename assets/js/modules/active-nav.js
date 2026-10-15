// assets/js/modules/active-nav.js — scroll suave de anclas # y enlace activo
// (aria-current + clases) sincronizado con el scroll (port pre-FASE 5).

export function initActiveNav() {
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                const navHeight = navbar ? navbar.offsetHeight : 64;
                window.scrollTo({ top: target.offsetTop - navHeight, behavior: 'smooth' });
                updateActiveNavLink(targetId);
            }
        });
    });

    function updateActiveNavLink(activeId) {
        document.querySelectorAll('.nav-link, .side-link, .nav-link-mobile').forEach((link) => {
            link.removeAttribute('aria-current');
        });

        document.querySelectorAll('.nav-link, .side-link, .nav-link-mobile').forEach((link) => {
            const href = link.getAttribute('href');
            link.classList.remove('text-primary', 'dark:text-primary-fixed', 'font-bold', 'border-b-2', 'border-primary', 'dark:border-primary-fixed', 'border-l-2', 'pl-4', 'pb-1');
            link.classList.add('text-on-surface-variant');

            const normalizedHref = (href || '').replace(/^#/, '');
            const normalizedId = (activeId || '').replace(/^#/, '');
            if (normalizedHref && normalizedHref === normalizedId) {
                link.classList.add('text-primary', 'dark:text-primary-fixed', 'font-bold');
                link.classList.remove('text-on-surface-variant', 'dark:text-surface-variant');
                link.setAttribute('aria-current', 'page');

                if (link.classList.contains('side-link')) {
                    link.classList.add('border-l-2', 'border-primary', 'dark:border-primary-fixed', 'pl-4');
                } else if (link.classList.contains('nav-link')) {
                    link.classList.add('border-b-2', 'border-primary', 'dark:border-primary-fixed', 'pb-1');
                }
            }
        });
    }

    function updateActiveOnScroll() {
        let current = '';
        const scrollPos = window.scrollY + 150;
        sections.forEach((section) => {
            const id = section.getAttribute('id');
            if (!id) return;
            const hasNavLink = document.querySelector(`.nav-link[href="#${id}"], .side-link[href="#${id}"], .nav-link-mobile[href="#${id}"]`);
            if (!hasNavLink) return;
            const top = section.offsetTop, height = section.clientHeight;
            if (scrollPos >= top && scrollPos < top + height) current = id;
        });
        if (current) updateActiveNavLink(current);
    }

    window.addEventListener('scroll', updateActiveOnScroll);
    window.addEventListener('load', updateActiveOnScroll);
}
