
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyzeHealthRisk } from '../services/geminiService';
import { FamilyHistoryItem, RiskPrediction, User } from '../types';
import { Plus, Trash2, BrainCircuit, Activity, AlertTriangle } from 'lucide-react';

interface Props {
  patient?: User; // Optional: If provided, runs for this patient. If not, runs for current user (if allowed).
}

const RiskAnalysis: React.FC<Props> = ({ patient }) => {
  const { user: currentUser } = useAuth();
  const targetUser = patient || currentUser;

  const [history, setHistory] = useState<FamilyHistoryItem[]>([
    { relation: 'Father', condition: 'Diabetes Type 2', ageOfOnset: '45' }
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskPrediction | null>(null);

  const addHistory = () => {
    setHistory([...history, { relation: 'Mother', condition: '', ageOfOnset: '' }]);
  };

  const updateHistory = (index: number, field: keyof FamilyHistoryItem, value: string) => {
    const updated = [...history];
    updated[index] = { ...updated[index], [field]: value };
    setHistory(updated);
  };

  const removeHistory = (index: number) => {
    setHistory(history.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!targetUser || !targetUser.age) {
        alert("Patient age is missing.");
        return;
    }
    setLoading(true);
    try {
      const prediction = await analyzeHealthRisk(targetUser.age, targetUser.gender || 'Male', history);
      setResult(prediction);
    } catch (e) {
      alert('Analysis failed. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <BrainCircuit className="text-purple-600" size={24} /> 
        </div>
        <div>
           <h3 className="font-bold text-slate-900">Disease Prediction Engine</h3>
           <p className="text-xs text-slate-500">Analyzing for: {targetUser?.name} ({targetUser?.age} yrs)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-4">Family Medical History Inputs</h2>
          <div className="space-y-3 mb-6">
            {history.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start animate-fade-in">
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <select 
                    value={item.relation}
                    onChange={(e) => updateHistory(idx, 'relation', e.target.value)}
                    className="p-2 border border-slate-300 rounded text-sm bg-slate-50"
                  >
                    <option>Father</option>
                    <option>Mother</option>
                    <option>Grandfather</option>
                    <option>Grandmother</option>
                    <option>Sibling</option>
                  </select>
                  <input 
                    placeholder="Condition"
                    value={item.condition}
                    onChange={(e) => updateHistory(idx, 'condition', e.target.value)}
                    className="p-2 border border-slate-300 rounded text-sm"
                  />
                   <input 
                    placeholder="Onset Age"
                    value={item.ageOfOnset}
                    onChange={(e) => updateHistory(idx, 'ageOfOnset', e.target.value)}
                    className="p-2 border border-slate-300 rounded text-sm"
                  />
                </div>
                <button onClick={() => removeHistory(idx)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button onClick={addHistory} className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline">
              <Plus size={16} /> Add Relative
            </button>
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              {loading ? <Activity className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
              Run Analysis
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg animate-slide-up">
              <div className={`p-4 rounded-lg border ${getRiskColor(result.riskLevel)} flex justify-between items-center mb-6`}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide opacity-70">Estimated Risk Level</p>
                  <h3 className="text-2xl font-bold">{result.riskLevel}</h3>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold uppercase tracking-wide opacity-70">AI Confidence Score</p>
                   <p className="text-2xl font-bold">{result.score}/100</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">Clinical Prediction Summary</h3>
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{result.prediction}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2 text-sm">Key Hereditary Factors</h3>
                        <div className="flex flex-wrap gap-2">
                        {result.factors.map((f, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">
                            {f}
                            </span>
                        ))}
                        </div>
                    </div>
                    <div>
                         <h3 className="font-semibold text-slate-800 mb-2 text-sm">Recommendations</h3>
                         <ul className="space-y-1">
                            {result.recommendations.map((r, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                <AlertTriangle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default RiskAnalysis;
