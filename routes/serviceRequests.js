const express = require('express');
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
router.post('/', authenticateToken, async (req, res) => {
  const { nurse_id, patient_ids, detalles, fecha, tarifa } = req.body;

  if (!nurse_id || !patient_ids || !fecha || !tarifa) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  // Aseguramos que solo los usuarios con rol 'usuario' puedan crear solicitudes
  // if (req.user_id.role !== 'usuario') {
  //   return res.status(403).json({ message: 'No autorizado para crear ServiceRequest' });
  // }

  try {
    const serviceRequest = new ServiceRequest({
      user_id: req.user_id.userId, // usas req.user_id.userId como el ID del usuario que hace la solicitud
      nurse_id,
      patient_ids,
      detalles,
      fecha,
      tarifa
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
  // Verificamos que el usuario tenga rol 'usuario'
  // if (req.user_id.role !== 'usuario') {
  //   return res.status(403).json({ message: 'No autorizado para ver estas solicitudes' });
  // }

  try {
    const serviceRequests = await ServiceRequest.find({ user_id: req.user_id.userId });
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
  // Verificamos que el usuario tenga rol 'enfermero'
  // if (req.user_id.role !== 'enfermero') {
  //   return res.status(403).json({ message: 'No autorizado para ver estas solicitudes' });
  // }

  try {
    const serviceRequests = await ServiceRequest.find({ nurse_id: req.user_id.userId });
    res.status(200).json(serviceRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ServiceRequests', error: error.message });
  }
});

module.exports = router;
