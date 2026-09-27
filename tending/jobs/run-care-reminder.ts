import { runCareReminderCheck } from './care-reminder.job.ts';

runCareReminderCheck()
  .then(() => {
    console.log('[run-care-reminder] Completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[run-care-reminder] Failed:', err);
    process.exit(1);
  });
