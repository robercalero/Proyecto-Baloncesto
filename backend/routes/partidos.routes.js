const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Partido, Equipo, EstadisticaPartido, EstadisticaEquipo, Jugador } = require('../models');
const { authMiddleware, roleMiddleware, optionalAuth } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

// Validaciones
const partidoValidation = [
  body('equipoLocalId').isInt().withMessage('ID de equipo local inválido'),
  body('equipoVisitanteId').isInt().withMessage('ID de equipo visitante inválido')
    .custom((value, { req }) => value !== req.body.equipoLocalId)
    .withMessage('Un equipo no puede jugar contra sí mismo'),
  body('fecha').isISO8601().withMessage('Fecha inválida'),
  body('temporada').notEmpty().withMessage('La temporada es requerida'),
  body('jornada').isInt({ min: 1 }).withMessage('Jornada inválida'),
  body('estado').isIn(['Programado', 'EnCurso', 'Finalizado', 'Cancelado', 'Suspendido']).withMessage('Estado inválido')
];

// Obtener todos los partidos con filtros
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      temporada = '2024-2025',
      estado,
      equipoId,
      fecha,
      jornada,
      page = 1,
      limit = 10,
      sortBy = 'fecha',
      sortOrder = 'DESC'
    } = req.query;
    
    // Construir filtros
    const where = { temporada };
    
    if (estado) where.estado = estado;
    if (jornada) where.jornada = jornada;
    
    if (equipoId) {
      where[Op.or] = [
        { equipoLocalId: equipoId },
        { equipoVisitanteId: equipoId }
      ];
    }
    
    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);
      where.fecha = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    }
    
    // Paginación
    const offset = (page - 1) * limit;
    
    // Consulta
    const { count, rows } = await Partido.findAndCountAll({
      where,
      include: [
        {
          model: Equipo,
          as: 'equipoLocal',
          attributes: ['id', 'nombreEquipo', 'ciudad', 'colorPrimario', 'colorSecundario', 'logo']
        },
        {
          model: Equipo,
          as: 'equipoVisitante',
          attributes: ['id', 'nombreEquipo', 'ciudad', 'colorPrimario', 'colorSecundario', 'logo']
        },
        {
          model: EstadisticaPartido,
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
    console.error('Error al obtener partidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener partidos',
      error: error.message
    });
  }
});

// Obtener próximos partidos
router.get('/proximos', optionalAuth, async (req, res) => {
  try {
    const { equipoId, limit = 5 } = req.query;
    
    const where = {
      fecha: {
        [Op.gte]: new Date()
      },
      estado: 'Programado'
    };
    
    if (equipoId) {
      where[Op.or] = [
        { equipoLocalId: equipoId },
        { equipoVisitanteId: equipoId }
      ];
    }
    
    const partidos = await Partido.findAll({
      where,
      include: [
        {
          model: Equipo,
          as: 'equipoLocal',
          attributes: ['id', 'nombreEquipo', 'ciudad', 'colorPrimario', 'logo']
        },
        {
          model: Equipo,
          as: 'equipoVisitante',
          attributes: ['id', 'nombreEquipo', 'ciudad', 'colorPrimario', 'logo']
        }
      ],
      order: [['fecha', 'ASC']],
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: partidos
    });
  } catch (error) {
    console.error('Error al obtener próximos partidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener próximos partidos',
      error: error.message
    });
  }
});

// Obtener partidos en curso
router.get('/en-curso', optionalAuth, async (req, res) => {
  try {
    const partidos = await Partido.findAll({
      where: { estado: 'EnCurso' },
      include: [
        {
          model: Equipo,
          as: 'equipoLocal',
          attributes: ['id', 'nombreEquipo', 'ciudad', 'colorPrimario', 'logo']
        },
        {
          model: Equipo,
          as: 'equipoVisitante',
          attributes: ['id', 'nombreEquipo', 'ciudad', 'colorPrimario', 'logo']
        },
        {
          model: EstadisticaPartido,
          as: 'estadisticas'
        }
      ],
      order: [['fecha', 'ASC']]
    });
    
    res.json({
      success: true,
      data: partidos
    });
  } catch (error) {
    console.error('Error al obtener partidos en curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener partidos en curso',
      error: error.message
    });
  }
});

// Obtener un partido por ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const partido = await Partido.findByPk(req.params.id, {
      include: [
        {
          model: Equipo,
          as: 'equipoLocal',
          include: [{
            model: Jugador,
            as: 'jugadores',
            where: { activo: true },
            required: false
          }]
        },
        {
          model: Equipo,
          as: 'equipoVisitante',
          include: [{
            model: Jugador,
            as: 'jugadores',
            where: { activo: true },
            required: false
          }]
        },
        {
          model: EstadisticaPartido,
          as: 'estadisticas'
        }
      ]
    });
    
    if (!partido) {
      return res.status(404).json({
        success: false,
        message: 'Partido no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: partido
    });
  } catch (error) {
    console.error('Error al obtener partido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener partido',
      error: error.message
    });
  }
});

// Crear nuevo partido (solo admin y entrenador)
router.post('/',
  authMiddleware,
  roleMiddleware('admin', 'entrenador'),
  partidoValidation,
  handleValidationErrors,
  async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
      const partidoData = req.body;
      
      // Verificar que los equipos existen
      const [equipoLocal, equipoVisitante] = await Promise.all([
        Equipo.findByPk(partidoData.equipoLocalId),
        Equipo.findByPk(partidoData.equipoVisitanteId)
      ]);
      
      if (!equipoLocal || !equipoVisitante) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Uno o ambos equipos no existen'
        });
      }
      
      // Crear partido
      const partido = await Partido.create(partidoData, { transaction: t });
      
      // Crear estadísticas iniciales
      await EstadisticaPartido.create({
        partidoId: partido.id
      }, { transaction: t });
      
      await t.commit();
      
      // Obtener partido completo
      const partidoCompleto = await Partido.findByPk(partido.id, {
        include: [
          { model: Equipo, as: 'equipoLocal' },
          { model: Equipo, as: 'equipoVisitante' },
          { model: EstadisticaPartido, as: 'estadisticas' }
        ]
      });
      
      res.status(201).json({
        success: true,
        message: 'Partido creado exitosamente',
        data: partidoCompleto
      });
    } catch (error) {
      await t.rollback();
      console.error('Error al crear partido:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear partido',
        error: error.message
      });
    }
});

// Actualizar partido
router.put('/:id',
  authMiddleware,
  roleMiddleware('admin', 'entrenador'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const partido = await Partido.findByPk(req.params.id);
      
      if (!partido) {
        return res.status(404).json({
          success: false,
          message: 'Partido no encontrado'
        });
      }
      
      // Actualizar partido
      await partido.update(req.body);
      
      // Si el partido terminó, actualizar estadísticas de equipos
      if (req.body.estado === 'Finalizado' && partido.estado !== 'Finalizado') {
        await actualizarEstadisticasEquipos(partido);
      }
      
      // Obtener partido actualizado
      const partidoActualizado = await Partido.findByPk(partido.id, {
        include: [
          { model: Equipo, as: 'equipoLocal' },
          { model: Equipo, as: 'equipoVisitante' },
          { model: EstadisticaPartido, as: 'estadisticas' }
        ]
      });
      
      res.json({
        success: true,
        message: 'Partido actualizado exitosamente',
        data: partidoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar partido:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar partido',
        error: error.message
      });
    }
});

// Eliminar partido (solo admin)
router.delete('/:id',
  authMiddleware,
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const partido = await Partido.findByPk(req.params.id);
      
      if (!partido) {
        return res.status(404).json({
          success: false,
          message: 'Partido no encontrado'
        });
      }
      
      // Solo se pueden eliminar partidos programados
      if (partido.estado !== 'Programado') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden eliminar partidos programados'
        });
      }
      
      await partido.destroy();
      
      res.json({
        success: true,
        message: 'Partido eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar partido:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar partido',
        error: error.message
      });
    }
});

// Actualizar resultado de un partido
router.put('/:id/resultado',
  authMiddleware,
  roleMiddleware('admin', 'entrenador'),
  [
    body('puntosLocal').isInt({ min: 0 }).withMessage('Puntos local inválidos'),
    body('puntosVisitante').isInt({ min: 0 }).withMessage('Puntos visitante inválidos')
  ],
  handleValidationErrors,
  async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
      const partido = await Partido.findByPk(req.params.id);
      
      if (!partido) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Partido no encontrado'
        });
      }
      
      const { puntosLocal, puntosVisitante } = req.body;
      
      // Actualizar puntos
      await partido.update({
        puntosLocal,
        puntosVisitante,
        estado: 'Finalizado'
      }, { transaction: t });
      
      // Actualizar estadísticas de equipos
      await actualizarEstadisticasEquipos(partido, t);
      
      await t.commit();
      
      res.json({
        success: true,
        message: 'Resultado actualizado exitosamente',
        data: partido
      });
    } catch (error) {
      await t.rollback();
      console.error('Error al actualizar resultado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar resultado',
        error: error.message
      });
    }
});

// Función auxiliar para actualizar estadísticas de equipos
async function actualizarEstadisticasEquipos(partido, transaction) {
  const [statsLocal, statsVisitante] = await Promise.all([
    EstadisticaEquipo.findOne({
      where: {
        equipoId: partido.equipoLocalId,
        temporada: partido.temporada
      }
    }),
    EstadisticaEquipo.findOne({
      where: {
        equipoId: partido.equipoVisitanteId,
        temporada: partido.temporada
      }
    })
  ]);
  
  const ganoLocal = partido.puntosLocal > partido.puntosVisitante;
  
  // Actualizar estadísticas del equipo local
  if (statsLocal) {
    await statsLocal.increment({
      partidosJugados: 1,
      partidosGanados: ganoLocal ? 1 : 0,
      partidosPerdidos: ganoLocal ? 0 : 1,
      partidosLocalGanados: ganoLocal ? 1 : 0,
      partidosLocalPerdidos: ganoLocal ? 0 : 1,
      puntosAFavor: partido.puntosLocal,
      puntosEnContra: partido.puntosVisitante
    }, { transaction });
    
    // Actualizar racha
    if (ganoLocal) {
      if (statsLocal.rachaTipo === 'Ganando') {
        await statsLocal.increment('rachaActual', { transaction });
      } else {
        await statsLocal.update({
          rachaActual: 1,
          rachaTipo: 'Ganando'
        }, { transaction });
      }
    } else {
      if (statsLocal.rachaTipo === 'Perdiendo') {
        await statsLocal.increment('rachaActual', { transaction });
      } else {
        await statsLocal.update({
          rachaActual: 1,
          rachaTipo: 'Perdiendo'
        }, { transaction });
      }
    }
  }
  
  // Actualizar estadísticas del equipo visitante
  if (statsVisitante) {
    await statsVisitante.increment({
      partidosJugados: 1,
      partidosGanados: ganoLocal ? 0 : 1,
      partidosPerdidos: ganoLocal ? 1 : 0,
      partidosVisitanteGanados: ganoLocal ? 0 : 1,
      partidosVisitantePerdidos: ganoLocal ? 1 : 0,
      puntosAFavor: partido.puntosVisitante,
      puntosEnContra: partido.puntosLocal
    }, { transaction });
    
    // Actualizar racha
    if (!ganoLocal) {
      if (statsVisitante.rachaTipo === 'Ganando') {
        await statsVisitante.increment('rachaActual', { transaction });
      } else {
        await statsVisitante.update({
          rachaActual: 1,
          rachaTipo: 'Ganando'
        }, { transaction });
      }
    } else {
      if (statsVisitante.rachaTipo === 'Perdiendo') {
        await statsVisitante.increment('rachaActual', { transaction });
      } else {
        await statsVisitante.update({
          rachaActual: 1,
          rachaTipo: 'Perdiendo'
        }, { transaction });
      }
    }
  }
}

// Obtener calendario de partidos
router.get('/calendario/:year/:month', optionalAuth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const { equipoId } = req.query;
    
    const fechaInicio = new Date(year, month - 1, 1);
    const fechaFin = new Date(year, month, 0, 23, 59, 59);
    
    const where = {
      fecha: {
        [Op.between]: [fechaInicio, fechaFin]
      }
    };
    
    if (equipoId) {
      where[Op.or] = [
        { equipoLocalId: equipoId },
        { equipoVisitanteId: equipoId }
      ];
    }
    
    const partidos = await Partido.findAll({
      where,
      include: [
        {
          model: Equipo,
          as: 'equipoLocal',
          attributes: ['id', 'nombreEquipo', 'ciudad']
        },
        {
          model: Equipo,
          as: 'equipoVisitante',
          attributes: ['id', 'nombreEquipo', 'ciudad']
        }
      ],
      order: [['fecha', 'ASC']]
    });
    
    res.json({
      success: true,
      data: partidos
    });
  } catch (error) {
    console.error('Error al obtener calendario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener calendario',
      error: error.message
    });
  }
});

module.exports = router;
