// ========================
// TEMA OSCURO/CLARO (clase 'dark' en <html>)
// ========================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

let savedTheme = null;
try {
    savedTheme = localStorage.getItem('theme');
} catch (e) { /* ignore */
}
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    htmlElement.classList.add('dark');
    if (themeToggle) themeToggle.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">light_mode</span>';
} else {
    htmlElement.classList.remove('dark');
    if (themeToggle) themeToggle.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">dark_mode</span>';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        if (htmlElement.classList.contains('dark')) {
            htmlElement.classList.remove('dark');
            try {
                localStorage.setItem('theme', 'light');
            } catch (e) { /* ignore */
            }
            themeToggle.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">dark_mode</span>';
        } else {
            htmlElement.classList.add('dark');
            try {
                localStorage.setItem('theme', 'dark');
            } catch (e) { /* ignore */
            }
            themeToggle.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">light_mode</span>';
        }
    });
}

// ========================
// IDIOMA
// ========================
const languageToggle = document.getElementById('languageToggle');
const languageText = document.querySelector('.language-text');

let currentLang = 'es';
try {
    currentLang = localStorage.getItem('language') || 'es';
} catch (e) { /* ignore */
}
document.documentElement.lang = currentLang;
if (languageText) languageText.textContent = currentLang === 'en' ? 'EN' : 'ES';

const translations = {
    es: {
        "logo": "FullStark",
        "nav.about": "Sobre mí",
        "nav.study": "Estudios",
        "nav.experience": "Experiencia",
        "nav.projects": "Proyectos",
        "nav.skills": "Habilidades",
        "profile.title": "Full Stack Developer",
        "cv.download": "Descargar CV",

        "hero.badge": "Disponible para proyectos",
        "hero.button.projects": "VER PROYECTOS",
        "hero.button.cv": "DESCARGAR CV",
        "hero.description": "Especializado en la construcción de sistemas distribuidos, microservicios de alto rendimiento y arquitecturas escalables. Transformo lógica compleja en soluciones elegantes y eficientes.",

        "about.title": "Sobre mí",
        "about.paragraph1": "Hola, soy Christián Vazquez, Ingeniero en Ciencias Informáticas y Desarrollador Backend con experiencia comprobada en empresas y proyectos freelance. Mi formación en la UCI me proporcionó una base sólida en ingeniería de software, que he consolidado trabajando con Symfony, Spring Boot y arquitecturas modernas.",
        "about.paragraph2": "Mi motivación es transformar ideas en código funcional, limpio y eficiente, siguiendo las mejores prácticas. He trabajado como desarrollador backend en el Centro de Desarrollo Local (2021-2024) y actualmente desarrollo proyectos independientes de alta complejidad, como sistemas de turnos bancarios y plataformas SaaS con Stripe y autenticación OAuth2/2FA.",
        "about.paragraph3": "Mi experiencia se especializa en el desarrollo backend con Java (Spring Boot), PHP (Symfony 7/8) y Node.js, dominando frameworks como Doctrine ORM. Además, poseo sólidos conocimientos en frontend, construyendo interfaces modernas y reactivas con Tailwind CSS, Alpine.js, React, Twig y JavaScript vanilla. Esta versatilidad me permite adaptarme a entornos full-stack cuando el proyecto lo demanda.",
        "about.paragraph4": "Actualmente curso una Maestría en Informática Aplicada para profundizar en arquitecturas distribuidas y sistemas de alta concurrencia, demostrando mi compromiso con el crecimiento continuo.",
        "about.paragraph5": "Cuando no estoy programando, disfruto la lectura, el tiempo en familia y aprender nuevas tecnologías. Creo firmemente en el aprendizaje continuo y en mantenerme actualizado con las últimas tendencias en desarrollo backend y cloud.",

        "study.title": "Estudios",
        "study.masters.date": "2025 - Presente",
        "study.masters.title": "Maestría en Informática Aplicada",
        "study.masters.university": "Universidad José Martí (UNISS)",
        "study.masters.description": "Complementando mi formación de grado con una especialización que busca cerrar la brecha entre la teoría avanzada en informática y su aplicación práctica en entornos empresariales y de investigación. Me estoy enfocando en adquirir competencias de alto nivel para el diseño e implementación de sistemas complejos que respondan a desafíos tecnológicos actuales.",
        "study.degree.date": "2017 - 2022",
        "study.degree.title": "Ingeniería en Ciencias Informáticas",
        "study.degree.university": "Universidad de las Ciencias Informáticas (UCI)",
        "study.degree.description": "Graduado de un programa de ingeniería con un enfoque práctico en el desarrollo de software. La formación en la UCI se caracterizó por un modelo de aprendizaje basado en proyectos reales, donde consolidé mis conocimientos en fundamentos de la computación, ingeniería de software, bases de datos y tecnologías de vanguardia, preparándome para enfrentar desafíos complejos en el ámbito del desarrollo de software.",

        "experience.title": "Experiencia",
        "experience.freelance.date": "2024 - Presente",
        "experience.freelance.title": "Desarrollador Backend",
        "experience.freelance.company": "Freelance / Proyectos Independientes",
        "experience.freelance.description": "Desarrollo de aplicaciones web robustas utilizando Symfony, Spring Boot y Node.js. Implementación de APIs RESTful, diseño de bases de datos MySQL, y creación de arquitecturas escalables. Colaboración en el ciclo completo de desarrollo desde el análisis hasta el despliegue.",
        "experience.junior.date": "2021 - 2024",
        "experience.junior.title": "Desarrollador Backend",
        "experience.junior.company": "Centro de Desarrollo Local",
        "experience.junior.description": "Desarrollo de aplicaciones móviles nativas para Android utilizando Java (Android Nativo). Desarrollo y mantenimiento de aplicaciones web utilizando Java y Spring Boot. Creación de interfaces de usuario con HTML, CSS y JavaScript. Soporte técnico y resolución de incidencias en sistemas existentes. Participación en equipos ágiles para el desarrollo de soluciones empresariales.",
        "experience.intern.date": "2018 - 2021",
        "experience.intern.title": "Practicante de Desarrollo de Software",
        "experience.intern.company": "Universidad de las Ciencias Informáticas",
        "experience.intern.description": "Desarrollo de proyectos académicos y de investigación aplicando metodologías de ingeniería de software. Implementación de soluciones con Java y PHP. Aprendizaje y aplicación de patrones de diseño, bases de datos y mejores prácticas de desarrollo bajo supervisión académica.",

        "projects.title": "Proyectos Destacados",
        "projects.view_all": "VER TODO EL GITHUB",
        "projects.sgrturnos.type": "Sistema Backend Avanzado",
        "projects.sgrturnos.title": "SGR-Turnos - Gestión de Turnos Bancarios",
        "projects.sgrturnos.description": "Sistema integral de gestión y reserva de turnos bancarios desarrollado con Symfony 8 para eliminar la especulación en filas. Incluye control de frecuencia anti-colero, calendario avanzado, auditoría exhaustiva, JWT authentication, rate limiting y exportación a Excel. Optimizado para entornos de alta concurrencia en redes locales.",
        "projects.comerciolocal.type": "SaaS / E-commerce",
        "projects.comerciolocal.title": "ComercioLocal - Plataforma E-commerce",
        "projects.comerciolocal.description": "Plataforma SaaS completa para comercios locales. Implementa pasarela de pagos Stripe, autenticación social OAuth2 (Google/Facebook), 2FA con Google Authenticator, catálogos de productos, carrito de compras y panel de administración. Backend Symfony 7.4, frontend con Tailwind, Alpine.js y Stimulus.",
        "projects.comerciolocal.visit": "Ver sitio",
        "projects.comerciolocal.contact": "Contactar",
        "projects.inventory.type": "Sistema Backend",
        "projects.inventory.title": "Sistema de Gestión de Inventario y Ventas",
        "projects.inventory.description": "Sistema completo desarrollado con Symfony 7.3 para gestión de inventario, ventas, compras y análisis de datos. Incluye control de stock por ubicaciones, facturación PDF (dompdf), dashboard con métricas, exportación a Excel (PhpSpreadsheet) y servicios especializados para lógica de negocio compleja.",
        "projects.auth.type": "Sistema Backend Seguro",
        "projects.auth.title": "Sistema de Autenticación y Control de Acceso",
        "projects.auth.description": "Sistema completo de seguridad desarrollado con Symfony 7.3 que implementa autenticación JWT, autorización granular con Voters, registro de auditoría exhaustivo, gestión de usuarios, sistema de roles, validación de DTOs, logs de seguridad y pruebas unitarias completas (PHPUnit).",
        "projects.microservices.type": "Arquitectura Microservicios",
        "projects.microservices.title": "Sistema de Biblioteca con Microservicios",
        "projects.microservices.description": "Sistema distribuido escalable desarrollado con Spring Boot 3 para gestión completa de biblioteca. Implementa microservicios especializados para libros, usuarios, préstamos y notificaciones, con Kong API Gateway, service discovery y comunicación asíncrona mediante mensajería. Docker Compose para orquestación.",
        "projects.android.type": "Aplicación Móvil",
        "projects.android.title": "Sistema Móvil para Gestión de Solicitudes de Tarjetas BANCEC",
        "projects.android.description": "Aplicación Android completa desarrollada para optimizar el proceso de recepción de solicitudes de tarjetas magnéticas en entornos bancarios. Incluye captura de datos mediante QR (ZXing), gestión de clientes, exportación/importación Excel, estadísticas en tiempo real y transferencia segura de datos entre dispositivos.",
        "projects.portfolio.type": "Portafolio Profesional",
        "projects.portfolio.title": "Portafolio Profesional Responsive",
        "projects.portfolio.description": "Single Page Application moderna desarrollada con HTML5, CSS3 y JavaScript vanilla. Incluye diseño responsive, tema claro/oscuro persistente, navegación suave, animaciones al scroll, formulario de contacto con Netlify Forms y traducción a inglés.",
        "projects.demo": "Próximamente (demo en desarrollo)",
        "projects.demo_portfolio": "Ver demo",
        "projects.code": "Código",

        "projects.mobile_sgrturnos.type": "Aplicación Móvil / Android Nativo",
        "projects.mobile_sgrturnos.title": "SGR-Turnos-Bandec – App Móvil para Gestión de Turnos Bancarios",
        "projects.mobile_sgrturnos.description": "Aplicación Android moderna desarrollada con Kotlin y Jetpack Compose para la reserva y gestión de turnos bancarios. Permite consultar sucursales, ver disponibilidad en calendario interactivo y reservar turnos con autenticación JWT. Implementa sincronización offline con Room, paginación remota con Paging 3 y notificaciones push con Firebase Cloud Messaging. Comunicación con backend Symfony 8 vía Retrofit.",

        "projects.current_site.type": "Portafolio en vivo",
        "projects.current_site.title": "Portafolio Full Stack Developer — Este sitio",
        "projects.current_site.description": "El sitio que estás viendo. Desarrollado con HTML5, Tailwind CSS y JavaScript vanilla. Implementa tema oscuro/claro persistente, navegación suave, animaciones al scroll, cambio de idioma (ES/EN) y está optimizado en accesibilidad y SEO.",
        "projects.current_site.this_site": "Este sitio",

        "skills.title": "Habilidades Técnicas",
        "skills.languages.title": "Lenguajes",
        "skills.languages.desc": "Dominio en lenguajes de programación y runtimes (Node.js) para desarrollo backend y sistemas.",
        "skills.frameworks.title": "Frameworks Backend",
        "skills.frameworks.desc": "Frameworks y runtimes principales utilizados en proyectos profesionales y personales, incluyendo Node.js.",
        "skills.databases.title": "Bases de Datos",
        "skills.databases.desc": "Gestión y diseño de bases de datos relacionales y NoSQL.",
        "skills.devops.title": "DevOps & Cloud",
        "skills.devops.desc": "Herramientas de contenerización, orquestación y nube.",
        "skills.frontend.title": "Frontend (Intermedio)",
        "skills.frontend.desc": "Construcción de interfaces funcionales y responsivas con herramientas modernas.",
        "skills.architecture.title": "Arquitectura & Seguridad",
        "skills.architecture.desc": "Patrones de diseño, microservicios, autenticación avanzada y buenas prácticas.",
        "skills.ai.title": "Desarrollo Asistido por IA",
        "skills.ai.desc": "Configuro entornos de desarrollo agéntico (harness engineering) y uso agentes de terminal para acelerar el ciclo de desarrollo, mejorar la calidad del código y automatizar tareas repetitivas.",
        "skills.ai.chatgpt": "ChatGPT / Claude",
        "skills.ai.copilot": "GitHub Copilot",
        "skills.ai.prompt": "Ingeniería de Prompts",

        "footer.brand": "Full Stack Developer",
        "footer.copyright": "© 2025 Christián R. Vazquez. Construido con precisión y lógica.",
        "footer.privacy": "Privacidad",
        "footer.terms": "Términos",
        "footer.github": "GitHub",
        "footer.telegram": "Telegram"
    },
    en: {
        "logo": "FullStark",
        "nav.about": "About Me",
        "nav.study": "Education",
        "nav.experience": "Experience",
        "nav.projects": "Projects",
        "nav.skills": "Skills",
        "profile.title": "Full Stack Developer",
        "cv.download": "Download CV",

        "hero.badge": "Available for projects",
        "hero.button.projects": "VIEW PROJECTS",
        "hero.button.cv": "DOWNLOAD CV",
        "hero.description": "Specialized in building distributed systems, high-performance microservices, and scalable architectures. I transform complex logic into elegant and efficient solutions.",

        "about.title": "About Me",
        "about.paragraph1": "Hello, I am Christián Vazquez, a Computer Science Engineer and Backend Developer with proven experience in companies and freelance projects. My education at UCI provided me with a solid foundation in software engineering, which I have consolidated working with Symfony, Spring Boot, and modern architectures.",
        "about.paragraph2": "My motivation is to transform ideas into functional, clean, and efficient code, following industry best practices. I have worked as a backend developer at the Local Development Center (2021-2024) and currently develop high-complexity independent projects, such as banking queue systems and SaaS platforms with Stripe and OAuth2/2FA authentication.",
        "about.paragraph3": "My experience specializes in backend development with Java (Spring Boot), PHP (Symfony 7/8) and Node.js, mastering frameworks like Doctrine ORM. Additionally, I have strong frontend skills, building modern and reactive interfaces with Tailwind CSS, Alpine.js, React, Twig, and vanilla JavaScript. This versatility allows me to adapt to full-stack environments when the project requires it.",
        "about.paragraph4": "I am currently pursuing a Master's degree in Applied Informatics to deepen my knowledge in distributed architectures and high-concurrency systems, demonstrating my commitment to continuous growth.",
        "about.paragraph5": "When I'm not coding, I enjoy reading, family time, and learning about new technologies. I strongly believe in continuous learning and staying updated with the latest trends in backend and cloud development.",

        "study.title": "Education",
        "study.masters.date": "2025 - Present",
        "study.masters.title": "Master's Degree in Applied Informatics",
        "study.masters.university": "Universidad José Martí (UNISS)",
        "study.masters.description": "Complementing my undergraduate education with a specialization that seeks to bridge the gap between advanced computer science theory and its practical application in business and research environments. I am focusing on acquiring high-level competencies for the design and implementation of complex systems that respond to current technological challenges.",
        "study.degree.date": "2017 - 2022",
        "study.degree.title": "Computer Science Engineering",
        "study.degree.university": "University of Informatics Sciences (UCI)",
        "study.degree.description": "Graduate of an engineering program with a practical focus on software development. The education at UCI was characterized by a project-based learning model, where I consolidated my knowledge in computing fundamentals, software engineering, databases, and cutting-edge technologies, preparing me to face complex challenges in the field of software development.",

        "experience.title": "Experience",
        "experience.freelance.date": "2024 - Present",
        "experience.freelance.title": "Backend Developer",
        "experience.freelance.company": "Freelance / Independent Projects",
        "experience.freelance.description": "Development of robust web applications using Symfony, Spring Boot and Node.js. Implementation of RESTful APIs, MySQL database design, and creation of scalable architectures. Collaboration in the full development cycle from analysis to deployment.",
        "experience.junior.date": "2021 - 2024",
        "experience.junior.title": "Backend Developer",
        "experience.junior.company": "Local Development Center",
        "experience.junior.description": "Development of native Android mobile applications using Java (Native Android). Development and maintenance of web applications using Java and Spring Boot. Creation of user interfaces with HTML, CSS, and JavaScript. Technical support and resolution of incidents in existing systems. Participation in agile teams for the development of business solutions.",
        "experience.intern.date": "2018 - 2021",
        "experience.intern.title": "Software Development Intern",
        "experience.intern.company": "University of Informatics Sciences",
        "experience.intern.description": "Development of academic and research projects applying software engineering methodologies. Implementation of solutions with Java and PHP. Learning and application of design patterns, databases, and development best practices under academic supervision.",

        "projects.title": "Featured Projects",
        "projects.view_all": "VIEW ALL GITHUB",
        "projects.sgrturnos.type": "Advanced Backend System",
        "projects.sgrturnos.title": "SGR-Turnos - Banking Queue Management",
        "projects.sgrturnos.description": "Comprehensive banking queue management system developed with Symfony 8 to eliminate speculation in lines. Includes anti-queue frequency control, advanced calendar, exhaustive audit logging, JWT authentication, rate limiting, and Excel export. Optimized for high-concurrency local network environments.",
        "projects.comerciolocal.type": "SaaS / E-commerce",
        "projects.comerciolocal.title": "ComercioLocal - E-commerce Platform",
        "projects.comerciolocal.description": "Complete SaaS platform for local businesses. Implements Stripe payment gateway, OAuth2 social login (Google/Facebook), 2FA with Google Authenticator, product catalogs, shopping cart, and admin panel. Backend Symfony 7.4, frontend with Tailwind, Alpine.js, and Stimulus.",
        "projects.comerciolocal.visit": "View site",
        "projects.comerciolocal.contact": "Contact",
        "projects.inventory.type": "Backend System",
        "projects.inventory.title": "Inventory and Sales Management System",
        "projects.inventory.description": "Complete system developed with Symfony 7.3 for inventory, sales, purchases, and data analysis management. Includes location-based stock control, PDF invoicing (dompdf), dashboard with metrics, Excel export (PhpSpreadsheet), and specialized services for complex business logic.",
        "projects.auth.type": "Secure Backend System",
        "projects.auth.title": "Authentication and Access Control System",
        "projects.auth.description": "Complete security system developed with Symfony 7.3 implementing JWT authentication, granular authorization with Voters, exhaustive audit logging, user management, role system, DTO validation, security logs, and full unit tests (PHPUnit).",
        "projects.microservices.type": "Microservices Architecture",
        "projects.microservices.title": "Library System with Microservices Architecture",
        "projects.microservices.description": "Scalable distributed system developed with Spring Boot 3 for complete library management. Implements specialized microservices for books, users, loans, and notifications, with Kong API Gateway, service discovery, and asynchronous messaging. Docker Compose for orchestration.",
        "projects.android.type": "Mobile Application",
        "projects.android.title": "Mobile System for BANCEC Card Request Management",
        "projects.android.description": "Complete Android application developed to optimize the process of receiving magnetic card requests in banking environments. Includes QR data capture (ZXing), client management, Excel export/import, real-time statistics, and secure data transfer between devices.",
        "projects.portfolio.type": "Professional Portfolio",
        "projects.portfolio.title": "Responsive Professional Portfolio",
        "projects.portfolio.description": "Modern Single Page Application developed with HTML5, CSS3, and vanilla JavaScript. Includes responsive design, persistent light/dark theme, smooth navigation, scroll animations, contact form with Netlify Forms, and English/Spanish translation.",
        "projects.demo": "Coming soon (demo in development)",
        "projects.demo_portfolio": "View demo",
        "projects.code": "Code",

        "projects.mobile_sgrturnos.type": "Mobile App / Native Android",
        "projects.mobile_sgrturnos.title": "SGR-Turnos-Bandec – Mobile Banking Queue Management App",
        "projects.mobile_sgrturnos.description": "Modern Android application built with Kotlin and Jetpack Compose for booking and managing banking appointments. Features branch lookup, interactive calendar availability, JWT-authenticated reservations, offline sync with Room, remote pagination with Paging 3, and push notifications via Firebase Cloud Messaging. Communicates with a Symfony 8 backend through Retrofit.",

        "projects.current_site.type": "Live Portfolio",
        "projects.current_site.title": "Full Stack Developer Portfolio — This site",
        "projects.current_site.description": "The site you're viewing. Built with HTML5, Tailwind CSS and vanilla JavaScript. Features persistent dark/light theme, smooth scrolling, scroll animations, language switch (EN/ES) and is optimized for accessibility and SEO.",
        "projects.current_site.this_site": "This site",

        "skills.title": "Technical Skills",
        "skills.languages.title": "Languages",
        "skills.languages.desc": "Proficiency in programming languages and runtimes (Node.js) for backend development and systems.",
        "skills.frameworks.title": "Backend Frameworks",
        "skills.frameworks.desc": "Main frameworks and runtimes used in professional and personal projects, including Node.js.",
        "skills.databases.title": "Databases",
        "skills.databases.desc": "Management and design of relational and NoSQL databases.",
        "skills.devops.title": "DevOps & Cloud",
        "skills.devops.desc": "Containerization, orchestration, and cloud tools.",
        "skills.frontend.title": "Frontend (Intermediate)",
        "skills.frontend.desc": "Building functional and responsive interfaces with modern tools.",
        "skills.architecture.title": "Architecture & Security",
        "skills.architecture.desc": "Design patterns, microservices, advanced authentication, and best practices.",
        "skills.ai.title": "AI-Assisted Development",
        "skills.ai.desc": "I configure agentic development environments (harness engineering) and use terminal agents to accelerate the development cycle, improve code quality, and automate repetitive tasks.",
        "skills.ai.chatgpt": "ChatGPT / Claude",
        "skills.ai.copilot": "GitHub Copilot",
        "skills.ai.prompt": "Prompt Engineering",

        "footer.brand": "Full Stack Developer",
        "footer.copyright": "© 2025 Christián R. Vazquez. Built with precision and logic.",
        "footer.privacy": "Privacy",
        "footer.terms": "Terms",
        "footer.github": "GitHub",
        "footer.telegram": "Telegram"
    }
};

function changeLanguage(lang) {
    document.documentElement.lang = lang;
    try {
        localStorage.setItem('language', lang);
    } catch (e) { /* ignore */
    }
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });
    if (languageText) languageText.textContent = lang === 'en' ? 'EN' : 'ES';

    // ✅ FIX C: Anuncio a lectores de pantalla al cambiar idioma
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = lang === 'es' ? 'Idioma cambiado a español' : 'Language changed to English';
    document.body.appendChild(liveRegion);
    setTimeout(() => liveRegion.remove(), 1500);
}

changeLanguage(currentLang);

if (languageToggle) {
    languageToggle.addEventListener('click', () => {
        const newLang = document.documentElement.lang === 'es' ? 'en' : 'es';
        changeLanguage(newLang);
    });
}

// ========================
// MENÚ MÓVIL
// ========================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('open');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');

    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('open');
        if (isOpen) {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        } else {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('open');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
        }
    });

    const closeMenu = () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    };

    document.querySelectorAll('.nav-link-mobile, .nav-link, .side-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMenu();
            mobileMenuBtn.focus();
        }
    });
}

// ========================
// STICKY NAVBAR
// ========================
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll <= 0) {
        navbar.classList.remove('-translate-y-full');
        return;
    }
    if (currentScroll > lastScroll && currentScroll > 80) {
        navbar.classList.add('-translate-y-full');
    } else {
        navbar.classList.remove('-translate-y-full');
    }
    lastScroll = currentScroll;
});

// ========================
// BOTÓN VOLVER ARRIBA
// ========================
const backToTop = document.getElementById('backToTop');

function toggleBackToTop() {
    if (!backToTop) return;
    if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}

if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
}

// ========================
// ANIMACIONES AL SCROLL
// ========================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sections = document.querySelectorAll('section');

// ✅ FIX B: threshold y rootMargin ajustados
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (prefersReducedMotion) {
                entry.target.classList.add('visible');
                entry.target.style.transitionDuration = '0s';
            } else {
                entry.target.classList.add('visible');
            }
        }
    });
}, {threshold: 0.15, rootMargin: '0px 0px -10% 0px'});

sections.forEach(s => observer.observe(s));

document.querySelectorAll('[data-animate]').forEach(el => {
    el.classList.add('opacity-0', 'translate-y-4');
    observer.observe(el);
});

// ========================
// NAVEGACIÓN SUAVE Y ENLACE ACTIVO
// ========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            const navHeight = navbar ? navbar.offsetHeight : 64;
            window.scrollTo({top: target.offsetTop - navHeight, behavior: 'smooth'});
            updateActiveNavLink(targetId);
        }
    });
});

function updateActiveNavLink(activeId) {
    document.querySelectorAll('.nav-link, .side-link, .nav-link-mobile').forEach(link => {
        link.removeAttribute('aria-current');
    });

    document.querySelectorAll('.nav-link, .side-link, .nav-link-mobile').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('text-primary', 'dark:text-primary-fixed', 'font-bold', 'border-b-2', 'border-primary', 'dark:border-primary-fixed', 'border-l-2', 'pl-4', 'pb-1');
        link.classList.add('text-on-surface-variant');

        if (href === activeId || href === `#${activeId}`) {
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
    sections.forEach(section => {
        const top = section.offsetTop, height = section.clientHeight;
        if (scrollPos >= top && scrollPos < top + height) current = section.getAttribute('id');
    });
    if (current) updateActiveNavLink(current);
}

window.addEventListener('scroll', () => {
    toggleBackToTop();
    updateActiveOnScroll();
});

window.addEventListener('load', () => {
    toggleBackToTop();
    updateActiveOnScroll();
    setTimeout(() => {
        document.querySelectorAll('[data-animate]').forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
        });
    }, 100);
});