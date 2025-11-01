const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Equipo, Jugador, EstadisticaEquipo, Partido } = require('../models');
const { authMiddleware, roleMiddleware, optionalAuth } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { Op } = require('sequelize');

// Validaciones
const equipoValidation = [
  body('nombreEquipo').notEmpty().withMessage('El nombre del equipo es requerido'),
  body('ciudad').notEmpty().withMessage('La ciudad es requerida'),
  body('conferencia').isIn(['Este', 'Oeste']).withMessage('Conferencia inválida'),
  body('division').isIn(['Atlántico', 'Central', 'Sudeste', 'Noroeste', 'Pacífico', 'Suroeste']).withMessage('División inválida'),
  body('estadio').notEmpty().withMessage('El estadio es requerido'),
  body('capacidadEstadio').isInt({ min: 1000 }).withMessage('Capacidad del estadio inválida')
];

// Obtener todos los equipos
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      conferencia,
      division,
      activo,
      search,
      includeStats = 'false'
    } = req.query;
    
    // Construir filtros
    const where = {};
    if (conferencia) where.conferencia = conferencia;
    if (division) where.division = division;
    if (activo !== undefined) where.activo = activo === 'true';
    if (search) {
      where[Op.or] = [
        { nombreEquipo: { [Op.like]: `%${search}%` } },
        { ciudad: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Incluir relaciones según se solicite
    const include = [];
    if (includeStats === 'true') {
      include.push({
        model: EstadisticaEquipo,
        as: 'estadisticas',
        where: { temporada: '2024-2025' },
        required: false
      });
    }
    
    const equipos = await Equipo.findAll({
      where,
      include,
      order: [['nombreEquipo', 'ASC']]
    });
    
    res.json({
      success: true,
      data: equipos
    });
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipos',
      error: error.message
    });
  }
});

// Obtener un equipo por ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const equipo = await Equipo.findByPk(req.params.id, {
      include: [
        {
          model: Jugador,
          as: 'jugadores',
          where: { activo: true },
          required: false,
          order: [['dorsal', 'ASC']]
        },
        {
          model: EstadisticaEquipo,
          as: 'estadisticas',
          where: { temporada: '2024-2025' },
          required: false
        }
      ]
    });
    
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: equipo
    });
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipo',
      error: error.message
    });
  }
});

// Crear nuevo equipo (solo admin)
router.post('/',
  authMiddleware,
  roleMiddleware('admin'),
  equipoValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const equipoData = req.body;
      
      // Verificar que el nombre no esté duplicado
      const equipoExistente = await Equipo.findOne({
        where: { nombreEquipo: equipoData.nombreEquipo }
      });
      
      if (equipoExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un equipo con ese nombre'
        });
      }
      
      // Crear equipo
      const equipo = await Equipo.create(equipoData);
      
      // Crear estadísticas iniciales
      await EstadisticaEquipo.create({
        equipoId: equipo.id,
        temporada: '2024-2025'
      });
      
      // Obtener equipo con estadísticas
      const equipoCompleto = await Equipo.findByPk(equipo.id, {
        include: [{
          model: EstadisticaEquipo,
          as: 'estadisticas'
        }]
      });
      
      res.status(201).json({
        success: true,
        message: 'Equipo creado exitosamente',
        data: equipoCompleto
      });
    } catch (error) {
      console.error('Error al crear equipo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear equipo',
        error: error.message
      });
    }
});

// Actualizar equipo
router.put('/:id',
  authMiddleware,
  roleMiddleware('admin'),
  equipoValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const equipo = await Equipo.findByPk(req.params.id);
      
      if (!equipo) {
        return res.status(404).json({
          success: false,
          message: 'Equipo no encontrado'
        });
      }
      
      const equipoData = req.body;
      
      // Verificar nombre duplicado si cambió
      if (equipoData.nombreEquipo && equipoData.nombreEquipo !== equipo.nombreEquipo) {
        const equipoExistente = await Equipo.findOne({
          where: {
            nombreEquipo: equipoData.nombreEquipo,
            id: { [Op.ne]: equipo.id }
          }
        });
        
        if (equipoExistente) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un equipo con ese nombre'
          });
        }
      }
      
      // Actualizar equipo
      await equipo.update(equipoData);
      
      res.json({
        success: true,
        message: 'Equipo actualizado exitosamente',
        data: equipo
      });
    } catch (error) {
      console.error('Error al actualizar equipo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar equipo',
        error: error.message
      });
    }
});

// Eliminar equipo (solo admin)
router.delete('/:id',
  authMiddleware,
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const equipo = await Equipo.findByPk(req.params.id);
      
      if (!equipo) {
        return res.status(404).json({
          success: false,
          message: 'Equipo no encontrado'
        });
      }
      
      // Verificar si tiene jugadores activos
      const jugadoresCount = await Jugador.count({
        where: {
          equipoId: equipo.id,
          activo: true
        }
      });
      
      if (jugadoresCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar el equipo porque tiene jugadores activos'
        });
      }
      
      // Soft delete
      await equipo.update({ activo: false });
      
      res.json({
        success: true,
        message: 'Equipo eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar equipo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar equipo',
        error: error.message
      });
    }
});

// Obtener jugadores de un equipo
router.get('/:id/jugadores', optionalAuth, async (req, res) => {
  try {
    const { activos = 'true' } = req.query;
    
    const where = { equipoId: req.params.id };
    if (activos === 'true') where.activo = true;
    
    const jugadores = await Jugador.findAll({
      where,
      order: [['dorsal', 'ASC']]
    });
    
    res.json({
      success: true,
      data: jugadores
    });
  } catch (error) {
    console.error('Error al obtener jugadores del equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugadores del equipo',
      error: error.message
    });
  }
});

// Obtener partidos de un equipo
router.get('/:id/partidos', optionalAuth, async (req, res) => {
  try {
    const { temporada = '2024-2025', estado, limit = 10 } = req.query;
    const equipoId = req.params.id;
    
    const where = {
      [Op.or]: [
        { equipoLocalId: equipoId },
        { equipoVisitanteId: equipoId }
      ],
      temporada
    };
    
    if (estado) where.estado = estado;
    
    const partidos = await Partido.findAll({
      where,
      include: [
        {
          model: Equipo,
          as: 'equipoLocal',
          attributes: ['id', 'nombreEquipo', 'ciudad', 'colorPrimario']
        },
        {
          model: Equipo,
          as: 'equipoVisitante',
          attributes: ['id', 'nombreEquipo', 'ciudad', 'colorPrimario']
        }
      ],
      order: [['fecha', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: partidos
    });
  } catch (error) {
    console.error('Error al obtener partidos del equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener partidos del equipo',
      error: error.message
    });
  }
});

// Obtener estadísticas de un equipo
router.get('/:id/estadisticas', optionalAuth, async (req, res) => {
  try {
    const { temporada = '2024-2025' } = req.query;
    
    const estadisticas = await EstadisticaEquipo.findOne({
      where: {
        equipoId: req.params.id,
        temporada
      },
      include: [{
        model: Equipo,
        as: 'equipo'
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

// Obtener clasificación por conferencia
router.get('/clasificacion/:conferencia', optionalAuth, async (req, res) => {
  try {
    const { temporada = '2024-2025' } = req.query;
    const conferencia = req.params.conferencia;
    
    if (!['Este', 'Oeste'].includes(conferencia)) {
      return res.status(400).json({
        success: false,
        message: 'Conferencia inválida'
      });
    }
    
    const equipos = await Equipo.findAll({
      where: {
        conferencia,
        activo: true
      },
      include: [{
        model: EstadisticaEquipo,
        as: 'estadisticas',
        where: { temporada },
        required: false
      }],
      order: [[{ model: EstadisticaEquipo, as: 'estadisticas' }, 'partidosGanados', 'DESC']]
    });
    
    res.json({
      success: true,
      data: equipos
    });
  } catch (error) {
    console.error('Error al obtener clasificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clasificación',
      error: error.message
    });
  }
});

module.exports = router;
