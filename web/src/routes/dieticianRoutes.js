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
router.get('/aceptarPaciente/:idPatient',dieticianRouterController.aceptarPaciente);
router.get('/rechazarPaciente/:idPatient',dieticianRouterController.rechazarPaciente);
router.get('/rechazarPacienteAceptado/:idPatient',dieticianRouterController.rechazarPacienteAceptado);
router.get('/nuevaDieta/:idPatient',dieticianRouterController.nuevaDietaView);
router.get('/modificarDieta/:idPatient',dieticianRouterController.modificarDietaView);
router.get('/seguirPaciente/:idPatient',dieticianRouterController.seguirProgreso); 
router.get('/changePassword/:email',dieticianRouterController.cambiarPassword);
router.get('/deregister/:idDietician',dieticianRouterController.darseDeBaja);


//POST
router.post('/nuevaDieta',dieticianRouterController.nuevaDieta);
router.post('/modificarDieta',dieticianRouterController.modificarDieta);




module.exports = router;