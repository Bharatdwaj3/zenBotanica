import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.ts';
import { requireRole } from '../middleware/role.middleware.ts';

const router = Router();

import {
  listApprentice,
  getApprentice,
  registerApprentice,
  updateApprentice,
  removeApprentice,
} from '../controller/apprentice.controller.ts';

router.get('/',
    authUser,
    requireRole(['admin', 'master', 'apprentice']),
    listApprentice);

router.get('/profile/:id',
    authUser,
    requireRole(['master', 'apprentice', 'admin']),
    getApprentice);

router.post('/',
    authUser,
    requireRole(['admin']),
    registerApprentice);

router.put('/profile/:id',
    authUser,
    requireRole(['admin']),
    updateApprentice);

router.delete('/profile/:id',
    authUser,
    requireRole(['admin']),
    removeApprentice);

export default router;
