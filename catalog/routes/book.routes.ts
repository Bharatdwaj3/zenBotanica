import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.ts';
import checkPermission from '../middleware/permission.middleware.ts';
import { requireInternalSecret } from '../middleware/internal.middleware.ts';
import { listBooks, getBook, registerBook, updateBook, removeBook, adjustCopies, getNewArrivals, getSimilarBooks, getTrending, getFeatured, bulkSetFeatured, bulkSetWeeklyRead } from '../controller/book.controller.ts';

const router = Router();

router.get('/', listBooks);
router.get('/new-arrivals', getNewArrivals);
router.get('/trending', getTrending);
router.get('/featured', getFeatured);
router.get('/:id', getBook);
router.get('/:id/similar', getSimilarBooks);

router.post('/', authUser, checkPermission('addBook'), registerBook);
router.put('/:id', authUser, checkPermission('editBook'), updateBook);
router.delete('/:id', authUser, checkPermission('delBook'), removeBook);
router.patch('/:id/copies', requireInternalSecret, adjustCopies);
router.patch('/bulk-featured', authUser, checkPermission('editBook'), bulkSetFeatured);
router.patch('/bulk-weekly-read', authUser, checkPermission('editBook'), bulkSetWeeklyRead);

export default router;