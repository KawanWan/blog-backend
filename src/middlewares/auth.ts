import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticação inválido ou ausente' })
    return
  }

  const token = authHeader.split(' ')[1]
  
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('Chave JWT não configurada')
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string }
    
    if (!decoded.id || typeof decoded.id !== 'string') {
      throw new Error('Token inválido: payload incorreto')
    }
    
    req.userId = decoded.id
    next()
  } catch (error) {
    console.error('Erro na autenticação:', error)
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(403).json({ error: 'Token expirado' })
      return
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ error: 'Token inválido' })
      return
    }
    
    res.status(500).json({ error: 'Erro durante a autenticação' })
  }
}