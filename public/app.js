document.addEventListener('DOMContentLoaded', function () {

  // ---------- 1. Модальные окна ----------
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  function openModal(m) { m.style.display = 'flex'; }
  function closeModal(m) { m.style.display = 'none'; }

  document.querySelectorAll('.open-login-btn').forEach(function (b) {
    b.addEventListener('click', function () { closeModal(registerModal); openModal(loginModal); });
  });
  document.querySelectorAll('.open-register-btn').forEach(function (b) {
    b.addEventListener('click', function () { closeModal(loginModal); openModal(registerModal); });
  });
  document.querySelectorAll('.close-btn').forEach(function (b) {
    b.addEventListener('click', function () { closeModal(loginModal); closeModal(registerModal); });
  });
  window.addEventListener('click', function (e) {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === registerModal) closeModal(registerModal);
  });

  // ---------- 2. Слайдер ----------
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  let current = 0;
  function showSlide(i) {
    if (slides.length === 0) return;
    current = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle('active', n === current); });
    dots.forEach(function (d, n) { d.classList.toggle('active', n === current); });
  }
  const prev = document.querySelector('.slider-btn.prev');
  const next = document.querySelector('.slider-btn.next');
  if (prev) prev.addEventListener('click', function () { showSlide(current - 1); });
  if (next) next.addEventListener('click', function () { showSlide(current + 1); });
  dots.forEach(function (d, n) { d.addEventListener('click', function () { showSlide(n); }); });
  if (slides.length) setInterval(function () { showSlide(current + 1); }, 5000);

  // ---------- 3. Фильтры каталога ----------
  const cards = document.querySelectorAll('#catalogCards .card');
  if (cards.length) {
    let gender = 'all';
    function applyFilters() {
      const from = Number(document.getElementById('priceFrom').value) || 0;
      const to = Number(document.getElementById('priceTo').value) || Infinity;
      cards.forEach(function (c) {
        const price = Number(c.dataset.price);
        const ok = (gender === 'all' || c.dataset.gender === gender) && price >= from && price <= to;
        c.style.display = ok ? '' : 'none';
      });
    }
    document.querySelectorAll('[data-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        gender = b.dataset.filter;
        document.querySelectorAll('[data-filter]').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        applyFilters();
      });
    });
    document.getElementById('applyPrice').addEventListener('click', applyFilters);
  }

  // ---------- 4. Формы регистрации и авторизации ----------
  const RE_NAME  = /^[А-Яа-яЁё\s-]+$/;
  const RE_LOGIN = /^[A-Za-z0-9-]+$/;
  const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Собирает значения полей формы в объект (пароли не обрезаем)
  function getData(form) {
    const data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = key.startsWith('password') ? value : value.trim();
    });
    if (form.elements.rules) data.rules = form.elements.rules.checked;
    return data;
  }

  // Выводит ошибки под полями: <span data-for="имя_поля">
  function showErrors(form, errors) {
    form.querySelectorAll('.error-msg').forEach(function (s) { s.textContent = ''; });
    Object.keys(errors).forEach(function (field) {
      const span = form.querySelector('[data-for="' + field + '"]');
      if (span) span.textContent = errors[field];
    });
  }

  function validateRegister(d) {
    const e = {};
    if (!d.name || !RE_NAME.test(d.name)) e.name = 'Имя обязательно: только кириллица, пробел и тире.';
    if (!d.surname || !RE_NAME.test(d.surname)) e.surname = 'Фамилия обязательна: только кириллица, пробел и тире.';
    if (d.patronymic && !RE_NAME.test(d.patronymic)) e.patronymic = 'Отчество: только кириллица, пробел и тире.';
    if (!d.login || !RE_LOGIN.test(d.login)) e.login = 'Логин обязателен: только латиница, цифры и тире.';
    if (!d.email || !RE_EMAIL.test(d.email)) e.email = 'Введите корректный email.';
    if (!d.password || d.password.length < 6) e.password = 'Пароль не короче 6 символов.';
    if (!d.password_repeat || d.password !== d.password_repeat) e.password_repeat = 'Пароли не совпадают.';
    if (!d.rules) e.rules = 'Необходимо согласие с правилами.';
    return e;
  }

  function sendJson(url, data) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const regOk = document.getElementById('regSuccess');
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();                       // страница не перезагружается
      regOk.style.display = 'none';
      const data = getData(registerForm);
      const errors = validateRegister(data);
      showErrors(registerForm, errors);
      if (Object.keys(errors).length > 0) return;

      sendJson('/api/register', data).then(function (res) {
        if (res.success) {
          regOk.textContent = res.message;
          regOk.style.display = 'block';
          registerForm.reset();
        } else {
          showErrors(registerForm, res.errors || {});   // ошибки сервера (занятый логин и т.д.)
        }
      }).catch(function () {
        showErrors(registerForm, { rules: 'Нет связи с сервером.' });
      });
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const loginErr = document.getElementById('loginGlobalError');
    const loginOk = document.getElementById('loginSuccess');
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      loginErr.textContent = '';
      loginOk.style.display = 'none';
      const data = getData(loginForm);
      const errors = {};
      if (!data.login) errors.login = 'Введите логин.';
      if (!data.password) errors.password = 'Введите пароль.';
      showErrors(loginForm, errors);
      if (Object.keys(errors).length > 0) return;

      sendJson('/api/login', data).then(function (res) {
        if (res.success) {
          loginOk.textContent = res.message;
          loginOk.style.display = 'block';
          loginForm.reset();
        } else {
          loginErr.textContent = res.message;
        }
      }).catch(function () {
        loginErr.textContent = 'Нет связи с сервером.';
      });
    });
  }
});