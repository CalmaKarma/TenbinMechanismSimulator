import React from 'react';
import SettingsPanel from './components/SettingsPanel';
import ChartCanvas from './components/ChartCanvas';
import AnalysisPanel from './components/AnalysisPanel';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Pythagorean Lattice Reputation System Demo
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Interactive Reputation Mechanism Demo - Stake-based Reputation Position Movement
          </p>
        </div>
      </header>
      
      <main className="h-[calc(100vh-140px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full px-6 py-6">
          {/* 设置面板 - 左侧 */}
          <div className="lg:col-span-3">
            <SettingsPanel />
          </div>
          
          {/* 图表画布 - 中间 */}
          <div className="lg:col-span-6 flex flex-col">
            <ChartCanvas />
          </div>
          
          {/* 分析面板 - 右侧 */}
          <div className="lg:col-span-3 h-full">
            <AnalysisPanel />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
