import { Router } from 'express';
import { setAattendance } from '../controllers/attendance';
import { getUsers } from '../controllers/getStudents';
import { getStudentAbsences } from '../controllers/getStudentData';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: "Hola /api" });
});

router.patch('/attendance', setAattendance);
router.get('/users', getUsers);
router.get('/users/absences/:id', getStudentAbsences);

export default router;