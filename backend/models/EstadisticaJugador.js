const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EstadisticaJugador = sequelize.define('EstadisticaJugador', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jugadorId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'jugadores',
      key: 'id'
    }
  },
  temporada: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-2025'
  },
  partidosJugados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  partidosTitular: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  minutosJugados: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  puntosTotales: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tirosCampoIntentados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tirosCampoAnotados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  triplesIntentados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  triplesAnotados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tirosLibresIntentados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tirosLibresAnotados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rebotesOfensivos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rebotesDefensivos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  asistencias: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  robos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tapones: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  perdidas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  faltasPersonales: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  faltasTecnicas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  faltasAntideportivas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  expulsiones: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  plusMinus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  dobleDobles: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tripleDobles: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'estadisticas_jugadores',
  indexes: [
    {
      fields: ['jugadorId']
    },
    {
      fields: ['temporada']
    }
  ],
  getterMethods: {
    puntosPorPartido() {
      return this.partidosJugados > 0 ? (this.puntosTotales / this.partidosJugados).toFixed(1) : 0;
    },
    rebotesPorPartido() {
      const totalRebotes = this.rebotesOfensivos + this.rebotesDefensivos;
      return this.partidosJugados > 0 ? (totalRebotes / this.partidosJugados).toFixed(1) : 0;
    },
    asistenciasPorPartido() {
      return this.partidosJugados > 0 ? (this.asistencias / this.partidosJugados).toFixed(1) : 0;
    },
    robosPorPartido() {
      return this.partidosJugados > 0 ? (this.robos / this.partidosJugados).toFixed(1) : 0;
    },
    taponesPorPartido() {
      return this.partidosJugados > 0 ? (this.tapones / this.partidosJugados).toFixed(1) : 0;
    },
    minutosPorPartido() {
      return this.partidosJugados > 0 ? (this.minutosJugados / this.partidosJugados).toFixed(1) : 0;
    },
    porcentajeTiros() {
      return this.tirosCampoIntentados > 0 ? 
        ((this.tirosCampoAnotados / this.tirosCampoIntentados) * 100).toFixed(1) : 0;
    },
    porcentajeTriples() {
      return this.triplesIntentados > 0 ? 
        ((this.triplesAnotados / this.triplesIntentados) * 100).toFixed(1) : 0;
    },
    porcentajeTirosLibres() {
      return this.tirosLibresIntentados > 0 ? 
        ((this.tirosLibresAnotados / this.tirosLibresIntentados) * 100).toFixed(1) : 0;
    },
    eficiencia() {
      const positivo = this.puntosTotales + (this.rebotesOfensivos + this.rebotesDefensivos) + 
                       this.asistencias + this.robos + this.tapones;
      const negativo = (this.tirosCampoIntentados - this.tirosCampoAnotados) + 
                       (this.tirosLibresIntentados - this.tirosLibresAnotados) + 
                       this.perdidas;
      return this.partidosJugados > 0 ? ((positivo - negativo) / this.partidosJugados).toFixed(1) : 0;
    }
  }
});

module.exports = EstadisticaJugador;
