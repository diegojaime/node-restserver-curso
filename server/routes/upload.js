const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const path = require('path')

const app = express()

const Usuario = require('../models/usuario')
const Producto = require('../models/producto')

//Middleware para usar el fileUpload coloca todo lo que se cargue en req.files
app.use(fileUpload())

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo
    let id = req.params.id

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                mensaje: 'No se subio ningún archivo'
            }
        })
    }

    //Validador de tipos de archivos
    let tiposValidos = ['productos', 'usuarios']

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                mensaje: 'Los tipos validos son: ' + tiposValidos.join(', '),
                tipo
            }
        })
    }

    let archivo = req.files.archivo

    let nombreCortado = archivo.name.split('.')
    let extension = nombreCortado[nombreCortado.length - 1]

    //Extensiones validas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg']

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                mensaje: 'Las extensiones permitidas son: ' + extensionesValidas.join(', '),
                ext: extension
            }
        })
    }

    //Cambiar nombre del archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (tipo === 'usuarios') {
            //Actualizamos imagen del usuario
            imagenUsuario(id, res, nombreArchivo)
        } else {
            imagenProducto(id, res, nombreArchivo)
        }

        /*res.json({
            ok: true,
            mensaje: 'Archivo subido correctamente'
        })*/
    })
})

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios')
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios')
            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'El id no corresponde a ningún usuario'
                }
            })
        }

        /*
        //Verificamos que exista una imagen para el usuario en la base de datos
        let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${usuarioDB.img}`)
        if (fs.existsSync(pathImagen)) {
            fs.unlinkSync(pathImagen)
        }
        */

        borraArchivo(usuarioDB.img, 'usuarios')

        usuarioDB.img = nombreArchivo

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })
    })
}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'productos')
            res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos')
            res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'El id no corresponde a ningún producto'
                }
            })
        }

        borraArchivo(productoDB.img, 'productos')
        productoDB.img = nombreArchivo

        productoDB.save((err, productoGuardado) => {

            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        })

    })

}

function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`)
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen)
    }
}

module.exports = app