export interface AcceptanceLetterData {
  id: string;
  refNumber: string;
  issueDate: string;
  recipientTitle: string;
  institution: string;
  department: string;
  institutionAddress: string;
  studentName: string;
  matricNumber: string;
  academicLevel: string;
  programTrack: string;
  duration: string; // e.g. "6 Months", "3 Months", "1 Year"
  startDate: string;
  endDate: string;
  schedule: string;
  signatoryName: string;
  signatoryTitle: string;
  verificationCode: string;
  createdAt?: string;
  notes?: string;
}

export const DEFAULT_ACCEPTANCE_LETTER: AcceptanceLetterData = {
  id: 'orb-siwes-sample-01',
  refNumber: 'OS/SIWES/2026/048',
  issueDate: '17th September, 2026',
  recipientTitle: 'The SIWES Coordinator / Head of Department',
  institution: 'University of Ilorin (UNILORIN)',
  department: 'Department of Computer Science',
  institutionAddress: 'Faculty of Communication and Information Sciences, P.M.B. 1515, Ilorin, Kwara State',
  studentName: 'Babatunde Lawal',
  matricNumber: '20/52HA045',
  academicLevel: '300 Level',
  programTrack: 'Full Stack Web Development & Cloud Systems',
  duration: '6 Months',
  startDate: 'Monday, 6th October, 2026',
  endDate: 'Friday, 27th March, 2027',
  schedule: 'Monday – Friday | 9:00 AM – 4:00 PM',
  signatoryName: 'Engr. Precious Ogunleye',
  signatoryTitle: 'Academy Director & Technical Supervisor',
  verificationCode: 'OS-SIWES-8924'
};
