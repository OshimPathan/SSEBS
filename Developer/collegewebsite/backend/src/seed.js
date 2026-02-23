import bcrypt from 'bcrypt';
import { query } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10');

async function seed() {
    console.log('🌱 Seeding database for Seven Star English Boarding School...\n');

    try {
        // ── 1. Clean existing data ──
        console.log('Clearing existing data...');
        await query('DELETE FROM results');
        await query('DELETE FROM attendance');
        await query('DELETE FROM fees');
        await query('DELETE FROM notices');
        await query('DELETE FROM events');
        await query('DELETE FROM admission_applications');
        await query('DELETE FROM teacher_subjects');
        await query('DELETE FROM exams');
        await query('DELETE FROM subjects');
        await query('DELETE FROM students');
        await query('DELETE FROM teachers');
        await query('DELETE FROM classes');
        await query('DELETE FROM users');

        // ── 2. Create Users ──
        console.log('Creating users...');
        const passwordHash = await bcrypt.hash('password123', SALT_ROUNDS);
        const adminHash = await bcrypt.hash('admin123', SALT_ROUNDS);

        const users = [
            // Admin
            { name: 'Rajesh Sharma', email: 'admin@sevenstar.edu.np', password_hash: adminHash, role: 'ADMIN' },
            // Teachers
            { name: 'Suman Adhikari', email: 'suman.adhikari@sevenstar.edu.np', password_hash: passwordHash, role: 'TEACHER' },
            { name: 'Anita Basnet', email: 'anita.basnet@sevenstar.edu.np', password_hash: passwordHash, role: 'TEACHER' },
            { name: 'Bikram Thapa', email: 'bikram.thapa@sevenstar.edu.np', password_hash: passwordHash, role: 'TEACHER' },
            { name: 'Kavita Poudel', email: 'kavita.poudel@sevenstar.edu.np', password_hash: passwordHash, role: 'TEACHER' },
            { name: 'Deepak Gurung', email: 'deepak.gurung@sevenstar.edu.np', password_hash: passwordHash, role: 'TEACHER' },
            { name: 'Manisha Rai', email: 'manisha.rai@sevenstar.edu.np', password_hash: passwordHash, role: 'TEACHER' },
            { name: 'Prakash Shrestha', email: 'prakash.shrestha@sevenstar.edu.np', password_hash: passwordHash, role: 'TEACHER' },
            { name: 'Sunita Maharjan', email: 'sunita.maharjan@sevenstar.edu.np', password_hash: passwordHash, role: 'TEACHER' },
            // Students
            { name: 'Aarav Sharma', email: 'aarav.sharma@sevenstar.edu.np', password_hash: passwordHash, role: 'STUDENT' },
            { name: 'Priya Thapa', email: 'priya.thapa@sevenstar.edu.np', password_hash: passwordHash, role: 'STUDENT' },
            { name: 'Rohan Gurung', email: 'rohan.gurung@sevenstar.edu.np', password_hash: passwordHash, role: 'STUDENT' },
            { name: 'Sita Poudel', email: 'sita.poudel@sevenstar.edu.np', password_hash: passwordHash, role: 'STUDENT' },
            { name: 'Anil Basnet', email: 'anil.basnet@sevenstar.edu.np', password_hash: passwordHash, role: 'STUDENT' },
            { name: 'Maya Rai', email: 'maya.rai@sevenstar.edu.np', password_hash: passwordHash, role: 'STUDENT' },
            { name: 'Bijay Shrestha', email: 'bijay.shrestha@sevenstar.edu.np', password_hash: passwordHash, role: 'STUDENT' },
            { name: 'Gita Adhikari', email: 'gita.adhikari@sevenstar.edu.np', password_hash: passwordHash, role: 'STUDENT' },
            { name: 'Suraj Maharjan', email: 'suraj.maharjan@sevenstar.edu.np', password_hash: passwordHash, role: 'STUDENT' },
            { name: 'Nisha KC', email: 'nisha.kc@sevenstar.edu.np', password_hash: passwordHash, role: 'STUDENT' },
            // Parents
            { name: 'Hari Sharma', email: 'hari.sharma@gmail.com', password_hash: passwordHash, role: 'PARENT' },
            { name: 'Kamala Thapa', email: 'kamala.thapa@gmail.com', password_hash: passwordHash, role: 'PARENT' },
        ];

        const userIds = {};
        for (const user of users) {
            const result = await query(
                'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
                [user.name, user.email, user.password_hash, user.role]
            );
            userIds[user.email] = result.rows[0].id;
        }
        console.log(`  ✓ Created ${users.length} users`);

        // ── 3. Create Classes ──
        console.log('Creating classes...');
        const classes = [
            { name: 'Nursery', section: 'A', stream: null },
            { name: 'LKG', section: 'A', stream: null },
            { name: 'UKG', section: 'A', stream: null },
            { name: 'Class 1', section: 'A', stream: null },
            { name: 'Class 2', section: 'A', stream: null },
            { name: 'Class 3', section: 'A', stream: null },
            { name: 'Class 4', section: 'A', stream: null },
            { name: 'Class 5', section: 'A', stream: null },
            { name: 'Class 6', section: 'A', stream: null },
            { name: 'Class 7', section: 'A', stream: null },
            { name: 'Class 8', section: 'A', stream: null },
            { name: 'Class 9', section: 'A', stream: null },
            { name: 'Class 9', section: 'B', stream: null },
            { name: 'Class 10', section: 'A', stream: null },
            { name: 'Class 10', section: 'B', stream: null },
            { name: '+2 Science', section: 'A', stream: 'Computer Science' },
            { name: '+2 Management', section: 'A', stream: 'Management' },
            { name: '+2 Hotel Management', section: 'A', stream: 'Hotel Management' },
        ];

        const classIds = {};
        for (const cls of classes) {
            const result = await query(
                'INSERT INTO classes (name, section, stream) VALUES ($1, $2, $3) RETURNING id',
                [cls.name, cls.section, cls.stream]
            );
            classIds[`${cls.name}-${cls.section}`] = result.rows[0].id;
        }
        console.log(`  ✓ Created ${classes.length} classes`);

        // ── 4. Create Subjects ──
        console.log('Creating subjects...');
        const subjects = [
            { name: 'English', code: 'ENG10A', class_key: 'Class 10-A' },
            { name: 'Mathematics', code: 'MATH10A', class_key: 'Class 10-A' },
            { name: 'Science', code: 'SCI10A', class_key: 'Class 10-A' },
            { name: 'Social Studies', code: 'SOC10A', class_key: 'Class 10-A' },
            { name: 'Nepali', code: 'NEP10A', class_key: 'Class 10-A' },
            { name: 'Computer Science', code: 'CS10A', class_key: 'Class 10-A' },
            { name: 'English', code: 'ENG9A', class_key: 'Class 9-A' },
            { name: 'Mathematics', code: 'MATH9A', class_key: 'Class 9-A' },
            { name: 'Science', code: 'SCI9A', class_key: 'Class 9-A' },
            { name: 'Physics', code: 'PHY12A', class_key: '+2 Science-A' },
            { name: 'Chemistry', code: 'CHEM12A', class_key: '+2 Science-A' },
            { name: 'Mathematics', code: 'MATH12A', class_key: '+2 Science-A' },
            { name: 'Computer Science', code: 'CS12A', class_key: '+2 Science-A' },
            { name: 'Business Studies', code: 'BUS12A', class_key: '+2 Management-A' },
            { name: 'Accounting', code: 'ACC12A', class_key: '+2 Management-A' },
            { name: 'Economics', code: 'ECO12A', class_key: '+2 Management-A' },
        ];

        const subjectIds = {};
        for (const sub of subjects) {
            const result = await query(
                'INSERT INTO subjects (name, code, class_id) VALUES ($1, $2, $3) RETURNING id',
                [sub.name, sub.code, classIds[sub.class_key]]
            );
            subjectIds[sub.code] = result.rows[0].id;
        }
        console.log(`  ✓ Created ${subjects.length} subjects`);

        // ── 5. Create Teachers ──
        console.log('Creating teacher profiles...');
        const teacherProfiles = [
            { email: 'suman.adhikari@sevenstar.edu.np', employee_id: 'EMP001', phone: '9841234567', qualification: 'M.Sc. Mathematics', joined_date: '2015-03-15', address: 'Butwal-5, Rupandehi' },
            { email: 'anita.basnet@sevenstar.edu.np', employee_id: 'EMP002', phone: '9841234568', qualification: 'M.A. English Literature', joined_date: '2016-06-01', address: 'Devdaha-3, Rupandehi' },
            { email: 'bikram.thapa@sevenstar.edu.np', employee_id: 'EMP003', phone: '9841234569', qualification: 'M.Sc. Physics', joined_date: '2017-01-10', address: 'Siddharthanagar-4, Rupandehi' },
            { email: 'kavita.poudel@sevenstar.edu.np', employee_id: 'EMP004', phone: '9841234570', qualification: 'M.Sc. Chemistry', joined_date: '2018-04-20', address: 'Tilottama-7, Rupandehi' },
            { email: 'deepak.gurung@sevenstar.edu.np', employee_id: 'EMP005', phone: '9841234571', qualification: 'MBA', joined_date: '2019-07-01', address: 'Lumbini-1, Rupandehi' },
            { email: 'manisha.rai@sevenstar.edu.np', employee_id: 'EMP006', phone: '9841234572', qualification: 'B.Ed. Social Studies', joined_date: '2020-02-15', address: 'Devdaha-2, Rupandehi' },
            { email: 'prakash.shrestha@sevenstar.edu.np', employee_id: 'EMP007', phone: '9841234573', qualification: 'M.Sc. Computer Science', joined_date: '2019-08-01', address: 'Butwal-11, Rupandehi' },
            { email: 'sunita.maharjan@sevenstar.edu.np', employee_id: 'EMP008', phone: '9841234574', qualification: 'M.A. Nepali', joined_date: '2021-01-10', address: 'Devdaha-1, Rupandehi' },
        ];

        const teacherIds = {};
        for (const t of teacherProfiles) {
            const result = await query(
                'INSERT INTO teachers (user_id, employee_id, phone, address, qualification, joined_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [userIds[t.email], t.employee_id, t.phone, t.address, t.qualification, t.joined_date]
            );
            teacherIds[t.email] = result.rows[0].id;
        }
        console.log(`  ✓ Created ${teacherProfiles.length} teacher profiles`);

        // ── 6. Create Students ──
        console.log('Creating student profiles...');
        const studentProfiles = [
            { email: 'aarav.sharma@sevenstar.edu.np', admission_number: 'ADM2024001', class_key: 'Class 10-A', roll_number: 1, dob: '2010-03-15', blood_group: 'A+', parent_name: 'Hari Sharma', parent_phone: '9851234567', parent_email: 'hari.sharma@gmail.com', address: 'Devdaha-2, Rupandehi' },
            { email: 'priya.thapa@sevenstar.edu.np', admission_number: 'ADM2024002', class_key: 'Class 10-A', roll_number: 2, dob: '2010-05-22', blood_group: 'B+', parent_name: 'Kamala Thapa', parent_phone: '9851234568', parent_email: 'kamala.thapa@gmail.com', address: 'Devdaha-3, Rupandehi' },
            { email: 'rohan.gurung@sevenstar.edu.np', admission_number: 'ADM2024003', class_key: 'Class 10-A', roll_number: 3, dob: '2010-08-10', blood_group: 'O+', parent_name: 'Bir Gurung', parent_phone: '9851234569', parent_email: null, address: 'Butwal-5, Rupandehi' },
            { email: 'sita.poudel@sevenstar.edu.np', admission_number: 'ADM2024004', class_key: 'Class 10-B', roll_number: 1, dob: '2010-01-05', blood_group: 'AB+', parent_name: 'Gopal Poudel', parent_phone: '9851234570', parent_email: null, address: 'Tilottama-3, Rupandehi' },
            { email: 'anil.basnet@sevenstar.edu.np', admission_number: 'ADM2024005', class_key: 'Class 9-A', roll_number: 1, dob: '2011-04-18', blood_group: 'A-', parent_name: 'Mohan Basnet', parent_phone: '9851234571', parent_email: null, address: 'Devdaha-1, Rupandehi' },
            { email: 'maya.rai@sevenstar.edu.np', admission_number: 'ADM2024006', class_key: 'Class 9-A', roll_number: 2, dob: '2011-07-25', blood_group: 'B-', parent_name: 'Dhan Rai', parent_phone: '9851234572', parent_email: null, address: 'Lumbini-2, Rupandehi' },
            { email: 'bijay.shrestha@sevenstar.edu.np', admission_number: 'ADM2024007', class_key: '+2 Science-A', roll_number: 1, dob: '2008-11-12', blood_group: 'O+', parent_name: 'Ram Shrestha', parent_phone: '9851234573', parent_email: null, address: 'Butwal-8, Rupandehi' },
            { email: 'gita.adhikari@sevenstar.edu.np', admission_number: 'ADM2024008', class_key: '+2 Science-A', roll_number: 2, dob: '2008-02-28', blood_group: 'A+', parent_name: 'Krishna Adhikari', parent_phone: '9851234574', parent_email: null, address: 'Devdaha-4, Rupandehi' },
            { email: 'suraj.maharjan@sevenstar.edu.np', admission_number: 'ADM2024009', class_key: '+2 Management-A', roll_number: 1, dob: '2008-09-08', blood_group: 'B+', parent_name: 'Shyam Maharjan', parent_phone: '9851234575', parent_email: null, address: 'Siddharthanagar-2, Rupandehi' },
            { email: 'nisha.kc@sevenstar.edu.np', admission_number: 'ADM2024010', class_key: '+2 Management-A', roll_number: 2, dob: '2008-12-03', blood_group: 'AB-', parent_name: 'Durga KC', parent_phone: '9851234576', parent_email: null, address: 'Butwal-3, Rupandehi' },
        ];

        const studentIds = {};
        for (const s of studentProfiles) {
            const parentUserId = s.parent_email ? userIds[s.parent_email] : null;
            const result = await query(
                `INSERT INTO students (user_id, admission_number, class_id, roll_number, date_of_birth, blood_group, address, parent_name, parent_phone, parent_email, parent_user_id) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
                [userIds[s.email], s.admission_number, classIds[s.class_key], s.roll_number, s.dob, s.blood_group, s.address, s.parent_name, s.parent_phone, s.parent_email, parentUserId]
            );
            studentIds[s.email] = result.rows[0].id;
        }
        console.log(`  ✓ Created ${studentProfiles.length} student profiles`);

        // ── 7. Teacher-Subject Mapping ──
        console.log('Mapping teachers to subjects...');
        const teacherSubjectMap = [
            { teacher: 'suman.adhikari@sevenstar.edu.np', subjects: ['MATH10A', 'MATH9A', 'MATH12A'] },
            { teacher: 'anita.basnet@sevenstar.edu.np', subjects: ['ENG10A', 'ENG9A'] },
            { teacher: 'bikram.thapa@sevenstar.edu.np', subjects: ['PHY12A', 'SCI10A'] },
            { teacher: 'kavita.poudel@sevenstar.edu.np', subjects: ['CHEM12A', 'SCI9A'] },
            { teacher: 'deepak.gurung@sevenstar.edu.np', subjects: ['BUS12A', 'ECO12A'] },
            { teacher: 'manisha.rai@sevenstar.edu.np', subjects: ['SOC10A'] },
            { teacher: 'prakash.shrestha@sevenstar.edu.np', subjects: ['CS10A', 'CS12A'] },
            { teacher: 'sunita.maharjan@sevenstar.edu.np', subjects: ['NEP10A', 'ACC12A'] },
        ];

        let mappingCount = 0;
        for (const mapping of teacherSubjectMap) {
            for (const subCode of mapping.subjects) {
                await query(
                    'INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES ($1, $2)',
                    [teacherIds[mapping.teacher], subjectIds[subCode]]
                );
                mappingCount++;
            }
        }
        console.log(`  ✓ Created ${mappingCount} teacher-subject mappings`);

        // ── 8. Create Exams ──
        console.log('Creating exams...');
        const exams = [
            { name: 'First Term Examination 2025', class_key: 'Class 10-A', start_date: '2025-09-15', end_date: '2025-09-25' },
            { name: 'Second Term Examination 2025', class_key: 'Class 10-A', start_date: '2025-12-10', end_date: '2025-12-20' },
            { name: 'First Term Examination 2025', class_key: 'Class 9-A', start_date: '2025-09-15', end_date: '2025-09-25' },
            { name: 'First Term Examination 2025', class_key: '+2 Science-A', start_date: '2025-09-20', end_date: '2025-10-01' },
            { name: 'Final Examination 2026', class_key: 'Class 10-A', start_date: '2026-03-15', end_date: '2026-03-28' },
        ];

        const examIds = {};
        for (const exam of exams) {
            const result = await query(
                'INSERT INTO exams (name, class_id, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING id',
                [exam.name, classIds[exam.class_key], exam.start_date, exam.end_date]
            );
            examIds[`${exam.name}-${exam.class_key}`] = result.rows[0].id;
        }
        console.log(`  ✓ Created ${exams.length} exams`);

        // ── 9. Create Results ──
        console.log('Creating exam results...');
        const examKey = 'First Term Examination 2025-Class 10-A';
        const class10Students = ['aarav.sharma@sevenstar.edu.np', 'priya.thapa@sevenstar.edu.np', 'rohan.gurung@sevenstar.edu.np'];
        const class10Subjects = ['ENG10A', 'MATH10A', 'SCI10A', 'SOC10A', 'NEP10A', 'CS10A'];

        const grades = (marks) => {
            if (marks >= 90) return 'A+';
            if (marks >= 80) return 'A';
            if (marks >= 70) return 'B+';
            if (marks >= 60) return 'B';
            if (marks >= 50) return 'C+';
            if (marks >= 40) return 'C';
            return 'D';
        };

        let resultsCount = 0;
        const marksData = [
            [92, 88, 85, 78, 82, 95], // Aarav
            [88, 75, 90, 86, 91, 82], // Priya
            [72, 95, 68, 74, 70, 88], // Rohan
        ];

        for (let i = 0; i < class10Students.length; i++) {
            for (let j = 0; j < class10Subjects.length; j++) {
                const marks = marksData[i][j];
                await query(
                    'INSERT INTO results (exam_id, student_id, subject_id, marks_obtained, total_marks, grade) VALUES ($1, $2, $3, $4, $5, $6)',
                    [examIds[examKey], studentIds[class10Students[i]], subjectIds[class10Subjects[j]], marks, 100, grades(marks)]
                );
                resultsCount++;
            }
        }
        console.log(`  ✓ Created ${resultsCount} exam results`);

        // ── 10. Create Fees ──
        console.log('Creating fee records...');
        const feeEntries = [];
        for (const studentEmail of Object.keys(studentIds)) {
            const sId = studentIds[studentEmail];
            feeEntries.push(
                { student_id: sId, amount: 5500, due_date: '2025-10-31', status: 'PAID', amount_paid: 5500, description: 'Tuition Fee - Bhadra 2082' },
                { student_id: sId, amount: 5500, due_date: '2025-11-30', status: 'PAID', amount_paid: 5500, description: 'Tuition Fee - Ashwin 2082' },
                { student_id: sId, amount: 5500, due_date: '2025-12-31', status: 'UNPAID', amount_paid: 0, description: 'Tuition Fee - Kartik 2082' },
                { student_id: sId, amount: 1500, due_date: '2025-12-31', status: 'UNPAID', amount_paid: 0, description: 'Transportation Fee - Kartik 2082' },
                { student_id: sId, amount: 15000, due_date: '2026-01-15', status: 'UNPAID', amount_paid: 0, description: 'Annual Fee (Second Installment)' },
            );
        }

        for (const fee of feeEntries) {
            await query(
                'INSERT INTO fees (student_id, amount, due_date, status, amount_paid, description) VALUES ($1, $2, $3, $4, $5, $6)',
                [fee.student_id, fee.amount, fee.due_date, fee.status, fee.amount_paid, fee.description]
            );
        }
        console.log(`  ✓ Created ${feeEntries.length} fee records`);

        // ── 11. Create Notices ──
        console.log('Creating notices...');
        const noticeEntries = [
            { title: 'Final Term Examination 2026 Routine Published', content: 'The routine for the Final Examination 2026 starting from Chaitra 1, 2082 has been published. Students are advised to collect their admit cards from the administration office. The examination will cover all subjects taught during the academic year. Please ensure you have completed all assignments before the examination begins.', target_role: 'ALL', created_by: userIds['admin@sevenstar.edu.np'] },
            { title: 'Annual Sports Week 2026 Registration', content: 'Registration for the Annual Sports Week is now open. Events include: Athletics, Football, Basketball, Badminton, Table Tennis, and Chess. Students must register through their class teachers by Falgun 15, 2082. Participation certificates will be provided to all participants.', target_role: 'STUDENT', created_by: userIds['admin@sevenstar.edu.np'] },
            { title: 'Staff Meeting - Academic Planning', content: 'All teaching staff are requested to attend a mandatory meeting on Sunday, Falgun 10, 2082 at 2:00 PM in the conference hall. Agenda includes: Final exam preparations, annual result analysis, and next academic year planning.', target_role: 'TEACHER', created_by: userIds['admin@sevenstar.edu.np'] },
            { title: 'Library Book Return Reminder', content: 'All students are reminded to return library books before the final examination. Late returns will incur a fine of Rs. 5 per day. The library will remain closed during the examination period.', target_role: 'STUDENT', created_by: userIds['admin@sevenstar.edu.np'] },
            { title: 'Parent-Teacher Meeting Notice', content: 'A Parent-Teacher meeting is scheduled for Falgun 20, 2082 (Saturday) from 10:00 AM to 2:00 PM. Parents are requested to collect the progress report of their children and discuss academic performance with respective class teachers.', target_role: 'ALL', created_by: userIds['admin@sevenstar.edu.np'] },
            { title: 'Fee Payment Deadline Extended', content: 'The deadline for Kartik 2082 fee payment has been extended to Mangsir 15, 2082. Parents who have not yet paid the fees are requested to clear the dues at the earliest. A late fee of Rs. 500 will be charged after the extended deadline.', target_role: 'ALL', created_by: userIds['admin@sevenstar.edu.np'] },
        ];

        for (const notice of noticeEntries) {
            await query(
                'INSERT INTO notices (title, content, target_role, created_by) VALUES ($1, $2, $3, $4)',
                [notice.title, notice.content, notice.target_role, notice.created_by]
            );
        }
        console.log(`  ✓ Created ${noticeEntries.length} notices`);

        // ── 12. Create Events ──
        console.log('Creating events...');
        const eventEntries = [
            { title: 'Annual Sports Week 2026', description: 'Week-long inter-house sports competition featuring athletics, football, basketball, and more.', start_date: '2026-03-01', end_date: '2026-03-07', location: 'School Playground' },
            { title: 'Science Exhibition', description: 'Students showcase innovative science projects. Judges from local universities will evaluate.', start_date: '2026-02-25', end_date: '2026-02-25', location: 'School Auditorium' },
            { title: 'Final Examination 2026', description: 'End of year examinations for all classes from Nursery to +2.', start_date: '2026-03-15', end_date: '2026-03-28', location: 'Respective Classrooms' },
            { title: 'Parent-Teacher Meeting', description: 'Quarterly parent-teacher interaction to discuss student progress.', start_date: '2026-03-05', end_date: '2026-03-05', location: 'Conference Hall' },
            { title: 'Republic Day Celebration', description: 'Cultural programs and flag hoisting ceremony to celebrate Republic Day.', start_date: '2026-05-29', end_date: '2026-05-29', location: 'School Ground' },
        ];

        for (const event of eventEntries) {
            await query(
                'INSERT INTO events (title, description, start_date, end_date, location) VALUES ($1, $2, $3, $4, $5)',
                [event.title, event.description, event.start_date, event.end_date, event.location]
            );
        }
        console.log(`  ✓ Created ${eventEntries.length} events`);

        // ── 13. Create Attendance ──
        console.log('Creating attendance records...');
        const today = new Date();
        let attendanceCount = 0;
        // Create 10 days of attendance for Class 10-A students
        for (let day = 0; day < 10; day++) {
            const date = new Date(today);
            date.setDate(date.getDate() - day);
            // Skip Saturdays
            if (date.getDay() === 6) continue;

            const dateStr = date.toISOString().split('T')[0];
            const class10AStudents = ['aarav.sharma@sevenstar.edu.np', 'priya.thapa@sevenstar.edu.np', 'rohan.gurung@sevenstar.edu.np'];

            for (const email of class10AStudents) {
                const status = Math.random() > 0.15 ? 'PRESENT' : (Math.random() > 0.5 ? 'ABSENT' : 'LATE');
                try {
                    await query(
                        'INSERT INTO attendance (student_id, class_id, date, status, marked_by) VALUES ($1, $2, $3, $4, $5)',
                        [studentIds[email], classIds['Class 10-A'], dateStr, status, userIds['suman.adhikari@sevenstar.edu.np']]
                    );
                    attendanceCount++;
                } catch (e) {
                    // Skip duplicate entries
                }
            }
        }
        console.log(`  ✓ Created ${attendanceCount} attendance records`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('  Admin:   admin@sevenstar.edu.np / admin123');
        console.log('  Teacher: suman.adhikari@sevenstar.edu.np / password123');
        console.log('  Student: aarav.sharma@sevenstar.edu.np / password123');
        console.log('  Parent:  hari.sharma@gmail.com / password123');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }

    process.exit(0);
}

seed();
