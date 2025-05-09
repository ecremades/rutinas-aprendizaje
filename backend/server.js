const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Rutas básicas
app.get('/', (req, res) => {
  res.send('API del Generador de Rutinas funcionando');
});

// Importar y usar rutas de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/users', authRoutes);

// Importar y usar rutas de perfil
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);

// Importar y usar rutas de rutinas
const routineRoutes = require('./routes/routineRoutes');
app.use('/api/routines', routineRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});