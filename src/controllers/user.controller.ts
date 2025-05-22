import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, avatar } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const avatarBuffer = avatar ? Buffer.from(avatar, 'base64') : null

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar: avatarBuffer,
      },
    })

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar ? Buffer.from(user.avatar).toString('base64') : null,
    })
  } catch (err) {
    console.error('Erro register:', err)
    res.status(400).json({ error: 'Usuário já existe ou erro ao registrar' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
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

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    })

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ? Buffer.from(user.avatar).toString('base64') : null,
      },
    })
  } catch (err) {
    console.error('Erro login:', err)
    res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true },
    })

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' })
      return
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar ? Buffer.from(user.avatar).toString('base64') : null,
    })
  } catch (err) {
    console.error('Erro getProfile:', err)
    res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

// Update Profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' })
      return
    }

    // pegamos os dois campos do body
    const { name: firstName, surname } = req.body

    // montamos o nome completo
    const fullName = surname
      ? `${firstName.trim()} ${surname.trim()}`
      : firstName.trim()

    // avatar continua igual
    const avatarBuffer = req.file?.buffer

    const dataToUpdate: { name?: string; avatar?: Buffer } = {}
    if (fullName)      dataToUpdate.name   = fullName
    if (avatarBuffer)  dataToUpdate.avatar = avatarBuffer

    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, avatar: true },
    })

    res.json({
      id:     updated.id,
      name:   updated.name,
      email:  updated.email,
      avatar: updated.avatar
        ? Buffer.from(updated.avatar).toString('base64')
        : null,
    })
  } catch (err) {
    console.error('Erro updateProfile:', err)
    res.status(500).json({ error: 'Erro ao atualizar perfil' })
  }
}
