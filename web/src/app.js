//script en package.json llamado dev --> es para que, si hago uso el comando NPM RUN DEV cada vez que guarde un archivo se va a reiniciar el servidor 


//archivo que arranca -->  app.js

const express = require('express'); //importar el modulo express
const morgan= require('morgan'); //middleware morgan
const hbs = require('express-handlebars'); //modulo express handlebars
const path= require('path');//permite trabajar con los directorios
const app = express(); //ejecutar el modulo
const bodyParser = require('body-parser');


//FIREBASE
// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs

var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");

var firebaseConfig = {
    apiKey: "AIzaSyDwQ_xg8NmGEmPwj3Oj0sRrE_R_8qhC2cc",
    authDomain: "tfg-bed5d.firebaseapp.com",
    databaseURL: "https://tfg-bed5d.firebaseio.com",
    projectId: "tfg-bed5d",
    storageBucket: "gs://tfg-bed5d.appspot.com/",
    messagingSenderId: "1081286364712",
    appId: "1:1081286364712:web:3782a5e9c03bc46bde6f1d",
    measurementId: "G-TNC92QC113"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  // const fs = firebase.firestore();

//settings

var hbsHelper = hbs.create({});

hbsHelper.handlebars.registerHelper('ifeq', function (a, b, options) {
  if (a == b) { return options.fn(this); }
  return options.inverse(this);
});

hbsHelper.handlebars.registerHelper('ifnoteq', function (a, b, options) {
  if (a != b) { return options.fn(this); }
  return options.inverse(this);
});

app.set('port',process.env.PORT || 4000); //usar el puerto predefinido por el pc(si tiene) o si no en el 3000
app.set('views',path.join(__dirname,'views'));
app.engine('.hbs',hbs({ //defino el motor
    defaultLayout: 'main', //archivo que va a tener codigo HTML en comun
    extname: '.hbs', //extension de los archivos
    partialsDir: __dirname + '/views/layouts/partials/',
    helpers: __dirname+'/views/hbsHelper.js'

}))
app.set('view engine', '.hbs'); //digo cual es el motor a usar

//middlewares

app.use(morgan('dev'));
app.use(express.urlencoded({extended:false})); // es para aceptar los datos de un formualrio html
app.use(bodyParser.urlencoded({ extended: true })); 

// app.use(function(req, res, next) {
//   res.status(404);
//   res.send('404: File Not Found');
// });
//routes

app.use(require('./routes/index'));
app.use(require('./routes/adminRoutes'));
app.use(require('./routes/dieticianRoutes'));
app.use(require('./routes/userRoutes'));





//static files

app.use(express.static(path.join(__dirname,'public')));


module.exports = app; //exportar el modulo