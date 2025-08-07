import { Request, Response } from "express"
import prisma from "../utils/db";

interface Student {
  id: number;
  name: string;
  isPresent: boolean;
}

interface Attendance {
  students: Student[];
}

const setStudentAttendance = async (student: Student, attendanceDate: Date) => {
  try {
    if (student.isPresent) {
      await prisma.user.update(
        {
          where: { id: student.id },
          data: { attendances: { increment: 1 } }
        }
      )
    } else {
      await prisma.absence.create(
        {
          data: {
            date: attendanceDate,
            studentId: student.id
          }
        }
      )
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const setAattendance = async (req: Request<{}, any, Attendance>, res: Response): Promise<void> => {
  try {
    const { students } = req.body;
    const currentDate = new Date();
    await Promise.all(
      students.map(async (student) => {
        try {
          console.log(`Estudiante ${student.name}, presente: ${student.isPresent}`);
          await setStudentAttendance(student, currentDate);
        } catch (e) {
          console.error(`Error procesando estudiante ${student.name}:`, e);
          throw Error;
        }
      })
    );

    res.status(200).json({ message: "Asistencia tomada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error al tomar la asistencia", error: error instanceof Error ? error.message : error });
  }
}


