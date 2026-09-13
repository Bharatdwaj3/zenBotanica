import { Router } from 'express';
import { getAllCaretakers, getCaretakerById } from '../controller/caretaker.controller.ts';
import { authUser } from '../middleware/auth.middleware.ts';
import { requireRole } from '../middleware/role.middleware.ts';

const router = Router();

router.use(authUser);

router.get('/', requireRole(['curator', 'botanist']), getAllCaretakers);
router.get('/:id', requireRole(['curator', 'botanist', 'caretaker']), getCaretakerById);

export default router;
