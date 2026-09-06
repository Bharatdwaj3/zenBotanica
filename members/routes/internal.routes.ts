import { Router } from 'express';
import { requireInternalSecret } from '../middleware/internal.middleware.ts';
import { getUserContact, getUserByEmail, getUsersByIds } from '../controller/internal.controller.ts';

const router = Router();

router.get('/user/:id', requireInternalSecret, getUserContact);
router.get('/user/by-email/:email', requireInternalSecret, getUserByEmail);
router.get('/users/by-ids', requireInternalSecret, getUsersByIds);

export default router;
