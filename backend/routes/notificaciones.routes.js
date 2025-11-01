const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Notificacion, Usuario } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { Op } = require('sequelize');

// Obtener notificaciones del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      leida,
      tipo,
      prioridad,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    // Construir filtros
    const where = { usuarioId: req.usuario.id };
    
    if (leida !== undefined) where.leida = leida === 'true';
    if (tipo) where.tipo = tipo;
    if (prioridad) where.prioridad = prioridad;
    
    // Filtrar notificaciones no expiradas
    where[Op.or] = [
      { fechaExpiracion: null },
      { fechaExpiracion: { [Op.gt]: new Date() } }
    ];
    
    // Paginación
    const offset = (page - 1) * limit;
    
    // Consulta
    const { count, rows } = await Notificacion.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        hasNext: offset + rows.length < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error.message
    });
  }
});

// Obtener conteo de notificaciones no leídas
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Notificacion.count({
      where: {
        usuarioId: req.usuario.id,
        leida: false,
        [Op.or]: [
          { fechaExpiracion: null },
          { fechaExpiracion: { [Op.gt]: new Date() } }
        ]
      }
    });
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error al obtener conteo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener conteo de notificaciones',
      error: error.message
    });
  }
});

// Obtener notificaciones recientes
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const notificaciones = await Notificacion.scope('recientes').findAll({
      where: {
        usuarioId: req.usuario.id,
        [Op.or]: [
          { fechaExpiracion: null },
          { fechaExpiracion: { [Op.gt]: new Date() } }
        ]
      }
    });
    
    res.json({
      success: true,
      data: notificaciones
    });
  } catch (error) {
    console.error('Error al obtener notificaciones recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones recientes',
      error: error.message
    });
  }
});

// Obtener notificaciones urgentes
router.get('/urgent', authMiddleware, async (req, res) => {
  try {
    const notificaciones = await Notificacion.scope('urgentes').findAll({
      where: {
        usuarioId: req.usuario.id,
        [Op.or]: [
          { fechaExpiracion: null },
          { fechaExpiracion: { [Op.gt]: new Date() } }
        ]
      }
    });
    
    res.json({
      success: true,
      data: notificaciones
    });
  } catch (error) {
    console.error('Error al obtener notificaciones urgentes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones urgentes',
      error: error.message
    });
  }
});

// Marcar notificación como leída
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notificacion = await Notificacion.findOne({
      where: {
        id: req.params.id,
        usuarioId: req.usuario.id
      }
    });
    
    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }
    
    await notificacion.update({
      leida: true,
      fechaLectura: new Date()
    });
    
    res.json({
      success: true,
      message: 'Notificación marcada como leída',
      data: notificacion
    });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación',
      error: error.message
    });
  }
});

// Marcar múltiples notificaciones como leídas
router.put('/mark-read', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de IDs'
      });
    }
    
    const result = await Notificacion.update(
      {
        leida: true,
        fechaLectura: new Date()
      },
      {
        where: {
          id: { [Op.in]: ids },
          usuarioId: req.usuario.id
        }
      }
    );
    
    res.json({
      success: true,
      message: `${result[0]} notificaciones marcadas como leídas`
    });
  } catch (error) {
    console.error('Error al marcar notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificaciones',
      error: error.message
    });
  }
});

// Marcar todas las notificaciones como leídas
router.put('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const result = await Notificacion.update(
      {
        leida: true,
        fechaLectura: new Date()
      },
      {
        where: {
          usuarioId: req.usuario.id,
          leida: false
        }
      }
    );
    
    res.json({
      success: true,
      message: `${result[0]} notificaciones marcadas como leídas`
    });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar todas las notificaciones',
      error: error.message
    });
  }
});

// Eliminar notificación
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const notificacion = await Notificacion.findOne({
      where: {
        id: req.params.id,
        usuarioId: req.usuario.id
      }
    });
    
    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }
    
    await notificacion.destroy();
    
    res.json({
      success: true,
      message: 'Notificación eliminada'
    });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar notificación',
      error: error.message
    });
  }
});

// Eliminar múltiples notificaciones
router.delete('/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de IDs'
      });
    }
    
    const result = await Notificacion.destroy({
      where: {
        id: { [Op.in]: ids },
        usuarioId: req.usuario.id
      }
    });
    
    res.json({
      success: true,
      message: `${result} notificaciones eliminadas`
    });
  } catch (error) {
    console.error('Error al eliminar notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar notificaciones',
      error: error.message
    });
  }
});

// Crear notificación (solo admin)
router.post('/',
  authMiddleware,
  roleMiddleware('admin'),
  [
    body('usuarioId').optional().isUUID().withMessage('ID de usuario inválido'),
    body('tipo').isIn(['info', 'warning', 'error', 'success', 'partido', 'entrenamiento', 'lesion', 'transferencia'])
      .withMessage('Tipo de notificación inválido'),
    body('titulo').notEmpty().withMessage('El título es requerido'),
    body('mensaje').notEmpty().withMessage('El mensaje es requerido'),
    body('prioridad').optional().isIn(['baja', 'media', 'alta', 'urgente']).withMessage('Prioridad inválida')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const notificacionData = req.body;
      
      // Si no se especifica usuarioId, crear notificación para todos los usuarios activos
      if (!notificacionData.usuarioId) {
        const usuarios = await Usuario.findAll({
          where: { activo: true }
        });
        
        const notificaciones = await Promise.all(
          usuarios.map(usuario =>
            Notificacion.create({
              ...notificacionData,
              usuarioId: usuario.id
            })
          )
        );
        
        res.status(201).json({
          success: true,
          message: `${notificaciones.length} notificaciones creadas`,
          data: notificaciones
        });
      } else {
        // Crear notificación para un usuario específico
        const usuario = await Usuario.findByPk(notificacionData.usuarioId);
        
        if (!usuario) {
          return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
          });
        }
        
        const notificacion = await Notificacion.create(notificacionData);
        
        res.status(201).json({
          success: true,
          message: 'Notificación creada',
          data: notificacion
        });
      }
    } catch (error) {
      console.error('Error al crear notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear notificación',
        error: error.message
      });
    }
});

// Crear notificación masiva (solo admin)
router.post('/broadcast',
  authMiddleware,
  roleMiddleware('admin'),
  [
    body('tipo').isIn(['info', 'warning', 'error', 'success', 'partido', 'entrenamiento', 'lesion', 'transferencia'])
      .withMessage('Tipo de notificación inválido'),
    body('titulo').notEmpty().withMessage('El título es requerido'),
    body('mensaje').notEmpty().withMessage('El mensaje es requerido'),
    body('prioridad').optional().isIn(['baja', 'media', 'alta', 'urgente']).withMessage('Prioridad inválida'),
    body('roles').optional().isArray().withMessage('Roles debe ser un array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { roles, ...notificacionData } = req.body;
      
      // Construir filtro de usuarios
      const where = { activo: true };
      if (roles && roles.length > 0) {
        where.rol = { [Op.in]: roles };
      }
      
      // Obtener usuarios
      const usuarios = await Usuario.findAll({ where });
      
      if (usuarios.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No se encontraron usuarios para enviar la notificación'
        });
      }
      
      // Crear notificaciones
      const notificaciones = await Promise.all(
        usuarios.map(usuario =>
          Notificacion.create({
            ...notificacionData,
            usuarioId: usuario.id
          })
        )
      );
      
      res.status(201).json({
        success: true,
        message: `Notificación enviada a ${notificaciones.length} usuarios`,
        data: {
          count: notificaciones.length,
          sample: notificaciones[0]
        }
      });
    } catch (error) {
      console.error('Error al crear notificación masiva:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear notificación masiva',
        error: error.message
      });
    }
});

module.exports = router;
