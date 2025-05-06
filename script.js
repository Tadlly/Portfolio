document.addEventListener('DOMContentLoaded', () => {

  console.log("DOM Carregado. Iniciando scripts.");

  // --- EmailJS Configuration ---
  const EMAILJS_PUBLIC_KEY = 'pa0WOX5gqXxMvfR1J'; // !!! SUBSTITUA PELA SUA PUBLIC KEY REAL !!!
  const EMAILJS_SERVICE_ID = 'service_ck96781'; // !!! SEU SERVICE ID REAL !!!
  const EMAILJS_TEMPLATE_ID = 'template_615ro8p'; // !!! SEU TEMPLATE ID REAL !!!

  // --- Element Selectors ---
  const themeToggleButtons = document.querySelectorAll('.theme-toggle-btn'); // All theme toggles
  const mobileThemeToggleButton = document.getElementById('mobile-theme-toggle'); // Specific mobile toggle
  const body = document.body;
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const projectImageContainers = document.querySelectorAll('.projetos-imagem-container');
  const imageOverlay = document.querySelector('.image-overlay');
  const expandedImage = document.querySelector('.expanded-image');
  const closeOverlayBtn = document.querySelector('.close-overlay-btn');
  const footerYear = document.getElementById('year');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu-links a');


  // --- Function Definitions ---

  /**
   * Initializes EmailJS SDK.
   */
  function initializeEmailJS() {
      if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
          console.warn('EmailJS Public Key não configurada. Funcionalidade de envio de email desabilitada.');
          return;
      }
      try {
          if (typeof emailjs !== 'undefined') {
              emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
              console.log('EmailJS SDK Inicializado com sucesso.');
          } else {
              console.error('EmailJS SDK não encontrado. Verifique se o script foi carregado.');
          }
      } catch (error) {
          console.error('Falha ao inicializar EmailJS:', error);
      }
  }

  /**
   * Updates the theme toggle button icons based on the current theme.
   * @param {string} theme - The current theme ('light' or 'dark').
   */
  function updateThemeIcons(theme) {
      const iconClass = theme === 'dark' ? 'fa-sun' : 'fa-moon'; // Sun icon for dark theme (to switch to light), Moon for light
      themeToggleButtons.forEach(button => {
          const icon = button.querySelector('i');
          if (icon) {
              icon.className = `fas ${iconClass}`; // Replace icon class
          }
          button.setAttribute('aria-label', theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
      });
  }

  /**
   * Applies the theme to the body and saves it to localStorage.
   * @param {string} theme - The theme to apply ('light' or 'dark').
   */
  function applyTheme(theme) {
      body.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateThemeIcons(theme);
      // Add a small delay for the theme icon inside the mobile menu if it's open
      // This helps if the transition relies on CSS variables that might take a fraction to update
      if (mobileMenu.classList.contains('active') && mobileThemeToggleButton) {
          setTimeout(() => updateThemeIcons(theme), 50);
      }
  }

  /**
   * Toggles the theme between light and dark.
   */
  function toggleTheme() {
      const currentTheme = body.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
  }

  /**
   * Handles smooth scrolling for anchor links.
   * @param {Event} e - The click event.
   */
  function handleSmoothScroll(e) {
      e.preventDefault();
      const hrefAttribute = this.getAttribute('href');
      if (!hrefAttribute || hrefAttribute === '#') return; // Ignore empty or "#" links
      try {
          const targetElement = document.querySelector(hrefAttribute);
          if (targetElement) {
              targetElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
              });
              // Close mobile menu if open after clicking a link
              if (mobileMenu.classList.contains('active')) {
                   toggleMobileMenu();
              }
          } else {
              console.warn(`Elemento alvo para o link ${hrefAttribute} não encontrado.`);
          }
      } catch (error) {
          console.error(`Seletor inválido para href="${hrefAttribute}":`, error);
      }
  }

  /**
   * Sets up the Intersection Observer for animations.
   */
  function setupIntersectionObserver() {
      const observerOptions = {
          threshold: 0.1,
          // rootMargin: '0px 0px -50px 0px' // Optional: Trigger earlier/later
      };

      const observerCallback = (entries, observerInstance) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  const delay = entry.target.dataset.delay || '0'; // Get delay from data-delay attribute
                  setTimeout(() => {
                      entry.target.classList.add('animate');
                  }, parseInt(delay));
                  // Optional: Stop observing after animation
                  observerInstance.unobserve(entry.target);
              }
              // Optional: Revert animation when element leaves viewport
              // else { entry.target.classList.remove('animate'); }
          });
      };

      const observer = new IntersectionObserver(observerCallback, observerOptions);
      const elementsToAnimate = document.querySelectorAll('.animatable');
      elementsToAnimate.forEach(element => observer.observe(element));
  }

  /**
   * Displays a status message on the contact form.
   * @param {string} message - The message text.
   * @param {'success' | 'error' | 'sending'} type - The type of message.
   */
  function showFormStatus(message, type) {
      if (!formStatus) return;
      formStatus.textContent = message;
      formStatus.className = `form-status ${type}`; // Reset classes and add the new one
  }

   /**
   * Handles the contact form submission using EmailJS.
   * @param {Event} event - The submit event.
   */
  function handleContactFormSubmit(event) {
      event.preventDefault();
      const submitButton = contactForm.querySelector('button[type="submit"]');

      // Basic validation check (EmailJS also does some)
      const name = contactForm.from_name.value.trim();
      const email = contactForm.reply_to.value.trim();
      const message = contactForm.message.value.trim();

      if (!name || !email || !message) {
          showFormStatus('Por favor, preencha todos os campos.', 'error');
          return;
      }

      if (submitButton) submitButton.disabled = true;
      showFormStatus('Enviando mensagem...', 'sending');
      console.log('Enviando formulário via EmailJS...');

      if (typeof emailjs === 'undefined' || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
          console.error("EmailJS não está configurado ou não foi carregado.");
          showFormStatus('Erro na configuração do envio. Tente mais tarde.', 'error');
          if (submitButton) submitButton.disabled = false;
          return;
      }

      // Use emailjs.sendForm (pass the form element directly)
      emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, event.target)
          .then(() => {
              console.log('SUCESSO! Email enviado.');
              showFormStatus('Mensagem enviada com sucesso! Obrigado.', 'success');
              contactForm.reset();
          }, (error) => {
              console.error('ERRO ao enviar EmailJS:', error);
              showFormStatus(`Erro ao enviar: ${error.text || 'Tente novamente.'}`, 'error');
          })
          .finally(() => {
              if (submitButton) submitButton.disabled = false;
               // Optionally hide status after a few seconds
               setTimeout(() => {
                   if (formStatus.textContent !== '' && !formStatus.classList.contains('error')) { // Keep error messages visible longer maybe
                       formStatus.textContent = '';
                       formStatus.className = 'form-status';
                   }
               }, 6000);
          });
  }

  /**
   * Opens the image overlay with the clicked image.
   * @param {string} imageSrc - The source URL of the image to display.
   */
  function openImageOverlay(imageSrc) {
      if (!imageOverlay || !expandedImage) return;
      expandedImage.src = imageSrc;
      imageOverlay.classList.add('visible');
      body.style.overflow = 'hidden'; // Prevent background scroll
  }

  /**
   * Closes the image overlay.
   */
  function closeImageOverlay() {
      if (!imageOverlay) return;
      imageOverlay.classList.remove('visible');
      expandedImage.src = ''; // Clear src
      body.style.overflow = ''; // Restore background scroll
  }

  /**
   * Updates the footer year.
   */
  function updateFooterYear() {
      if (footerYear) {
          footerYear.textContent = new Date().getFullYear();
      }
  }

  /**
   * Toggles the mobile navigation menu.
   */
  function toggleMobileMenu() {
      if (!mobileMenu) return;
      mobileMenu.classList.toggle('active');
      // Optional: Prevent body scroll when mobile menu is open
      if (mobileMenu.classList.contains('active')) {
          body.style.overflow = 'hidden';
      } else {
          body.style.overflow = '';
      }
  }

  // --- Event Listeners ---

  // Theme Toggle
  themeToggleButtons.forEach(button => {
      button.addEventListener('click', toggleTheme);
  });

  // Smooth Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleSmoothScroll);
  });

  // Contact Form Submission
  if (contactForm) {
      contactForm.addEventListener('submit', handleContactFormSubmit);
  } else {
      console.warn('Elemento <form> com ID "contact-form" não encontrado.');
  }

  // Project Image Expansion
  if (projectImageContainers.length > 0 && imageOverlay && expandedImage && closeOverlayBtn) {
      projectImageContainers.forEach(container => {
          const img = container.querySelector('.projetos-imagem');
          if (img) {
              container.addEventListener('click', () => {
                   openImageOverlay(img.src);
              });
          }
      });

      // Close overlay by clicking background or close button
      imageOverlay.addEventListener('click', (e) => {
           if (e.target === imageOverlay) { // Clicked on overlay background
               closeImageOverlay();
           }
      });
      closeOverlayBtn.addEventListener('click', closeImageOverlay);

      // Close overlay with Escape key
      document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && imageOverlay.classList.contains('visible')) {
              closeImageOverlay();
          }
      });
  } else {
       console.warn('Funcionalidade de expansão de imagem não está completamente configurada (faltam elementos).');
  }

  // Mobile Menu Toggle
  if (mobileMenuToggle && mobileMenuClose && mobileMenu) {
      mobileMenuToggle.addEventListener('click', toggleMobileMenu);
      mobileMenuClose.addEventListener('click', toggleMobileMenu);
       // Close menu if clicking outside of it (optional)
       document.addEventListener('click', (event) => {
          if (mobileMenu.classList.contains('active') && !mobileMenu.contains(event.target) && event.target !== mobileMenuToggle) {
              // toggleMobileMenu(); // Careful: This might conflict with toggle button clicks
          }
      });
  } else {
      console.warn('Elementos do menu mobile não encontrados.');
  }

   // Close mobile menu when a link is clicked (handled in handleSmoothScroll)


  // --- Initializations ---
  initializeEmailJS();
  const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
  applyTheme(savedTheme); // Apply saved or default theme on load
  setupIntersectionObserver();
  updateFooterYear();

}); // End DOMContentLoaded