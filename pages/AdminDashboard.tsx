
import React, { useState, useEffect } from 'react';
import { MockDB } from '../services/mockDatabase';
import { User } from '../types';
import { UserPlus, Activity, Users, FileText, Stethoscope, Search, Table } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, prescriptions: 0 });
  const [newDoc, setNewDoc] = useState({ name: '', email: '', specialization: '' });
  const [loading, setLoading] = useState(false);
  
  // Lists
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'DOCTORS' | 'PATIENTS'>('DOCTORS');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    MockDB.getStats().then(setStats);
    MockDB.getDoctors().then(setDoctors);
    MockDB.getPatients().then(setPatients);
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await MockDB.createDoctor(newDoc.name, newDoc.email, newDoc.specialization);
      alert('Doctor created successfully!');
      setNewDoc({ name: '', email: '', specialization: '' });
      refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Hospital Administration</h1>
        <p className="text-slate-500">Manage hospital staff, view registry, and system overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Stethoscope size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Registered Doctors</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.doctors}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Active Patients</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.patients}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Total Records</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.prescriptions}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Doctor Form */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit sticky top-6">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserPlus size={20} className="text-emerald-600" />
              Register New Doctor
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Doctor Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Dr. Name"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="doctor@hospital.com"
                  value={newDoc.email}
                  onChange={(e) => setNewDoc({ ...newDoc, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="e.g. Cardiologist"
                  value={newDoc.specialization}
                  onChange={(e) => setNewDoc({ ...newDoc, specialization: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {loading ? 'Creating...' : 'Create Doctor Account'}
              </button>
            </form>
          </div>
        </div>

        {/* User Directory (Lists) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          <div className="flex border-b border-slate-200">
             <button 
                onClick={() => setActiveTab('DOCTORS')}
                className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'DOCTORS' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <div className="flex items-center justify-center gap-2"><Stethoscope size={16}/> Doctor Registry</div>
              </button>
              <button 
                onClick={() => setActiveTab('PATIENTS')}
                className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'PATIENTS' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <div className="flex items-center justify-center gap-2"><Users size={16}/> Patient Database</div>
              </button>
          </div>

          <div className="p-0 overflow-x-auto">
             {activeTab === 'DOCTORS' && (
               <table className="w-full text-left border-collapse animate-fade-in">
                 <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                   <tr>
                     <th className="p-4 font-medium border-b">Name</th>
                     <th className="p-4 font-medium border-b">Specialization</th>
                     <th className="p-4 font-medium border-b">License ID</th>
                     <th className="p-4 font-medium border-b">Email</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 text-sm">
                   {doctors.map(doc => (
                     <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                       <td className="p-4 font-semibold text-slate-900">{doc.name}</td>
                       <td className="p-4 text-slate-600"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{doc.specialization}</span></td>
                       <td className="p-4 text-slate-500 font-mono text-xs">{doc.licenseNumber}</td>
                       <td className="p-4 text-slate-500">{doc.email}</td>
                     </tr>
                   ))}
                   {doctors.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">No doctors registered yet.</td></tr>}
                 </tbody>
               </table>
             )}

             {activeTab === 'PATIENTS' && (
                <table className="w-full text-left border-collapse animate-fade-in">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-medium border-b">Health ID</th>
                    <th className="p-4 font-medium border-b">Name</th>
                    <th className="p-4 font-medium border-b">Demographics</th>
                    <th className="p-4 font-medium border-b">Blood Group</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {patients.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-900 font-mono font-bold"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{p.healthId}</span></td>
                      <td className="p-4 font-medium text-slate-700">{p.name}</td>
                      <td className="p-4 text-slate-600">{p.age} Yrs / {p.gender}</td>
                      <td className="p-4 text-slate-600"><span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">{p.bloodGroup}</span></td>
                    </tr>
                  ))}
                   {patients.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">No patients registered yet.</td></tr>}
                </tbody>
              </table>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;