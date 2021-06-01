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
                return response.render('./adminViews/indexAdmin');


            }
            else {
                return  response.redirect('noAdminView');
            }
        }
        else {
            return response.redirect('noLoggedView');

        }


}

//SACAR LA VISTA DEL FORMULARIO DE NUEVO DIETISTA POR PARTE DEL ADMIN
function nuevoDietistaView(request, response) {
    var user = firebase.auth().currentUser;
        if (user) {

            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            if (user.email == "personaldiet@admin.es") return response.render('./adminViews/nuevoDietista');
            else  return response.render('noAdminView');
        }
        else {
            return response.render("noLoggedView", {
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
                        //console.log('EAA userdietista'+JSON.stringify(userDietista.uid));
                        db.ref('Dietician/' + userDietista.uid).set({
                            username: request.body.nombre + " " + request.body.apellidos,
                            email: request.body.email,
                            password: request.body.password,
                            phone: request.body.phone,
                            description: request.body.description,
                            status: "Aprobado",
                            worth: "3.5",
                            worthList: {
                                0: "3.5"
                            },
                        });
                        db.ref('Request/Request' + " "+request.body.nombre+ request.body.apellidos).set({
                            idDietician: userDietista.uid,
                            idPatient: 'patient0'
            
                        });
                        db.ref('Dietician').once('value', (snapshot) => { //consultamos en firebase la tabla users 
                            const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                            return response.render('./adminViews/manejarDietistas', { patient: data });

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
                        return response.render('./adminViews/nuevoDietista');

                    });
            }
            else return response.render('noAdminView');
        }
        else {
            return response.render("noLoggedView", {
                msg: null
            });

        }



}

function modificarDietistaView(request, response) {

    var user = firebase.auth().currentUser;
        if (user) {

            if (user.email == "personaldiet@admin.es") {

                var dieticianId = request.params.id;

                // db.ref('/Dietician/' + request.body.id).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                //     const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                //     return response.render('./adminViews/modificarDietista', { dietician: data }); //refrescamos la vista de index ahora con esos valores

                // })
                db.ref('Dietician/' + dieticianId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                    const dataDietician = snapshot.val(); //me devuelve los valores de firebase y los guardamos en dataç

                    console.log('EAA dataDietician ' + JSON.stringify(dataDietician));
                    return response.render('./adminViews/modificarDietista', { dietician: dataDietician,dieticianId:dieticianId }); //refrescamos la vista de index ahora con esos valores
        
                }).catch(function (error) {
                    console.log('EAA ERROR1' + error)
                    return response.render('./adminViews/errorView');
        
                })


            }
            else return response.render('noAdminView');
        }
        else {
            return response.render("noLoggedView", {
                msg: null
            });

        }


}

function modificarDietista(request, response) {
    var user = firebase.auth().currentUser;
        if (user) {
            if (user.email == "personaldiet@admin.es") {
                var dieticianId = request.params.id;
                var dieticianRef = db.ref("Dietician/" + dieticianId);
                if (dieticianRef) {
                    dieticianRef.update({
                        "username": request.body.nombre,
                        "description": request.body.description,
                        "phone": request.body.phone

                    }, (error) => {
                        if (error) {
                          return  response.redirect('./adminViews/errorView');
        
        
                        } else {
                            db.ref('Dietician').once('value', (snapshot) => { //consultamos en firebase la tabla users 
                                const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                                console.log('EAA GETDietician:' + JSON.stringify(snapshot.val()));
                                return response.render('./adminViews/manejarDietistas', { dietician: data }); //refrescamos la vista de index ahora con esos valores
            
                            })
        
                        }
                    });
                }
            }
            else return response.render('noAdminView');
        }
        else {
            return response.render("noLoggedView", {
                msg: null
            });

        }



}

//FUNCION QUE BORRA UN USUARIO DE LA BASE DE DATOS
function borrarDietista(request, response) {

    var user = firebase.auth().currentUser;
        if (user) {


            if (user.email == "personaldiet@admin.es") {

                try {

                    var dieticianId = request.params.id;
                     //recoger todos los pacientes de la lista de pacientes y hacer un foreach que para cada uno de ellos les updatee los datos suyos
                    db.ref('Dietician/' + dieticianId + '/patientsList').on('value', function (snapshot) {
                        snapshot.forEach(function (childSnapshot) {
                            var key = childSnapshot.key;
                            db.ref('Patient/' + key).remove();
                            var patientRef = db.ref("Patient/" + key);
                            patientRef.update({
                                dietId: "null",
                                dieticianId: "null",
                                dieticianValorated: "false"
                            }, (error) => {
                                if (error) {
                                    return response.render('./dieticianViews/errorView');
                                }
                            });
                        });
                    })
        
                   // recoger todas las diets que tenga el dietista y borrarlas
                   db.ref('Diet').orderByChild('dieticianId').equalTo(dieticianId).on('value', function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                        var key = childSnapshot.key;
                        db.ref('Request/' + key).remove();
                    });
                })
                    //recoger todas las request que tenga el dietista y borrarlas
                    db.ref('Request').orderByChild('idDietician').equalTo(dieticianId).on('value', function (snapshot) {
                        snapshot.forEach(function (childSnapshot) {
                            var key = childSnapshot.key;
                            db.ref('Request/' + key).remove();
                        });
                    })
                    //borrar su usuario
                    var email;
                    db.ref('Dietician/' + dieticianId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                        const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                        email = data.email;
                        console.log('EAA dataEmail:' + data.email);
        
                        db.ref('Dietician/' + dieticianId).remove();
                        admin
                            .auth()
                            .getUserByEmail(email)
                            .then((userRecord) => {
                                admin
                                    .auth()
                                    .deleteUser(userRecord.uid)
                                    .then(() => {
                                        console.log('EAA: Successfully deleted user');
                                        return response.redirect('./adminViews/manejarDietistas'); //refrescamos la vista de index ahora con esos valores

                                    })
                                    .catch((error) => {
                                        console.log('EAA: Error deleting user:', error);
                                    });
                            })
                            .catch((error) => {
                                console.log('EAA: Error fetching user data:', error);
                            });
                    });    
                }
                catch (error) {
                    return response.render('./dieticianViews/errorView');
                }
            }


            else {
                return     response.render("noAdminView", {
                    msg: null
                });
            }



        }
        else {
            return   response.render("noLoggedView", {
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
                    return    response.render('./adminViews/estadoDietistas', { dietician: data }); //refrescamos la vista de index ahora con esos valores

                })
            }
            else {
                return   response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            return   response.render("noLoggedView", {
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
                    return  response.render('./adminViews/manejarDietistas', { dietician: data }); //refrescamos la vista de index ahora con esos valores

                })
            }
            else {
                return  response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            return  response.render("noLoggedView", {
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
                        return response.redirect('/manejarDietistas');


                    } else {
                        return  response.redirect('/manejarDietistas');
                    }
                });


            }
            else {
                return  response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            return response.render("noLoggedView", {
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
                        return  response.redirect('/manejarDietistas');


                    } else {
                        return response.redirect('/manejarDietistas');
                    }
                });


            }
            else {
                return response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            return  response.render("noLoggedView", {
                msg: null
            });
        }


}


//SACAR LA VISTA DEL FORMULARIO DE NUEVO PACIENTE POR PARTE DEL ADMIN
function nuevoPacienteView(request, response) {

    var user = firebase.auth().currentUser;
        if (user) {


            if (user.email == "personaldiet@admin.es") {

                return response.render('./adminViews/nuevoPaciente');
            }
            else {
                return  response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            return response.render("noLoggedView", {
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


                        }
                        db.ref('Patient').push(newPatient); //nombre de la tabla --db.ref('Users')
                        db.ref('Patient').once('value', (snapshot) => { //consultamos en firebase la tabla users 
                            const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                            return  response.render('./adminViews/manejarPacientesAdmin', { patient: data }); //refrescamos la vista de index ahora con esos valores

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
                        return  response.render('./adminViews/nuevoPaciente');


                    });
            }
            else {
                return response.render('noAdminView');
            }
        }
        else {
            return response.render('noLoggedView');
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
                    return  response.render('./adminViews/manejarPacientesAdmin', { patient: data }); //refrescamos la vista de index ahora con esos valores

                })
            }
            else {
                return  response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            return  response.render("noLoggedView", {
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
                var dieta;
                var dietista;
                db.ref('Patient/' + userId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                    const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                    email = data.email;
                    dieta=data.dietId;
                    dietista=data.dieticianId;
                    console.log('EAA data:' + data);
                    console.log('EAA dataEmail:' + data.email);
                    db.ref('Diets/' + dieta).remove();
                    db.ref('Dietician/' + dietista+'/patientsList/'+userId).remove();
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
                                return  response.redirect('/manejarPacientesAdmin');
                        })
                        .catch((error) => {
                            console.log('EAA: Error fetching user data:', error);
                        });
                        return  response.redirect('/manejarPacientesAdmin');

                });
            }
            else {
                return response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            return response.render("noLoggedView", {
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
                var userId =user.uid;
                db.ref('Administrador/' + userId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                    const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                    return  response.render('./adminViews/perfilAdmin', { admin: data });
                })
                
            }
            else {
                return  response.render("noAdminView", {
                    msg: null
                });
            }
        }
        else {
            return  response.render("noLoggedView", {
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
