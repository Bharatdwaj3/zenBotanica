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
    requireRole(['curator', 'apprentice']),
    listApprentice);

router.get('/profile/:id',
    authUser,
    requireRole(['curator', 'apprentice']),
    getApprentice);

router.post('/',
    authUser,
    requireRole(['curator']),
    registerApprentice);

router.put('/profile/:id',
    authUser,
    requireRole(['curator']),
    updateApprentice);

router.delete('/profile/:id',
    authUser,
    requireRole(['curator']),
    removeApprentice);

export default router;
