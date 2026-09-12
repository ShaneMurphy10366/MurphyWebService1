(function(){
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- paint configurators (hero + demo panel) ---------- */
  document.querySelectorAll('.cfg').forEach(function(cfg){
    var paint = cfg.querySelector('.cfg-paint');
    var sw    = cfg.querySelector('.cfg-sw');
    var name  = cfg.querySelector('.cfg-name');
    if (!paint || !sw) return;

    if (!reduce) paint.style.transition = 'fill .45s ease';

    sw.addEventListener('click', function(e){
      var b = e.target.closest('button');
      if (!b || !sw.contains(b)) return;
      sw.querySelectorAll('button').forEach(function(s){
        s.setAttribute('aria-pressed', s === b ? 'true' : 'false');
      });
      paint.setAttribute('fill', b.dataset.c);
      if (name) name.textContent = b.dataset.n;
    });
  });

  /* ---------- drag-to-spin wheel ---------- */
  (function(){
    var wrap = document.getElementById('rimWrap');
    var spin = document.getElementById('rimSpin');
    if (!wrap || !spin) return;

    var angle = 0, lastX = null, lastY = null, vel = 0, everDragged = false, axisLocked = null;

    function apply(){ spin.style.transform = 'rotate(' + angle + 'deg)'; }

    wrap.addEventListener('pointerdown', function(e){
      lastX = e.clientX; lastY = e.clientY; axisLocked = null; vel = 0;
      try { wrap.setPointerCapture(e.pointerId); } catch(err){}
    });

    wrap.addEventListener('pointermove', function(e){
      if (lastX === null) return;
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;

      // decide once whether this gesture is a spin or a page scroll
      if (axisLocked === null){
        if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
        axisLocked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (axisLocked === 'y'){ lastX = e.clientX; lastY = e.clientY; return; }

      lastX = e.clientX; lastY = e.clientY;
      everDragged = true;
      vel = dx * 0.9;
      angle += vel;
      apply();
    });

    function release(){ lastX = null; lastY = null; axisLocked = null; }
    wrap.addEventListener('pointerup', release);
    wrap.addEventListener('pointercancel', release);
    wrap.addEventListener('lostpointercapture', release);

    // keyboard support
    wrap.tabIndex = 0;
    wrap.setAttribute('role','slider');
    wrap.setAttribute('aria-label','Rotate the wheel');
    wrap.addEventListener('keydown', function(e){
      if (e.key === 'ArrowLeft'){ angle -= 12; everDragged = true; apply(); e.preventDefault(); }
      if (e.key === 'ArrowRight'){ angle += 12; everDragged = true; apply(); e.preventDefault(); }
    });

    apply();

    if (!reduce){
      (function loop(){
        if (lastX === null){
          if (Math.abs(vel) > 0.05){ angle += vel; vel *= 0.955; apply(); }
          else if (!everDragged){ angle += 0.16; apply(); }
        }
        requestAnimationFrame(loop);
      })();
    }
  })();

  /* ---------- scroll-triggered animations ---------- */
  function countTo(el, to, dur){
    if (!el) return;
    if (reduce){ el.textContent = to; return; }
    var start = null;
    function tick(t){
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var targets = ['dyno','gauge','revealDemo']
    .map(function(id){ return document.getElementById(id); })
    .filter(Boolean);

  function activate(el){
    el.classList.add('on');
    if (el.id === 'dyno'){
      countTo(document.getElementById('hpVal'), 487, 1800);
      countTo(document.getElementById('tqVal'), 412, 1800);
    }
  }

  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        activate(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
    targets.forEach(function(el){ io.observe(el); });
  } else {
    targets.forEach(activate);          // fallback: just show them
  }

  /* ---------- before / after slider ---------- */
  (function(){
    var r = document.getElementById('baRange'),
        n = document.getElementById('baNew'),
        l = document.getElementById('baLine');
    if (!r || !n || !l) return;
    function update(){
      var v = r.value + '%';
      n.style.setProperty('--sp', v);
      l.style.setProperty('--sp', v);
    }
    r.addEventListener('input', update);
    r.addEventListener('change', update);
    update();
  })();

  /* ---------- inventory filter ---------- */
  (function(){
    var inv = document.getElementById('inv'), chips = document.getElementById('chips');
    if (!inv || !chips) return;

    var kinds = ['a','b','c'];
    for (var i = 0; i < 9; i++){
      var t = document.createElement('div');
      t.className = 'car-tile';
      t.dataset.k = kinds[i % 3];
      inv.appendChild(t);
    }

    chips.addEventListener('click', function(e){
      var b = e.target.closest('.chip');
      if (!b || !chips.contains(b)) return;
      chips.querySelectorAll('.chip').forEach(function(c){
        c.setAttribute('aria-pressed', c === b ? 'true' : 'false');
      });
      var f = b.dataset.f;
      inv.querySelectorAll('.car-tile').forEach(function(t){
        t.classList.toggle('off', f !== 'all' && t.dataset.k !== f);
      });
    });
  })();

  /* ---------- spec sheet accordion ---------- */
  (function(){
    var spec = document.getElementById('spec');
    if (!spec) return;
    spec.addEventListener('click', function(e){
      var b = e.target.closest('button');
      if (!b || !spec.contains(b)) return;
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
      var panel = b.nextElementSibling;
      if (panel) panel.classList.toggle('open', !open);
    });
  })();

  /* ---------- services ticker ---------- */
  (function(){
    var run = document.getElementById('tickRun');
    if (!run) return;
    var items = ['Ceramic coating','Paint correction','Vinyl wrap','Window tint',
                 'PPF','Dyno tuning','Wheels & tires','Detailing'];
    var sep = ' <span style="color:#FF5C1A">/</span> ';
    var once = items.join(sep) + sep;
    run.innerHTML = once + once;   // two copies so the -50% loop is seamless
  })();

})();
