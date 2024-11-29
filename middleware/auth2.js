const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Generar un token
function generateToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Middleware para autenticar el token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token no válido' });

    // Convertir userId a ObjectId si es necesario
    const userId = user.userId ? new mongoose.Types.ObjectId(user.userId) : null;

    // Validar si es un ObjectId válido
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'El userId en el token no es un ObjectId válido' });
    }

    req.user_id = { userId, role: user.role };
    next();
  });
}

module.exports = { generateToken, authenticateToken };
