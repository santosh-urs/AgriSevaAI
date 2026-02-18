
import React, { useState, useRef } from 'react';
import { getPestRisks, analyzePestFromImage } from '../services/geminiService';
import { PestRisk } from '../types';

const PestAlerts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'visual'>('forecast');
  const [cropType, setCropType] = useState('Corn/Maize');
  const [weather, setWeather] = useState('Humid, 28°C, occasional rain');
  const [loading, setLoading] = useState(false);
  const [risks, setRisks] = useState<PestRisk[]>([]);
  
  // Visual Scan States
  const [image, setImage] = useState<string | null>(null);
  const [visualResult, setVisualResult] = useState<{ pestName: string; damageDescription: string; solutions: string[]; riskLevel: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkRisks = async () => {
    setLoading(true);
    setVisualResult(null);
    try {
      const results = await getPestRisks(cropType, weather);
      setRisks(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setVisualResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVisualScan = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const result = await analyzePestFromImage(base64);
      setVisualResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch(level) {
      case 'Severe': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Moderate': return 'bg-amber-400 text-slate-900';
      default: return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Tab Switcher */}
      <div className="flex bg-slate-200 p-1 rounded-2xl w-fit mx-auto">
        <button 
          onClick={() => setActiveTab('forecast')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'forecast' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Risk Forecast
        </button>
        <button 
          onClick={() => setActiveTab('visual')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'visual' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Visual Diagnosis
        </button>
      </div>

      {activeTab === 'forecast' ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            🐛 Pest Risk Forecast
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Crop Type</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Weather Context</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={checkRisks}
            disabled={loading}
            className="mt-8 w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-xl disabled:bg-slate-300"
          >
            {loading ? 'Scanning Regional Patterns...' : 'Check For Risks'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">📸 Visual Pest Scan</h3>
          <p className="text-slate-500 mb-8">Snap a photo of the affected crop area for instant ID.</p>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-video w-full max-w-md mx-auto rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${image ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'}`}
          >
            {image ? (
              <img src={image} className="w-full h-full object-cover rounded-3xl" alt="Preview" />
            ) : (
              <div className="p-8">
                <div className="text-5xl mb-4">🦟</div>
                <p className="text-slate-600 font-medium">Click to upload crop photo</p>
                <p className="text-xs text-slate-400 mt-2">Identify the pest or damage</p>
              </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload} 
          />

          {image && !loading && !visualResult && (
            <button
              onClick={handleVisualScan}
              className="mt-8 bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-emerald-700 transition-colors"
            >
              Start Analysis
            </button>
          )}

          {loading && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-emerald-700 font-bold">Scanning for pests...</p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6">
        {activeTab === 'forecast' ? risks.map((risk, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl text-center">
              <span className={`px-4 py-1 rounded-full text-xs font-black uppercase mb-3 ${getRiskBadge(risk.riskLevel)}`}>
                {risk.riskLevel} Risk
              </span>
              <h4 className="text-2xl font-black text-slate-800">{risk.pest}</h4>
              <div className="text-4xl mt-4">🦂</div>
            </div>
            
            <div className="flex-1 space-y-4">
              <h5 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                🛡️ Prevention Checklist
              </h5>
              <div className="grid sm:grid-cols-2 gap-3">
                {risk.preventiveMeasures.map((measure, j) => (
                  <div key={j} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl text-sm text-slate-700">
                    <span className="w-5 h-5 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">✓</span>
                    {measure}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )) : visualResult && (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-8 animate-in zoom-in-95 duration-300">
             <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                   <span className={`px-4 py-1 rounded-full text-xs font-black uppercase mb-3 ${getRiskBadge(visualResult.riskLevel)}`}>
                    {visualResult.riskLevel} Severity
                  </span>
                  <h4 className="text-4xl font-black text-slate-900 mt-2">{visualResult.pestName}</h4>
                  <p className="text-slate-600 mt-4 leading-relaxed">{visualResult.damageDescription}</p>
                </div>
                <div className="md:w-1/2 bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                   <h5 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">💊 Treatment & Solution</h5>
                   <ul className="space-y-3">
                      {visualResult.solutions.map((s, i) => (
                        <li key={i} className="flex gap-3 text-emerald-800 text-sm">
                           <span className="text-emerald-500 font-bold">•</span>
                           {s}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'forecast' && risks.length === 0 && !loading && (
          <div className="text-center py-20 bg-slate-100/50 rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-400 font-medium">No active risk reports. Keep conditions monitored.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PestAlerts;
