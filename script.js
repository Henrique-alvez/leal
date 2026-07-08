/**
 * DEFENSOR SOLUÇÕES EM ARMAS — Landing Page
 * Script principal: menu mobile, header, FAQ, formulário, WhatsApp e animações.
 */

// ---------- Configuração central (única fonte de verdade) ----------
const CONFIG = {
  // TODO: substitua pelo número real no formato DDI+DDD+NÚMERO, apenas dígitos
  whatsappNumber: '5511988534236',
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  initHeaderScroll();
  initMobileNav();
  initWhatsappLinks();
  initFaqAccordion();
  initContactForm();
  initScrollReveal();
  initScrollProgress();
  initButtonRipple();
  initCounters();
  if (!prefersReducedMotion) initHeroTilt();
});

/** Atualiza o ano do copyright automaticamente. */
function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/** Adiciona sombra/fundo sólido ao header quando a página é rolada. */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  const toggleScrolled = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  toggleScrolled();
  window.addEventListener('scroll', toggleScrolled, { passive: true });
}

/** Controla abertura/fechamento do menu mobile. */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  const closeNav = () => {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Fecha o menu ao clicar em qualquer link de navegação
  nav.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', closeNav);
  });
}

/**
 * Monta dinamicamente os links de WhatsApp a partir do CONFIG.whatsappNumber.
 * Evita duplicar o número em várias partes do HTML (fonte única de verdade).
 */
function initWhatsappLinks() {
  document.querySelectorAll('.whatsapp-link').forEach((link) => {
    const message = link.dataset.message || 'Olá! Gostaria de mais informações.';
    link.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  });
}

/** Accordion do FAQ: abre uma pergunta por vez, com altura animada. */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach((item) => {
    const question = item.querySelector('.faq-item__question');
    const answer = item.querySelector('.faq-item__answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Fecha os demais itens abertos
      items.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.faq-item__question')?.setAttribute('aria-expanded', 'false');
        const otherAnswer = other.querySelector('.faq-item__answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
}

/**
 * Validação client-side do formulário de contato.
 * Como não há backend conectado, ao validar com sucesso o formulário
 * monta a mensagem e redireciona para o WhatsApp (wa.me) com o texto preenchido.
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fields = {
    name: { el: document.getElementById('name'), error: document.getElementById('nameError') },
    email: { el: document.getElementById('email'), error: document.getElementById('emailError') },
    phone: { el: document.getElementById('phone'), error: document.getElementById('phoneError') },
    message: { el: document.getElementById('message'), error: document.getElementById('messageError') },
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[\d\s()+-]{8,20}$/;

  const setError = (field, msg) => {
    field.el.classList.toggle('is-invalid', Boolean(msg));
    field.error.textContent = msg || '';
  };

  const validate = () => {
    let isValid = true;

    if (!fields.name.el.value.trim()) {
      setError(fields.name, 'Informe seu nome.');
      isValid = false;
    } else {
      setError(fields.name, '');
    }

    if (!emailRegex.test(fields.email.el.value.trim())) {
      setError(fields.email, 'Informe um e-mail válido.');
      isValid = false;
    } else {
      setError(fields.email, '');
    }

    if (!phoneRegex.test(fields.phone.el.value.trim())) {
      setError(fields.phone, 'Informe um telefone válido.');
      isValid = false;
    } else {
      setError(fields.phone, '');
    }

    if (!fields.message.el.value.trim()) {
      setError(fields.message, 'Escreva uma breve mensagem.');
      isValid = false;
    } else {
      setError(fields.message, '');
    }

    return isValid;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate()) return;

    const text =
      `Olá! Meu nome é ${fields.name.el.value.trim()}.\n` +
      `E-mail: ${fields.email.el.value.trim()}\n` +
      `Telefone: ${fields.phone.el.value.trim()}\n` +
      `Mensagem: ${fields.message.el.value.trim()}`;

    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    form.reset();
  });

  // Remove o erro assim que o usuário corrige o campo
  Object.values(fields).forEach(({ el }) => {
    el.addEventListener('input', validate);
  });
}

/**
 * Revela elementos com a classe .reveal conforme entram na viewport.
 * Also aplica um efeito cascata (stagger) nos filhos diretos de grids,
 * definindo um pequeno atraso incremental via a variável CSS --reveal-delay.
 */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  // Aplica atraso incremental para elementos dentro de grids (efeito cascata)
  const staggerGroups = document.querySelectorAll(
    '.features__grid, .services__grid, .how__steps, .about__stats'
  );
  staggerGroups.forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      child.style.setProperty('--reveal-delay', `${index * 90}ms`);
    });
  });

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/** Preenche a barra fixa no topo com o progresso de rolagem da página (0–100%). */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${percent}%`;
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
}

/** Cria um pequeno efeito de "onda" (ripple) no ponto de clique dos botões. */
function initButtonRipple() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');

      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/**
 * Anima números (ex.: "+10", "100%") contando de 0 até o valor alvo
 * quando o elemento entra na viewport. Usa data-count-target no HTML.
 */
function initCounters() {
  const counters = document.querySelectorAll('.count');
  if (!counters.length) return;

  const animateCount = (el) => {
    const target = Number(el.dataset.countTarget || 0);
    if (prefersReducedMotion || !target) {
      el.textContent = target;
      return;
    }

    const duration = 1400;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cúbico
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCount);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}

/**
 * Efeito sutil de inclinação 3D (tilt) no cartão do hero, seguindo o mouse.
 * Desativado automaticamente quando o usuário prefere menos movimento.
 */
function initHeroTilt() {
  const hero = document.getElementById('home');
  const card = document.getElementById('dossierCard');
  const pistol = document.querySelector('.hero__blueprint--pistol');
  const rifle = document.querySelector('.hero__blueprint--rifle');
  const grid = document.querySelector('.hero__bg-grid');
  if (!hero || !card || window.matchMedia('(max-width: 960px)').matches) return;

  const maxTilt = 8; // graus

  hero.addEventListener('mousemove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    // Inclinação 3D do Dossiê
    card.style.transform = `rotateY(${x * maxTilt * 2}deg) rotateX(${-y * maxTilt * 2}deg) translate3d(${x * 12}px, ${y * 12}px, 0)`;

    // Efeito Parallax nos blueprints e grade (movimento oposto)
    if (pistol) pistol.style.transform = `translate3d(${x * -40}px, ${y * -40}px, 0) rotate(${x * 2}deg)`;
    if (rifle) rifle.style.transform = `translate3d(${x * -25}px, ${y * -25}px, 0) rotate(${y * -2}deg)`;
    if (grid) grid.style.transform = `translate3d(${x * -10}px, ${y * -10}px, 0)`;
  });

  hero.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0deg) rotateX(0deg) translate3d(0, 0, 0)';
    if (pistol) pistol.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
    if (rifle) rifle.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
    if (grid) grid.style.transform = 'translate3d(0, 0, 0)';
  });
}
