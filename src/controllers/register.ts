import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/db';

interface UserProps {
    name: string,
    email: string,
    password: string
}

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password }: UserProps = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: "Por favor ingrese todos los datos" });

        const findEmail = await prisma.user.findFirst({
            where: {
                email
            }
        })
        if (findEmail)
            return res.status(400).json({ message: "El correo ingresado ya está registrado" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "estudiante"
            }
        })

        const { password: _, ...dataWithoutPassword } = user;

        return res.status(200).json({success: true, message: 'Usuario registrado exitosamente', data: dataWithoutPassword });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Hubo un error al registrar el usuario" });
    }
}