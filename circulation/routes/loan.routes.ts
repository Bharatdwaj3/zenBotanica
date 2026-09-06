import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.ts";
import checkPermission from "../middleware/permission.middleware.ts";
import { 
  borrowBook, 
  issueLoanForMember,
  returnBook, 
  listMyLoans, 
  listAllLoans, 
  listOverdueLoans,
  renewBook,
  createLoanFine,
  waiveLoanFine,
} from "../controller/loan.controller.ts";
import { runReminderCheck } from "../jobs/reminder.job.ts";

const router = Router();

router.post("/", authUser, checkPermission("borrowBook"), borrowBook);
router.post("/issue", authUser, checkPermission("issueLoan"), issueLoanForMember);
router.put("/:id/return", authUser, checkPermission("returnBook"), returnBook);
router.get("/mine", authUser, checkPermission("viewLoan"), listMyLoans);
router.put("/:id/renew", authUser, checkPermission("returnBook"), renewBook);
router.post("/:id/create-fine", authUser, checkPermission("payFine"), createLoanFine);
router.patch("/:id/waive-fine", authUser, checkPermission("issueFine"), waiveLoanFine);
router.get("/overdue", authUser, checkPermission("listLoan"), listOverdueLoans);
router.get("/", authUser, checkPermission("listLoan"), listAllLoans);

// TEMPORARY: Manual trigger for testing the reminder system
router.get("/test-reminders", authUser, async (req, res) => {
  try {
    await runReminderCheck();
    res.status(200).json({ message: "Reminder check triggered. Check Mailhog UI." });
  } catch (error) {
    res.status(500).json({ error: "Failed to trigger check" });
  }
});

export default router;
