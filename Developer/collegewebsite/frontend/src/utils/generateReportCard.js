import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate a professional school report card PDF
 * @param {Object} params
 * @param {string} params.studentName - Student full name
 * @param {string} params.className - Class name (e.g., "Class 10 A")
 * @param {string|number} params.rollNumber - Roll number
 * @param {string} params.examName - Exam name (e.g., "First Terminal Exam 2082")
 * @param {string} params.examDate - Exam date string
 * @param {string} [params.examType] - Exam type (Unit Test, Mid-term, Final, Pre-board)
 * @param {Array} params.subjects - Array of { name, th, pr, total, full, grade, gpa }
 */
export function generateReportCard({
    studentName,
    className,
    rollNumber,
    examName,
    examDate,
    examType,
    subjects = [],
}) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;

    // Colors
    const primary = [178, 0, 0]; // #b20000
    const darkText = [30, 30, 30];
    const grayText = [100, 100, 100];
    const lightGray = [245, 245, 245];

    // ── Border frame ──
    doc.setDrawColor(...primary);
    doc.setLineWidth(0.8);
    doc.rect(10, 10, pageWidth - 20, doc.internal.pageSize.getHeight() - 20);
    doc.setLineWidth(0.3);
    doc.rect(12, 12, pageWidth - 24, doc.internal.pageSize.getHeight() - 24);

    let y = 24;

    // ── School Header ──
    doc.setFillColor(...primary);
    doc.rect(margin, y, contentWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SEVEN STAR ENGLISH BOARDING SCHOOL', pageWidth / 2, y + 11, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Devdaha, Rupandehi, Nepal', pageWidth / 2, y + 18, { align: 'center' });
    doc.text('Estd. 2005  •  Affiliated to NEB', pageWidth / 2, y + 24, { align: 'center' });

    y += 34;

    // ── Report Card Title ──
    doc.setTextColor(...primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PROGRESS REPORT CARD', pageWidth / 2, y + 6, { align: 'center' });

    y += 10;

    // Decorative line under title
    doc.setDrawColor(...primary);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 35, y, pageWidth / 2 + 35, y);

    y += 8;

    // ── Student Info Box ──
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'S');

    const infoY = y + 6;
    const col1 = margin + 6;
    const col2 = pageWidth / 2 + 6;

    doc.setTextColor(...grayText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    // Row 1
    doc.text('Student Name:', col1, infoY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.setFontSize(10);
    doc.text(studentName || '—', col1 + 28, infoY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayText);
    doc.setFontSize(8.5);
    doc.text('Exam:', col2, infoY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.setFontSize(10);
    doc.text(examName || '—', col2 + 14, infoY);

    // Row 2
    const infoY2 = infoY + 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayText);
    doc.setFontSize(8.5);
    doc.text('Class:', col1, infoY2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.setFontSize(10);
    doc.text(className || '—', col1 + 14, infoY2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayText);
    doc.setFontSize(8.5);
    doc.text('Date:', col2, infoY2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.setFontSize(10);
    doc.text(examDate || '—', col2 + 12, infoY2);

    // Row 3
    const infoY3 = infoY2 + 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayText);
    doc.setFontSize(8.5);
    doc.text('Roll No:', col1, infoY3);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.setFontSize(10);
    doc.text(String(rollNumber ?? '—'), col1 + 16, infoY3);

    if (examType) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayText);
        doc.setFontSize(8.5);
        doc.text('Type:', col2, infoY3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkText);
        doc.setFontSize(10);
        doc.text(examType, col2 + 12, infoY3);
    }

    y += 34;

    // ── Marks Table ──
    const totalObtained = subjects.reduce((s, sub) => s + sub.total, 0);
    const totalFull = subjects.reduce((s, sub) => s + sub.full, 0);
    const percentage = totalFull > 0 ? ((totalObtained / totalFull) * 100).toFixed(1) : '0.0';
    const avgGPA = subjects.length > 0 ? (subjects.reduce((s, sub) => s + sub.gpa, 0) / subjects.length).toFixed(2) : '0.00';

    const hasPractical = subjects.some(s => s.pr !== null && s.pr !== undefined);

    const headColumns = ['S.N.', 'Subject', 'Theory'];
    if (hasPractical) headColumns.push('Practical');
    headColumns.push('Total', 'Full Marks', 'Grade', 'GPA');

    const bodyRows = subjects.map((sub, i) => {
        const row = [String(i + 1), sub.name, String(sub.th)];
        if (hasPractical) row.push(sub.pr !== null && sub.pr !== undefined ? String(sub.pr) : '—');
        row.push(String(sub.total), String(sub.full), sub.grade || '—', String(sub.gpa));
        return row;
    });

    // Add total row
    const totalTheory = subjects.reduce((s, sub) => s + sub.th, 0);
    const totalPractical = subjects.filter(s => s.pr !== null).reduce((s, sub) => s + (sub.pr || 0), 0);
    const totalRow = ['', 'TOTAL', String(totalTheory)];
    if (hasPractical) totalRow.push(String(totalPractical));
    totalRow.push(String(totalObtained), String(totalFull), `${percentage}%`, avgGPA);

    autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [headColumns],
        body: bodyRows,
        foot: [totalRow],
        theme: 'grid',
        headStyles: {
            fillColor: primary,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
            cellPadding: 3,
        },
        bodyStyles: {
            fontSize: 9,
            cellPadding: 2.5,
            textColor: darkText,
            lineColor: [220, 220, 220],
            lineWidth: 0.3,
        },
        footStyles: {
            fillColor: lightGray,
            textColor: darkText,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
            cellPadding: 3,
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 },
            1: { halign: 'left', cellWidth: hasPractical ? 40 : 50 },
            2: { halign: 'center' },
            ...(hasPractical ? { 3: { halign: 'center' } } : {}),
            [headColumns.length - 3]: { halign: 'center' },
            [headColumns.length - 2]: { halign: 'center' },
            [headColumns.length - 1]: { halign: 'center' },
        },
        alternateRowStyles: {
            fillColor: [252, 252, 252],
        },
        didParseCell: (data) => {
            // Bold subject name column in body
            if (data.section === 'body' && data.column.index === 1) {
                data.cell.styles.fontStyle = 'bold';
            }
        },
    });

    y = doc.lastAutoTable.finalY + 10;

    // ── Summary Box ──
    const division = percentage >= 80 ? 'Distinction' : percentage >= 60 ? 'First Division' : percentage >= 40 ? 'Second Division' : 'Below Pass';

    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'S');

    const summaryItems = [
        { label: 'Total Marks', value: `${totalObtained} / ${totalFull}` },
        { label: 'Percentage', value: `${percentage}%` },
        { label: 'GPA', value: avgGPA },
        { label: 'Division', value: division },
    ];

    const colWidth = contentWidth / summaryItems.length;
    summaryItems.forEach((item, i) => {
        const cx = margin + colWidth * i + colWidth / 2;

        doc.setTextColor(...grayText);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(item.label, cx, y + 8, { align: 'center' });

        doc.setTextColor(...darkText);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(item.value, cx, y + 16, { align: 'center' });

        // Divider line between items
        if (i < summaryItems.length - 1) {
            doc.setDrawColor(210, 210, 210);
            doc.setLineWidth(0.3);
            doc.line(margin + colWidth * (i + 1), y + 3, margin + colWidth * (i + 1), y + 19);
        }
    });

    y += 30;

    // ── GPA Scale Table ──
    doc.setTextColor(...grayText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('GPA Conversion Scale', margin, y);

    y += 2;

    const gpaScale = [
        ['A+', '90-100', '4.0'],
        ['A', '80-89', '3.6'],
        ['B+', '70-79', '3.2'],
        ['B', '60-69', '2.8'],
        ['C+', '50-59', '2.4'],
        ['C', '40-49', '2.0'],
        ['D', '30-39', '1.6'],
        ['E', 'Below 30', '0.8'],
    ];

    autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Grade', 'Marks Range', 'GPA']],
        body: gpaScale,
        theme: 'grid',
        headStyles: {
            fillColor: [80, 80, 80],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 7,
            halign: 'center',
            cellPadding: 1.5,
        },
        bodyStyles: {
            fontSize: 7,
            cellPadding: 1.5,
            textColor: grayText,
            halign: 'center',
            lineColor: [230, 230, 230],
            lineWidth: 0.2,
        },
        tableWidth: 70,
        alternateRowStyles: { fillColor: [250, 250, 250] },
    });

    y = doc.lastAutoTable.finalY + 14;

    // ── Signature lines ──
    const sigLineWidth = 50;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);

    // Left signature
    doc.line(margin + 10, y, margin + 10 + sigLineWidth, y);
    doc.setTextColor(...grayText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Class Teacher', margin + 10 + sigLineWidth / 2, y + 5, { align: 'center' });

    // Right signature
    const rightSigX = pageWidth - margin - 10 - sigLineWidth;
    doc.line(rightSigX, y, rightSigX + sigLineWidth, y);
    doc.text('Principal', rightSigX + sigLineWidth / 2, y + 5, { align: 'center' });

    y += 14;

    // ── Footer ──
    doc.setDrawColor(...primary);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
    doc.setTextColor(...grayText);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.text('This is a computer-generated report card from Seven Star English Boarding School.', pageWidth / 2, y, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, y + 4, { align: 'center' });

    // Save
    const filename = `Report_Card_${(studentName || 'Student').replace(/\s+/g, '_')}_${(examName || 'Exam').replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
}
