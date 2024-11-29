const express = require('express');
const ServiceRequest = require('../models/ServiceRequest'); // Modelo de solicitud de servicio
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /service-requests:
 *   post:
 *     summary: Crear una nueva solicitud de servicio
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *       401:
 *         description: Token no proporcionado o no válido
 */
router.post('/', authenticateToken, async (req, res) => {
  const { paciente_id, enfermero_id, estado, descripcion, tarifa, duracion } = req.body;
  const { userId } = req.user_id; // Extraer `userId` del token, ya validado como ObjectId

  // Validar campos obligatorios
  if (!paciente_id || !enfermero_id || !estado) {
    return res.status(400).json({ message: 'paciente_id, enfermero_id y estado son obligatorios' });
  }

  // Validar que el userId esté presente y sea un ObjectId válido
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'El userId en el token no es válido' });
  }

  try {
    // Crear la nueva solicitud de servicio
    const newServiceRequest = new ServiceRequest({
      paciente_id,
      enfermero_id,
      usuario_id: userId, // Asociar al usuario autenticado (con ObjectId válido)
      estado,
      descripcion,
      tarifa,
      duracion,
    });

    await newServiceRequest.save();

    const { _id, ...serviceRequestData } = newServiceRequest.toObject(); // Excluir `_id` de la respuesta
    res.status(201).json(serviceRequestData);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la solicitud', error: error.message });
  }
});

module.exports = router;
