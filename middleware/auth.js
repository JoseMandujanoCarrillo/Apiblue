const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido', error: err.message });
    }

    // Detectar la estructura del token (cadena directa o anidada)
    const userId = typeof payload.userId === 'string' 
      ? payload.userId 
      : payload.userId?.userId;

    const role = typeof payload.userId === 'string'
      ? payload.role
      : payload.userId?.role;

    // Validar el userId como ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'El userId en el token no es un ObjectId válido' });
    }

    // Pasar el userId y el role al request
    req.user_id = {
      userId: new mongoose.Types.ObjectId(userId),
      role
    };

    next();
  });
}

module.exports = { authenticateToken };
