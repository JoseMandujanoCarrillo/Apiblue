const express = require('express');
const ServiceRequest = require('../models/ServiceRequest'); // Importar el modelo
const { authenticateToken } = require('../middleware/auth2');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Servicios
 *   description: Endpoints para la gestión de Servicios
 */

// Ruta GET para obtener las solicitudes de servicio de un enfermero específico (filtrando por nurse_id)
/**
 * @swagger
 * /service-requests/nurse/{nurse_id}:
 *   get:
 *     summary: Obtener solicitudes de servicio de un enfermero específico
 *     tags:
 *       - ServiceRequests
 *     parameters:
 *       - name: nurse_id
 *         in: path
 *         description: ID del enfermero
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de solicitudes de servicio para el enfermero
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceRequest'
 *       404:
 *         description: No se encontraron solicitudes para este enfermero
 *       500:
 *         description: Error al obtener las solicitudes de servicio
 */
router.get('/nurse/:nurse_id', authenticateToken, async (req, res) => {
  const { nurse_id } = req.params;

  try {
    // Obtener las solicitudes de servicio que tienen el nurse_id igual al proporcionado
    const serviceRequests = await ServiceRequest.find({ nurse_id });

    if (serviceRequests.length === 0) {
      return res.status(404).json({ message: 'No se encontraron solicitudes para este enfermero' });
    }

    res.json(serviceRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener las solicitudes de servicio' });
  }
});

// Ruta PUT para modificar el estado de una solicitud de servicio
/**
 * @swagger
 * /service-requests/{id}/estado:
 *   put:
 *     summary: Modificar el estado de una solicitud de servicio
 *     tags:
 *       - ServiceRequests
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID de la solicitud de servicio
 *         required: true
 *         schema:
 *           type: string
 *       - name: estado
 *         in: body
 *         description: Estado que se actualizará
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             estado:
 *               type: string
 *               enum: ['pendiente', 'en_progreso', 'completado']
 *               description: El nuevo estado de la solicitud
 *     responses:
 *       200:
 *         description: Estado de la solicitud actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 serviceRequest:
 *                   $ref: '#/components/schemas/ServiceRequest'
 *       400:
 *         description: El estado proporcionado no es válido o la solicitud no existe
 *       403:
 *         description: El enfermero no tiene permiso para modificar esta solicitud
 *       500:
 *         description: Error al modificar el estado de la solicitud
 */
router.put('/:id/estado', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado || !['pendiente', 'en_progreso', 'completado'].includes(estado)) {
    return res.status(400).json({ message: 'Estado no válido' });
  }

  try {
    // Obtener la solicitud de servicio por su ID
    const serviceRequest = await ServiceRequest.findById(id);

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Solicitud de servicio no encontrada' });
    }

    // Verificar que el enfermero que está haciendo la solicitud tenga el mismo nurse_id
    if (serviceRequest.nurse_id !== req.user_id.userId) {
      return res.status(403).json({ message: 'No tienes permiso para modificar esta solicitud' });
    }

    // Actualizar el estado
    serviceRequest.estado = estado;
    await serviceRequest.save();

    res.json({ message: 'Estado actualizado correctamente', serviceRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al modificar el estado de la solicitud' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user_id:
 *           type: string
 *         nurse_id:
 *           type: string
 *         patient_ids:
 *           type: array
 *           items:
 *             type: string
 *         estado:
 *           type: string
 *           enum: ['pendiente', 'en_progreso', 'completado']
 *         detalles:
 *           type: string
 *         fecha:
 *           type: string
 *           format: date-time
 *         tarifa:
 *           type: integer
 *         pago_realizado:
 *           type: boolean
 *         pago_liberado:
 *           type: boolean
 *       required:
 *         - user_id
 *         - nurse_id
 *         - patient_ids
 *         - estado
 *         - detalles
 *         - fecha
 *         - tarifa
 *         - pago_realizado
 *         - pago_liberado
 */

module.exports = router;
