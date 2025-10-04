document.addEventListener('DOMContentLoaded', () => {

  // ---- ヘッダ ナビ開閉 ----
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle && navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mainNav && mainNav.setAttribute('aria-hidden', expanded ? 'true' : 'false');
  });

  // ---- モーダル ----
  const modal = document.getElementById('modal');
  const openModal = document.getElementById('openModal');
  const closeModal = document.getElementById('closeModal');
  function showModal() { modal.setAttribute('aria-hidden', 'false'); closeModal && closeModal.focus(); }
  function hideModal() { modal.setAttribute('aria-hidden', 'true'); }
  openModal && openModal.addEventListener('click', showModal);
  closeModal && closeModal.addEventListener('click', hideModal);
  modal && modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') hideModal(); });

  // ---- 左から順番スクランブル文字アニメーション ----
  const scrambleChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.<>?/|\\\'"`~';
  function scrambleTextSequential(targetEl, text, speed = 50) {
    let display = Array.from(text).map(() => '');
    let fixedIndex = 0;

    function update() {
      for (let i = fixedIndex; i < text.length; i++) {
        display[i] = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      }
      targetEl.textContent = display.join('');

      if (Math.random() < 0.28) { // 左端文字固定
        display[fixedIndex] = text[fixedIndex];
        fixedIndex++;
      }

      if (fixedIndex < text.length) setTimeout(update, speed);
      else targetEl.textContent = text; // 完全固定
    }

    update();
  }

  // ---- 文字→画像マッピング（モザイクタイル用） ----
  const charMap = {
    "!":"exclamation","?":"question","&":"amp","@":"at","#":"hash","$":"dollar","%":"percent",
    "^":"caret","*":"asterisk","(":"paren_l",")":"paren_r","-":"dash","_":"underscore","+":"plus",
    "=":"equals","[":"bracket_l","]":"bracket_r","{":"brace_l","}":"brace_r",";":"semicolon",
    ":":"colon",",":"comma",".":"dot","<":"lt",">":"gt","/":"slash","\\":"backslash",
    "'":"quote","\"":"doublequote","`":"backtick","~":"tilde","|":"pipe"
  };

  function getTileFileName(char) {
    if (!char) return "blank";
    if (charMap[char]) return charMap[char];
    const code = char.charCodeAt(0);
    if ((code >= 65 && code <= 90) || (code >= 48 && code <= 57)) return char.toUpperCase();
    return "blank";
  }

  // ---- モザイクタイル画像アニメーション ----
  function scrambleMosaic(el, text, speed = 50) {
    el.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.classList.add('tile');
      el.appendChild(span);
    }
    const tiles = Array.from(el.children);
    let fixedIndex = 0;

    function update() {
      for (let i = fixedIndex; i < tiles.length; i++) {
        const randomChar = text[Math.floor(Math.random() * text.length)];
        const fileName = getTileFileName(randomChar);
        tiles[i].style.backgroundImage = `url(images/kissmiya128.png)`;
      }

      if (Math.random() < 0.28 && fixedIndex < text.length) {
        const fixedFile = getTileFileName(text[fixedIndex]);
        tiles[fixedIndex].style.backgroundImage = `url(images/karamiya128.png)`;
        fixedIndex++;
      }

      if (fixedIndex < tiles.length) setTimeout(update, speed);
    }

    update();
  }

  // ---- IntersectionObserverでスクロール発火 ----
  const toObserve = document.querySelectorAll('[data-text], [data-mosaic]');
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.classList.contains('played')) { observer.unobserve(el); return; }

      if (el.hasAttribute('data-mosaic')) {
        scrambleMosaic(el, el.getAttribute('data-text'), 50);
      } else {
        scrambleTextSequential(el, el.getAttribute('data-text'), 50);
      }

      el.classList.add('played');
      observer.unobserve(el);
    });
  }, { threshold: 0.15 });

  toObserve.forEach(el => io.observe(el));

  // ---- ページロード時 hero の最初の lines ----
  const heroFirsts = document.querySelectorAll('#hero [data-text]');
  heroFirsts.forEach((el, idx) => {
    setTimeout(() => {
      if (!el.classList.contains('played')) {
        if (el.hasAttribute('data-mosaic')) {
          scrambleMosaic(el, el.getAttribute('data-text'), 50);
        } else {
          scrambleTextSequential(el, el.getAttribute('data-text'), 50);
        }
        el.classList.add('played');
      }
    }, 200 + idx * 200);
  });

  // ---- スムーススクロール ----
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (mainNav) { mainNav.setAttribute('aria-hidden','true'); navToggle && navToggle.setAttribute('aria-expanded','false'); }
      }
    });
  });

});
