const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Jugador = sequelize.define('Jugador', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombreJugador: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dorsal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 99
    }
  },
  equipoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'equipos',
      key: 'id'
    }
  },
  posicion: {
    type: DataTypes.ENUM('Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'),
    allowNull: false
  },
  altura: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Altura en centímetros'
  },
  peso: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Peso en kilogramos'
  },
  fechaNacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  nacionalidad: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'España'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  foto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  manoHabil: {
    type: DataTypes.ENUM('Derecha', 'Izquierda', 'Ambidiestro'),
    defaultValue: 'Derecha'
  },
  universidad: {
    type: DataTypes.STRING,
    allowNull: true
  },
  draft: {
    type: DataTypes.JSON,
    defaultValue: {
      año: null,
      ronda: null,
      pick: null,
      equipo: null
    }
  },
  lesiones: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  contrato: {
    type: DataTypes.JSON,
    defaultValue: {
      salario: null,
      fechaInicio: null,
      fechaFin: null,
      tipo: null
    }
  },
  valorMercado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  redesSociales: {
    type: DataTypes.JSON,
    defaultValue: {
      twitter: '',
      instagram: '',
      facebook: ''
    }
  }
}, {
  tableName: 'jugadores',
  indexes: [
    {
      fields: ['equipoId']
    },
    {
      fields: ['posicion']
    },
    {
      fields: ['activo']
    },
    {
      unique: true,
      fields: ['equipoId', 'dorsal'],
      where: {
        activo: true
      }
    }
  ],
  getterMethods: {
    nombreCompleto() {
      return `${this.nombreJugador} ${this.apellido}`;
    },
    edad() {
      if (!this.fechaNacimiento) return null;
      const hoy = new Date();
      const nacimiento = new Date(this.fechaNacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      return edad;
    }
  }
});

module.exports = Jugador;
