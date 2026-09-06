import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bookRoutes from './routes/book.routes.ts';
import storageRoutes from './routes/storage.routes.ts';
import cartRoutes from './routes/cart.routes.ts';
import wishlistRoutes from './routes/wishlist.routes.ts';
import internalRoutes from './routes/internal.routes.ts';
import { PORT, FRONTEND_ORIGIN } from './config/env.config.ts';

const app = express();

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/book', bookRoutes);
app.use('/api/v1/storage', storageRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/internal', internalRoutes);

app.listen(PORT, () => {
  console.log(`Catalog service running on port ${PORT}`);
});
