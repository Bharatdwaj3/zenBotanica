import cron from 'node-cron';
import prisma from '../config/prisma-client.ts';
import { sendReminderEmail } from '../config/mailer.config.ts';
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

// Sends reminders for: (a) loans overdue right now, and (b) loans due within 
// the next DUE_SOON_WINDOW_DAYS days. Runs once a day.
export const runReminderCheck = async (): Promise<void> => {
  console.log('[reminder.job] Running daily overdue/due-soon check...');

  const now = new Date();
  const dueSoonThreshold = new Date();
  dueSoonThreshold.setDate(dueSoonThreshold.getDate() + DUE_SOON_WINDOW_DAYS);

  const loansToRemind = await prisma.loan.findMany({
    where: {
      returnedAt: null,
      dueAt: { lt: dueSoonThreshold },
    },
  });

  console.log(`[reminder.job] Found ${loansToRemind.length} loan(s) needing a reminder.`);

  for (const loan of loansToRemind) {
    const isOverdue = loan.dueAt < now;
    const daysOverdue = isOverdue
      ? Math.ceil((now.getTime() - loan.dueAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const [bookTitle, email] = await Promise.all([
      getBookTitle(loan.bookId),
      getUserEmail(loan.userId),
    ]);

    if (!email) {
      console.error(`[reminder.job] No email found for user ${loan.userId}, skipping loan ${loan.id}`);
      continue;
    }

    try {
      await sendReminderEmail({ to: email, bookTitle, dueAt: loan.dueAt, isOverdue, daysOverdue });
      console.log(`[reminder.job] Sent reminder to ${email} for loan ${loan.id}`);
    } catch (error) {
      console.error(`[reminder.job] Failed to send reminder for loan ${loan.id}:`, error);
    }
  }
};

// Runs every day at 8:00 AM server time.
export const startReminderCron = (): void => {
  cron.schedule('0 8 * * *', () => {
    runReminderCheck().catch((err) => console.error('[reminder.job] Unhandled error:', err));
  });
  console.log('[reminder.job] Cron scheduled: daily at 08:00');
};
