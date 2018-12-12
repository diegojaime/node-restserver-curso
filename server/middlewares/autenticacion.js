const jwt = require('jsonwebtoken')

const Categoria = require('../models/categoria')

//=========================
//   Verificar token
//=========================

let verificaToken = (req, res, next) => {

    let token = req.get('token')

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            //Código 401 para errores tipo unauthorized
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            })
        }

        req.usuario = decoded.usuario
            //console.log(token)
        next()
    })

    //res.json({
    //    token: token
    //})  
}

//=========================
//   Verificar Admin Role
//=========================
let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario

    if (usuario.role !== "ADMIN_ROLE") {
        return res.json({
            ok: false,
            err: {
                mensaje: 'El usuario no es administrador'
            }
        })
    } else {
        next()
    }
}

let verificaCategoria = (req, res, next) => {

    Categoria.findOne({ estado: true, categoria: req.body.categoria }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    mensaje: 'Categoria no valida'
                }
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
        next()
    })
}

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaCategoria
}