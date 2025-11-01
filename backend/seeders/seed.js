const bcrypt = require('bcryptjs');
const { Usuario, Equipo, Jugador, Partido, EstadisticaJugador, EstadisticaEquipo, EstadisticaPartido, Notificacion } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');
    
    // Crear usuario administrador
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const [admin] = await Usuario.findOrCreate({
      where: { email: 'admin@baloncesto.com' },
      defaults: {
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@baloncesto.com',
        password: adminPassword,
        rol: 'admin',
        activo: true
      }
    });
    
    // Crear usuarios de prueba
    const usuarios = [
      {
        nombre: 'Carlos',
        apellido: 'Entrenador',
        email: 'entrenador@baloncesto.com',
        password: await bcrypt.hash('Coach123!', 10),
        rol: 'entrenador'
      },
      {
        nombre: 'Ana',
        apellido: 'Analista',
        email: 'analista@baloncesto.com',
        password: await bcrypt.hash('Analyst123!', 10),
        rol: 'analista'
      }
    ];
    
    for (const userData of usuarios) {
      await Usuario.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });
    }
    
    // Crear datos de equipos
    const equiposData = require('./equiposData');
    const equipos = [];
    for (const equipoData of equiposData) {
      const [equipo] = await Equipo.findOrCreate({
        where: { nombreEquipo: equipoData.nombreEquipo },
        defaults: equipoData
      });
      equipos.push(equipo);
      
      // Crear estadísticas iniciales
      await EstadisticaEquipo.findOrCreate({
        where: { equipoId: equipo.id, temporada: '2024-2025' },
        defaults: {
          equipoId: equipo.id,
          temporada: '2024-2025',
          partidosJugados: 0,
          partidosGanados: 0,
          partidosPerdidos: 0
        }
      });
    }
    
    // Crear jugadores de ejemplo
    const jugadoresData = require('./jugadoresData');
    for (const jugadorData of jugadoresData) {
      // Buscar el equipo por nombre
      const equipo = equipos.find(e => e.nombreEquipo === jugadorData.equipoNombre);
      if (equipo) {
        const [jugador] = await Jugador.findOrCreate({
          where: {
            nombreJugador: jugadorData.nombreJugador,
            apellido: jugadorData.apellido,
            equipoId: equipo.id
          },
          defaults: {
            ...jugadorData,
            equipoId: equipo.id
          }
        });
        
        // Crear estadísticas del jugador
        await EstadisticaJugador.findOrCreate({
          where: { jugadorId: jugador.id, temporada: '2024-2025' },
          defaults: {
            jugadorId: jugador.id,
            temporada: '2024-2025',
            partidosJugados: Math.floor(Math.random() * 20) + 10,
            partidosTitular: Math.floor(Math.random() * 15) + 5,
            minutosJugados: Math.floor(Math.random() * 500) + 300,
            puntosTotales: Math.floor(Math.random() * 400) + 200,
            tirosCampoIntentados: Math.floor(Math.random() * 200) + 100,
            tirosCampoAnotados: Math.floor(Math.random() * 100) + 50,
            triplesIntentados: Math.floor(Math.random() * 100) + 20,
            triplesAnotados: Math.floor(Math.random() * 40) + 10,
            tirosLibresIntentados: Math.floor(Math.random() * 80) + 20,
            tirosLibresAnotados: Math.floor(Math.random() * 60) + 15,
            rebotesOfensivos: Math.floor(Math.random() * 30) + 10,
            rebotesDefensivos: Math.floor(Math.random() * 80) + 30,
            asistencias: Math.floor(Math.random() * 100) + 20,
            robos: Math.floor(Math.random() * 30) + 5,
            tapones: Math.floor(Math.random() * 20) + 2,
            perdidas: Math.floor(Math.random() * 40) + 10,
            faltasPersonales: Math.floor(Math.random() * 50) + 20,
            plusMinus: Math.floor(Math.random() * 100) - 50
          }
        });
      }
    }
    
    // Crear partidos de ejemplo
    const hoy = new Date();
    const partidosData = [
      {
        equipoLocal: 'Boston Celtics',
        equipoVisitante: 'Los Angeles Lakers',
        fecha: new Date(hoy.getTime() + 1 * 24 * 60 * 60 * 1000),
        temporada: '2024-2025',
        jornada: 1,
        estado: 'Programado',
        estadio: 'TD Garden'
      },
      {
        equipoLocal: 'Milwaukee Bucks',
        equipoVisitante: 'Chicago Bulls',
        fecha: new Date(hoy.getTime() + 2 * 24 * 60 * 60 * 1000),
        temporada: '2024-2025',
        jornada: 1,
        estado: 'Programado',
        estadio: 'Fiserv Forum'
      },
      {
        equipoLocal: 'New York Knicks',
        equipoVisitante: 'Brooklyn Nets',
        fecha: new Date(hoy.getTime() - 1 * 24 * 60 * 60 * 1000),
        temporada: '2024-2025',
        jornada: 1,
        estado: 'Finalizado',
        estadio: 'Madison Square Garden',
        puntosLocal: 110,
        puntosVisitante: 105,
        asistencia: 19500
      },
      {
        equipoLocal: 'Miami Heat',
        equipoVisitante: 'Atlanta Hawks',
        fecha: new Date(hoy.getTime() - 2 * 24 * 60 * 60 * 1000),
        temporada: '2024-2025',
        jornada: 1,
        estado: 'Finalizado',
        estadio: 'FTX Arena',
        puntosLocal: 98,
        puntosVisitante: 102,
        asistencia: 18500
      }
    ];
    
    for (const partidoData of partidosData) {
      const equipoLocal = equipos.find(e => e.nombreEquipo === partidoData.equipoLocal);
      const equipoVisitante = equipos.find(e => e.nombreEquipo === partidoData.equipoVisitante);
      
      if (equipoLocal && equipoVisitante) {
        const [partido] = await Partido.findOrCreate({
          where: {
            equipoLocalId: equipoLocal.id,
            equipoVisitanteId: equipoVisitante.id,
            fecha: partidoData.fecha
          },
          defaults: {
            ...partidoData,
            equipoLocalId: equipoLocal.id,
            equipoVisitanteId: equipoVisitante.id,
            puntosLocal: partidoData.puntosLocal || 0,
            puntosVisitante: partidoData.puntosVisitante || 0
          }
        });
        
        // Crear estadísticas del partido
        await EstadisticaPartido.findOrCreate({
          where: { partidoId: partido.id },
          defaults: {
            partidoId: partido.id,
            cuartosLocal: partido.estado === 'Finalizado' ? [25, 28, 30, 27] : [0, 0, 0, 0],
            cuartosVisitante: partido.estado === 'Finalizado' ? [24, 26, 28, 27] : [0, 0, 0, 0]
          }
        });
        
        // Si el partido está finalizado, actualizar estadísticas de equipos
        if (partido.estado === 'Finalizado') {
          const ganoLocal = partido.puntosLocal > partido.puntosVisitante;
          
          // Actualizar estadísticas del equipo local
          const statsLocal = await EstadisticaEquipo.findOne({
            where: { equipoId: partido.equipoLocalId, temporada: partido.temporada }
          });
          
          if (statsLocal) {
            await statsLocal.increment({
              partidosJugados: 1,
              partidosGanados: ganoLocal ? 1 : 0,
              partidosPerdidos: ganoLocal ? 0 : 1,
              partidosLocalGanados: ganoLocal ? 1 : 0,
              partidosLocalPerdidos: ganoLocal ? 0 : 1,
              puntosAFavor: partido.puntosLocal,
              puntosEnContra: partido.puntosVisitante
            });
          }
          
          // Actualizar estadísticas del equipo visitante
          const statsVisitante = await EstadisticaEquipo.findOne({
            where: { equipoId: partido.equipoVisitanteId, temporada: partido.temporada }
          });
          
          if (statsVisitante) {
            await statsVisitante.increment({
              partidosJugados: 1,
              partidosGanados: ganoLocal ? 0 : 1,
              partidosPerdidos: ganoLocal ? 1 : 0,
              partidosVisitanteGanados: ganoLocal ? 0 : 1,
              partidosVisitantePerdidos: ganoLocal ? 1 : 0,
              puntosAFavor: partido.puntosVisitante,
              puntosEnContra: partido.puntosLocal
            });
          }
        }
      }
    }
    
    // Crear notificaciones de ejemplo
    await Notificacion.create({
      usuarioId: admin.id,
      tipo: 'info',
      titulo: '¡Bienvenido al Sistema de Gestión de Baloncesto!',
      mensaje: 'Tu cuenta de administrador ha sido creada exitosamente. Puedes comenzar a gestionar equipos, jugadores y partidos.',
      prioridad: 'alta'
    });
    
    console.log('✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
};

module.exports = { seedDatabase };
