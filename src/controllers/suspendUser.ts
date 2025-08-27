import { Request, Response } from 'express';
import prisma from '../utils/db';

export const suspendUser = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const deleteUser = await prisma.user.update({
            where: { id },
            data: {
                isActive: false
            }
        });

        res.status(200).json({message: "Cuenta suspendida exitosamente"});
    } catch (error) {
        res.status(500).json({message: "Hubo un error al suspender la cuenta"});
        console.error(error);
    }
}