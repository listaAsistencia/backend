import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const getUsers = async (req:any, res:any)=>{
    try{
        const users=  await prisma.user.findMany({
            where:{
                role:'estudiante'
            }
        });
        res.json(users);
    }catch(error){
        console.error("error fetching students", error);
        res.status(500).json({error: 'error interno de servidor'})
    }
}