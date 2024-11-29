const express = require('express');
const { authenticateToken } = require('../middleware/auth2');
const ServiceRequest = require('../models/ServiceRequest');

const router = express.Router();

// Crear una nueva solicitud de servicio
/**
 * @swagger
 * /service-requests:
 *   post:
 *     summary: Crear una nueva solicitud de servicio
 *     description: Crea una solicitud de servicio para un enfermero y paciente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               nurse_id:
 *                 type: string
 *               patient_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               estado:
 *                 type: string
 *                 enum: [pendiente, en_progreso, completado]
 *               detalles:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               tarifa:
 *                 type: integer
 *               pago_realizado:
 *                 type: boolean
 *               pago_liberado:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Solicitud de servicio creada correctamente.
 *       400:
 *         description: Datos de entrada no válidos.
 *       401:
 *         description: No autorizado. Token no proporcionado o no válido.
 */
router.post('/', authenticateToken, async (req, res) => {
  const { user_id, nurse_id, patient_ids, estado, detalles, fecha, tarifa, pago_realizado, pago_liberado } = req.body;

  try {
      const newServiceRequest = new ServiceRequest({
          user_id,
          nurse_id,
          patient_ids,
          estado,
          detalles,
          fecha,
          tarifa,
          pago_realizado,
          pago_liberado,
      });

      // Guardar la solicitud de servicio en la base de datos
      const savedServiceRequest = await newServiceRequest.save();
      res.status(201).json(savedServiceRequest);
  } catch (err) {
      console.error('Error en la creación de la solicitud de servicio:', err);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
