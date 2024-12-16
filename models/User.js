// ./models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user_name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  foto: { type: String },
  verificado: { type: String, default: 'No' },
  comidaFavorita: { type: String, default: 'No especificada' }, // Nuevo campo
  descuentoNavideño: { type: Number, default: 0 }, // Nuevo campo
});

module.exports = mongoose.model('User', UserSchema, 'Colección Usuarios2');
