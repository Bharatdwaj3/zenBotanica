import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import violationRoutes from './routes/violation.routes.ts';
import ticketRoutes from './routes/ticket.routes.ts';
import helpRequestRoutes from './routes/helpRequest.routes.ts';
import { PORT, FRONTEND_ORIGIN } from './config/env.config.ts';

const app = express();

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/violation', violationRoutes);
app.use('/api/v1/ticket', ticketRoutes);
app.use('/api/v1/help-request', helpRequestRoutes);


app.listen(PORT, () => {
  console.log(`Visitor service running on port ${PORT}`);
});
