const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Configuracion } = require('../models');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');

// Obtener configuración del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    let configuracion = await Configuracion.findOne({
      where: { usuarioId: req.usuario.id }
    });
    
    // Si no existe configuración, crear una por defecto
    if (!configuracion) {
      configuracion = await Configuracion.create({
        usuarioId: req.usuario.id
      });
    }
    
    res.json({
      success: true,
      data: configuracion
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración',
      error: error.message
    });
  }
});

// Actualizar configuración general
router.put('/',
  authMiddleware,
  [
    body('tema').optional().isIn(['claro', 'oscuro', 'auto']).withMessage('Tema inválido'),
    body('idioma').optional().isString().withMessage('Idioma inválido'),
    body('formatoFecha').optional().isString().withMessage('Formato de fecha inválido'),
    body('zonaHoraria').optional().isString().withMessage('Zona horaria inválida'),
    body('atajosTeclado').optional().isBoolean().withMessage('Valor booleano requerido'),
    body('sonidos').optional().isBoolean().withMessage('Valor booleano requerido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      let configuracion = await Configuracion.findOne({
        where: { usuarioId: req.usuario.id }
      });
      
      if (!configuracion) {
        configuracion = await Configuracion.create({
          usuarioId: req.usuario.id,
          ...req.body
        });
      } else {
        await configuracion.update(req.body);
      }
      
      res.json({
        success: true,
        message: 'Configuración actualizada',
        data: configuracion
      });
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar configuración',
        error: error.message
      });
    }
});

// Actualizar configuración de notificaciones
router.put('/notificaciones',
  authMiddleware,
  async (req, res) => {
    try {
      let configuracion = await Configuracion.findOne({
        where: { usuarioId: req.usuario.id }
      });
      
      if (!configuracion) {
        configuracion = await Configuracion.create({
          usuarioId: req.usuario.id,
          notificaciones: req.body
        });
      } else {
        await configuracion.update({
          notificaciones: {
            ...configuracion.notificaciones,
            ...req.body
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Configuración de notificaciones actualizada',
        data: configuracion.notificaciones
      });
    } catch (error) {
      console.error('Error al actualizar notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar configuración de notificaciones',
        error: error.message
      });
    }
});

// Actualizar preferencias de visualización
router.put('/visualizacion',
  authMiddleware,
  async (req, res) => {
    try {
      let configuracion = await Configuracion.findOne({
        where: { usuarioId: req.usuario.id }
      });
      
      if (!configuracion) {
        configuracion = await Configuracion.create({
          usuarioId: req.usuario.id,
          preferenciasVisualizacion: req.body
        });
      } else {
        await configuracion.update({
          preferenciasVisualizacion: {
            ...configuracion.preferenciasVisualizacion,
            ...req.body
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Preferencias de visualización actualizadas',
        data: configuracion.preferenciasVisualizacion
      });
    } catch (error) {
      console.error('Error al actualizar visualización:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar preferencias de visualización',
        error: error.message
      });
    }
});

// Actualizar configuración del dashboard
router.put('/dashboard',
  authMiddleware,
  [
    body('widgets').optional().isArray().withMessage('Widgets debe ser un array'),
    body('layout').optional().isString().withMessage('Layout inválido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      let configuracion = await Configuracion.findOne({
        where: { usuarioId: req.usuario.id }
      });
      
      if (!configuracion) {
        configuracion = await Configuracion.create({
          usuarioId: req.usuario.id,
          dashboard: req.body
        });
      } else {
        await configuracion.update({
          dashboard: {
            ...configuracion.dashboard,
            ...req.body
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Configuración del dashboard actualizada',
        data: configuracion.dashboard
      });
    } catch (error) {
      console.error('Error al actualizar dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar configuración del dashboard',
        error: error.message
      });
    }
});

// Actualizar configuración de privacidad
router.put('/privacidad',
  authMiddleware,
  async (req, res) => {
    try {
      let configuracion = await Configuracion.findOne({
        where: { usuarioId: req.usuario.id }
      });
      
      if (!configuracion) {
        configuracion = await Configuracion.create({
          usuarioId: req.usuario.id,
          privacidad: req.body
        });
      } else {
        await configuracion.update({
          privacidad: {
            ...configuracion.privacidad,
            ...req.body
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Configuración de privacidad actualizada',
        data: configuracion.privacidad
      });
    } catch (error) {
      console.error('Error al actualizar privacidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar configuración de privacidad',
        error: error.message
      });
    }
});

// Gestionar equipos favoritos
router.put('/equipos-favoritos',
  authMiddleware,
  [
    body('equipoId').isInt().withMessage('ID de equipo inválido'),
    body('accion').isIn(['agregar', 'eliminar']).withMessage('Acción inválida')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { equipoId, accion } = req.body;
      
      let configuracion = await Configuracion.findOne({
        where: { usuarioId: req.usuario.id }
      });
      
      if (!configuracion) {
        configuracion = await Configuracion.create({
          usuarioId: req.usuario.id
        });
      }
      
      let equiposFavoritos = configuracion.equiposFavoritos || [];
      
      if (accion === 'agregar') {
        if (!equiposFavoritos.includes(equipoId)) {
          equiposFavoritos.push(equipoId);
        }
      } else {
        equiposFavoritos = equiposFavoritos.filter(id => id !== equipoId);
      }
      
      await configuracion.update({ equiposFavoritos });
      
      res.json({
        success: true,
        message: `Equipo ${accion === 'agregar' ? 'agregado a' : 'eliminado de'} favoritos`,
        data: equiposFavoritos
      });
    } catch (error) {
      console.error('Error al actualizar equipos favoritos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar equipos favoritos',
        error: error.message
      });
    }
});

// Gestionar jugadores favoritos
router.put('/jugadores-favoritos',
  authMiddleware,
  [
    body('jugadorId').isUUID().withMessage('ID de jugador inválido'),
    body('accion').isIn(['agregar', 'eliminar']).withMessage('Acción inválida')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { jugadorId, accion } = req.body;
      
      let configuracion = await Configuracion.findOne({
        where: { usuarioId: req.usuario.id }
      });
      
      if (!configuracion) {
        configuracion = await Configuracion.create({
          usuarioId: req.usuario.id
        });
      }
      
      let jugadoresFavoritos = configuracion.jugadoresFavoritos || [];
      
      if (accion === 'agregar') {
        if (!jugadoresFavoritos.includes(jugadorId)) {
          jugadoresFavoritos.push(jugadorId);
        }
      } else {
        jugadoresFavoritos = jugadoresFavoritos.filter(id => id !== jugadorId);
      }
      
      await configuracion.update({ jugadoresFavoritos });
      
      res.json({
        success: true,
        message: `Jugador ${accion === 'agregar' ? 'agregado a' : 'eliminado de'} favoritos`,
        data: jugadoresFavoritos
      });
    } catch (error) {
      console.error('Error al actualizar jugadores favoritos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar jugadores favoritos',
        error: error.message
      });
    }
});

// Restablecer configuración a valores por defecto
router.post('/reset', authMiddleware, async (req, res) => {
  try {
    let configuracion = await Configuracion.findOne({
      where: { usuarioId: req.usuario.id }
    });
    
    if (configuracion) {
      await configuracion.destroy();
    }
    
    // Crear nueva configuración con valores por defecto
    configuracion = await Configuracion.create({
      usuarioId: req.usuario.id
    });
    
    res.json({
      success: true,
      message: 'Configuración restablecida a valores por defecto',
      data: configuracion
    });
  } catch (error) {
    console.error('Error al restablecer configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restablecer configuración',
      error: error.message
    });
  }
});

// Exportar configuración
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const configuracion = await Configuracion.findOne({
      where: { usuarioId: req.usuario.id }
    });
    
    if (!configuracion) {
      return res.status(404).json({
        success: false,
        message: 'No hay configuración para exportar'
      });
    }
    
    const exportData = {
      version: '1.0',
      fecha: new Date().toISOString(),
      configuracion: configuracion.toJSON()
    };
    
    // Eliminar datos sensibles
    delete exportData.configuracion.id;
    delete exportData.configuracion.usuarioId;
    delete exportData.configuracion.createdAt;
    delete exportData.configuracion.updatedAt;
    
    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Error al exportar configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar configuración',
      error: error.message
    });
  }
});

// Importar configuración
router.post('/import',
  authMiddleware,
  [
    body('configuracion').isObject().withMessage('Configuración inválida')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { configuracion: importData } = req.body;
      
      let configuracion = await Configuracion.findOne({
        where: { usuarioId: req.usuario.id }
      });
      
      if (!configuracion) {
        configuracion = await Configuracion.create({
          usuarioId: req.usuario.id,
          ...importData
        });
      } else {
        await configuracion.update(importData);
      }
      
      res.json({
        success: true,
        message: 'Configuración importada exitosamente',
        data: configuracion
      });
    } catch (error) {
      console.error('Error al importar configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error al importar configuración',
        error: error.message
      });
    }
});

module.exports = router;
