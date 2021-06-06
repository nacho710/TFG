var firebase = require("firebase");
const admin = require('firebase-admin'); //llamar el modulo
const db = admin.database(); //variable de nuestra base de datos
const auth = admin.auth();
let alert = require('alert');
const { body, validationResult } = require('express-validator');


function root(request, response) {

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {

            var uid = user.uid;
            if (user.email == "personaldiet@admin.es") return response.render('./adminViews/indexAdmin');
            else return response.render('./dieticianViews/indexDietician');
        }
        else {
            response.status(200);

            return response.render("index", {
                msg: null
            });
        }
    });


}


function noLoggedView(request, response) {
    response.status(200);
    return response.render("noLoggedView", {
        msg: null
    });
}

function registroView(request, response) {
    response.status(200);
    return response.render("registro", {
        msg: null
    });
}
function registroDietician(request, response) {



    var email = request.body.email;
    var password = request.body.password;
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user) => {
            db.ref('Dietician/' + user.user.uid).set({
                username: request.body.nombre + " " + request.body.apellidos,
                email: request.body.email,
                // password: request.body.password,
                phone: request.body.phone,
                description: request.body.description,
                status: "Pendiente de aprobar",
                worth: "3.5",
                worthList: {
                    0: "3.5"
                },
            });
            db.ref('Request/Request'+" " + request.body.nombre+ request.body.apellidos).set({
                idDietician: user.user.uid,
                idPatient: 'patient0'

            });
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((user) => {
                    response.status(200);

                    return response.render('./dieticianViews/indexDietician');

                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;

                    alert(errorMessage);
                    return response.redirect("/");
                });

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
            return response.redirect("registroView");

        });
}


function loginView(request, response) {
    return response.render("login");
}



function loginUser(request, response) {

    var email = request.body.email;
    var password = request.body.password;
    try {
        firebase.auth().signInWithEmailAndPassword(email, password).then(function () {

            if (email == "personaldiet@admin.es") {

                return response.render('./adminViews/indexAdmin');
            }

            else {
                return response.render('./dieticianViews/indexDietician');
            }


        }).catch((error) => {

            var errorCode = error.code;
            var errorMessage = error.message;
            var msg;
            if (errorCode == 'auth/wrong-password') {
                msg = 'El correo o la contraseña es incorrecta.';
            }
            else if (errorCode == 'auth/invalid-email') {
                msg = 'El email que has introducido no es correcto.';
            }
            else if (errorCode == 'auth/user-disabled') {
                msg = 'El usuario está inhabilitado.';
            }
            else if (errorCode == 'auth/user-not-found') {
                msg = 'El usuario no existe.';
            }
            else {
                msg = errorMessage;
            }
            alert(msg);
            return response.redirect("login");
        });
    }
    catch (error) {
        return response.render('errorViewUsers');

    }

}




function logout(request, response) {
    firebase.auth().signOut().
        then(function () {
            return response.redirect("/");
        }, function (error) {
            console.error('Sign Out Error', error);
        });
}

function resetPasswordView(request, response) {
    response.status(200);
    return response.render("resetPassword");
}

function resetPassword(request, response) {

    //console.log(request);
    var email = request.body.email;
        firebase
            .auth()
            .sendPasswordResetEmail(email)
            .then(function () {
                return response.render("resetPasswordSent", { email: email });
            })
            .catch(function (error) {
                console.log('EAA ERROR RESET PASSWORD ');
                console.log(error);
                return response.render("errorViewUsers");
            });
   
}


module.exports = {
    root,
    registroDietician,
    registroView,
    loginView,
    loginUser,
    logout,
    noLoggedView,
    resetPasswordView,
    resetPassword
}

