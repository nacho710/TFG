var firebase = require("firebase");
const admin = require('firebase-admin'); //llamar el modulo
const db = admin.database(); //variable de nuestra base de datos
const auth = admin.auth();
let alert = require('alert');
const { response } = require("express");
const { body, validationResult } = require('express-validator');

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

    var user = firebase.auth().currentUser;
    if (user) {
        response.status(200);

        return response.render('./dieticianViews/indexDietician');

    }
    else {
        return response.redirect('../noLoggedView');
    }


}

//VAMOS A LA VISTA DEL PERFIL DEL DIETISTA
function perfilDietician(request, response) {
    var user = firebase.auth().currentUser;
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
        return response.redirect('../noLoggedView');
    }



}

//DEVUELVE TODOS LOS PACIENTES QUE EXISTEN EN LA BD
function getPacientes(request, response) {
    var user = firebase.auth().currentUser;
    if (user) {

        db.ref('Patient').once('value', (snapshot) => { //consultamos en firebase la tabla users 
            const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
            response.status(200);

            return response.render('./dieticianViews/manejarPacientes', { patient: data }); //refrescamos la vista de index ahora con esos valores

        })


    }
    else {
        return response.redirect('../noLoggedView');
    }

}



//get LOS PACIENTES QUE REQUIEREN LOS SERVICIOS DEL DIETISTA


function aceptarPacienteView(request, response, next) {

    var user = firebase.auth().currentUser;
    if (user) {
        var ref = db.ref('Request');
        ref.orderByChild('idDietician').equalTo(user.uid).on('child_added', function (snapshot) { //me devuelve cada fila que tiene status aprobado pero sin la clave

            if (snapshot) {
                db.ref('/Request/' + snapshot.key).once('value', (childSnapshot) => { //consultamos en firebase la tabla users 
                    var refPatient = db.ref('Patient');
                    refPatient.orderByKey().equalTo(childSnapshot.val().idPatient).once('value', (patientSnapshot) => { //me devuelve cada fila que tiene status aprobado pero sin la clave
                        console.log('EAA aceptarPacienteView '+JSON.stringify(patientSnapshot.val()));
                        var data = patientSnapshot.val();
                        return response.render('./dieticianViews/aceptarPacientes', { patient: data }); //refrescamos la vista de index ahora con esos valores
                    })
                        .catch(function (error) {
                            console.log('EAA ERROR3 aceptarPacienteView ' + error)
                            return response.render('./dieticianViews/errorView');

                        })


                })
                    .catch(function (error) {
                        console.log('EAA ERROR2 aceptarPacienteView ' + error)
                        return response.render('./dieticianViews/errorView');

                    })
            }
            else {
                return response.render('./dieticianViews/errorView');

            }
        })

    }
    else {
        return response.redirect('../noLoggedView');
    }

}

//ACEPTA UN PACIENTE Y ASIGNARLO AL DIETISTA -->QUITAR LA REQUEST Y PONERLE AL USUARIO EN CUESTION UN CAMPO QUE SEA ID DIETISTA Y AL PACIENTE AÑADIRLO A LA LISTA DE PACIENTES
function aceptarPaciente(request, response) {
    var user = firebase.auth().currentUser;
    if (user) {
        try {

            var dieticianId = user.uid;
            console.log('EAA request.paramsACCEPT ' + JSON.stringify(request.params));
            console.log('EAA dieticianId ' + JSON.stringify(dieticianId));
            var patientId = request.params.idPatient;
            const patientRef = db.ref("Patient/" + patientId);
            patientRef.update({
                dieticianId: dieticianId,
            }, (error) => {
                if (error) {
                    console.group('EAA error modificar estado');
                    response.redirect('/errorView');


                } else {
                    const dieticianRef = db.ref("Dietician/" + dieticianId + "/patientsList/" + patientId);
                    dieticianRef.set({
                        hasDiet: "false",
                    }, (error) => {
                        if (error) {
                            console.group('EAA error modificar estado');
                            return response.redirect('/errorView');


                        } else {
                            return response.redirect('/manejarPacientes'); //refrescamos la vista de index ahora con esos valores
                        }
                    });

                }
            });






        }
        catch (error) {
            console.log('EAA errorTRY ' + error);
            return response.redirect('/errorView');

        }
    }
    else {
        return response.redirect('../noLoggedView');
    }

}
/**
 * FALTA BORRAR LA REQUEST
 */
//RECHAZAR A UN PACIENTE QUE HA QUERIDO LOS SERVICIOS DE ESTE DIETISTA  -->QUITAR LA REQUEST Y PONERLE AL USUARIO EN CUESTION UN ESTADO QUE SEA RECHAZADO, Y QUE VUELVA A ELEGIR
function rechazarPaciente(request, response) {
    var user = firebase.auth().currentUser;
    if (user) {
        try {

            var dieticianId = user.uid;
            console.log('EAA request.paramsACCEPT ' + JSON.stringify(request.params));
            console.log('EAA dieticianId ' + JSON.stringify(dieticianId));
            var patientId = request.params.idPatient;
            const patientRef = db.ref("Patient/" + patientId);
            patientRef.update({
                dieticianId: 'null',
            }, (error) => {
                if (error) {
                    console.group('EAA error modificar estado');
                    response.redirect('/errorView');


                } else {
                    return response.redirect('/manejarPacientes'); //refrescamos la vista de index ahora con esos valores
                }
            });






        }
        catch (error) {
            console.log('EAA errorTRY ' + error);
            return response.redirect('/errorView');

        }

    }
    else {
        return response.redirect('../noLoggedView');
    }


}

//DESASIGNAR EL DIETISTA DEL PACIENTE
//BUSCAR LA DIETA QUE TENÍA Y BORRARLA
//BUSCAR EN LA LISTA DE PACIENTES DEL DIETISTA Y QUITAR AL PACIENTE
function rechazarPacienteAceptado(request, response) {
    var user = firebase.auth().currentUser;
    if (user) {


    }
    else {
        return response.redirect('../noLoggedView');
    }
}

//PARSEAR TODA EL FORM Y CREAR UNA NUEVA DIETA CON TODOS LOS CAMPOS QUE SE TENGAN, ID DEL USUARIO, ID DEL PACIENTE, Y LAS COMIDAS
function nuevaDietaView(request, response) {


    var user = firebase.auth().currentUser;
    if (user) {

        var patientId = request.params.idPatient;
        db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
            if (snapshot.exists()) {
                
                const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en dataç
                // var jsonPatient={patientId:data};
                // console.log('EAA nuevaDietaView ' + JSON.stringify(jsonPatient));
                response.render('./dieticianViews/nuevaDieta', { patient: data }); //refrescamos la vista de index ahora con esos valores
            }
            else {
                return response.render('./dieticianViews/errorView');

            }

        })
            .catch(function (error) {
                console.log('EAA nuevaDietaView ' + error)
                return response.render('./dieticianViews/errorView');

            })


    }
    else {
        return response.redirect('../noLoggedView');
    }



}

function nuevaDieta(request, response) { //LA DIETA SIEMPRE VA A ESTAR ASIGNADA A UN USUARIO 

    var user = firebase.auth().currentUser;
    if (user) {
        var patientId = request.params.idPatient;
        var dieticianId = user.uid;

        body('monday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('monday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('monday-lunch3', '').trim().escape(),
            body('monday-lunch4', '').trim().escape(),
            body('monday-lunch5', '').trim().escape(),
            body('monday-comment', 'El comentario sobre el día lunes está vacío.').trim().isLength({ min: 1 }).escape(),
            body('tuesday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('tuesday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('tuesday-lunch3', '').trim().escape(),
            body('tuesday-lunch4', '').trim().escape(),
            body('tuesday-lunch5', '').trim().escape(),
            body('tuesday-comment', 'El comentario sobre el día martes está vacío.').trim().isLength({ min: 1 }).escape(),
            body('wednesday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('wednesday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('wednesday-lunch3', '').trim().escape(),
            body('wednesday-lunch4', '').trim().escape(),
            body('wednesday-lunch5', '').trim().escape(),
            body('wednesday-comment', 'El comentario sobre el día miércoles está vacío.').trim().isLength({ min: 1 }).escape(),
            body('thursday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('thursday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('thursday-lunch3', '').trim().escape(),
            body('thursday-lunch4', '').trim().escape(),
            body('thursday-lunch5', '').trim().escape(),
            body('thursday-comment', 'El comentario sobre el día jueves está vacío.').trim().isLength({ min: 1 }).escape(),
            body('friday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('friday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('friday-lunch3', '').trim().escape(),
            body('friday-lunch4', '').trim().escape(),
            body('friday-lunch5', '').trim().escape(),
            body('friday-comment', 'El comentario sobre el día viernes está vacío.').trim().isLength({ min: 1 }).escape(),
            body('saturday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('saturday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('saturday-lunch3', '').trim().escape(),
            body('saturday-lunch4', '').trim().escape(),
            body('saturday-lunch5', '').trim().escape(),
            body('saturday-comment', 'El comentario sobre el día sábado está vacío.').trim().isLength({ min: 1 }).escape(),
            body('sunday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('sunday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('sunday-lunch3', '').trim().escape(),
            body('sunday-lunch4', '').trim().escape(),
            body('sunday-lunch5', '').trim().escape(),
            body('sunday-comment', 'El comentario sobre el día domingo está vacío.').trim().isLength({ min: 1 }).escape(),
            (req, res, next) => {
                const errors = validationResult(req);

                var newDiet = {
                    dieticianId: dieticianId,
                    patientId: patientId,
                    Lunes: {
                        coment: request.body.monday - comment,
                        foods: {
                            food1: request.body.monday - lunch1,
                            food2: request.body.monday - lunch2,
                            food3: request.body.monday - lunch3,
                            food4: request.body.monday - lunch4,
                            food5: request.body.monday - lunch5,

                        },
                    },
                    Martes: {
                        coment: request.body.tuesday - comment,
                        foods: {
                            food1: request.body.tuesday - lunch1,
                            food2: request.body.tuesday - lunch2,
                            food3: request.body.tuesday - lunch3,
                            food4: request.body.tuesday - lunch4,
                            food5: request.body.tuesday - lunch5,

                        },
                    },
                    Miercoles: {
                        coment: request.body.wednesday - comment,
                        foods: {
                            food1: request.body.wednesday - lunch1,
                            food2: request.body.wednesday - lunch2,
                            food3: request.body.wednesday - lunch3,
                            food4: request.body.wednesday - lunch4,
                            food5: request.body.wednesday - lunch5,

                        },
                    },
                    Jueves: {
                        coment: request.body.thursday - comment,
                        foods: {
                            food1: request.body.thursday - lunch1,
                            food2: request.body.thursday - lunch2,
                            food3: request.body.thursday - lunch3,
                            food4: request.body.thursday - lunch4,
                            food5: request.body.thursday - lunch5,

                        },
                    },
                    Viernes: {
                        coment: request.body.friday - comment,
                        foods: {
                            food1: request.body.friday - lunch1,
                            food2: request.body.friday - lunch2,
                            food3: request.body.friday - lunch3,
                            food4: request.body.friday - lunch4,
                            food5: request.body.friday - lunch5,

                        },
                    },
                    Sabado: {
                        coment: request.body.saturday - comment,
                        foods: {
                            food1: request.body.saturday - lunch1,
                            food2: request.body.saturday - lunch2,
                            food3: request.body.saturday - lunch3,
                            food4: request.body.saturday - lunch4,
                            food5: request.body.saturday - lunch5,

                        },
                    },
                    Domingo: {
                        coment: request.body.sunday - comment,
                        foods: {
                            food1: request.body.sunday - lunch1,
                            food2: request.body.sunday - lunch2,
                            food3: request.body.sunday - lunch3,
                            food4: request.body.sunday - lunch4,
                            food5: request.body.sunday - lunch5,

                        },
                    },
                }
                if (errors.isEmpty()) {
                    var dietId = db.ref('Diets').push(newDiet).key;
                    const patientRef = db.ref("Patient/" + patientId);
                    patientRef.update({
                        dietId: dietId,
                    }, (error) => {
                        if (error) {
                            response.redirect('./dieticianViews/errorView');


                        } else {
                            const dieticianRef = db.ref("Dietician/" + dieticianId + "/patientsList/" + patientId);
                            dieticianRef.set({
                                hasDiet: dietId,
                            }, (error) => {
                                if (error) {
                                    return response.redirect('./dieticianViews/errorView');


                                } else {
                                    db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                                        const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                                        return response.render('./dieticianViews/seguirProgreso', { patient: data }); //refrescamos la vista de index ahora con esos valores

                                    }).catch(function (error) {
                                        console.log('EAA ERROR1' + error)
                                        return response.render('./dieticianViews/errorView');

                                    })
                                }
                            });

                        }
                    });

                }
                else {
                    db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                        const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en dataç
                        console.log('EAA ' + JSON.stringify(data));
                        return response.render('./dieticianViews/nuevaDieta', { patient: data, errors: errors.array() }); //refrescamos la vista de index ahora con esos valores
                    }).catch(function (error) {
                        console.log('EAA ERROR1' + error)
                        return response.render('./dieticianViews/errorView');

                    })

                }
            }
    }
    else {
        return response.redirect('../noLoggedView');
    }



}

function modificarDietaView(request, response) {

    var user = firebase.auth().currentUser;
    if (user) {
        var patientId = request.params.idPatient;
        db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
            const dataPatient = snapshot.val(); //me devuelve los valores de firebase y los guardamos en dataç
            console.log('EAA dataPatient ' + JSON.stringify(dataPatient));

            db.ref('Diets').orderByChild('patientId').equalTo(patientId).on('child_added', function (childSnapshot) { //me devuelve cada fila que tiene status aprobado pero sin la clave
                if (childSnapshot) {
                    const dataDiet = childSnapshot.val();

                    console.log('EAA dataDiet' + JSON.stringify(dataDiet));

                    return response.render('./dieticianViews/nuevaDieta', { patient: dataPatient, diet: dataDiet }); //refrescamos la vista de index ahora con esos valores

                }
                else return response.render('./dieticianViews/errorView');

            })
            return response.render('./dieticianViews/errorView');

        }).catch(function (error) {
            console.log('EAA ERROR1' + error)
            return response.render('./dieticianViews/errorView');

        })

    }
    else {
        return response.redirect('../noLoggedView');
    }


}
//LO MISMO QUE ARRIBA PERO UPDATE y 
function modificarDieta(request, response) {

    var user = firebase.auth().currentUser;
    if (user) {

        var patientId = request.params.idPatient;
        var dieticianId = user.uid;

        body('monday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('monday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('monday-lunch3', '').trim().escape(),
            body('monday-lunch4', '').trim().escape(),
            body('monday-lunch5', '').trim().escape(),
            body('monday-comment', 'El comentario sobre el día lunes está vacío.').trim().isLength({ min: 1 }).escape(),
            body('tuesday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('tuesday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('tuesday-lunch3', '').trim().escape(),
            body('tuesday-lunch4', '').trim().escape(),
            body('tuesday-lunch5', '').trim().escape(),
            body('tuesday-comment', 'El comentario sobre el día martes está vacío.').trim().isLength({ min: 1 }).escape(),
            body('wednesday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('wednesday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('wednesday-lunch3', '').trim().escape(),
            body('wednesday-lunch4', '').trim().escape(),
            body('wednesday-lunch5', '').trim().escape(),
            body('wednesday-comment', 'El comentario sobre el día miércoles está vacío.').trim().isLength({ min: 1 }).escape(),
            body('thursday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('thursday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('thursday-lunch3', '').trim().escape(),
            body('thursday-lunch4', '').trim().escape(),
            body('thursday-lunch5', '').trim().escape(),
            body('thursday-comment', 'El comentario sobre el día jueves está vacío.').trim().isLength({ min: 1 }).escape(),
            body('friday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('friday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('friday-lunch3', '').trim().escape(),
            body('friday-lunch4', '').trim().escape(),
            body('friday-lunch5', '').trim().escape(),
            body('friday-comment', 'El comentario sobre el día viernes está vacío.').trim().isLength({ min: 1 }).escape(),
            body('saturday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('saturday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('saturday-lunch3', '').trim().escape(),
            body('saturday-lunch4', '').trim().escape(),
            body('saturday-lunch5', '').trim().escape(),
            body('saturday-comment', 'El comentario sobre el día sábado está vacío.').trim().isLength({ min: 1 }).escape(),
            body('sunday-lunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('sunday-lunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
            body('sunday-lunch3', '').trim().escape(),
            body('sunday-lunch4', '').trim().escape(),
            body('sunday-lunch5', '').trim().escape(),
            body('sunday-comment', 'El comentario sobre el día domingo está vacío.').trim().isLength({ min: 1 }).escape(),
            (req, res, next) => {
                const errors = validationResult(req);

                const patientRef = db.ref("Diets/" + patientId);
                patientRef.update({
                    dietId: dietId,
                }, (error) => {
                    if (error) {
                        response.redirect('./dieticianViews/errorView');


                    } else {
                        const dieticianRef = db.ref("Dietician/" + dieticianId + "/patientsList/" + patientId);
                        dieticianRef.set({
                            hasDiet: dietId,
                        }, (error) => {
                            if (error) {
                                return response.redirect('./dieticianViews/errorView');


                            } else {
                                db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                                    const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                                    return response.render('./dieticianViews/seguirProgreso', { patient: data }); //refrescamos la vista de index ahora con esos valores

                                }).catch(function (error) {
                                    console.log('EAA ERROR1' + error)
                                    return response.render('./dieticianViews/errorView');

                                })
                            }
                        });

                    }
                });
                var newDiet = {
                    dieticianId: dieticianId,
                    patientId: patientId,
                    Lunes: {
                        coment: request.body.monday - comment,
                        foods: {
                            food1: request.body.monday - lunch1,
                            food2: request.body.monday - lunch2,
                            food3: request.body.monday - lunch3,
                            food4: request.body.monday - lunch4,
                            food5: request.body.monday - lunch5,

                        },
                    },
                    Martes: {
                        coment: request.body.tuesday - comment,
                        foods: {
                            food1: request.body.tuesday - lunch1,
                            food2: request.body.tuesday - lunch2,
                            food3: request.body.tuesday - lunch3,
                            food4: request.body.tuesday - lunch4,
                            food5: request.body.tuesday - lunch5,

                        },
                    },
                    Miercoles: {
                        coment: request.body.wednesday - comment,
                        foods: {
                            food1: request.body.wednesday - lunch1,
                            food2: request.body.wednesday - lunch2,
                            food3: request.body.wednesday - lunch3,
                            food4: request.body.wednesday - lunch4,
                            food5: request.body.wednesday - lunch5,

                        },
                    },
                    Jueves: {
                        coment: request.body.thursday - comment,
                        foods: {
                            food1: request.body.thursday - lunch1,
                            food2: request.body.thursday - lunch2,
                            food3: request.body.thursday - lunch3,
                            food4: request.body.thursday - lunch4,
                            food5: request.body.thursday - lunch5,

                        },
                    },
                    Viernes: {
                        coment: request.body.friday - comment,
                        foods: {
                            food1: request.body.friday - lunch1,
                            food2: request.body.friday - lunch2,
                            food3: request.body.friday - lunch3,
                            food4: request.body.friday - lunch4,
                            food5: request.body.friday - lunch5,

                        },
                    },
                    Sabado: {
                        coment: request.body.saturday - comment,
                        foods: {
                            food1: request.body.saturday - lunch1,
                            food2: request.body.saturday - lunch2,
                            food3: request.body.saturday - lunch3,
                            food4: request.body.saturday - lunch4,
                            food5: request.body.saturday - lunch5,

                        },
                    },
                    Domingo: {
                        coment: request.body.sunday - comment,
                        foods: {
                            food1: request.body.sunday - lunch1,
                            food2: request.body.sunday - lunch2,
                            food3: request.body.sunday - lunch3,
                            food4: request.body.sunday - lunch4,
                            food5: request.body.sunday - lunch5,

                        },
                    },
                }
                if (errors.isEmpty()) {
                    var dietId = db.ref('Diets').push(newDiet).key;
                    const patientRef = db.ref("Patient/" + patientId);
                    patientRef.update({
                        dietId: dietId,
                    }, (error) => {
                        if (error) {
                            response.redirect('./dieticianViews/errorView');


                        } else {
                            const dieticianRef = db.ref("Dietician/" + dieticianId + "/patientsList/" + patientId);
                            dieticianRef.set({
                                hasDiet: dietId,
                            }, (error) => {
                                if (error) {
                                    return response.redirect('./dieticianViews/errorView');


                                } else {
                                    db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                                        const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                                        return response.render('./dieticianViews/seguirProgreso', { patient: data }); //refrescamos la vista de index ahora con esos valores

                                    }).catch(function (error) {
                                        console.log('EAA ERROR1' + error)
                                        return response.render('./dieticianViews/errorView');

                                    })
                                }
                            });

                        }
                    });

                }
                else {
                    db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                        const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en dataç
                        console.log('EAA ' + JSON.stringify(data));
                        return response.render('./dieticianViews/nuevaDieta', { patient: data, errors: errors.array() }); //refrescamos la vista de index ahora con esos valores
                    }).catch(function (error) {
                        console.log('EAA ERROR1' + error)
                        return response.render('./dieticianViews/errorView');

                    })

                }
            }

    }
    else {
        return response.redirect('../noLoggedView');
    }


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
            return response.render('./dieticianViews/seguirProgreso', { patient: data }); //refrescamos la vista de index ahora con esos valores

        }).catch(function (error) {
            console.log('EAA ERROR1' + error)
            return response.render('./dieticianViews/errorView');

        })

    }
    else {
        return response.redirect('../noLoggedView');
    }


}

//BORRAR TODAS LAS DIETAS QUE TIENE EL DIETISTA, RECORRER TODOS LOS USUARIOS Y SI IDDIETICIAN COINCIDE CON EL  DIETISTA, PONER A NULL ESO Y EL IDDIETA,
// Y BORRAR TODAS LAS REQUEST QUE TENGAN SU ID -->FINALMENTE REMOVER EL DIETISTA

function darseDeBaja(request, response) {
    var user = firebase.auth().currentUser;
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
        return response.render('../noLoggedView');



}
function cambiarPassword(request, response) {
    var user = firebase.auth().currentUser;
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
    modificarDietaView,
    seguirProgreso,
    cambiarPassword

}