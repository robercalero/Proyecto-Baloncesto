const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario || !usuario.activo) {
      throw new Error();
    }
    
    // Actualizar último acceso
    usuario.ultimoAcceso = new Date();
    await usuario.save({ silent: true });
    
    // Agregar usuario a request
    req.usuario = usuario;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Por favor autentícate'
    });
  }
};

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'Por favor autentícate'
      });
    }
    
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }
    
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario = await Usuario.findByPk(decoded.id);
      
      if (usuario && usuario.activo) {
        req.usuario = usuario;
        req.token = token;
      }
    }
  } catch (error) {
    // Ignorar errores, es autenticación opcional
  }
  
  next();
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  optionalAuth
};
