const express = require('express');
const mongoose = require('mongoose');
const ServiceRequest = require('../models/ServiceRequest');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ServiceRequests
 *   description: Gestión de solicitudes de servicio
 */

/**
 * @swagger
 * /service-requests:
 *   post:
 *     summary: Crear una solicitud de servicio
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nurse_id
 *               - patient_ids
 *               - fecha
 *               - tarifa
 *             properties:
 *               nurse_id:
 *                 type: string
 *                 description: ID del enfermero asignado
 *                 example: "64abc123efg456"
 *               patient_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de IDs de pacientes
 *                 example: ["64abc123efg456", "64def789hij101"]
 *               detalles:
 *                 type: string
 *                 description: Detalles del servicio
 *                 example: "Visita domiciliaria para control de presión arterial"
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha programada para el servicio
 *                 example: "2024-12-01T10:00:00Z"
 *               tarifa:
 *                 type: number
 *                 description: Tarifa del servicio
 *                 example: 1500
 *     responses:
 *       201:
 *         description: Solicitud de servicio creada exitosamente
 *       400:
 *         description: Error en los datos enviados
 *       403:
 *         description: No autorizado
 */

// Ruta para crear una nueva solicitud de servicio
router.post('/', authenticateToken, async (req, res) => {
  const { nurse_id, patient_ids, detalles, fecha, tarifa } = req.body;
  const { userId } = req.user_id;

  if (!userId) {
    return res.status(400).json({ message: 'El campo user_id es obligatorio' });
  }

  try {
    // Validar IDs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'El user_id no es un ObjectId válido' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const nurseObjectId = nurse_id ? new mongoose.Types.ObjectId(nurse_id) : null;
    const patientObjectIds = Array.isArray(patient_ids)
      ? patient_ids.map(id => {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`El ID de paciente "${id}" no es un ObjectId válido`);
          }
          return new mongoose.Types.ObjectId(id);
        })
      : [];

    // Crear la solicitud de servicio
    const serviceRequest = new ServiceRequest({
      user_id: userObjectId,
      nurse_id: nurseObjectId,
      patient_ids: patientObjectIds,
      detalles,
      fecha,
      tarifa,
    });

    const savedRequest = await serviceRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear ServiceRequest', error: error.message });
  }
});

/**
 * @swagger
 * /service-requests:
 *   get:
 *     summary: Obtener solicitudes creadas por el usuario
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes creadas por el usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceRequest'
 *       403:
 *         description: No autorizado
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const serviceRequests = await ServiceRequest.find({
      user_id: new mongoose.Types.ObjectId(req.user_id.userId),
    });
    res.status(200).json(serviceRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ServiceRequests', error: error.message });
  }
});

/**
 * @swagger
 * /service-requests/nurse:
 *   get:
 *     summary: Obtener solicitudes asignadas al enfermero autenticado
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes asignadas al enfermero autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceRequest'
 *       403:
 *         description: No autorizado
 */
router.get('/nurse', authenticateToken, async (req, res) => {
  try {
    const serviceRequests = await ServiceRequest.find({
      nurse_id: new mongoose.Types.ObjectId(req.user_id.userId),
    });
    res.status(200).json(serviceRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ServiceRequests', error: error.message });
  }
});

module.exports = router;
