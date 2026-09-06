import { Router } from 'express';
import { requireInternalSecret } from '../middleware/internal.middleware.ts';
import { getLoanCounts, internalBorrow } from '../controller/internal.controller.ts';

const router = Router();

router.get('/loan-counts', requireInternalSecret, getLoanCounts);
router.post('/borrow', requireInternalSecret, internalBorrow);

export default router;
