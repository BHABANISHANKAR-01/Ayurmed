
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MockDB } from '../services/mockDatabase';
import { PrescriptionStatus } from '../types';
import { Upload, X, Check } from 'lucide-react';

interface Props {
  patientId?: string;
  onUploadSuccess?: () => void;
}

const PrescriptionUpload: React.FC<Props> = ({ patientId, onUploadSuccess }) => {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const targetPatientId = patientId || user?.id;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!image || !targetPatientId) return;
    setUploading(true);

    try {
      // Simulate creating a record in DB with Pending Status
      await MockDB.savePrescription({
        id: `rx-${Date.now()}`,
        patientId: targetPatientId,
        doctorId: user?.id,
        date: new Date().toISOString().split('T')[0],
        status: PrescriptionStatus.PENDING_VALIDATION,
        imageUrl: image,
        diagnosis: 'Processing...',
        medicines: []
      });
      
      alert('Prescription uploaded successfully for digitization.');
      setImage(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Digitize Old Prescription</h2>
        <p className="text-slate-500 text-sm">Upload a scan. AI will extract medicines, and you can validate it.</p>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300">
        
        {!image ? (
          <div className="py-12 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <Upload size={24} />
            </div>
            <p className="font-medium text-slate-700">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
              <img src={image} alt="Preview" className="w-full h-48 object-contain" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
              {uploading ? 'Processing...' : <><Check size={18} /> Confirm Upload</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionUpload;
