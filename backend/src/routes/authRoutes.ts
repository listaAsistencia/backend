import express from 'express';
import { auth } from '../middleware/auth';

import { login } from '../controllers/authController';
import { changePassword } from '../controllers/changepassword';

const router = express.Router();

router.post('/login', login);
router.post('/change-password', auth, changePassword);

export default router;