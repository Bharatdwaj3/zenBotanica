import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import sessionRoutes from './routes/session.routes.ts';
import internalRoutes from './routes/internal.routes.ts';
import penaltyRoutes from './routes/penalty.routes.ts';
import { PORT, FRONTEND_ORIGIN } from './config/env.config.ts';
import { startCareReminderCron } from './jobs/care-reminder.job.ts';
const app = express();
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/session', sessionRoutes);
app.use('/api/v1/internal', internalRoutes);
app.use('/api/v1/penalty', penaltyRoutes);
app.listen(PORT, () => {
  console.log(`Tending service running on port ${PORT}`);
  
  // Start the daily overdue/due-soon care-reminder check
  startCareReminderCron();
});
