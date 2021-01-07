const  { Router } = require('express');
const router = Router();
const admin= require('firebase-admin'); //llamar el modulo
const auth = admin.auth();
const db = admin.database(); //variable de nuestra base de datos
const userRouterController= require('../controlers/userRouterController');


//GET
router.get("/",userRouterController.root);
router.get("/registroView",userRouterController.registroView);
router.get('/login',userRouterController.loginView);
router.get('/logout',userRouterController.logout);


//POST
router.post('/registroDietician',userRouterController.registroDietician);
router.post('/loginUser',userRouterController.loginUser);


module.exports = router;