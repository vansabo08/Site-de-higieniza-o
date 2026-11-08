/* =========================================================
   PURA Higienização — interacções
   ========================================================= */

// ▼▼▼ TROQUE AQUI O NÚMERO DE WHATSAPP ▼▼▼
// Só dígitos, com o indicativo de Angola (244) e sem "+" nem espaços.
const WHATSAPP_NUMBER = '244900000000';
// Como o número aparece escrito no site:
const WHATSAPP_DISPLAY = '+244 9XX XXX XXX';
// Mensagem pré-preenchida:
const WHATSAPP_MESSAGE = 'Olá PURA! Gostaria de pedir um orçamento para higienização.';
// ▲▲▲ ------------------------------------ ▲▲▲

const waLink = (text = WHATSAPP_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- Links de WhatsApp ---------- */
$$('[data-wa]').forEach((a) => {
  a.href = waLink();
  a.target = '_blank';
  a.rel = 'noopener';
});
$$('[data-wa-display]').forEach((el) => { el.textContent = WHATSAPP_DISPLAY; });

/* ---------- Vídeo da hero ---------- */
const heroVideo = $('.hero__video');
if (heroVideo) {
  heroVideo.muted = true;
  const tryPlay = () => heroVideo.play().catch(() => {});
  tryPlay();
  // Poupa bateria: pausa quando a hero sai do ecrã
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      entry.isIntersecting ? tryPlay() : heroVideo.pause();
    }).observe(heroVideo);
  }
}

/* ---------- Navbar ---------- */
const nav = $('#nav');
const toggle = $('#navToggle');
const menu = $('#menu');

const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const setMenu = (open) => {
  menu.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('menu-open', open);
};
toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
$$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
window.matchMedia('(min-width: 1024px)').addEventListener('change', () => setMenu(false));

// Link activo conforme a secção visível
const navLinks = $$('.nav__menu a[href^="#"]:not(.btn)');
const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
}

/* ---------- Formulário de orçamento → WhatsApp ---------- */
const form = $('#estimateForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const lines = [WHATSAPP_MESSAGE];
  if (data.get('nome')) lines.push(`Nome: ${data.get('nome').trim()}`);
  if (data.get('bairro')) lines.push(`Bairro: ${data.get('bairro').trim()}`);
  if (data.get('servico')) lines.push(`Serviço: ${data.get('servico')}`);
  window.open(waLink(lines.join('\n')), '_blank', 'noopener');
});

/* ---------- Antes e depois ---------- */
const ba = $('#beforeAfter');
if (ba) {
  const range = $('.ba__range', ba);
  const update = () => ba.style.setProperty('--pos', `${range.value}%`);
  range.addEventListener('input', update);
  update();
}

/* ---------- Carrossel de testemunhos ---------- */
const carousel = $('#carousel');
if (carousel) {
  const track = $('.carousel__track', carousel);
  const slides = $$('.quote', carousel);
  const dotsWrap = $('.carousel__dots', carousel);
  let index = 0;
  let timer;

  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Testemunho ${i + 1}`);
    b.addEventListener('click', () => { go(i); restart(); });
    dotsWrap.appendChild(b);
    return b;
  });

  const go = (i) => {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, n) => d.setAttribute('aria-selected', String(n === index)));
    slides.forEach((s, n) => s.setAttribute('aria-hidden', String(n !== index)));
  };
  const restart = () => {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(() => go(index + 1), 6500);
  };

  $$('.carousel__btn', carousel).forEach((b) =>
    b.addEventListener('click', () => { go(index + Number(b.dataset.dir)); restart(); })
  );
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', restart);
  carousel.addEventListener('focusin', () => clearInterval(timer));

  // Deslizar com o dedo
  let startX = null;
  const viewport = $('.carousel__viewport', carousel);
  viewport.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  viewport.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); restart(); }
    startX = null;
  });

  go(0);
  restart();
}

/* ---------- FAQ (acordeão) ---------- */
$$('.faq__item').forEach((item) => {
  const btn = $('.faq__q', item);
  btn.addEventListener('click', () => {
    const open = !item.classList.contains('is-open');
    $$('.faq__item.is-open').forEach((other) => {
      other.classList.remove('is-open');
      $('.faq__q', other).setAttribute('aria-expanded', 'false');
    });
    item.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  });
});

/* ---------- Contadores ---------- */
const formatNumber = (value, decimals) => {
  const fixed = value.toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return dec ? `${withDots},${dec}` : withDots;
};
const counters = $$('[data-count]');
const setFinal = (el) => {
  el.textContent = formatNumber(Number(el.dataset.count), Number(el.dataset.decimals || 0));
};

/* ---------- Animações (GSAP + ScrollTrigger) ---------- */
function initAnimations() {
  const { gsap, ScrollTrigger } = window;
  if (reduceMotion || !gsap || !ScrollTrigger) {
    document.documentElement.classList.remove('anim');
    counters.forEach(setFinal);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Entrada da hero (fade + subir, com stagger)
  gsap.fromTo('[data-hero]',
    { opacity: 0, y: 34 },
    { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.15 }
  );

  // Revelar ao fazer scroll
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.fromTo(els,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.85, ease: 'power2.out', stagger: 0.09, overwrite: true }
    ),
  });

  // Contadores animados
  counters.forEach((el) => {
    const target = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals || 0);
    const obj = { v: 0 };
    el.textContent = formatNumber(0, decimals);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => gsap.to(obj, {
        v: target, duration: 2, ease: 'power2.out',
        onUpdate: () => { el.textContent = formatNumber(obj.v, decimals); },
        onComplete: () => setFinal(el),
      }),
    });
  });

  // Recalcula posições quando as imagens lazy carregam
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

// Os scripts são "defer": GSAP já está carregado aqui (se a CDN respondeu)
initAnimations();
