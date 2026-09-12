(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- paint configurator ---- */
  var paint = document.getElementById('paint');
  var swName = document.getElementById('swName');
  if (!reduce) paint.style.transition = 'fill .45s ease';

  document.getElementById('swatches').addEventListener('click', function(e){
    var b = e.target.closest('.sw'); if (!b) return;
    this.querySelectorAll('.sw').forEach(function(s){ s.setAttribute('aria-pressed', s === b); });
    paint.setAttribute('fill', b.dataset.c);
    swName.textContent = b.dataset.n;
  });

  /* ---- drag to spin wheel ---- */
  var wrap = document.getElementById('rimWrap');
  var spin = document.getElementById('rimSpin');
  var angle = 0, last = null, vel = 0, touched = false;

  function apply(){ spin.style.transform = 'rotate(' + angle + 'deg)'; }

  wrap.addEventListener('pointerdown', function(e){
    last = e.clientX; touched = true; vel = 0;
    wrap.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  wrap.addEventListener('pointermove', function(e){
    if (last === null) return;
    var dx = e.clientX - last;
    last = e.clientX;
    vel = dx * 0.9;
    angle += vel;
    apply();
  });

  function release(){ last = null; }
  wrap.addEventListener('pointerup', release);
  wrap.addEventListener('pointercancel', release);

  if (!reduce){
    (function loop(){
      if (last === null){
        if (Math.abs(vel) > 0.05){ angle += vel; vel *= 0.955; apply(); }
        else if (!touched){ angle += 0.16; apply(); }
      }
      requestAnimationFrame(loop);
    })();
  } else { apply(); }

  /* ---- scroll-triggered pieces ---- */
  function countTo(el, to, dur){
    if (reduce){ el.textContent = to; return; }
    var start = null;
    function tick(t){
      if (!start) start = t;
      var p = Math.min((t - start)/dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      en.target.classList.add('on');
      if (en.target.id === 'dyno'){
        countTo(document.getElementById('hpVal'), 487, 1800);
        countTo(document.getElementById('tqVal'), 412, 1800);
      }
      io.unobserve(en.target);
    });
  }, { threshold: .35 });

  ['dyno','gauge','revealDemo'].forEach(function(id){
    io.observe(document.getElementById(id));
  });

  /* ---- before / after ---- */
  var r = document.getElementById('baRange'),
      n = document.getElementById('baNew'),
      l = document.getElementById('baLine');
  function ba(){ var v = r.value + '%'; n.style.setProperty('--sp', v); l.style.setProperty('--sp', v); }
  r.addEventListener('input', ba); ba();

  /* ---- inventory filter ---- */
  var kinds = ['a','b','c'], inv = document.getElementById('inv');
  for (var i = 0; i < 9; i++){
    var t = document.createElement('div');
    t.className = 'car-tile';
    t.dataset.k = kinds[i % 3];
    inv.appendChild(t);
  }
  document.getElementById('chips').addEventListener('click', function(e){
    var b = e.target.closest('.chip'); if (!b) return;
    this.querySelectorAll('.chip').forEach(function(c){ c.setAttribute('aria-pressed', c === b); });
    var f = b.dataset.f;
    inv.querySelectorAll('.car-tile').forEach(function(t){
      t.classList.toggle('off', f !== 'all' && t.dataset.k !== f);
    });
  });

  /* ---- spec sheet ---- */
  document.getElementById('spec').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    var open = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', !open);
    b.nextElementSibling.classList.toggle('open', !open);
  });

  /* ---- ticker ---- */
  var items = ['Ceramic coating','Paint correction','Vinyl wrap','Window tint','PPF','Dyno tuning','Wheels &amp; tires','Detailing'];
  document.getElementById('tickRun').innerHTML =
    (items.join(' <span style="color:#FF5C1A">/</span> ') + ' <span style="color:#FF5C1A">/</span> ').repeat(2);
})();
