# 🏀 INICIAR PROYECTO DE BALONCESTO

## 🚀 INICIO RÁPIDO (Solo 3 pasos)

### Opción A: Windows
```bash
1. Doble clic en start.bat
2. Esperar que se abra el navegador
3. Iniciar sesión con las credenciales de prueba
```

### Opción B: Comandos Manuales
```bash
# 1. Instalar todo (solo primera vez)
npm run install:all

# 2. Iniciar proyecto
npm run dev

# 3. El navegador se abrirá automáticamente en http://localhost:4200
```

## 🔑 CREDENCIALES DE ACCESO

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin@baloncesto.com | Admin123! | Administrador Total |
| entrenador@baloncesto.com | Coach123! | Gestión de Equipos |
| analista@baloncesto.com | Analyst123! | Solo Análisis |

## ✅ CARACTERÍSTICAS FUNCIONANDO

### Backend (Puerto 3000)
- ✅ API REST completa
- ✅ Base de datos SQLite con 30 equipos NBA
- ✅ Autenticación JWT
- ✅ 50+ jugadores reales con estadísticas
- ✅ Sistema de notificaciones
- ✅ Validación y seguridad

### Frontend (Puerto 4200)
- ✅ Login con roles y permisos
- ✅ Dashboard interactivo
- ✅ Gestión de jugadores
- ✅ Gestión de equipos
- ✅ Gestión de partidos
- ✅ Estadísticas y análisis
- ✅ Gráficos dinámicos
- ✅ Tema oscuro/claro
- ✅ PWA instalable

## 🛠️ SOLUCIÓN DE PROBLEMAS

### Si algo no funciona:

1. **Error de dependencias:**
```bash
npm run fresh
```

2. **Puerto ocupado:**
   - Cambiar puerto en `backend/.env` (backend)
   - Cambiar puerto en `angular.json` (frontend)

3. **Base de datos corrupta:**
```bash
cd backend
rm database.sqlite
npm run seed
```

## 📱 ACCESOS DIRECTOS

- **Frontend:** http://localhost:4200
- **API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health

## 💡 COMANDOS ÚTILES

```bash
npm run dev          # Iniciar todo
npm run backend      # Solo backend
npm run frontend     # Solo frontend
npm run build        # Compilar para producción
npm run seed         # Reiniciar datos de prueba
```

---

**¡El proyecto está COMPLETO y LISTO PARA USAR!** 🎉

Solo ejecuta `npm run dev` y empieza a explorar.
