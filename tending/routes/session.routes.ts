import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.ts";
import checkPermission from "../middleware/permission.middleware.ts";
import { 
  borrowBook, 
  issueSessionForMember,
  returnBook, 
  listMySessions, 
  listAllSessions, 
  listOverdueSessions,
  renewBook,
  createSessionPenalty,
  waiveSessionPenalty,
} from "../controller/session.controller.ts";
import { runCareReminderCheck } from "../jobs/care-reminder.job.ts";

const router = Router();

router.post("/", authUser, checkPermission("borrowBook"), borrowBook);
router.post("/issue", authUser, checkPermission("issueSession"), issueSessionForMember);
router.put("/:id/return", authUser, checkPermission("returnBook"), returnBook);
router.get("/mine", authUser, checkPermission("viewSession"), listMySessions);
router.put("/:id/renew", authUser, checkPermission("returnBook"), renewBook);
router.post("/:id/create-penalty", authUser, checkPermission("payPenalty"), createSessionPenalty);
router.patch("/:id/waive-penalty", authUser, checkPermission("issuePenalty"), waiveSessionPenalty);
router.get("/overdue", authUser, checkPermission("listSession"), listOverdueSessions);
router.get("/", authUser, checkPermission("listSession"), listAllSessions);

// TEMPORARY: Manual trigger for testing the care-reminder system
router.get("/test-care-reminders", authUser, async (req, res) => {
  try {
    await runCareReminderCheck();
    res.status(200).json({ message: "CareReminder check triggered. Check Mailhog UI." });
  } catch (error) {
    res.status(500).json({ error: "Failed to trigger check" });
  }
});

export default router;
