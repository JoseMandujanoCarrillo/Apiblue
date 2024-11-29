const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Generar un token
function generateToken(userId, role) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('userId no es un ObjectId válido al generar el token');
  }

  return jwt.sign({ userId: String(userId), role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Middleware para autenticar el token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token no válido' });

    // Validar y convertir userId a ObjectId
    if (!mongoose.Types.ObjectId.isValid(user.userId)) {
      return res.status(400).json({ message: 'El userId en el token no es un ObjectId válido' });
    }

    req.user_id = { userId: new mongoose.Types.ObjectId(user.userId), role: user.role };
    next();
  });
}

module.exports = { generateToken, authenticateToken };