import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MockDB } from '../services/mockDatabase';
import { parsePrescriptionImage } from '../services/geminiService';
import { Prescription, Medicine, PrescriptionStatus } from '../types';
import { Save, RefreshCw, Plus, Trash2, ArrowLeft, Wand2 } from 'lucide-react';

const PrescriptionValidator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      MockDB.getAllPendingPrescriptions().then(list => {
        const found = list.find(p => p.id === id);
        if (found) {
          setPrescription(found);
          // Auto-trigger OCR if image exists
          if (found.imageUrl) {
            runOcr(found.imageUrl);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const runOcr = async (imageUrl: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      // In a real app, if imageUrl is a URL, fetch it and convert to base64. 
      // Here we assume imageUrl IS base64 for the mock upload flow.
      // If it's a URL (like picsum), we can't really run OCR on it in this mock environment without CORS issues or a proxy.
      // So we will only run parsePrescriptionImage if it looks like a data URL.
      if (imageUrl.startsWith('data:')) {
         const base64Data = imageUrl.split(',')[1];
         const result = await parsePrescriptionImage(base64Data);
         setMedicines(result.medicines || []);
         setDiagnosis(result.diagnosis || '');
         setNotes(result.notes || '');
      } else {
        // Fallback demo data if we can't process the placeholder URL
        setDiagnosis('Example Diagnosis (AI placeholder)');
        setMedicines([
          { name: 'Paracetamol', dosage: '500mg', frequency: '1-0-1', duration: '5 days', instructions: 'After food' }
        ]);
      }
    } catch (err) {
      setError('OCR Failed. Please input manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!prescription) return;
    
    const updatedRx: Prescription = {
      ...prescription,
      status: PrescriptionStatus.VALIDATED,
      medicines,
      diagnosis,
      notes
    };

    await MockDB.savePrescription(updatedRx);
    alert('Prescription Validated & Saved!');
    navigate('/');
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  if (!prescription) return <div>Loading...</div>;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-200 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Validate Prescription</h1>
            <p className="text-xs text-slate-500">ID: {prescription.id}</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-emerald-700"
        >
          <Save size={18} /> Approve & Save
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left: Image View */}
        <div className="w-1/2 bg-slate-200 rounded-xl overflow-auto relative flex items-center justify-center border border-slate-300">
           {prescription.imageUrl ? (
             <img src={prescription.imageUrl} alt="Source" className="max-w-full max-h-full" />
           ) : (
             <div className="text-slate-400">No Image Available</div>
           )}
           <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm text-xs">
             <span className="font-bold">Original Scan</span>
           </div>
        </div>

        {/* Right: Structured Data Form */}
        <div className="w-1/2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-semibold text-slate-700">Digitized Data</h2>
            <button 
              onClick={() => prescription.imageUrl && runOcr(prescription.imageUrl)}
              disabled={isProcessing}
              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <Wand2 size={12} /> {isProcessing ? 'AI Processing...' : 'Re-scan with AI'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
              <input 
                type="text" 
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Acute Bronchitis"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">Medicines</label>
                <button onClick={addMedicine} className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Plus size={14} /> Add Drug
                </button>
              </div>
              
              <div className="space-y-4">
                {medicines.map((med, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                    <button 
                      onClick={() => removeMedicine(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input 
                        placeholder="Medicine Name"
                        value={med.name}
                        onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                        className="col-span-2 px-3 py-2 text-sm border border-slate-300 rounded-md"
                      />
                      <input 
                        placeholder="Dosage (e.g. 500mg)"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                        className="px-3 py-2 text-sm border border-slate-300 rounded-md"
                      />
                      <input 
                        placeholder="Frequency (e.g. 1-0-1)"
                        value={med.frequency}
                        onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                        className="px-3 py-2 text-sm border border-slate-300 rounded-md"
                      />
                      <input 
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                        className="px-3 py-2 text-sm border border-slate-300 rounded-md"
                      />
                       <input 
                        placeholder="Instructions"
                        value={med.instructions}
                        onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                        className="px-3 py-2 text-sm border border-slate-300 rounded-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Doctor Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Additional instructions..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionValidator;
