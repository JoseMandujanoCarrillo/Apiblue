const jwt = require('jsonwebtoken');

// Generar un token JWT
function generateToken(userId, role) {
    return jwt.sign(
        { userId, role }, // Payload: incluye el ID y el rol del usuario
        process.env.JWT_SECRET || 'tu_secreto_jwt', // Clave secreta
        { expiresIn: '1h' } // Configuración de expiración
    );
}

// Middleware para autenticar el token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token no válido' });
        }
        req.user = user; // Decodificamos el usuario y lo añadimos a `req.user`
        next();
    });
}

module.exports = { generateToken, authenticateToken };
