# 🏀 Proyecto Baloncesto - Angular 20

Un sistema completo de gestión de baloncesto construido con Angular 20, utilizando las últimas características y mejores prácticas.

## ✨ Características Principales

### 🚀 Tecnologías Modernas
- **Angular 20** con Signals, Computed Signals y Effects
- **Control Flow** (@if, @for) para templates más eficientes
- **Standalone Components** para mejor tree-shaking
- **Zoneless Change Detection** para máximo rendimiento
- **Material Design 3** para una UI moderna y accesible

### 📊 Funcionalidades Avanzadas
- **Dashboard Inteligente** con métricas en tiempo real
- **Gestión Completa** de jugadores, equipos y partidos
- **Analytics Avanzado** con tracking de eventos
- **Sistema de Notificaciones** en tiempo real
- **Optimización de Rendimiento** con métricas detalladas
- **PWA Completa** con offline support

### 🎯 Características Técnicas

#### State Management
- **Signals** para reactividad eficiente
- **Computed Signals** para datos derivados
- **Effects** para side effects automáticos
- **Centralized Store** con `EstadisticaTienda`

#### Rendimiento
- **OnPush Change Detection** en todos los componentes
- **Lazy Loading** de módulos y componentes
- **Virtual Scrolling** para listas grandes
- **Service Worker** para cache inteligente
- **Tree Shaking** optimizado

#### UX/UI
- **Responsive Design** para todos los dispositivos
- **Dark/Light Theme** automático
- **Animaciones Fluidas** con CSS moderno
- **Accesibilidad** completa (WCAG 2.1)
- **PWA** con instalación nativa

## 🏗️ Arquitectura del Proyecto

```
src/
├── app/
│   ├── components/           # Componentes reutilizables
│   ├── interfaces/           # Tipos TypeScript
│   ├── pages/               # Páginas principales
│   ├── services/            # Servicios y lógica de negocio
│   ├── shared/              # Componentes compartidos
│   ├── interceptors/        # HTTP Interceptors
│   └── material.module.ts   # Material Design modules
```

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 18+ 
- Angular CLI 20+
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd proyecto-baloncesto

# Instalar dependencias
npm install

# Ejecutar en desarrollo
ng serve

# Construir para producción
ng build --configuration production
```

### Scripts Disponibles
```bash
# Desarrollo
ng serve

# Construcción
ng build

# Tests
ng test

# Linting
ng lint

# PWA
ng add @angular/pwa
```

## 📱 Páginas Principales

### 🏠 Dashboard
- Métricas en tiempo real
- Acciones rápidas
- Partidos recientes
- Jugadores destacados
- Rankings dinámicos

### 👥 Jugadores
- Gestión completa de jugadores
- Estadísticas detalladas
- Filtros avanzados
- Múltiples vistas (grid, lista, tabla)
- Formularios reactivos

### 🏀 Equipos
- Administración de equipos
- Configuración de equipos
- Estadísticas por equipo
- Gestión de plantillas

### ⚽ Partidos
- Programación de partidos
- Seguimiento en tiempo real
- Estadísticas de partidos
- Historial completo

### 📈 Analytics
- Métricas de uso
- Análisis de rendimiento
- Reportes personalizados
- Exportación de datos

### ⚙️ Configuración
- Preferencias de usuario
- Configuración de notificaciones
- Gestión de datos
- Opciones avanzadas

### 🔧 Optimización
- Métricas de rendimiento
- Optimizaciones aplicadas
- Recomendaciones automáticas
- Análisis de bundle

## 🛠️ Servicios Principales

### EstadisticaTienda
- Gestión centralizada del estado
- Signals para reactividad
- Computed para datos derivados
- Effects para notificaciones automáticas

### AnalyticsServicio
- Tracking de eventos
- Métricas de uso
- Análisis de rendimiento
- Reportes automáticos

### OptimizacionServicio
- Monitoreo de rendimiento
- Optimizaciones automáticas
- Recomendaciones inteligentes
- Métricas en tiempo real

## 🎨 Diseño y UX

### Sistema de Diseño
- Variables CSS para consistencia
- Tema claro/oscuro automático
- Componentes Material Design 3
- Animaciones fluidas

### Responsive Design
- Mobile-first approach
- Breakpoints optimizados
- Navegación adaptativa
- Touch-friendly interfaces

### Accesibilidad
- Navegación por teclado
- Screen reader support
- Alto contraste
- Focus management

## 🔧 Optimizaciones Implementadas

### Angular 20 Features
- ✅ Signals para reactividad
- ✅ Computed signals para datos derivados
- ✅ Effects para side effects
- ✅ Control flow (@if, @for)
- ✅ Standalone components
- ✅ Zoneless change detection

### Rendimiento
- ✅ OnPush change detection
- ✅ Lazy loading de módulos
- ✅ Tree shaking optimizado
- ✅ Service worker activo
- ✅ Virtual scrolling
- ✅ Memoización de cálculos

### PWA
- ✅ Service worker configurado
- ✅ Manifest optimizado
- ✅ Offline support
- ✅ Installable
- ✅ Push notifications ready

## 📊 Métricas de Rendimiento

- **Tiempo de Carga**: < 1.5s
- **First Contentful Paint**: < 1.2s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: Optimizado con tree shaking

## 🧪 Testing

### Estrategia de Testing
- **Unit Tests** para servicios y componentes
- **Integration Tests** para flujos completos
- **E2E Tests** para casos de uso críticos
- **Performance Tests** para métricas de rendimiento

### Herramientas
- Jasmine y Karma para unit tests
- Cypress para E2E tests
- Lighthouse para performance
- Angular Testing Utilities

## 🚀 Despliegue

### Configuración de Producción
```bash
# Construcción optimizada
ng build --configuration production

# Análisis de bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

### Variables de Entorno
```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.baloncesto.com',
  analytics: {
    trackingId: 'GA-XXXXXXXXX'
  }
};
```

## 📈 Roadmap

### Próximas Características
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] Mobile app (Ionic)
- [ ] AI-powered insights
- [ ] Multi-language support
- [ ] Advanced reporting

### Mejoras Técnicas
- [ ] Micro-frontends
- [ ] Advanced caching strategies
- [ ] Real-time synchronization
- [ ] Advanced security
- [ ] Performance monitoring

## 🤝 Contribución

### Guías de Contribución
1. Fork del repositorio
2. Crear feature branch
3. Implementar cambios
4. Ejecutar tests
5. Crear pull request

### Estándares de Código
- TypeScript estricto
- ESLint configurado
- Prettier para formato
- Conventional commits
- Code reviews obligatorios

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollo**: Equipo de desarrollo Angular
- **Diseño**: Equipo de UX/UI
- **QA**: Equipo de testing
- **DevOps**: Equipo de infraestructura

## 📞 Soporte

- **Documentación**: [docs.baloncesto.com](https://docs.baloncesto.com)
- **Issues**: [GitHub Issues](https://github.com/proyecto-baloncesto/issues)
- **Discord**: [Comunidad Discord](https://discord.gg/baloncesto)
- **Email**: soporte@baloncesto.com

---

**¡Construido con ❤️ usando Angular 20 y las mejores prácticas de desarrollo!**