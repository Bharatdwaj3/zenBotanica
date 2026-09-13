import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.ts';
import { requireRole } from '../middleware/role.middleware.ts';
import {
  listBotanist,
  getBotanist,
  registerBotanist,
  updateBotanist,
  deleteBotanist,
} from '../controller/botanist.controller.ts';

const router = Router();

router.get('/', authUser, requireRole(['curator']), listBotanist);
router.get('/:id', authUser, requireRole(['curator', 'botanist']), getBotanist);
router.post('/', authUser, requireRole(['curator']), registerBotanist);
router.put('/:id', authUser, requireRole(['curator', 'botanist']), updateBotanist);
router.delete('/:id', authUser, requireRole(['curator']), deleteBotanist);

export default router;
