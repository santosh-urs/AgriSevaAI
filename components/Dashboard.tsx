
import React, { useState, useRef } from 'react';
import { AppView } from '../types';
import { analyzeFarmOverview } from '../services/geminiService';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([
    { key: 'soilQuality', label: 'Soil Quality', value: 'Not Scanned', icon: '🌱', color: 'bg-emerald-100 text-emerald-700' },
    { key: 'marketOutlook', label: 'Market Outlook', value: 'Bullish', icon: '📈', color: 'bg-blue-100 text-blue-700' },
    { key: 'pestRisk', label: 'Pest Risk', value: 'Not Scanned', icon: '🛡️', color: 'bg-amber-100 text-amber-700' },
    { key: 'cropHealth', label: 'Crop Health', value: 'Not Scanned', icon: '🌾', color: 'bg-indigo-100 text-indigo-700' },
  ]);
  const [summary, setSummary] = useState("Scan your farm to get today's analysis.");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools = [
    { id: 'crop-rec', title: 'Climate & Crop', desc: 'Predict best crops for upcoming weather.', icon: '🌦️' },
    { id: 'disease-det', title: 'Disease Detection', desc: 'Scan leaves to identify deficiencies.', icon: '🧬' },
    { id: 'market-trend', title: 'Price Forecasting', desc: 'Know when to sell for max profit.', icon: '💰' },
    { id: 'pest-alert', title: 'Pest Prevention', desc: 'Early warning and risk assessment.', icon: '🐛' },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await analyzeFarmOverview(base64);
        setStats(prev => prev.map(stat => {
          if (stat.key === 'soilQuality') return { ...stat, value: result.soilQuality };
          if (stat.key === 'pestRisk') return { ...stat, value: result.pestRisk };
          if (stat.key === 'cropHealth') return { ...stat, value: result.cropHealth };
          return stat;
        }));
        setSummary(result.summary);
      } catch (err) {
        console.error(err);
        alert("Failed to analyze image. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Good Morning! 👋</h2>
          <p className="text-slate-500">{summary}</p>
        </div>
        
        <div className="flex gap-2">
           <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
           />
           <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg font-bold transition-all ${
                loading ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 active:scale-95'
              }`}
           >
             {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Analyzing Farm...
                </>
             ) : (
                <>
                  <span className="text-xl">📸</span>
                  Scan Farm/Soil
                </>
             )}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110`}>
              {stat.icon}
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.value === 'Not Scanned' ? 'text-slate-300' : 'text-slate-900'}`}>
              {stat.value}
            </p>
            {stat.value === 'Not Scanned' && (
              <div className="absolute top-2 right-2 text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                Pending
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            🚀 Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onNavigate(tool.id as AppView)}
                className="group p-5 text-left border border-slate-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50 transition-all"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{tool.icon}</div>
                <h4 className="font-bold text-slate-800 mb-1">{tool.title}</h4>
                <p className="text-xs text-slate-500">{tool.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Regional Forecast</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
                <span className="text-emerald-300">Temperature</span>
                <span className="font-bold text-lg">28°C</span>
              </div>
              <div className={`flex items-center justify-between border-b border-emerald-800 pb-2`}>
                <span className="text-emerald-300">Humidity</span>
                <span className="font-bold text-lg">65%</span>
              </div>
              <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
                <span className="text-emerald-300">Rainfall Prob.</span>
                <span className="font-bold text-lg">12%</span>
              </div>
              <p className="text-emerald-200 text-sm italic mt-4">
                "Conditions are perfect for monitoring your crops today."
              </p>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 text-[12rem] opacity-10 select-none">☀️</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
