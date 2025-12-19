
export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  BANNED = 'BANNED'
}

export enum Platform {
  WTDS = 'WTDS',
  WBDS = 'WBDS',
  GTO = 'GTO',
  TOE3 = 'TOE3',
  ETS2 = 'ETS2'
}

export enum Segment {
  TRUCK = 'TRUCK',
  BUS = 'BUS',
  BOTH = 'BOTH'
}

export enum UserCategory {
  ENTREPRENEUR = 'ENTREPRENEUR',
  AUTONOMOUS = 'AUTONOMOUS',
  DRIVER = 'DRIVER',
  GROUPING = 'GROUPING'
}

export interface Permissions {
  pode_aprovar: boolean;
  pode_editar: boolean;
  pode_gerenciar_viagens: boolean;
  pode_atribuir_cargos: boolean;
  pode_banir: boolean;
  pode_ver_financeiro: boolean;
  pode_gerenciar_b2b?: boolean;
}

export interface CustomRole {
  id: string;
  name: string;
  permissions: Permissions;
  isLocked?: boolean;
  companyName?: string; // Roles criadas por empresas específicas
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  age: number;
  category: UserCategory;
  roleId: string;
  status: UserStatus;
  platforms: Platform[];
  segment: Segment;
  photoUrl: string; 
  logoUrl?: string; 
  flagUrl?: string; 
  cnpj?: string; 
  cnh?: string; 
  companyName?: string;
  brandColor?: string; 
  createdAt: string;
  description?: string;
  rejectionReason?: string;
  performanceFactor?: number;
}

export interface Trip {
  id: string;
  driverUid: string;
  driverName: string;
  companyName?: string;
  origin: string;
  destination: string;
  date: string;
  value: number;
  platform: Platform;
  segment: Segment;
  imageHashInitial: string;
  imageHashFinal: string;
  photoUrlInitial: string;
  photoUrlFinal: string;
  isValidated?: boolean;
}

export interface PointLog {
  id: string;
  uid: string;
  name: string;
  companyName: string;
  type: 'IN' | 'OUT';
  timestamp: string;
  routeType: string;
}

export interface B2BContract {
  id: string;
  companyA: string; 
  companyB: string; 
  percentageA: number; 
  percentageB: number; 
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'FINISHED';
  description: string;
  createdAt: string;
}

export interface CompanyGoal {
  id: string;
  companyName: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  title: string;
  type: 'GENERAL' | 'INDIVIDUAL';
  targetUid?: string; // UID do motorista se for individual
  targetName?: string;
}

// Fix: Added missing interface for ranking history snapshots
export interface RankingSnapshot {
  id: string;
  month: string;
  data: UserProfile[];
  createdAt: string;
}
