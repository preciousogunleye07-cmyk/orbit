import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TimetableSlot } from '../data/timetableData';

interface GeneratePdfOptions {
  slots: TimetableSlot[];
  filterDay?: string;
  searchQuery?: string;
}

export const generateTimetablePdf = ({
  slots,
  filterDay = 'all',
  searchQuery = ''
}: GeneratePdfOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Header Banner
  doc.setFillColor(16, 14, 23); // Deep dark background
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent Line
  doc.setFillColor(168, 85, 247); // Orbit Purple
  doc.rect(0, 41, pageWidth, 1.5, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('ORBIT SPACE ACADEMY', 14, 18);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(192, 132, 252);
  doc.text('Weekly Class Timetable · Practical Lab & Lecture Schedule', 14, 26);

  // Hub Location
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('Beside Captain Cook, Unity Road, Ilorin, Kwara State, Nigeria', 14, 34);

  // Right-aligned Metadata (Date generated)
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 210);
  doc.text(`Generated: ${today}`, pageWidth - 14, 20, { align: 'right' });
  doc.text(`Total Sessions: ${slots.length}`, pageWidth - 14, 28, { align: 'right' });

  // 2. Filter / Scope Notice (if applicable)
  let startY = 50;
  if (filterDay !== 'all' || searchQuery.trim() !== '') {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 120);
    const filterText = [
      filterDay !== 'all' ? `Day: ${filterDay}` : null,
      searchQuery.trim() ? `Search: "${searchQuery}"` : null
    ].filter(Boolean).join(' | ');

    doc.text(`Filter Applied: ${filterText}`, 14, 48);
    startY = 54;
  }

  // 3. Prepare Table Data
  // Group rows nicely
  const tableRows = slots.map(slot => [
    slot.day,
    slot.time,
    slot.course,
    slot.instructor
  ]);

  // 4. Generate Table
  autoTable(doc, {
    startY: startY,
    head: [['Day', 'Time', 'Course Track', 'Instructor']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [31, 27, 46], // #1f1b2e
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 30, 35],
      cellPadding: 3.5
    },
    alternateRowStyles: {
      fillColor: [248, 247, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32, textColor: [76, 29, 149] },
      1: { cellWidth: 38, fontStyle: 'normal' },
      2: { cellWidth: 65, fontStyle: 'bold' },
      3: { cellWidth: 45, fontStyle: 'normal' }
    },
    styles: {
      overflow: 'linebreak',
      lineColor: [220, 220, 230],
      lineWidth: 0.2
    },
    margin: { left: 14, right: 14 }
  });

  // 5. Important Notes & Footer at bottom
  // Get final Y position after table
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  const finalY = doc.lastAutoTable?.finalY || 200;

  const notesY = Math.min(finalY + 10, pageHeight - 35);

  doc.setFillColor(245, 243, 255);
  doc.roundedRect(14, notesY, pageWidth - 28, 18, 2, 2, 'F');
  doc.setDrawColor(221, 214, 254);
  doc.roundedRect(14, notesY, pageWidth - 28, 18, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(88, 28, 135);
  doc.text('Important Academic Note:', 18, notesY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text('Please arrive 15 minutes before practical lab sessions. Power & high-speed internet are available at the hub.', 18, notesY + 12);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 160);
  doc.text(
    'Orbit Space · Academic Desk WhatsApp: +234 806 762 7491 · Ilorin, Kwara State',
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  // Save PDF
  const filename = filterDay !== 'all' 
    ? `Orbit_Space_Timetable_${filterDay}.pdf`
    : 'Orbit_Space_Weekly_Timetable.pdf';

  doc.save(filename);
};
