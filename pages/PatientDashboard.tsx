
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MockDB } from '../services/mockDatabase';
import { Prescription, PrescriptionStatus } from '../types';
import { Clock, CheckCircle, FileText, Droplet } from 'lucide-react';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      MockDB.getPatientPrescriptions(user.id).then(data => {
        setPrescriptions(data);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading your medical records...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Namaste, {user?.name}</h1>
        <div className="flex items-center gap-2 mt-2">
           <span className="text-slate-500">Health ID:</span>
           <span className="font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{user?.healthId}</span>
        </div>
        <p className="text-slate-400 text-sm mt-1">Provide this ID to your doctor to update your records.</p>
      </header>

      {/* Vitals Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
           <div className="p-3 bg-red-50 rounded-full text-red-500"><Droplet size={24}/></div>
           <div>
            <div className="text-sm text-slate-500 mb-1">Blood Group</div>
            <div className="text-2xl font-bold text-slate-800">{user?.bloodGroup}</div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
          <div className="p-3 bg-blue-50 rounded-full text-blue-500"><Clock size={24}/></div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Age</div>
            <div className="text-2xl font-bold text-slate-800">{user?.age} Years</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
          <div className="p-3 bg-emerald-50 rounded-full text-emerald-500"><CheckCircle size={24}/></div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Records Found</div>
            <div className="text-2xl font-bold text-slate-800">{prescriptions.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <FileText className="text-blue-500" size={20} />
            My Medical History
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {prescriptions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No medical records found.</div>
          ) : (
            prescriptions.map((rx) => (
              <div key={rx.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{rx.diagnosis || "Medical Checkup"}</p>
                    <p className="text-sm text-slate-500">{rx.date}</p>
                  </div>
                  <StatusBadge status={rx.status} />
                </div>
                {rx.medicines.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {rx.medicines.map((med, i) => (
                      <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                        <span className="font-bold text-slate-700">{med.name}</span>
                        <span className="text-slate-500 mx-2">|</span>
                        <span>{med.dosage}</span>
                        <div className="text-xs text-slate-400 mt-1">{med.instructions}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 mt-2 italic">Prescription image uploaded, details pending digitization.</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: PrescriptionStatus }> = ({ status }) => {
  switch (status) {
    case PrescriptionStatus.VALIDATED:
    case PrescriptionStatus.DIGITAL_CREATED:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <CheckCircle size={12} /> Validated
        </span>
      );
    case PrescriptionStatus.PENDING_VALIDATION:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock size={12} /> Pending Review
        </span>
      );
    default:
      return null;
  }
};

export default PatientDashboard;
