const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

let Schema = mongoose.Schema

let rolesValidos = {
    values: ['USER_ROLE', 'ADMIN_ROLE'],
    message: '{VALUE} no es un rol válido'
}

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es un campo obligatorio']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El email es un campo obligatorio']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es un campo obligatorio']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: rolesValidos,
        default: 'USER_ROLE'
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
})

//Cuando se quiera convertir el usuarioSchema a un objeto tipo JSON borramos el password para que no se imprima
usuarioSchema.methods.toJSON = function() {
    let user = this
    let userObject = user.toObject()
    delete userObject.password

    return userObject
}

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

module.exports = mongoose.model('Usuario', usuarioSchema)