
import React, { useEffect, useState } from 'react';
import { MockDB } from '../services/mockDatabase';
import { Prescription, User } from '../types';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  UserCheck, 
  Search, 
  UserPlus, 
  ArrowRight, 
  Activity,
  FileText,
  ShieldCheck,
  Stethoscope,
  X
} from 'lucide-react';
import PrescriptionUpload from './PrescriptionUpload';
import RiskAnalysis from './RiskAnalysis';

// Sub-components for cleaner file structure
const CreatePatientForm: React.FC<{ onSuccess: (user: User) => void; onCancel: () => void }> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male', bloodGroup: 'O+' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await MockDB.createPatient(formData.name, parseInt(formData.age), formData.gender, formData.bloodGroup);
      onSuccess(user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Register New Patient</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          placeholder="Full Name" 
          required 
          className="w-full p-2 border rounded"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
        <div className="grid grid-cols-3 gap-2">
          <input 
            placeholder="Age" 
            type="number" 
            required 
            className="p-2 border rounded"
            value={formData.age}
            onChange={e => setFormData({...formData, age: e.target.value})}
          />
          <select 
            className="p-2 border rounded"
            value={formData.gender}
            onChange={e => setFormData({...formData, gender: e.target.value})}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <select 
            className="p-2 border rounded"
            value={formData.bloodGroup}
            onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
          >
            <option>O+</option>
            <option>A+</option>
            <option>B+</option>
            <option>AB+</option>
            <option>O-</option>
          </select>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition-colors"
        >
          {loading ? 'Creating...' : 'Generate Health ID'}
        </button>
      </form>
    </div>
  );
};

const DoctorDashboard: React.FC = () => {
  const [pendingRx, setPendingRx] = useState<Prescription[]>([]);
  const [searchId, setSearchId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'UPLOAD' | 'RISK'>('OVERVIEW');
  const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    MockDB.getAllPendingPrescriptions().then(setPendingRx);
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      MockDB.getPatientPrescriptions(selectedPatient.id).then(setPatientPrescriptions);
    }
  }, [selectedPatient]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setSearchLoading(true);
    setSelectedPatient(null);
    try {
      const patient = await MockDB.findPatientByHealthId(searchId.trim());
      if (patient) {
        setSelectedPatient(patient);
        setActiveTab('OVERVIEW');
      } else {
        alert('Patient not found. Check Health ID.');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Doctor Workspace</h1>
          <p className="text-slate-500">Manage patients and validate prescriptions.</p>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Search & Global Tasks */}
        <div className="space-y-6">
          {/* Search Box */}
          <div className="bg-slate-900 p-6 rounded-xl text-white shadow-lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Search size={18} className="text-emerald-400" />
              Patient Access
            </h3>
            <form onSubmit={handleSearch} className="relative mb-4">
              <input 
                type="text"
                placeholder="Enter Health ID (e.g. PID-1234)"
                className="w-full bg-slate-800 border-none rounded-lg py-3 px-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 transition-all"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button 
                type="submit" 
                className="absolute right-2 top-2 p-1 bg-emerald-600 rounded hover:bg-emerald-500 transition-colors"
              >
                <ArrowRight size={16} />
              </button>
            </form>
            <div className="text-center">
              <span className="text-slate-500 text-xs">or</span>
            </div>
            <button 
              onClick={() => setIsCreatingPatient(true)}
              className="w-full mt-2 py-2 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus size={16} /> Register New Patient
            </button>
          </div>

          {/* Pending Validations List (Always Visible) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-sm text-slate-700">Pending OCR Validations</h3>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">{pendingRx.length}</span>
             </div>
             <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
               {pendingRx.length === 0 ? <p className="p-4 text-xs text-slate-500 text-center">All caught up!</p> : pendingRx.map(rx => (
                 <div key={rx.id} className="p-3 hover:bg-slate-50 transition-colors flex justify-between items-center">
                   <div>
                     <p className="text-xs font-bold text-slate-700">{rx.id}</p>
                     <p className="text-[10px] text-slate-500">{rx.date}</p>
                   </div>
                   <Link to={`/validate/${rx.id}`} className="text-xs bg-slate-900 text-white px-2 py-1 rounded hover:bg-slate-700">
                     Verify
                   </Link>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Col: Patient Context or Creation Form */}
        <div className="lg:col-span-2">
          {isCreatingPatient ? (
            <CreatePatientForm 
              onCancel={() => setIsCreatingPatient(false)}
              onSuccess={(user) => {
                setIsCreatingPatient(false);
                setSelectedPatient(user);
                setSearchId(user.healthId || '');
              }}
            />
          ) : selectedPatient ? (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
              {/* Patient Header */}
              <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h2>
                    <p className="text-sm text-slate-500 font-mono bg-slate-200 inline-block px-2 py-0.5 rounded mt-1">
                      {selectedPatient.healthId}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-slate-600">
                      <span>Age: <b>{selectedPatient.age}</b></span>
                      <span>Sex: <b>{selectedPatient.gender}</b></span>
                      <span>Blood: <b>{selectedPatient.bloodGroup}</b></span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              {/* Patient Action Tabs */}
              <div className="flex border-b border-slate-200">
                <button 
                  onClick={() => setActiveTab('OVERVIEW')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'OVERVIEW' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <div className="flex items-center justify-center gap-2"><Activity size={16}/> Medical History</div>
                </button>
                <button 
                  onClick={() => setActiveTab('UPLOAD')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'UPLOAD' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <div className="flex items-center justify-center gap-2"><Stethoscope size={16}/> Scan & Upload Rx</div>
                </button>
                <button 
                  onClick={() => setActiveTab('RISK')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'RISK' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <div className="flex items-center justify-center gap-2"><ShieldCheck size={16}/> AI Risk Prediction</div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 min-h-[400px]">
                {activeTab === 'OVERVIEW' && (
                  <div className="animate-fade-in">
                    <h3 className="font-bold text-lg mb-4">Patient Prescriptions</h3>
                    <div className="space-y-3">
                      {patientPrescriptions.length === 0 ? <p className="text-slate-400">No records found.</p> : patientPrescriptions.map(rx => (
                        <div key={rx.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex justify-between">
                            <span className="font-bold">{rx.diagnosis || 'Diagnosis Pending'}</span>
                            <span className="text-xs text-slate-500">{rx.date}</span>
                          </div>
                          <div className="mt-2 text-sm text-slate-600">
                             {rx.medicines.map((m, i) => <span key={i} className="mr-2 bg-slate-100 px-2 py-1 rounded text-xs">{m.name}</span>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'UPLOAD' && (
                  <div className="animate-fade-in">
                    <PrescriptionUpload 
                      patientId={selectedPatient.id} 
                      onUploadSuccess={() => {
                        setActiveTab('OVERVIEW');
                        MockDB.getPatientPrescriptions(selectedPatient.id).then(setPatientPrescriptions);
                      }} 
                    />
                  </div>
                )}

                {activeTab === 'RISK' && (
                  <div className="animate-fade-in">
                    <RiskAnalysis patient={selectedPatient} />
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-12">
              <Search size={48} className="mb-4 opacity-20" />
              <p>Search for a patient using their Health ID or register a new one to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
