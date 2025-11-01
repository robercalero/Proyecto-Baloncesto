const express = require('express');
const router = express.Router();
const { EstadisticaJugador, EstadisticaEquipo, EstadisticaPartido, Jugador, Equipo, Partido } = require('../models');
const { optionalAuth } = require('../middlewares/auth.middleware');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

// Obtener líderes en diferentes categorías
router.get('/lideres', optionalAuth, async (req, res) => {
  try {
    const { temporada = '2024-2025', categoria = 'puntos', limite = 10 } = req.query;
    
    let orderBy;
    switch(categoria) {
      case 'puntos':
        orderBy = 'puntosTotales';
        break;
      case 'rebotes':
        orderBy = sequelize.literal('(rebotesOfensivos + rebotesDefensivos)');
        break;
      case 'asistencias':
        orderBy = 'asistencias';
        break;
      case 'robos':
        orderBy = 'robos';
        break;
      case 'tapones':
        orderBy = 'tapones';
        break;
      case 'eficiencia':
        orderBy = sequelize.literal('((puntosTotales + rebotesOfensivos + rebotesDefensivos + asistencias + robos + tapones) - ((tirosCampoIntentados - tirosCampoAnotados) + (tirosLibresIntentados - tirosLibresAnotados) + perdidas))');
        break;
      default:
        orderBy = 'puntosTotales';
    }
    
    const estadisticas = await EstadisticaJugador.findAll({
      where: { 
        temporada,
        partidosJugados: { [Op.gt]: 0 }
      },
      include: [{
        model: Jugador,
        as: 'jugador',
        where: { activo: true },
        include: [{
          model: Equipo,
          as: 'equipo',
          attributes: ['id', 'nombreEquipo', 'ciudad', 'colorPrimario']
        }]
      }],
      order: [[orderBy, 'DESC']],
      limit: parseInt(limite)
    });
    
    res.json({
      success: true,
      data: estadisticas.map(stat => ({
        ...stat.toJSON(),
        promedio: stat.partidosJugados > 0 ? 
          (stat[orderBy === 'puntosTotales' ? 'puntosTotales' : categoria] / stat.partidosJugados).toFixed(1) : 0
      }))
    });
  } catch (error) {
    console.error('Error al obtener líderes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener líderes',
      error: error.message
    });
  }
});

// Obtener estadísticas globales de la liga
router.get('/liga', optionalAuth, async (req, res) => {
  try {
    const { temporada = '2024-2025' } = req.query;
    
    // Obtener estadísticas agregadas
    const [
      totalPartidos,
      promediosPuntos,
      mejorOfensiva,
      mejorDefensiva,
      jugadorMVP
    ] = await Promise.all([
      // Total de partidos jugados
      Partido.count({
        where: { 
          temporada,
          estado: 'Finalizado'
        }
      }),
      
      // Promedio de puntos por partido
      Partido.findOne({
        where: { 
          temporada,
          estado: 'Finalizado'
        },
        attributes: [
          [sequelize.fn('AVG', sequelize.literal('puntosLocal + puntosVisitante')), 'promedioPuntos']
        ]
      }),
      
      // Mejor ofensiva
      EstadisticaEquipo.findOne({
        where: { temporada },
        include: [{
          model: Equipo,
          as: 'equipo'
        }],
        order: [[sequelize.literal('puntosAFavor / NULLIF(partidosJugados, 0)'), 'DESC']]
      }),
      
      // Mejor defensiva
      EstadisticaEquipo.findOne({
        where: { temporada },
        include: [{
          model: Equipo,
          as: 'equipo'
        }],
        order: [[sequelize.literal('puntosEnContra / NULLIF(partidosJugados, 0)'), 'ASC']]
      }),
      
      // Jugador MVP (por eficiencia)
      EstadisticaJugador.findOne({
        where: { 
          temporada,
          partidosJugados: { [Op.gte]: 10 }
        },
        include: [{
          model: Jugador,
          as: 'jugador',
          include: [{
            model: Equipo,
            as: 'equipo'
          }]
        }],
        order: [[sequelize.literal('((puntosTotales + rebotesOfensivos + rebotesDefensivos + asistencias + robos + tapones) - ((tirosCampoIntentados - tirosCampoAnotados) + (tirosLibresIntentados - tirosLibresAnotados) + perdidas)) / NULLIF(partidosJugados, 0)'), 'DESC']]
      })
    ]);
    
    res.json({
      success: true,
      data: {
        temporada,
        totalPartidos,
        promedioPuntosPorPartido: promediosPuntos?.dataValues?.promedioPuntos || 0,
        mejorOfensiva: mejorOfensiva ? {
          equipo: mejorOfensiva.equipo,
          promedioPuntos: mejorOfensiva.promedioPuntosAFavor
        } : null,
        mejorDefensiva: mejorDefensiva ? {
          equipo: mejorDefensiva.equipo,
          promedioPuntosPermitidos: mejorDefensiva.promedioPuntosEnContra
        } : null,
        jugadorMVP: jugadorMVP ? {
          jugador: jugadorMVP.jugador,
          estadisticas: {
            puntosPorPartido: jugadorMVP.puntosPorPartido,
            rebotesPorPartido: jugadorMVP.rebotesPorPartido,
            asistenciasPorPartido: jugadorMVP.asistenciasPorPartido,
            eficiencia: jugadorMVP.eficiencia
          }
        } : null
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de liga:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de liga',
      error: error.message
    });
  }
});

// Obtener comparación entre dos jugadores
router.get('/comparar/jugadores', optionalAuth, async (req, res) => {
  try {
    const { jugador1Id, jugador2Id, temporada = '2024-2025' } = req.query;
    
    if (!jugador1Id || !jugador2Id) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren los IDs de ambos jugadores'
      });
    }
    
    const [stats1, stats2] = await Promise.all([
      EstadisticaJugador.findOne({
        where: { 
          jugadorId: jugador1Id,
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
      }),
      EstadisticaJugador.findOne({
        where: { 
          jugadorId: jugador2Id,
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
      })
    ]);
    
    if (!stats1 || !stats2) {
      return res.status(404).json({
        success: false,
        message: 'Estadísticas no encontradas para uno o ambos jugadores'
      });
    }
    
    res.json({
      success: true,
      data: {
        jugador1: {
          info: stats1.jugador,
          estadisticas: {
            partidosJugados: stats1.partidosJugados,
            puntosPorPartido: stats1.puntosPorPartido,
            rebotesPorPartido: stats1.rebotesPorPartido,
            asistenciasPorPartido: stats1.asistenciasPorPartido,
            robosPorPartido: stats1.robosPorPartido,
            taponesPorPartido: stats1.taponesPorPartido,
            porcentajeTiros: stats1.porcentajeTiros,
            porcentajeTriples: stats1.porcentajeTriples,
            porcentajeTirosLibres: stats1.porcentajeTirosLibres,
            eficiencia: stats1.eficiencia
          }
        },
        jugador2: {
          info: stats2.jugador,
          estadisticas: {
            partidosJugados: stats2.partidosJugados,
            puntosPorPartido: stats2.puntosPorPartido,
            rebotesPorPartido: stats2.rebotesPorPartido,
            asistenciasPorPartido: stats2.asistenciasPorPartido,
            robosPorPartido: stats2.robosPorPartido,
            taponesPorPartido: stats2.taponesPorPartido,
            porcentajeTiros: stats2.porcentajeTiros,
            porcentajeTriples: stats2.porcentajeTriples,
            porcentajeTirosLibres: stats2.porcentajeTirosLibres,
            eficiencia: stats2.eficiencia
          }
        }
      }
    });
  } catch (error) {
    console.error('Error al comparar jugadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al comparar jugadores',
      error: error.message
    });
  }
});

// Obtener comparación entre dos equipos
router.get('/comparar/equipos', optionalAuth, async (req, res) => {
  try {
    const { equipo1Id, equipo2Id, temporada = '2024-2025' } = req.query;
    
    if (!equipo1Id || !equipo2Id) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren los IDs de ambos equipos'
      });
    }
    
    const [stats1, stats2, enfrentamientos] = await Promise.all([
      EstadisticaEquipo.findOne({
        where: { 
          equipoId: equipo1Id,
          temporada
        },
        include: [{
          model: Equipo,
          as: 'equipo'
        }]
      }),
      EstadisticaEquipo.findOne({
        where: { 
          equipoId: equipo2Id,
          temporada
        },
        include: [{
          model: Equipo,
          as: 'equipo'
        }]
      }),
      Partido.findAll({
        where: {
          temporada,
          estado: 'Finalizado',
          [Op.or]: [
            {
              equipoLocalId: equipo1Id,
              equipoVisitanteId: equipo2Id
            },
            {
              equipoLocalId: equipo2Id,
              equipoVisitanteId: equipo1Id
            }
          ]
        },
        order: [['fecha', 'DESC']]
      })
    ]);
    
    if (!stats1 || !stats2) {
      return res.status(404).json({
        success: false,
        message: 'Estadísticas no encontradas para uno o ambos equipos'
      });
    }
    
    // Calcular head to head
    let victorias1 = 0;
    let victorias2 = 0;
    
    enfrentamientos.forEach(partido => {
      if (partido.equipoLocalId === parseInt(equipo1Id)) {
        if (partido.puntosLocal > partido.puntosVisitante) victorias1++;
        else victorias2++;
      } else {
        if (partido.puntosVisitante > partido.puntosLocal) victorias1++;
        else victorias2++;
      }
    });
    
    res.json({
      success: true,
      data: {
        equipo1: {
          info: stats1.equipo,
          estadisticas: {
            balance: stats1.balance,
            porcentajeVictorias: stats1.porcentajeVictorias,
            promedioPuntosAFavor: stats1.promedioPuntosAFavor,
            promedioPuntosEnContra: stats1.promedioPuntosEnContra,
            diferenciaPuntos: stats1.diferenciaPuntos,
            rachaActual: `${stats1.rachaActual} ${stats1.rachaTipo}`,
            posicionConferencia: stats1.posicionConferencia,
            posicionGeneral: stats1.posicionGeneral
          }
        },
        equipo2: {
          info: stats2.equipo,
          estadisticas: {
            balance: stats2.balance,
            porcentajeVictorias: stats2.porcentajeVictorias,
            promedioPuntosAFavor: stats2.promedioPuntosAFavor,
            promedioPuntosEnContra: stats2.promedioPuntosEnContra,
            diferenciaPuntos: stats2.diferenciaPuntos,
            rachaActual: `${stats2.rachaActual} ${stats2.rachaTipo}`,
            posicionConferencia: stats2.posicionConferencia,
            posicionGeneral: stats2.posicionGeneral
          }
        },
        headToHead: {
          equipo1Victorias: victorias1,
          equipo2Victorias: victorias2,
          ultimosEnfrentamientos: enfrentamientos.slice(0, 5)
        }
      }
    });
  } catch (error) {
    console.error('Error al comparar equipos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al comparar equipos',
      error: error.message
    });
  }
});

// Obtener tendencias de un jugador
router.get('/tendencias/jugador/:id', optionalAuth, async (req, res) => {
  try {
    const { ultimos = 5 } = req.query;
    const jugadorId = req.params.id;
    
    // Aquí deberías tener una tabla de estadísticas por partido
    // Por ahora devolvemos datos simulados
    const jugador = await Jugador.findByPk(jugadorId, {
      include: [{
        model: Equipo,
        as: 'equipo'
      }]
    });
    
    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }
    
    // Simulamos tendencias (en producción esto vendría de estadísticas por partido)
    const tendencias = [];
    for (let i = 0; i < parseInt(ultimos); i++) {
      tendencias.push({
        fecha: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        puntos: Math.floor(Math.random() * 30) + 10,
        rebotes: Math.floor(Math.random() * 10) + 2,
        asistencias: Math.floor(Math.random() * 8) + 1,
        minutos: Math.floor(Math.random() * 15) + 25
      });
    }
    
    res.json({
      success: true,
      data: {
        jugador,
        tendencias: tendencias.reverse()
      }
    });
  } catch (error) {
    console.error('Error al obtener tendencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tendencias',
      error: error.message
    });
  }
});

// Obtener estadísticas avanzadas
router.get('/avanzadas', optionalAuth, async (req, res) => {
  try {
    const { tipo = 'jugador', id, temporada = '2024-2025' } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID del jugador o equipo'
      });
    }
    
    if (tipo === 'jugador') {
      const stats = await EstadisticaJugador.findOne({
        where: {
          jugadorId: id,
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
      
      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'Estadísticas no encontradas'
        });
      }
      
      // Calcular estadísticas avanzadas
      const PER = stats.eficiencia; // Player Efficiency Rating simplificado
      const TS = stats.tirosLibresAnotados + stats.tirosCampoAnotados > 0 ?
        (stats.puntosTotales / (2 * (stats.tirosCampoIntentados + 0.44 * stats.tirosLibresIntentados))) * 100 : 0;
      const USG = stats.minutosJugados > 0 ?
        ((stats.tirosCampoIntentados + 0.44 * stats.tirosLibresIntentados + stats.perdidas) * 40 * 5) / 
        (stats.minutosJugados * (stats.tirosCampoIntentados + 0.44 * stats.tirosLibresIntentados + stats.perdidas + stats.asistencias)) * 100 : 0;
      
      res.json({
        success: true,
        data: {
          jugador: stats.jugador,
          estadisticasBasicas: {
            puntosPorPartido: stats.puntosPorPartido,
            rebotesPorPartido: stats.rebotesPorPartido,
            asistenciasPorPartido: stats.asistenciasPorPartido,
            minutosPorPartido: stats.minutosPorPartido
          },
          estadisticasAvanzadas: {
            PER: PER.toFixed(1),
            trueShooting: TS.toFixed(1),
            usageRate: USG.toFixed(1),
            assistRatio: stats.asistencias > 0 ? 
              ((stats.asistencias * 100) / ((stats.minutosJugados / 5) * stats.partidosJugados)).toFixed(1) : 0,
            reboundRate: (stats.rebotesOfensivos + stats.rebotesDefensivos) > 0 ?
              (((stats.rebotesOfensivos + stats.rebotesDefensivos) * 100) / stats.partidosJugados).toFixed(1) : 0,
            blockRate: stats.tapones > 0 ?
              ((stats.tapones * 100) / stats.partidosJugados).toFixed(1) : 0,
            stealRate: stats.robos > 0 ?
              ((stats.robos * 100) / stats.partidosJugados).toFixed(1) : 0,
            turnoverRate: stats.perdidas > 0 ?
              ((stats.perdidas * 100) / (stats.tirosCampoIntentados + 0.44 * stats.tirosLibresIntentados + stats.perdidas)).toFixed(1) : 0
          }
        }
      });
    } else {
      // Estadísticas avanzadas de equipo
      const stats = await EstadisticaEquipo.findOne({
        where: {
          equipoId: id,
          temporada
        },
        include: [{
          model: Equipo,
          as: 'equipo'
        }]
      });
      
      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'Estadísticas no encontradas'
        });
      }
      
      res.json({
        success: true,
        data: {
          equipo: stats.equipo,
          estadisticasBasicas: {
            balance: stats.balance,
            porcentajeVictorias: stats.porcentajeVictorias,
            promedioPuntosAFavor: stats.promedioPuntosAFavor,
            promedioPuntosEnContra: stats.promedioPuntosEnContra
          },
          estadisticasAvanzadas: {
            netRating: (stats.promedioPuntosAFavor - stats.promedioPuntosEnContra).toFixed(1),
            pace: ((stats.puntosAFavor + stats.puntosEnContra) / stats.partidosJugados).toFixed(1),
            offensiveRating: (stats.puntosAFavor / stats.partidosJugados).toFixed(1),
            defensiveRating: (stats.puntosEnContra / stats.partidosJugados).toFixed(1),
            strengthOfSchedule: 0.5 // Simplificado
          }
        }
      });
    }
  } catch (error) {
    console.error('Error al obtener estadísticas avanzadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas avanzadas',
      error: error.message
    });
  }
});

module.exports = router;
