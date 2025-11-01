const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EstadisticaEquipo = sequelize.define('EstadisticaEquipo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  equipoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'equipos',
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
  partidosGanados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  partidosPerdidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  partidosLocalGanados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  partidosLocalPerdidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  partidosVisitanteGanados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  partidosVisitantePerdidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  puntosAFavor: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  puntosEnContra: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rachaActual: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rachaTipo: {
    type: DataTypes.ENUM('Ganando', 'Perdiendo', 'Neutro'),
    defaultValue: 'Neutro'
  },
  mejorRachaVictorias: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  peorRachaDerrotas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  posicionConferencia: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  posicionDivision: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  posicionGeneral: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  partidosConferencia: {
    type: DataTypes.JSON,
    defaultValue: {
      ganados: 0,
      perdidos: 0
    }
  },
  partidosDivision: {
    type: DataTypes.JSON,
    defaultValue: {
      ganados: 0,
      perdidos: 0
    }
  },
  ultimosCinco: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  ultimosDiez: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  promedioAsistenciaLocal: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  tableName: 'estadisticas_equipos',
  indexes: [
    {
      fields: ['equipoId']
    },
    {
      fields: ['temporada']
    },
    {
      fields: ['posicionConferencia']
    },
    {
      fields: ['posicionGeneral']
    }
  ],
  getterMethods: {
    porcentajeVictorias() {
      return this.partidosJugados > 0 ? 
        ((this.partidosGanados / this.partidosJugados) * 100).toFixed(1) : 0;
    },
    diferenciaPuntos() {
      return this.puntosAFavor - this.puntosEnContra;
    },
    promedioPuntosAFavor() {
      return this.partidosJugados > 0 ? 
        (this.puntosAFavor / this.partidosJugados).toFixed(1) : 0;
    },
    promedioPuntosEnContra() {
      return this.partidosJugados > 0 ? 
        (this.puntosEnContra / this.partidosJugados).toFixed(1) : 0;
    },
    balanceLocal() {
      return `${this.partidosLocalGanados}-${this.partidosLocalPerdidos}`;
    },
    balanceVisitante() {
      return `${this.partidosVisitanteGanados}-${this.partidosVisitantePerdidos}`;
    },
    balance() {
      return `${this.partidosGanados}-${this.partidosPerdidos}`;
    },
    juegosDetras(lider) {
      if (!lider) return 0;
      const diferencia = (lider.partidosGanados - this.partidosGanados) + 
                        (this.partidosPerdidos - lider.partidosPerdidos);
      return diferencia / 2;
    }
  }
});

module.exports = EstadisticaEquipo;
