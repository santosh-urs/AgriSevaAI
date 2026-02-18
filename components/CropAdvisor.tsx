
import React, { useState } from 'react';
import { getCropRecommendations, getAutoLocationRecommendations, getCropGrowthGuide } from '../services/geminiService';
import { Recommendation, GrowthStep } from '../types';

const CropAdvisor: React.FC = () => {
  const [soilType, setSoilType] = useState('Loamy');
  const [region, setRegion] = useState('');
  const [climate, setClimate] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [results, setResults] = useState<Recommendation[]>([]);
  const [detectedLocation, setDetectedLocation] = useState<{name: string, climate: string} | null>(null);
  
  // Growth Guide States
  const [activeGuide, setActiveGuide] = useState<{crop: string, steps: GrowthStep[]} | null>(null);
  const [guideLoading, setGuideLoading] = useState<string | null>(null);

  const handleRecommend = async () => {
    setLoading(true);
    setDetectedLocation(null);
    try {
      const recs = await getCropRecommendations(soilType, region, climate);
      setResults(recs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const result = await getAutoLocationRecommendations(latitude, longitude, soilType);
        
        setRegion(result.locationName);
        setClimate(result.climateDesc);
        setResults(result.recommendations);
        setDetectedLocation({
          name: result.locationName,
          climate: result.climateDesc
        });
      } catch (error) {
        console.error("Error detecting location:", error);
        alert("Failed to detect location or climate. Please enter manually.");
      } finally {
        setLocationLoading(false);
      }
    }, (error) => {
      console.error(error);
      setLocationLoading(false);
      alert("Location access denied or unavailable.");
    });
  };

  const fetchGrowthGuide = async (crop: string) => {
    setGuideLoading(crop);
    try {
      const steps = await getCropGrowthGuide(crop);
      setActiveGuide({ crop, steps });
    } catch (error) {
      console.error(error);
    } finally {
      setGuideLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            🌦️ Climate & Crop Advisor
          </h3>
          <button 
            onClick={handleAutoDetect}
            disabled={locationLoading || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              locationLoading 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 animate-pulse' 
              : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <span className="text-lg">📍</span>
            {locationLoading ? 'Detecting Location...' : 'Auto-Detect Location & Climate'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Soil Type</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              placeholder="e.g. Clay, Sandy..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Region</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. Northern Highlands..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Current Climate</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={climate}
              onChange={(e) => setClimate(e.target.value)}
              placeholder="e.g. Hot & Dry..."
            />
          </div>
        </div>

        <button
          onClick={handleRecommend}
          disabled={loading || locationLoading}
          className="mt-8 w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:bg-slate-300"
        >
          {loading ? 'Analyzing Data...' : 'Manual Analyze'}
        </button>
      </div>

      {detectedLocation && (
        <div className="bg-emerald-900 text-white p-6 rounded-3xl animate-in zoom-in-95 duration-300 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🌍</div>
            <div>
              <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-1">Detected Location</p>
              <h4 className="text-xl font-bold">{detectedLocation.name}</h4>
              <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
                <span className="font-bold">Climate Overview:</span> {detectedLocation.climate}
              </p>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          {results.map((res, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border-t-4 border-emerald-500 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <div className="mb-6">
                <div className="text-3xl mb-4">🌱</div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{res.crop}</h4>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-3">{res.reason}</p>
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Expected Yield</p>
                  <p className="text-emerald-700 font-bold">{res.expectedYield}</p>
                </div>
              </div>
              <button
                onClick={() => fetchGrowthGuide(res.crop)}
                disabled={guideLoading === res.crop}
                className="w-full bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 hover:text-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                {guideLoading === res.crop ? (
                  <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                ) : '📖 View Growth Guide'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Growth Guide Modal/Overlay */}
      {activeGuide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-900 text-white rounded-t-3xl">
                <div>
                   <h4 className="text-2xl font-bold">{activeGuide.crop} Growth Guide</h4>
                   <p className="text-emerald-200 text-sm">Step-by-step planting to harvest</p>
                </div>
                <button 
                  onClick={() => setActiveGuide(null)}
                  className="w-10 h-10 rounded-full hover:bg-emerald-800 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {activeGuide.steps.map((step, i) => (
                  <div key={i} className="relative pl-12">
                     {/* Step Number Circle */}
                     <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm border-2 border-emerald-500">
                        {i + 1}
                     </div>
                     {/* Connecting Line */}
                     {i < activeGuide.steps.length - 1 && (
                       <div className="absolute left-4 top-8 w-0.5 h-full bg-emerald-100 -translate-x-1/2"></div>
                     )}
                     
                     <div className="space-y-3">
                        <div className="flex items-center gap-3">
                           <h5 className="text-lg font-bold text-slate-800">{step.stage}</h5>
                           <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-full tracking-wider">{step.duration}</span>
                        </div>
                        <ul className="space-y-2">
                           {step.instructions.map((inst, j) => (
                             <li key={j} className="text-sm text-slate-600 flex gap-2">
                                <span className="text-emerald-400">•</span>
                                {inst}
                             </li>
                           ))}
                        </ul>
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                           <p className="text-xs text-amber-800 leading-relaxed italic">
                             <span className="font-bold">Pro Tip:</span> {step.tips}
                           </p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
             
             <div className="p-6 border-t border-slate-100 text-center">
                <button 
                  onClick={() => setActiveGuide(null)}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  Got it, thanks!
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropAdvisor;
