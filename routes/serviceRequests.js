const express = require('express');
const ServiceRequest = require('../models/ServiceRequest'); // Modelo de solicitud de servicio

const router = express.Router();

/**
 * @swagger
 * /service-requests:
 *   post:
 *     summary: Crear una nueva solicitud de servicio
 *     tags: [ServiceRequests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID del usuario (quien realiza la solicitud)
 *               paciente_id:
 *                 type: string
 *                 description: ID del paciente
 *               enfermero_id:
 *                 type: string
 *                 description: ID del enfermero
 *               estado:
 *                 type: string
 *                 description: Estado de la solicitud
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la solicitud
 *               tarifa:
 *                 type: string
 *                 description: Tarifa del servicio
 *               duracion:
 *                 type: integer
 *                 description: Duración del servicio en horas
 *     responses:
 *       201:
 *         description: Solicitud de servicio creada exitosamente
 *       400:
 *         description: Error al crear la solicitud
 */
router.post('/', async (req, res) => {
  const { user_id, paciente_id, enfermero_id, estado, descripcion, tarifa, duracion } = req.body;

  // Validar campos obligatorios
  if (!user_id || !paciente_id || !enfermero_id || !estado) {
    return res.status(400).json({ message: 'user_id, paciente_id, enfermero_id y estado son obligatorios' });
  }

  try {
    // Crear la nueva solicitud de servicio
    const newServiceRequest = new ServiceRequest({
      paciente_id,
      enfermero_id,
      usuario_id: user_id, // Usar directamente el `user_id` recibido
      estado,
      descripcion,
      tarifa,
      duracion
    });

    await newServiceRequest.save();

    res.status(201).json(newServiceRequest);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la solicitud', error: error.message });
  }
});

module.exports = router;
