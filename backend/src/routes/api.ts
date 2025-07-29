import { Router } from 'express';
import { attendance } from '../controllers/attendance';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: "Hola /api" });
});

router.post('/attendance', attendance);

export default router;