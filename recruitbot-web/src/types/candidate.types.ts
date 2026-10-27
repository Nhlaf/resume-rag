/**
 * Phase 14: Candidate Profile Type Definitions
 */

export interface Experience {
  company: string;
  title: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  location?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  location?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  duration?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface CandidateProfile {
  _id: string;
  rawText?: string;
  resumeId?: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  location?: string;
  title?: string;
  summary?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  projects?: Project[];
  certifications?: Certification[];
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  createdAt?: string;
  updatedAt?: string;
}
