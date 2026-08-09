import { Course } from '../types';

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
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
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
    title: 'UI/UX Design',
    description: 'Learn how to design digital products that are beautiful, useful, and easy to use.',
    category: 'design',
    duration: '10 Weeks',
    level: 'Beginner Friendly',
    schedule: 'Weekdays & Weekend',
    badge: 'Creative',
    iconName: 'Layout',
    priceFormatted: '₦150,000',
    imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    curriculum: [
      'Design Thinking & User Research Methods',
      'Information Architecture & User Journey Mapping',
      'Wireframing & Low/High Fidelity Prototyping in Figma',
      'Design Systems, Typography, Grid & Color Theory',
      'Usability Testing, Micro-interactions & Accessibility',
      'Building a Professional Portfolio with Case Studies'
    ],
    careerOutcomes: [
      'UI/UX Designer',
      'Product Designer',
      'User Researcher',
      'Interaction Designer'
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
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
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
    id: 'ai-web-development-brand-identity',
    title: 'AI Web Development & Brand Identity',
    description: 'Combine AI, web development, branding, and creative technology to build modern digital experiences.',
    category: 'ai',
    duration: '12 Weeks',
    level: 'All Levels',
    schedule: 'Hybrid Masterclass',
    badge: 'Next-Gen',
    iconName: 'Sparkles',
    priceFormatted: '₦150,000',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    curriculum: [
      'Generative AI Tools & Prompt Engineering for Developers',
      'Integrating AI APIs (Gemini, OpenAI) into Web Apps',
      'Brand Identity Systems, Logo Design & Visual Styling',
      'AI-Powered Web Development Frameworks (Vite/React)',
      'Content Generation, Automated Design & Creative Tech',
      'Launching an AI-Assisted Brand & Digital Product'
    ],
    careerOutcomes: [
      'AI Product Developer',
      'Brand & Web Designer',
      'Creative Technologist',
      'Digital Strategist'
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
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
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
