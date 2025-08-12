import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
import { transporter } from '../config/mailer';
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email y contraseña obligatorios",
        message: "Proporciona tu email y contraseña"
      });
    }

    const mail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: mail },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        name: true,
        attendances: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: "Usuario inexistente con dicho email"
      });
    }

    const isHash = user.password.startsWith('$2');
    let validPassword = isHash
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña incorrecta',
        message: "La contraseña ingresada no es válida"
      });
    }

    if (!isHash) {
      const hashed = await bcrypt.hash(user.password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed }
      });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    verificationCodes.set(user.email, { code, expiresAt });

    // Enviar código por email
    await transporter.sendMail({
      from: `"Sistema de Asistencias" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Código de verificación',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Código de verificación</h2>
          <p>Tu código para iniciar sesión es:</p>
          <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #2563eb;">${code}</div>
          <p>Este código expirará en 5 minutos.</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: "Código enviado a tu correo. Verifícalo para continuar."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'error de servidor',
      message: "Ocurrió un error interno. Inténtalo de nuevo"
    });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email y código son requeridos' });
    }

    const storedData = verificationCodes.get(email);
    if (!storedData) {
      return res.status(400).json({ message: 'Código no encontrado o expirado' });
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Código expirado' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ message: 'Código incorrecto' });
    }

    verificationCodes.delete(email);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    res.status(200).json({
      message: 'Código verificado',
      verified: true,
      token,
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      attendances: user.attendances
    });

  } catch (error) {
    console.error('Error en verify-code:', error);
    res.status(500).json({ message: 'Error al verificar el código' });
  }
};
