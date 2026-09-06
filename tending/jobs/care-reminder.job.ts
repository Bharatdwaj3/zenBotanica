import cron from 'node-cron';
import prisma from '../config/prisma-client.ts';
import { sendReminderEmail } from '../config/notification.config.ts';
import { CATALOG_SERVICE_URL, MEMBERS_SERVICE_URL, INTERNAL_SERVICE_SECRET } from '../config/env.config.ts';

const DUE_SOON_WINDOW_DAYS = 2;

const getBookTitle = async (bookId: number): Promise<string> => {
  try {
    const res = await fetch(`${CATALOG_SERVICE_URL}/api/v1/book/${bookId}`);
    if (!res.ok) return `Book #${bookId}`;
    const book = await res.json();
    return book.title || `Book #${bookId}`;
  } catch {
    return `Book #${bookId}`;
  }
};

const getUserEmail = async (userId: number): Promise<string | null> => {
  try {
    const res = await fetch(`${MEMBERS_SERVICE_URL}/api/v1/internal/user/${userId}`, {
      headers: { 'x-internal-secret': INTERNAL_SERVICE_SECRET },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user.email || null;
  } catch {
    return null;
  }
};

// Sends care-reminders for: (a) sessions overdue right now, and (b) sessions due within 
// the next DUE_SOON_WINDOW_DAYS days. Runs once a day.
export const runCareReminderCheck = async (): Promise<void> => {
  console.log('[care-reminder.job] Running daily overdue/due-soon check...');

  const now = new Date();
  const dueSoonThreshold = new Date();
  dueSoonThreshold.setDate(dueSoonThreshold.getDate() + DUE_SOON_WINDOW_DAYS);

  const sessionsToRemind = await prisma.loan.findMany({
    where: {
      returnedAt: null,
      dueAt: { lt: dueSoonThreshold },
    },
  });

  console.log(`[care-reminder.job] Found ${sessionsToRemind.length} session(s) needing a care-reminder.`);

  for (const session of sessionsToRemind) {
    const isOverdue = session.dueAt < now;
    const daysOverdue = isOverdue
      ? Math.ceil((now.getTime() - session.dueAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const [bookTitle, email] = await Promise.all([
      getBookTitle(session.bookId),
      getUserEmail(session.userId),
    ]);

    if (!email) {
      console.error(`[care-reminder.job] No email found for user ${session.userId}, skipping session ${session.id}`);
      continue;
    }

    try {
      await sendReminderEmail({ to: email, bookTitle, dueAt: session.dueAt, isOverdue, daysOverdue });
      console.log(`[care-reminder.job] Sent care-reminder to ${email} for session ${session.id}`);
    } catch (error) {
      console.error(`[care-reminder.job] Failed to send care-reminder for session ${session.id}:`, error);
    }
  }
};

// Runs every day at 8:00 AM server time.
export const startCareReminderCron = (): void => {
  cron.schedule('0 8 * * *', () => {
    runCareReminderCheck().catch((err) => console.error('[care-reminder.job] Unhandled error:', err));
  });
  console.log('[care-reminder.job] Cron scheduled: daily at 08:00');
};
