import prisma from "../utils/db";
import { Request, Response } from "express";

export const getStudentAbsences = async (req: Request, res: Response) => {
    const id = req.params.id;

    const parsedId = parseInt(id, 10);

    try {
        const user = await prisma.user.findUnique({
            where: { id: parsedId },
        });

        if (!user) return res.status(404).json({error: 'Usuario no encontrado'});

        const absences = await prisma.absence.findMany({
            where: {studentId: parsedId}
        })

        return res.status(200).json({absences});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener el usuario' });
    }
}