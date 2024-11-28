const jwt = require('jsonwebtoken');

// Generar un token
function generateToken(userId, role) {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Middleware para autenticar el token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Error de token:', err); // Depuración
            return res.status(403).json({ message: 'Token no válido' });
        }
        console.log('Token decodificado:', user); // Depuración
        req.user_id = { userId: user.userId, role: user.role };
        next();
    });
}

module.exports = { generateToken, authenticateToken };
