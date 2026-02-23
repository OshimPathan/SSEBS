import { query } from '../db.js';

export const getTeacherDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const teacherResult = await query('SELECT id FROM teachers WHERE user_id = $1', [userId]);
        if (teacherResult.rows.length === 0) return res.status(404).json({ error: 'Teacher profile not found' });

        const teacherId = teacherResult.rows[0].id;

        const classesResult = await query(`
            SELECT DISTINCT c.id, c.name, c.section, s.name as subject_name
            FROM teacher_subjects ts
            JOIN subjects s ON ts.subject_id = s.id
            JOIN classes c ON s.class_id = c.id
            WHERE ts.teacher_id = $1
        `, [teacherId]);

        const studentCountResult = await query(`
            SELECT COUNT(DISTINCT st.id) as count
            FROM students st
            JOIN subjects sub ON st.class_id = sub.class_id
            JOIN teacher_subjects ts ON sub.id = ts.subject_id
            WHERE ts.teacher_id = $1
        `, [teacherId]);

        const recentNotices = await query("SELECT * FROM notices WHERE target_role IN ('ALL', 'TEACHER') ORDER BY created_at DESC LIMIT 5");
        const events = await query('SELECT * FROM events ORDER BY start_date ASC LIMIT 5');

        // Today's attendance summary
        const todayAttendance = await query(`
            SELECT status, COUNT(*) as count FROM attendance
            WHERE date = CURRENT_DATE AND marked_by = $1
            GROUP BY status
        `, [userId]);

        res.json({
            stats: {
                totalClasses: classesResult.rows.length,
                totalStudents: parseInt(studentCountResult.rows[0].count),
                todayAttendance: todayAttendance.rows,
            },
            assignedClasses: classesResult.rows,
            recentNotices: recentNotices.rows,
            upcomingEvents: events.rows,
        });
    } catch (error) {
        console.error('Error fetching teacher dashboard stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getAssignedStudents = async (req, res) => {
    try {
        const userId = req.user.id;
        const teacherResult = await query('SELECT id FROM teachers WHERE user_id = $1', [userId]);
        if (teacherResult.rows.length === 0) return res.status(404).json({ error: 'Teacher profile not found' });

        const teacherId = teacherResult.rows[0].id;
        const { classId } = req.query;

        let sql = `
            SELECT DISTINCT st.id, st.admission_number, st.roll_number, u.name, u.email, c.name as class_name, c.section, c.id as class_id
            FROM students st
            JOIN users u ON st.user_id = u.id
            JOIN classes c ON st.class_id = c.id
            JOIN subjects sub ON c.id = sub.class_id
            JOIN teacher_subjects ts ON sub.id = ts.subject_id
            WHERE ts.teacher_id = $1
        `;
        const params = [teacherId];

        if (classId) {
            params.push(classId);
            sql += ` AND c.id = $${params.length}`;
        }
        sql += ' ORDER BY c.name, st.roll_number';

        const studentsResult = await query(sql, params);
        res.json({ students: studentsResult.rows });
    } catch (error) {
        console.error('Error fetching assigned students:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const markAttendance = async (req, res) => {
    try {
        const { date, attendance } = req.body; // attendance: [{ student_id, class_id, status }]
        const markedBy = req.user.id;

        for (const record of attendance) {
            await query(
                `INSERT INTO attendance (student_id, class_id, date, status, marked_by)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (student_id, date) DO UPDATE SET status = $4, marked_by = $5`,
                [record.student_id, record.class_id, date, record.status, markedBy]
            );
        }

        res.json({ message: 'Attendance saved successfully', count: attendance.length });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getAttendanceByDate = async (req, res) => {
    try {
        const { date, classId } = req.query;
        const result = await query(`
            SELECT a.*, u.name as student_name, s.roll_number
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE a.date = $1 AND a.class_id = $2
            ORDER BY s.roll_number
        `, [date, classId]);
        res.json({ attendance: result.rows });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const submitMarks = async (req, res) => {
    try {
        const { exam_id, subject_id, marks } = req.body; // marks: [{ student_id, marks_obtained, remarks }]

        for (const record of marks) {
            const grade = record.marks_obtained >= 90 ? 'A+' :
                record.marks_obtained >= 80 ? 'A' :
                record.marks_obtained >= 70 ? 'B+' :
                record.marks_obtained >= 60 ? 'B' :
                record.marks_obtained >= 50 ? 'C+' :
                record.marks_obtained >= 40 ? 'C' : 'D';

            await query(
                `INSERT INTO results (exam_id, student_id, subject_id, marks_obtained, total_marks, grade, remarks)
                 VALUES ($1, $2, $3, $4, 100, $5, $6)
                 ON CONFLICT (exam_id, student_id, subject_id) DO UPDATE SET marks_obtained = $4, grade = $5, remarks = $6`,
                [exam_id, record.student_id, subject_id, record.marks_obtained, grade, record.remarks || null]
            );
        }

        res.json({ message: 'Marks submitted successfully' });
    } catch (error) {
        console.error('Error submitting marks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
