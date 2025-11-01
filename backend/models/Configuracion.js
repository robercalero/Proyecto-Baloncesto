const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Configuracion = sequelize.define('Configuracion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuarioId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  tema: {
    type: DataTypes.ENUM('claro', 'oscuro', 'auto'),
    defaultValue: 'auto'
  },
  idioma: {
    type: DataTypes.STRING,
    defaultValue: 'es'
  },
  formatoFecha: {
    type: DataTypes.STRING,
    defaultValue: 'DD/MM/YYYY'
  },
  zonaHoraria: {
    type: DataTypes.STRING,
    defaultValue: 'Europe/Madrid'
  },
  notificaciones: {
    type: DataTypes.JSON,
    defaultValue: {
      email: {
        activado: true,
        partidos: true,
        entrenamientos: true,
        lesiones: true,
        transferencias: true,
        estadisticas: false,
        resumenDiario: false,
        resumenSemanal: true
      },
      push: {
        activado: false,
        partidos: true,
        entrenamientos: false,
        lesiones: true,
        transferencias: true,
        estadisticas: false
      },
      inApp: {
        activado: true,
        partidos: true,
        entrenamientos: true,
        lesiones: true,
        transferencias: true,
        estadisticas: true
      }
    }
  },
  preferenciasVisualizacion: {
    type: DataTypes.JSON,
    defaultValue: {
      mostrarFotosJugadores: true,
      mostrarLogosEquipos: true,
      animaciones: true,
      densidadTabla: 'normal', // 'compacta', 'normal', 'espaciada'
      itemsPorPagina: 10,
      graficosAnimados: true,
      autoRefresh: false,
      intervaloRefresh: 30 // segundos
    }
  },
  dashboard: {
    type: DataTypes.JSON,
    defaultValue: {
      widgets: [
        'proximosPartidos',
        'estadisticasEquipo',
        'lideresCategorias',
        'lesiones',
        'calendario'
      ],
      layout: 'default'
    }
  },
  privacidad: {
    type: DataTypes.JSON,
    defaultValue: {
      perfilPublico: false,
      mostrarEstadisticas: true,
      compartirActividad: false,
      recibirMensajes: true
    }
  },
  equiposFavoritos: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  jugadoresFavoritos: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  atajosTeclado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sonidos: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'configuraciones',
  indexes: [
    {
      fields: ['usuarioId']
    }
  ]
});

module.exports = Configuracion;
