import { Request, Response } from 'express';
import { storeResetCode } from './resetPassword';

export const sendResetCode = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email requerido' });
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await storeResetCode(email, code);
  return res.json({ success: true, message: 'Código enviado', code });
};