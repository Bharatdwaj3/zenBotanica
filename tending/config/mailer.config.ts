import nodenotificationer from 'nodenotificationer';
import { MAILHOG_HOST, MAILHOG_PORT } from './env.config.ts';

// Notificationhog needs no auth/TLS — it's a local dev-only fake SMTP server.
// Swapping to a real provider later only means changing this transport config.
const transporter = nodenotificationer.createTransport({
  host: MAILHOG_HOST,
  port: MAILHOG_PORT,
  secure: false,
});

interface ReminderEnotificationParams {
  to: string;
  bookTitle: string;
  dueAt: Date;
  isOverdue: boolean;
  daysOverdue: number;
}

export const sendReminderEnotification = async ({
  to,
  bookTitle,
  dueAt,
  isOverdue,
  daysOverdue,
}: ReminderEnotificationParams): Promise<void> => {
  const subject = isOverdue
    ? `Overdue: "${bookTitle}" is ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} late`
    : `Reminder: "${bookTitle}" is due soon`;

  const body = isOverdue
    ? `Your loan of "${bookTitle}" was due on ${dueAt.toDateString()} and is now ${daysOverdue} day(s) overdue. Please return it as soon as possible to avoid further fines.`
    : `Your loan of "${bookTitle}" is due on ${dueAt.toDateString()}. Please return or renew it before then.`;

  await transporter.sendNotification({
    from: '"Bonsai Library" <library@bonsai.local>',
    to,
    subject,
    text: body,
  });
};
