import express from 'express';
import {
    getDashboardStats, getAllUsers, resetUserPassword,
    getStudents, createStudent, updateStudent, deleteStudent,
    getTeachers, createTeacher, updateTeacher, deleteTeacher,
    getParents, createParent, deleteParent,
    getClasses, createClass, deleteClass,
    getNotices, createNotice, deleteNotice,
    getEvents, getAllFees
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/stats', getDashboardStats);

// Users management
router.get('/users', getAllUsers);
router.put('/users/:id/reset-password', resetUserPassword);

// Students
router.get('/students', getStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Teachers
router.get('/teachers', getTeachers);
router.post('/teachers', createTeacher);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

// Parents
router.get('/parents', getParents);
router.post('/parents', createParent);
router.delete('/parents/:id', deleteParent);

// Classes
router.get('/classes', getClasses);
router.post('/classes', createClass);
router.delete('/classes/:id', deleteClass);

// Notices
router.get('/notices', getNotices);
router.post('/notices', createNotice);
router.delete('/notices/:id', deleteNotice);

// Events & Fees
router.get('/events', getEvents);
router.get('/fees', getAllFees);

export default router;
