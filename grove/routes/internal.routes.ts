import { Router } from 'express';
import { requireInternalSecret } from '../middleware/internal.middleware.ts';
import { getSpecimenByAccessionNumber } from '../controller/internal.controller.ts';

const router = Router();

router.get('/specimen/by-accession/:accessionNumber', requireInternalSecret, getSpecimenByAccessionNumber);

export default router;
