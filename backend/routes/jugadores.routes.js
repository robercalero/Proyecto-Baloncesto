const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { Jugador, Equipo, EstadisticaJugador } = require('../models');
const { authMiddleware, roleMiddleware, optionalAuth } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { Op } = require('sequelize');

// Validaciones
const jugadorValidation = [
  body('nombreJugador').notEmpty().withMessage('El nombre es requerido'),
  body('apellido').notEmpty().withMessage('El apellido es requerido'),
  body('dorsal').isInt({ min: 0, max: 99 }).withMessage('Dorsal debe ser entre 0 y 99'),
  body('posicion').isIn(['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot']).withMessage('Posición inválida'),
  body('altura').isFloat({ min: 150, max: 250 }).withMessage('Altura debe ser entre 150 y 250 cm'),
  body('peso').isFloat({ min: 50, max: 200 }).withMessage('Peso debe ser entre 50 y 200 kg'),
  body('fechaNacimiento').isISO8601().withMessage('Fecha de nacimiento inválida'),
  body('nacionalidad').notEmpty().withMessage('La nacionalidad es requerida')
];

// Obtener todos los jugadores con filtros
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      equipoId,
      posicion,
      activo,
      search,
      page = 1,
      limit = 10,
      sortBy = 'apellido',
      sortOrder = 'ASC'
    } = req.query;
    
    // Construir filtros
    const where = {};
    if (equipoId) where.equipoId = equipoId;
    if (posicion) where.posicion = posicion;
    if (activo !== undefined) where.activo = activo === 'true';
    if (search) {
      where[Op.or] = [
        { nombreJugador: { [Op.like]: `%${search}%` } },
        { apellido: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Paginación
    const offset = (page - 1) * limit;
    
    // Consulta
    const { count, rows } = await Jugador.findAndCountAll({
      where,
      include: [
        {
          model: Equipo,
          as: 'equipo',
          attributes: ['id', 'nombreEquipo', 'ciudad', 'colorPrimario', 'colorSecundario']
        },
        {
          model: EstadisticaJugador,
          as: 'estadisticas',
          required: false
        }
      ],
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
    console.error('Error al obtener jugadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugadores',
      error: error.message
    });
  }
});

// Obtener un jugador por ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const jugador = await Jugador.findByPk(req.params.id, {
      include: [
        {
          model: Equipo,
          as: 'equipo'
        },
        {
          model: EstadisticaJugador,
          as: 'estadisticas'
        }
      ]
    });
    
    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: jugador
    });
  } catch (error) {
    console.error('Error al obtener jugador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugador',
      error: error.message
    });
  }
});

// Crear nuevo jugador (solo admin y entrenador)
router.post('/',
  authMiddleware,
  roleMiddleware('admin', 'entrenador'),
  jugadorValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const jugadorData = req.body;
      
      // Verificar que el dorsal no esté duplicado en el equipo
      if (jugadorData.equipoId && jugadorData.dorsal) {
        const dorsalExiste = await Jugador.findOne({
          where: {
            equipoId: jugadorData.equipoId,
            dorsal: jugadorData.dorsal,
            activo: true
          }
        });
        
        if (dorsalExiste) {
          return res.status(400).json({
            success: false,
            message: 'El dorsal ya está en uso en este equipo'
          });
        }
      }
      
      // Crear jugador
      const jugador = await Jugador.create(jugadorData);
      
      // Crear estadísticas iniciales
      await EstadisticaJugador.create({
        jugadorId: jugador.id,
        temporada: '2024-2025'
      });
      
      // Obtener jugador con relaciones
      const jugadorCompleto = await Jugador.findByPk(jugador.id, {
        include: [
          { model: Equipo, as: 'equipo' },
          { model: EstadisticaJugador, as: 'estadisticas' }
        ]
      });
      
      res.status(201).json({
        success: true,
        message: 'Jugador creado exitosamente',
        data: jugadorCompleto
      });
    } catch (error) {
      console.error('Error al crear jugador:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear jugador',
        error: error.message
      });
    }
});

// Actualizar jugador
router.put('/:id',
  authMiddleware,
  roleMiddleware('admin', 'entrenador'),
  jugadorValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const jugador = await Jugador.findByPk(req.params.id);
      
      if (!jugador) {
        return res.status(404).json({
          success: false,
          message: 'Jugador no encontrado'
        });
      }
      
      const jugadorData = req.body;
      
      // Verificar dorsal duplicado si cambió
      if (jugadorData.equipoId && jugadorData.dorsal && 
          (jugadorData.dorsal !== jugador.dorsal || jugadorData.equipoId !== jugador.equipoId)) {
        const dorsalExiste = await Jugador.findOne({
          where: {
            equipoId: jugadorData.equipoId,
            dorsal: jugadorData.dorsal,
            activo: true,
            id: { [Op.ne]: jugador.id }
          }
        });
        
        if (dorsalExiste) {
          return res.status(400).json({
            success: false,
            message: 'El dorsal ya está en uso en este equipo'
          });
        }
      }
      
      // Actualizar jugador
      await jugador.update(jugadorData);
      
      // Obtener jugador actualizado con relaciones
      const jugadorActualizado = await Jugador.findByPk(jugador.id, {
        include: [
          { model: Equipo, as: 'equipo' },
          { model: EstadisticaJugador, as: 'estadisticas' }
        ]
      });
      
      res.json({
        success: true,
        message: 'Jugador actualizado exitosamente',
        data: jugadorActualizado
      });
    } catch (error) {
      console.error('Error al actualizar jugador:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar jugador',
        error: error.message
      });
    }
});

// Eliminar jugador (solo admin)
router.delete('/:id',
  authMiddleware,
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const jugador = await Jugador.findByPk(req.params.id);
      
      if (!jugador) {
        return res.status(404).json({
          success: false,
          message: 'Jugador no encontrado'
        });
      }
      
      // Soft delete - solo desactivar
      await jugador.update({ activo: false });
      
      res.json({
        success: true,
        message: 'Jugador eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar jugador:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar jugador',
        error: error.message
      });
    }
});

// Obtener estadísticas de un jugador
router.get('/:id/estadisticas', optionalAuth, async (req, res) => {
  try {
    const { temporada = '2024-2025' } = req.query;
    
    const estadisticas = await EstadisticaJugador.findOne({
      where: {
        jugadorId: req.params.id,
        temporada
      },
      include: [{
        model: Jugador,
        as: 'jugador',
        include: [{
          model: Equipo,
          as: 'equipo'
        }]
      }]
    });
    
    if (!estadisticas) {
      return res.status(404).json({
        success: false,
        message: 'Estadísticas no encontradas'
      });
    }
    
    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

// Transferir jugador a otro equipo
router.post('/:id/transferir',
  authMiddleware,
  roleMiddleware('admin'),
  [
    body('equipoId').isInt().withMessage('ID de equipo inválido'),
    body('dorsal').optional().isInt({ min: 0, max: 99 }).withMessage('Dorsal debe ser entre 0 y 99')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const jugador = await Jugador.findByPk(req.params.id);
      
      if (!jugador) {
        return res.status(404).json({
          success: false,
          message: 'Jugador no encontrado'
        });
      }
      
      const { equipoId, dorsal } = req.body;
      
      // Verificar que el equipo existe
      const equipo = await Equipo.findByPk(equipoId);
      if (!equipo) {
        return res.status(404).json({
          success: false,
          message: 'Equipo no encontrado'
        });
      }
      
      // Verificar dorsal si se proporciona
      const nuevooorsal = dorsal || jugador.dorsal;
      const dorsalExiste = await Jugador.findOne({
        where: {
          equipoId,
          dorsal: nuevooorsal,
          activo: true,
          id: { [Op.ne]: jugador.id }
        }
      });
      
      if (dorsalExiste) {
        return res.status(400).json({
          success: false,
          message: 'El dorsal ya está en uso en el equipo destino'
        });
      }
      
      // Actualizar jugador
      await jugador.update({
        equipoId,
        dorsal: nuevooorsal
      });
      
      // Obtener jugador actualizado
      const jugadorActualizado = await Jugador.findByPk(jugador.id, {
        include: [{ model: Equipo, as: 'equipo' }]
      });
      
      res.json({
        success: true,
        message: 'Jugador transferido exitosamente',
        data: jugadorActualizado
      });
    } catch (error) {
      console.error('Error al transferir jugador:', error);
      res.status(500).json({
        success: false,
        message: 'Error al transferir jugador',
        error: error.message
      });
    }
});

// Obtener jugadores libres (sin equipo)
router.get('/estado/libres', optionalAuth, async (req, res) => {
  try {
    const jugadores = await Jugador.findAll({
      where: {
        equipoId: null,
        activo: true
      },
      include: [{
        model: EstadisticaJugador,
        as: 'estadisticas'
      }]
    });
    
    res.json({
      success: true,
      data: jugadores
    });
  } catch (error) {
    console.error('Error al obtener jugadores libres:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugadores libres',
      error: error.message
    });
  }
});

module.exports = router;
