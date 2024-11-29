const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
  paciente_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Patient'
  },
  enfermero_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Nurse'
  },
  usuario_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User' // Usuario autenticado que creó la solicitud
  },
  estado: {
    type: String,
    required: true
  },
  descripcion: {
    type: String
  },
  tarifa: {
    type: String
  },
  duracion: {
    type: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
