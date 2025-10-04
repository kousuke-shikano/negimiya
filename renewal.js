// renewal.js
// - タイピング風アニメーション（順番 / ランダムを切り替え）
// - IntersectionObserver でスクロール時に発火
// - ヘッダの簡易ナビ、モーダル制御

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
  function showModal() {
    modal.setAttribute('aria-hidden', 'false');
    closeModal && closeModal.focus();
  }
  function hideModal() {
    modal.setAttribute('aria-hidden', 'true');
  }
  openModal && openModal.addEventListener('click', showModal);
  closeModal && closeModal.addEventListener('click', hideModal);
  modal && modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') hideModal(); });

  // ---- ユーティリティ：文字を span に分割 ----
  function splitToSpans(el, text) {
    el.innerHTML = ''; // クリア
    const chars = Array.from(text);
    chars.forEach(ch => {
      const s = document.createElement('span');
      s.textContent = ch;
      el.appendChild(s);
    });
    return el.querySelectorAll('span');
  }

  // ---- タイピング（逐次追加していく風） ----
  function playTypingSequential(targetEl, text, baseDelay = 40) {
    // 既に分割されている場合はそれを利用
    const spans = splitToSpans(targetEl, text);
    spans.forEach((sp, i) => {
      const delay = i * baseDelay;
      sp.style.animationDelay = `${delay}ms`;
      // optional: 微妙にバラすならここにランダム要素を加える
    });
    // add animate class to start css animation
    targetEl.classList.add('animate');
  }

  // ---- ランダム順で出す ----
  function playTypingRandom(targetEl, text, interval = 60) {
    const spans = splitToSpans(targetEl, text);
    const order = [...Array(spans.length).keys()];
    // shuffle
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    order.forEach((idx, orderIdx) => {
      const delay = orderIdx * interval;
      spans[idx].style.animationDelay = `${delay}ms`;
    });
    targetEl.classList.add('animate');
  }

  // ---- 初期化：data-text 属性を持つ pre / p を IntersectionObserver で監視 ----
  const toObserve = document.querySelectorAll('[data-text]');
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const txt = el.getAttribute('data-text') || '';
      // 既に再生済みなら無視（false を繰り返したければここを変える）
      if (el.classList.contains('played')) { observer.unobserve(el); return; }

      // 小判別：class で sequential / random / typing を判別
      if (el.classList.contains('typing')) {
        // typing 用（コマンド風） - 完全に文字を逐次追加（JSで書き込む）
        el.textContent = ''; // いったん消す
        // 逐次追加方式（テキストを1文字ずつ追加していく簡易版）
        let i = 0;
        function tick() {
          if (i < txt.length) {
            el.textContent += txt[i];
            i++;
            // ランダムかどうかで速度を微妙に変える
            const jitter = el.classList.contains('random') ? Math.random() * 80 : 0;
            setTimeout(tick, 40 + jitter);
          } else {
            el.classList.add('played');
            observer.unobserve(el);
          }
        }
        tick();
      } else {
        // span に分割して CSS アニメーションで見せるパターン
        if (el.classList.contains('random')) {
          playTypingRandom(el, txt, 60);
        } else {
          playTypingSequential(el, txt, 50);
        }
        el.classList.add('played');
        // reveal parent pre-like block (fade-in)
        el.closest('section') && el.closest('section').querySelectorAll('[data-text]').forEach(n => n.classList.add('revealed'));
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.18 });

  toObserve.forEach(el => {
    io.observe(el);
  });

  // ---- ページロード時に hero の最初の lines を先にトリガー ----
  // hero 内の最初の data-text を手動で発火（すぐ見せたい）
  const heroFirsts = document.querySelectorAll('#hero [data-text]');
  heroFirsts.forEach((el, idx) => {
    // small delay so the page settles
    setTimeout(() => {
      // manually trigger by calling intersection callback style
      const ev = new Event('manualTrigger');
      el.dispatchEvent(ev);
      // But easiest: if not played, just call observer callback indirect via IO: simulate intersection by direct logic
      if (!el.classList.contains('played')) {
        const txt = el.getAttribute('data-text') || '';
        if (el.classList.contains('typing')) {
          el.textContent = '';
          let i = 0;
          function tick() {
            if (i < txt.length) {
              el.textContent += txt[i];
              i++;
              const jitter = el.classList.contains('random') ? Math.random() * 80 : 0;
              setTimeout(tick, 40 + jitter);
            } else {
              el.classList.add('played');
            }
          }
          tick();
        } else {
          if (el.classList.contains('random')) playTypingRandom(el, txt, 60);
          else playTypingSequential(el, txt, 50);
          el.classList.add('played');
        }
      }
    }, 220 + idx * 260);
  });

  // ---- スムーススクロール（リンク） ----
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // close nav on mobile
        if (mainNav) { mainNav.setAttribute('aria-hidden', 'true'); navToggle && navToggle.setAttribute('aria-expanded','false'); }
      }
    });
  });

});
