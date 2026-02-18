
import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard' as AppView, label: 'Overview', icon: '📊' },
    { id: 'crop-rec' as AppView, label: 'Crop Advisor', icon: '🌾' },
    { id: 'disease-det' as AppView, label: 'Health Scan', icon: '🔍' },
    { id: 'market-trend' as AppView, label: 'Market Trends', icon: '📈' },
    { id: 'pest-alert' as AppView, label: 'Pest Alerts', icon: '🐛' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-900 text-white fixed h-full hidden md:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-emerald-400 text-3xl">🌿</span> AgroPulse
          </h1>
        </div>
        <nav className="mt-6 px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition-all flex items-center gap-3 ${
                activeView === item.id 
                ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/50' 
                : 'text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-emerald-800 p-4 rounded-xl border border-emerald-700">
            <p className="text-xs text-emerald-300">Farmer Account</p>
            <p className="text-sm font-semibold">Green Valleys Farm</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        {/* Mobile Header */}
        <header className="md:hidden bg-emerald-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
          <h1 className="text-xl font-bold">AgroPulse</h1>
          <div className="flex gap-2 overflow-x-auto">
             {navItems.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveView(item.id)}
                  className={`p-2 rounded-lg text-lg ${activeView === item.id ? 'bg-emerald-700' : ''}`}
                >
                  {item.icon}
                </button>
             ))}
          </div>
        </header>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
