import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,message: 'No se proporcionó token de autenticación'
            });
        }
//token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });
        if (!user) {
            return res.status(404).json({ success: false,
                message: 'Usuario no encontrado'
            });
        }        
        const PasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!PasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'La contraseña actual es incorrecta'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 8 caracteres'
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
        
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

    return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    } finally {
        await prisma.$disconnect();
    }
};