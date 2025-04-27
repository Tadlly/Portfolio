document.addEventListener('DOMContentLoaded', () => {

  console.log("DOM Carregado. Iniciando scripts.");

  // --- EmailJS Initialization (v4) ---
  // Coloque sua Public Key aqui. Execute apenas uma vez.
  const YOUR_PUBLIC_KEY = 'pa0WOX5gqXxMvfR1J'; // !!! SUBSTITUA PELA SUA PUBLIC KEY REAL !!!
  try {
    // Verifica se emailjs está disponível (carregado via CDN ou import)
    if (typeof emailjs !== 'undefined') {
      emailjs.init({
        publicKey: YOUR_PUBLIC_KEY,
      });
      console.log('EmailJS SDK Inicializado com sucesso.');
    } else {
      console.error('EmailJS SDK não encontrado. Verifique se o script foi carregado.');
      // Opcional: Informar o usuário sobre o erro de carregamento
      // alert('Erro ao carregar funcionalidade de contato.');
    }
  } catch (error) {
    console.error('Falha ao inicializar EmailJS:', error);
    // Adicione feedback ao usuário se a inicialização falhar, se necessário
  }


  // --- Tema Dark/Light ---
  const themeToggle = document.getElementById('theme-toggle'); // Botão de troca de tema
  const body = document.body;

  if (themeToggle) { // Só executa se o botão de tema existir
    const currentTheme = localStorage.getItem('theme') || 'light'; // Pega tema salvo ou usa 'light'
    body.setAttribute('data-tema', currentTheme);
    updateButtonText(); // Define o texto inicial do botão

    themeToggle.addEventListener('click', () => {
      const newTheme = body.getAttribute('data-tema') === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-tema', newTheme);
      localStorage.setItem('theme', newTheme); // Salva a preferência
      updateButtonText(); // Atualiza o texto do botão
    });

    // Função para atualizar o texto do botão de tema
    function updateButtonText() {
      if (themeToggle) { // Verificação extra
        themeToggle.textContent = body.getAttribute('data-tema') === 'dark'
          ? 'Tema Claro'
          : 'Tema Escuro';
      }
    }
  } else {
    console.warn('Elemento com ID "theme-toggle" não encontrado. Funcionalidade de tema desabilitada.');
  }


  // --- Scroll Suave para Links Âncora ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault(); // Previne o comportamento padrão do link
      const hrefAttribute = this.getAttribute('href');
      try {
        const targetElement = document.querySelector(hrefAttribute);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth', // Animação suave
            block: 'start' // Alinha o topo do elemento ao topo da janela
          });
        } else {
          console.warn(`Elemento alvo para o link ${hrefAttribute} não encontrado.`);
        }
      } catch (error) {
        // Captura erros caso o hrefAttribute seja um seletor CSS inválido
        console.error(`Seletor inválido para href="${hrefAttribute}":`, error);
      }
    });
  });


  // --- Animação ao Rolar (Intersection Observer) ---
  const observerOptions = {
    threshold: 0.1 // Aciona quando 10% do elemento está visível
    // rootMargin: '0px 0px -50px 0px' // Opcional: ajusta a "caixa" de visualização
  };

  const observerCallback = (entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { // Se o elemento entrou na tela
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        // Opcional: para performance, pode parar de observar após animar uma vez
        // observerInstance.unobserve(entry.target);
      }
      // Opcional: Se quiser reverter a animação quando sair da tela
      // else {
      //    entry.target.style.opacity = '0';
      //    entry.target.style.transform = 'translateY(20px)';
      // }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  // Seleciona os elementos que terão a animação de entrada
  // Ajuste os seletores conforme necessário (ex: '.projetos-card' para animar cards individualmente)
  const elementsToAnimate = document.querySelectorAll('.sobre, .projetos-card, .contato, .cabecalho h1, .cabecalho p, .foto-perfil');

  elementsToAnimate.forEach(element => {
    // Define o estado inicial (invisível e ligeiramente deslocado)
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)'; // Ou 'translateY(30px)' etc.
    // Garante que a transição CSS esteja definida (pode estar no CSS também)
    element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    // Começa a observar o elemento
    observer.observe(element);
  });


  // --- Envio de Formulário de Contato (EmailJS) ---
  const contactForm = document.getElementById('contact-form'); // O formulário de contato
  const serviceID = 'service_ck96781'; // !!! SEU SERVICE ID REAL !!!
  const templateID = 'template_615ro8p'; // !!! SEU TEMPLATE ID REAL !!!

  if (contactForm) { // Só executa se o formulário existir
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault(); // Previne o recarregamento da página

      // Feedback visual opcional: desabilitar botão e mostrar status
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const statusMessageElement = document.getElementById('form-status'); // Crie um <div id="form-status"></div> no HTML

      if (submitButton) submitButton.disabled = true;
      if (statusMessageElement) statusMessageElement.textContent = 'Enviando...';
      if (statusMessageElement) statusMessageElement.style.color = 'inherit'; // Reset color


      console.log('Enviando formulário via EmailJS...');

      // `event.target` é o próprio formulário que disparou o evento 'submit'
      // Verifica se emailjs foi carregado antes de tentar usar
      if (typeof emailjs !== 'undefined') {
        emailjs.sendForm(serviceID, templateID, event.target)
          .then(() => {
            console.log('SUCESSO! Email enviado.');
            if (statusMessageElement) statusMessageElement.textContent = 'Mensagem enviada com sucesso!';
            if (statusMessageElement) statusMessageElement.style.color = 'green';
            // alert('Mensagem enviada com sucesso!'); // Alternativa
            contactForm.reset(); // Limpa os campos do formulário
          }, (error) => {
            console.error('ERRO ao enviar EmailJS:', error);
            if (statusMessageElement) statusMessageElement.textContent = `Erro ao enviar: ${error.text || JSON.stringify(error)}. Tente novamente.`;
            if (statusMessageElement) statusMessageElement.style.color = 'red';
            // alert(`Ocorreu um erro ao enviar: ${error.text || JSON.stringify(error)}`); // Alternativa
          })
          .finally(() => {
            // Executa sempre (sucesso ou erro) para reabilitar o botão
            if (submitButton) submitButton.disabled = false;
            // Pode limpar a mensagem de status após alguns segundos
            // setTimeout(() => {
            //     if (statusMessageElement) statusMessageElement.textContent = '';
            // }, 5000);
          });
      } else {
        console.error("EmailJS não está definido. O envio não pode ser realizado.");
        if (statusMessageElement) statusMessageElement.textContent = 'Erro na configuração do envio. Tente mais tarde.';
        if (statusMessageElement) statusMessageElement.style.color = 'red';
        if (submitButton) submitButton.disabled = false; // Reabilita se falhou antes do envio
      }
    });
  } else {
    console.warn('Elemento <form> com ID "contact-form" não encontrado. Funcionalidade de contato desabilitada.');
  }

}); // Fim do document.addEventListener('DOMContentLoaded', ...)

// script.js

document.addEventListener('DOMContentLoaded', () => {
  const projectImages = document.querySelectorAll('.projetos-imagem');
  const overlay = document.querySelector('.image-overlay');
  const expandedImage = document.querySelector('.expanded-image');

  projectImages.forEach(image => {
    image.addEventListener('click', () => {
      // Define a fonte da imagem expandida para a imagem clicada
      expandedImage.src = image.src;
      // Adiciona a classe 'visible' ao overlay para mostrá-lo
      overlay.classList.add('visible');
    });
  });

  // Fecha o overlay quando clicado (em qualquer lugar do overlay)
  overlay.addEventListener('click', () => {
    overlay.classList.remove('visible');
    // Opcional: limpar o src da imagem expandida quando fechar
    // expandedImage.src = '';
  });

  // Opcional: Adicionar funcionalidade para fechar com a tecla ESC
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('visible')) {
      overlay.classList.remove('visible');
      // Opcional: limpar o src da imagem expandida quando fechar
      // expandedImage.src = '';
    }
  });
});