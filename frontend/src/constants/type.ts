export interface GraduateForm {
    firstName: string;
    lastName: string;
    skills: string[];
    roles: string;
    interests: string[];
    socials?: {
      github?: string;
      twitter?: string;
      linkedin?: string;
    };
    portfolio?: string;
    rank?: string;
    createdAt: Date;
    updatedAt: Date;
  }