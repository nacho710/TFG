var firebase = require("firebase");
const admin = require('firebase-admin'); //llamar el modulo
const db = admin.database(); //variable de nuestra base de datos
const auth = admin.auth();
let alert = require('alert');
const { response } = require("express");
const { body,validationResult } = require('express-validator');


//SACAR LA VISTA DEL INDEX DEL ADMIN
function indexAdmin(request, response) {

    var user = firebase.auth().currentUser;
        if (user) {


            if (user.email == "personaldiet@admin.es") {
                response.render('./adminViews/indexAdmin');


            }
            else {
                response.redirect('noAdminView');
            }
        }
        else {
            response.redirect('noLoggedView');

        }


}

//SACAR LA VISTA DEL FORMULARIO DE NUEVO DIETISTA POR PARTE DEL ADMIN
function nuevoDietistaView(request, response) {
    var user = firebase.auth().currentUser;
        if (user) {

            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            if (user.email == "personaldiet@admin.es") response.render('./adminViews/nuevoDietista');
            else response.render('noAdminView');
        }
        else {
            response.render("noLoggedView", {
                msg: null
            });

        }


}

//FUNCION QUE AÑADE UN NUEVO DIETISTA TRAS PULSAR EL BOTON DE AÑADIR DIETISTA DEL FORM DEL ADMIN
function nuevoDietista(request, response) {
    var user = firebase.auth().currentUser;
        if (user) {

            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            if (user.email == "personaldiet@admin.es") {
                var email = request.body.email;
                var password = request.body.password;
                admin
                    .auth()
                    .createUser({
                        email: email,
                        password: password,
                    })
                    .then((userDietista) => {
                        var worthStars = 3;
                        //console.log('EAA userdietista'+JSON.stringify(userDietista.uid));
                        db.ref('Dietician/' + userDietista.uid).set({
                            username: request.body.nombre + " " + request.body.apellidos,
                            email: request.body.email,
                            password: request.body.password,
                            phone: request.body.phone,
                            description: request.body.description,
                            status: "Aprobado",
                            worth: worthStars
                        });
                        db.ref('Dietician').once('value', (snapshot) => { //consultamos en firebase la tabla users 
                            const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                            response.render('./adminViews/manejarDietistas', { patient: data }); //refrescamos la vista de index ahora con esos valores

                        })

                    })
                    .catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        var msg;
                        if (errorCode == 'auth/weak-password') {
                            msg = 'La contraseña es demasiado debil-->Tiene que tener más de 6 caracteres.';
                        }
                        else if (errorCode == 'auth/invalid-email') {
                            msg = 'El email que has introducido no es correcto';
                        }
                        else if (errorCode == 'auth/email-already-in-use') {
                            msg = 'El email que has introducido ya está en uso';
                        }
                        else {
                            msg = errorMessage;
                        }
                        alert(msg);
                        response.render('./adminViews/nuevoDietista');

                    });
            }
            else response.render('noAdminView');
        }
        else {
            response.render("noLoggedView", {
                msg: null
            });

        }



}

function modificarDietistaView(request, response) {

    var user = firebase.auth().currentUser;
        if (user) {


            if (user.email == "personaldiet@admin.es") {


                db.ref('/Dietician/' + request.body.id).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                    const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                    response.render('./adminViews/modificarDietista', { dietician: data }); //refrescamos la vista de index ahora con esos valores

                })
            }
            else response.render('noAdminView');
        }
        else {
            response.render("noLoggedView", {
                msg: null
            });

        }


}

function modificarDietista(request, response) {
    var user = firebase.auth().currentUser;
        if (user) {

            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            if (user.email == "personaldiet@admin.es") {
                var email = request.body.email;
                var password = request.body.password;
                admin
                    .auth()
                    .createUser({
                        email: email,
                        password: password,
                    })
                    .then((userDietista) => {
                        console.log('EAA userdietista' + JSON.stringify(userDietista.uid));
                        db.ref('Dietician/' + userDietista.uid).set({
                            username: request.body.nombre + " " + request.body.apellidos,
                            email: request.body.email,
                            password: request.body.password,
                            phone: request.body.phone,
                            description: request.body.description,
                            status: "Aprobado",
                            worth: request.body.worthStars
                        });
                        db.ref('Dietician').once('value', (snapshot) => { //consultamos en firebase la tabla users 
                            const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                            response.render('./adminViews/manejarDietistas', { dietician: data }); //refrescamos la vista de index ahora con esos valores

                        })

                    })
                    .catch((error) => {
                        // alert("ERROR EN createuser:"+error);
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        var msg;
                        if (errorCode == 'auth/weak-password') {
                            msg = 'La contraseña es demasiado debil-->Tiene que tener más de 6 caracteres.';
                        }
                        else if (errorCode == 'auth/invalid-email') {
                            msg = 'El email que has introducido no es correcto';
                        }
                        else if (errorCode == 'auth/email-already-in-use') {
                            msg = 'El email que has introducido ya está en uso';
                        }
                        else {
                            msg = errorMessage;
                        }
                        alert(msg);
                        response.render('./adminViews/nuevoDietista');

                    });
            }
            else response.render('noAdminView');
        }
        else {
            response.render("noLoggedView", {
                msg: null
            });

        }



}

//FUNCION QUE BORRA UN USUARIO DE LA BASE DE DATOS
function borrarDietista(request, response) {

    var user = firebase.auth().currentUser;
        if (user) {


            if (user.email == "personaldiet@admin.es") {

                var userId = request.params.id;
                var email;
                db.ref('Dietician/' + userId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                    const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                    email = data.email;
                    console.log('EAA dataEmail:' + data.email);

                    db.ref('Dietician/' + request.params.id).remove();
                    admin
                        .auth()
                        .getUserByEmail(email)
                        .then((userRecord) => {
                            admin
                                .auth()
                                .deleteUser(userRecord.uid)
                                .then(() => {
                                    console.log('EAA: Successfully deleted user');
                                })
                                .catch((error) => {
                                    console.log('EAA: Error deleting user:', error);
                                });
                            response.redirect('/manejarDietistas');
                            console.log(`EAA: Successfully fetched user data: ${userRecord.toJSON()}`);
                        })
                        .catch((error) => {
                            console.log('EAA: Error fetching user data:', error);
                        });
                    response.redirect('/manejarDietistas');

                });
            }


            else {
                response.render("noAdminView", {
                    msg: null
                });
            }



        }
        else {
            response.render("noLoggedView", {
                msg: null
            });
        }
 
}


//SACAR LA VISTA DE TODOS LOS PACIENTES QUE EXISTEN EN LA BD
function getDietistas(request, response) {


    var user = firebase.auth().currentUser;
        if (user) {


            if (user.email == "personaldiet@admin.es") {

                db.ref('Dietician').once('value', (snapshot) => { //consultamos en firebase la tabla users 
                    const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                    console.log('EAA GETDietician:' + JSON.stringify(snapshot.val()));
                    response.render('./adminViews/estadoDietistas', { dietician: data }); //refrescamos la vista de index ahora con esos valores

                })
            }
            else {
                response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            response.render("noLoggedView", {
                msg: null
            });
        }




}
function getAllDietistas(request, response) {


    var user = firebase.auth().currentUser;
        if (user) {
            

            if (user.email == "personaldiet@admin.es") {

                db.ref('Dietician').once('value', (snapshot) => { //consultamos en firebase la tabla users 
                    const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                    console.log('EAA GETDietician:' + JSON.stringify(snapshot.val()));
                    response.render('./adminViews/manejarDietistas', { dietician: data }); //refrescamos la vista de index ahora con esos valores

                })
            }
            else {
                response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            response.render("noLoggedView", {
                msg: null
            });
        }




}
function modificarEstadoDietistaAprobado(request, response) {

    var user = firebase.auth().currentUser;
        if (user) {


            if (user.email == "personaldiet@admin.es") {
                db.ref('Dietician/' + request.params.id).update({
                    status: 'Aprobado',
                }, (error) => {
                    if (error) {
                        console.group('EAA error modificar estado');
                        response.redirect('/manejarDietistas');


                    } else {
                        response.redirect('/manejarDietistas');
                    }
                });


            }
            else {
                response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            response.render("noLoggedView", {
                msg: null
            });
        }
 
}

function modificarEstadoDietistaDenegado(request, response) {
    var user = firebase.auth().currentUser;
        if (user) {


            if (user.email == "personaldiet@admin.es") {
                db.ref('Dietician/' + request.params.id).update({
                    status: 'Denegado',
                }, (error) => {
                    if (error) {
                        console.group('EAA error modificar estado');
                        response.redirect('/manejarDietistas');


                    } else {
                        response.redirect('/manejarDietistas');
                    }
                });


            }
            else {
                response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            response.render("noLoggedView", {
                msg: null
            });
        }


}


//SACAR LA VISTA DEL FORMULARIO DE NUEVO PACIENTE POR PARTE DEL ADMIN
function nuevoPacienteView(request, response) {

    var user = firebase.auth().currentUser;
        if (user) {


            if (user.email == "personaldiet@admin.es") {

                response.render('./adminViews/nuevoPaciente');
            }
            else {
                response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            response.render("noLoggedView", {
                msg: null
            });
        }



}

//CUANDO SE PULSA EL BOTON DEL FORMULARIO DE AÑADIR NUEVO PACIENTE CREAMOS EL PACIENTE
function nuevoPaciente(request, response) {

    var user = firebase.auth().currentUser;
        if (user) {


            if (user.email == "personaldiet@admin.es") {

                var email = request.body.email;
                var password = request.body.password;
                admin
                    .auth()
                    .createUser({
                        email: email,
                        password: password,
                    })
                    .then(function(user) {
                        const newPatient = {
                            username: request.body.nombre + " " + request.body.apellidos,
                            email: request.body.email,
                            password: request.body.password,
                            phone: request.body.phone,
                            age: request.body.age,
                            weight: request.body.weight,
                            height: request.body.age,
                            userType: '1',


                        }
                        db.ref('Patient').push(newPatient); //nombre de la tabla --db.ref('Users')
                        db.ref('Patient').once('value', (snapshot) => { //consultamos en firebase la tabla users 
                            const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                            response.render('./adminViews/manejarPacientesAdmin', { patient: data }); //refrescamos la vista de index ahora con esos valores

                        })

                    })
                    .catch((error) => {
                        // alert("ERROR EN createuser:"+error);
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        var msg;
                        if (errorCode == 'auth/weak-password') {
                            msg = 'La contraseña es demasiado debil-->Tiene que tener más de 6 caracteres.';
                        }
                        else if (errorCode == 'auth/invalid-email') {
                            msg = 'El email que has introducido no es correcto';
                        }
                        else if (errorCode == 'auth/email-already-in-use') {
                            msg = 'El email que has introducido ya está en uso';
                        }
                        else {
                            msg = errorMessage;
                        }
                        alert(msg);
                        console.log('EAA msg nuevoPaciente: ' + msg);
                        console.log('EAA errorCode nuevoPaciente: ' + errorCode);
                        console.log('EAA errorMessage nuevoPaciente: ' + errorMessage);
                        response.render('./adminViews/nuevoPaciente');


                    });
            }
            else {
                response.render('noAdminView');
            }
        }
        else {
            response.render('noLoggedView');
        }



}

//SACAR LA VISTA DE TODOS LOS PACIENTES QUE EXISTEN EN LA BD
function getPacientesAdmin(request, response) {


    var user = firebase.auth().currentUser;
        if (user) {


            if (user.email == "personaldiet@admin.es") {

                db.ref('Patient').once('value', (snapshot) => { //consultamos en firebase la tabla users 
                    const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                    console.log('EAA GETPACIENTES:' + JSON.stringify(snapshot.val()));
                    response.render('./adminViews/manejarPacientesAdmin', { patient: data }); //refrescamos la vista de index ahora con esos valores

                })
            }
            else {
                response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            response.render("noLoggedView", {
                msg: null
            });
        }



}

//FUNCION PARA ELIMINAR UN PACIENTE EN CUESTIÓN TRAS PULSAR EL BOTON DE BORRAR DEL PACIENTE
function borrarPacientesAdmin(request, response) {


    var user = firebase.auth().currentUser;
        if (user) {


            if (user.email == "personaldiet@admin.es") {

                var userId = request.params.id;
                var email;
                db.ref('Patient/' + userId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                    const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                    email = data.email;
                    console.log('EAA data:' + data);
                    console.log('EAA dataEmail:' + data.email);

                    db.ref('Patient/' + request.params.id).remove();
                    admin
                        .auth()
                        .getUserByEmail(email)
                        .then((userRecord) => {
                            admin
                                .auth()
                                .deleteUser(userRecord.uid)
                                .then(() => {
                                    console.log('EAA: Successfully deleted user');
                                })
                                .catch((error) => {
                                    console.log('EAA: Error deleting user:', error);
                                });
                            response.redirect('/manejarPacientesAdmin');
                            console.log(`EAA: Successfully fetched user data: ${userRecord.toJSON()}`);
                        })
                        .catch((error) => {
                            console.log('EAA: Error fetching user data:', error);
                        });
                    response.redirect('/manejarPacientesAdmin');

                });
            }
            else {
                response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            response.render("noLoggedView", {
                msg: null
            });
        }






}

//SACAR LA VISTA DEL PERFIL DEL ADMIN
function perfilAdmin(request, response) {


    var user = firebase.auth().currentUser;
        if (user) {


            if (user.email == "personaldiet@admin.es") {

                console.log('EAA user: ' + JSON.stringify(user));
                //var statusDietician=getEstadoDietista(user.uid);
                var userId =user.uid;
                // var dataDietician=getDataDietista(user.uid);
                //console.log('EAAinfo: '+JSON.stringify(dataDietician));
                db.ref('Administrador/' + userId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                    const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                    response.render('./adminViews/perfilAdmin', { admin: data });
                })
                
            }
            else {
                response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            response.render("noLoggedView", {
                msg: null
            });
        }



}

module.exports = {
    nuevoDietistaView,
    nuevoDietista,
    borrarDietista,
    getDietistas,
    getAllDietistas,
    modificarDietistaView,
    modificarDietista,
    modificarEstadoDietistaAprobado,
    modificarEstadoDietistaDenegado,
    nuevoPaciente,
    nuevoPacienteView,
    getPacientesAdmin,
    borrarPacientesAdmin,
    perfilAdmin,
    indexAdmin


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
//     .then(function(user) {
//         response.redirect('/');

//     })
//     .catch((error) => {
//         var errorCode = error.code;
//         var errorMessage = error.message;

//     });


// }
