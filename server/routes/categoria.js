const express = require('express')
const _ = require('underscore')

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion')

let app = express()

const Categoria = require('../models/categoria')

//=================================
// Regresa todas las categorias
//=================================
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({ estado: true }, 'descripcion estado')
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            Categoria.count({ estado: true }, (err, conteo) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }

                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                })
            })
        })
})

//=================================
// Regresa la categoria por ID
//=================================

app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id
    console.log(id)

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })

})


//=================================
// Crear una categoria
//=================================
app.post('/categoria', verificaToken, (req, res) => {
    //Regresa la nueva categoria
    //req.usuario._id

    let body = req.body
    console.log(body.descripcion)

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    })

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

//=================================
// Actualizar el nombre de la categoria
//=================================
app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id

    let body = _.pick(req.body, ['descripcion'])

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })

})

//=================================
// Borrar una categoria
//=================================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //Solo un administrador puede borrar categorias

    let id = req.params.id

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'El ID no existe'
                }
            })
        }

        res.json({
            ok: true,
            categoria: categoriaBorrada,
            message: 'Categoria borrada'
        })
    })
})



module.exports = app