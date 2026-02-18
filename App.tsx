
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CropAdvisor from './components/CropAdvisor';
import HealthScanner from './components/HealthScanner';
import MarketTrends from './components/MarketTrends';
import PestAlerts from './components/PestAlerts';
import { AppView } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveView} />;
      case 'crop-rec':
        return <CropAdvisor />;
      case 'disease-det':
        return <HealthScanner />;
      case 'market-trend':
        return <MarketTrends />;
      case 'pest-alert':
        return <PestAlerts />;
      default:
        return <Dashboard onNavigate={setActiveView} />;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {renderView()}
    </Layout>
  );
};

export default App;
