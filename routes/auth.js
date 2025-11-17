const express = require('express');
const router = express.Router();
const getConnection = require('./db_pool.js'); // Importa el módulo de conexión

router.post('/login', async (req, res) => {
  try {
     //recibe parametros de javascript
    let body_json = req.body;           
    const{ username, password } = body_json;  
    // Llamar a la función de conexión con los parámetros
    db= await getConnection(username, password); 
    //console.log('Login exitoso'); 
    req.session.user = username;
    res.redirect('/');   
  } catch (error) {
    console.error('Error:', error);
    //res.json({ success: false, message: 'Credenciales incorrectas' });
    res.redirect('/login?error=1');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;