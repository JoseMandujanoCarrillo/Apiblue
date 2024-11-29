const express = require('express');
const mongoose = require('mongoose');
const ServiceRequest = require('../models/ServiceRequest');
const { authenticateToken } = require('../middleware/auth2');

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
 *         description: Solicitud creada exitosamente
 *       400:
 *         description: Error al crear la solicitud
 *       403:
 *         description: No autorizado
 */
router.post('/', authenticateToken, async (req, res) => {
  const { nurse_id, patient_ids, detalles, fecha, tarifa } = req.body;
  const { userId } = req.user_id;

  try {
    const serviceRequest = new ServiceRequest({
      user_id: userId,
      nurse_id: new mongoose.Types.ObjectId(nurse_id),
      patient_ids: patient_ids.map(id => new mongoose.Types.ObjectId(id)),
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
 *     summary: Obtener solicitudes creadas por el usuario o asignadas al enfermero autenticado
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, aceptada, completada]
 *           description: Filtrar solicitudes por estado
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           description: Número de solicitudes por página
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 requests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceRequest'
 */
router.get('/', authenticateToken, async (req, res) => {
  const { estado, page = 1, limit = 10 } = req.query;
  const { userId } = req.user_id;

  try {
    const filter = {
      $or: [
        { user_id: userId },
        { nurse_id: userId },
      ],
    };

    if (estado) {
      filter.estado = estado;
    }

    const skip = (page - 1) * limit;

    const [total, requests] = await Promise.all([
      ServiceRequest.countDocuments(filter),
      ServiceRequest.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .populate('patient_ids', 'name fecha_nacimiento genero descripcion'),
    ]);

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      requests,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ServiceRequests', error: error.message });
  }
});

/**
 * @swagger
 * /service-requests/{id}:
 *   put:
 *     summary: Actualizar el estado de una solicitud
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: ID de la solicitud a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, aceptada, rechazada, completada]
 *                 description: Nuevo estado de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud actualizada exitosamente
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Solicitud no encontrada
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const { estado } = req.body;
  const { userId } = req.user_id;

  if (!['pendiente', 'aceptada', 'rechazada', 'completada'].includes(estado)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  try {
    const serviceRequest = await ServiceRequest.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user_id: userId }, { nurse_id: userId }] },
      { estado },
      { new: true }
    );

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    res.status(200).json(serviceRequest);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la solicitud', error: error.message });
  }
});

/**
 * @swagger
 * /service-requests/{id}:
 *   delete:
 *     summary: Eliminar una solicitud de servicio
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: ID de la solicitud a eliminar
 *     responses:
 *       200:
 *         description: Solicitud eliminada exitosamente
 *       404:
 *         description: Solicitud no encontrada
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const { userId } = req.user_id;

  try {
    const serviceRequest = await ServiceRequest.findOneAndDelete({
      _id: req.params.id,
      user_id: userId,
    });

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    res.status(200).json({ message: 'Solicitud eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la solicitud', error: error.message });
  }
});

module.exports = router;
