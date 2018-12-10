const jwt = require('jsonwebtoken')

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

module.exports = {
    verificaToken,
    verificaAdmin_Role
}