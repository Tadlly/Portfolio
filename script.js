document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÃO ---
    const EMAILJS_PUBLIC_KEY = 'pa0WOX5gqXxMvfR1J'; 
    const EMAILJS_SERVICE_ID = 'service_ck96781';
    const EMAILJS_TEMPLATE_ID = 'template_615ro8p';

    // --- SELETORES DE ELEMENTOS ---
    const themeToggle = document.getElementById('theme-toggle');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const yearSpan = document.getElementById('year');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    // --- INICIALIZAÇÃO DO EMAILJS ---
    if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    // --- TROCA DE TEMA ---
    const applyTheme = (theme) => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
    });

    // Carregar tema salvo ou preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

    // --- NAVEGAÇÃO ATIVA COM SCROLL (INTERSECTION OBSERVER) ---
    const observerOptions = {
        root: document.querySelector('.content-panel'), // Observar dentro do painel de conteúdo
        rootMargin: '0px',
        threshold: 0.4 // Ativar quando 40% da seção estiver visível
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // --- ANIMAÇÃO DE FADE-IN NAS SEÇÕES ---
    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        fadeInObserver.observe(section);
    });


    // --- FORMULÁRIO DE CONTATO ---
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitButton = contactForm.querySelector('button[type="submit"]');

            formStatus.textContent = 'Enviando...';
            formStatus.className = '';
            submitButton.disabled = true;

            emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm)
                .then(() => {
                    formStatus.textContent = 'Mensagem enviada com sucesso!';
                    formStatus.classList.add('success');
                    contactForm.reset();
                }, (error) => {
                    formStatus.textContent = 'Ocorreu um erro. Tente novamente.';
                    formStatus.classList.add('error');
                    console.error('EmailJS Error:', error);
                })
                .finally(() => {
                    submitButton.disabled = false;
                    setTimeout(() => formStatus.textContent = '', 5000);
                });
        });
    }

    // --- ATUALIZAR ANO NO FOOTER ---
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});