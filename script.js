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
