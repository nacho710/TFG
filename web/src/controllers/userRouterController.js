var firebase = require("firebase");
const admin = require('firebase-admin'); //llamar el modulo
const db = admin.database(); //variable de nuestra base de datos
const auth = admin.auth();
let alert = require('alert');

//const toast = require('toast-notification-alert');



function root(request, response) {

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {

            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User

            var uid = user.uid;
            console.log('EAA emailroot:' + user.email);
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
            // const newDietician = {
            //     username: request.body.nombre + " " + request.body.apellidos,
            //     email: request.body.email,
            //     password: request.body.password,
            //     phone: request.body.phone,
            //     description: request.body.description,
            //     rol: "dietista",
            //     status: "Pendiente de aprobar",
            //     worth: "3.5"
            // }
            // console.log('EAA USER: '+JSON.stringify(user));
            // console.log('EAA ID: '+user.user.uid);

            // db.ref('Dietician').push(newDietician); //nombre de la tabla --db.ref('Dietician')
            db.ref('Dietician/' + user.user.uid).set({
                username: request.body.nombre + " " + request.body.apellidos,
                email: request.body.email,
                password: request.body.password,
                phone: request.body.phone,
                description: request.body.description,
                rol: "dietista",
                status: "Pendiente de aprobar",
                worth: "3.5"
            });
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((user) => {
                    response.status(200);

                    return response.render('./dieticianViews/indexDietician');

                })
                .catch((error) => {
                    // alert("ERROR EN login:"+error);
                    var errorCode = error.code;
                    var errorMessage = error.message;

                    alert(errorMessage);
                    return response.redirect("/");
                });

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
            return response.redirect("registroView");

        });
}


function loginView(request, response) {
    return response.render("login");
}



function loginUser(request, response) {

    //console.log(request);
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
        console.log('EAA errorTRY ' + error);
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
    if (email != 'personaldiet@admin.es') {
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
    else return response.render("errorViewUsers");
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

