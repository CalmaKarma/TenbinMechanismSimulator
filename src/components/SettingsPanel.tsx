import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';

const SettingsPanel: React.FC = () => {
  const {
    axisLimit,
    tempVoterBuy,
    tempEntityPosition,
    isInitialized,
    setAxisLimit,
    initializeChart,
    setTempVoterBuy,
    setTempEntityPosition,
    randomizeVoterBuy,
    randomizeEntityPosition,
    confirmAndApply,
    discardChanges,
    hasPendingEdits
  } = useAppStore();

  const [tempAxisLimit, setTempAxisLimit] = useState(axisLimit);

  const handleApplyAxis = () => {
    setAxisLimit(tempAxisLimit);
    initializeChart();
  };

  const handleVoterBuyChange = (field: string, value: number) => {
    setTempVoterBuy({ [field]: value });
  };

  const handleEntityPositionChange = (field: string, value: number) => {
    setTempEntityPosition({ [field]: value });
  };

  const isValidVoterMove = tempVoterBuy.x2 >= tempVoterBuy.x1 && tempVoterBuy.y2 >= tempVoterBuy.y1;
  const isValidEntityPosition = 
    tempEntityPosition.x_cur >= (tempVoterBuy.x2 - tempVoterBuy.x1) && 
    tempEntityPosition.y_cur >= (tempVoterBuy.y2 - tempVoterBuy.y1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full overflow-y-auto custom-scrollbar">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings Panel</h2>
      
      {/* 轴限制设置 */}
      <div className="mb-8">
        <h3 className="text-md font-medium text-gray-800 mb-4">Chart Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Axis Limit
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={tempAxisLimit}
                onChange={(e) => setTempAxisLimit(Number(e.target.value))}
                min="5"
                max="100"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleApplyAxis}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 投票者购买设置 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium text-gray-800">Voter Buy</h3>
          <button
            onClick={randomizeVoterBuy}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Randomize
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Buy Start Point Row */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-sm font-medium text-gray-700 mb-2">Buy Start</div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <i>x</i><sub>1</sub> (Distrust)
                </label>
                <input
                  type="number"
                  value={tempVoterBuy.x1}
                  onChange={(e) => handleVoterBuyChange('x1', Number(e.target.value))}
                  min="1"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <i>y</i><sub>1</sub> (Trust)
                </label>
                <input
                  type="number"
                  value={tempVoterBuy.y1}
                  onChange={(e) => handleVoterBuyChange('y1', Number(e.target.value))}
                  min="1"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <i>C</i><sub>1</sub> (Hypotenuse)
                </label>
                <input
                  type="text"
                  value={Math.round(tempVoterBuy.C1).toString()}
                  readOnly
                  className="w-full px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <i>Rep</i><sub>1</sub> (Reputation)
                </label>
                <input
                  type="text"
                  value={`${(tempVoterBuy.Rep1 * 100).toFixed(1)}%`}
                  readOnly
                  className="w-full px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Buy Target Point Row */}
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="text-sm font-medium text-gray-700 mb-2">Buy Target</div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <i>x</i><sub>2</sub> (Distrust)
                </label>
                <input
                  type="number"
                  value={tempVoterBuy.x2}
                  onChange={(e) => handleVoterBuyChange('x2', Number(e.target.value))}
                  min="1"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <i>y</i><sub>2</sub> (Trust)
                </label>
                <input
                  type="number"
                  value={tempVoterBuy.y2}
                  onChange={(e) => handleVoterBuyChange('y2', Number(e.target.value))}
                  min="1"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <i>C</i><sub>2</sub> (Hypotenuse)
                </label>
                <input
                  type="text"
                  value={Math.round(tempVoterBuy.C2).toString()}
                  readOnly
                  className="w-full px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <i>Rep</i><sub>2</sub> (Reputation)
                </label>
                <input
                  type="text"
                  value={`${(tempVoterBuy.Rep2 * 100).toFixed(1)}%`}
                  readOnly
                  className="w-full px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded text-gray-600"
                />
              </div>
            </div>
          </div>
          
          {!isValidVoterMove && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
              Constraints: x2 ≥ x1, y2 ≥ y1
            </div>
          )}
        </div>
      </div>

      {/* 实体声誉位置设置 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium text-gray-800">Entity Reputation Position</h3>
          <button
            onClick={randomizeEntityPosition}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Randomize
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Current Entity Position Row */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm font-medium text-gray-700 mb-2">Current Entity Position</div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <i>x</i><sub>cur</sub> (Distrust)
                </label>
                <input
                  type="number"
                  value={tempEntityPosition.x_cur}
                  onChange={(e) => handleEntityPositionChange('x_cur', Number(e.target.value))}
                  min="1"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <i>y</i><sub>cur</sub> (Trust)
                </label>
                <input
                  type="number"
                  value={tempEntityPosition.y_cur}
                  onChange={(e) => handleEntityPositionChange('y_cur', Number(e.target.value))}
                  min="1"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <i>C</i><sub>cur</sub> (Hypotenuse)
                </label>
                <input
                  type="text"
                  value={Math.round(tempEntityPosition.C_cur).toString()}
                  readOnly
                  className="w-full px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <i>Rep</i><sub>cur</sub> (Reputation)
                </label>
                <input
                  type="text"
                  value={`${(tempEntityPosition.Rep_cur * 100).toFixed(1)}%`}
                  readOnly
                  className="w-full px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded text-gray-600"
                />
              </div>
            </div>
          </div>
          
          {!isValidEntityPosition && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
              Constraints: x_cur ≥ (x2-x1), y_cur ≥ (y2-y1)
            </div>
          )}
        </div>
      </div>

      {/* 确认和丢弃按钮 */}
      <div className="mt-8 space-y-3">
        <button
          onClick={confirmAndApply}
          disabled={!isInitialized || !isValidVoterMove || !isValidEntityPosition}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
        >
          Confirm + Apply
        </button>
        
        <button
          onClick={discardChanges}
          disabled={!hasPendingEdits()}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-red-300 disabled:cursor-not-allowed"
        >
          Discard Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
