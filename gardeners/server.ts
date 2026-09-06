import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.ts';
import masterRoutes from './routes/master.routes.ts';
import apprenticeRoutes from './routes/apprentice.routes.ts';
import internalRoutes from './routes/internal.routes.ts';
import { PORT, FRONTEND_ORIGIN } from './config/env.config.ts';

const app = express();

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/master', masterRoutes);
app.use('/api/v1/apprentice', apprenticeRoutes);
app.use('/api/v1/internal', internalRoutes);

app.get('/debug-env', (req, res) => { res.json({ DATABASE_URL: process.env.DATABASE_URL }); });

app.listen(PORT, () => {
  console.log(`Gardeners service running on port ${PORT}`);
});
