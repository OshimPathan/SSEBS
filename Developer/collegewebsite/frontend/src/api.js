import { insforge } from './lib/insforge';
import bcrypt from 'bcryptjs';

// ========== AUTH ==========

export async function login(email, password) {
    const { data, error } = await insforge.database
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (error || !data) throw new Error('Invalid email or password');

    const match = await bcrypt.compare(password, data.password_hash);
    if (!match) throw new Error('Invalid email or password');

    const user = { id: data.id, name: data.name, email: data.email, role: data.role };

    if (data.role === 'TEACHER') {
        const { data: teacher } = await insforge.database
            .from('teachers').select('*').eq('user_id', data.id).maybeSingle();
        if (teacher) user.teacher_id = teacher.id;
    } else if (data.role === 'STUDENT') {
        const { data: student } = await insforge.database
            .from('students').select('*').eq('user_id', data.id).maybeSingle();
        if (student) {
            user.student_id = student.id;
            user.class_id = student.class_id;
            user.roll_number = student.roll_number;
            if (student.class_id) {
                const { data: cls } = await insforge.database
                    .from('classes').select('name, section').eq('id', student.class_id).maybeSingle();
                if (cls) { user.class_name = cls.name; user.section = cls.section; }
            }
        }
    } else if (data.role === 'PARENT') {
        const { data: children } = await insforge.database
            .from('students').select('id, user_id, class_id, roll_number').eq('parent_user_id', data.id);
        user.student_ids = (children || []).map(c => c.id);
        if (children?.length > 0) {
            user.student_id = children[0].id;
            if (children[0].class_id) {
                user.class_id = children[0].class_id;
                const { data: cls } = await insforge.database
                    .from('classes').select('name, section').eq('id', children[0].class_id).maybeSingle();
                if (cls) { user.class_name = cls.name; user.section = cls.section; }
            }
        }
    }

    return { token: 'insforge_' + Date.now(), user };
}

// ========== ADMIN - STUDENTS ==========

export async function getStudents({ search = '', classId = '' } = {}) {
    let query = insforge.database.from('students').select('*');
    if (classId) query = query.eq('class_id', classId);

    const { data: studentsData, error } = await query;
    if (error) throw new Error(error.message);

    const userIds = (studentsData || []).map(s => s.user_id).filter(Boolean);
    const classIds = [...new Set((studentsData || []).map(s => s.class_id).filter(Boolean))];

    const [usersRes, classesRes] = await Promise.all([
        userIds.length > 0
            ? insforge.database.from('users').select('id, name, email').in('id', userIds)
            : Promise.resolve({ data: [] }),
        classIds.length > 0
            ? insforge.database.from('classes').select('id, name, section').in('id', classIds)
            : Promise.resolve({ data: [] }),
    ]);

    const usersMap = Object.fromEntries((usersRes.data || []).map(u => [u.id, u]));
    const classesMap = Object.fromEntries((classesRes.data || []).map(c => [c.id, c]));

    let students = (studentsData || []).map(s => ({
        ...s,
        name: usersMap[s.user_id]?.name,
        email: usersMap[s.user_id]?.email,
        class_name: classesMap[s.class_id]?.name,
        section: classesMap[s.class_id]?.section,
    }));

    if (search) {
        const lower = search.toLowerCase();
        students = students.filter(s =>
            s.name?.toLowerCase().includes(lower) ||
            s.email?.toLowerCase().includes(lower) ||
            s.admission_number?.toLowerCase().includes(lower)
        );
    }

    return { students };
}

export async function createStudent(form) {
    const password = form.password || 'student123';
    const passwordHash = await bcrypt.hash(password, 10);

    const { data: userData, error: userError } = await insforge.database
        .from('users')
        .insert([{ name: form.name, email: form.email, password_hash: passwordHash, role: 'STUDENT' }])
        .select();
    if (userError) throw new Error(userError.message);

    const admissionNumber = `ADM${new Date().getFullYear()}${String(Date.now()).slice(-4)}`;

    const { data: studentData, error: studentError } = await insforge.database
        .from('students')
        .insert([{
            user_id: userData[0].id,
            admission_number: admissionNumber,
            class_id: form.class_id || null,
            roll_number: form.roll_number ? parseInt(form.roll_number) : null,
            date_of_birth: form.date_of_birth || null,
            blood_group: form.blood_group || null,
            address: form.address || null,
            gender: form.gender || null,
            nationality: form.nationality || 'Nepali',
            religion: form.religion || null,
            parent_name: form.parent_name || null,
            parent_phone: form.parent_phone || null,
            parent_email: form.parent_email || null,
            mother_name: form.mother_name || null,
            mother_phone: form.mother_phone || null,
            emergency_contact: form.emergency_contact || null,
            previous_school: form.previous_school || null,
            previous_class: form.previous_class || null,
            previous_marks: form.previous_marks || null,
            transfer_certificate: form.transfer_certificate || null,
            photo_url: form.photo_url || null,
            certificate_url: form.certificate_url || null,
        }])
        .select();
    if (studentError) throw new Error(studentError.message);

    const credentials = { student: { email: form.email, password } };

    if (form.create_parent_account && form.parent_email) {
        const parentPassword = 'parent123';
        const parentHash = await bcrypt.hash(parentPassword, 10);
        const { data: parentUser, error: parentError } = await insforge.database
            .from('users')
            .insert([{ name: form.parent_name, email: form.parent_email, password_hash: parentHash, role: 'PARENT' }])
            .select();
        if (!parentError && parentUser?.[0]) {
            await insforge.database.from('students').update({ parent_user_id: parentUser[0].id }).eq('id', studentData[0].id);
            credentials.parent = { email: form.parent_email, password: parentPassword };
        }
    }

    return { credentials };
}

export async function updateStudent(id, form) {
    const { data: student } = await insforge.database
        .from('students').select('user_id').eq('id', id).maybeSingle();
    if (!student) throw new Error('Student not found');

    const userUpdate = {};
    if (form.name) userUpdate.name = form.name;
    if (form.email) userUpdate.email = form.email;
    if (Object.keys(userUpdate).length > 0) {
        await insforge.database.from('users').update(userUpdate).eq('id', student.user_id);
    }

    const studentUpdate = {};
    if (form.class_id) studentUpdate.class_id = form.class_id;
    if (form.roll_number !== undefined) studentUpdate.roll_number = form.roll_number ? parseInt(form.roll_number) : null;
    if (form.date_of_birth !== undefined) studentUpdate.date_of_birth = form.date_of_birth || null;
    if (form.blood_group !== undefined) studentUpdate.blood_group = form.blood_group || null;
    if (form.address !== undefined) studentUpdate.address = form.address || null;
    if (form.parent_name !== undefined) studentUpdate.parent_name = form.parent_name || null;
    if (form.parent_phone !== undefined) studentUpdate.parent_phone = form.parent_phone || null;
    if (form.parent_email !== undefined) studentUpdate.parent_email = form.parent_email || null;
    if (form.previous_school !== undefined) studentUpdate.previous_school = form.previous_school || null;
    if (form.previous_class !== undefined) studentUpdate.previous_class = form.previous_class || null;
    if (form.previous_marks !== undefined) studentUpdate.previous_marks = form.previous_marks || null;
    if (form.transfer_certificate !== undefined) studentUpdate.transfer_certificate = form.transfer_certificate || null;
    if (form.gender !== undefined) studentUpdate.gender = form.gender || null;
    if (form.nationality !== undefined) studentUpdate.nationality = form.nationality || null;
    if (form.religion !== undefined) studentUpdate.religion = form.religion || null;
    if (form.mother_name !== undefined) studentUpdate.mother_name = form.mother_name || null;
    if (form.mother_phone !== undefined) studentUpdate.mother_phone = form.mother_phone || null;
    if (form.emergency_contact !== undefined) studentUpdate.emergency_contact = form.emergency_contact || null;
    if (form.photo_url !== undefined) studentUpdate.photo_url = form.photo_url || null;
    if (form.certificate_url !== undefined) studentUpdate.certificate_url = form.certificate_url || null;

    if (Object.keys(studentUpdate).length > 0) {
        await insforge.database.from('students').update(studentUpdate).eq('id', id);
    }

    return { success: true };
}

export async function deleteStudent(id) {
    const { data: student } = await insforge.database
        .from('students').select('user_id').eq('id', id).maybeSingle();
    if (student?.user_id) {
        await insforge.database.from('users').delete().eq('id', student.user_id);
    } else {
        await insforge.database.from('students').delete().eq('id', id);
    }
    return { success: true };
}

// ========== ADMIN - TEACHERS ==========

export async function getTeachers({ search = '' } = {}) {
    const { data: teachersData, error } = await insforge.database.from('teachers').select('*');
    if (error) throw new Error(error.message);

    const userIds = (teachersData || []).map(t => t.user_id).filter(Boolean);
    const teacherIds = (teachersData || []).map(t => t.id);

    const [usersRes, tsRes] = await Promise.all([
        userIds.length > 0
            ? insforge.database.from('users').select('id, name, email').in('id', userIds)
            : Promise.resolve({ data: [] }),
        teacherIds.length > 0
            ? insforge.database.from('teacher_subjects').select('teacher_id, subject_id')
            : Promise.resolve({ data: [] }),
    ]);

    const subjectIds = [...new Set((tsRes.data || []).map(ts => ts.subject_id))];
    const subjectsRes = subjectIds.length > 0
        ? await insforge.database.from('subjects').select('id, name').in('id', subjectIds)
        : { data: [] };

    const usersMap = Object.fromEntries((usersRes.data || []).map(u => [u.id, u]));
    const subjectsMap = Object.fromEntries((subjectsRes.data || []).map(s => [s.id, s]));
    const teacherSubjectsMap = {};
    (tsRes.data || []).forEach(ts => {
        if (!teacherSubjectsMap[ts.teacher_id]) teacherSubjectsMap[ts.teacher_id] = [];
        teacherSubjectsMap[ts.teacher_id].push(subjectsMap[ts.subject_id]?.name);
    });

    let teachers = (teachersData || []).map(t => ({
        ...t,
        name: usersMap[t.user_id]?.name,
        email: usersMap[t.user_id]?.email,
        subjects: teacherSubjectsMap[t.id] || [],
    }));

    if (search) {
        const lower = search.toLowerCase();
        teachers = teachers.filter(t =>
            t.name?.toLowerCase().includes(lower) ||
            t.email?.toLowerCase().includes(lower) ||
            t.employee_id?.toLowerCase().includes(lower)
        );
    }

    return { teachers };
}

export async function createTeacher(form) {
    const password = form.password || 'teacher123';
    const passwordHash = await bcrypt.hash(password, 10);

    const { data: userData, error: userError } = await insforge.database
        .from('users')
        .insert([{ name: form.name, email: form.email, password_hash: passwordHash, role: 'TEACHER' }])
        .select();
    if (userError) throw new Error(userError.message);

    const employeeId = `EMP${Date.now().toString().slice(-6)}`;

    const { error: teacherError } = await insforge.database
        .from('teachers')
        .insert([{
            user_id: userData[0].id,
            employee_id: employeeId,
            phone: form.phone || null,
            address: form.address || null,
            qualification: form.qualification || null,
            joined_date: form.joined_date || null,
        }])
        .select();
    if (teacherError) throw new Error(teacherError.message);

    return { credentials: { email: form.email, password } };
}

export async function updateTeacher(id, form) {
    const { data: teacher } = await insforge.database
        .from('teachers').select('user_id').eq('id', id).maybeSingle();
    if (!teacher) throw new Error('Teacher not found');

    const userUpdate = {};
    if (form.name) userUpdate.name = form.name;
    if (form.email) userUpdate.email = form.email;
    if (Object.keys(userUpdate).length > 0) {
        await insforge.database.from('users').update(userUpdate).eq('id', teacher.user_id);
    }

    const teacherUpdate = {};
    if (form.phone !== undefined) teacherUpdate.phone = form.phone || null;
    if (form.qualification !== undefined) teacherUpdate.qualification = form.qualification || null;
    if (form.address !== undefined) teacherUpdate.address = form.address || null;
    if (form.joined_date !== undefined) teacherUpdate.joined_date = form.joined_date || null;

    if (Object.keys(teacherUpdate).length > 0) {
        await insforge.database.from('teachers').update(teacherUpdate).eq('id', id);
    }

    return { success: true };
}

export async function deleteTeacher(id) {
    const { data: teacher } = await insforge.database
        .from('teachers').select('user_id').eq('id', id).maybeSingle();
    if (teacher?.user_id) {
        await insforge.database.from('users').delete().eq('id', teacher.user_id);
    }
    return { success: true };
}

// ========== ADMIN - PARENTS ==========

export async function getParents({ search = '' } = {}) {
    const { data: parentUsers, error } = await insforge.database
        .from('users').select('*').eq('role', 'PARENT');
    if (error) throw new Error(error.message);

    const parentIds = (parentUsers || []).map(p => p.id);
    const { data: studentsData } = parentIds.length > 0
        ? await insforge.database.from('students').select('*').in('parent_user_id', parentIds)
        : { data: [] };

    const classIds = [...new Set((studentsData || []).map(s => s.class_id).filter(Boolean))];
    const studentUserIds = [...new Set((studentsData || []).map(s => s.user_id).filter(Boolean))];

    const [classesRes, studentUsersRes] = await Promise.all([
        classIds.length > 0
            ? insforge.database.from('classes').select('id, name, section').in('id', classIds)
            : Promise.resolve({ data: [] }),
        studentUserIds.length > 0
            ? insforge.database.from('users').select('id, name').in('id', studentUserIds)
            : Promise.resolve({ data: [] }),
    ]);

    const classesMap = Object.fromEntries((classesRes.data || []).map(c => [c.id, c]));
    const studentUsersMap = Object.fromEntries((studentUsersRes.data || []).map(u => [u.id, u]));

    let parents = (parentUsers || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        created_at: p.created_at,
        children: (studentsData || [])
            .filter(s => s.parent_user_id === p.id)
            .map(s => ({
                id: s.id,
                name: studentUsersMap[s.user_id]?.name || 'Unknown',
                class_name: classesMap[s.class_id]?.name || '',
                section: classesMap[s.class_id]?.section || '',
                admission_number: s.admission_number,
            })),
    }));

    if (search) {
        const lower = search.toLowerCase();
        parents = parents.filter(p =>
            p.name?.toLowerCase().includes(lower) || p.email?.toLowerCase().includes(lower)
        );
    }

    return { parents };
}

export async function createParent(form) {
    const password = form.password || 'parent123';
    const passwordHash = await bcrypt.hash(password, 10);

    const { data: userData, error: userError } = await insforge.database
        .from('users')
        .insert([{ name: form.name, email: form.email, password_hash: passwordHash, role: 'PARENT' }])
        .select();
    if (userError) throw new Error(userError.message);

    if (form.student_ids?.length > 0) {
        for (const sid of form.student_ids) {
            await insforge.database.from('students').update({ parent_user_id: userData[0].id }).eq('id', sid);
        }
    }

    return { credentials: { email: form.email, password } };
}

export async function deleteParent(id) {
    await insforge.database.from('students').update({ parent_user_id: null }).eq('parent_user_id', id);
    await insforge.database.from('users').delete().eq('id', id);
    return { success: true };
}

// ========== CLASSES ==========

export async function getClasses() {
    const { data: classesData, error } = await insforge.database
        .from('classes').select('*').order('name', { ascending: true });
    if (error) throw new Error(error.message);

    const [subjectsRes, studentsRes] = await Promise.all([
        insforge.database.from('subjects').select('id, name, class_id'),
        insforge.database.from('students').select('id, class_id'),
    ]);

    const studentCountMap = {};
    (studentsRes.data || []).forEach(s => {
        if (s.class_id) studentCountMap[s.class_id] = (studentCountMap[s.class_id] || 0) + 1;
    });

    const subjectsByClass = {};
    (subjectsRes.data || []).forEach(s => {
        if (s.class_id) {
            if (!subjectsByClass[s.class_id]) subjectsByClass[s.class_id] = [];
            subjectsByClass[s.class_id].push({ id: s.id, name: s.name });
        }
    });

    const classes = (classesData || []).map(c => ({
        ...c,
        students: studentCountMap[c.id] || 0,
        subjects: (subjectsByClass[c.id] || []).map(s => s.name),
        subjectsList: subjectsByClass[c.id] || [],
    }));

    return { classes };
}

export async function addClass(classData) {
    const { data, error } = await insforge.database
        .from('classes').insert([{ name: classData.name, section: classData.section, stream: classData.stream || null }]).select();
    if (error) throw new Error(error.message);
    return data[0];
}

export async function deleteClass(classId) {
    // Delete subjects first (FK constraint)
    await insforge.database.from('subjects').delete().eq('class_id', classId);
    const { error } = await insforge.database.from('classes').delete().eq('id', classId);
    if (error) throw new Error(error.message);
    return { success: true };
}

// ========== NOTICES ==========

export async function getNotices() {
    const { data, error } = await insforge.database
        .from('notices').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { notices: data || [] };
}

export async function createNotice(form) {
    const { data, error } = await insforge.database.from('notices').insert([{
        title: form.title,
        content: form.content,
        target_role: form.target_role || 'ALL',
        created_by: form.created_by || null,
    }]).select();
    if (error) throw new Error(error.message);
    return data[0];
}

export async function updateNotice(id, form) {
    const { error } = await insforge.database.from('notices').update({
        title: form.title,
        content: form.content,
        target_role: form.target_role || 'ALL',
    }).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function deleteNotice(id) {
    const { error } = await insforge.database.from('notices').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// ========== EVENTS ==========

export async function getEvents() {
    const { data, error } = await insforge.database
        .from('events').select('*').order('start_date', { ascending: true });
    if (error) throw new Error(error.message);
    return { events: data || [] };
}

export async function createEvent(form) {
    const { data, error } = await insforge.database.from('events').insert([{
        title: form.title,
        description: form.description,
        start_date: form.start_date,
        end_date: form.end_date || form.start_date,
        location: form.location || null,
    }]).select();
    if (error) throw new Error(error.message);
    return data[0];
}

export async function updateEvent(id, form) {
    const { error } = await insforge.database.from('events').update({
        title: form.title,
        description: form.description,
        start_date: form.start_date,
        end_date: form.end_date || form.start_date,
        location: form.location || null,
    }).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function deleteEvent(id) {
    const { error } = await insforge.database.from('events').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// ========== ADMIN - EXAMS ==========

export async function createExam(form) {
    const row = {
        name: form.name,
        class_id: form.class_id,
        start_date: form.start_date,
        end_date: form.end_date || form.start_date,
    };
    if (form.exam_type) row.exam_type = form.exam_type;
    if (form.full_marks) row.full_marks = Number(form.full_marks);
    if (form.pass_marks) row.pass_marks = Number(form.pass_marks);
    const { data, error } = await insforge.database.from('exams').insert([row]).select();
    if (error) throw new Error(error.message);
    return data[0];
}

export async function deleteExam(id) {
    await insforge.database.from('results').delete().eq('exam_id', id);
    const { error } = await insforge.database.from('exams').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function publishResults(examId) {
    // Check all marks are verified before publishing
    const { data: allResults } = await insforge.database.from('results').select('id, verified').eq('exam_id', examId);
    if (!allResults?.length) throw new Error('No results found to publish');
    const unverifiedCount = allResults.filter(r => !r.verified).length;
    if (unverifiedCount > 0) {
        throw new Error(`${unverifiedCount} mark(s) are not yet verified. Please verify all marks before publishing results.`);
    }
    const { error } = await insforge.database.from('exams').update({ results_published: true, published: true }).eq('id', examId);
    if (error) throw new Error(error.message);
    return { success: true, count: allResults.length };
}

// ========== ADMIN - MARK VERIFICATION ==========

export async function verifyStudentMarks(examId, studentId, verifiedBy) {
    const { error } = await insforge.database
        .from('results')
        .update({ verified: true, verified_by: verifiedBy, verified_at: new Date().toISOString() })
        .eq('exam_id', examId)
        .eq('student_id', studentId);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function unverifyStudentMarks(examId, studentId) {
    const { error } = await insforge.database
        .from('results')
        .update({ verified: false, verified_by: null, verified_at: null })
        .eq('exam_id', examId)
        .eq('student_id', studentId);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function verifyAllMarksForExam(examId, verifiedBy) {
    const { error } = await insforge.database
        .from('results')
        .update({ verified: true, verified_by: verifiedBy, verified_at: new Date().toISOString() })
        .eq('exam_id', examId);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function getVerificationSummary(examId) {
    const { data: results } = await insforge.database
        .from('results').select('id, student_id, verified').eq('exam_id', examId);
    if (!results?.length) return { total: 0, verified: 0, unverified: 0, studentStats: {} };
    const studentStats = {};
    results.forEach(r => {
        if (!studentStats[r.student_id]) studentStats[r.student_id] = { total: 0, verified: 0 };
        studentStats[r.student_id].total++;
        if (r.verified) studentStats[r.student_id].verified++;
    });
    return {
        total: results.length,
        verified: results.filter(r => r.verified).length,
        unverified: results.filter(r => !r.verified).length,
        studentStats,
    };
}

// ========== ADMIN - ALL CLASSES (for marks) ==========

export async function getAllClasses() {
    const { data, error } = await insforge.database.from('classes').select('*').order('name', { ascending: true });
    if (error) throw new Error(error.message);
    return { classes: data || [] };
}

// ========== GALLERY ==========

export async function getGalleryPhotos() {
    const { data, error } = await insforge.database
        .from('gallery_photos').select('*').order('display_order', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function uploadGalleryPhoto(file, form) {
    const { data: uploadData, error: uploadError } = await insforge.storage
        .from('gallery')
        .uploadAuto(file);
    if (uploadError) throw new Error(uploadError.message);

    const { data, error } = await insforge.database.from('gallery_photos').insert([{
        title: form.title || file.name,
        description: form.description || null,
        image_url: uploadData.url,
        image_key: uploadData.key,
        category: form.category || 'general',
        is_featured: form.is_featured || false,
        uploaded_by: form.uploaded_by || null,
    }]).select();
    if (error) throw new Error(error.message);
    return data[0];
}

export async function updateGalleryPhoto(id, form) {
    const update = {};
    if (form.title !== undefined) update.title = form.title;
    if (form.description !== undefined) update.description = form.description;
    if (form.category !== undefined) update.category = form.category;
    if (form.is_featured !== undefined) update.is_featured = form.is_featured;
    if (form.display_order !== undefined) update.display_order = form.display_order;
    const { error } = await insforge.database.from('gallery_photos').update(update).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function deleteGalleryPhoto(id) {
    const { data: photo } = await insforge.database
        .from('gallery_photos').select('image_key').eq('id', id).maybeSingle();
    if (photo?.image_key) {
        await insforge.storage.from('gallery').remove(photo.image_key);
    }
    const { error } = await insforge.database.from('gallery_photos').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// ========== PROGRAM SUBJECTS ==========

export async function getProgramSubjects() {
    const { data, error } = await insforge.database
        .from('program_subjects').select('*').order('display_order', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function createProgramSubject(form) {
    const { data, error } = await insforge.database.from('program_subjects').insert([{
        program: form.program,
        subject_name: form.subject_name,
        description: form.description || null,
        display_order: form.display_order || 0,
    }]).select();
    if (error) throw new Error(error.message);
    return data[0];
}

export async function updateProgramSubject(id, form) {
    const { error } = await insforge.database.from('program_subjects').update({
        program: form.program,
        subject_name: form.subject_name,
        description: form.description || null,
    }).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function deleteProgramSubject(id) {
    const { error } = await insforge.database.from('program_subjects').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// ========== DASHBOARD STATS ==========

export async function getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];

    const [studentsRes, teachersRes, feesRes, noticesRes, eventsRes, recentRes, todayAttRes] = await Promise.all([
        insforge.database.from('students').select('id'),
        insforge.database.from('teachers').select('id'),
        insforge.database.from('fees').select('id, status, amount, amount_paid'),
        insforge.database.from('notices').select('*').order('created_at', { ascending: false }).limit(4),
        insforge.database.from('events').select('*').order('start_date', { ascending: true }).limit(4),
        insforge.database.from('students').select('id, class_id, user_id, admission_number').limit(4),
        insforge.database.from('attendance').select('id, status').eq('date', today),
    ]);

    const totalStudents = studentsRes.data?.length || 0;
    const totalTeachers = teachersRes.data?.length || 0;
    const fees = feesRes.data || [];
    const pendingFees = fees.filter(f => f.status !== 'PAID').length;
    const paidFees = fees.filter(f => f.status === 'PAID').length;
    const overdueFees = fees.filter(f => f.status === 'OVERDUE').length;

    // Today's attendance
    const todayAtt = todayAttRes.data || [];
    const todayPresent = todayAtt.filter(a => a.status === 'PRESENT').length;
    const todayTotal = todayAtt.length;
    const todayAttendancePercent = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0;

    // Weekly attendance (last 6 days)
    const weeklyAttendance = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const { data: dayAtt } = await insforge.database.from('attendance').select('status').eq('date', dateStr);
        const records = dayAtt || [];
        weeklyAttendance.push({
            day: dayNames[d.getDay()],
            present: records.filter(a => a.status === 'PRESENT').length,
            absent: records.filter(a => a.status === 'ABSENT' || a.status === 'LATE').length,
        });
    }

    const recentUserIds = (recentRes.data || []).map(s => s.user_id).filter(Boolean);
    const recentClassIds = [...new Set((recentRes.data || []).map(s => s.class_id).filter(Boolean))];

    const [uRes, cRes] = await Promise.all([
        recentUserIds.length > 0
            ? insforge.database.from('users').select('id, name').in('id', recentUserIds)
            : Promise.resolve({ data: [] }),
        recentClassIds.length > 0
            ? insforge.database.from('classes').select('id, name, section').in('id', recentClassIds)
            : Promise.resolve({ data: [] }),
    ]);

    const uMap = Object.fromEntries((uRes.data || []).map(u => [u.id, u]));
    const cMap = Object.fromEntries((cRes.data || []).map(c => [c.id, c]));

    const recentStudents = (recentRes.data || []).map(s => ({
        name: uMap[s.user_id]?.name || 'Unknown',
        class: `${cMap[s.class_id]?.name || ''} ${cMap[s.class_id]?.section || ''}`.trim(),
        admNo: s.admission_number,
        avatar: (uMap[s.user_id]?.name || '??').split(' ').map(n => n[0]).join('').slice(0, 2),
    }));

    return {
        totalStudents, totalTeachers, pendingFees, paidFees, overdueFees,
        todayAttendancePercent, weeklyAttendance,
        notices: noticesRes.data || [], events: eventsRes.data || [], recentStudents,
    };
}

export async function getTeacherDashboardStats(teacherId) {
    const { data: ts } = await insforge.database
        .from('teacher_subjects').select('subject_id').eq('teacher_id', teacherId);
    if (!ts?.length) return { classCount: 0, studentCount: 0, subjectCount: 0, todayAttendancePercent: 0, pendingResults: 0 };

    const subjectIds = ts.map(t => t.subject_id);
    const { data: subjects } = await insforge.database.from('subjects').select('id, class_id').in('id', subjectIds);
    const classIds = [...new Set((subjects || []).map(s => s.class_id).filter(Boolean))];

    let studentCount = 0;
    for (const cid of classIds) {
        const { data: studs } = await insforge.database.from('students').select('id').eq('class_id', cid);
        studentCount += (studs || []).length;
    }

    // Today's attendance for teacher's classes
    const today = new Date().toISOString().split('T')[0];
    let todayPresent = 0, todayTotal = 0;
    for (const cid of classIds) {
        const { data: att } = await insforge.database.from('attendance').select('status').eq('class_id', cid).eq('date', today);
        (att || []).forEach(a => { todayTotal++; if (a.status === 'PRESENT') todayPresent++; });
    }

    return {
        classCount: classIds.length,
        studentCount,
        subjectCount: subjectIds.length,
        todayAttendancePercent: todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0,
        pendingResults: 0,
    };
}

export async function getStudentDashboardStats(studentId) {
    const { data: student } = await insforge.database
        .from('students').select('id, class_id').eq('id', studentId).maybeSingle();
    if (!student) return { className: '—', attendancePercent: 0, gpa: '—', pendingFees: 0 };

    const { data: cls } = await insforge.database.from('classes').select('name, section').eq('id', student.class_id).maybeSingle();
    const className = cls ? `${cls.name} ${cls.section || ''}`.trim() : '—';

    // Attendance
    const { data: att } = await insforge.database.from('attendance').select('status').eq('student_id', studentId);
    const totalAtt = (att || []).length;
    const presentAtt = (att || []).filter(a => a.status === 'PRESENT').length;
    const attendancePercent = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

    // GPA from results
    const { data: results } = await insforge.database.from('results').select('grade').eq('student_id', studentId);
    const gradeMap = { 'A+': 4.0, 'A': 3.6, 'B+': 3.2, 'B': 2.8, 'C+': 2.4, 'C': 2.0, 'D+': 1.6, 'D': 1.2, 'F': 0 };
    const gpas = (results || []).map(r => gradeMap[r.grade] ?? 0).filter(g => g > 0);
    const gpa = gpas.length > 0 ? (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(1) : '—';

    // Pending fees
    const { data: fees } = await insforge.database.from('fees').select('amount, amount_paid, status').eq('student_id', studentId);
    const pendingAmount = (fees || []).filter(f => f.status !== 'PAID').reduce((sum, f) => sum + (Number(f.amount) - Number(f.amount_paid || 0)), 0);

    return { className, attendancePercent, gpa, pendingFees: pendingAmount };
}

// ========== STUDENT - RESULTS ==========

function gradeToGPA(grade) {
    const map = { 'A+': 4.0, 'A': 3.6, 'B+': 3.2, 'B': 2.8, 'C+': 2.4, 'C': 2.0, 'D+': 1.6, 'D': 1.2, 'E': 0.8 };
    return map[grade] || 0;
}

export async function getStudentResults(studentId) {
    const { data: student } = await insforge.database
        .from('students').select('id, class_id, roll_number').eq('id', studentId).maybeSingle();
    if (!student) return { exams: [] };

    const [examsRes, resultsRes, subjectsRes] = await Promise.all([
        insforge.database.from('exams').select('*').eq('class_id', student.class_id).order('start_date', { ascending: true }),
        insforge.database.from('results').select('*').eq('student_id', studentId),
        insforge.database.from('subjects').select('*').eq('class_id', student.class_id),
    ]);

    if (!examsRes.data?.length) return { exams: [] };
    const subjectsMap = Object.fromEntries((subjectsRes.data || []).map(s => [s.id, s]));

    return {
        exams: (examsRes.data || []).map(exam => ({
            id: exam.id,
            name: exam.name,
            date: exam.start_date,
            student: { rollNumber: student.roll_number },
            subjects: (resultsRes.data || [])
                .filter(r => r.exam_id === exam.id)
                .map(r => ({
                    id: r.id,
                    name: subjectsMap[r.subject_id]?.name || 'Unknown',
                    th: Number(r.marks_obtained) || 0,
                    pr: null,
                    total: Number(r.marks_obtained) || 0,
                    full: Number(r.total_marks) || 100,
                    grade: r.grade || 'N/A',
                    gpa: gradeToGPA(r.grade),
                })),
        })),
    };
}

// ========== STUDENT - FEES ==========

export async function getStudentFees(studentId) {
    const { data, error } = await insforge.database
        .from('fees').select('*').eq('student_id', studentId).order('due_date', { ascending: false });
    if (error) throw new Error(error.message);

    const fees = data || [];
    return {
        pending: fees.filter(f => f.status !== 'PAID').map(f => ({
            ...f, dueDate: f.due_date, category: f.description || 'Tuition',
        })),
        history: fees.filter(f => f.status === 'PAID').map(f => ({
            ...f, datePaid: f.created_at, receiptNo: `SSEB-${f.id?.slice(0, 8)}`, category: f.description || 'Tuition',
        })),
    };
}

// ========== TEACHER - CLASSES & ATTENDANCE ==========

export async function getTeacherClasses(teacherId) {
    const { data: ts } = await insforge.database
        .from('teacher_subjects').select('subject_id').eq('teacher_id', teacherId);
    if (!ts?.length) return { classes: [] };

    const { data: subjects } = await insforge.database
        .from('subjects').select('id, name, class_id').in('id', ts.map(t => t.subject_id));

    const classIds = [...new Set((subjects || []).map(s => s.class_id).filter(Boolean))];
    const { data: classes } = classIds.length > 0
        ? await insforge.database.from('classes').select('*').in('id', classIds)
        : { data: [] };

    return {
        classes: (classes || []).map(c => ({ id: c.id, name: `${c.name} ${c.section || ''}`.trim() })),
    };
}

export async function getStudentsByClass(classId) {
    const { data: students } = await insforge.database
        .from('students').select('*').eq('class_id', classId).order('roll_number', { ascending: true });

    const userIds = (students || []).map(s => s.user_id).filter(Boolean);
    const { data: users } = userIds.length > 0
        ? await insforge.database.from('users').select('id, name').in('id', userIds)
        : { data: [] };
    const usersMap = Object.fromEntries((users || []).map(u => [u.id, u]));

    return (students || []).map(s => ({
        id: s.id, roll_number: s.roll_number, name: usersMap[s.user_id]?.name || 'Unknown', status: 'PRESENT',
    }));
}

export async function getAttendanceByDate(classId, date) {
    const { data } = await insforge.database
        .from('attendance').select('*').eq('class_id', classId).eq('date', date);
    return data || [];
}

export async function saveAttendance(records) {
    for (const record of records) {
        const { data: existing } = await insforge.database
            .from('attendance').select('id').eq('student_id', record.student_id).eq('date', record.date).maybeSingle();
        if (existing) {
            await insforge.database.from('attendance').update({ status: record.status }).eq('id', existing.id);
        } else {
            await insforge.database.from('attendance').insert([{
                student_id: record.student_id, class_id: record.class_id,
                date: record.date, status: record.status, marked_by: record.marked_by,
            }]);
        }
    }
    return { success: true };
}

// ========== TEACHER - MARKS ==========

export async function getExams() {
    const { data } = await insforge.database.from('exams').select('*').order('start_date', { ascending: true });
    return { exams: data || [] };
}

export async function getSubjectsByClass(classId) {
    const { data } = await insforge.database.from('subjects').select('*').eq('class_id', classId);
    return { subjects: data || [] };
}

export async function getResults(examId, subjectId) {
    const { data } = await insforge.database
        .from('results').select('*').eq('exam_id', examId).eq('subject_id', subjectId);
    return data || [];
}

export async function saveMarks(marks) {
    for (const mark of marks) {
        const { data: existing } = await insforge.database
            .from('results').select('id')
            .eq('exam_id', mark.exam_id).eq('student_id', mark.student_id).eq('subject_id', mark.subject_id)
            .maybeSingle();
        if (existing) {
            await insforge.database.from('results')
                .update({ marks_obtained: mark.marks_obtained, grade: mark.grade, remarks: mark.remarks, verified: false, verified_by: null, verified_at: null })
                .eq('id', existing.id);
        } else {
            await insforge.database.from('results').insert([{
                exam_id: mark.exam_id, student_id: mark.student_id, subject_id: mark.subject_id,
                marks_obtained: mark.marks_obtained, total_marks: mark.total_marks || 100,
                grade: mark.grade, remarks: mark.remarks, verified: false,
            }]);
        }
    }
    return { success: true };
}

// ========== TEACHER - STUDENTS VIEW ==========

export async function getTeacherSubjectsWithClasses(teacherId) {
    const { data: ts } = await insforge.database
        .from('teacher_subjects').select('subject_id').eq('teacher_id', teacherId);
    if (!ts?.length) return { subjects: [], classes: [] };

    const subjectIds = ts.map(t => t.subject_id);
    const { data: subjects } = await insforge.database
        .from('subjects').select('*').in('id', subjectIds);

    const classIds = [...new Set((subjects || []).map(s => s.class_id).filter(Boolean))];
    const { data: classes } = classIds.length > 0
        ? await insforge.database.from('classes').select('*').in('id', classIds)
        : { data: [] };

    const classMap = Object.fromEntries((classes || []).map(c => [c.id, c]));

    return {
        subjects: (subjects || []).map(s => ({
            ...s,
            class_name: classMap[s.class_id] ? `${classMap[s.class_id].name} ${classMap[s.class_id].section || ''}`.trim() : '',
        })),
        classes: (classes || []).map(c => ({ id: c.id, name: `${c.name} ${c.section || ''}`.trim(), section: c.section, stream: c.stream })),
    };
}

export async function getStudentsByClassDetailed(classId) {
    const { data: students } = await insforge.database
        .from('students').select('*').eq('class_id', classId).order('roll_number', { ascending: true });

    const userIds = (students || []).map(s => s.user_id).filter(Boolean);
    const { data: users } = userIds.length > 0
        ? await insforge.database.from('users').select('id, name, email').in('id', userIds)
        : { data: [] };
    const usersMap = Object.fromEntries((users || []).map(u => [u.id, u]));

    return (students || []).map(s => ({
        id: s.id,
        roll_number: s.roll_number,
        admission_number: s.admission_number,
        name: usersMap[s.user_id]?.name || 'Unknown',
        email: usersMap[s.user_id]?.email || '',
        date_of_birth: s.date_of_birth,
        blood_group: s.blood_group,
        address: s.address,
        gender: s.gender,
        nationality: s.nationality,
        religion: s.religion,
        parent_name: s.parent_name,
        parent_phone: s.parent_phone,
        parent_email: s.parent_email,
        mother_name: s.mother_name,
        mother_phone: s.mother_phone,
        emergency_contact: s.emergency_contact,
        photo_url: s.photo_url,
        certificate_url: s.certificate_url,
        previous_school: s.previous_school,
        previous_class: s.previous_class,
    }));
}

export async function getExamsByClass(classId) {
    const { data } = await insforge.database
        .from('exams').select('*').eq('class_id', classId).order('exam_type', { ascending: true });
    return data || [];
}

export async function getTeacherSubjectsForClass(teacherId, classId) {
    const { data: ts } = await insforge.database
        .from('teacher_subjects').select('subject_id').eq('teacher_id', teacherId);
    if (!ts?.length) return [];

    const { data: subjects } = await insforge.database
        .from('subjects').select('*').eq('class_id', classId).in('id', ts.map(t => t.subject_id));
    return subjects || [];
}

export async function getResultsForClassExam(examId, classId) {
    // Get all students in this class
    const students = await getStudentsByClass(classId);
    const studentIds = students.map(s => s.id);
    if (!studentIds.length) return { students, results: [] };

    // Get all results for this exam for these students (including verification status)
    const { data: results } = await insforge.database
        .from('results').select('*').eq('exam_id', examId).in('student_id', studentIds);
    return { students, results: results || [] };
}

export async function saveBulkMarks(marks) {
    // Batch upsert marks
    for (const mark of marks) {
        const { data: existing } = await insforge.database
            .from('results').select('id')
            .eq('exam_id', mark.exam_id).eq('student_id', mark.student_id).eq('subject_id', mark.subject_id)
            .maybeSingle();
        if (existing) {
            await insforge.database.from('results')
                .update({ marks_obtained: mark.marks_obtained, total_marks: mark.total_marks, grade: mark.grade, remarks: mark.remarks })
                .eq('id', existing.id);
        } else {
            await insforge.database.from('results').insert([{
                exam_id: mark.exam_id, student_id: mark.student_id, subject_id: mark.subject_id,
                marks_obtained: mark.marks_obtained, total_marks: mark.total_marks || 100,
                grade: mark.grade, remarks: mark.remarks || '',
            }]);
        }
    }
    return { success: true };
}

// ========== REVIEWS / TESTIMONIALS ==========

export async function getApprovedReviews() {
    const { data, error } = await insforge.database
        .from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function submitReview({ name, role, rating, content }) {
    const { error } = await insforge.database.from('reviews').insert([{
        name, role: role || 'Visitor', rating: rating || 5, content, is_approved: false,
    }]);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function getAllReviews() {
    const { data, error } = await insforge.database
        .from('reviews').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function approveReview(id, approved = true) {
    const { error } = await insforge.database.from('reviews').update({ is_approved: approved }).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function deleteReview(id) {
    const { error } = await insforge.database.from('reviews').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// ========== STUDENT DOCUMENT UPLOADS ==========

export async function uploadStudentPhoto(file) {
    const { data, error } = await insforge.storage.from('student-documents').uploadAuto(file);
    if (error) throw new Error(error.message);
    return data;
}

export async function uploadStudentCertificate(file) {
    const { data, error } = await insforge.storage.from('student-documents').uploadAuto(file);
    if (error) throw new Error(error.message);
    return data;
}

// ========== ADMISSION APPLICATIONS ==========

export async function getAdmissionApplications() {
    const { data, error } = await insforge.database
        .from('admission_applications').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function updateAdmissionStatus(id, status, remarks = '') {
    const updateData = { status };
    if (remarks) updateData.admin_remarks = remarks;
    const { error } = await insforge.database.from('admission_applications').update(updateData).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function deleteAdmissionApplication(id) {
    const { error } = await insforge.database.from('admission_applications').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function submitAdmissionApplication(form) {
    // Upload photo if provided
    let photoUrl = null;
    if (form.photo instanceof File) {
        const ext = form.photo.name.split('.').pop();
        const fileName = `admission_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { data: uploadData, error: uploadError } = await insforge.storage
            .from('admissions').upload(fileName, form.photo, { contentType: form.photo.type });
        if (uploadError) throw new Error('Photo upload failed: ' + uploadError.message);
        const { data: urlData } = insforge.storage.from('admissions').getPublicUrl(fileName);
        photoUrl = urlData?.publicUrl || null;
    }

    const { data, error } = await insforge.database.from('admission_applications').insert([{
        student_name: form.student_name,
        date_of_birth: form.date_of_birth,
        gender: form.gender || null,
        blood_group: form.blood_group || null,
        nationality: form.nationality || 'Nepali',
        religion: form.religion || null,
        mother_tongue: form.mother_tongue || null,
        photo_url: photoUrl,
        parent_name: form.parent_name,
        parent_phone: form.parent_phone,
        parent_email: form.parent_email || null,
        father_name: form.father_name || null,
        father_occupation: form.father_occupation || null,
        father_phone: form.father_phone || null,
        mother_name: form.mother_name || null,
        mother_occupation: form.mother_occupation || null,
        mother_phone: form.mother_phone || null,
        guardian_relation: form.guardian_relation || null,
        emergency_contact: form.emergency_contact || null,
        address: form.address,
        permanent_address: form.permanent_address || null,
        applied_for_class: form.applied_for_class,
        previous_school: form.previous_school || null,
        previous_class: form.previous_class || null,
        previous_marks: form.previous_marks || null,
        previous_gpa: form.previous_gpa || null,
        previous_year: form.previous_year || null,
        tc_number: form.tc_number || null,
        has_disability: form.has_disability || null,
        remarks: form.remarks || null,
        status: 'PENDING',
    }]).select();
    if (error) throw new Error(error.message);
    return data[0];
}

// ========== TEACHER SUBJECT MANAGEMENT ==========

export async function getAllSubjects() {
    const { data, error } = await insforge.database.from('subjects').select('*').order('name', { ascending: true });
    if (error) throw new Error(error.message);

    // Also fetch classes for display
    const { data: classesData } = await insforge.database.from('classes').select('id, name, section');
    const classesMap = Object.fromEntries((classesData || []).map(c => [c.id, c]));

    return (data || []).map(s => ({
        ...s,
        class_name: classesMap[s.class_id]?.name || '',
        class_section: classesMap[s.class_id]?.section || '',
    }));
}

export async function getTeacherAssignedSubjectIds(teacherId) {
    const { data, error } = await insforge.database
        .from('teacher_subjects').select('subject_id').eq('teacher_id', teacherId);
    if (error) throw new Error(error.message);
    return (data || []).map(ts => ts.subject_id);
}

export async function assignTeacherSubjects(teacherId, subjectIds) {
    // Remove all existing assignments
    await insforge.database.from('teacher_subjects').delete().eq('teacher_id', teacherId);

    // Insert new assignments
    if (subjectIds.length > 0) {
        const rows = subjectIds.map(sid => ({ teacher_id: teacherId, subject_id: sid }));
        const { error } = await insforge.database.from('teacher_subjects').insert(rows);
        if (error) throw new Error(error.message);
    }

    return { success: true };
}

// ========== EXAM DEPARTMENT ==========

// Get exam routines for an exam
export async function getExamRoutines(examId) {
    const { data, error } = await insforge.database
        .from('exam_routines').select('*').eq('exam_id', examId).order('exam_date', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
}

// Save exam routine (single subject schedule)
export async function saveExamRoutine(routine) {
    const { data: existing } = await insforge.database
        .from('exam_routines').select('id')
        .eq('exam_id', routine.exam_id).eq('subject_id', routine.subject_id).maybeSingle();

    if (existing) {
        const { error } = await insforge.database.from('exam_routines')
            .update({ exam_date: routine.exam_date, start_time: routine.start_time, end_time: routine.end_time, room: routine.room || null })
            .eq('id', existing.id);
        if (error) throw new Error(error.message);
    } else {
        const { error } = await insforge.database.from('exam_routines').insert([{
            exam_id: routine.exam_id, subject_id: routine.subject_id,
            exam_date: routine.exam_date, start_time: routine.start_time,
            end_time: routine.end_time, room: routine.room || null,
        }]);
        if (error) throw new Error(error.message);
    }
    return { success: true };
}

// Save bulk exam routines
export async function saveBulkExamRoutines(examId, routines) {
    // Delete existing routines for this exam
    const { error: delErr } = await insforge.database.from('exam_routines').delete().eq('exam_id', examId);
    if (delErr) throw new Error(delErr.message);
    if (routines.length > 0) {
        const rows = routines.map(r => ({
            exam_id: examId, subject_id: r.subject_id,
            exam_date: r.exam_date,
            start_time: r.start_time || null,
            end_time: r.end_time || null,
            room: r.room || null,
        }));
        const { error } = await insforge.database.from('exam_routines').insert(rows);
        if (error) throw new Error(error.message);
    }
    return { success: true };
}

// Delete exam routine
export async function deleteExamRoutine(id) {
    const { error } = await insforge.database.from('exam_routines').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// Toggle exam publish status
export async function toggleExamPublished(examId, published) {
    const { error } = await insforge.database.from('exams').update({ published }).eq('id', examId);
    if (error) throw new Error(error.message);
    return { success: true };
}

// Public: Get published exams with routines for a class
export async function getPublishedExamSchedule() {
    const { data: exams } = await insforge.database
        .from('exams').select('*').eq('published', true).order('start_date', { ascending: false });

    const { data: classes } = await insforge.database
        .from('classes').select('id, name, section');
    const classMap = Object.fromEntries((classes || []).map(c => [c.id, c]));

    const { data: routines } = await insforge.database
        .from('exam_routines').select('*').order('exam_date', { ascending: true });
    const routinesByExam = {};
    (routines || []).forEach(r => {
        if (!routinesByExam[r.exam_id]) routinesByExam[r.exam_id] = [];
        routinesByExam[r.exam_id].push(r);
    });

    const { data: subjects } = await insforge.database.from('subjects').select('id, name, class_id');
    const subjectMap = Object.fromEntries((subjects || []).map(s => [s.id, s]));

    return (exams || []).map(exam => ({
        ...exam,
        class_name: classMap[exam.class_id] ? `${classMap[exam.class_id].name} ${classMap[exam.class_id].section || ''}`.trim() : '',
        routines: (routinesByExam[exam.id] || []).map(r => ({
            ...r,
            subject_name: subjectMap[r.subject_id]?.name || 'Unknown',
        })),
    }));
}

// Public: Check result by symbol number / roll number
export async function checkResultPublic(examId, rollNumber) {
    // Find exam — only if results are published
    const { data: exam } = await insforge.database
        .from('exams').select('*').eq('id', examId).maybeSingle();
    if (!exam) throw new Error('Exam not found');
    if (!exam.results_published) throw new Error('Results for this exam have not been published yet');

    // Find student by roll number in this class
    const { data: student } = await insforge.database
        .from('students').select('*').eq('class_id', exam.class_id).eq('roll_number', parseInt(rollNumber)).maybeSingle();
    if (!student) throw new Error('Student not found with that roll number in this class');

    // Get student name
    const { data: userObj } = await insforge.database
        .from('users').select('name').eq('id', student.user_id).maybeSingle();

    // Get results
    const { data: results } = await insforge.database
        .from('results').select('*').eq('exam_id', examId).eq('student_id', student.id);

    // Get subjects
    const { data: subjects } = await insforge.database
        .from('subjects').select('id, name').eq('class_id', exam.class_id);
    const subjectMap = Object.fromEntries((subjects || []).map(s => [s.id, s]));

    // Get class info
    const { data: cls } = await insforge.database
        .from('classes').select('name, section').eq('id', exam.class_id).maybeSingle();

    const subjectResults = (results || []).map(r => ({
        subject_name: subjectMap[r.subject_id]?.name || 'Unknown',
        marks_obtained: r.marks_obtained,
        total_marks: r.total_marks,
        grade: r.grade || '—',
    }));

    const totalObtained = subjectResults.reduce((s, r) => s + (parseFloat(r.marks_obtained) || 0), 0);
    const totalMarks = subjectResults.reduce((s, r) => s + (parseFloat(r.total_marks) || 100), 0);
    const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(1) : '0.0';

    return {
        student_name: userObj?.name || 'Unknown',
        roll_number: student.roll_number,
        class_name: cls ? `${cls.name} ${cls.section || ''}`.trim() : '',
        exam_name: exam.name,
        exam_type: exam.exam_type || '',
        subjects: subjectResults,
        total_obtained: totalObtained,
        total_marks: totalMarks,
        percentage,
        division: percentage >= 80 ? 'Distinction' : percentage >= 60 ? 'First Division' : percentage >= 40 ? 'Second Division' : 'Below Pass',
    };
}

// Get published exams for result checker dropdown (only with results_published)
export async function getPublishedExamsForResults() {
    const { data: exams } = await insforge.database
        .from('exams').select('*').eq('results_published', true).order('start_date', { ascending: false });

    const { data: classes } = await insforge.database
        .from('classes').select('id, name, section');
    const classMap = Object.fromEntries((classes || []).map(c => [c.id, c]));

    return (exams || []).map(exam => ({
        id: exam.id,
        name: exam.name,
        exam_type: exam.exam_type,
        class_name: classMap[exam.class_id] ? `${classMap[exam.class_id].name} ${classMap[exam.class_id].section || ''}`.trim() : '',
    }));
}

// ========== FEE MANAGEMENT (ADMIN) ==========

export async function getAllFees({ search = '', classId = '', status = '' } = {}) {
    let query = insforge.database.from('fees').select('*').order('due_date', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data: fees, error } = await query;
    if (error) throw new Error(error.message);

    // Get student + class info
    const { data: students } = await insforge.database.from('students').select('id, user_id, class_id, roll_number');
    const { data: users } = await insforge.database.from('users').select('id, name, email');
    const { data: classes } = await insforge.database.from('classes').select('id, name, section');

    const userMap = Object.fromEntries((users || []).map(u => [u.id, u]));
    const classMap = Object.fromEntries((classes || []).map(c => [c.id, c]));
    const studentMap = Object.fromEntries((students || []).map(s => [s.id, {
        ...s,
        name: userMap[s.user_id]?.name || '',
        email: userMap[s.user_id]?.email || '',
        class_name: classMap[s.class_id] ? `${classMap[s.class_id].name} ${classMap[s.class_id].section || ''}`.trim() : '',
    }]));

    let result = (fees || []).map(f => ({
        ...f,
        student_name: studentMap[f.student_id]?.name || 'Unknown',
        student_email: studentMap[f.student_id]?.email || '',
        student_roll: studentMap[f.student_id]?.roll_number || '',
        class_name: studentMap[f.student_id]?.class_name || '',
        class_id: studentMap[f.student_id]?.class_id || '',
    }));

    if (classId) result = result.filter(f => f.class_id === classId);
    if (search) {
        const s = search.toLowerCase();
        result = result.filter(f =>
            f.student_name.toLowerCase().includes(s) ||
            f.description?.toLowerCase().includes(s) ||
            f.student_email.toLowerCase().includes(s)
        );
    }
    return result;
}

export async function createFee(form) {
    const { data, error } = await insforge.database.from('fees').insert([{
        student_id: form.student_id,
        amount: parseFloat(form.amount),
        due_date: form.due_date,
        status: form.status || 'UNPAID',
        amount_paid: form.amount_paid ? parseFloat(form.amount_paid) : 0,
        description: form.description || null,
    }]).select();
    if (error) throw new Error(error.message);
    return data[0];
}

export async function createBulkFees(studentIds, feeData) {
    const rows = studentIds.map(sid => ({
        student_id: sid,
        amount: parseFloat(feeData.amount),
        due_date: feeData.due_date,
        status: 'UNPAID',
        amount_paid: 0,
        description: feeData.description || null,
    }));
    const { data, error } = await insforge.database.from('fees').insert(rows).select();
    if (error) throw new Error(error.message);
    return data;
}

export async function updateFee(id, form) {
    const update = {};
    if (form.amount !== undefined) update.amount = parseFloat(form.amount);
    if (form.due_date) update.due_date = form.due_date;
    if (form.status) update.status = form.status;
    if (form.amount_paid !== undefined) update.amount_paid = parseFloat(form.amount_paid);
    if (form.description !== undefined) update.description = form.description || null;
    const { error } = await insforge.database.from('fees').update(update).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function deleteFee(id) {
    const { error } = await insforge.database.from('fees').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// ========== CLASS MANAGEMENT EXTRAS ==========

export async function updateClass(classId, classData) {
    const update = {};
    if (classData.name) update.name = classData.name;
    if (classData.section !== undefined) update.section = classData.section;
    if (classData.stream !== undefined) update.stream = classData.stream || null;
    const { error } = await insforge.database.from('classes').update(update).eq('id', classId);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function addSubjectToClass(classId, subjectName) {
    const { data, error } = await insforge.database.from('subjects').insert([{
        name: subjectName, class_id: classId,
    }]).select();
    if (error) throw new Error(error.message);
    return data[0];
}

export async function deleteSubject(subjectId) {
    await insforge.database.from('teacher_subjects').delete().eq('subject_id', subjectId);
    const { error } = await insforge.database.from('subjects').delete().eq('id', subjectId);
    if (error) throw new Error(error.message);
    return { success: true };
}

// ========== PARENT UPDATE ==========

export async function updateParent(id, form) {
    const update = {};
    if (form.name) update.name = form.name;
    if (form.email) update.email = form.email;
    if (form.phone !== undefined) update.phone = form.phone;
    const { error } = await insforge.database.from('users').update(update).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// ========== EXAM UPDATE ==========

export async function updateExam(id, form) {
    const update = {};
    if (form.name) update.name = form.name;
    if (form.exam_type) update.exam_type = form.exam_type;
    if (form.start_date) update.start_date = form.start_date;
    if (form.end_date) update.end_date = form.end_date;
    if (form.full_marks !== undefined) update.full_marks = parseFloat(form.full_marks);
    if (form.pass_marks !== undefined) update.pass_marks = parseFloat(form.pass_marks);
    const { error } = await insforge.database.from('exams').update(update).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// ========== SITE SETTINGS ==========

export async function getSiteSettings() {
    const { data, error } = await insforge.database.from('site_settings').select('*');
    if (error) throw new Error(error.message);
    return Object.fromEntries((data || []).map(s => [s.setting_key, s.setting_value]));
}

export async function updateSiteSetting(key, value) {
    // Upsert: try update first, then insert
    const { data: existing } = await insforge.database
        .from('site_settings').select('id').eq('setting_key', key).maybeSingle();
    if (existing) {
        const { error } = await insforge.database.from('site_settings')
            .update({ setting_value: value }).eq('setting_key', key);
        if (error) throw new Error(error.message);
    } else {
        const { error } = await insforge.database.from('site_settings')
            .insert([{ setting_key: key, setting_value: value }]);
        if (error) throw new Error(error.message);
    }
    return { success: true };
}

export async function updateSiteSettingsBulk(settings) {
    for (const [key, value] of Object.entries(settings)) {
        await updateSiteSetting(key, value);
    }
    return { success: true };
}

// ========== ATTENDANCE OVERVIEW (ADMIN) ==========

export async function getAttendanceOverview({ classId = '', startDate = '', endDate = '' } = {}) {
    let query = insforge.database.from('attendance').select('*');
    if (classId) query = query.eq('class_id', classId);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const { data: students } = await insforge.database.from('students').select('id, user_id, class_id');
    const { data: users } = await insforge.database.from('users').select('id, name');
    const userMap = Object.fromEntries((users || []).map(u => [u.id, u.name]));
    const studentMap = Object.fromEntries((students || []).map(s => [s.id, { name: userMap[s.user_id] || '', class_id: s.class_id }]));

    return (data || []).map(a => ({
        ...a,
        student_name: studentMap[a.student_id]?.name || 'Unknown',
    }));
}

// ========== CONVERT ADMISSION TO STUDENT ==========

export async function convertAdmissionToStudent(applicationId) {
    // Get application
    const { data: app, error: appErr } = await insforge.database
        .from('admission_applications').select('*').eq('id', applicationId).maybeSingle();
    if (appErr || !app) throw new Error('Application not found');

    // Find the class
    const { data: classes } = await insforge.database
        .from('classes').select('id, name').ilike('name', app.applied_for_class);
    const classId = classes?.[0]?.id;
    if (!classId) throw new Error(`Class "${app.applied_for_class}" not found. Please create it first.`);

    // Get next roll number
    const { data: existingStudents } = await insforge.database
        .from('students').select('roll_number').eq('class_id', classId).order('roll_number', { ascending: false });
    const nextRoll = (existingStudents?.[0]?.roll_number || 0) + 1;

    // Create student via the existing createStudent function
    const result = await createStudent({
        name: app.student_name,
        email: `${app.student_name.toLowerCase().replace(/\s+/g, '.')}@sevenstar.edu.np`,
        class_id: classId,
        roll_number: nextRoll,
        date_of_birth: app.date_of_birth,
        gender: app.gender || null,
        blood_group: app.blood_group || null,
        address: app.address || '',
        phone: app.parent_phone || '',
        password: 'student123',
    });

    // Update application status
    await updateAdmissionStatus(applicationId, 'ACCEPTED', 'Auto-enrolled as student');

    return result;
}
