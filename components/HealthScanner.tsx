
import React, { useState, useRef } from 'react';
import { detectPlantDisease } from '../services/geminiService';
import { DiseaseAnalysis } from '../types';

const HealthScanner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DiseaseAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startScan = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const result = await detectPlantDisease(base64);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">🌱 Crop Health Scanner</h3>
        <p className="text-slate-500 mb-8">Upload a photo of a leaf or soil for instant AI diagnosis.</p>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`aspect-video w-full max-w-md mx-auto rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${image ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'}`}
        >
          {image ? (
            <img src={image} className="w-full h-full object-cover rounded-3xl" alt="Preview" />
          ) : (
            <div className="p-8">
              <div className="text-5xl mb-4">📸</div>
              <p className="text-slate-600 font-medium">Click to capture or upload</p>
              <p className="text-xs text-slate-400 mt-2">Supports JPG, PNG</p>
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

        {image && !loading && !analysis && (
          <button
            onClick={startScan}
            className="mt-8 bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-200 hover:scale-105 transition-transform"
          >
            Analyze Health
          </button>
        )}

        {loading && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-emerald-700 font-bold">Consulting Plant Specialists (AI)...</p>
          </div>
        )}
      </div>

      {analysis && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <span className={`px-4 py-1 rounded-full text-sm font-bold border ${getSeverityColor(analysis.severity)}`}>
                Severity: {analysis.severity.toUpperCase()}
              </span>
              <h4 className="text-3xl font-bold mt-4 text-slate-900">{analysis.diagnosis}</h4>
              <p className="text-slate-500 mt-2">Health Status: <span className="font-bold text-slate-700">{analysis.status}</span></p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl">
              <h5 className="font-bold mb-4 flex items-center gap-2">🛠️ Recommended Action</h5>
              <ul className="space-y-3">
                {analysis.treatment.map((t, i) => (
                  <li key={i} className="flex gap-3 text-slate-700">
                    <span className="text-emerald-500 mt-1">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center bg-emerald-50 rounded-3xl p-8 border border-emerald-100">
             <div className="text-6xl mb-4">🏥</div>
             <p className="text-center font-medium text-emerald-800">
               Based on visual indicators, we recommend applying nitrogen-rich fertilizer and isolating affected plants immediately.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthScanner;
