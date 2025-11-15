export const countryCodes = [

  { code: "+234", flag: "🇳🇬", country: "Nigeria" },
  { code: "+233", flag: "🇬🇭", country: "Ghana" },
  { code: "+254", flag: "🇰🇪", country: "Kenya" },
  { code: "+27", flag: "🇿🇦", country: "South Africa" },
];

// Position options that match backend enum: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'devops' | 'data' | 'security' | 'other'
export const positions = [
  { value: 'frontend', label: 'Frontend Developer' },
  { value: 'backend', label: 'Backend Developer' },
  { value: 'fullstack', label: 'Full Stack Developer' },
  { value: 'mobile', label: 'Mobile Developer' },
  { value: 'devops', label: 'DevOps Engineer' },
  { value: 'data', label: 'Data Engineer' },
  { value: 'security', label: 'Security Engineer' },
  { value: 'other', label: 'Other' },
] as const;

// Legacy roles array for backward compatibility (maps to position values)
export const roles: string[] = positions.map(p => p.value);

// All available skills
const allSkills: string[] = [
  'React',
  'Node.js',
  'Nodejs',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Go',
  'Rust',
  'Solidity',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Git',
  'GraphQL',
  'REST API',
  'Express',
  'Next.js',
  'Vue.js',
  'Angular',
  'React Native',
  'Flutter',
  'Swift',
  'Kotlin',
  'HTML',
  'CSS',
  'SASS',
  'Tailwind CSS',
  'Web3',
  'Blockchain',
  'Smart Contracts',
  'Machine Learning',
  'Data Science',
  'TensorFlow',
  'PyTorch',
];

// Position to skills mapping
const positionSkillsMap: Record<string, string[]> = {
  frontend: [
    'React',
    'JavaScript',
    'TypeScript',
    'HTML',
    'CSS',
    'SASS',
    'Tailwind CSS',
    'Vue.js',
    'Angular',
    'Next.js',
    'Git',
  ],
  backend: [
    'Node.js',
    'Nodejs',
    'Python',
    'Java',
    'Go',
    'Rust',
    'SQL',
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'Redis',
    'Express',
    'GraphQL',
    'REST API',
    'Git',
  ],
  fullstack: [
    'React',
    'Node.js',
    'Nodejs',
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'SQL',
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'Express',
    'Next.js',
    'Vue.js',
    'Angular',
    'GraphQL',
    'REST API',
    'HTML',
    'CSS',
    'SASS',
    'Tailwind CSS',
    'Git',
  ],
  mobile: [
    'React Native',
    'Flutter',
    'Swift',
    'Kotlin',
    'JavaScript',
    'TypeScript',
    'Git',
  ],
  devops: [
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'GCP',
    'Git',
    'Python',
    'Node.js',
    'SQL',
  ],
  data: [
    'Python',
    'SQL',
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'Redis',
    'Machine Learning',
    'Data Science',
    'TensorFlow',
    'PyTorch',
    'Git',
  ],
  security: [
    'Python',
    'JavaScript',
    'SQL',
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'GCP',
    'Git',
  ],
  other: allSkills, // Show all skills for "other"
};

// Get skills filtered by selected positions
export const getSkillsForPositions = (selectedPositions: string[]): string[] => {
  if (selectedPositions.length === 0) {
    return allSkills; // Show all skills if no position selected
  }

  // If "other" is selected, show all skills
  if (selectedPositions.includes('other')) {
    return allSkills;
  }

  // Collect unique skills from all selected positions
  const skillSet = new Set<string>();
  selectedPositions.forEach((position) => {
    const skills = positionSkillsMap[position] || [];
    skills.forEach((skill) => skillSet.add(skill));
  });

  // Convert to array and sort
  return Array.from(skillSet).sort();
};

// Export all skills for backward compatibility
export const skills: string[] = allSkills;

// Helper function to get position label from value
export const getPositionLabel = (value: string): string => {
  const position = positions.find(p => p.value === value);
  return position?.label || value;
};

// Helper function to validate position value
export const isValidPosition = (value: string): boolean => {
  return positions.some(p => p.value === value);
};

// Experience levels that match backend enum: 'entry' | 'mid' | 'senior'
export const experienceLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
] as const;

// Helper function to get experience level label from value
export const getExperienceLevelLabel = (value: string): string => {
  const level = experienceLevels.find(l => l.value === value);
  return level?.label || value;
};

// Helper function to validate experience level value
export const isValidExperienceLevel = (value: string): boolean => {
  return experienceLevels.some(l => l.value === value);
};

// Helper function to convert roles array to position (backend expects single position)
// Takes the first selected role as the primary position
export const rolesToPosition = (roles: string[]): string | undefined => {
  if (roles.length === 0) return undefined;
  // Return first valid position from roles array
  const validPosition = roles.find(role => isValidPosition(role));
  return validPosition || roles[0]; // Fallback to first role if none are valid positions
};

