const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Generar un token JWT con `userId` y `role`
function generateToken(userId, role) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('El userId proporcionado no es un ObjectId válido');
  }

  return jwt.sign({ userId: userId.toString(), role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Middleware para autenticar y validar el token
function authenticateToken(req, res, next) {
  const authorizationHeader = req.headers['authorization'];

  // Extraer el token del encabezado `Authorization`
  if (!authorizationHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  // Verificar el token y validar el contenido
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido', error: err.message });
    }

    const { userId, role } = payload;

    // Validar que el userId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'El userId en el token no es un ObjectId válido' });
    }

    // Añadir datos del usuario autenticado al request
    req.user_id = { userId: new mongoose.Types.ObjectId(userId), role };
    next();
  });
}

module.exports = { generateToken, authenticateToken };
