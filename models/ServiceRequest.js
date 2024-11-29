const mongoose = require('mongoose');

// Definir el esquema para la solicitud de servicio
const serviceRequestSchema = new mongoose.Schema({
    user_id: { 
        type: String,  // Puede ser un string o un ObjectId
        required: true 
    },
    nurse_id: { 
        type: String, 
        required: true 
    },
    patient_ids: { 
        type: [String], 
        required: true 
    },
    estado: { 
        type: String, 
        enum: ['pendiente', 'en_progreso', 'completado'], 
        default: 'pendiente' 
    },
    detalles: { 
        type: String, 
        required: true 
    },
    fecha: { 
        type: Date, 
        required: true 
    },
    tarifa: { 
        type: Number, 
        default: 0 
    },
    pago_realizado: { 
        type: Boolean, 
        default: false 
    },
    pago_liberado: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });  // Agrega los campos createdAt y updatedAt automáticamente

// Crear el modelo
const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

// Exportar el modelo
module.exports = ServiceRequest;
