/* Murphy's Productions — hero reveal + contact form */

(function () {
  'use strict';

  /* --- hero reveal ------------------------------------------------ */
  var stage = document.querySelector('.reveal-stage');
  var range = document.getElementById('reveal-range');

  if (stage && range) {
    var setPos = function (value) {
      stage.style.setProperty('--pos', value + '%');
    };

    setPos(range.value);
    range.addEventListener('input', function () { setPos(range.value); });

    // Dragging anywhere on the stage moves the divider.
    var dragging = false;

    var moveTo = function (clientX) {
      var box = stage.getBoundingClientRect();
      var pct = ((clientX - box.left) / box.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      range.value = pct;
      setPos(pct);
    };

    stage.addEventListener('pointerdown', function (e) {
      dragging = true;
      stage.setPointerCapture(e.pointerId);
      moveTo(e.clientX);
    });

    stage.addEventListener('pointermove', function (e) {
      if (dragging) moveTo(e.clientX);
    });

    ['pointerup', 'pointercancel'].forEach(function (evt) {
      stage.addEventListener(evt, function () { dragging = false; });
    });
  }


  /* --- speed demo --------------------------------------------------
     Two lanes fill at different rates when the button is pressed.
     Reduced-motion users get the finished state and the numbers.
  ------------------------------------------------------------------ */
  var runBtn = document.getElementById('speed-run');
  var demo = document.getElementById('speed-demo');

  if (runBtn && demo) {
    var lanes = [
      { el: demo.querySelector('[data-lane="slow"]'), duration: 6400 },
      { el: demo.querySelector('[data-lane="fast"]'), duration: 900 }
    ];
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timers = [];

    var reset = function () {
      timers.forEach(clearTimeout);
      timers = [];
      lanes.forEach(function (lane) {
        lane.el.classList.remove('is-running', 'is-done');
        lane.el.querySelector('.sd-fill').style.height = '0%';
        var t = lane.el.querySelector('[data-time]');
        t.textContent = '\u2014';
        t.removeAttribute('data-done');
      });
    };

    var finish = function (lane) {
      lane.el.classList.remove('is-running');
      lane.el.classList.add('is-done');
      lane.el.querySelector('.sd-fill').style.height = '100%';
      var t = lane.el.querySelector('[data-time]');
      t.textContent = (lane.duration / 1000).toFixed(1) + 's';
      t.setAttribute('data-done', '');
    };

    runBtn.addEventListener('click', function () {
      reset();
      runBtn.disabled = true;
      runBtn.textContent = 'Loading\u2026';

      lanes.forEach(function (lane) {
        if (reduced) { finish(lane); return; }

        lane.el.classList.add('is-running');
        var fill = lane.el.querySelector('.sd-fill');
        var time = lane.el.querySelector('[data-time]');
        var start = performance.now();

        var tick = function (now) {
          var p = Math.min(1, (now - start) / lane.duration);
          fill.style.height = (p * 100) + '%';
          time.textContent = ((now - start) / 1000).toFixed(1) + 's';
          if (p < 1) requestAnimationFrame(tick);
          else finish(lane);
        };
        requestAnimationFrame(tick);
      });

      var longest = Math.max(lanes[0].duration, lanes[1].duration);
      timers.push(setTimeout(function () {
        runBtn.disabled = false;
        runBtn.textContent = 'Run it again';
      }, reduced ? 200 : longest + 150));
    });
  }

  /* --- prep checklist ---------------------------------------------- */
  var prep = document.getElementById('prep-list');
  var prepCount = document.getElementById('prep-count');

  if (prep && prepCount) {
    var boxes = prep.querySelectorAll('input[type="checkbox"]');

    prep.addEventListener('change', function () {
      var done = 0;
      boxes.forEach(function (b) { if (b.checked) done++; });

      if (done === 0) {
        prepCount.textContent = 'Nothing ticked yet.';
      } else if (done === boxes.length) {
        prepCount.textContent = 'All seven ready. You are in unusually good shape \u2014 send the form.';
      } else {
        prepCount.textContent = done + ' of ' + boxes.length + ' ready. That is plenty to start with.';
      }
    });
  }

  /* --- current year ----------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* --- contact form ------------------------------------------------
     Posts to Formspree via fetch so the visitor stays on the page.
     Falls back to a normal form submit if fetch fails.
  ------------------------------------------------------------------ */
  var form = document.getElementById('contact-form');
  var note = document.getElementById('form-note');

  if (form && note) {
    var say = function (message, state) {
      note.textContent = message;
      note.setAttribute('data-state', state);
    };

    form.addEventListener('submit', function (e) {
      var name = form.elements.name;
      var email = form.elements.email;

      name.setAttribute('aria-invalid', 'false');
      email.setAttribute('aria-invalid', 'false');

      if (!name.value.trim()) {
        e.preventDefault();
        name.setAttribute('aria-invalid', 'true');
        name.focus();
        say('Add your name so we know who we\u2019re replying to.', 'error');
        return;
      }

      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) {
        e.preventDefault();
        email.setAttribute('aria-invalid', 'true');
        email.focus();
        say('That email address looks incomplete. Check it and send again.', 'error');
        return;
      }

      // Not configured yet — let the browser submit normally so nothing is lost.
      if (form.action.indexOf('your-form-id') !== -1) return;

      e.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      say('Sending\u2026', 'busy');

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          say('Sent. You\u2019ll hear back within one business day.', 'ok');
        })
        .catch(function () {
          say('That didn\u2019t send. Email hello@murphysproductions.com instead.', 'error');
        })
        .then(function () {
          button.disabled = false;
        });
    });
  }
})();
