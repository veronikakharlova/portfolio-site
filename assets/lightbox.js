/*
  Просмотр скриншотов кейса во весь экран.
  Подключается на страницах projects/*.html:
  <script src="../assets/lightbox.js" defer></script>
  Работает для всех картинок внутри .case-image.
  Закрытие: Esc, крестик, клик по фону. Листание: стрелки ← →, кнопки, свайп.
*/
(function () {
  var images = Array.prototype.slice.call(document.querySelectorAll('.case-image img'));
  if (!images.length) return;

  var css = '' +
    '.case-image img{cursor:zoom-in}' +
    '.lb{position:fixed;inset:0;z-index:1000;display:none;flex-direction:column;align-items:center;justify-content:center;' +
      'background:rgba(16,16,20,.97);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);padding:56px 72px 64px;box-sizing:border-box;font-family:inherit}' +
    '.lb.is-open{display:flex}' +
    '.lb__img{max-width:100%;max-height:100%;object-fit:contain;border-radius:10px;background:#fff;' +
      'box-shadow:0 30px 80px -20px rgba(0,0,0,.6);user-select:none;-webkit-user-drag:none}' +
    '.lb__caption{position:absolute;left:72px;right:72px;bottom:18px;text-align:center;color:rgba(255,255,255,.78);' +
      'font-size:14px;line-height:1.4}' +
    '.lb__count{position:absolute;top:20px;left:24px;color:rgba(255,255,255,.6);font-size:14px}' +
    '.lb__btn{position:absolute;display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:999px;' +
      'background:rgba(255,255,255,.12);color:#fff;font-size:22px;line-height:1;cursor:pointer;transition:background .15s}' +
    '.lb__btn:hover{background:rgba(255,255,255,.24)}' +
    '.lb__btn:focus-visible{outline:2px solid #B4573C;outline-offset:2px}' +
    '.lb__close{top:12px;right:16px}' +
    '.lb__prev{left:16px;top:50%;transform:translateY(-50%)}' +
    '.lb__next{right:16px;top:50%;transform:translateY(-50%)}' +
    '.lb--single .lb__prev,.lb--single .lb__next,.lb--single .lb__count{display:none}' +
    '@media (max-width:640px){.lb{padding:56px 12px 72px}.lb__prev,.lb__next{top:auto;bottom:14px;transform:none}' +
      '.lb__caption{left:64px;right:64px;bottom:22px;font-size:13px}}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var box = document.createElement('div');
  box.className = 'lb' + (images.length === 1 ? ' lb--single' : '');
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Просмотр изображения');
  box.innerHTML =
    '<div class="lb__count"></div>' +
    '<img class="lb__img" alt="">' +
    '<div class="lb__caption"></div>' +
    '<button class="lb__btn lb__close" type="button" aria-label="Закрыть">✕</button>' +
    '<button class="lb__btn lb__prev" type="button" aria-label="Предыдущее изображение">←</button>' +
    '<button class="lb__btn lb__next" type="button" aria-label="Следующее изображение">→</button>';
  document.body.appendChild(box);

  var big = box.querySelector('.lb__img');
  var caption = box.querySelector('.lb__caption');
  var count = box.querySelector('.lb__count');
  var closeBtn = box.querySelector('.lb__close');
  var current = 0;
  var lastFocus = null;
  var bodyOverflow = '';

  function show(i) {
    current = (i + images.length) % images.length;
    var src = images[current];
    big.src = src.currentSrc || src.src;
    big.alt = src.alt || '';
    caption.textContent = src.alt || '';
    count.textContent = (current + 1) + ' / ' + images.length;
    [current - 1, current + 1].forEach(function (n) {
      var pre = images[(n + images.length) % images.length];
      if (pre) { var im = new Image(); im.src = pre.currentSrc || pre.src; }
    });
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.classList.add('is-open');
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    box.classList.remove('is-open');
    document.body.style.overflow = bodyOverflow;
    big.removeAttribute('src');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  images.forEach(function (img, i) {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.addEventListener('click', function () { open(i); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  closeBtn.addEventListener('click', close);
  box.querySelector('.lb__prev').addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
  box.querySelector('.lb__next').addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });

  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'Tab') {
      var f = Array.prototype.slice.call(box.querySelectorAll('button')).filter(function (b) { return b.offsetParent !== null; });
      var idx = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(idx + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  var startX = null;
  box.addEventListener('touchstart', function (e) {
    startX = e.touches.length === 1 ? e.touches[0].clientX : null;
  }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (startX === null || images.length < 2) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
