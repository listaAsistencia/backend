import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/db';

export const validateResetCode = async (email: string, code: string): Promise<boolean> => {
  const record = await prisma.passwordReset.findUnique({
    where: { email },
  });

  if (!record) return false;
  if (record.code !== code) return false;
  if (new Date() > record.expiresAt) return false;

  return true;
};

export const storeResetCode = async (email: string, code: string): Promise<void> => {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await prisma.passwordReset.upsert({
    where: { email },
    update: { code, expiresAt },
    create: { email, code, expiresAt },
  });
};

export const invalidateResetCode = async (email: string): Promise<void> => {
  await prisma.passwordReset.delete({ where: { email } }).catch(() => {});
};

setInterval(async () => {
  await prisma.passwordReset.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}, 1000 * 60 * 30);

export const resetPassword = async (req: Request, res: Response) => {
  try {
    console.log("Body:", req.body);
    console.log("validando codigo");

    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos',
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado',
      });
    }

    const isValid = await validateResetCode(email, code);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await invalidateResetCode(email);

    return res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente',
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};