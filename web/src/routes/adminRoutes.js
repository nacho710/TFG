const  { Router } = require('express');
const router = Router();
const admin= require('firebase-admin'); //llamar el modulo
const db = admin.database(); //variable de nuestra base de datos
const adminRouterController= require('../controlers/adminRouterController');
const auth = admin.auth();

//GET ADMIN
router.get('/perfilAdmin',adminRouterController.perfilAdmin);

//GET DIETISTAS
router.get('/delete-dietician/:id',adminRouterController.borrarDietista);
router.get('/manejarDietistas',adminRouterController.getDietistas);
router.get('/nuevoDietistaView',adminRouterController.nuevoDietistaView);

//GET PACIENTES
router.get('/nuevoPacienteView',adminRouterController.nuevoPacienteView);
router.get('/manejarPacientesAdmin',adminRouterController.getPacientesAdmin);
router.get('/delete-patient-admin/:id',adminRouterController.borrarPacientesAdmin);




//POST DIETISTAS
router.post('/nuevoDietista',adminRouterController.nuevoDietista);

//POST PACIENTES

router.post('/nuevoPaciente',adminRouterController.nuevoPaciente);



module.exports = router;