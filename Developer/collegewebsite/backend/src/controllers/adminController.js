import bcrypt from 'bcrypt';
import { query } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10');

// ── Dashboard Stats ──
export const getDashboardStats = async (req, res) => {
    try {
        const studentsCount = await query('SELECT COUNT(*) FROM students');
        const teachersCount = await query('SELECT COUNT(*) FROM teachers');
        const classesCount = await query('SELECT COUNT(*) FROM classes');
        const parentsCount = await query("SELECT COUNT(*) FROM users WHERE role = 'PARENT'");
        const pendingFees = await query("SELECT COUNT(*) FROM fees WHERE status = 'UNPAID'");
        const notices = await query('SELECT * FROM notices ORDER BY created_at DESC LIMIT 5');
        const events = await query('SELECT * FROM events ORDER BY start_date ASC LIMIT 5');

        const attendanceStats = await query(`
            SELECT date, 
                   COUNT(*) FILTER (WHERE status = 'PRESENT') as present,
                   COUNT(*) FILTER (WHERE status = 'ABSENT') as absent,
                   COUNT(*) FILTER (WHERE status = 'LATE') as late,
                   COUNT(*) as total
            FROM attendance
            WHERE date >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY date ORDER BY date ASC
        `);

        const recentStudents = await query(`
            SELECT s.id, s.admission_number, u.name, c.name as class_name, c.section
            FROM students s JOIN users u ON s.user_id = u.id
            LEFT JOIN classes c ON s.class_id = c.id
            ORDER BY s.created_at DESC LIMIT 5
        `);

        res.json({
            stats: {
                totalStudents: parseInt(studentsCount.rows[0].count),
                totalTeachers: parseInt(teachersCount.rows[0].count),
                totalClasses: parseInt(classesCount.rows[0].count),
                totalParents: parseInt(parentsCount.rows[0].count),
                pendingFees: parseInt(pendingFees.rows[0].count),
            },
            attendanceStats: attendanceStats.rows,
            recentNotices: notices.rows,
            upcomingEvents: events.rows,
            recentStudents: recentStudents.rows,
        });
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ── All Users ──
export const getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let sql = 'SELECT id, name, email, role, created_at FROM users';
        const params = [];
        const conditions = [];

        if (role) {
            params.push(role);
            conditions.push(`role = $${params.length}`);
        }
        if (search) {
            params.push(`%${search}%`);
            conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
        }

        if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY created_at DESC';

        const result = await query(sql, params);
        res.json({ users: result.rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ── Students CRUD ──
export const getStudents = async (req, res) => {
    try {
        const { search, classId } = req.query;
        let sql = `
            SELECT s.id, s.admission_number, s.roll_number, s.parent_name, s.parent_phone,
                   s.parent_email, s.parent_user_id, s.date_of_birth, s.blood_group, s.address, s.class_id,
                   u.id as user_id, u.name, u.email, c.name as class_name, c.section
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN classes c ON s.class_id = c.id
        `;
        const params = [];
        const conditions = [];

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`(u.name ILIKE $${params.length} OR s.admission_number ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
        }
        if (classId) {
            params.push(classId);
            conditions.push(`s.class_id = $${params.length}`);
        }

        if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY c.name, s.roll_number';

        const result = await query(sql, params);
        res.json({ students: result.rows });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createStudent = async (req, res) => {
    try {
        const {
            name, email, password, class_id, roll_number, date_of_birth,
            blood_group, address, parent_name, parent_phone, parent_email,
            create_parent_account
        } = req.body;

        const passwordHash = await bcrypt.hash(password || 'student123', SALT_ROUNDS);

        // Create student user account
        const userResult = await query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, passwordHash, 'STUDENT']
        );
        const userId = userResult.rows[0].id;

        // Generate admission number
        const countResult = await query('SELECT COUNT(*) FROM students');
        const admNo = `ADM${new Date().getFullYear()}${String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0')}`;

        // Optionally create parent user account
        let parentUserId = null;
        if (create_parent_account && parent_email) {
            const parentPasswordHash = await bcrypt.hash('parent123', SALT_ROUNDS);
            try {
                const parentResult = await query(
                    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
                    [parent_name, parent_email, parentPasswordHash, 'PARENT']
                );
                parentUserId = parentResult.rows[0].id;
            } catch (e) {
                if (e.code === '23505') {
                    const existing = await query("SELECT id FROM users WHERE email = $1 AND role = 'PARENT'", [parent_email]);
                    if (existing.rows[0]) parentUserId = existing.rows[0].id;
                }
            }
        }

        const studentResult = await query(
            `INSERT INTO students (user_id, admission_number, class_id, roll_number, date_of_birth, blood_group, address, parent_name, parent_phone, parent_email, parent_user_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [userId, admNo, class_id || null, roll_number || null, date_of_birth || null, blood_group || null, address || null, parent_name, parent_phone, parent_email || null, parentUserId]
        );

        res.status(201).json({
            message: 'Student created successfully',
            student: studentResult.rows[0],
            credentials: {
                student: { email, password: password || 'student123' },
                parent: parentUserId ? { email: parent_email, password: 'parent123' } : null
            }
        });
    } catch (error) {
        console.error('Error creating student:', error);
        if (error.code === '23505') return res.status(400).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, class_id, roll_number, date_of_birth, blood_group, address, parent_name, parent_phone, parent_email } = req.body;

        const studentResult = await query('SELECT user_id FROM students WHERE id = $1', [id]);
        if (studentResult.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

        const userId = studentResult.rows[0].user_id;

        if (name || email) {
            const sets = [];
            const vals = [];
            if (name) { vals.push(name); sets.push(`name = $${vals.length}`); }
            if (email) { vals.push(email); sets.push(`email = $${vals.length}`); }
            vals.push(userId);
            await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${vals.length}`, vals);
        }

        await query(
            `UPDATE students SET class_id = COALESCE($1, class_id), roll_number = COALESCE($2, roll_number),
             date_of_birth = COALESCE($3, date_of_birth), blood_group = COALESCE($4, blood_group),
             address = COALESCE($5, address), parent_name = COALESCE($6, parent_name),
             parent_phone = COALESCE($7, parent_phone), parent_email = COALESCE($8, parent_email)
             WHERE id = $9`,
            [class_id || null, roll_number || null, date_of_birth || null, blood_group || null, address || null, parent_name || null, parent_phone || null, parent_email || null, id]
        );

        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error('Error updating student:', error);
        if (error.code === '23505') return res.status(400).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const studentResult = await query('SELECT user_id FROM students WHERE id = $1', [id]);
        if (studentResult.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

        await query('DELETE FROM students WHERE id = $1', [id]);
        await query('DELETE FROM users WHERE id = $1', [studentResult.rows[0].user_id]);
        res.json({ message: 'Student deleted' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ── Teachers CRUD ──
export const getTeachers = async (req, res) => {
    try {
        const { search } = req.query;
        let sql = `
            SELECT t.id, t.employee_id, t.phone, t.qualification, t.joined_date, t.address,
                   u.name, u.email,
                   COALESCE(array_agg(DISTINCT sub.name) FILTER (WHERE sub.name IS NOT NULL), '{}') as subjects,
                   COALESCE(array_agg(DISTINCT c.name || ' ' || COALESCE(c.section,'')) FILTER (WHERE c.name IS NOT NULL), '{}') as classes
            FROM teachers t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN teacher_subjects ts ON t.id = ts.teacher_id
            LEFT JOIN subjects sub ON ts.subject_id = sub.id
            LEFT JOIN classes c ON sub.class_id = c.id
        `;
        const params = [];
        if (search) {
            params.push(`%${search}%`);
            sql += ` WHERE u.name ILIKE $1 OR t.employee_id ILIKE $1 OR u.email ILIKE $1`;
        }
        sql += ' GROUP BY t.id, u.name, u.email ORDER BY u.name';

        const result = await query(sql, params);
        res.json({ teachers: result.rows });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createTeacher = async (req, res) => {
    try {
        const { name, email, password, phone, qualification, address, joined_date } = req.body;
        const passwordHash = await bcrypt.hash(password || 'teacher123', SALT_ROUNDS);

        const userResult = await query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, passwordHash, 'TEACHER']
        );

        const countResult = await query('SELECT COUNT(*) FROM teachers');
        const empId = `EMP${String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0')}`;

        const teacherResult = await query(
            'INSERT INTO teachers (user_id, employee_id, phone, address, qualification, joined_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userResult.rows[0].id, empId, phone || null, address || null, qualification || null, joined_date || new Date()]
        );

        res.status(201).json({
            message: 'Teacher created successfully',
            teacher: teacherResult.rows[0],
            credentials: { email, password: password || 'teacher123' }
        });
    } catch (error) {
        console.error('Error creating teacher:', error);
        if (error.code === '23505') return res.status(400).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

export const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, qualification, address, joined_date } = req.body;

        const teacherResult = await query('SELECT user_id FROM teachers WHERE id = $1', [id]);
        if (teacherResult.rows.length === 0) return res.status(404).json({ error: 'Teacher not found' });

        const userId = teacherResult.rows[0].user_id;

        if (name || email) {
            const sets = [];
            const vals = [];
            if (name) { vals.push(name); sets.push(`name = $${vals.length}`); }
            if (email) { vals.push(email); sets.push(`email = $${vals.length}`); }
            vals.push(userId);
            await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${vals.length}`, vals);
        }

        await query(
            `UPDATE teachers SET phone = COALESCE($1, phone), qualification = COALESCE($2, qualification),
             address = COALESCE($3, address), joined_date = COALESCE($4, joined_date)
             WHERE id = $5`,
            [phone || null, qualification || null, address || null, joined_date || null, id]
        );

        res.json({ message: 'Teacher updated successfully' });
    } catch (error) {
        console.error('Error updating teacher:', error);
        if (error.code === '23505') return res.status(400).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherResult = await query('SELECT user_id FROM teachers WHERE id = $1', [id]);
        if (teacherResult.rows.length === 0) return res.status(404).json({ error: 'Teacher not found' });

        await query('DELETE FROM teachers WHERE id = $1', [id]);
        await query('DELETE FROM users WHERE id = $1', [teacherResult.rows[0].user_id]);
        res.json({ message: 'Teacher deleted' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ── Parents CRUD ──
export const getParents = async (req, res) => {
    try {
        const { search } = req.query;
        let sql = `
            SELECT u.id, u.name, u.email, u.created_at,
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'id', s.id,
                               'name', su.name,
                               'class_name', c.name,
                               'section', c.section,
                               'admission_number', s.admission_number
                           )
                       ) FILTER (WHERE s.id IS NOT NULL),
                       '[]'
                   ) as children
            FROM users u
            LEFT JOIN students s ON s.parent_user_id = u.id
            LEFT JOIN users su ON s.user_id = su.id
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE u.role = 'PARENT'
        `;
        const params = [];
        if (search) {
            params.push(`%${search}%`);
            sql += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
        }
        sql += ' GROUP BY u.id ORDER BY u.name';

        const result = await query(sql, params);
        res.json({ parents: result.rows });
    } catch (error) {
        console.error('Error fetching parents:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createParent = async (req, res) => {
    try {
        const { name, email, password, phone, student_ids } = req.body;
        const passwordHash = await bcrypt.hash(password || 'parent123', SALT_ROUNDS);

        const userResult = await query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, passwordHash, 'PARENT']
        );
        const parentId = userResult.rows[0].id;

        if (student_ids && student_ids.length > 0) {
            for (const sid of student_ids) {
                await query('UPDATE students SET parent_user_id = $1, parent_name = COALESCE(parent_name, $2), parent_email = COALESCE(parent_email, $3) WHERE id = $4',
                    [parentId, name, email, sid]);
            }
        }

        res.status(201).json({
            message: 'Parent account created successfully',
            parent: { id: parentId, name, email },
            credentials: { email, password: password || 'parent123' }
        });
    } catch (error) {
        console.error('Error creating parent:', error);
        if (error.code === '23505') return res.status(400).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

export const deleteParent = async (req, res) => {
    try {
        const { id } = req.params;
        await query('UPDATE students SET parent_user_id = NULL WHERE parent_user_id = $1', [id]);
        await query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'Parent deleted' });
    } catch (error) {
        console.error('Error deleting parent:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ── Reset Password (Admin resets any user password) ──
export const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;
        const passwordHash = await bcrypt.hash(new_password || 'password123', SALT_ROUNDS);
        await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ── Classes CRUD ──
export const getClasses = async (req, res) => {
    try {
        const result = await query(`
            SELECT c.*, 
                   COUNT(DISTINCT s.id) as student_count,
                   COUNT(DISTINCT sub.id) as subject_count
            FROM classes c
            LEFT JOIN students s ON s.class_id = c.id
            LEFT JOIN subjects sub ON sub.class_id = c.id
            GROUP BY c.id ORDER BY c.name, c.section
        `);
        res.json({ classes: result.rows });
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createClass = async (req, res) => {
    try {
        const { name, section, stream } = req.body;
        const result = await query(
            'INSERT INTO classes (name, section, stream) VALUES ($1, $2, $3) RETURNING *',
            [name, section, stream]
        );
        res.status(201).json({ message: 'Class created', class: result.rows[0] });
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM classes WHERE id = $1', [id]);
        res.json({ message: 'Class deleted' });
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ── Notices CRUD ──
export const getNotices = async (req, res) => {
    try {
        const result = await query(`
            SELECT n.*, u.name as author_name
            FROM notices n LEFT JOIN users u ON n.created_by = u.id
            ORDER BY n.created_at DESC
        `);
        res.json({ notices: result.rows });
    } catch (error) {
        console.error('Error fetching notices:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createNotice = async (req, res) => {
    try {
        const { title, content, target_role } = req.body;
        const result = await query(
            'INSERT INTO notices (title, content, target_role, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, content, target_role || 'ALL', req.user.id]
        );
        res.status(201).json({ message: 'Notice created', notice: result.rows[0] });
    } catch (error) {
        console.error('Error creating notice:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteNotice = async (req, res) => {
    try {
        await query('DELETE FROM notices WHERE id = $1', [req.params.id]);
        res.json({ message: 'Notice deleted' });
    } catch (error) {
        console.error('Error deleting notice:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ── Events ──
export const getEvents = async (req, res) => {
    try {
        const result = await query('SELECT * FROM events ORDER BY start_date ASC');
        res.json({ events: result.rows });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ── Fees ──
export const getAllFees = async (req, res) => {
    try {
        const result = await query(`
            SELECT f.*, u.name as student_name, c.name as class_name
            FROM fees f
            JOIN students s ON f.student_id = s.id
            JOIN users u ON s.user_id = u.id
            LEFT JOIN classes c ON s.class_id = c.id
            ORDER BY f.due_date DESC
        `);
        res.json({ fees: result.rows });
    } catch (error) {
        console.error('Error fetching fees:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
