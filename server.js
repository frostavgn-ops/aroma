const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

// Товары (позже их можно заменить на базу данных)
const products = [
  { name: 'Blue Night',    gender: 'm', price: 4900, cls: 'c1', isNew: true },
  { name: 'Rose Garden',   gender: 'w', price: 5600, cls: 'c2', isNew: true },
  { name: 'Dark Wood',     gender: 'm', price: 6300, cls: 'c3', isNew: false },
  { name: 'White Lily',    gender: 'w', price: 5200, cls: 'c4', isNew: false },
  { name: 'Ocean Breeze',  gender: 'm', price: 4200, cls: 'c5', isNew: true },
  { name: 'Sweet Vanilla', gender: 'w', price: 4700, cls: 'c6', isNew: false }
];

app.get('/', (req, res) => res.render('index', { products: products.filter(p => p.isNew) }));
app.get('/catalog', (req, res) => res.render('catalog', { products }));
app.get('/contacts', (req, res) => res.render('contacts'));

// ---------- Пользователи (хранятся в памяти, пока сервер запущен) ----------
const users = [];

const RE_NAME  = /^[А-Яа-яЁё\s-]+$/;
const RE_LOGIN = /^[A-Za-z0-9-]+$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

app.post('/api/register', (req, res) => {
  const { name, surname, patronymic, login, email, password, password_repeat, rules } = req.body;
  const errors = {};

  if (!name || !RE_NAME.test(name)) errors.name = 'Имя обязательно: только кириллица, пробел и тире.';
  if (!surname || !RE_NAME.test(surname)) errors.surname = 'Фамилия обязательна: только кириллица, пробел и тире.';
  if (patronymic && !RE_NAME.test(patronymic)) errors.patronymic = 'Отчество: только кириллица, пробел и тире.';
  if (!login || !RE_LOGIN.test(login)) errors.login = 'Логин обязателен: только латиница, цифры и тире.';
  if (!email || !RE_EMAIL.test(email)) errors.email = 'Введите корректный email.';
  if (!password || password.length < 6) errors.password = 'Пароль не короче 6 символов.';
  if (!password_repeat || password !== password_repeat) errors.password_repeat = 'Пароли не совпадают.';
  if (rules !== true) errors.rules = 'Необходимо согласие с правилами.';

  // Уникальность логина и email
  if (!errors.login && users.some(u => u.login.toLowerCase() === login.toLowerCase())) {
    errors.login = 'Этот логин уже занят.';
  }
  if (!errors.email && users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    errors.email = 'Этот email уже зарегистрирован.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  users.push({ name, surname, patronymic: patronymic || '', login, email, salt, hash: hashPassword(password, salt) });
  console.log('Зарегистрирован пользователь:', login);
  res.json({ success: true, message: 'Регистрация прошла успешно!' });
});

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;
  const user = users.find(u => u.login === login);

  if (!user || hashPassword(password || '', user.salt) !== user.hash) {
    return res.status(400).json({ success: false, message: 'Неверный логин или пароль.' });
  }
  res.json({ success: true, message: 'Успешная авторизация!' });
});

app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));