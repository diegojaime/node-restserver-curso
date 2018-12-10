const express = require('express')
const bcrypt = require('bcrypt')
const _ = require('underscore')
const Usuario = require('../models/usuario')

//Esta forma de require solo nos devuelve el verificaToken y no toda la librería
//No hay que mandar llamar el metodo ahora
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion')

const app = express()

//verificaToken manda a llamar el metodo dentro del middleware autenticacion
app.get('/usuario', verificaToken, (req, res) => {

    let desde = Number(req.query.desde) || 0
    let limite = Number(req.query.limite) || 5

    //res.json('get usuario')

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            Usuario.count({ estado: true }, (err, conteo) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                })
            })

        })

})

app.post('/usuario', [verificaToken, verificaAdmin_Role], (req, res) => {
    let body = req.body

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    })

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        //Quitamos el password de usuarioDB para que no lo regrese en la respuesta al query
        //usuarioDB.password = null
        // Nota: para hacer que no aparezca ni siquiera el nombre del campo password tenemos que modificar
        // el metodo toJSON dentro de /models/usuario.js

        res.json({
            ok: true,
            usuario: usuarioDB,
        })
    })

    /*
    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        })
    } else {
        res.json({
            persona: body
        })
    }
    */


})

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id
        //let body = req.body

    //Crea un body pero solo con los campos del esquema que si se pueden modificar.
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado'])

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })


})

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id

    let cambiaEstado = {
        estado: false
    }


    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }



            res.json({
                ok: true,
                usuario: usuarioBorrado
            })
        })
        /*
        Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            if (!usuarioBorrado) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no encontrado'
                    }
                })
            }

            res.json({
                ok: true,
                usuario: usuarioBorrado
            })
        })
        */


})


module.exports = app