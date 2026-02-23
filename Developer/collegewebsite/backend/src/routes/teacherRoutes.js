import express from 'express';
import { getTeacherDashboardStats, getAssignedStudents, markAttendance, getAttendanceByDate, submitMarks } from '../controllers/teacherController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('TEACHER'));

router.get('/stats', getTeacherDashboardStats);
router.get('/students', getAssignedStudents);
router.post('/attendance', markAttendance);
router.get('/attendance', getAttendanceByDate);
router.post('/marks', submitMarks);

export default router;
