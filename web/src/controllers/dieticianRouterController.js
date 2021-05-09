var firebase = require("firebase");
const admin = require('firebase-admin'); //llamar el modulo
const db = admin.database(); //variable de nuestra base de datos
const auth = admin.auth();
let alert = require('alert');
const { response } = require("express");

function getEstadoDietista(userId) { //es para que no pueda ver ciertas cosas si no está aprobado

    db.ref('/Dietician/' + userId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
        const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
        console.log('EAA getStatusDietista: ' + data.status);
        return data.status;
    })
}
// function getDataDietista(userId) { //es para que no pueda ver ciertas cosas si no está aprobado

//     db.ref('/Dietician/' + userId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
//         return snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
//     })
// }

function getNombreDietista(userId) { //es para que no pueda ver ciertas cosas si no está aprobado

    db.ref('/Dietician/' + userId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
        const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
        console.log('EAA getNombreDietista: ' + data.username);
        return data.username;
    })
}

//VAMOS A LA VISTA DEL INDEX DEL DIETISTA
function indexDietician(request, response) {

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            response.status(200);

            return response.render('./dieticianViews/indexDietician');

        }
        else {
            return response.redirect('noLoggedView');
        }
    })

}

//VAMOS A LA VISTA DEL PERFIL DEL DIETISTA
function perfilDietician(request, response) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            response.status(200);
            console.log('EAA user: ' + JSON.stringify(user));
            var userId = user.uid;
            db.ref('Dietician/' + userId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                return response.render('./dieticianViews/perfilDietician', { dietician: data });
            })

        }
        else {
            return response.redirect('noLoggedView');
        }
    })



}

//DEVUELVE TODOS LOS PACIENTES QUE EXISTEN EN LA BD
function getPacientes(request, response) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            db.ref('Patient').once('value', (snapshot) => { //consultamos en firebase la tabla users 
                const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                response.status(200);

                return response.render('./dieticianViews/manejarPacientes', { patient: data }); //refrescamos la vista de index ahora con esos valores

            })


        }
        else {
            return response.redirect('noLoggedView');
        }
    })

}



//get LOS PACIENTES QUE REQUIEREN LOS SERVICIOS DEL DIETISTA


function aceptarPacienteView(request, response) {

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            return response.render('./dieticianViews/nuevaDieta');
            // var ref = db.ref('Request');
            // ref.orderByChild('idDietician').equalTo(user.uid).on('child_added', function (snapshot) { //me devuelve cada fila que tiene status aprobado pero sin la clave
            //     // console.log('EAA snapshot: ' + JSON.stringify(snapshot));

            //     db.ref('/Request/' + snapshot.key).once('value', (childSnapshot) => { //consultamos en firebase la tabla users 
            //         // console.log('EAA RequestJSON: ' + JSON.stringify(childSnapshot.val()));
            //         var refPatient = db.ref('Patient');
            //         refPatient.orderByKey().equalTo(childSnapshot.val().idPatient).once('value', (patientSnapshot) => { //me devuelve cada fila que tiene status aprobado pero sin la clave

            //             // console.log('EAA patientSnapshot: ' + JSON.stringify(patientSnapshot));
            //             var data = patientSnapshot.val();
            //             return response.render('./dieticianViews/aceptarPacientes', { patient: data }); //refrescamos la vista de index ahora con esos valores
            //         })
            //         .catch(function(error){
            //             console.log('EAA ERROR3 aceptarPacienteView '+error )
            //             res.sendStatus(500);

            //             return response.render('./dieticianViews/errorView');

            //         })


            //     })
            //     .catch(function(error){
            //         res.sendStatus(500);
            //         console.log('EAA ERROR2 aceptarPacienteView '+error )
            //         return response.render('./dieticianViews/errorView');

            //     })

            // })

        }
        else {
            res.sendStatus(500);
            return response.redirect('noLoggedView');
        }
    }).catch(next)

}

//ACEPTA UN PACIENTE Y ASIGNARLO AL DIETISTA -->QUITAR LA REQUEST Y PONERLE AL USUARIO EN CUESTION UN CAMPO QUE SEA ID DIETISTA Y AL PACIENTE AÑADIRLO A LA LISTA DE PACIENTES
function aceptarPaciente(request, response) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            try {

                var dieticianId = user.uid;
                console.log('EAA request.paramsACCEPT ' + JSON.stringify(request.params));
                console.log('EAA dieticianId ' + JSON.stringify(dieticianId));
                var patientId = request.params.idPatient;
                const patientRef = db.ref("Patient/" + patientId);
                patientRef.update({
                    dieticianId: dieticianId,
                }).then(function () {
                    const dieticianRef = db.ref("Dietician/" + dieticianId + "/patientsList/" + patientId);
                    dieticianRef.set({
                        hasDiet: "false",
                    }).then(function () {
                        db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                            const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en dataç
                            console.log('EAA ' + JSON.stringify(data));
                            response.status(200);

                            return response.render('./dieticianViews/nuevaDieta', { patient: data }); //refrescamos la vista de index ahora con esos valores
                        })
                    }).catch(function (error) {
                        console.log('EAA ERROR2' + error)
                        return response.render('./dieticianViews/errorView');

                    })
                }).catch(function (error) {
                    console.log('EAA ERROR1' + error)
                    return response.render('./dieticianViews/errorView');

                })




            }
            catch (error) {
                console.log('EAA errorTRY ' + error);
                return response.render('./dieticianViews/errorView');

            }
        }
        else {
            return response.redirect('./noLoggedView');
        }
    }).catch(next)

}
//RECHAZAR A UN PACIENTE QUE HA QUERIDO LOS SERVICIOS DE ESTE DIETISTA  -->QUITAR LA REQUEST Y PONERLE AL USUARIO EN CUESTION UN ESTADO QUE SEA RECHAZADO, Y QUE VUELVA A ELEGIR
function rechazarPaciente(request, response) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {


        }
        else {
            return response.redirect('noLoggedView');
        }
    }).catch(next)


}

//DESASIGNAR EL DIETISTA DEL PACIENTE
//BUSCAR LA DIETA QUE TENÍA Y BORRARLA
//BUSCAR EN LA LISTA DE PACIENTES DEL DIETISTA Y QUITAR AL PACIENTE
function rechazarPacienteAceptado(request, response) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {


        }
        else {
            return response.redirect('noLoggedView');
        }
    }).catch(next)
}

function nuevaDietaView(request, response) {

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            return response.render('./dieticianViews/nuevaDieta');


        }
        else {
            return response.redirect('noLoggedView');
        }
    }).catch(next)


}

//PARSEAR TODA EL FORM Y CREAR UNA NUEVA DIETA CON TODOS LOS CAMPOS QUE SE TENGAN, ID DEL USUARIO, ID DEL PACIENTE, Y LAS COMIDAS
function nuevaDieta(request, response) { //LA DIETA SIEMPRE VA A ESTAR ASIGNADA A UN USUARIO

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            response.status(200);


        }
        else {
            return response.redirect('noLoggedView');
        }
    }).catch(next)


}
//LO MISMO QUE ARRIBA PERO UPDATE
function modificarDieta(request, response) {

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            response.status(200);


        }
        else {
            return response.redirect('noLoggedView');
        }
    }).catch(next)


}

function seguirProgreso(request, response) {
    var user = firebase.auth().currentUser;
        if (user) {
            var patientId = request.params.idPatient;
                var dieticianId = user.uid;
                console.log('EAA dieticianId ' + JSON.stringify(dieticianId));
                db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                    const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                    console.log('EAA SEGUIRPROGRESO');
                    console.log(data);
                    console.log('EAAurl ');
                    console.log(request.originalUrl);
                    response.render('./dieticianViews/seguirProgreso', { patient: data }); //refrescamos la vista de index ahora con esos valores

                }).catch(function (error) {
                    console.log('EAA ERROR1' + error)
                    return response.render('./dieticianViews/errorView');

                })

        }
        else {
            response.render("noLoggedView", {
                msg: null
            });
        }

    
}

//BORRAR TODAS LAS DIETAS QUE TIENE EL DIETISTA, RECORRER TODOS LOS USUARIOS Y SI IDDIETICIAN COINCIDE CON EL  DIETISTA, PONER A NULL ESO Y EL IDDIETA,
// Y BORRAR TODAS LAS REQUEST QUE TENGAN SU ID -->FINALMENTE REMOVER EL DIETISTA

function darseDeBaja(request, response) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            try {
               

                        db.ref('Dietician/' + request.params.id).remove();
                        return response.redirect('./dieticianViews/manejarPacientes');

                    
                   
              


            }
            catch (error) {
                console.log('EAA errorTRY ' + error);
                return response.render('./dieticianViews/errorView');
            }
        }
        else
            return response.redirect('../noLoggedView');

    }).catch(next)


}
function cambiarPassword(request, response) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            try {
                console.log('EAAurl ');

                console.log(request.originalUrl);


                //console.log(request);
                var email = request.params.email;
                firebase
                    .auth()
                    .sendPasswordResetEmail(email)
                    .then(function () {
                        return response.render('./dieticianViews/resetPasswordSentDietician', { email: email });
                    })
                    .catch(function (error) {
                        console.log('EAA ERROR RESET PASSWORD ');
                        console.log(error);
                        return response.render('./dieticianViews/errorView');
                    });
            }
            catch (error) {
                console.log('EAA errorTRY ' + error);
                return response.render('./dieticianViews/errorView');
            }
        }
        else
            return response.render('../noLoggedView');

    })
    return response.render('../noLoggedView');

}

module.exports = {
    getPacientes,
    perfilDietician,
    indexDietician,
    aceptarPacienteView,
    aceptarPaciente,
    rechazarPaciente,
    rechazarPacienteAceptado,
    darseDeBaja,
    nuevaDietaView,
    nuevaDieta,
    modificarDieta,
    seguirProgreso,
    cambiarPassword

}