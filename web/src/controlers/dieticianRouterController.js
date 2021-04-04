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
            var userId =user.uid;
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
                db.ref('/Request/' + snapshot.key).once('value', (childSnapshot) => { //consultamos en firebase la tabla users 
                    console.log('EAA RequestJSON: ' + JSON.stringify(childSnapshot.val()));
                    db.ref('/Patient/' + childSnapshot.val().idPatient).once('value', (patientSnapshot) => {
                        console.log('EAA patientSnapshot: ' + JSON.stringify(patientSnapshot.val()));

                        const dataPatient = patientSnapshot;
                        response.render('./dieticianViews/aceptarPacientes', { patient: dataPatient }); //refrescamos la vista de index ahora con esos valores
                    })


                })

                //console.log('EAAgetDietistasAprobados '+data);

            });

            // db.ref('/Request/' + user.id).once('value', (snapshot) => { //consultamos en firebase la tabla users 
            //     const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
            //     console.log('EAA aceptarPacientes: ' + snapshot.val());
            //     console.log('EAA aceptarPacientesJSON: ' + JSON.stringify(snapshot.val()));
            //     response.render('./dieticianViews/aceptarPacientes', { patient: data }); //refrescamos la vista de index ahora con esos valores

            // })


        }
        else {
            response.redirect('noLoggedView');
        }
    })



}

//ACEPTA UN PACIENTE Y ASIGNARLO AL DIETISTA
function aceptarPaciente(request, response) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {


        }
        else {
            response.redirect('noLoggedView');
        }
    })

}

//RECHAZAR A UN PACIENTE QUE HA QUERIDO LOS SERVICIOS DE ESTE DIETISTA
function rechazarPaciente(request, response) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {


        }
        else {
            response.redirect('noLoggedView');
        }
    })


}

//RECHAZAR A UN PACIENTE QUE EL DIETISTA YA TENIA ACEPTADO
function rechazarPacienteAceptado(request, response) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {


        }
        else {
            response.redirect('noLoggedView');
        }
    })
}

//EL DIETISTA BORRA UN PACIENTE-->ESTO NO SE VA A HACER
function borrarPaciente(request, response) {

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
    borrarPaciente,
    perfilDietician,
    indexDietician,
    aceptarPacienteView,
    aceptarPaciente,
    rechazarPaciente,
    rechazarPacienteAceptado
}