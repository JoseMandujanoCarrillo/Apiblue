const express = require('express');
const ServiceRequest = require('../models/ServiceRequest');
const { authenticateToken } = require('../middleware/auth2');
const router = express.Router();

// Ruta GET para obtener todas las solicitudes de servicio
/**
 * @swagger
 * /service-requests:
 *   get:
 *     summary: Obtener todas las solicitudes de servicio
 *     tags:
 *       - ServiceRequests
 *     responses:
 *       200:
 *         description: Lista de solicitudes de servicio
 *       500:
 *         description: Error al obtener las solicitudes de servicio
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const serviceRequests = await ServiceRequest.find(); // Obtiene todas las solicitudes de servicio
        res.json(serviceRequests); // Devuelve las solicitudes encontradas
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener las solicitudes de servicio' }); // Manejo de errores
    }
});

// Ruta POST para crear una solicitud de servicio
/**
 * @swagger
 * /service-requests:
 *   post:
 *     summary: Crear una nueva solicitud de servicio
 *     tags:
 *       - ServiceRequests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               nurse_id:
 *                 type: string
 *               patient_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               estado:
 *                 type: string
 *               detalles:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               tarifa:
 *                 type: integer
 *               pago_realizado:
 *                 type: boolean
 *               pago_liberado:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Solicitud de servicio creada
 *       500:
 *         description: Error al crear la solicitud de servicio
 */
router.post('/', authenticateToken, async (req, res) => {
    // Extrae los datos del cuerpo de la solicitud
    const { user_id, nurse_id, patient_ids, estado, detalles, fecha, tarifa, pago_realizado, pago_liberado } = req.body;
    
    try {
        // Crea una nueva instancia del modelo de solicitud de servicio
        const newServiceRequest = new ServiceRequest({
            user_id,
            nurse_id,
            patient_ids,
            estado,
            detalles,
            fecha,
            tarifa,
            pago_realizado,
            pago_liberado,
        });

        // Guarda la nueva solicitud en la base de datos
        const savedServiceRequest = await newServiceRequest.save();
        res.status(201).json(savedServiceRequest); // Devuelve la solicitud creada con un código 201
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al crear la solicitud de servicio' }); // Manejo de errores
    }
});

module.exports = router;
