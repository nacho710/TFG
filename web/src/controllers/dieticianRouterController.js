var firebase = require("firebase");
const admin = require('firebase-admin'); //llamar el modulo
const db = admin.database(); //variable de nuestra base de datos
const auth = admin.auth();
let alert = require('alert');
const { response } = require("express");
const { body, validationResult } = require('express-validator');

var estadoDietista = true;

function getEstadoDietista(userId) { //es para que no pueda ver ciertas cosas si no está aprobado
    if (userId == null || userId === undefined || userId == '') {
        return response.render('errorViewUsers');
    }
    else {

        db.ref('/Dietician/' + userId).once('value', (snapshot) => {
            const data = snapshot.val();
            if (data.status == 'Aprobado') estadoDietista = true;
            else estadoDietista = false;

        })
    }
}


//VAMOS A LA VISTA DEL INDEX DEL DIETISTA
function indexDietician(request, response) {

    var user = firebase.auth().currentUser;
    if (user) {
        getEstadoDietista(user.uid);
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
        getEstadoDietista(user.uid);

        response.status(200);
        var userId = user.uid;
        db.ref('Dietician/' + userId).once('value', (snapshot) => {
            const data = snapshot.val();
            return response.render('./dieticianViews/perfilDietician', { dietician: data, dieticianId: userId });
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

        getEstadoDietista(user.uid);
        var dieticianId = user.uid;
        if (estadoDietista) {
            db.ref('Patient').orderByChild('dieticianId').equalTo(dieticianId).on('value', function (snapshot) {
                const data = snapshot.val();
                return response.render('./dieticianViews/manejarPacientes', { patient: data });
            })
        }
        else {
            return response.render('./dieticianViews/noStatusDietician');

        }

    }

    else {
        return response.redirect('../noLoggedView');
    }

}


function aceptarPacienteView(request, response, next) {

    var user = firebase.auth().currentUser;
    if (user) {
        getEstadoDietista(user.uid)
        if (estadoDietista) {

            var ref = db.ref('Request');
            ref.orderByChild('idDietician').equalTo(user.uid).on('child_added', function (snapshot) {
                if (snapshot.exists()) {
                    db.ref('/Request/' + snapshot.key).once('value', (childSnapshot) => {
                        if (childSnapshot.exists()) {

                            var refPatient = db.ref('Patient');
                            refPatient.orderByKey().equalTo(childSnapshot.val().idPatient).once('value', (patientSnapshot) => {
                                var data = patientSnapshot.val();
                                return response.render('./dieticianViews/aceptarPacientes', { patient: data });
                            })
                                .catch(function (error) {
                                    return response.render('./dieticianViews/errorView');

                                })
                        }
                        else {
                            return response.render('./dieticianViews/aceptarPacientes');

                        }

                    })
                        .catch(function (error) {
                            return response.render('./dieticianViews/errorView');

                        })
                }
                else {
                    return response.render('./dieticianViews/aceptarPacientes');
                }
            })
        }
        else {
            return response.render('./dieticianViews/noStatusDietician');

        }
    }
    else {
        return response.redirect('../noLoggedView');
    }

}

//ACEPTA UN PACIENTE Y ASIGNARLO AL DIETISTA -->QUITAR LA REQUEST Y PONERLE AL USUARIO EN CUESTION UN CAMPO QUE SEA ID DIETISTA Y AL PACIENTE AÑADIRLO A LA LISTA DE PACIENTES
function aceptarPaciente(request, response) {
    var user = firebase.auth().currentUser;
    if (user) {
        getEstadoDietista(user.uid)
        if (estadoDietista) {
            try {

                var dieticianId = user.uid;

                var patientId = request.params.idPatient;
                const patientRef = db.ref("Patient/" + patientId);
                patientRef.update({
                    dieticianId: dieticianId,
                }, (error) => {
                    if (error) {
                        return response.redirect('/errorView');


                    } else {
                        const dieticianRef = db.ref("Dietician/" + dieticianId + "/patientsList/" + patientId);
                        dieticianRef.set({
                            hasDiet: "false",
                        }, (error) => {
                            if (error) {
                                return response.redirect('/errorView');


                            } else {

                                db.ref('Patient/' + patientId).once('value', (snapshot) => {
                                    const data = snapshot.val();
                                    var fotoPerfil = "https://firebasestorage.googleapis.com/v0/b/tfg-bed5d.appspot.com/o/" + patientId + "%2Fimages%2Fprofilepic?alt=media&token=eedcd6a8-5297-43fb-9e60-5511565798d0"

                                    return response.render('./dieticianViews/nuevaDieta', { patient: data, patientId: patientId,fotoPerfil:fotoPerfil });

                                }).catch(function (error) {
                                    return response.render('./dieticianViews/errorView');

                                })
                                // return response.redirect('/manejarPacientes'); 
                            }
                        });

                    }
                });






            }
            catch (error) {
                return response.redirect('/errorView');

            }
        }
        else {
            return response.render('./dieticianViews/noStatusDietician');

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
        if (estadoDietista == false) getEstadoDietista(user.uid)
        if (estadoDietista) {

            try {

                var dieticianId = user.uid;

                var patientId = request.params.idPatient;

                db.ref('Request').orderByChild('idPatient').equalTo(patientId).on('value', function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {

                        var key = childSnapshot.key;
                        var childData = childSnapshot.val();

                        db.ref('Request/' + key).remove();


                    });
                })

                const patientRef = db.ref("Patient/" + patientId);
                patientRef.update({
                    dieticianId: 'null',
                }, (error) => {
                    if (error) {
                        console.group('EAA error modificar estado');
                        response.redirect('/errorView');


                    } else {
                        return response.redirect('/manejarPacientes');
                    }
                });






            }
            catch (error) {
                return response.redirect('/errorView');

            }
        }
        else {
            return response.render('./dieticianViews/noStatusDietician');

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


        try {
            if (estadoDietista == false) getEstadoDietista(user.uid)
            if (estadoDietista) {

                var dieticianId = user.uid;
                var patientId = request.params.idPatient;
                db.ref('Diets').orderByChild('patientId').equalTo(patientId).on('child_added', function (snapshot) {
                    console.log('EAA ENTRO1');
                    if (snapshot.exists()) {
                        console.log('EAA ENTRO2');

                        db.ref('Diets/' + snapshot.key).remove();
                        db.ref('Patient/' + patientId+'/Follow').remove();
                        const patientRef = db.ref("Patient/" + patientId);
                        patientRef.update({
                            dietId: "null",
                            dieticianId: "null",
                            dieticianValorated: "false"
                        }, (error) => {
                            if (error) {
                                console.log('EAA ENTRO2');

                                return response.render('./dieticianViews/errorView');


                            } else {
                                console.log('EAA ENTRO3');

                                db.ref("Dietician/" + dieticianId + "/patientsList/" + patientId).remove();
                                console.log('EAA ENTRO4');

                                db.ref('Patient').orderByChild('dieticianId').equalTo(user.uid).on('value', function (snapshot) {
                                    const data = snapshot.val();
                                    console.log('EAA ENTRO5');

                                    return response.render('./dieticianViews/manejarPacientes', { patient: data });
                                })

                            }
                        });
                    }

                    db.ref('Patient').orderByChild('dieticianId').equalTo(dieticianId).on('value', function (snapshot) {
                        console.log('EAA ENTRO6');

                        const data = snapshot.val();
                        return response.render('./dieticianViews/manejarPacientes', { patient: data });
                    })
                });

            }
            else {
                console.log('EAA ENTRO7');

                return response.render('./dieticianViews/noStatusDietician');

            }
        }



        catch (error) {
            return response.redirect('./dieticianViews/errorView');

        }
    }

    else {
        return response.redirect('../noLoggedView');
    }
}

//PARSEAR TODA EL FORM Y CREAR UNA NUEVA DIETA CON TODOS LOS CAMPOS QUE SE TENGAN, ID DEL USUARIO, ID DEL PACIENTE, Y LAS COMIDAS
function nuevaDietaView(request, response) {


    var user = firebase.auth().currentUser;
    if (user) {
        getEstadoDietista(user.uid)
        if (estadoDietista) {

            var patientId = request.params.idPatient;
            db.ref('Patient/' + patientId).once('value', (snapshot) => {
                if (snapshot.exists()) {

                    const data = snapshot.val();
                    var fotoPerfil = "https://firebasestorage.googleapis.com/v0/b/tfg-bed5d.appspot.com/o/" + patientId + "%2Fimages%2Fprofilepic?alt=media&token=eedcd6a8-5297-43fb-9e60-5511565798d0"

                    response.render('./dieticianViews/nuevaDieta', { patient: data, patientId: patientId,fotoPerfil:fotoPerfil });
                }
                else {
                    return response.render('./dieticianViews/errorView');

                }

            })
                .catch(function (error) {
                    return response.render('./dieticianViews/errorView');

                })


        }
        else {
            return response.render('./dieticianViews/noStatusDietician');

        }
    }
    else {
        return response.redirect('../noLoggedView');
    }



}

function nuevaDieta(request, response) { //LA DIETA SIEMPRE VA A ESTAR ASIGNADA A UN USUARIO 

    var user = firebase.auth().currentUser;
    if (user) {
        getEstadoDietista(user.uid)
        if (estadoDietista) {

            var patientId = request.params.idPatient;
            var dieticianId = user.uid;

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

            var dietId = db.ref('Diets').push(newDiet).then((snap) => {
                var newId = snap.key

                const patientRef = db.ref("Patient/" + patientId);
                patientRef.update({
                    dietId: newId,
                }, (error) => {
                    if (error) {
                        var fotoPerfil = "https://firebasestorage.googleapis.com/v0/b/tfg-bed5d.appspot.com/o/" + patientId + "%2Fimages%2Fprofilepic?alt=media&token=eedcd6a8-5297-43fb-9e60-5511565798d0"

                        return response.render('./dieticianViews/nuevaDieta', { patient: data, errors: error,fotoPerfil:fotoPerfil });


                    } else {
                        const dieticianRef = db.ref("Dietician/" + dieticianId + "/patientsList/" + patientId);
                        dieticianRef.set({
                            hasDiet: newId,
                        }, (error) => {
                            if (error) {
                                var fotoPerfil = "https://firebasestorage.googleapis.com/v0/b/tfg-bed5d.appspot.com/o/" + patientId + "%2Fimages%2Fprofilepic?alt=media&token=eedcd6a8-5297-43fb-9e60-5511565798d0"

                                return response.render('./dieticianViews/nuevaDieta', { patient: data, errors: error ,fotoPerfil:fotoPerfil});


                            } else {
                                db.ref('Patient/' + patientId).once('value', (snapshot) => {
                                    const data = snapshot.val();
                                    var fotoPerfil = "https://firebasestorage.googleapis.com/v0/b/tfg-bed5d.appspot.com/o/" + patientId + "%2Fimages%2Fprofilepic?alt=media&token=eedcd6a8-5297-43fb-9e60-5511565798d0"

                                    return response.render('./dieticianViews/seguirProgreso', { patient: data, patientId: patientId, fotoPerfil: fotoPerfil });

                                }).catch(function (error) {
                                    return response.render('./dieticianViews/nuevaDieta', { patient: data, errors: error,fotoPerfil:fotoPerfil });

                                })
                            }
                        });

                    }
                });
            })

        }
        else {
            return response.render('./dieticianViews/noStatusDietician');

        }
    }


    else {
        return response.redirect('../noLoggedView');
    }



}

function modificarDietaView(request, response) {

    var user = firebase.auth().currentUser;
    if (user) {
        getEstadoDietista(user.uid)
        if (estadoDietista) {


            var patientId = request.params.idPatient;
            db.ref('Patient/' + patientId).once('value', (snapshot) => {
                const dataPatient = snapshot.val();

                db.ref('Diets').orderByChild('patientId').equalTo(patientId).on('child_added', function (childSnapshot) {
                    if (childSnapshot) {
                        const dataDiet = childSnapshot.val();
                        const dataDietId = childSnapshot.key;
                        var fotoPerfil = "https://firebasestorage.googleapis.com/v0/b/tfg-bed5d.appspot.com/o/" + patientId + "%2Fimages%2Fprofilepic?alt=media&token=eedcd6a8-5297-43fb-9e60-5511565798d0"

                        return response.render('./dieticianViews/modificarDieta', { patient: dataPatient, diet: dataDiet, dietId: dataDietId, idPatient: patientId, fotoPerfil: fotoPerfil });

                    }
                    else return response.render('./dieticianViews/errorView');

                })
            }).catch(function (error) {
                return response.render('./dieticianViews/errorView');

            })

        }

        else {
            return response.render('./dieticianViews/noStatusDietician');

        }
    }
    else {
        return response.redirect('../noLoggedView');
    }


}
//LO MISMO QUE ARRIBA PERO UPDATE y 
function modificarDieta(request, response) {

    var user = firebase.auth().currentUser;
    if (user) {

        getEstadoDietista(user.uid)
        if (estadoDietista) {


            var dietId = request.params.dietId;
            var patientId = request.params.idPatient;
            var dieticianId = user.uid;
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
                        db.ref('Patient/' + patientId).once('value', (snapshot) => {
                            const data = snapshot.val();
                            var fotoPerfil = "https://firebasestorage.googleapis.com/v0/b/tfg-bed5d.appspot.com/o/" + patientId + "%2Fimages%2Fprofilepic?alt=media&token=eedcd6a8-5297-43fb-9e60-5511565798d0"

                            return response.render('./dieticianViews/seguirProgreso', { patient: data, patientId: patientId, fotoPerfil: fotoPerfil });

                        }).catch(function (error) {
                            return response.render('./dieticianViews/errorView');

                        })

                    }
                });
            }
            else {
                return response.render('./dieticianViews/errorView');

            }
        }

        else {
            return response.render('./dieticianViews/noStatusDietician');

        }
    }

    // }
    else {
        return response.redirect('../noLoggedView');
    }


}

function seguirProgreso(request, response) {
    var user = firebase.auth().currentUser;
    if (user) {
        getEstadoDietista(user.uid)
        if (estadoDietista) {

            var patientId = request.params.idPatient;
            db.ref('Patient/' + patientId).orderByKey().once('value', (snapshot) => {
                const data = snapshot.val();
                var fotoPerfil = "https://firebasestorage.googleapis.com/v0/b/tfg-bed5d.appspot.com/o/" + patientId + "%2Fimages%2Fprofilepic?alt=media&token=eedcd6a8-5297-43fb-9e60-5511565798d0"
                return response.render('./dieticianViews/seguirProgreso', { patient: data, patientId: patientId, fotoPerfil: fotoPerfil });

            }).catch(function (error) {
                return response.redirect('./dieticianViews/errorView');

            })

        }
        else {
            return response.render('./dieticianViews/noStatusDietician');

        }

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

            var dieticianId = user.uid;
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
            db.ref('Dietician/' + dieticianId).once('value', (snapshot) => {
                const data = snapshot.val();
                email = data.email;
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
                            })
                            .catch((error) => {
                                console.log('EAA: Error deleting user:', error);
                            });
                    })
                    .catch((error) => {
                        console.log('EAA: Error fetching user data:', error);
                    });
            });

            firebase.auth().signOut().
                then(function () {
                    return response.redirect("/");
                }, function (error) {
                    console.error('Sign Out Error', error);
                });






        }
        catch (error) {
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
            var email = request.params.email;
            firebase
                .auth()
                .sendPasswordResetEmail(email)
                .then(function () {
                    return response.render('./dieticianViews/resetPasswordSentDietician', { email: email });
                })
                .catch(function (error) {

                    return response.render('./dieticianViews/errorView');
                });
        }
        catch (error) {
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