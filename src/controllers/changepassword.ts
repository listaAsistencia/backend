import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/db';

export const changePassword = async (req: Request & { user?: { id: number } }, res: Response) => {
  try {
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("User:", req.user);
    const { currentPassword, newPassword } = req.body;

    if (!req.user) return console.log("no hay usuario")

    // if (req.user?.id) {
    //   return res.status(200).json({
    //     success: true,
    //     message: 'la papapapapapapapa'
    //   });
    // }

    // if (!req.user?.id) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Usuario no autenticado'
    //   });
    // }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }


    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};