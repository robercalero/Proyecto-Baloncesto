const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');

// Validaciones
const registerValidation = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('apellido').notEmpty().withMessage('El apellido es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('La contraseña debe contener letras y números')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

// Generar token JWT
const generateToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Registro de usuario
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono } = req.body;
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    // Crear nuevo usuario
    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password,
      telefono,
      rol: 'visor' // Rol por defecto
    });
    
    // Generar token
    const token = generateToken(usuario);
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        usuario: usuario.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
});

// Login
router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar contraseña
    const passwordValido = await usuario.verificarPassword(password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'Tu cuenta está desactivada'
      });
    }
    
    // Actualizar último acceso
    usuario.ultimoAcceso = new Date();
    await usuario.save();
    
    // Generar token
    const token = generateToken(usuario);
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        usuario: usuario.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
});

// Obtener usuario actual
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        usuario: req.usuario.toJSON()
      }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
});

// Actualizar perfil
router.put('/profile', 
  authMiddleware,
  [
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('apellido').optional().notEmpty().withMessage('El apellido no puede estar vacío'),
    body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { nombre, apellido, telefono, avatar } = req.body;
      const usuario = req.usuario;
      
      // Actualizar campos permitidos
      if (nombre) usuario.nombre = nombre;
      if (apellido) usuario.apellido = apellido;
      if (telefono) usuario.telefono = telefono;
      if (avatar) usuario.avatar = avatar;
      
      await usuario.save();
      
      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          usuario: usuario.toJSON()
        }
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar perfil',
        error: error.message
      });
    }
});

// Cambiar contraseña
router.put('/change-password',
  authMiddleware,
  [
    body('passwordActual').notEmpty().withMessage('La contraseña actual es requerida'),
    body('passwordNueva')
      .isLength({ min: 6 })
      .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
      .withMessage('La contraseña debe contener letras y números')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { passwordActual, passwordNueva } = req.body;
      const usuario = req.usuario;
      
      // Verificar contraseña actual
      const passwordValido = await usuario.verificarPassword(passwordActual);
      if (!passwordValido) {
        return res.status(401).json({
          success: false,
          message: 'La contraseña actual es incorrecta'
        });
      }
      
      // Actualizar contraseña
      usuario.password = passwordNueva;
      await usuario.save();
      
      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar contraseña',
        error: error.message
      });
    }
});

// Logout (opcional, principalmente para invalidar token en el cliente)
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // Aquí podrías implementar una blacklist de tokens si lo deseas
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
      error: error.message
    });
  }
});

// Verificar token
router.post('/verify-token', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    data: {
      usuario: req.usuario.toJSON()
    }
  });
});

module.exports = router;
