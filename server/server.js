require('./config/config')

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const bodyparser = require('body-parser')
const path = require('path')

//Midlewares cada petición que recibimos para por aquí
// parse application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({ extended: false }))

//Habilitar la carpeta /public
app.use(express.static(path.resolve(__dirname, '../public')))

//Configuración global de rutas
app.use(require('./routes/index'))

// parse application/json
app.use(bodyparser.json())

console.log(process.env.URLDB)

mongoose.connect(process.env.URLDB, (err, res) => {
    if (err) throw err

    console.log('Base de datos ONLINE');
})

app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto ', process.env.PORT)
})