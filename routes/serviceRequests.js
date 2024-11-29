const express = require('express');
const Patient = require('../models/Patient');
const { authenticateToken } = require('../middleware/auth2');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Servicios
 *   description: Endpoints para la gestión de Servicios
 */

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
  const { user_id, nurse_id, patient_ids, estado, detalles, fecha, tarifa, pago_realizado, pago_liberado } = req.body;
  if (!user_id) {
    return res.status(400).json({ message: 'El campo user_id es obligatorio' });
  }

  try {
    const newServiceRequest = new ServiceRequest({
      usuario_id: user_id,
      nurse_id,
      patient_ids,
      estado,
      detalles,
      fecha,
      tarifa,
      pago_realizado,
      pago_liberado,
    });

    await newService.save();

    const { _id, ...ServiceData } = newService.toObject(); // Excluir `_id` de la respuesta
    res.status(201).json(ServiceData);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el Servicio', error: error.message });
  }
});

module.exports = router;
