
import { User, Prescription, UserRole, PrescriptionStatus } from '../types';

// Seed Data
const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    healthId: 'PID-1001',
    name: 'Rajesh Kumar', 
    role: UserRole.PATIENT, 
    email: 'rajesh@example.com',
    age: 45,
    gender: 'Male',
    bloodGroup: 'O+'
  },
  { 
    id: 'd1', 
    name: 'Dr. Anjali Gupta', 
    role: UserRole.DOCTOR, 
    email: 'anjali@hospital.com',
    specialization: 'Cardiologist',
    licenseNumber: 'IMC-123456'
  },
  {
    id: 'a1',
    name: 'Admin User',
    role: UserRole.ADMIN,
    email: 'admin@hospital.com'
  }
];

let users = [...MOCK_USERS]; // Local state to simulate DB persistence in session

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx1',
    patientId: 'u1',
    doctorId: 'd1',
    date: '2023-10-15',
    status: PrescriptionStatus.VALIDATED,
    diagnosis: 'Hypertension',
    medicines: [
      { name: 'Amlodipine', dosage: '5mg', frequency: '1-0-0', duration: '30 days', instructions: 'After breakfast' }
    ]
  },
  {
    id: 'rx2',
    patientId: 'u1',
    date: '2024-05-20',
    status: PrescriptionStatus.PENDING_VALIDATION,
    medicines: [],
    diagnosis: 'Pending OCR',
    imageUrl: 'https://picsum.photos/400/600'
  }
];

let prescriptions = [...MOCK_PRESCRIPTIONS];

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateHealthId = () => `PID-${Math.floor(1000 + Math.random() * 9000)}`;

export const MockDB = {
  login: async (email: string): Promise<User | null> => {
    await delay(500);
    return users.find(u => u.email === email) || null;
  },

  // Admin Actions
  createDoctor: async (name: string, email: string, specialization: string): Promise<User> => {
    await delay(600);
    const newDoc: User = {
      id: `d-${Date.now()}`,
      name,
      email,
      role: UserRole.DOCTOR,
      specialization,
      licenseNumber: `IMC-${Math.floor(Math.random() * 100000)}`
    };
    users.push(newDoc);
    return newDoc;
  },

  // Get Lists
  getDoctors: async (): Promise<User[]> => {
    await delay(300);
    return users.filter(u => u.role === UserRole.DOCTOR);
  },

  getPatients: async (): Promise<User[]> => {
    await delay(300);
    return users.filter(u => u.role === UserRole.PATIENT);
  },

  // Doctor Actions
  createPatient: async (name: string, age: number, gender: string, bloodGroup: string): Promise<User> => {
    await delay(600);
    const newPatient: User = {
      id: `p-${Date.now()}`,
      healthId: generateHealthId(),
      name,
      email: `${name.toLowerCase().replace(/\s/g, '')}@ayurmed.in`, // Auto-generate dummy email
      role: UserRole.PATIENT,
      age,
      gender,
      bloodGroup
    };
    users.push(newPatient);
    return newPatient;
  },

  findPatientByHealthId: async (healthId: string): Promise<User | null> => {
    await delay(400);
    return users.find(u => u.role === UserRole.PATIENT && u.healthId === healthId) || null;
  },

  // Data Access
  getPatientPrescriptions: async (patientId: string): Promise<Prescription[]> => {
    await delay(500);
    return prescriptions.filter(p => p.patientId === patientId);
  },

  getAllPendingPrescriptions: async (): Promise<Prescription[]> => {
    await delay(500);
    return prescriptions.filter(p => p.status === PrescriptionStatus.PENDING_VALIDATION);
  },

  savePrescription: async (rx: Prescription): Promise<Prescription> => {
    await delay(800);
    const existingIndex = prescriptions.findIndex(p => p.id === rx.id);
    if (existingIndex >= 0) {
      prescriptions[existingIndex] = rx;
    } else {
      prescriptions.push(rx);
    }
    return rx;
  },

  getStats: async () => {
    await delay(300);
    return {
      doctors: users.filter(u => u.role === UserRole.DOCTOR).length,
      patients: users.filter(u => u.role === UserRole.PATIENT).length,
      prescriptions: prescriptions.length
    };
  }
};