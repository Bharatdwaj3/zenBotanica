import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.ts';
import { requireRole } from '../middleware/role.middleware.ts';
import { refreshAccessToken } from '../middleware/token.middleware.ts';
import { register, login, logout, getProfile, updateUserRole, deleteUser, completeProfile } from '../controller/auth.controller.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authUser, logout);
router.post('/refresh', refreshAccessToken);

router.get('/profile', authUser, getProfile);
router.post('/profile', authUser, completeProfile);
router.put('/role', authUser, requireRole(['admin']), updateUserRole);
router.delete('/user/:id', authUser, requireRole(['admin']), deleteUser);

export default router;