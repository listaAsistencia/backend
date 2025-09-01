import { Request, Response } from 'express';
import prisma from '../utils/db';

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        await prisma.user.delete({
            where: { id }
        });

        res.status(200).json({ message: "Cuenta eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Hubo un error al eliminar la cuenta" });
        console.error(error);
    }
}