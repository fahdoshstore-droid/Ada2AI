export type UserRole = 'athlete' | 'facility' | 'ministry';

export interface Athlete {
  id: string;
  sportId: string;
  name: string;
  nameAr: string;
  age: number;
  city: string;
  region: string;
  sports: string[];
  sportPoints: number;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joinedAt: string;
  certifications: Certification[];
  achievements: Achievement[];
  sessions: Session[];
  careerScore: number;
  guardianConsent: boolean;
}

export interface Certification {
  id: string;
  name: string;
  sport: string;
  issuedBy: string;
  issuedAt: string;
  points: number;
  verified: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  sport: string;
  date: string;
  points: number;
  icon: string;
}

export interface Session {
  id: string;
  facilityId: string;
  facilityName: string;
  sport: string;
  date: string;
  duration: number; // minutes
  points: number;
  verifiedAt: string;
}

export interface Facility {
  id: string;
  name: string;
  nameAr: string;
  city: string;
  region: string;
  sports: string[];
  managerId: string;
  checkins: CheckIn[];
  monthlyRevenue: number;
  activeAthletes: number;
}

export interface CheckIn {
  id: string;
  athleteId: string;
  athleteName: string;
  sport: string;
  timestamp: string;
  verified: boolean;
  pointsAwarded: number;
}

export interface MinistryKPI {
  totalAthletes: number;
  activeThisMonth: number;
  totalFacilities: number;
  totalSessions: number;
  avgPointsPerAthlete: number;
  regionBreakdown: RegionData[];
  sportBreakdown: SportData[];
  monthlyGrowth: MonthlyData[];
  vision2030Progress: number;
  youthEngagement: number;
  talentPipelineScore: number;
}

export interface RegionData {
  region: string;
  athletes: number;
  facilities: number;
  sessions: number;
}

export interface SportData {
  sport: string;
  athletes: number;
  sessions: number;
  growth: number;
}

export interface MonthlyData {
  month: string;
  athletes: number;
  sessions: number;
  points: number;
}

export type PointsEvent =
  | { type: 'session'; points: 10 }
  | { type: 'competition'; points: 50 }
  | { type: 'certification'; points: 100 };
