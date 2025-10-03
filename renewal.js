/* ===== 文字スクランブル ===== */
function scrambleText(el){
  if(el.dataset.scrambled) return; // 既にアニメ済みは無視
  el.dataset.scrambled = "true";

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const text = el.dataset.text;
  let iteration = 0;

  function animate(){
    let output = text.split('').map((char,index)=>{
      if(index < iteration) return char;
      return chars[Math.floor(Math.random()*chars.length)];
    }).join('');
    el.textContent = output;

    if(iteration < text.length){
      iteration += 1/3;
      requestAnimationFrame(animate);
    }
  }
  animate();
}

/* ===== スクロールでフェードイン＋文字スクランブル ===== */
function checkVisible(){
  const glasses = document.querySelectorAll('.glass');
  const triggerBottom = window.innerHeight * 0.85;

  glasses.forEach(glass=>{
    const rect = glass.getBoundingClientRect();
    if(rect.top < triggerBottom){
      if(!glass.classList.contains('visible')){
        glass.classList.add('visible');
        scrambleText(glass); // ここでアニメ開始
      }
    }
  });
}

/* ===== 複数レイヤーパララックス ===== */
function parallaxScroll(){
  document.querySelectorAll('section').forEach(section=>{
    const offset = window.scrollY;
    const layer1 = section.querySelector('.layer1');
    const layer2 = section.querySelector('.layer2');
    if(layer1) layer1.style.transform = `translateY(${offset*0.2}px)`;
    if(layer2) layer2.style.transform = `translateY(${offset*0.4}px)`;
  });
}

window.addEventListener('scroll', ()=>{
  checkVisible();
  parallaxScroll();
});

/* 初回チェック */
checkVisible();
parallaxScroll();
