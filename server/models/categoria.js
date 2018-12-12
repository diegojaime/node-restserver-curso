const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

let Schema = mongoose.Schema

let categoria = new Schema({
    descripcion: {
        type: String,
        //unique: true,
        required: [true, 'El nombre de la categoria es obligatorio']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    estado: {
        type: Boolean,
        default: true
    }
})

categoria.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Categoria', categoria)