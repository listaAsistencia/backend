import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
import { sendMail } from '../config/mailer';

const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Credenciales requeridas' });

  try {

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user)
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const isActive = await prisma.user.findUnique({
      where: {
        id: user.id,
        isActive: false
      }
    })

    if (isActive) return res.status(400)
      .json({ message: "La cuenta se encuentra suspendida, para más información contacta a tu docente" });

    const validPassword = user.password == password ? true : false;

    
    if (!validPassword)
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    return res.json({
      success: true,
      token,
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      attendances: user.attendances
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};
export const sendCode = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email requerido' });

  try {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(user.email, { code, expiresAt: Date.now() + 300000 });

    await sendMail({
      to: user.email,
      subject: 'Código de verificación',
      html: `<p>Tu código es: <b>${code}</b>. Expira en 5 minutos.</p>`,
    });

    return res.json({ success: true, message: 'Código enviado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ success: false, message: 'Contenido faltante' });

  try {
    const stored = verificationCodes.get(email);
    if (!stored || stored.code !== code) {
      return res.status(400).json({ success: false, message: 'Código inválido' });
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ success: false, message: 'Código expirado' });
    }

    verificationCodes.delete(email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};
