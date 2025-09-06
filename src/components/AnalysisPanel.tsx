import React from 'react';
import useAppStore from '../store/useAppStore';

const AnalysisPanel: React.FC = () => {
  const {
    entityPosition,
    voterMove,
    validTargets,
    allowUnilateralIncrement,
    setAllowUnilateralIncrement,
    isVoterAndEntityApplied
  } = useAppStore();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full overflow-y-auto custom-scrollbar">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Analysis Panel</h2>
      
      {/* 当前状态显示 */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-800 mb-4">Current Status</h3>
        
        {isVoterAndEntityApplied ? (
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm font-medium text-gray-700 mb-2">Entity Position</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Coordinates: ({entityPosition.x_cur}, {entityPosition.y_cur})</div>
                <div>C Value: {Math.round(entityPosition.C_cur)}</div>
                <div className="col-span-2">Reputation: {(entityPosition.Rep_cur * 100).toFixed(1)}%</div>
              </div>
            </div>
            
            {voterMove && (
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm font-medium text-gray-700 mb-2">Voter Holdings & Token Spent</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                <div><i>X</i><sub>holding</sub>: {voterMove.deltaX}</div>
                <div><i>Y</i><sub>holding</sub>: {voterMove.deltaY}</div>
                <div className="col-span-2">Δ<i>C</i> (Token Cost): {voterMove.deltaC.toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500 text-center py-4">
              <p className="text-lg mb-2">⏳</p>
              <p>Please configure voter buy and entity position settings,</p>
              <p>then click "Confirm + Apply" to see analysis data.</p>
            </div>
          </div>
        )}
      </div>

      {/* 单边增量设置 */}
      <div className="mb-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={allowUnilateralIncrement}
            onChange={(e) => setAllowUnilateralIncrement(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-gray-700">
            Allow Unilateral Increment
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-7">
          If checked, allows points with C &lt; C_cur and (x &gt; x_cur XOR y &gt; y_cur) as valid targets
        </p>
      </div>

      {/* 有效目标点表格 */}
      <div>
        <h3 className="text-md font-medium text-gray-800 mb-4">
          Valid Entity Sell Target Points ({isVoterAndEntityApplied ? validTargets.length : 'N/A'})
        </h3>
        
        {!isVoterAndEntityApplied ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">📋</p>
              <p className="font-medium">Analysis data not available</p>
              <p className="text-sm mt-1">
                Please confirm settings first to see valid target points
              </p>
            </div>
          </div>
        ) : validTargets.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">🎯</p>
              <p className="font-medium">No valid target points found</p>
              <p className="text-sm mt-1">
                Try adjusting settings or enabling unilateral increment option
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-2 py-2 text-left font-medium text-gray-700">Coordinates</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700">Reputation</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700">Token Change</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700">Profit</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700">Balance After Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {validTargets.map((target, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-2 py-2">
                      <div>({target.triple.x}, {target.triple.y})</div>
                      <div className="text-gray-500">C: {Math.round(target.triple.C)}</div>
                    </td>
                    <td className="px-2 py-2">
                      <div>{(target.triple.Rep * 100).toFixed(1)}%</div>
                      <div className={`text-xs ${target.deltaRep >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({target.deltaRep >= 0 ? '+' : ''}{(target.deltaRep * 100).toFixed(1)}%)
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className={`font-medium ${target.tokenEarned >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {target.tokenEarned >= 0 ? '+' : ''}{target.tokenEarned.toFixed(2)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        (C_cur - Ct)
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className={`font-medium ${target.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {target.profit >= 0 ? '+' : ''}{target.profit.toFixed(2)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        (C_cur - Ct - ΔC)
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div><i>X</i><sub>holding</sub>: {target.voterHoldings.X}</div>
                      <div><i>Y</i><sub>holding</sub>: {target.voterHoldings.Y}</div>
                      <div className="text-gray-500 text-xs">
                        (Δ<i>X</i>: {target.deltaX > 0 ? '+' : ''}{target.deltaX}, Δ<i>Y</i>: {target.deltaY > 0 ? '+' : ''}{target.deltaY})
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      {validTargets.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Statistics</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-green-50 p-2 rounded">
              <div className="text-gray-600">Max Profit</div>
              <div className="font-medium text-green-700">
                {Math.max(...validTargets.map(t => t.tokenEarned)).toFixed(2)}
              </div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-gray-600">Avg Profit</div>
              <div className="font-medium text-blue-700">
                {(validTargets.reduce((sum, t) => sum + t.tokenEarned, 0) / validTargets.length).toFixed(2)}
              </div>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="text-gray-600">Rep Increase Points</div>
              <div className="font-medium text-purple-700">
                {validTargets.filter(t => t.deltaRep > 0).length}
              </div>
            </div>
            <div className="bg-orange-50 p-2 rounded">
              <div className="text-gray-600">Rep Decrease Points</div>
              <div className="font-medium text-orange-700">
                {validTargets.filter(t => t.deltaRep < 0).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
