
export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  healthId?: string; // Unique ID for tracking patients (e.g., PID-2024-001)
  name: string;
  role: UserRole;
  email: string;
  password?: string; // Mock password
  avatarUrl?: string;
  specialization?: string; // For doctors
  licenseNumber?: string; // For doctors
  age?: number; // For patients
  gender?: string; // For patients
  bloodGroup?: string; // For patients
}

export enum PrescriptionStatus {
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  VALIDATED = 'VALIDATED',
  DIGITAL_CREATED = 'DIGITAL_CREATED'
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string; // e.g., "1-0-1"
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string; // Links to User.id
  doctorId?: string; // Optional if uploaded by patient and not yet assigned
  date: string;
  status: PrescriptionStatus;
  medicines: Medicine[];
  imageUrl?: string; // Base64 or URL for scanned image
  diagnosis?: string;
  notes?: string;
}

export interface FamilyHistoryItem {
  relation: string;
  condition: string;
  ageOfOnset?: string;
}

export interface RiskPrediction {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number; // 0-100
  prediction: string;
  factors: string[];
  recommendations: string[];
}

export interface LabReport {
  id: string;
  date: string;
  testName: string;
  result: string;
  normalRange: string;
}
