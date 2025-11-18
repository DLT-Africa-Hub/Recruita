export interface CandidateFilters {
  skills?: string[];
  experience?: string;
  availability?: string;
  rank?: 'A' | 'B' | 'C' | 'D';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CompanyFilters {
  industry?: string[];
  size?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CandidatesResponse {
  candidates: CandidateProfile[];
  pagination: PaginationMeta;
}

export interface CompaniesResponse {
  companies: Company[];
  pagination: PaginationMeta;
}

// Re-export existing types
export type { CandidateProfile } from '../data/candidates';
export type { Company } from '../components/explore/CompanyCard';

