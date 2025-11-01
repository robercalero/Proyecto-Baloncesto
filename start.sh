#!/bin/bash

echo "========================================"
echo "   SISTEMA DE GESTION DE BALONCESTO"
echo "========================================"
echo ""
echo "Iniciando el proyecto completo..."
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "[1/3] Instalando dependencias del frontend..."
    npm install
else
    echo "[1/3] Dependencias del frontend ya instaladas"
fi

# Verificar si backend/node_modules existe
if [ ! -d "backend/node_modules" ]; then
    echo "[2/3] Instalando dependencias del backend..."
    cd backend
    npm install
    cd ..
else
    echo "[2/3] Dependencias del backend ya instaladas"
fi

# Verificar si la base de datos existe
if [ ! -f "backend/database.sqlite" ]; then
    echo "[3/3] Base de datos no encontrada. Se creará automáticamente al iniciar..."
else
    echo "[3/3] Base de datos encontrada"
fi

echo ""
echo "========================================"
echo "   INICIANDO SERVICIOS"
echo "========================================"
echo ""
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:4200"
echo ""
echo "Credenciales de prueba:"
echo "  Admin: admin@baloncesto.com / Admin123!"
echo "  Entrenador: entrenador@baloncesto.com / Coach123!"
echo ""
echo "Presiona Ctrl+C para detener los servicios"
echo "========================================"
echo ""

# Iniciar ambos servicios
npm run dev
