
import React, { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getMarketAdvice } from '../services/geminiService';

const CROP_DATA: Record<string, { price: number; change: string; data: { date: string; price: number }[] }> = {
  Maize: {
    price: 2450,
    change: '↓ 2.1%',
    data: [
      { date: 'Jan 25', price: 2100 },
      { date: 'Feb 25', price: 2250 },
      { date: 'Mar 25', price: 2180 },
      { date: 'Apr 25', price: 2350 },
      { date: 'May 25', price: 2450 },
      { date: 'Jun 25', price: 2400 },
    ],
  },
  Rice: {
    price: 3800,
    change: '↑ 4.5%',
    data: [
      { date: 'Jan 25', price: 3200 },
      { date: 'Feb 25', price: 3400 },
      { date: 'Mar 25', price: 3550 },
      { date: 'Apr 25', price: 3600 },
      { date: 'May 25', price: 3750 },
      { date: 'Jun 25', price: 3800 },
    ],
  },
  Wheat: {
    price: 2125,
    change: '↑ 1.2%',
    data: [
      { date: 'Jan 25', price: 1950 },
      { date: 'Feb 25', price: 2000 },
      { date: 'Mar 25', price: 2050 },
      { date: 'Apr 25', price: 2100 },
      { date: 'May 25', price: 2110 },
      { date: 'Jun 25', price: 2125 },
    ],
  },
  Cotton: {
    price: 7200,
    change: '↑ 5.8%',
    data: [
      { date: 'Jan 25', price: 6500 },
      { date: 'Feb 25', price: 6700 },
      { date: 'Mar 25', price: 6850 },
      { date: 'Apr 25', price: 6900 },
      { date: 'May 25', price: 7100 },
      { date: 'Jun 25', price: 7200 },
    ],
  },
  Sugarcane: {
    price: 315,
    change: '↔ 0.0%',
    data: [
      { date: 'Jan 25', price: 315 },
      { date: 'Feb 25', price: 315 },
      { date: 'Mar 25', price: 315 },
      { date: 'Apr 25', price: 315 },
      { date: 'May 25', price: 315 },
      { date: 'Jun 25', price: 315 },
    ],
  },
  Soybean: {
    price: 4600,
    change: '↓ 1.5%',
    data: [
      { date: 'Jan 25', price: 4800 },
      { date: 'Feb 25', price: 4750 },
      { date: 'Mar 25', price: 4700 },
      { date: 'Apr 25', price: 4650 },
      { date: 'May 25', price: 4620 },
      { date: 'Jun 25', price: 4600 },
    ],
  },
  Mustard: {
    price: 5400,
    change: '↑ 2.3%',
    data: [
      { date: 'Jan 25', price: 5100 },
      { date: 'Feb 25', price: 5200 },
      { date: 'Mar 25', price: 5250 },
      { date: 'Apr 25', price: 5300 },
      { date: 'May 25', price: 5350 },
      { date: 'Jun 25', price: 5400 },
    ],
  },
};

const MarketTrends: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<string>('Maize');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<{ advice: string; reasoning: string } | null>(null);

  const currentCrop = CROP_DATA[selectedCrop];

  const analyzeMarket = async () => {
    setLoading(true);
    setAdvice(null);
    try {
      const historyStr = currentCrop.data.map(d => `${d.date}: ₹${d.price}`).join(', ');
      const result = await getMarketAdvice(historyStr);
      setAdvice(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Crop Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {Object.keys(CROP_DATA).map((crop) => (
          <button
            key={crop}
            onClick={() => {
              setSelectedCrop(crop);
              setAdvice(null);
            }}
            className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCrop === crop
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {selectedCrop === crop && <span>•</span>}
            {crop}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold">{selectedCrop} Price Index (2025)</h3>
                <p className="text-slate-500">APMC Mandi Average Rates (Per Quintal)</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-600">₹{currentCrop.price}</p>
                <p className={`text-sm font-medium ${currentCrop.change.includes('↑') ? 'text-emerald-500' : currentCrop.change.includes('↓') ? 'text-red-500' : 'text-slate-400'}`}>
                  {currentCrop.change} from last month
                </p>
              </div>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentCrop.data}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value}`, 'Price']}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-emerald-900 rounded-3xl p-8 text-white">
            <h4 className="text-xl font-bold mb-4">Market Signal Analysis - Q2 2025</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-emerald-800 p-4 rounded-2xl">
                <p className="text-emerald-300 text-xs">Mandi Arrival</p>
                <p className="font-bold">Steady</p>
              </div>
              <div className="bg-emerald-800 p-4 rounded-2xl">
                <p className="text-emerald-300 text-xs">MSP Status</p>
                <p className="font-bold text-emerald-100">Above Base</p>
              </div>
              <div className="bg-emerald-800 p-4 rounded-2xl">
                <p className="text-emerald-300 text-xs">Export Demand</p>
                <p className="font-bold">Increasing</p>
              </div>
              <div className="bg-emerald-800 p-4 rounded-2xl">
                <p className="text-emerald-300 text-xs">Inflation Impact</p>
                <p className="font-bold">Moderate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              🤖 AI Strategy for {selectedCrop}
            </h3>
            
            {!advice ? (
              <div className="text-center py-12 flex-1 flex flex-col justify-center">
                <div className="text-6xl mb-6">📈</div>
                <p className="text-slate-500 mb-8">Consulting current 2025 trends for {selectedCrop} in Indian Rupees.</p>
                <button
                  onClick={analyzeMarket}
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:bg-slate-300"
                >
                  {loading ? 'Analyzing Market...' : 'Get Local Strategy'}
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500 flex-1">
                <div className={`p-6 rounded-2xl border-2 ${advice.advice.toLowerCase().includes('sell') ? 'border-amber-500 bg-amber-50' : 'border-emerald-500 bg-emerald-50'}`}>
                   <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Recommended Action</p>
                   <h4 className={`text-4xl font-black ${advice.advice.toLowerCase().includes('sell') ? 'text-amber-700' : 'text-emerald-700'}`}>{advice.advice}</h4>
                </div>
                
                <div className="space-y-2">
                  <p className="font-bold text-slate-800">2025 Market Insight</p>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {advice.reasoning}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-auto">
                  <p className="text-xs text-slate-400 italic">
                    Forecast based on regional Mandi patterns.
                  </p>
                </div>

                <button
                  onClick={() => setAdvice(null)}
                  className="w-full text-slate-500 font-bold hover:text-slate-800 text-sm transition-colors mt-4"
                >
                  Clear Strategy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Broad Market Intelligence Section */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-bold mb-6">🌾 Global & Domestic Market Intelligence</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="text-3xl mb-4">🌍</div>
            <h4 className="font-bold text-blue-900 mb-2">Global Export Outlook</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              Rice and Wheat exports from India face new regulations in 2025 to ensure domestic food security. This is keeping local Mandi prices stable but above MSP.
            </p>
          </div>
          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="text-3xl mb-4">🌦️</div>
            <h4 className="font-bold text-amber-900 mb-2">Climate Impact on Pulse</h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              Erratic rainfall in major pulse-growing belts has led to a 12% drop in Tur and Urad arrivals. Expect prices to remain high throughout Q3 2025.
            </p>
          </div>
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="text-3xl mb-4">🔋</div>
            <h4 className="font-bold text-emerald-900 mb-2">Sugarcane & Biofuel</h4>
            <p className="text-sm text-emerald-800 leading-relaxed">
              The government's ethanol blending target is creating a guaranteed floor price for Sugarcane, making it a low-risk high-reward crop for 2025.
            </p>
          </div>
        </div>
        
        <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="flex gap-4 items-start p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">🥜</div>
                <div>
                    <h5 className="font-bold text-slate-800">Oilseeds Knowledge</h5>
                    <p className="text-xs text-slate-500 mt-1">Groundnut and Mustard are seeing increased demand due to lower edible oil imports. Farmers in dry zones should consider Mustard for winter cycles.</p>
                </div>
            </div>
            <div className="flex gap-4 items-start p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">🥔</div>
                <div>
                    <h5 className="font-bold text-slate-800">Tuber Trends</h5>
                    <p className="text-xs text-slate-500 mt-1">Potato prices remain volatile. Cold storage utilization is at 95%, suggesting a supply flush next month. Consider selling early if storage isn't available.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTrends;
