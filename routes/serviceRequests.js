const express = require('express');
const Patient = require('../models/Patient'); // Modelo de Paciente
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Crear un nuevo paciente
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
 *                 description: Nombre del paciente
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de nacimiento del paciente
 *               genero:
 *                 type: string
 *                 description: Género del paciente
 *               movilidad:
 *                 type: string
 *                 description: Movilidad del paciente
 *               descripcion:
 *                 type: string
 *                 description: Descripción adicional del paciente
 *     responses:
 *       201:
 *         description: Paciente creado exitosamente
 *       400:
 *         description: Error al crear el paciente
 *       401:
 *         description: Token no proporcionado o no válido
 */
router.post('/', authenticateToken, async (req, res) => {
  const { name, fecha_nacimiento, genero, movilidad, descripcion } = req.body;
  const { userId } = req.user_id;

  // Validar que el userId sea un ObjectId válido
  if (!userId) {
    return res.status(400).json({ message: 'El userId en el token no es válido' });
  }

  if (!name || !fecha_nacimiento || !genero) {
    return res.status(400).json({ message: 'Los campos name, fecha_nacimiento y genero son obligatorios' });
  }

  try {
    const newPatient = new Patient({
      name,
      fecha_nacimiento,
      genero,
      movilidad,
      descripcion,
      usuario_id: userId // Asociar el paciente al usuario autenticado
    });

    await newPatient.save();

    res.status(201).json(newPatient);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el paciente', error: error.message });
  }
});

module.exports = router;
