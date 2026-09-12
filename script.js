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

      // tint the glow behind the car to match the paint
      var hex = b.dataset.c.replace('#','');
      var r = parseInt(hex.substr(0,2),16),
          g = parseInt(hex.substr(2,2),16),
          bl = parseInt(hex.substr(4,2),16);
      cfg.style.setProperty('--paint-glow','rgba('+r+','+g+','+bl+',.5)');
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

  /* ---------- looping animations (only while on screen) ---------- */
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

  /* Runs `fn` on an interval, but only while `el` is visible.
     Keeps the loop off the CPU when the panel is scrolled away. */
  function loopWhileVisible(el, fn, period){
    if (!el) return;
    var timer = null;

    function start(){
      if (timer) return;
      fn();
      timer = setInterval(fn, period);
    }
    function stop(){
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    }

    if (reduce){ fn(); return; }

    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(entries){
        entries.forEach(function(en){ en.isIntersecting ? start() : stop(); });
      }, { threshold: 0.25 }).observe(el);
    } else {
      start();
    }

    // pause everything when the tab is in the background
    document.addEventListener('visibilitychange', function(){
      document.hidden ? stop() : (isVisible(el) && start());
    });
  }

  function isVisible(el){
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  /* dyno: curves redraw and the numbers re-count every cycle.
     Toggling a class gets coalesced by the browser, so drive the stroke directly. */
  (function(){
    var dyno = document.getElementById('dyno');
    if (!dyno) return;
    var curves = dyno.querySelectorAll('path.curve');
    if (!curves.length) return;

    dyno.classList.add('on');

    loopWhileVisible(dyno, function(){
      curves.forEach(function(path, i){
        path.style.transition = 'none';
        path.style.strokeDashoffset = '520';
        void path.getBoundingClientRect();        // flush the reset before animating
        path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.3,.8,.4,1)';
        path.style.transitionDelay = (i * 0.25) + 's';
        path.style.strokeDashoffset = '0';
      });
      countTo(document.getElementById('hpVal'), 487, 1800);
      countTo(document.getElementById('tqVal'), 412, 1800);
    }, 5200);
  })();

  /* gauge: needle sweeps up, holds, falls back, repeats */
  (function(){
    var gauge = document.getElementById('gauge');
    if (!gauge) return;
    var up = false;
    loopWhileVisible(gauge, function(){
      up = !up;
      gauge.classList.toggle('on', up);
    }, 2600);
  })();

  /* reveal bars: replay the stagger on a loop */
  (function(){
    var rev = document.getElementById('revealDemo');
    if (!rev) return;
    var shown = false;
    loopWhileVisible(rev, function(){
      shown = !shown;
      rev.classList.toggle('on', shown);
    }, 2400);
  })();

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

  /* ---------- design directions gallery ---------- */
  (function(){
    var tabs = document.getElementById('lookTabs');
    var note = document.getElementById('lookNote');
    if (!tabs) return;

    var mocks = document.querySelectorAll('.mock');

    var notes = {
      tuner:   '<b>JDM / Tuner.</b> Italic condensed caps, a technical grid, and neon on near-black. Built for shops selling power to people who read spec sheets for fun.',
      luxury:  '<b>Luxury dealer.</b> Champagne on charcoal, an italic serif, and a lot of empty space. Restraint is the whole message — the cars do the talking.',
      classic: '<b>Restoration.</b> Warm paper, oxblood, and a period serif. Feels like a workshop that has been there forty years, because that is what it is selling.',
      detail:  '<b>Detail shop.</b> Bright, glossy, and high contrast, with pill buttons and soft shadows. Clean reads as clean.'
    };

    function show(key){
      mocks.forEach(function(m){ m.classList.toggle('on', m.dataset.look === key); });
      tabs.querySelectorAll('button').forEach(function(b){
        b.setAttribute('aria-selected', b.dataset.look === key ? 'true' : 'false');
      });
      if (note) note.innerHTML = notes[key] || '';
    }

    tabs.addEventListener('click', function(e){
      var b = e.target.closest('button');
      if (!b || !tabs.contains(b)) return;
      show(b.dataset.look);
    });

    // arrow keys move between tabs
    tabs.addEventListener('keydown', function(e){
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var btns = Array.prototype.slice.call(tabs.querySelectorAll('button'));
      var i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      var next = btns[(i + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length];
      next.focus(); show(next.dataset.look); e.preventDefault();
    });

    show('tuner');
  })();

  /* ---------- scroll progress bar ---------- */
  (function(){
    var bar = document.getElementById('progress');
    if (!bar) return;
    var ticking = false;
    function update(){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = Math.min(pct, 100) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function(){
      if (!ticking){ requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
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
