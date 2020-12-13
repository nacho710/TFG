const  { Router } = require('express');
const router = Router();

const admin= require('firebase-admin'); //llamar el modulo



const db = admin.database(); //variable de nuestra base de datos



router.post('/new-dietician', (req, res) =>{
    const newDietician ={
        username: req.body.nombre + " " + req.body.apellidos,
        email:  req.body.email,
        phone: req.body.phone,
        worth: "3.5",
        description: req.body.description
    }
    db.ref('Dietician').push(newDietician); //nombre de la tabla --db.ref('Users')
                                    //push(req.body) es para saber que guardar en dicha tabla
    res.redirect('/');
});


module.exports = router;