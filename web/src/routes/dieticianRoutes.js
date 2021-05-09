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
router.get('/aceptar-patient/:idPatient',dieticianRouterController.aceptarPaciente);
router.get('/rechazar-patient/:idPatient',dieticianRouterController.rechazarPaciente);
router.get('/rechazar-patient-aceptado/:idPatient',dieticianRouterController.rechazarPacienteAceptado);
router.get('/nuevaDietaView',dieticianRouterController.nuevaDietaView);
router.get('/modify-patient-diet/:idPatient',dieticianRouterController.modificarDieta);
router.get('/track-patient/:idPatient',dieticianRouterController.seguirProgreso); 
router.get('/changePassword/:email',dieticianRouterController.cambiarPassword);
router.get('/deregister/:idDietician',dieticianRouterController.darseDeBaja);


//POST
router.post('/nuevaDieta',dieticianRouterController.nuevaDieta);
router.post('/modify-patient-diet/:idPatient',dieticianRouterController.nuevaDieta);




module.exports = router;