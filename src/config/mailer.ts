import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});transporter.verify((error) => {
  if (error) {
    console.error('Error configurando Nodemailer:', error);
  } else {
    console.log('Nodemailer configurado correctamente');
  }
});