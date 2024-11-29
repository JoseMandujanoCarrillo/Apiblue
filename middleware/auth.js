const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido', error: err.message });
    }

    // Validar el userId dentro del token
    const userId = user.userId.userId || user.userId; // Soporte para ambos formatos
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'El userId en el token no es un ObjectId válido' });
    }

    req.user_id = {
      userId: new mongoose.Types.ObjectId(userId),
      role: user.userId.role || user.role
    };

    next();
  });
}

module.exports = { authenticateToken };
