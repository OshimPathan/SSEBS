import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10');

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Bad Request', message: 'Email and password are required' });
        }

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: 'An error occurred during login' });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Not Found', message: 'User not found' });
        }

        const user = result.rows[0];
        let profile = { ...user };

        if (user.role === 'TEACHER') {
            const teacherResult = await query(
                `SELECT t.employee_id, t.phone, t.qualification, t.joined_date
                 FROM teachers t WHERE t.user_id = $1`,
                [userId]
            );
            if (teacherResult.rows[0]) profile = { ...profile, ...teacherResult.rows[0] };
        } else if (user.role === 'STUDENT') {
            const studentResult = await query(
                `SELECT s.admission_number, s.roll_number, s.date_of_birth, s.blood_group,
                        c.name as class_name, c.section
                 FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE s.user_id = $1`,
                [userId]
            );
            if (studentResult.rows[0]) profile = { ...profile, ...studentResult.rows[0] };
        }

        res.json({ user: profile });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: 'An error occurred fetching profile' });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
        if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

        const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
