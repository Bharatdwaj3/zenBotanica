import { Router } from 'express';
import { requireInternalSecret } from '../middleware/internal.middleware.ts';
import { getBookByIsbn } from '../controller/internal.controller.ts';

const router = Router();

router.get('/book/by-isbn/:isbn', requireInternalSecret, getBookByIsbn);

export default router;
