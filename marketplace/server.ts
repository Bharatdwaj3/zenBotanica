import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productRoutes from './routes/product.routes.ts';
import listingRoutes from './routes/listing.routes.ts';
import { PORT, FRONTEND_ORIGIN } from './config/env.config.ts';

const app = express();

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/product', productRoutes);
app.use('/api/v1/listing', listingRoutes);


app.listen(PORT, () => {
  console.log(`Marketplace service running on port ${PORT}`);
});
