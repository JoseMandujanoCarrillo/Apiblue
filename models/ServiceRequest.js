const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId, // ID del usuario que creó la solicitud
    ref: 'User',
    required: true
  },
  nurse_id: { 
    type: String, // ID del enfermero asignado
    required: true
  },
  patient_ids: [{ 
    type: String, // Lista de pacientes asignados a la solicitud
    required: true 
  }],
  estado: { 
    type: String, 
    default: 'pendiente' 
  },
  detalles: { 
    type: String 
  },
  fecha: { 
    type: Date, 
    required: true 
  },
  tarifa: { 
    type: Number, 
    required: true 
  },
  pago_realizado: { 
    type: Boolean, 
    default: false 
  },
  pago_liberado: { 
    type: Boolean, 
    default: false 
  },
  documentacion_servicio: { 
    type: String 
  },
  observaciones: { 
    type: String 
  },
  recomendaciones: { 
    type: String 
  }
});

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
