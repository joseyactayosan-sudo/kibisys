const express = require('express');
const router = express.Router();
const fs = require('fs').promises;

const misFunctions = require('./misFunctions.js');


const users = [
  { id: 1, nombre: 'Juan', email: 'juan@mail.com' },
  { id: 2, nombre: 'Ana', email: 'ana@mail.com' },
  { id: 3, nombre: 'Luis', email: 'luis@mail.com' }
];


// Middleware para proteger API
function authApiMiddleware(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'No autorizado' });
  }
}

router.get('/users', authApiMiddleware, (req, res) => {   
     res.json(users);    
});


router.get('/tree', authApiMiddleware, async (req, res) => {   
     //const usenam=req.session.user;        
     try {  
           let ModuleLinks = await misFunctions.get_variables(req.session.user);
               ModuleLinks['user']= req.session.user;           
           res.json(ModuleLinks); 
         } catch (error) {
           console.log( 'Error al consultar', error );
           res.json([{error:error}]); 
         }        
});

router.get('/render_filtro', authApiMiddleware, async (req, res) => { 
  const {param_mod,param_file} =req.query;
  let param_serlca={}
  if (param_mod != 'null' && param_file !='undefined'){
    const misFunctionsDAO = require('./DAO/' + param_file + '_DAO.js');
    if ( typeof misFunctionsDAO.f_doc_valida_DAO === 'function') {
      param_serlca=await misFunctionsDAO.f_doc_valida_DAO(param_mod,param_file, req.session.user);    
    }
  }
  
  const fechaNow = new Date();
  let dia = fechaNow.getDate();
  let mes = fechaNow.getMonth() + 1; // Se suma 1 porque los meses empiezan en 0
  const anio = fechaNow.getFullYear();
// Añadir un 0 delante si el día es menor a 10
  if (dia < 10) {  dia = '0' + dia;}
// Añadir un 0 delante si el mes es menor a 10
  if (mes < 10) {  mes = '0' + mes;}

  const fec_ini = `${anio}-${mes}-${dia}`;
  const anoini= anio - 30;
  const anofin= anio + 5;
  let param_anio = '';   
  for (let anio_t = anofin; anio_t >= anoini; anio_t--) {   
    let opt_selected = ( anio_t == anio )? 'selected ': '';
    param_anio += '<option '  + opt_selected + 'value="' + anio_t +'">' + anio_t + '</option>';    
  }
 
 try { 
 const render_filtro={
       default_value : {param_anio:anio,param_mess:mes},
       param_anio : param_anio,
       param_mess : {1:'Enero', 2:'Febrero', 3:'Marzo',4:'Abril',5:'Mayo',6:'Junio', 7:'Julio',8:'Agosto',9:'Septiembre',10:'Octubre',11:'Noviembre',12:'Diciembre' },
       fec_ini    : fec_ini, 
       serlca     : param_serlca.data              
                    }

                  
     res.json(render_filtro); 
    } catch (error) {
      console.log( 'Error al consultar', error );
      res.json([{error:error}]); 
    }  
 });

router.get('/select_gGeneral', authApiMiddleware, async (req, res) => {   
  try {
        const {opcion, param_find} = req.query;    
        const misFunctionsDAO = require('./DAO/' + opcion + '_DAO.js');
 //   console.log('api select_gGeneral', opcion);    
        const respuesta = await misFunctionsDAO.f_select_gGeneral(  param_find);
        res.json(respuesta); 
      } catch (error) {
        res.json([{error:error}]); 
      }
});

router.get('/genera_field_sql', authApiMiddleware, async (req, res) => {  
  const {opcion } = req.query;     
  const misFunctionsDAO = require('./DAO/' + opcion + '_DAO.js');     
  try {
      const respuesta = await misFunctionsDAO.f_genera_field_sql();
      res.json(respuesta); 
  } catch (error) {
      console.log( 'Error al consultar', error );
      res.json([{error:error}]); 
  }
});

router.post('/genera_field_list', authApiMiddleware, async (req, res) => {  
  const {opcion } = req.body;     
  const misFunctionsDAO = require('./DAO/' + opcion + '_DAO.js');      
  try {
      const respuesta = await misFunctionsDAO.f_genera_field_list();  
      res.json(respuesta);       
  } catch (error) {
      console.log( 'Error al consultar', error );
      res.json([{error:error}]); 
  }
});

router.get('/get_detalle', authApiMiddleware, async (req, res) => {     
  try {
        const {opcion, key_unica } = req.query;   
        const misFunctionsDAO = require('./DAO/' + opcion + '_DAO.js');     
// console.log('api get_detalle',req.query);        
        const respuesta = await misFunctionsDAO.f_get_detalle(key_unica);
        res.json(respuesta); 
      } catch (error) {
          console.log( 'Error al consultar', error );
          res.json([{error:error}]); 
      }
});

// SELECT: 
router.post('/post_select', authApiMiddleware, async (req, res) => { 
  try {       
      const result = await misFunctions.f_SELECT(req.body);
   
    if (result.ok) {
      res.json(result);
    } else {
      // Errores controlados (de negocio o validación)
      res.status(400).json(result);
    }
    
  } catch (error) {
    // Errores inesperados del sistema
    console.error('Error inesperado:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// UPDATE: 
router.put('/put_setfield', authApiMiddleware, async (req, res) => {
  try {

    const result = await misFunctions.f_UPD(req.body);
    
    if (result.ok) {
      res.json(result);
    } else {
      // Errores controlados (de negocio o validación)
      res.status(400).json(result);
    }
    
  } catch (error) {
    // Errores inesperados del sistema
    console.error('Error inesperado:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// ADD: 
router.post('/add_setfield', authApiMiddleware, async (req, res) => {
  try {

    const result = await misFunctions.f_ADD(req.body);
    
    if (result.ok) {
      res.json(result);
    } else {
      // Errores controlados (de negocio o validación)
      res.status(400).json(result);
    }
    
  } catch (error) {
    // Errores inesperados del sistema
    console.error('Error inesperado:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// get modal html
router.get('/msg_modal', authApiMiddleware, async (req, res) => {  
  try {  
     let path_alter=__dirname;                             
     path_alter=path_alter.replace('routes', '');          
     const modalContent = await fs.readFile(path_alter + 'public/includes/mensaje_modal.html', 'utf8' );
     res.json(modalContent); 
  } catch (error) {
      console.error('Error al obtener datos API:', error);
      res.status(500).json({ error: 'Error al obtener datos API' });
  } 
});

// get dealle html
router.get('/modalDetalle', authApiMiddleware, async (req, res) => {  
  try { 
    const filename =req.query.filename;
    let path_alter=__dirname;                             
    path_alter=path_alter.replace('routes', '');          
    // const modalContent = await fs.readFile(path_alter + 'public/includes/mensaje_modal.html', 'utf8' );
     const modalContent = await fs.readFile(path_alter + 'public/' + filename + '.html', 'utf8' );
     res.json(modalContent); 
  } catch (error) {
      console.error('Error al obtener datos API:', error);
      res.status(500).json({ error: 'Error al obtener datos API' });
  } 
});

router.get('/last_row', authApiMiddleware, async (req, res) => {   
 // console.log('router', req.query);
  const {opcion} = req.query;    
  const misFunctionsDAO = require('./DAO/' + opcion + '_DAO.js');
   try {
    const respuesta = await misFunctionsDAO.f_get_lastrow();  
    res.json(respuesta); 
  } catch (error) {      
    res.json([{error:error}]); 
  }
});

router.get('/get_ct3a01_h', authApiMiddleware, async (req, res) => {   
   try {
    const respuesta = await misFunctions.f_ct3a01_h();  
    res.json(respuesta); 
  } catch (error) {      
    res.json([{error:error}]); 
  }
});

router.get('/doc_selected', authApiMiddleware, async (req, res) => {   
  try {
      const {opcion} = req.query;    
      const misFunctionsDAO = require('./DAO/' + opcion + '_DAO.js');
      const respuesta = await misFunctionsDAO.f_doc_selected();
      res.json(respuesta); 
    } catch (error) {
      res.json([{error:error}]); 
    }
});

module.exports = router;

/*

        // Lee el contenido de los archivos
        const indexContent = await fs.readFile('./index.html', 'utf8');
        const modalContent = await fs.readFile('./includes/mensaje_modal.html', 'utf8');
        // Reemplaza una marca en index.html con el contenido del modal
        const finalContent = indexContent.replace('<!-- MODAL_CONTENT -->', modalContent);
    console.log( 'modelo',modalContent);   
        res.send(finalContent);

       // res.sendFile(path.join(__dirname, 'public', 'index.html'));   
*/