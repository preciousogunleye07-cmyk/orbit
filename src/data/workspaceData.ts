import { WorkspacePlan, Testimonial, FAQItem } from '../types';

export const WORKSPACE_PLANS: WorkspacePlan[] = [
  {
    id: 'daily-pass',
    name: 'Daily Pass',
    price: 3000,
    period: 'day',
    formattedPrice: '₦3,000',
    features: [
      'Flexible Hot Desk Access for 1 Day',
      'Uninterrupted High-Speed Fiber Internet',
      '24/7 Power Backup (Solar & Generator)',
      'Comfortable Ergonomic Seating & AC',
      'Access to Quiet Pods & Lounge',
      'Free Coffee & Tea'
    ]
  },
  {
    id: 'weekly-pass',
    name: 'Weekly Pass',
    price: 10000,
    period: 'week',
    formattedPrice: '₦10,000',
    recommended: true,
    features: [
      '5 Consecutive Days Hot Desk Access',
      'Uninterrupted High-Speed Fiber Internet',
      '24/7 Guaranteed Power Backup',
      'Ergonomic Workstation & AC Environment',
      'Meeting Room Access (2 Hours included)',
      'Free Printing Credits (20 Pages)',
      'Free Coffee, Tea & Water'
    ]
  },
  {
    id: 'monthly-pass',
    name: 'Monthly Pass',
    price: 27000,
    period: 'month',
    formattedPrice: '₦27,000',
    features: [
      'Full 30 Days Desk Access',
      'Dedicated Locker & Fixed Desk Option',
      'Uninterrupted High-Speed Fiber Internet',
      'Guaranteed 24/7 Power Backup',
      'Meeting Room Access (8 Hours included)',
      'Free Printing Credits (100 Pages)',
      'Orbit Space Tech Community Membership',
      'Priority Access to Masterclasses & Events'
    ]
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 't1',
    name: 'Ibrahim Abdullahi',
    role: 'Frontend Developer at KwaraTech',
    courseOrProgram: 'Frontend Development Graduate',
    content: 'Orbit Space gave me the practical coding confidence I needed. In Ilorin, finding a center with 100% stable power and expert mentors made all the difference in landing my first remote dev role!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 't2',
    name: 'Blessing Ogundele',
    role: 'SIWES Intern (Unilorin Computer Science)',
    courseOrProgram: 'UI/UX Design SIWES Track',
    content: 'My SIWES at Orbit Space wasn\'t just signing logbooks — I worked on real client prototypes, learned Figma auto-layout, and built a portfolio that impressed my department supervisors!',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 't3',
    name: 'Emmanuel Faruq',
    role: 'Data Analyst & Remote Freelancer',
    courseOrProgram: 'Data Analysis Graduate & Workspace Member',
    content: 'The workspace in Orbit Space is top notch. The ₦27,000 monthly plan with high-speed internet and uninterrupted power in Ilorin is an absolute lifesaver for tech workers.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  }
];

export const FAQ_DATA: FAQItem[] = [
  {
    category: 'general',
    question: 'Where is Orbit Space located in Ilorin?',
    answer: 'Orbit Space is located in Ilorin, Kwara State, Nigeria. Our physical campus and workspace feature comfortable air-conditioned classrooms, high-speed fiber internet, and 24/7 power backup.'
  },
  {
    category: 'courses',
    question: 'Do I need prior coding or tech experience to join?',
    answer: 'No! Most of our programs (Frontend, Cybersecurity, Data Analysis, UI/UX, AI Web Dev) start from the absolute basics and build up to advanced practical projects.'
  },
  {
    category: 'siwes',
    question: 'How does the SIWES program work at Orbit Space?',
    answer: 'Our SIWES placement program is specifically tailored for polytechnic and university students. You get hands-on practical project training in your chosen track, mentorship, weekly logs guidance, and a final presentation portfolio.'
  },
  {
    category: 'workspace',
    question: 'Can I just walk in and pay for a Daily Workspace pass?',
    answer: 'Yes! You can walk in anytime between 8:00 AM and 8:00 PM, pay ₦3,000 for a daily pass, and start working immediately with fast internet and reliable power.'
  },
  {
    category: 'courses',
    question: 'Are installment payments allowed for courses?',
    answer: 'Yes, Orbit Space supports flexible payment plans (e.g. 50% initial deposit and remaining balance split during the course duration).'
  }
];
