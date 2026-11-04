(function () {
  'use strict';
  var WA_NUMBER = '919789605915';
  var $ = function (s, r) { return (r || document).querySelector(s); };

  // Sticky nav shadow + back-to-top
  var nav = $('#nav'), topBtn = $('#top');
  function onScroll() {
    nav.classList.toggle('stuck', window.scrollY > 10);
    topBtn.classList.toggle('show', window.scrollY > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // Mobile menu
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Scroll reveal
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  $('#year').textContent = new Date().getFullYear();

  // Date: no past dates
  var dateInput = $('#pdate');
  var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  dateInput.min = t.toISOString().slice(0, 10);

  // Validation helpers
  function setErr(field, msg) {
    var wrap = field.closest('.f'), out = wrap.querySelector('.err');
    wrap.classList.toggle('bad', !!msg);
    if (out) out.textContent = msg || '';
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  function check(field) {
    var v = field.value.trim();
    if (field.required && !v) return setErr(field, 'This field is required.');
    if (field.type === 'tel' && !/^\+?[0-9][0-9\s-]{7,14}$/.test(v)) return setErr(field, 'Enter a valid phone number.');
    if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setErr(field, 'Enter a valid email address.');
    if (field.type === 'date' && v && v < field.min) return setErr(field, 'Choose today or a later date.');
    return setErr(field, '');
  }
  function validate(form) {
    var ok = true, first = null;
    form.querySelectorAll('input,select,textarea').forEach(function (f) {
      if (!check(f)) { ok = false; first = first || f; }
    });
    if (first) first.focus();
    return ok;
  }
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('blur', function (e) { if (e.target.matches('input,select,textarea')) check(e.target); }, true);
  });
  function waLink(text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); }

  // Appointment form (frontend demo: hands the request to WhatsApp)
  var appt = $('#apptForm'), ok = $('#apptOk');
  appt.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate(appt)) return;
    var d = new FormData(appt);
    var text = 'Appointment request\n' +
      'Name: ' + d.get('name') + '\nPhone: ' + d.get('phone') +
      (d.get('email') ? '\nEmail: ' + d.get('email') : '') +
      '\nDepartment: ' + d.get('dept') + '\nPreferred date: ' + d.get('date') +
      '\nPreferred time: ' + d.get('time') + (d.get('msg') ? '\nMessage: ' + d.get('msg') : '');
    var link = waLink(text);
    ok.hidden = false;
    ok.innerHTML = '<b>Request ready, not yet sent.</b> No appointment is booked until the hospital confirms. ' +
      '<a href="' + link + '" target="_blank" rel="noopener">Send it on WhatsApp</a> or call ' +
      '<a href="tel:+914522418183">+91 452 241 8183</a>.';
    ok.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    window.open(link, '_blank', 'noopener');
  });

  // Contact form
  var cf = $('#contactForm');
  cf.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate(cf)) return;
    var text = 'Message from website\nName: ' + $('#cname').value.trim() +
      '\nPhone: ' + $('#cphone').value.trim() + '\n' + $('#cmsg').value.trim();
    window.open(waLink(text), '_blank', 'noopener');
    cf.reset();
  });
})();
