import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  role: string;
  [key: string]: any;
}


export const auth = (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No autorizado - Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(401).json({ 
      success: false, 
      message: error instanceof jwt.TokenExpiredError 
        ? 'Token expirado' 
        : 'Token inválido' 
    });
  }
};