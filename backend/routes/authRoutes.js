const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    console.log('Solicitud de registro recibida:', req.body);
    const { name, email, password } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password) {
      console.log('Campos faltantes en el registro');
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Intento de registro con email existente:', email);
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Crear nuevo usuario
    const user = new User({
      name,
      email,
      password
    });
    await user.save();
    console.log('Nuevo usuario creado:', { id: user.id, email: user.email });

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('Token generado para el usuario');

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
    console.log('Respuesta de registro enviada exitosamente');
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    console.log('Solicitud de login recibida:', { email: req.body.email });
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      console.log('Campos faltantes en el login');
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Intento de login con email no registrado:', email);
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Contraseña incorrecta para el usuario:', email);
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    console.log('Login exitoso para el usuario:', email);

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('Token generado para el usuario:', email);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
    console.log('Respuesta de login enviada exitosamente');
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Ruta protegida para verificar usuario actual
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Solicitud a ruta protegida /me recibida');
    
    if (!req.user || !req.user.id) {
      console.log('No se encontró usuario en la solicitud');
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    console.log('Buscando usuario con ID:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('Usuario no encontrado en la base de datos');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    console.log('Usuario encontrado:', user.email);
    res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error.message);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

module.exports = router;