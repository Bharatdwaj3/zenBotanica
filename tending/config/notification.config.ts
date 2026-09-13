import nodemailer from 'nodemailer';
import { MAILHOG_HOST, MAILHOG_PORT } from './env.config.ts';

// Notificationhog needs no auth/TLS — it's a local dev-only fake SMTP server.
// Swapping to a real provider later only means changing this transport config.
const transporter = nodemailer.createTransport({
  host: MAILHOG_HOST,
  port: MAILHOG_PORT,
  secure: false,
});

interface CareReminderEnotificationParams {
  to: string;
  specimenTitle: string;
  dueAt: Date;
  isOverdue: boolean;
  daysOverdue: number;
}

export const sendReminderEmail = async ({
  to,
  specimenTitle,
  dueAt,
  isOverdue,
  daysOverdue,
}: CareReminderEnotificationParams): Promise<void> => {
  const subject = isOverdue
    ? `Overdue: "${specimenTitle}" is ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} late`
    : `CareReminder: "${specimenTitle}" is due soon`;

  const body = isOverdue
    ? `Your session of "${specimenTitle}" was due on ${dueAt.toDateString()} and is now ${daysOverdue} day(s) overdue. Please return it as soon as possible to avoid further penaltys.`
    : `Your session of "${specimenTitle}" is due on ${dueAt.toDateString()}. Please return or renew it before then.`;

  await transporter.sendMail({
    from: '"Mionchoillte" <notify@mionchoillte.local>',
    to,
    subject,
    text: body,
  });
};
