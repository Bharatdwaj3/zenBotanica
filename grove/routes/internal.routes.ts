import { Router } from 'express';
import { requireInternalSecret } from '../middleware/internal.middleware.ts';
import { getSpecimenByIsbn } from '../controller/internal.controller.ts';

const router = Router();

router.get('/specimen/by-isbn/:isbn', requireInternalSecret, getSpecimenByIsbn);

export default router;
