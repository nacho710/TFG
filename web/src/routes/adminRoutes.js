const  { Router } = require('express');
const router = Router();
const admin= require('firebase-admin'); //llamar el modulo
const db = admin.database(); //variable de nuestra base de datos
const adminRouterController= require('../controllers/adminRouterController');
const auth = admin.auth();

//GET ADMIN
router.get('/perfilAdmin',adminRouterController.perfilAdmin);
router.get('/indexAdmin',adminRouterController.indexAdmin);


//GET DIETISTAS
router.get('/delete-dietician/:id',adminRouterController.borrarDietista);
router.get('/modify-dietician/:id',adminRouterController.modificarDietistaView);
router.get('/modify-dietician-stateAprobado/:id',adminRouterController.modificarEstadoDietistaAprobado);
router.get('/modify-dietician-stateDenegado/:id',adminRouterController.modificarEstadoDietistaDenegado);
router.get('/estadoDietistas',adminRouterController.getDietistas);
router.get('/manejarDietistas',adminRouterController.getAllDietistas);
router.get('/nuevoDietistaView',adminRouterController.nuevoDietistaView);

//GET PACIENTES
router.get('/nuevoPacienteView',adminRouterController.nuevoPacienteView);
router.get('/manejarPacientesAdmin',adminRouterController.getPacientesAdmin);
router.get('/delete-patient-admin/:id',adminRouterController.borrarPacientesAdmin);

//POST DIETISTAS
router.post('/nuevoDietista',adminRouterController.nuevoDietista);
router.post('/modificarDietista/:id',adminRouterController.modificarDietista);

//POST PACIENTES

router.post('/nuevoPaciente',adminRouterController.nuevoPaciente);



module.exports = router;