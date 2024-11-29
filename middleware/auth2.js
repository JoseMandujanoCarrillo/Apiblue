const jwt = require('jsonwebtoken');

// Generar un token
function generateToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Middleware para autenticar el token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token no válido' });

    // Validar que el `userId` sea una cadena válida
    if (typeof user.userId !== 'string' || !user.userId.trim()) {
      return res.status(400).json({ message: 'El userId en el token no es válido' });
    }

    req.user_id = { userId: user.userId, role: user.role }; // Asignamos `userId` directamente como cadena
    next();
  });
}

module.exports = { generateToken, authenticateToken };
