import { Router } from 'express';
import { requireInternalSecret } from '../middleware/internal.middleware.ts';
import { getSessionCounts, internalBorrow } from '../controller/internal.controller.ts';

const router = Router();

router.get('/session-counts', requireInternalSecret, getSessionCounts);
router.post('/borrow', requireInternalSecret, internalBorrow);

export default router;
