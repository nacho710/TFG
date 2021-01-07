const  { Router } = require('express');
const router = Router();
const admin= require('firebase-admin'); //llamar el modulo

//cadena de conexion a firebase

// admin.initializeApp({
//     credential:admin.credential.applicationDefault(), //asi y con la variable de entorno es mas seguro README.MD
//     databaseUrl: 'https://tfg-bed5d.firebaseio.com/'
// });

var serviceAccount = require("../../../tfg-bed5d-firebase-adminsdk-sz3gp-e7ab447d01.json"); 
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://tfg-bed5d.firebaseio.com"
  });

const db = admin.database(); //variable de nuestra base de datos



module.exports = router;