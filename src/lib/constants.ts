import { RIASECCategory } from '../types/assessment';

export const RIASEC_CATEGORIES: Record<
  RIASECCategory,
  { label: string; code: string; tagline: string; color: string; description: string }
> = {
  Realistic: {
    label: 'Realistic',
    code: 'R',
    tagline: 'Practical & Hands-on',
    color: '#10b981', // emerald
    description: 'Enjoys working with physical tools, hardware, infrastructure, mechanics, and concrete problem-solving.',
  },
  Investigative: {
    label: 'Investigative',
    code: 'I',
    tagline: 'Analytical & Research-Driven',
    color: '#6366f1', // indigo
    description: 'Excels at intellectual analysis, algorithmic logic, mathematical inquiry, and exploring how complex systems operate.',
  },
  Artistic: {
    label: 'Artistic',
    code: 'A',
    tagline: 'Creative & Design-Oriented',
    color: '#ec4899', // pink
    description: 'Values visual aesthetics, user experience, typography, interface expression, and creative product crafting.',
  },
  Social: {
    label: 'Social',
    code: 'S',
    tagline: 'Collaborative & Mentoring',
    color: '#06b6d4', // cyan
    description: 'Thrives in collaborative teams, technical mentorship, cross-functional facilitation, and human-centric outcomes.',
  },
  Enterprising: {
    label: 'Enterprising',
    code: 'E',
    tagline: 'Strategic & Entrepreneurial',
    color: '#f59e0b', // amber
    description: 'Passionate about leadership, technological strategy, pitching vision, market positioning, and driving business impact.',
  },
  Conventional: {
    label: 'Conventional',
    code: 'C',
    tagline: 'Systematic & Detail-Oriented',
    color: '#8b5cf6', // violet
    description: 'Excels in rigorous documentation, clean code conventions, data pipelines, verification benchmarks, and reliability.',
  },
};

export const COMMON_TECHNICAL_SKILLS = [
  { name: 'Python', category: 'Languages' },
  { name: 'TypeScript', category: 'Languages' },
  { name: 'JavaScript', category: 'Languages' },
  { name: 'Go', category: 'Languages' },
  { name: 'Rust', category: 'Languages' },
  { name: 'Java', category: 'Languages' },
  { name: 'C++', category: 'Languages' },
  { name: 'SQL', category: 'Databases' },
  { name: 'React', category: 'Frameworks' },
  { name: 'Next.js', category: 'Frameworks' },
  { name: 'Node.js', category: 'Frameworks' },
  { name: 'FastAPI', category: 'Frameworks' },
  { name: 'PyTorch', category: 'AI & ML' },
  { name: 'TensorFlow', category: 'AI & ML' },
  { name: 'Scikit-Learn', category: 'AI & ML' },
  { name: 'Hugging Face', category: 'AI & ML' },
  { name: 'Docker', category: 'Cloud & Infra' },
  { name: 'Kubernetes', category: 'Cloud & Infra' },
  { name: 'AWS', category: 'Cloud & Infra' },
  { name: 'PostgreSQL', category: 'Databases' },
  { name: 'Redis', category: 'Databases' },
  { name: 'GraphQL', category: 'Fundamentals' },
  { name: 'REST APIs', category: 'Fundamentals' },
  { name: 'Git & CI/CD', category: 'Fundamentals' },
] as const;

export const COMMON_SOFT_SKILLS = [
  'Critical Problem Solving',
  'Cross-Functional Communication',
  'System Architecture Thinking',
  'Technical Writing & Docs',
  'Team Mentorship',
  'Agile Project Ownership',
  'Adaptability to New Stacks',
  'User Empathy & Product Sense',
  'Data-Driven Decision Making',
  'Stakeholder Management',
];

export const DEGREE_OPTIONS = [
  'Bachelor of Science (B.S.)',
  'Bachelor of Technology (B.Tech)',
  'Bachelor of Engineering (B.E.)',
  'Master of Science (M.S.)',
  'Master of Technology (M.Tech)',
  'Master of Business Administration (MBA)',
  'Doctor of Philosophy (Ph.D.)',
  'Associate Degree',
  'Self-Taught / Bootcamp',
];

export const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];
