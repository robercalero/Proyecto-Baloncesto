const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EstadisticaPartido = sequelize.define('EstadisticaPartido', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  partidoId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'partidos',
      key: 'id'
    }
  },
  cuartosLocal: {
    type: DataTypes.JSON,
    defaultValue: [0, 0, 0, 0]
  },
  cuartosVisitante: {
    type: DataTypes.JSON,
    defaultValue: [0, 0, 0, 0]
  },
  prorrogaLocal: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  prorrogaVisitante: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  liderPuntosLocal: {
    type: DataTypes.JSON,
    defaultValue: {
      jugadorId: null,
      puntos: 0,
      nombre: null
    }
  },
  liderPuntosVisitante: {
    type: DataTypes.JSON,
    defaultValue: {
      jugadorId: null,
      puntos: 0,
      nombre: null
    }
  },
  liderRebotesLocal: {
    type: DataTypes.JSON,
    defaultValue: {
      jugadorId: null,
      rebotes: 0,
      nombre: null
    }
  },
  liderRebotesVisitante: {
    type: DataTypes.JSON,
    defaultValue: {
      jugadorId: null,
      rebotes: 0,
      nombre: null
    }
  },
  liderAsistenciasLocal: {
    type: DataTypes.JSON,
    defaultValue: {
      jugadorId: null,
      asistencias: 0,
      nombre: null
    }
  },
  liderAsistenciasVisitante: {
    type: DataTypes.JSON,
    defaultValue: {
      jugadorId: null,
      asistencias: 0,
      nombre: null
    }
  },
  estadisticasEquipoLocal: {
    type: DataTypes.JSON,
    defaultValue: {
      tirosCampo: { intentados: 0, anotados: 0 },
      triples: { intentados: 0, anotados: 0 },
      tirosLibres: { intentados: 0, anotados: 0 },
      rebotesOfensivos: 0,
      rebotesDefensivos: 0,
      asistencias: 0,
      robos: 0,
      tapones: 0,
      perdidas: 0,
      faltasPersonales: 0,
      faltasTecnicas: 0
    }
  },
  estadisticasEquipoVisitante: {
    type: DataTypes.JSON,
    defaultValue: {
      tirosCampo: { intentados: 0, anotados: 0 },
      triples: { intentados: 0, anotados: 0 },
      tirosLibres: { intentados: 0, anotados: 0 },
      rebotesOfensivos: 0,
      rebotesDefensivos: 0,
      asistencias: 0,
      robos: 0,
      tapones: 0,
      perdidas: 0,
      faltasPersonales: 0,
      faltasTecnicas: 0
    }
  },
  mayorDiferencia: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  momentoMayorDiferencia: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cambiosVentaja: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tiemposLocal: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tiemposVisitante: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  jugadoresLesionadosLocal: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  jugadoresLesionadosVisitante: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  jugadoresExpulsadosLocal: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  jugadoresExpulsadosVisitante: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'estadisticas_partidos',
  indexes: [
    {
      fields: ['partidoId']
    }
  ]
});

module.exports = EstadisticaPartido;
