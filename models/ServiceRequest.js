const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.Mixed, // Permite almacenar objetos
    required: true,
  },
  nurse_id: { type: String, required: true },
  patient_ids: [{ type: String, required: true }],
  estado: { type: String, default: 'pendiente' },
  detalles: { type: String },
  fecha: { type: Date, required: true },
  tarifa: { type: Number, required: true },
  pago_realizado: { type: Boolean, default: false },
  pago_liberado: { type: Boolean, default: false },
  documentacion_servicio: { type: String },
  observaciones: { type: String },
  recomendaciones: { type: String },
});

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
