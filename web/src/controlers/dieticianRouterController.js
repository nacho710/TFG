var firebase = require("firebase");
const admin = require('firebase-admin'); //llamar el modulo
const db = admin.database(); //variable de nuestra base de datos
const auth = admin.auth();


function getPacientes(request, response) {
    db.ref('Patient').once('value', (snapshot) => { //consultamos en firebase la tabla users 
        const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
        response.render('./dieticianViews/manejarPacientes', { patient: data }); //refrescamos la vista de index ahora con esos valores

    })


}
function borrarPaciente(request, response) {
    db.ref('Patient/' + request.params.id).remove();
    response.redirect('./dieticianViews/manejarPacientes');


}

function perfilDietician(request, response) {
    response.render('./dieticianViews/perfilDietician');


}

module.exports = {
    getPacientes,
    borrarPaciente,
    perfilDietician
}