const jwt = require('jsonwebtoken');

// Generar un token
function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Middleware para autenticar el token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token no válido' });
        req.userId = user.userId; // Asigna el `userId` al objeto `req` para que pueda ser accesible en las rutas protegidas
        next();
    });
}

module.exports = { generateToken, authenticateToken };
