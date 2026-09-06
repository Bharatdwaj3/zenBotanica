import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.ts';
import { requireRole } from '../middleware/role.middleware.ts';

const router = Router();

import {
  listStudent,
  getStudent,
  registerStudent,
  updateStudent,
  removeStudent,
} from '../controller/student.controller.ts';

router.get('/',
    authUser,
    requireRole(['admin', 'faculty', 'student']),
    listStudent);

router.get('/profile/:id',
    authUser,
    requireRole(['faculty', 'student', 'admin']),
    getStudent);

router.post('/',
    authUser,
    requireRole(['admin']),
    registerStudent);

router.put('/profile/:id',
    authUser,
    requireRole(['admin']),
    updateStudent);

router.delete('/profile/:id',
    authUser,
    requireRole(['admin']),
    removeStudent);

export default router;
