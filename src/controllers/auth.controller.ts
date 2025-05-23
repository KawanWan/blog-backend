import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Configura o transporte de e-mail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Handler para solicitar recuperação de senha
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  // Responder 200 mesmo se não existir, por segurança
  if (!user) {
    res.status(200).json({ message: 'Se esse e-mail estiver cadastrado, enviaremos um link.' });
    return;
  }

  // Gera token e expira em 1 hora
  const token = uuid();
  const expires = new Date(Date.now() + 1000 * 60 * 60);

  // Salva token no banco
  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt: expires },
  });

  // Monta URL de reset
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  // Envia e-mail
  await transporter.sendMail({
    from: '"Meu Blog" <no-reply@meublog.com>',
    to: email,
    subject: 'Recuperação de senha',
    html: `
      <p>Você solicitou recuperação de senha.</p>
      <p>Clique <a href="${resetUrl}">aqui</a> para redefinir sua senha.</p>
      <p>Esse link expira em 1 hora.</p>
    `,
  });

  res.status(200).json({ message: 'Se esse e-mail estiver cadastrado, enviaremos um link.' });
};

// Handler para redefinir a senha
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  // Busca token válido
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date()) {
    res.status(400).json({ error: 'Token inválido ou expirado.' });
    return;
  }

  // Atualiza senha do usuário
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: record.userId },
    data: { password: hashed },
  });

  // Remove token para não reutilização
  await prisma.passwordResetToken.delete({ where: { token } });

  res.json({ message: 'Senha atualizada com sucesso.' });
};
