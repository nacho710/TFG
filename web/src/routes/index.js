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

router.get('/', (req, res) =>{ //al visitar la ruta inicial se maneja con una funcion que hace lo que sea
    db.ref('Users').once('value', (snapshot)=>{ //consultamos firebase la tabla users 
        const data= snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
        res.render('index', { users : data }); //refrescamos la vista de index ahora con esos valores

    })

});

router.post('/new-user', (req, res) =>{
    const newUser ={
        username: req.body.nombre + " " + req.body.apellidos,
        email:  req.body.email,
        phone: req.body.phone
    }
    db.ref('Users').push(newUser); //nombre de la tabla --db.ref('Users')
                                    //push(req.body) es para saber que guardar en dicha tabla
    res.redirect('/');
});

router.get('/delete-user/:id', (req,res) => {
    db.ref('Users/'+req.params.id).remove();
    res.redirect('/');
});

module.exports = router;