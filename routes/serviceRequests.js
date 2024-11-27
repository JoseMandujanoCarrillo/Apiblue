const express = require('express');
const ServiceRequest = require('../models/ServiceRequest');
const Patient = require('../models/Patient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ServiceRequests
 *   description: Endpoints para la gestión de solicitudes de servicio de enfermería
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
 *             properties:
 *               user_id:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     description: "ID del usuario"
 *                   role:
 *                     type: string
 *                     description: "Rol del usuario"
 *               nurse_id:
 *                 type: string
 *                 description: "ID del enfermero asignado"
 *               patient_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "IDs de los pacientes seleccionados para el servicio"
 *               detalles:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date
 *               tarifa:
 *                 type: number
 *     responses:
 *       201:
 *         description: Solicitud de servicio creada exitosamente
 *       400:
 *         description: Error al crear la solicitud de servicio
 */
router.post('/', authenticateToken, async (req, res) => {
  const { nurse_id, patient_ids, detalles, fecha, tarifa } = req.body;

  try {
    // Verificar que los pacientes pertenecen al usuario autenticado
    const validPatients = await Patient.find({
      _id: { $in: patient_ids },
      usuario_id: req.userId, // Aquí se utiliza el ID del usuario autenticado
    });

    if (validPatients.length !== patient_ids.length) {
      return res.status(403).json({ message: 'Acceso denegado a uno o más pacientes seleccionados' });
    }

    // Crear la nueva solicitud con user_id como objeto
    const newRequest = new ServiceRequest({
      user_id: { userId: req.userId, role: req.userRole }, // Usamos el userId y rol desde el token
      nurse_id,
      patient_ids,
      detalles,
      fecha,
      tarifa,
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la solicitud de servicio', error: error.message });
  }
});

/**
 * @swagger
 * /service-requests:
 *   get:
 *     summary: Obtener todas las solicitudes del usuario o enfermero autenticado
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, aceptada, completada]
 *         description: Filtrar solicitudes por estado
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
 *         description: Lista de solicitudes de servicio
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
 *       500:
 *         description: Error al obtener las solicitudes
 */
router.get('/', authenticateToken, async (req, res) => {
  const { estado, page = 1, limit = 10 } = req.query;

  try {
    const filter = {
      $or: [
        { 'user_id.userId': req.userId }, // Filtrar por `user_id.userId`
        { nurse_id: req.userId },
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
    res.status(500).json({ message: 'Error al obtener las solicitudes', error: error.message });
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
 *         description: ID de la solicitud de servicio
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
 *         description: Estado de la solicitud actualizado exitosamente
 *       400:
 *         description: Error al actualizar la solicitud
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const { estado } = req.body;

  if (!['pendiente', 'aceptada', 'rechazada', 'completada'].includes(estado)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  try {
    const serviceRequest = await ServiceRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { 'user_id.userId': req.userId }, // Verificar userId dentro de user_id
          { nurse_id: req.userId },
        ],
      },
      { estado },
      { new: true }
    );

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Solicitud de servicio no encontrada' });
    }

    res.status(200).json({ message: `Solicitud ${estado} exitosamente`, serviceRequest });
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la solicitud', error: error.message });
  }
});

/**
 * @swagger
 * /service-requests/{id}:
 *   delete:
 *     summary: Eliminar una solicitud de servicio creada por el usuario
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de servicio
 *     responses:
 *       200:
 *         description: Solicitud eliminada exitosamente
 *       404:
 *         description: Solicitud no encontrada
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findOneAndDelete({
      _id: req.params.id,
      'user_id.userId': req.userId, // Verificar userId dentro de user_id
    });

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Solicitud de servicio no encontrada' });
    }

    res.status(200).json({ message: 'Solicitud eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la solicitud', error: error.message });
  }
});

module.exports = router;
