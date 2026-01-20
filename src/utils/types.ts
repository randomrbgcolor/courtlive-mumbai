export type UserRole = 'admin' | 'clerk' | 'customer';
export type SubTier = 'free' | 'paid' | 'premium';
export type CourtStatus = 'IN_SESSION' | 'RECESS' | 'ADJOURNED' | 'HOLIDAY' | 'JUDGMENT';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  tier: SubTier;
  created_at: string;
}

export interface Court {
  id: number;
  name: string;
  district: string;
  created_at: string;
}

export interface Courtroom {
  id: number;
  court_id: number;
  room_number: string;
  current_case_number: number;
  current_status: CourtStatus;
  assigned_clerk_id: string | null;
  last_updated: string;
  created_at: string;
  court?: Court;
}

export interface UserCourtAccess {
  id: number;
  user_id: string;
  court_id: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}