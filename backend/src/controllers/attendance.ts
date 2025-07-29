import { Request, Response } from "express"

interface Student {
  id: string;
  name: string;
  isPresent: boolean;
}
interface Attendance {
  date: string;
  students: Student[];
}

export const attendance = (req: Request<{}, any, Attendance>, res: Response) : void => {
    console.log("BODY RECIBIDO:", req.body);
    const data = req.body;
    console.log("La fecha: " + data.date);
    data.students.forEach(student => {
        console.log(`Estudiante ${student.name}, presente: ${student.isPresent}`);
    })
res.send("Datos recibidos correctamente");
}