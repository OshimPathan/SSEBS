import express from 'express';
import { getStudentDashboardStats, getStudentResults, getStudentFees, getStudentNotices } from '../controllers/studentController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('STUDENT', 'PARENT'));

router.get('/stats', getStudentDashboardStats);
router.get('/results', getStudentResults);
router.get('/fees', getStudentFees);
router.get('/notices', getStudentNotices);

export default router;
