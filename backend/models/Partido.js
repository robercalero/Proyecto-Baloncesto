const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Partido = sequelize.define('Partido', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  equipoLocalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipos',
      key: 'id'
    }
  },
  equipoVisitanteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipos',
      key: 'id'
    }
  },
  puntosLocal: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  puntosVisitante: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  temporada: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-2025'
  },
  jornada: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  estado: {
    type: DataTypes.ENUM('Programado', 'EnCurso', 'Finalizado', 'Cancelado', 'Suspendido'),
    defaultValue: 'Programado'
  },
  tipoPartido: {
    type: DataTypes.ENUM('Regular', 'Playoff', 'Amistoso', 'Copa'),
    defaultValue: 'Regular'
  },
  arbitroPrincipal: {
    type: DataTypes.STRING,
    allowNull: true
  },
  arbitrosSecundarios: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  estadio: {
    type: DataTypes.STRING,
    allowNull: true
  },
  asistencia: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  duracion: {
    type: DataTypes.INTEGER,
    defaultValue: 48,
    comment: 'Duración en minutos'
  },
  prorroga: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  numeroProrroga: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  mvp: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'jugadores',
      key: 'id'
    }
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  clima: {
    type: DataTypes.JSON,
    defaultValue: {
      temperatura: null,
      humedad: null,
      condicion: null
    }
  }
}, {
  tableName: 'partidos',
  indexes: [
    {
      fields: ['fecha']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['temporada']
    },
    {
      fields: ['equipoLocalId']
    },
    {
      fields: ['equipoVisitanteId']
    }
  ],
  getterMethods: {
    ganador() {
      if (this.estado !== 'Finalizado') return null;
      return this.puntosLocal > this.puntosVisitante ? 'local' : 'visitante';
    },
    diferenciaPuntos() {
      return Math.abs(this.puntosLocal - this.puntosVisitante);
    }
  }
});

module.exports = Partido;
