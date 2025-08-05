import { Router } from 'express';
import { attendance } from '../controllers/attendance';
import { getUsers } from '../controllers/user';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: "Hola /api" });
});

router.post('/attendance', attendance);
router.get('/users', getUsers);

export default router;