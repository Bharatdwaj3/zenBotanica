import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.ts';
import { requireRole } from '../middleware/role.middleware.ts';

const router = Router();

import {
  listFaculty,
  getFaculty,
  registerFaculty,
  updateFaculty,
  removeFaculty,
} from "../controller/faculty.controller.ts";

router.get('/',
    authUser,
    requireRole(['admin', 'faculty', 'student']),
    listFaculty);

router.post('/',
    authUser,
    requireRole(['admin']),
    registerFaculty);

router.get('/:id',
    authUser,
    requireRole(['student', 'admin', 'faculty']),
    getFaculty);

router.put('/profile/:id',
    authUser,
    requireRole(['admin', 'faculty']),
    updateFaculty);

router.delete('/:id',
    authUser,
    requireRole(['admin']),
    removeFaculty);

export default router;
