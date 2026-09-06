import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.ts';
import checkPermission from '../middleware/permission.middleware.ts';
import { requireInternalSecret } from '../middleware/internal.middleware.ts';
import { listSpecimens, getSpecimen, registerSpecimen, updateSpecimen, removeSpecimen, adjustCopies, getNewArrivals, getSimilarSpecimens, getTrending, getFeatured, bulkSetFeatured, bulkSetWeeklyRead } from '../controller/specimen.controller.ts';

const router = Router();

router.get('/', listSpecimens);
router.get('/new-arrivals', getNewArrivals);
router.get('/trending', getTrending);
router.get('/featured', getFeatured);
router.get('/:id', getSpecimen);
router.get('/:id/similar', getSimilarSpecimens);

router.post('/', authUser, checkPermission('addSpecimen'), registerSpecimen);
router.put('/:id', authUser, checkPermission('editSpecimen'), updateSpecimen);
router.delete('/:id', authUser, checkPermission('delSpecimen'), removeSpecimen);
router.patch('/:id/copies', requireInternalSecret, adjustCopies);
router.patch('/bulk-featured', authUser, checkPermission('editSpecimen'), bulkSetFeatured);
router.patch('/bulk-weekly-read', authUser, checkPermission('editSpecimen'), bulkSetWeeklyRead);

export default router;