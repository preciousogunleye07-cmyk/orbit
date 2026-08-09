import { Course } from '../types';
import cybersecurityImg from '../assets/images/regenerated_image_1786286938893.png';
import dataAnalysisImg from '../assets/images/regenerated_image_1786286942591.png';
import frontendImg from '../assets/images/regenerated_image_1786286952634.png';
import backendImg from '../assets/images/regenerated_image_1786286956654.png';
import fullstackImg from '../assets/images/regenerated_image_1786286960923.png';
import uiuxImg from '../assets/images/regenerated_image_1786286963996.png';
import aiAutomationImg from '../assets/images/regenerated_image_1786286968504.png';

export const COURSES_DATA: Course[] = [
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Learn how to protect systems, networks, and data from cyber threats.',
    category: 'security',
    duration: '12 Weeks',
    level: 'Beginner to Advanced',
    schedule: 'Weekdays & Weekend options',
    badge: 'High Demand',
    iconName: 'ShieldAlert',
    priceFormatted: '₦150,000',
    imageUrl: cybersecurityImg,
    curriculum: [
      'Fundamentals of Networking & Operating Systems',
      'Cyber Threat Intelligence & Incident Response',
      'Ethical Hacking & Vulnerability Assessment',
      'Web Application Security & OWASP Top 10',
      'Cryptography & Data Protection Protocols',
      'SOC Operations & Hands-on Lab Defense Simulations'
    ],
    careerOutcomes: [
      'Cybersecurity Analyst',
      'SOC Analyst',
      'Junior Penetration Tester',
      'Information Security Specialist'
    ]
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis',
    description: 'Learn how to turn data into useful insights and better decisions.',
    category: 'data',
    duration: '10 Weeks',
    level: 'Beginner Friendly',
    schedule: 'Flexible Evening & Weekend',
    badge: 'Practical Focus',
    iconName: 'BarChart3',
    priceFormatted: '₦150,000',
    imageUrl: dataAnalysisImg,
    curriculum: [
      'Advanced Microsoft Excel for Business Analytics',
      'Relational Databases & SQL Queries for Data Extraction',
      'Data Visualization with Power BI & Tableau',
      'Python Basics for Data Wrangling & Pandas',
      'Exploratory Data Analysis (EDA) Techniques',
      'Real-world Industry Case Studies & Capstone Project'
    ],
    careerOutcomes: [
      'Data Analyst',
      'Business Intelligence Analyst',
      'Operations Analyst',
      'Data Reporting Specialist'
    ]
  },
  {
    id: 'frontend-development',
    title: 'Frontend Development',
    description: 'Learn how to build modern, responsive websites and web applications.',
    category: 'development',
    duration: '12 Weeks',
    level: 'Beginner Friendly',
    schedule: 'Physical Hub & Online',
    badge: 'Popular',
    iconName: 'Code2',
    priceFormatted: '₦150,000',
    imageUrl: frontendImg,
    curriculum: [
      'HTML5, Semantic Web & Accessibility (a11y)',
      'CSS3, Flexbox, Modern Grid & Tailwind CSS',
      'JavaScript ES6+ Core Logic & DOM Manipulation',
      'React.js Components, State Management & Hooks',
      'Git & GitHub Version Control & Team Workflows',
      'Building & Deploying 3 Live Responsive Web Apps'
    ],
    careerOutcomes: [
      'Frontend Engineer',
      'Web Developer',
      'React Developer',
      'UI Engineer'
    ]
  },
  {
    id: 'backend-development',
    title: 'Backend Development',
    description: 'Learn how to build the systems and technologies that power modern applications.',
    category: 'development',
    duration: '12 Weeks',
    level: 'Intermediate',
    schedule: 'Weekdays',
    badge: 'Core Tech',
    iconName: 'Server',
    priceFormatted: '₦150,000',
    imageUrl: backendImg,
    curriculum: [
      'Node.js Architecture & Asynchronous JavaScript',
      'Building Express.js RESTful APIs & Middleware',
      'SQL (PostgreSQL) & NoSQL (MongoDB) Databases',
      'Authentication (JWT, OAuth) & Security Protocols',
      'Server Deployment, Cloud Environment & Docker',
      'API Integration, Error Handling & Performance Optimization'
    ],
    careerOutcomes: [
      'Backend Engineer',
      'API Developer',
      'Node.js Specialist',
      'Software Developer'
    ]
  },
  {
    id: 'full-stack-development',
    title: 'Full Stack Development',
    description: 'Learn both frontend and backend development and become a complete web developer.',
    category: 'development',
    duration: '16 Weeks',
    level: 'All Levels',
    schedule: 'Intensive Practical Track',
    badge: 'Comprehensive',
    iconName: 'Layers',
    priceFormatted: '₦280,000',
    imageUrl: fullstackImg,
    curriculum: [
      'Complete Frontend Masterclass (HTML, CSS, JS, React)',
      'Complete Backend Infrastructure (Node.js, Express, DBs)',
      'State Management, Redux/Zustand & Server State',
      'Full Stack Architecture, Auth, & Payment Gateways',
      'DevOps Essentials, CI/CD & Cloud Hosting',
      'End-to-End Product Engineering Capstone Project'
    ],
    careerOutcomes: [
      'Full Stack Web Developer',
      'MERN Stack Engineer',
      'Software Engineer',
      'Tech Startup Founder'
    ]
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX & Product Engineering',
    description: 'Learn how to architect, design, and engineer digital products that are beautiful, functional, and developer-ready.',
    category: 'design',
    duration: '10 Weeks',
    level: 'Beginner to Intermediate',
    schedule: 'Weekdays & Weekend',
    badge: 'In Demand',
    iconName: 'Layout',
    priceFormatted: '₦150,000',
    imageUrl: uiuxImg,
    curriculum: [
      'Design Thinking, User Research & Product Architecture',
      'Information Architecture & User Journey Mapping',
      'Advanced Wireframing & High-Fidelity Figma Prototyping',
      'Design Systems, Design Tokens & Component Libraries',
      'Usability Testing, Micro-interactions & Accessibility (a11y)',
      'Developer Handoff, Design-to-Code Workflow & Case Studies'
    ],
    careerOutcomes: [
      'UI/UX Designer',
      'Product Designer',
      'Product Architect',
      'Design Systems Engineer'
    ]
  },
  {
    id: 'video-editing',
    title: 'Video Editing',
    description: 'Master professional video editing, color grading, motion graphics, and storytelling.',
    category: 'creative',
    duration: '8 Weeks',
    level: 'Beginner to Pro',
    schedule: 'Flexible Track',
    badge: 'In Demand',
    iconName: 'Video',
    priceFormatted: '₦150,000',
    imageUrl: uiuxImg,
    curriculum: [
      'Adobe Premiere Pro & DaVinci Resolve Masterclass',
      'After Effects Motion Graphics & Keyframing',
      'Color Grading, Correction & Audio Engineering',
      'Short-Form Video Production (Reels, TikTok & Shorts)',
      'Visual Effects (VFX) & Cinematic Transitions',
      'Building a High-Impact Video Portfolio'
    ],
    careerOutcomes: [
      'Video Editor',
      'Content Producer',
      'Motion Designer',
      'Freelance Media Creator'
    ]
  },
  {
    id: 'ai-automation',
    title: 'AI Automation',
    description: 'Build automated workflows, AI agents, and business process automations using modern AI tools.',
    category: 'ai',
    duration: '4 Weeks',
    level: 'Beginner Friendly',
    schedule: 'Fast Track',
    badge: 'Specialty',
    iconName: 'Bot',
    priceFormatted: '₦50,000',
    imageUrl: aiAutomationImg,
    curriculum: [
      'No-Code & Low-Code AI Automation Fundamentals',
      'API Integrations with Zapier, Make & n8n',
      'Building Custom AI Chatbots & Support Agents',
      'Automating Content Pipelines & Business Operations',
      'Advanced Prompt Engineering for Autonomous Agents',
      'Deploying Live AI Automations for Clients'
    ],
    careerOutcomes: [
      'AI Automation Specialist',
      'Workflow Consultant',
      'Prompt Engineer',
      'Operations Automator'
    ]
  },
  {
    id: 'content-creation',
    title: 'Content Creation',
    description: 'Learn digital storytelling, personal branding, audience growth, and content strategy across social platforms.',
    category: 'creative',
    duration: '4 Weeks',
    level: 'Beginner Friendly',
    schedule: 'Flexible Track',
    badge: 'Practical',
    iconName: 'Camera',
    priceFormatted: '₦50,000',
    imageUrl: fullstackImg,
    curriculum: [
      'Content Strategy, Niche Selection & Brand Identity',
      'Scriptwriting, Camera Presence & Lighting Basics',
      'Short-Form Video Production for Social Media',
      'Social Media Growth, Analytics & Community Management',
      'Monetization, Sponsorships & Client Relations',
      'Launching & Publishing Your Debut Campaign'
    ],
    careerOutcomes: [
      'Digital Content Creator',
      'Social Media Manager',
      'Brand Strategist',
      'Creative Director'
    ]
  }
];
