const  { Router } = require('express');
const router = Router();
const admin= require('firebase-admin'); //llamar el modulo
const auth = admin.auth();
const db = admin.database(); //variable de nuestra base de datos
const userRouterController= require('../controllers/userRouterController');


//GET
router.get("/",userRouterController.root);
router.get("/noLoggedView",userRouterController.noLoggedView);
router.get("/registroView",userRouterController.registroView);
router.get('/login',userRouterController.loginView);
router.get('/logout',userRouterController.logout);
router.get("/resetPasswordView",userRouterController.resetPasswordView);


//POST
router.post('/registroDietician',userRouterController.registroDietician);
router.post('/loginUser',userRouterController.loginUser);
router.post('/resetPassword',userRouterController.resetPassword);


module.exports = router;