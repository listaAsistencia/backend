import express from 'express';
import { auth } from '../middleware/auth';
import { login, verifyCode, sendCode } from '../controllers/authController';
import { changePassword } from '../controllers/changepassword';
import { resetPassword } from '../controllers/resetPassword';
import { sendResetCode } from '../controllers/sendCode';
const router = express.Router();

router.post('/login', login);
router.post('/send-code', sendCode);
router.post('/verify-code', verifyCode);
router.post('/change-password', auth, changePassword);
router.post('/reset-password', resetPassword);
router.post('/send-code', sendCode);
export default router;
