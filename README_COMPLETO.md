# 🏀 Sistema de Gestión de Baloncesto - Documentación Completa

## 📋 Descripción General
Sistema completo de gestión para equipos de baloncesto con frontend Angular y backend Node.js/Express, diseñado para administrar jugadores, equipos, partidos y estadísticas con análisis avanzado.

## 🚀 Características Principales

### Frontend (Angular 18)
- ✅ Interfaz moderna y responsiva con Material Design
- ✅ Dashboard interactivo con estadísticas en tiempo real
- ✅ Gestión completa de jugadores, equipos y partidos
- ✅ Sistema de autenticación y autorización por roles
- ✅ Gráficos y visualizaciones con Chart.js
- ✅ PWA con soporte offline
- ✅ Optimización de rendimiento con lazy loading

### Backend (Node.js/Express)
- ✅ API REST completa y documentada
- ✅ Base de datos SQLite con Sequelize ORM
- ✅ Autenticación JWT
- ✅ Validación de datos con express-validator
- ✅ Rate limiting y seguridad con Helmet
- ✅ Seeders con datos de prueba reales (NBA)
- ✅ Sistema de notificaciones

## 📦 Instalación y Configuración

### Requisitos Previos
- Node.js 18+ 
- npm 9+
- Angular CLI 18+ (opcional)

### Instalación Completa

```bash
# 1. Clonar o descargar el proyecto
cd C:\ProyectoBaloncesto\Proyecto-Baloncesto

# 2. Instalar dependencias del Frontend
npm install

# 3. Instalar dependencias del Backend
cd backend
npm install
cd ..
```

## 🎮 Ejecutar el Proyecto

### Opción 1: Ejecutar Backend y Frontend por Separado

```bash
# Terminal 1 - Iniciar Backend (Puerto 3000)
cd backend
npm run dev

# Terminal 2 - Iniciar Frontend (Puerto 4200)
cd ..
npm start
```

### Opción 2: Ejecutar Todo Junto (Recomendado)

```bash
# Desde la raíz del proyecto
npm run dev:all
```

## 🔐 Credenciales de Acceso

El sistema incluye 4 usuarios de prueba con diferentes roles:

| Rol | Email | Contraseña | Permisos |
|-----|-------|------------|----------|
| **Admin** | admin@baloncesto.com | Admin123! | Acceso total al sistema |
| **Entrenador** | entrenador@baloncesto.com | Coach123! | Gestión de equipos y jugadores |
| **Analista** | analista@baloncesto.com | Analyst123! | Solo visualización y análisis |
| **Visor** | visor@baloncesto.com | Viewer123! | Solo lectura |

## 🗄️ Base de Datos

### Modelos Principales
- **Usuarios**: Sistema de autenticación y roles
- **Equipos**: 30 equipos NBA con información completa
- **Jugadores**: 50+ jugadores estrella con estadísticas
- **Partidos**: Calendario y resultados
- **Estadísticas**: Métricas avanzadas por jugador/equipo/partido
- **Notificaciones**: Sistema de alertas
- **Configuración**: Preferencias de usuario

### Datos de Prueba
El sistema incluye:
- 30 equipos NBA reales
- 50+ jugadores estrella actuales
- Partidos de ejemplo (programados y finalizados)
- Estadísticas realistas generadas

## 🔧 Estructura del Proyecto

```
Proyecto-Baloncesto/
├── src/                      # Frontend Angular
│   ├── app/
│   │   ├── pages/           # Páginas principales
│   │   ├── components/      # Componentes reutilizables
│   │   ├── services/        # Servicios y lógica
│   │   ├── interfaces/      # Tipos TypeScript
│   │   ├── guards/          # Guards de autenticación
│   │   └── interceptors/    # Interceptores HTTP
│   └── environments/        # Configuración de entornos
├── backend/                 # Backend Node.js
│   ├── models/             # Modelos Sequelize
│   ├── routes/             # Rutas API REST
│   ├── middlewares/        # Middlewares Express
│   ├── seeders/            # Datos de prueba
│   ├── config/             # Configuración
│   └── server.js           # Servidor principal
└── database.sqlite         # Base de datos SQLite
```

## 📊 API Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/profile` - Actualizar perfil

### Jugadores
- `GET /api/jugadores` - Listar jugadores
- `GET /api/jugadores/:id` - Obtener jugador
- `POST /api/jugadores` - Crear jugador
- `PUT /api/jugadores/:id` - Actualizar jugador
- `DELETE /api/jugadores/:id` - Eliminar jugador
- `GET /api/jugadores/:id/estadisticas` - Estadísticas del jugador

### Equipos
- `GET /api/equipos` - Listar equipos
- `GET /api/equipos/:id` - Obtener equipo
- `POST /api/equipos` - Crear equipo
- `PUT /api/equipos/:id` - Actualizar equipo
- `GET /api/equipos/:id/jugadores` - Jugadores del equipo
- `GET /api/equipos/:id/partidos` - Partidos del equipo

### Partidos
- `GET /api/partidos` - Listar partidos
- `GET /api/partidos/proximos` - Próximos partidos
- `GET /api/partidos/en-curso` - Partidos en curso
- `POST /api/partidos` - Crear partido
- `PUT /api/partidos/:id/resultado` - Actualizar resultado

### Estadísticas
- `GET /api/estadisticas/lideres` - Líderes por categoría
- `GET /api/estadisticas/liga` - Estadísticas globales
- `GET /api/estadisticas/comparar/jugadores` - Comparar jugadores
- `GET /api/estadisticas/avanzadas` - Métricas avanzadas

## 🎨 Características UI/UX

- **Dashboard Interactivo**: Widgets personalizables con estadísticas clave
- **Gráficos Dinámicos**: Visualizaciones en tiempo real
- **Tablas Avanzadas**: Ordenamiento, filtrado y paginación
- **Tema Oscuro/Claro**: Cambio dinámico de tema
- **Responsive**: Adaptado para móvil, tablet y desktop
- **PWA**: Instalable y con soporte offline
- **Animaciones**: Transiciones suaves y feedback visual

## 🔒 Seguridad

- Autenticación JWT con tokens seguros
- Encriptación de contraseñas con bcrypt
- Rate limiting para prevenir ataques DDoS
- Validación de datos en frontend y backend
- Headers de seguridad con Helmet
- CORS configurado correctamente
- Roles y permisos granulares

## 📈 Rendimiento

- Lazy loading de módulos
- Caché de datos con signals
- Compresión de respuestas
- Optimización de imágenes
- Índices en base de datos
- Paginación de resultados

## 🧪 Testing

```bash
# Tests del Frontend
npm test

# Tests del Backend
cd backend
npm test
```

## 📱 PWA - Progressive Web App

El proyecto está configurado como PWA:
- Instalable en dispositivos
- Funciona offline
- Actualizaciones automáticas
- Notificaciones push (preparado)

## 🚀 Despliegue

### Build de Producción

```bash
# Frontend
npm run build

# El build estará en dist/
```

### Variables de Entorno
Configurar en `backend/.env`:
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=tu_secreto_seguro
DB_STORAGE=./database.sqlite
```

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm start              # Frontend dev
npm run dev:backend    # Backend dev
npm run dev:all        # Todo junto

# Producción
npm run build          # Build frontend
npm run serve:prod     # Servir build

# Base de datos
cd backend
npm run seed           # Reiniciar datos de prueba

# Linting
npm run lint           # Verificar código
npm run lint:fix       # Corregir automáticamente
```

## 📝 Notas Importantes

1. **Primera Ejecución**: El backend creará automáticamente la base de datos y cargará datos de prueba
2. **CORS**: Configurado para localhost:4200, ajustar para producción
3. **Tokens**: Los tokens JWT expiran en 7 días
4. **Base de Datos**: SQLite para desarrollo, considerar PostgreSQL para producción
5. **Imágenes**: Los logos y fotos son URLs placeholder, reemplazar con imágenes reales

## 🎯 Próximas Mejoras Planificadas

- [ ] Dashboard personalizable por usuario
- [ ] Exportación de datos a Excel/PDF
- [ ] Estadísticas en tiempo real con WebSockets
- [ ] Sistema de mensajería entre usuarios
- [ ] Integración con APIs deportivas externas
- [ ] Modo oscuro persistente
- [ ] Multi-idioma (i18n)
- [ ] Tests E2E con Cypress
- [ ] Docker para deployment
- [ ] CI/CD con GitHub Actions

## 🤝 Soporte

Para cualquier duda o problema:
1. Verificar que todos los servicios estén corriendo
2. Revisar los logs del backend
3. Verificar la consola del navegador
4. Asegurarse de tener las últimas dependencias

## 📄 Licencia

Este proyecto es de uso educativo y desarrollo.

---

**Desarrollado con ❤️ usando Angular 18 + Node.js + Express + SQLite**
