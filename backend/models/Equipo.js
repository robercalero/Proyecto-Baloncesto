const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipo = sequelize.define('Equipo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombreEquipo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  ciudad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  conferencia: {
    type: DataTypes.ENUM('Este', 'Oeste'),
    allowNull: false
  },
  division: {
    type: DataTypes.ENUM('Atlántico', 'Central', 'Sudeste', 'Noroeste', 'Pacífico', 'Suroeste'),
    allowNull: false
  },
  colorPrimario: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#000000'
  },
  colorSecundario: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#FFFFFF'
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estadio: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacidadEstadio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 15000
  },
  fechaFundacion: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  entrenadorPrincipal: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gerente: {
    type: DataTypes.STRING,
    allowNull: true
  },
  propietario: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sitioWeb: {
    type: DataTypes.STRING,
    allowNull: true
  },
  redesSociales: {
    type: DataTypes.JSON,
    defaultValue: {
      twitter: '',
      facebook: '',
      instagram: '',
      youtube: ''
    }
  }
}, {
  tableName: 'equipos',
  indexes: [
    {
      fields: ['conferencia']
    },
    {
      fields: ['division']
    }
  ]
});

module.exports = Equipo;
