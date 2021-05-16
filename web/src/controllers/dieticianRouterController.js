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
        var dieticianId = user.uid;
        db.ref('Patient').orderByChild('dieticianId').equalTo(dieticianId).on('value', function (snapshot) { //me devuelve cada fila que tiene status aprobado pero sin la clave
            const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
            console.log('EAA getPacientes ' + JSON.stringify(data));
            return response.render('./dieticianViews/manejarPacientes', { patient: data }); //refrescamos la vista de index ahora con esos valores
        })

    }

    else {
        return response.redirect('../noLoggedView');
    }

}


function aceptarPacienteView(request, response, next) {

    var user = firebase.auth().currentUser;
    if (user) {
        var ref = db.ref('Request');
        ref.orderByChild('idDietician').equalTo(user.uid).on('child_added', function (snapshot) { 

            if (snapshot) {
                db.ref('/Request/' + snapshot.key).once('value', (childSnapshot) => { //consultamos en firebase la tabla users 
                    console.log('EAA aceptarPacienteView snapshot.key' + JSON.stringify(childSnapshot));
                    var refPatient = db.ref('Patient');
                    refPatient.orderByKey().equalTo(childSnapshot.val().idPatient).once('value', (patientSnapshot) => { //me devuelve cada fila que tiene status aprobado pero sin la clave
                        console.log('EAA aceptarPacienteView ' + JSON.stringify(patientSnapshot.val()));
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

                            db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                                const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en dataç
                                console.log('EAA ' + JSON.stringify(data));
                                return response.render('./dieticianViews/nuevaDieta', { patient: data, patientId: patientId }); //refrescamos la vista de index ahora con esos valores

                            }).catch(function (error) {
                                console.log('EAA ERROR1' + error)
                                return response.render('./dieticianViews/errorView');

                            })
                            // return response.redirect('/manejarPacientes'); //refrescamos la vista de index ahora con esos valores
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
        console.log(('EAA rechazarPacienteAceptado 111111'));

        var dieticianId = user.uid;
        var patientId = request.params.idPatient;
        db.ref('Diets').orderByChild('patientId').equalTo(patientId).on('child_added', function (snapshot) {
            console.log(JSON.stringify(snapshot));
            console.log(JSON.stringify(snapshot.key));

            if (snapshot) {
                db.ref('Diets/' + snapshot.key).remove();
                const patientRef = db.ref("Patient/" + patientId);
                patientRef.update({
                    dietId: "null",
                    dieticianId: "null",
                    dieticianValorated: "false"
                }, (error) => {
                    if (error) {
                        return response.render('./dieticianViews/errorView');


                    } else {
                        db.ref("Dietician/" + dieticianId + "/patientsList/" + patientId).remove();
                        db.ref('Patient').orderByChild('dieticianId').equalTo(dieticianId).on('value', function (snapshot) { //me devuelve cada fila que tiene status aprobado pero sin la clave
                            const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                            return response.render('./dieticianViews/manejarPacientes', { patient: data }); //refrescamos la vista de index ahora con esos valores
                        })
                        
                    }
                });
            }

            db.ref('Patient').orderByChild('dieticianId').equalTo(dieticianId).on('value', function (snapshot) { //me devuelve cada fila que tiene status aprobado pero sin la clave
                const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                return response.render('./dieticianViews/manejarPacientes', { patient: data }); //refrescamos la vista de index ahora con esos valores
            })
        });

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
                response.render('./dieticianViews/nuevaDieta', { patient: data, patientId: patientId }); //refrescamos la vista de index ahora con esos valores
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
        console.log('EAA ENTRO EN NUEVA DIETA')
        var patientId = request.params.idPatient;
        var dieticianId = user.uid;
        console.log('EAA NUEVA DIETA patientId' + patientId)

        var newDiet = {
            dieticianId: dieticianId,
            patientId: patientId,
            Lunes: {
                coment: request.body.mondaycomment,
                foods: {
                    food1: request.body.mondaylunch1,
                    food2: request.body.mondaylunch2,
                    food3: request.body.mondaylunch3,
                    food4: request.body.mondaylunch4,
                    food5: request.body.mondaylunch5,

                },
            },
            Martes: {
                coment: request.body.tuesdaycomment,
                foods: {
                    food1: request.body.tuesdaylunch1,
                    food2: request.body.tuesdaylunch2,
                    food3: request.body.tuesdaylunch3,
                    food4: request.body.tuesdaylunch4,
                    food5: request.body.tuesdaylunch5,

                },
            },
            Miercoles: {
                coment: request.body.wednesdaycomment,
                foods: {
                    food1: request.body.wednesdaylunch1,
                    food2: request.body.wednesdaylunch2,
                    food3: request.body.wednesdaylunch3,
                    food4: request.body.wednesdaylunch4,
                    food5: request.body.wednesdaylunch5,

                },
            },
            Jueves: {
                coment: request.body.thursdaycomment,
                foods: {
                    food1: request.body.thursdaylunch1,
                    food2: request.body.thursdaylunch2,
                    food3: request.body.thursdaylunch3,
                    food4: request.body.thursdaylunch4,
                    food5: request.body.thursdaylunch5,

                },
            },
            Viernes: {
                coment: request.body.fridaycomment,
                foods: {
                    food1: request.body.fridaylunch1,
                    food2: request.body.fridaylunch2,
                    food3: request.body.fridaylunch3,
                    food4: request.body.fridaylunch4,
                    food5: request.body.fridaylunch5,

                },
            },
            Sabado: {
                coment: request.body.saturdaycomment,
                foods: {
                    food1: request.body.saturdaylunch1,
                    food2: request.body.saturdaylunch2,
                    food3: request.body.saturdaylunch3,
                    food4: request.body.saturdaylunch4,
                    food5: request.body.saturdaylunch5,

                },
            },
            Domingo: {
                coment: request.body.sundaycomment,
                foods: {
                    food1: request.body.sundaylunch1,
                    food2: request.body.sundaylunch2,
                    food3: request.body.sundaylunch3,
                    food4: request.body.sundaylunch4,
                    food5: request.body.sundaylunch5,

                },
            },
        }
        console.log('EAA NUEVA DIETA newDiet' + newDiet)

        var dietId = db.ref('Diets').push(newDiet).then((snap) => {
            var newId = snap.key
            console.log('EAA NUEVA DIETA newId' + newId)

            const patientRef = db.ref("Patient/" + patientId);
            patientRef.update({
                dietId: newId,
            }, (error) => {
                if (error) {
                    return response.render('./dieticianViews/nuevaDieta', { patient: data, errors: error }); //refrescamos la vista de index ahora con esos valores


                } else {
                    const dieticianRef = db.ref("Dietician/" + dieticianId + "/patientsList/" + patientId);
                    dieticianRef.set({
                        hasDiet: newId,
                    }, (error) => {
                        if (error) {
                            return response.render('./dieticianViews/nuevaDieta', { patient: data, errors: error }); //refrescamos la vista de index ahora con esos valores


                        } else {
                            db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                                const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                                return response.render('./dieticianViews/seguirProgreso', { patient: data, patientId: patientId }); //refrescamos la vista de index ahora con esos valores

                            }).catch(function (error) {
                                console.log('EAA ERROR1' + error)
                                return response.render('./dieticianViews/nuevaDieta', { patient: data, errors: error }); //refrescamos la vista de index ahora con esos valores

                            })
                        }
                    });

                }
            });
        })

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
                    const dataDietId = childSnapshot.key;
                    console.log('EAA dataDiet' + JSON.stringify(dataDiet));

                    return response.render('./dieticianViews/modificarDieta', { patient: dataPatient, diet: dataDiet, dietId: dataDietId, idPatient: patientId }); //refrescamos la vista de index ahora con esos valores

                }
                else return response.render('./dieticianViews/errorView');

            })
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
        console.log('EAA MODIFICAR DIETA');

        var dietId = request.params.dietId;
        var patientId = request.params.idPatient;
        var dieticianId = user.uid;
        console.log('EAA VARS MODIFICAR DIETA dietId: ' + dietId + " patientId: " + patientId + " dieticianId: " + dieticianId + " ");
        // body('mondaylunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('mondaylunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('mondaylunch3', '').trim().escape(),
        //     body('mondaylunch4', '').trim().escape(),
        //     body('mondaylunch5', '').trim().escape(),
        //     body('mondaycomment', 'El comentario sobre el día lunes está vacío.').trim().isLength({ min: 1 }).escape(),
        //     body('tuesdaylunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('tuesdaylunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('tuesdaylunch3', '').trim().escape(),
        //     body('tuesdaylunch4', '').trim().escape(),
        //     body('tuesdaylunch5', '').trim().escape(),
        //     body('tuesdaycomment', 'El comentario sobre el día martes está vacío.').trim().isLength({ min: 1 }).escape(),
        //     body('wednesdaylunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('wednesdaylunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('wednesdaylunch3', '').trim().escape(),
        //     body('wednesdaylunch4', '').trim().escape(),
        //     body('wednesdaylunch5', '').trim().escape(),
        //     body('wednesdaycomment', 'El comentario sobre el día miércoles está vacío.').trim().isLength({ min: 1 }).escape(),
        //     body('thursdaylunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('thursdaylunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('thursdaylunch3', '').trim().escape(),
        //     body('thursdaylunch4', '').trim().escape(),
        //     body('thursdaylunch5', '').trim().escape(),
        //     body('thursdaycomment', 'El comentario sobre el día jueves está vacío.').trim().isLength({ min: 1 }).escape(),
        //     body('fridaylunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('fridaylunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('fridaylunch3', '').trim().escape(),
        //     body('fridaylunch4', '').trim().escape(),
        //     body('fridaylunch5', '').trim().escape(),
        //     body('fridaycomment', 'El comentario sobre el día viernes está vacío.').trim().isLength({ min: 1 }).escape(),
        //     body('saturdaylunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('saturdaylunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('saturdaylunch3', '').trim().escape(),
        //     body('saturdaylunch4', '').trim().escape(),
        //     body('saturdaylunch5', '').trim().escape(),
        //     body('saturdaycomment', 'El comentario sobre el día sábado está vacío.').trim().isLength({ min: 1 }).escape(),
        //     body('sundaylunch1', 'La comida 1 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('sundaylunch2', 'La comida 2 está vacía.').trim().isLength({ min: 1 }).escape(),
        //     body('sundaylunch3', '').trim().escape(),
        //     body('sundaylunch4', '').trim().escape(),
        //     body('sundaylunch5', '').trim().escape(),
        //     body('sundaycomment', 'El comentario sobre el día domingo está vacío.').trim().isLength({ min: 1 }).escape(),
        // (req, res, next) => {
        //     const errors = validationResult(req);
        // if (errors.isEmpty()) {









        var dietRef = db.ref("Diets/" + dietId);

        if (dietRef) {
            dietRef.set({
                "dieticianId": dieticianId,
                "patientId": patientId,
                Lunes: {
                    coment: request.body.mondaycomment,
                    foods: {
                        food1: request.body.mondaylunch1,
                        food2: request.body.mondaylunch2,
                        food3: request.body.mondaylunch3,
                        food4: request.body.mondaylunch4,
                        food5: request.body.mondaylunch5,

                    },
                },
                Martes: {
                    coment: request.body.tuesdaycomment,
                    foods: {
                        food1: request.body.tuesdaylunch1,
                        food2: request.body.tuesdaylunch2,
                        food3: request.body.tuesdaylunch3,
                        food4: request.body.tuesdaylunch4,
                        food5: request.body.tuesdaylunch5,

                    },
                },
                Miercoles: {
                    coment: request.body.wednesdaycomment,
                    foods: {
                        food1: request.body.wednesdaylunch1,
                        food2: request.body.wednesdaylunch2,
                        food3: request.body.wednesdaylunch3,
                        food4: request.body.wednesdaylunch4,
                        food5: request.body.wednesdaylunch5,

                    },
                },
                Jueves: {
                    coment: request.body.thursdaycomment,
                    foods: {
                        food1: request.body.thursdaylunch1,
                        food2: request.body.thursdaylunch2,
                        food3: request.body.thursdaylunch3,
                        food4: request.body.thursdaylunch4,
                        food5: request.body.thursdaylunch5,

                    },
                },
                Viernes: {
                    coment: request.body.fridaycomment,
                    foods: {
                        food1: request.body.fridaylunch1,
                        food2: request.body.fridaylunch2,
                        food3: request.body.fridaylunch3,
                        food4: request.body.fridaylunch4,
                        food5: request.body.fridaylunch5,

                    },
                },
                Sabado: {
                    coment: request.body.saturdaycomment,
                    foods: {
                        food1: request.body.saturdaylunch1,
                        food2: request.body.saturdaylunch2,
                        food3: request.body.saturdaylunch3,
                        food4: request.body.saturdaylunch4,
                        food5: request.body.saturdaylunch5,

                    },
                },
                Domingo: {
                    coment: request.body.sundaycomment,
                    foods: {
                        food1: request.body.sundaylunch1,
                        food2: request.body.sundaylunch2,
                        food3: request.body.sundaylunch3,
                        food4: request.body.sundaylunch4,
                        food5: request.body.sundaylunch5,

                    },
                }
            }, (error) => {
                if (error) {
                    response.redirect('./dieticianViews/errorView');


                } else {
                    db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
                        const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en data
                        return response.render('./dieticianViews/seguirProgreso', { patient: data, patientId: patientId }); //refrescamos la vista de index ahora con esos valores

                    }).catch(function (error) {
                        return response.render('./dieticianViews/errorView');

                    })

                }
            });
        }
        else {
            return response.render('./dieticianViews/errorView');

        }

























        // }
        // else {
        //     db.ref('Patient/' + patientId).once('value', (snapshot) => { //consultamos en firebase la tabla users 
        //         const data = snapshot.val(); //me devuelve los valores de firebase y los guardamos en dataç
        //         console.log('EAA ' + JSON.stringify(data));
        //         return response.render('./dieticianViews/nuevaDieta', { patient: data, errors: errors.array() }); //refrescamos la vista de index ahora con esos valores
        //     }).catch(function (error) {
        //         console.log('EAA ERROR1' + error)
        //         return response.render('./dieticianViews/errorView');

        //     })

        // }
    }

    // }
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
            return response.render('./dieticianViews/seguirProgreso', { patient: data, patientId: patientId }); //refrescamos la vista de index ahora con esos valores

        }).catch(function (error) {
            console.log('EAA ERROR1' + error)
            return response.redirect('./dieticianViews/errorView');

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