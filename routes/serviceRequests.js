const express = require('express');
const ServiceRequest = require('../models/ServiceRequest');
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - nurse_id
 *               - patient_ids
 *               - fecha
 *               - tarifa
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID del usuario que está creando la solicitud
 *                 example: "64abc123efg456"
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
 */
router.post('/', async (req, res) => {
  const { user_id, nurse_id, patient_ids, detalles, fecha, tarifa } = req.body;

  // Verificamos que los campos requeridos estén presentes
  if (!user_id || !nurse_id || !patient_ids || !fecha || !tarifa) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    // Crear la solicitud de servicio con el user_id proporcionado
    const serviceRequest = new ServiceRequest({
      user_id,
      nurse_id,
      patient_ids,
      detalles,
      fecha,
      tarifa
    });

    // Guardar la solicitud en la base de datos
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
 *     responses:
 *       200:
 *         description: Lista de solicitudes creadas por el usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceRequest'
 *       400:
 *         description: Error en la solicitud
 */
router.get('/', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'El campo user_id es obligatorio' });
  }

  try {
    // Buscar solicitudes de servicio creadas por el usuario
    const serviceRequests = await ServiceRequest.find({ user_id });
    res.status(200).json(serviceRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ServiceRequests', error: error.message });
  }
});


/**
 * @swagger
 * /service-requests/nurse:
 *   get:
 *     summary: Obtener solicitudes asignadas al enfermero
 *     tags: [ServiceRequests]
 *     parameters:
 *       - in: query
 *         name: nurse_id
 *         schema:
 *           type: string
 *         description: ID del enfermero
 *         example: "64abc123efg456"
 *     responses:
 *       200:
 *         description: Lista de solicitudes asignadas al enfermero
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceRequest'
 *       400:
 *         description: Error en la solicitud
 */
router.get('/nurse', async (req, res) => {
  const { nurse_id } = req.query;

  if (!nurse_id) {
    return res.status(400).json({ message: 'El campo nurse_id es obligatorio' });
  }

  try {
    // Buscar las solicitudes de servicio asignadas al enfermero
    const serviceRequests = await ServiceRequest.find({ nurse_id });

    // Si no se encuentran solicitudes, devolver un mensaje
    if (serviceRequests.length === 0) {
      return res.status(404).json({ message: 'No hay solicitudes asignadas a este enfermero' });
    }

    res.status(200).json(serviceRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las solicitudes del enfermero', error: error.message });
  }
});

module.exports = router;
