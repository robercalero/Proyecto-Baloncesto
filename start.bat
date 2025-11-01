@echo off
echo ========================================
echo    SISTEMA DE GESTION DE BALONCESTO
echo ========================================
echo.
echo Iniciando el proyecto completo...
echo.

:: Verificar si node_modules existe
if not exist "node_modules" (
    echo [1/3] Instalando dependencias del frontend...
    call npm install
) else (
    echo [1/3] Dependencias del frontend ya instaladas
)

:: Verificar si backend/node_modules existe
if not exist "backend\node_modules" (
    echo [2/3] Instalando dependencias del backend...
    cd backend
    call npm install
    cd ..
) else (
    echo [2/3] Dependencias del backend ya instaladas
)

:: Verificar si la base de datos existe
if not exist "backend\database.sqlite" (
    echo [3/3] Base de datos no encontrada. Se creara automaticamente al iniciar...
) else (
    echo [3/3] Base de datos encontrada
)

echo.
echo ========================================
echo    INICIANDO SERVICIOS
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4200
echo.
echo Credenciales de prueba:
echo   Admin: admin@baloncesto.com / Admin123!
echo   Entrenador: entrenador@baloncesto.com / Coach123!
echo.
echo Presiona Ctrl+C para detener los servicios
echo ========================================
echo.

:: Iniciar ambos servicios
call npm run dev
