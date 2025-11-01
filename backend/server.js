require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const jugadoresRoutes = require('./routes/jugadores.routes');
const equiposRoutes = require('./routes/equipos.routes');
const partidosRoutes = require('./routes/partidos.routes');
const estadisticasRoutes = require('./routes/estadisticas.routes');
const notificacionesRoutes = require('./routes/notificaciones.routes');
const configuracionRoutes = require('./routes/configuracion.routes');

// Importar base de datos
const { sequelize } = require('./models');
const { seedDatabase } = require('./seeders/seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de solicitudes
  message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.'
});
app.use('/api/', limiter);

// Middlewares generales
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (para imágenes de jugadores, logos, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/partidos', partidosRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/configuracion', configuracionRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Inicializar base de datos y servidor
async function startServer() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // Sincronizar modelos (crear tablas)
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados');
    
    // Seed inicial de datos (solo si está vacía)
    const { Equipo } = require('./models');
    const equiposCount = await Equipo.count();
    if (equiposCount === 0) {
      console.log('📦 Insertando datos de prueba...');
      await seedDatabase();
      console.log('✅ Datos de prueba insertados');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
