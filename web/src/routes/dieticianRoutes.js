const  { Router } = require('express');
const router = Router();
const admin= require('firebase-admin'); //llamar el modulo
const db = admin.database(); //variable de nuestra base de datos
const dieticianRouterController= require('../controlers/dieticianRouterController');
const auth = admin.auth();

//GET

router.get('/manejarPacientes',dieticianRouterController.getPacientes);
router.get('/delete-patient/:id',dieticianRouterController.borrarPaciente);
router.get('/perfilDietician',dieticianRouterController.perfilDietician);


//POST


module.exports = router;