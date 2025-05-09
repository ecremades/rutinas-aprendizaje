const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: 'Actividad' // Hacemos que la descripción sea opcional con un valor predeterminado
  },
  interestId: {
    type: String,
    default: '' // Permitimos que sea opcional para compatibilidad con datos existentes
  },
  interestName: {
    type: String,
    default: 'Actividad' // Valor predeterminado para mostrar en la interfaz
  }
});

const RoutineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  activities: [ActivitySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Routine', RoutineSchema);
