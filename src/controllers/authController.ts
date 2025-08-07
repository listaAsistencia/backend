import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
export const login = async (req: Request, res: Response) => {

  try{
    
  const { email, password } = req.body;
  if(!email || !password){
    return res.status(400).json({
      success:false,
      error: "Email y contraseña obligatorios",
      message: "Proporciona tu email y contraseña"
    });
  }
  const mail=email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email:mail },
  select:{
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
      success:false,
      error: 'Usuario no encontrado',
      message: "Usuario inexistente con dicho email" 
  });}
console.log(`user:${user.email}`);
console.log(`contraa:${user.password}`);


    const ishash=user.password.startsWith('$2');


    let validpassword = false
    if(ishash){
      validpassword= await bcrypt.compare(password, user.password);
    }else{
      validpassword =password==user.password;
    }
  if (!validpassword) {
    return res.status(401).json({ 
      success:false,
      error: 'Contraseña incorrecta',
    message: "La contraseña ingresada no es válida" });
}

if(!ishash){
  const hashed=await bcrypt.hash(user.password, 10);
  await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed}
      });
}


  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );
  res.json({ success: true, token, id: user.id, role: user.role, name:user.name, email:user.email, attendances: user.attendances, message: "Inicio de sesión exitoso" });
}catch(error){
    console.error(error);
    res.status(500).json({
      success:false,
      error: 'error de servidor',
      message: "Ocurrio un error interno. Intentalo de nuevo"
    })
}
}
