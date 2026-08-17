export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  dayIndex: number; // 1 = Monday, 6 = Saturday
  time: string; // Display string e.g. "12:00–2:00 PM"
  startHour: number; // 24hr format e.g. 12
  startMinute: number; // 0
  endHour: number; // 14
  endMinute: number; // 0
  course: string;
  instructor: string;
  instructorTitle?: string;
  venue: string;
  category: 'security' | 'development' | 'creative' | 'automation' | 'engineering' | 'data';
  badge?: string;
}

export const TIMETABLE_DATA: TimetableSlot[] = [
  // Monday
  {
    id: 'mon-1',
    day: 'Monday',
    dayIndex: 1,
    time: '12:00–2:00 PM',
    startHour: 12,
    startMinute: 0,
    endHour: 14,
    endMinute: 0,
    course: 'Cyber Security',
    instructor: 'Olamide',
    instructorTitle: 'Lead Security Engineer & SOC Analyst',
    venue: 'Cyber Defense Lab (Lab 1)',
    category: 'security',
    badge: 'Core Track'
  },
  {
    id: 'mon-2',
    day: 'Monday',
    dayIndex: 1,
    time: '2:00–4:00 PM',
    startHour: 14,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    course: 'Product Engineering',
    instructor: 'Ayo',
    instructorTitle: 'Principal Product Engineer',
    venue: 'Engineering Suite (Lab 2)',
    category: 'engineering',
    badge: 'Hands-on Sprint'
  },

  // Tuesday
  {
    id: 'tue-1',
    day: 'Tuesday',
    dayIndex: 2,
    time: '2:00–4:00 PM',
    startHour: 14,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    course: 'Video Editing',
    instructor: 'Precious',
    instructorTitle: 'Creative Media & VFX Specialist',
    venue: 'Creative Media Studio',
    category: 'creative',
    badge: 'Studio Session'
  },

  // Wednesday
  {
    id: 'wed-1',
    day: 'Wednesday',
    dayIndex: 3,
    time: '11:00 AM–1:00 PM',
    startHour: 11,
    startMinute: 0,
    endHour: 13,
    endMinute: 0,
    course: 'Back End Development',
    instructor: 'Lawal',
    instructorTitle: 'Senior Backend & Cloud Architect',
    venue: 'Code Lab Alpha (Lab 1)',
    category: 'development',
    badge: 'Database & APIs'
  },
  {
    id: 'wed-2',
    day: 'Wednesday',
    dayIndex: 3,
    time: '12:00–2:00 PM',
    startHour: 12,
    startMinute: 0,
    endHour: 14,
    endMinute: 0,
    course: 'Cyber Security',
    instructor: 'Olamide',
    instructorTitle: 'Lead Security Engineer & SOC Analyst',
    venue: 'Cyber Defense Lab (Lab 2)',
    category: 'security',
    badge: 'Lab Defense'
  },
  {
    id: 'wed-3',
    day: 'Wednesday',
    dayIndex: 3,
    time: '2:00–4:00 PM',
    startHour: 14,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    course: 'Product Engineering',
    instructor: 'Ayo',
    instructorTitle: 'Principal Product Engineer',
    venue: 'Engineering Suite (Lab 1)',
    category: 'engineering',
    badge: 'System Architecture'
  },
  {
    id: 'wed-4',
    day: 'Wednesday',
    dayIndex: 3,
    time: '2:00–4:00 PM',
    startHour: 14,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    course: 'Video Editing',
    instructor: 'Precious',
    instructorTitle: 'Creative Media & VFX Specialist',
    venue: 'Creative Media Studio',
    category: 'creative',
    badge: 'Post-Production'
  },

  // Thursday
  {
    id: 'thu-1',
    day: 'Thursday',
    dayIndex: 4,
    time: '11:00 AM–1:00 PM',
    startHour: 11,
    startMinute: 0,
    endHour: 13,
    endMinute: 0,
    course: 'Front End Development',
    instructor: 'Lawal',
    instructorTitle: 'Senior Frontend & UI Engineer',
    venue: 'Code Lab Alpha (Lab 1)',
    category: 'development',
    badge: 'React & Modern Web'
  },
  {
    id: 'thu-2',
    day: 'Thursday',
    dayIndex: 4,
    time: '11:00 AM–1:00 PM',
    startHour: 11,
    startMinute: 0,
    endHour: 13,
    endMinute: 0,
    course: 'Content Creation',
    instructor: 'Rekay',
    instructorTitle: 'Lead Content Strategist & Brand Lead',
    venue: 'Digital Broadcast Hub',
    category: 'creative',
    badge: 'Brand Strategy'
  },

  // Friday
  {
    id: 'fri-1',
    day: 'Friday',
    dayIndex: 5,
    time: '10:00 AM–12:00 PM',
    startHour: 10,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    course: 'Front End Development',
    instructor: 'Lawal',
    instructorTitle: 'Senior Frontend & UI Engineer',
    venue: 'Code Lab Alpha (Lab 1)',
    category: 'development',
    badge: 'Component Lab'
  },
  {
    id: 'fri-2',
    day: 'Friday',
    dayIndex: 5,
    time: '10:00 AM–12:00 PM',
    startHour: 10,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    course: 'Automation',
    instructor: 'Precious',
    instructorTitle: 'AI & Workflow Automation Mentor',
    venue: 'Innovation Lab (Lab 2)',
    category: 'automation',
    badge: 'AI & Scripts'
  },
  {
    id: 'fri-3',
    day: 'Friday',
    dayIndex: 5,
    time: '12:00–2:00 PM',
    startHour: 12,
    startMinute: 0,
    endHour: 14,
    endMinute: 0,
    course: 'Back End Development',
    instructor: 'Lawal',
    instructorTitle: 'Senior Backend & Cloud Architect',
    venue: 'Code Lab Alpha (Lab 1)',
    category: 'development',
    badge: 'Server Sprint'
  },
  {
    id: 'fri-stat',
    day: 'Friday',
    dayIndex: 5,
    time: '1:00–3:00 PM',
    startHour: 13,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
    course: 'Statistics',
    instructor: 'Mr. Stat',
    instructorTitle: 'Lead Statistics & Data Science Mentor',
    venue: 'Data Analytics Suite (Lab 2)',
    category: 'data',
    badge: 'Applied Data'
  },
  {
    id: 'fri-4',
    day: 'Friday',
    dayIndex: 5,
    time: '2:00–4:00 PM',
    startHour: 14,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    course: 'Video Editing',
    instructor: 'Precious',
    instructorTitle: 'Creative Media & VFX Specialist',
    venue: 'Creative Media Studio',
    category: 'creative',
    badge: 'Color & Sound FX'
  },
  {
    id: 'fri-5',
    day: 'Friday',
    dayIndex: 5,
    time: '2:00–4:00 PM',
    startHour: 14,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    course: 'Product Engineering',
    instructor: 'Ayo',
    instructorTitle: 'Principal Product Engineer',
    venue: 'Engineering Suite (Lab 2)',
    category: 'engineering',
    badge: 'Product Review'
  },
  {
    id: 'fri-6',
    day: 'Friday',
    dayIndex: 5,
    time: '4:00–6:00 PM',
    startHour: 16,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
    course: 'Cyber Security',
    instructor: 'Olamide',
    instructorTitle: 'Lead Security Engineer & SOC Analyst',
    venue: 'Cyber Defense Lab (Lab 1)',
    category: 'security',
    badge: 'Penetration Testing'
  },

  // Saturday
  {
    id: 'sat-1',
    day: 'Saturday',
    dayIndex: 6,
    time: '10:00 AM–12:00 PM',
    startHour: 10,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    course: 'Automation',
    instructor: 'Precious',
    instructorTitle: 'AI & Workflow Automation Mentor',
    venue: 'Innovation Lab (Lab 2)',
    category: 'automation',
    badge: 'Weekend Masterclass'
  },
  {
    id: 'sat-2',
    day: 'Saturday',
    dayIndex: 6,
    time: '10:00 AM–12:00 PM',
    startHour: 10,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    course: 'Front End Development',
    instructor: 'Lawal',
    instructorTitle: 'Senior Frontend & UI Engineer',
    venue: 'Code Lab Alpha (Lab 1)',
    category: 'development',
    badge: 'Weekend Build'
  },
  {
    id: 'sat-stat',
    day: 'Saturday',
    dayIndex: 6,
    time: '1:00–3:00 PM',
    startHour: 13,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
    course: 'Statistics',
    instructor: 'Mr. Stat',
    instructorTitle: 'Lead Statistics & Data Science Mentor',
    venue: 'Data Analytics Suite (Lab 2)',
    category: 'data',
    badge: 'Practical Analytics'
  },
  {
    id: 'sat-3',
    day: 'Saturday',
    dayIndex: 6,
    time: '4:00–6:00 PM',
    startHour: 16,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
    course: 'Cyber Security',
    instructor: 'Olamide',
    instructorTitle: 'Lead Security Engineer & SOC Analyst',
    venue: 'Cyber Defense Lab (Lab 1)',
    category: 'security',
    badge: 'Weekend Red Team Lab'
  }
];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const;

export const INSTRUCTORS = [
  { name: 'Olamide', track: 'Cyber Security', role: 'Lead Security Engineer', avatar: 'OL', color: '#a855f7' },
  { name: 'Lawal', track: 'Front End & Back End Development', role: 'Senior Full Stack Lead', avatar: 'LW', color: '#38bdf8' },
  { name: 'Ayo', track: 'Product Engineering', role: 'Principal Product Engineer', avatar: 'AY', color: '#ec4899' },
  { name: 'Precious', track: 'Video Editing & Automation', role: 'Creative Director & AI Mentor', avatar: 'PR', color: '#10b981' },
  { name: 'Rekay', track: 'Content Creation', role: 'Lead Content Strategist', avatar: 'RK', color: '#f59e0b' },
  { name: 'Mr. Stat', track: 'Statistics & Data Science', role: 'Statistics & Analytics Lead', avatar: 'ST', color: '#06b6d4' }
];

export const TIMETABLE_STATS = {
  totalClassesPerWeek: 20,
  activeInstructors: 6,
  coreTracks: 8,
  hubLocations: 4
};
