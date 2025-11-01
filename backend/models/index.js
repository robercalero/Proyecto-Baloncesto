const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Equipo = require('./Equipo');
const Jugador = require('./Jugador');
const Partido = require('./Partido');
const EstadisticaJugador = require('./EstadisticaJugador');
const EstadisticaEquipo = require('./EstadisticaEquipo');
const EstadisticaPartido = require('./EstadisticaPartido');
const Notificacion = require('./Notificacion');
const Configuracion = require('./Configuracion');

// Relaciones entre modelos

// Usuario y sus relaciones
Usuario.hasMany(Notificacion, { foreignKey: 'usuarioId', as: 'notificaciones' });
Notificacion.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Usuario.hasMany(Configuracion, { foreignKey: 'usuarioId', as: 'configuraciones' });
Configuracion.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Equipo y sus relaciones
Equipo.hasMany(Jugador, { foreignKey: 'equipoId', as: 'jugadores' });
Jugador.belongsTo(Equipo, { foreignKey: 'equipoId', as: 'equipo' });

Equipo.hasMany(Partido, { foreignKey: 'equipoLocalId', as: 'partidosLocal' });
Equipo.hasMany(Partido, { foreignKey: 'equipoVisitanteId', as: 'partidosVisitante' });

Partido.belongsTo(Equipo, { foreignKey: 'equipoLocalId', as: 'equipoLocal' });
Partido.belongsTo(Equipo, { foreignKey: 'equipoVisitanteId', as: 'equipoVisitante' });

Equipo.hasOne(EstadisticaEquipo, { foreignKey: 'equipoId', as: 'estadisticas' });
EstadisticaEquipo.belongsTo(Equipo, { foreignKey: 'equipoId', as: 'equipo' });

// Jugador y sus relaciones
Jugador.hasOne(EstadisticaJugador, { foreignKey: 'jugadorId', as: 'estadisticas' });
EstadisticaJugador.belongsTo(Jugador, { foreignKey: 'jugadorId', as: 'jugador' });

// Partido y sus relaciones
Partido.hasOne(EstadisticaPartido, { foreignKey: 'partidoId', as: 'estadisticas' });
EstadisticaPartido.belongsTo(Partido, { foreignKey: 'partidoId', as: 'partido' });

// Relación muchos a muchos para jugadores que participan en partidos
Jugador.belongsToMany(Partido, { 
  through: 'JugadorPartido', 
  foreignKey: 'jugadorId',
  as: 'partidos' 
});
Partido.belongsToMany(Jugador, { 
  through: 'JugadorPartido', 
  foreignKey: 'partidoId',
  as: 'jugadores' 
});

module.exports = {
  sequelize,
  Usuario,
  Equipo,
  Jugador,
  Partido,
  EstadisticaJugador,
  EstadisticaEquipo,
  EstadisticaPartido,
  Notificacion,
  Configuracion
};
