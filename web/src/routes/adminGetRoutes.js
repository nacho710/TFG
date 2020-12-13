const  { Router } = require('express');
const router = Router();

const admin= require('firebase-admin'); //llamar el modulo


const db = admin.database(); //variable de nuestra base de datos

router.get('/', (req, res) =>{ //al visitar la ruta inicial se maneja con una funcion que hace lo que sea
    db.ref('Dietician').once('value', (snapshot)=>{ //consultamos firebase la tabla users 
        const data= snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
        res.render('index', { dietician : data }); //refrescamos la vista de index ahora con esos valores

    })

});

router.get('/delete-dietician/:id', (req,res) => {
    db.ref('Dietician/'+req.params.id).remove();
    res.redirect('/');
});

module.exports = router;