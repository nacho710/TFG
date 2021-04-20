const  { Router } = require('express');
const router = Router();
const admin= require('firebase-admin'); //llamar el modulo
const db = admin.database(); //variable de nuestra base de datos
const dieticianRouterController= require('../controllers/dieticianRouterController');
const auth = admin.auth();

//GET
router.get('/indexDietician',dieticianRouterController.indexDietician);
router.get('/perfilDietician',dieticianRouterController.perfilDietician);
router.get('/manejarPacientes',dieticianRouterController.getPacientes);
router.get('/aceptarPacienteView',dieticianRouterController.aceptarPacienteView);
router.get('/aceptar-patient/:id',dieticianRouterController.aceptarPaciente);
router.get('/rechazar-patient/:id',dieticianRouterController.rechazarPaciente);
router.get('/rechazar-patient-aceptado/:id',dieticianRouterController.rechazarPacienteAceptado);
router.get('/delete-dietician/:id',dieticianRouterController.darseDeBaja);
router.get('/nuevaDietaView',dieticianRouterController.nuevaDietaView);



//POST
router.post('/nuevaDieta',dieticianRouterController.nuevaDieta);




module.exports = router;