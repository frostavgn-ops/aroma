document.addEventListener('DOMContentLoaded', function () {

  // 1. Модальные окна (вход и регистрация)
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

  // 2. Слайдер
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
  if (slides.length) setInterval(function () { showSlide(current + 1); }, 5000); // автопрокрутка

  // 3. Фильтры каталога
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
});