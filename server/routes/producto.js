const express = require('express')
const _ = require('underscore')

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion')

let app = express()
const Producto = require('../models/producto')

//=========================
// Obtener productos
//=========================
app.get('/productos', verificaToken, (req, res) => {
    //Obtener todos los productos
    //populate: usuario y categoria
    //paginado

    let desde = Number(req.query.desde) || 0

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            Producto.count({ disponible: true }, (err, conteo) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }

                res.json({
                    ok: true,
                    productos,
                    Productos_disponibles: conteo
                })
            })
        })

})


//===========================
// Obtener un producto por ID
//===========================
app.get('/productos/:id', verificaToken, (req, res) => {
    //populate: usuario y categoria
    let id = req.params.id

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                producto: productoDB
            })
        })
})

//===========================
// Buscar productos
//===========================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino

    //Creamos una expresion regular para que se desplieguen los resultados aunque no sea un match exacto
    let regex = new RegExp(termino, 'i')

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            })
        })
})


//===========================
// Crear un nuevo producto
//===========================
app.post('/productos', [verificaToken], (req, res) => {
    //Grabar el usuario
    //Grabar una categoria del listado de categorias
    let body = req.body

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    })

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        })
    })
})

//===========================
// Actualizar un producto
//===========================
app.put('/productos/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria'])

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'El producto no esta en la base de datos'
                }
            })
        }

        res.json({
            ok: true,
            producto: productoDB
        })

    })

})


//===========================
// Borrar un producto
//===========================
app.delete('/productos/:id', verificaToken, (req, res) => {
    //Marcarlo como no disponible
    let id = req.params.id

    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'El producto no esta en la base de datos'
                }
            })
        }

        res.json({
            ok: true,
            producto: productoDB,
            mensaje: 'Producto deshabilitado de la base de datos'
        })

    })
})

module.exports = app