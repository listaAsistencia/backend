import { parse } from "path";
import prisma from "../utils/db";
import { Request, Response } from "express";

export const getStudentAbsences = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const parsedId = parseInt(id, 10);
        console.log(parsedId)
        const user = await prisma.user.findUnique({
            where: { id: parsedId },
        });

        console.log(user);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        const absences = await prisma.absence.findMany({
            where: { studentId: parsedId }
        })

        return res.status(200).json({ absences });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener el usuario' });
    }
}