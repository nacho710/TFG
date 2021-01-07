var firebase = require("firebase");
const admin = require('firebase-admin'); //llamar el modulo
const db = admin.database(); //variable de nuestra base de datos
const auth = admin.auth();


function nuevoDietistaView(request, response) {
    response.render('./adminViews/nuevoDietista');


}
function nuevoDietista(request, response) {


    const newDietician = {
        username: request.body.nombre + " " + request.body.apellidos,
        email: request.body.email,
        phone: request.body.phone,
        description: request.body.description,
        rol: "dietista",
        status: "Aprobado",
        worth: request.body.worthStars
    }
    db.ref('Dietician').push(newDietician); //nombre de la tabla --db.ref('Users')
    //push(req.body) es para saber que guardar en dicha tabla
    response.redirect('/manejarDietistas');


}

function borrarDietista(request, response) {
    db.ref('Dietician/' + request.params.id).remove();
    response.redirect('/manejarDietistas');


}



function getDietistas(request, response) {
    db.ref('Dietician').once('value', (snapshot) => { //consultamos en firebase la tabla users 
        const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
        response.render('./adminViews/manejarDietistas', { dietician: data }); //refrescamos la vista de index ahora con esos valores

    })


}

function nuevoPacienteView(request, response) {
    response.render('./adminViews/nuevoPaciente');


}
function nuevoPaciente(request, response) {


    const newPatient = {
        username: request.body.nombre + " " + request.body.apellidos,
        email: request.body.email,
        phone: request.body.phone,
        description: request.body.description,
        rol: "dietista",
        status: "Aprobado",
        worth: "3.5"
    }
    db.ref('Dietician').push(newDietician); //nombre de la tabla --db.ref('Users')
    //push(req.body) es para saber que guardar en dicha tabla
    response.redirect('/');


}
function getPacientesAdmin(request, response) {
    db.ref('Patient').once('value', (snapshot) => { //consultamos en firebase la tabla users 
        const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
        response.render('./adminViews/manejarPacientesAdmin', { patient: data }); //refrescamos la vista de index ahora con esos valores

    })


}
function borrarPacientesAdmin(request, response) {
    db.ref('Dietician/' + request.params.id).remove();
    response.redirect('/manejarDietistas');


}

function perfilAdmin(request, response) {
    response.render('./adminViews/perfilAdmin');


}

module.exports = {
    nuevoDietistaView,
    nuevoDietista,
    borrarDietista,
    getDietistas,
    nuevoPaciente,
    nuevoPacienteView,
    getPacientesAdmin,
    borrarPacientesAdmin,
    perfilAdmin,


}


//CREAR ADMIN CON CODIGO
// function registroDietician(request, response){
//     const newAdministrador ={
//         username: "Administrador Personal Diet",
//         email:  "personaldiet@admin.es",
//         password: "administrador"
//     }
//     db.ref('Administrador').push(newAdministrador); //nombre de la tabla --db.ref('Users')
//                                     //push(req.body) es para saber que guardar en dicha tabla
//     var email="personaldiet@admin.es";
//     var password="admin";
//     firebase.auth().createUserWithEmailAndPassword(email, password)
//     .then((user) => {
//         response.redirect('/');

//     })
//     .catch((error) => {
//         var errorCode = error.code;
//         var errorMessage = error.message;

//     });


// }
