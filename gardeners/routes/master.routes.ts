import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.ts';
import { requireRole } from '../middleware/role.middleware.ts';

const router = Router();

import {
  listMaster,
  getMaster,
  registerMaster,
  updateMaster,
  removeMaster,
} from "../controller/master.controller.ts";

router.get('/',
    authUser,
    requireRole(['admin', 'master', 'apprentice']),
    listMaster);

router.post('/',
    authUser,
    requireRole(['admin']),
    registerMaster);

router.get('/:id',
    authUser,
    requireRole(['apprentice', 'admin', 'master']),
    getMaster);

router.put('/profile/:id',
    authUser,
    requireRole(['admin', 'master']),
    updateMaster);

router.delete('/:id',
    authUser,
    requireRole(['admin']),
    removeMaster);

export default router;
