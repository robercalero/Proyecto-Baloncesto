const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notificacion = sequelize.define('Notificacion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuarioId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('info', 'warning', 'error', 'success', 'partido', 'entrenamiento', 'lesion', 'transferencia'),
    defaultValue: 'info'
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  leida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fechaLectura: {
    type: DataTypes.DATE,
    allowNull: true
  },
  prioridad: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
    defaultValue: 'media'
  },
  enlace: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL o ruta a la que debe dirigir la notificación'
  },
  metadatos: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Datos adicionales relacionados con la notificación'
  },
  fechaExpiracion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'notificaciones',
  indexes: [
    {
      fields: ['usuarioId']
    },
    {
      fields: ['leida']
    },
    {
      fields: ['tipo']
    },
    {
      fields: ['prioridad']
    },
    {
      fields: ['createdAt']
    }
  ],
  scopes: {
    noLeidas: {
      where: {
        leida: false
      }
    },
    recientes: {
      order: [['createdAt', 'DESC']],
      limit: 10
    },
    urgentes: {
      where: {
        prioridad: 'urgente',
        leida: false
      }
    }
  }
});

module.exports = Notificacion;
