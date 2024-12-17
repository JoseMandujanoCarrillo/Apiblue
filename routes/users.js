const express = require('express');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints para la gestión de usuarios
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registro de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - user_name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               user_name:
 *                 type: string
 *               password:
 *                 type: string
 *               foto:
 *                 type: string
 *               comidaFavorita:
 *                 type: string
 *               descuentoNavideño:
 *                 type: number
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en el registro
 */
router.post('/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    const token = generateToken({ userId: newUser._id, role: 'usuario' });
    res.status(201).json({ user: newUser, token });
  } catch (error) {
    res.status(400).json({ message: 'Error al registrar el usuario', error: error.message });
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Inicio de sesión de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_name
 *               - password
 *             properties:
 *               user_name:
 *                 type: string
 *                 description: "Nombre de usuario o correo electrónico del usuario"
 *               password:
 *                 type: string
 *                 description: "Contraseña del usuario"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', async (req, res) => {
  const { user_name, password } = req.body;

  try {
    const user = await User.findOne({ user_name, password });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = generateToken({ userId: user._id, role: 'usuario' });
    res.json({ token, role: 'usuario' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el inicio de sesión', error: error.message });
  }
});

/**
 * @swagger
 * /users/panel:
 *   get:
 *     summary: Acceso al panel principal del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso al panel principal del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bienvenido al panel principal"
 *                 opciones:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Buscar Enfermeros", "Mis Pacientes"]
 *       401:
 *         description: No autorizado, token no proporcionado o inválido
 */
router.get('/panel', authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Bienvenido al panel principal",
    opciones: ["Buscar Enfermeros", "Mis Pacientes"]
  });
});

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtener la información del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado, token no proporcionado o inválido
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // `req.user` contiene el userId después de ser decodificado por `authenticateToken`
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
  }
});

module.exports = router;
