const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const auth = require('../middleware/authMiddleware');

// GET /api/routines - Obtener todas las rutinas del usuario
router.get('/', auth, async (req, res) => {
  try {
    const routines = await Routine.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(routines);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// GET /api/routines/:id - Obtener una rutina específica
router.get('/:id', auth, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    
    if (!routine) {
      return res.status(404).json({ msg: 'Rutina no encontrada' });
    }
    
    // Verificar que la rutina pertenece al usuario
    if (routine.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    res.json(routine);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Rutina no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

// POST /api/routines - Crear una nueva rutina
router.post('/', auth, async (req, res) => {
  const { name, description, activities } = req.body;
  
  try {
    const newRoutine = new Routine({
      user: req.user.id,
      name,
      description,
      activities
    });
    
    const routine = await newRoutine.save();
    res.json(routine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// PUT /api/routines/:id - Actualizar una rutina
router.put('/:id', auth, async (req, res) => {
  const { name, description, activities } = req.body;
  
  try {
    let routine = await Routine.findById(req.params.id);
    
    if (!routine) {
      return res.status(404).json({ msg: 'Rutina no encontrada' });
    }
    
    // Verificar que la rutina pertenece al usuario
    if (routine.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    // Actualizar campos
    if (name) routine.name = name;
    if (description) routine.description = description;
    if (activities) routine.activities = activities;
    routine.updatedAt = Date.now();
    
    await routine.save();
    res.json(routine);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Rutina no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

// DELETE /api/routines/:id - Eliminar una rutina
router.delete('/:id', auth, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    
    if (!routine) {
      return res.status(404).json({ msg: 'Rutina no encontrada' });
    }
    
    // Verificar que la rutina pertenece al usuario
    if (routine.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    
    await routine.deleteOne();
    res.json({ msg: 'Rutina eliminada' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Rutina no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;
