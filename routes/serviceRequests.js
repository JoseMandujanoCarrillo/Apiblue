const express = require('express');
const ServiceRequest = require('../models/ServiceRequest'); // Modelo de solicitud de servicio
const mongoose = require('mongoose'); // Necesario para trabajar con ObjectId

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

  // Validar que el user_id sea un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).json({ message: 'El user_id no es un ObjectId válido' });
  }

  try {
    // Asegurarse de convertir el user_id a ObjectId
    const validUserId = new mongoose.Types.ObjectId(user_id);

    // Crear la nueva solicitud de servicio
    const newServiceRequest = new ServiceRequest({
      paciente_id,
      enfermero_id,
      usuario_id: validUserId, // Usar el user_id convertido a ObjectId
      estado,
      descripcion,
      tarifa,
      duracion
    });

    await newServiceRequest.save();

    // Excluir `_id` en la respuesta para mantener consistencia
    const { _id, ...serviceRequestData } = newServiceRequest.toObject(); 

    res.status(201).json(serviceRequestData);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la solicitud', error: error.message });
  }
});

module.exports = router;
