const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Verificar si hay token en el header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.log('No se encontró el encabezado de autorización');
      return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : authHeader;
    if (!token) {
      console.log('Token vacío después de procesar el encabezado');
      return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    console.log('Procesando token:', token.substring(0, 10) + '...');

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verificado, userId:', decoded.userId);

    // Buscar usuario
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('Usuario no encontrado con ID:', decoded.userId);
      return res.status(401).json({ message: 'Usuario no encontrado.' });
    }

    console.log('Usuario autenticado:', user.email);

    // Añadir usuario al objeto request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en la autenticación:', error.message);
    res.status(401).json({ message: 'Token inválido. Acceso denegado.' });
  }
};

module.exports = auth;