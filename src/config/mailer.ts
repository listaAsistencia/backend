import nodemailer, { SendMailOptions } from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const SENDGRID_KEY = process.env.SENDGRID_KEY!;
const EMAIL_FROM=process.env.EMAIL_FROM!;
export async function getTransporter() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: SENDGRID_KEY
    }
  });await transporter.verify();
  return transporter;
}
export async function sendMail(options:SendMailOptions){
    const transporter=await getTransporter();
    const info=await transporter.sendMail({
        ...options,
        from: EMAIL_FROM,
    });
    return info;
}

