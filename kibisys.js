const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const app = express();
var db=null;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// Sesión
app.use(session({
  secret: 'tu-clave-secreta',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 60 * 1000 } // 30 minutos
}));
// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));
// Middleware para proteger rutas
function authMiddleware(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}
// Rutas de autenticación y API
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Ruta login pública
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
// Ruta principal protegida
app.get('/', authMiddleware, async (req, res) => {       
  res.sendFile(path.join(__dirname, 'public', 'index.html'));   
});
// Puerto
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
