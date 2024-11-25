const express = require('express');
const Patient = require('../models/Patient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Endpoints para la gestión de pacientes
 */

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Obtener pacientes del usuario autenticado con paginación
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Lista de pacientes del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Número total de pacientes
 *                 page:
 *                   type: integer
 *                   description: Página actual
 *                 limit:
 *                   type: integer
 *                   description: Límite de pacientes por página
 *                 patients:
 *                   type: array
 *                   items:
 *                     properties:
 *                       name:
 *                         type: string
 *                       fecha_nacimiento:
 *                         type: string
 *                       genero:
 *                         type: string
 *                       movilidad:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *       500:
 *         description: Error al obtener los pacientes
 */
router.get('/', authenticateToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const userId = req.user.userId; // Extrae el ID del usuario autenticado
    const skip = (page - 1) * limit;

    const [total, patients] = await Promise.all([
      Patient.countDocuments({ usuario_id: userId }),
      Patient.find({ usuario_id: userId })
        .skip(skip)
        .limit(Number(limit))
    ]);

    const patientsWithoutID = patients.map(patient => {
      const { _id, ...patientData } = patient.toObject(); // Excluir `_id` del objeto
      return patientData;
    });

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      patients: patientsWithoutID
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pacientes', error: error.message });
  }
});

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Agregar un nuevo paciente
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *               genero:
 *                 type: string
 *               movilidad:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paciente agregado exitosamente
 *       400:
 *         description: Error al crear el paciente
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extrae el ID del usuario autenticado

    const newPatient = new Patient({
      ...req.body, // Datos enviados en el cuerpo de la solicitud
      usuario_id: userId // Asocia el paciente al usuario autenticado
    });

    await newPatient.save();

    const { _id, ...patientData } = newPatient.toObject(); // Excluir `_id` de la respuesta
    res.status(201).json(patientData);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el paciente', error: error.message });
  }
});

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Eliminar un paciente
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Paciente eliminado exitosamente
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Paciente no encontrado
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extrae el ID del usuario autenticado
    const { id } = req.params;

    const patient = await Patient.findOneAndDelete({ _id: id, usuario_id: userId });

    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado o acceso denegado' });
    }

    res.status(200).json({ message: 'Paciente eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el paciente', error: error.message });
  }
});

module.exports = router;
