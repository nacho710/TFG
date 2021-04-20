var firebase = require("firebase");
const admin = require('firebase-admin'); //llamar el modulo
const db = admin.database(); //variable de nuestra base de datos
const auth = admin.auth();
let alert = require('alert');


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

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            response.render('./dieticianViews/indexDietician');
        }
        else {
            response.redirect('noLoggedView');
        }
    })

}

//VAMOS A LA VISTA DEL PERFIL DEL DIETISTA
function perfilDietician(request, response) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('EAA user: ' + JSON.stringify(user));
            //var statusDietician=getEstadoDietista(user.uid);
            var userId = user.uid;
            // var dataDietician=getDataDietista(user.uid);
            //console.log('EAAinfo: '+JSON.stringify(dataDietician));
            db.ref('Dietician/' + userId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                response.render('./dieticianViews/perfilDietician', { dietician: data });
            })



        }
        else {
            response.redirect('noLoggedView');
        }
    })



}

//DEVUELVE TODOS LOS PACIENTES QUE EXISTEN EN LA BD
function getPacientes(request, response) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            db.ref('Patient').once('value', (snapshot) => { //consultamos en firebase la tabla users 
                const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                response.render('./dieticianViews/manejarPacientes', { patient: data }); //refrescamos la vista de index ahora con esos valores

            })
        }
        else {
            response.redirect('noLoggedView');
        }
    })

}



//get LOS PACIENTES QUE REQUIEREN LOS SERVICIOS DEL DIETISTA
function aceptarPacienteView(request, response) {

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {

            var ref = db.ref("Request");
            ref.orderByChild("idDietician").equalTo(user.uid).on("child_added", function (snapshot) { //me devuelve cada fila que tiene status aprobado pero sin la clave
                // console.log('EAA snapshot: ' + JSON.stringify(snapshot));

                db.ref('/Request/' + snapshot.key).once('value', (childSnapshot) => { //consultamos en firebase la tabla users 
                    // console.log('EAA RequestJSON: ' + JSON.stringify(childSnapshot.val()));
                    var refPatient = db.ref("Patient");
                    refPatient.orderByKey().equalTo(childSnapshot.val().idPatient).once('value', (patientSnapshot) => { //me devuelve cada fila que tiene status aprobado pero sin la clave

                        // console.log('EAA patientSnapshot: ' + JSON.stringify(patientSnapshot));
                        const data = patientSnapshot.val();
                        response.render('./dieticianViews/aceptarPacientes', { patient: data }); //refrescamos la vista de index ahora con esos valores
                    })


                })
            });
        }
        else {
            response.redirect('noLoggedView');
        }
    })



}

//ACEPTA UN PACIENTE Y ASIGNARLO AL DIETISTA -->QUITAR LA REQUEST Y PONERLE AL USUARIO EN CUESTION UN CAMPO QUE SEA ID DIETISTA Y AL PACIENTE AÑADIRLO A LA LISTA DE PACIENTES
function aceptarPaciente(request, response) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {

            try {


                console.log('EAA request.paramsACCEPT ' + JSON.stringify(request.params));
                console.log('EAA dieticianId ' + JSON.stringify(dieticianId));
                var patientId = request.params.id;
                var patientRef = db.ref("Patient/" + patientId);
                patientRef.update({
                    dieticianId: dieticianId,
                }, (error) => {
                    console.group('EAA error insertpatient '+error);
                    response.redirect('./dieticianViews/errorView');



                });

                var dieticianId = user.uid;
                var dieticianRef = db.ref("Dietician/" + dieticianId + "/patientsList/" + patientId);
                dieticianRef.set({
                    hasDiet: "false",
                }, (error) => {
                    console.group('EAA error insertdietician '+error);
                    response.render('../dieticianViews/errorView');



                });
               

                db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                    const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en dataç
                    console.log('EAA ' + JSON.stringify(data));
                    response.render('./dieticianViews/nuevaDieta', { dietician: data }); //refrescamos la vista de index ahora con esos valores

                }, (error) => {
                    console.group('EAA error render data '+error);
                    response.render('../dieticianViews/errorView');



                });


            }
            catch (error) {
                console.error('error ' + error);
                response.render('../dieticianViews/errorView');

            }
        }
        else {
            response.redirect('noLoggedView');
        }
    })

}

//RECHAZAR A UN PACIENTE QUE HA QUERIDO LOS SERVICIOS DE ESTE DIETISTA  -->QUITAR LA REQUEST Y PONERLE AL USUARIO EN CUESTION UN ESTADO QUE SEA RECHAZADO, Y QUE VUELVA A ELEGIR
function rechazarPaciente(request, response) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {


        }
        else {
            response.redirect('noLoggedView');
        }
    })


}

//RECHAZAR A UN PACIENTE QUE EL DIETISTA YA TENIA ACEPTADO -->PONERLE AL USUARIO EN CUESTION UN ESTADO QUE SEA RECHAZADO, Y QUE VUELVA A ELEGIR
function rechazarPacienteAceptado(request, response) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {


        }
        else {
            response.redirect('noLoggedView');
        }
    })
}

//EL DIETISTA SE DA DE BAJA Y SE BORRA DE TODOS LOS USUARIOS, Y TODAS SUS DIETAS SE BORRAN, Y TODOS LOS USUARIOS SE QUEDAN SIN DIETAS
function darseDeBaja(request, response) {

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {

            db.ref('Patient/' + request.params.id).remove();
            response.redirect('./dieticianViews/manejarPacientes');

        }
        else {
            response.redirect('noLoggedView');
        }
    })


}

function nuevaDietaView(request, response) {

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {

            response.redirect('./dieticianViews/nuevaDieta');


        }
        else {
            response.redirect('noLoggedView');
        }
    })


}

function nuevaDieta(request, response) { //LA DIETA SIEMPRE VA A ESTAR ASIGNADA A UN USUARIO

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {



        }
        else {
            response.redirect('noLoggedView');
        }
    })


}
function modificarDieta(request, response) {

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {

            db.ref('Patient/' + request.params.id).remove();
            response.redirect('./dieticianViews/manejarPacientes');

        }
        else {
            response.redirect('noLoggedView');
        }
    })


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
    modificarDieta

}