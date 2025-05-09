const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/authMiddleware');

// GET /api/profile - Obtener perfil del usuario autenticado
router.get('/', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ msg: 'Perfil no encontrado' });
    }
    
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// POST /api/profile - Crear o actualizar perfil
router.post('/', auth, async (req, res) => {
  const { interests, goals, availability } = req.body;
  
  // Construir objeto de perfil
  const profileFields = {};
  profileFields.user = req.user.id;
  if (interests) profileFields.interests = interests;
  if (goals) profileFields.goals = goals;
  if (availability) profileFields.availability = availability;
  profileFields.updatedAt = Date.now();
  
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    
    if (profile) {
      // Actualizar
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      
      return res.json(profile);
    }
    
    // Crear
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;
