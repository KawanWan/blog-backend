import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })
    res.status(201).json(user)
  } catch (err) {
    res.status(400).json({ error: 'Usuário já existe ou erro ao registrar' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(400).json({ error: 'Credenciais inválidas' })
      return
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      res.status(400).json({ error: 'Credenciais inválidas' })
      return
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(500).json({ error: 'Erro interno no servidor' })
  }
}