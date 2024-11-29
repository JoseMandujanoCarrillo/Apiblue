const express = require('express');
const mongoose = require('mongoose');
const ServiceRequest = require('../models/ServiceRequest');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ServiceRequests
 *   description: Endpoints para la gestión de solicitudes de servicio
 */

/**
 * @swagger
 * /service-requests:
 *   get:
 *     summary: Obtener solicitudes del usuario autenticado con paginación
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de la página (por defecto 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de elementos por página (por defecto 10)
 *     responses:
 *       200:
 *         description: Lista de solicitudes de servicio del usuario autenticado
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
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error al obtener las solicitudes
 */
router.get('/', authenticateToken, async (req, res) => {
  const { user_id, page = 1, limit = 10 } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'El campo user_id es obligatorio' });
  }

  try {
    const skip = (page - 1) * limit;

    const [total, serviceRequests] = await Promise.all([
      ServiceRequest.countDocuments({ user_id: user_id }),
      ServiceRequest.find({ user_id: user_id })
        .skip(skip)
        .limit(Number(limit))
        .populate('patient_ids', 'name fecha_nacimiento genero descripcion')
    ]);

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      requests: serviceRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las solicitudes', error: error.message });
  }
});

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
 *               - user_id
 *               - nurse_id
 *               - patient_ids
 *               - fecha
 *               - tarifa
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID del usuario que crea la solicitud
 *               nurse_id:
 *                 type: string
 *                 description: ID del enfermero asignado
 *               patient_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de los pacientes seleccionados
 *               detalles:
 *                 type: string
 *                 description: Detalles del servicio
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha programada para el servicio
 *               tarifa:
 *                 type: number
 *                 description: Tarifa del servicio
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *       400:
 *         description: Error en los datos enviados
 */
router.post('/', authenticateToken, async (req, res) => {
  const { user_id, nurse_id, patient_ids, detalles, fecha, tarifa } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'El campo user_id es obligatorio' });
  }

  try {
    const newRequest = new ServiceRequest({
      user_id,
      nurse_id: new mongoose.Types.ObjectId(nurse_id),
      patient_ids: patient_ids.map(id => new mongoose.Types.ObjectId(id)),
      detalles,
      fecha,
      tarifa
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la solicitud de servicio', error: error.message });
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
 *         description: ID de la solicitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, aceptada, completada]
 *                 description: Nuevo estado de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud actualizada exitosamente
 *       400:
 *         description: Error al actualizar la solicitud
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const { estado } = req.body;

  if (!['pendiente', 'aceptada', 'rechazada', 'completada'].includes(estado)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  try {
    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    res.status(200).json(updatedRequest);
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
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud eliminada exitosamente
 *       404:
 *         description: Solicitud no encontrada
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedRequest = await ServiceRequest.findByIdAndDelete(req.params.id);

    if (!deletedRequest) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    res.status(200).json({ message: 'Solicitud eliminada exitosamente' });
  } catch (error) {
    res.status(400).json({ message: 'Error al eliminar la solicitud', error: error.message });
  }
});

module.exports = router;
