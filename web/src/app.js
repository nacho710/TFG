//script en package.json llamado dev --> es para que, si hago uso el comando NPM RUN DEV cada vez que guarde un archivo se va a reiniciar el servidor 


//archivoi que arranca la app  
const express = require('express'); //importar el modulo
const morgan= require('morgan'); //middleware
const exphbs = require('express-handlebars'); //modulo express handlebars que es apra que el html tenga condicionales y cosas asi HBS
const path= require('path');//permite trabajr con los directorios

const app = express(); //ejecutar el modulo

//settings

app.set('port',process.env.PORT || 4000); //usar el puerto predefinido por el pc(si tiene) o si no en el 3000
app.set('views',path.join(__dirname,'views'));
app.engine('.hbs',exphbs({ //defino el motor
    defaultLayout: 'main', //archivo que va a tener codigo HTML en comun
    extname: '.hbs' //extension de los archivos
}))
app.set('view engine', '.hbs'); //digo cual es el motor a usar

//middlewares

app.use(morgan('dev'));
app.use(express.urlencoded({extended:false})); // es para aceptar los datos de un formualrio html

//routes

app.use(require('./routes/index'));


//static files

app.use(express.static(path.join(__dirname,'public')));


module.exports = app; //exportar el modulo