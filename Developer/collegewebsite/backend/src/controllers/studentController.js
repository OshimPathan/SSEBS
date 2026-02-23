import { query } from '../db.js';

export const getStudentDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        let studentQuery = 'SELECT * FROM students WHERE user_id = $1';
        if (req.user.role === 'PARENT') {
            studentQuery = 'SELECT * FROM students WHERE parent_user_id = $1';
        }

        const studentResult = await query(studentQuery, [userId]);
        if (studentResult.rows.length === 0) return res.status(404).json({ error: 'Student profile not found' });

        const student = studentResult.rows[0];
        const classResult = await query('SELECT * FROM classes WHERE id = $1', [student.class_id]);

        const noticesResult = await query(`
            SELECT * FROM notices WHERE target_role IN ('ALL', $1)
            ORDER BY created_at DESC LIMIT 5
        `, [req.user.role]);

        const feesResult = await query("SELECT * FROM fees WHERE student_id = $1 AND status != 'PAID' ORDER BY due_date ASC", [student.id]);
        const paidFeesResult = await query("SELECT * FROM fees WHERE student_id = $1 AND status = 'PAID' ORDER BY due_date DESC LIMIT 5", [student.id]);

        // Get attendance summary
        const attendanceResult = await query(`
            SELECT status, COUNT(*) as count FROM attendance
            WHERE student_id = $1
            GROUP BY status
        `, [student.id]);

        const events = await query('SELECT * FROM events ORDER BY start_date ASC LIMIT 5');

        res.json({
            profile: studentResult.rows,
            classDetails: classResult.rows[0],
            recentNotices: noticesResult.rows,
            pendingFees: feesResult.rows,
            paidFees: paidFeesResult.rows,
            attendanceSummary: attendanceResult.rows,
            upcomingEvents: events.rows,
        });
    } catch (error) {
        console.error('Error fetching student dashboard stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getStudentResults = async (req, res) => {
    try {
        const userId = req.user.id;
        let studentIdQuery = 'SELECT id FROM students WHERE user_id = $1';
        if (req.user.role === 'PARENT') {
            studentIdQuery = 'SELECT id FROM students WHERE parent_user_id = $1';
        }

        const studentResult = await query(studentIdQuery, [userId]);
        if (studentResult.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

        const studentIds = studentResult.rows.map(s => s.id);
        const results = await query(`
            SELECT r.marks_obtained, r.total_marks, r.grade, r.remarks,
                   e.name as exam_name, e.start_date,
                   s.name as subject_name
            FROM results r
            JOIN exams e ON r.exam_id = e.id
            JOIN subjects s ON r.subject_id = s.id
            WHERE r.student_id = ANY($1)
            ORDER BY e.start_date DESC, s.name ASC
        `, [studentIds]);

        res.json({ results: results.rows });
    } catch (error) {
        console.error('Error fetching student results:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getStudentFees = async (req, res) => {
    try {
        const userId = req.user.id;
        let studentIdQuery = 'SELECT id FROM students WHERE user_id = $1';
        if (req.user.role === 'PARENT') {
            studentIdQuery = 'SELECT id FROM students WHERE parent_user_id = $1';
        }

        const studentResult = await query(studentIdQuery, [userId]);
        if (studentResult.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

        const studentId = studentResult.rows[0].id;
        const pending = await query("SELECT * FROM fees WHERE student_id = $1 AND status != 'PAID' ORDER BY due_date ASC", [studentId]);
        const paid = await query("SELECT * FROM fees WHERE student_id = $1 AND status = 'PAID' ORDER BY due_date DESC", [studentId]);

        res.json({ pending: pending.rows, history: paid.rows });
    } catch (error) {
        console.error('Error fetching student fees:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getStudentNotices = async (req, res) => {
    try {
        const result = await query(`
            SELECT n.*, u.name as author_name
            FROM notices n LEFT JOIN users u ON n.created_by = u.id
            WHERE n.target_role IN ('ALL', 'STUDENT')
            ORDER BY n.created_at DESC
        `);
        res.json({ notices: result.rows });
    } catch (error) {
        console.error('Error fetching student notices:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
