import jsPDF from 'jspdf';
import { AcceptanceLetterData } from '../types/letterTypes';
import { generateQrCodeDataUrl } from './qrCode';
import { getOrbitLogoDataUrl } from './orbitLogoSvg';

/**
 * Generates an official, high-resolution PDF for the SIWES / I.T Acceptance Letter
 * using the official Orbit Space letterhead background layout.
 */
export async function generateAcceptanceLetterPdf(letter: AcceptanceLetterData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 18;

  // 1. Clean White Base
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // 2. Background Subtle Grid (Light purple/gray)
  doc.setDrawColor(240, 237, 245);
  doc.setLineWidth(0.15);
  const gridSize = 7; // mm
  for (let x = 0; x <= pageWidth; x += gridSize) {
    doc.line(x, 28, x, pageHeight - 16);
  }
  for (let y = 28; y <= pageHeight - 16; y += gridSize) {
    doc.line(0, y, pageWidth, y);
  }

  // Pre-render official Orbit Space Logo images
  const [logoHeaderDataUrl, logoWatermarkDataUrl] = await Promise.all([
    getOrbitLogoDataUrl(380, '#ffffff'),
    getOrbitLogoDataUrl(600, '#ede4f5')
  ]);

  // 3. Background Watermark - Official Orbit Space Logo
  if (logoWatermarkDataUrl) {
    const wmWidth = 100;
    const wmHeight = (wmWidth * 2649) / 3026;
    doc.addImage(
      logoWatermarkDataUrl,
      'PNG',
      (pageWidth - wmWidth) / 2,
      (pageHeight - wmHeight) / 2 + 5,
      wmWidth,
      wmHeight
    );
  } else {
    doc.setTextColor(236, 230, 244);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(54);
    doc.text('oRb.it', pageWidth / 2, pageHeight / 2 + 10, { align: 'center', angle: 32 });
  }

  // 4. TOP HEADER (Orbit Space Official Letterhead)
  // Header Purple Banner Pill
  doc.setFillColor(44, 9, 74); // #2c094a
  doc.roundedRect(12, 10, 130, 22, 5, 5, 'F');

  // Gradient transition bars to the right
  doc.setFillColor(85, 28, 128); // lighter purple
  doc.roundedRect(120, 10, 25, 22, 3, 3, 'F');
  doc.setFillColor(135, 75, 185); // soft purple
  doc.roundedRect(138, 10, 20, 22, 3, 3, 'F');
  doc.setFillColor(195, 160, 225); // lavender
  doc.roundedRect(152, 10, 15, 22, 2, 2, 'F');

  // Logo container inside the pill
  doc.setFillColor(35, 7, 60);
  doc.roundedRect(12, 10, 28, 22, 5, 5, 'F');

  // Official Orbit Space Vector Logo
  if (logoHeaderDataUrl) {
    const logoW = 22;
    const logoH = (logoW * 2649) / 3026;
    doc.addImage(logoHeaderDataUrl, 'PNG', 15, 11.5, logoW, logoH);
  } else {
    // Fallback if canvas rendering fails
    doc.setFillColor(255, 255, 255);
    doc.circle(26, 19, 3.5, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.6);
    doc.ellipse(26, 19, 6.5, 2.2, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text('oRbit', 26, 28.5, { align: 'center' });
  }

  // "Orbit space" Display Typography
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Orbit space', 44, 19);

  // "Tech Academy & Workspace"
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(231, 216, 245);
  doc.text('Tech Academy & Workspace', 44, 25);

  // 5. LETTER CONTENT STARTS (Y cursor ~ 44mm)
  let currentY = 44;

  // Reference and Date Row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  doc.text(`Ref: ${letter.refNumber}`, marginX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${letter.issueDate}`, pageWidth - marginX, currentY, { align: 'right' });

  currentY += 8;

  // Addressee Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  doc.text(letter.recipientTitle, marginX, currentY);
  currentY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(letter.department, marginX, currentY);
  currentY += 4.5;
  doc.text(letter.institution, marginX, currentY);
  currentY += 4.5;
  if (letter.institutionAddress) {
    const addressLines = doc.splitTextToSize(letter.institutionAddress, 100);
    doc.text(addressLines, marginX, currentY);
    currentY += addressLines.length * 4.2;
  }
  currentY += 3;

  // Salutation
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  doc.text('Dear Sir/Madam,', marginX, currentY);
  currentY += 6;

  // SUBJECT LINE (Centered & Bold Underlined)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(44, 9, 74); // Deep purple theme
  const subjectText = 'LETTER OF ACCEPTANCE FOR INDUSTRIAL TRAINING (SIWES)';
  doc.text(subjectText, pageWidth / 2, currentY, { align: 'center' });

  // Underline subject
  const textWidth = doc.getTextWidth(subjectText);
  doc.setDrawColor(68, 17, 110);
  doc.setLineWidth(0.4);
  doc.line((pageWidth - textWidth) / 2, currentY + 1.2, (pageWidth + textWidth) / 2, currentY + 1.2);

  currentY += 8;

  // Opening Paragraph
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  const openingPara = `We are pleased to inform you that ${letter.studentName.toUpperCase()} with Matriculation/Registration Number: ${letter.matricNumber}, a student of your reputable institution in the ${letter.department}, has been officially offered placement for their mandatory ${letter.duration} Students Industrial Work Experience Scheme (SIWES) / Industrial Training (I.T) program at Orbit Space Tech Academy & Workspace, Ilorin.`;
  const splitOpening = doc.splitTextToSize(openingPara, pageWidth - (marginX * 2));
  doc.text(splitOpening, marginX, currentY, { lineHeightFactor: 1.35 });
  currentY += (splitOpening.length * 4.3) + 4;

  // Structured Details Box
  const boxX = marginX;
  const boxWidth = pageWidth - (marginX * 2);
  const boxY = currentY;
  const boxHeight = 44;

  // Light tinted background for details
  doc.setFillColor(248, 245, 252);
  doc.setDrawColor(215, 195, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'FD');

  // Left accent bar
  doc.setFillColor(68, 17, 110);
  doc.rect(boxX, boxY, 2.5, boxHeight, 'F');

  let detailY = boxY + 6;
  const col1X = boxX + 7;
  const col2X = boxX + 54;

  const renderDetailRow = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 20, 95);
    doc.text(label, col1X, detailY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(value, col2X, detailY);
    detailY += 5.2;
  };

  renderDetailRow('Student Full Name:', letter.studentName);
  renderDetailRow('Matriculation Number:', `${letter.matricNumber}  (${letter.academicLevel || 'Student'})`);
  renderDetailRow('Specialization / Track:', letter.programTrack);
  renderDetailRow('Attachment Duration:', `${letter.duration}  (${letter.startDate} – ${letter.endDate})`);
  renderDetailRow('Training Facility:', 'Orbit Space Hub, Behind Armour, Off Fate Tank, GRA, Ilorin');
  renderDetailRow('Scheduled Hours:', letter.schedule || 'Monday – Friday | 9:00 AM – 4:00 PM');
  renderDetailRow('Assigned Mentor / Dept:', 'Software Engineering & Cloud Systems Division');

  currentY = boxY + boxHeight + 6;

  // Body Paragraphs: Training Scope & Mentorship Commitment
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(40, 40, 40);

  const scopePara = `During this industrial attachment period, the student will be engaged in structured, hands-on software development, live client and open-source project sprints, architectural design sessions, and comprehensive technical workshops. Our seasoned senior developers and lab supervisors will provide continuous one-on-one mentorship to ensure adherence to high engineering standards.`;
  const splitScope = doc.splitTextToSize(scopePara, pageWidth - (marginX * 2));
  doc.text(splitScope, marginX, currentY, { lineHeightFactor: 1.35 });
  currentY += (splitScope.length * 4.2) + 3;

  const logbookPara = `We guarantee full institutional collaboration, including periodic supervision facilitation for your visiting institutional coordinators, weekly technical task assessments, and prompt endorsement of the student's official SIWES Logbook and performance appraisal forms.`;
  const splitLogbook = doc.splitTextToSize(logbookPara, pageWidth - (marginX * 2));
  doc.text(splitLogbook, marginX, currentY, { lineHeightFactor: 1.35 });
  currentY += (splitLogbook.length * 4.2) + 4;

  // Closing Salutation
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('We look forward to an impactful and fruitful partnership with your institution.', marginX, currentY);
  currentY += 6;

  doc.text('Yours faithfully,', marginX, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 9, 74);
  doc.text('For: Orbit Space Tech Academy & Workspace', marginX, currentY);
  currentY += 5;

  // Signatory & Official Stamp Block
  const sigY = currentY;

  // Handwritten stylized signature representation
  doc.setFont('times', 'italic');
  doc.setFontSize(15);
  doc.setTextColor(24, 15, 60);
  doc.text('Precious Ogunleye', marginX + 4, sigY + 6);

  // Line under signature
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.3);
  doc.line(marginX, sigY + 8, marginX + 60, sigY + 8);

  // Signatory details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text(letter.signatoryName || 'Engr. Precious Ogunleye', marginX, sigY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(letter.signatoryTitle || 'Academy Director & Technical Supervisor', marginX, sigY + 17);
  doc.text('Orbit Space Tech Academy & Workspace, Ilorin', marginX, sigY + 21);

  // Circular Official Stamp (Purple Seal)
  const stampCenterX = 118;
  const stampCenterY = sigY + 11;
  doc.setDrawColor(85, 25, 135);
  doc.setLineWidth(0.8);
  doc.circle(stampCenterX, stampCenterY, 13.5, 'S');
  doc.setLineWidth(0.3);
  doc.circle(stampCenterX, stampCenterY, 12, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.setTextColor(85, 25, 135);
  doc.text('ORBIT SPACE TECH ACADEMY', stampCenterX, stampCenterY - 6.5, { align: 'center' });
  doc.setFontSize(5);
  doc.text('* INDUSTRIAL TRAINING *', stampCenterX, stampCenterY - 3, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text('OFFICIALLY', stampCenterX, stampCenterY + 1, { align: 'center' });
  doc.text('ACCEPTED', stampCenterX, stampCenterY + 4, { align: 'center' });
  doc.setFontSize(5);
  doc.text('ILORIN, KWARA STATE', stampCenterX, stampCenterY + 8, { align: 'center' });

  // Verification QR Code on the right
  try {
    const verifyUrl = `${window.location.origin}/verify?id=${encodeURIComponent(letter.verificationCode || letter.matricNumber)}`;
    const qrDataUrl = await generateQrCodeDataUrl(verifyUrl, 300);
    const qrSize = 21;
    const qrX = pageWidth - marginX - qrSize;
    const qrY = sigY;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(80, 30, 115);
    doc.text('Scan to Verify', qrX + (qrSize / 2), qrY + qrSize + 3.2, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(110, 110, 110);
    doc.text(`ID: ${letter.verificationCode}`, qrX + (qrSize / 2), qrY + qrSize + 6, { align: 'center' });
  } catch (err) {
    console.warn('Could not add QR code to PDF:', err);
  }

  // 6. BOTTOM FOOTER (Exact Orbit Space Letterhead Bottom Banner)
  const footerHeight = 15;
  const footerY = pageHeight - footerHeight;

  // Solid dark purple footer bar
  doc.setFillColor(44, 8, 74); // #2c084a
  doc.rect(0, footerY, pageWidth, footerHeight, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(245, 240, 251);

  // Email
  doc.text('orditspace.ilorin@gmail.com', 12, footerY + 8.5);

  // Phone numbers
  doc.text('0703 880 6474, 0806 762 7491', 82, footerY + 8.5);

  // Address
  doc.text('Behind Armour, Off Fate Tank, GRA, Ilorin, Kwara State', 134, footerY + 8.5);

  // Save the generated PDF
  const cleanName = letter.studentName.replace(/[^a-zA-Z0-9]/g, '_') || 'Student';
  doc.save(`Orbit_Space_Acceptance_Letter_${cleanName}.pdf`);
}
