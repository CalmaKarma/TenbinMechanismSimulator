import { create } from 'zustand';
import { 
  PythagoreanTriple, 
  VoterMove, 
  generatePythagoreanTriples,
  calculateVoterMove,
  isValidEntitySellMove,
  getRandomValidMove,
  getRandomEntityPosition,
  createTriple
} from '../utils/pythagorean';

export interface AppState {
  // 设置
  axisLimit: number;
  
  // 投票者购买移动（已确认的状态）
  voterBuy: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    C1: number;
    C2: number;
    Rep1: number;
    Rep2: number;
  };
  
  // 实体当前位置（已确认的状态）
  entityPosition: {
    x_cur: number;
    y_cur: number;
    C_cur: number;
    Rep_cur: number;
  };

  // 临时编辑状态
  tempVoterBuy: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    C1: number;
    C2: number;
    Rep1: number;
    Rep2: number;
  };
  
  tempEntityPosition: {
    x_cur: number;
    y_cur: number;
    C_cur: number;
    Rep_cur: number;
  };
  
  // 分析设置
  allowUnilateralIncrement: boolean;
  
  // 计算结果
  allTriples: PythagoreanTriple[];
  voterMove: VoterMove | null;
  validTargets: Array<{
    triple: PythagoreanTriple;
    voterHoldings: { X: number; Y: number };
    deltaX: number;
    deltaY: number;
    tokenEarned: number;
    profit: number;
    deltaRep: number;
  }>;
  
  // 图表设置
  isInitialized: boolean;
  isVoterAndEntityApplied: boolean;
}

export interface AppActions {
  setAxisLimit: (limit: number) => void;
  initializeChart: () => void;
  setTempVoterBuy: (buy: Partial<AppState['tempVoterBuy']>) => void;
  setTempEntityPosition: (position: Partial<AppState['tempEntityPosition']>) => void;
  setAllowUnilateralIncrement: (allow: boolean) => void;
  randomizeVoterBuy: () => void;
  randomizeEntityPosition: () => void;
  confirmAndApply: () => void;
  discardChanges: () => void;
  updateCalculations: () => void;
  hasPendingEdits: () => boolean;
}

const useAppStore = create<AppState & AppActions>((set, get) => ({
  // 初始状态
  axisLimit: 60,
  voterBuy: {
    x1: 18,
    y1: 24,
    x2: 44,
    y2: 33,
    C1: 30,
    C2: 55,
    Rep1: 0.64,
    Rep2: 0.36
  },
  entityPosition: {
    x_cur: 52,
    y_cur: 39,
    C_cur: 65,
    Rep_cur: 0.36
  },
  tempVoterBuy: {
    x1: 18,
    y1: 24,
    x2: 44,
    y2: 33,
    C1: 30,
    C2: 55,
    Rep1: 0.64,
    Rep2: 0.36
  },
  tempEntityPosition: {
    x_cur: 52,
    y_cur: 39,
    C_cur: 65,
    Rep_cur: 0.36
  },
  allowUnilateralIncrement: false,
  allTriples: [],
  voterMove: null,
  validTargets: [],
  isInitialized: false,
  isVoterAndEntityApplied: false,

  // 动作
  setAxisLimit: (limit: number) => {
    set({ axisLimit: limit });
  },

  initializeChart: () => {
    const { axisLimit } = get();
    const allTriples = generatePythagoreanTriples(axisLimit);
    set({ 
      allTriples, 
      isInitialized: true,
      isVoterAndEntityApplied: false // 重置状态，需要重新应用voter和entity设置
    });
    
    // 初始化后更新计算
    get().updateCalculations();
  },

  setTempVoterBuy: (buy: Partial<AppState['tempVoterBuy']>) => {
    const currentBuy = get().tempVoterBuy;
    const newBuy = { ...currentBuy, ...buy };
    
    // 自动计算C和Rep值
    if ('x1' in buy || 'y1' in buy) {
      const triple1 = createTriple(newBuy.x1, newBuy.y1);
      newBuy.C1 = triple1.C;
      newBuy.Rep1 = triple1.Rep;
    }
    
    if ('x2' in buy || 'y2' in buy) {
      const triple2 = createTriple(newBuy.x2, newBuy.y2);
      newBuy.C2 = triple2.C;
      newBuy.Rep2 = triple2.Rep;
    }
    
    set({ tempVoterBuy: newBuy });
  },

  setTempEntityPosition: (position: Partial<AppState['tempEntityPosition']>) => {
    const currentPosition = get().tempEntityPosition;
    const newPosition = { ...currentPosition, ...position };
    
    // 自动计算C和Rep值
    if ('x_cur' in position || 'y_cur' in position) {
      const triple = createTriple(newPosition.x_cur, newPosition.y_cur);
      newPosition.C_cur = triple.C;
      newPosition.Rep_cur = triple.Rep;
    }
    
    set({ tempEntityPosition: newPosition });
  },

  setAllowUnilateralIncrement: (allow: boolean) => {
    set({ allowUnilateralIncrement: allow });
    get().updateCalculations();
  },

  randomizeVoterBuy: () => {
    const { axisLimit, tempEntityPosition } = get();
    const randomMove = getRandomValidMove(axisLimit, {
      x: tempEntityPosition.x_cur,
      y: tempEntityPosition.y_cur
    });
    
    get().setTempVoterBuy({
      x1: randomMove.from.x,
      y1: randomMove.from.y,
      x2: randomMove.to.x,
      y2: randomMove.to.y
    });
  },

  randomizeEntityPosition: () => {
    const { axisLimit, tempVoterBuy } = get();
    const deltaX = tempVoterBuy.x2 - tempVoterBuy.x1;
    const deltaY = tempVoterBuy.y2 - tempVoterBuy.y1;
    
    const randomPosition = getRandomEntityPosition(axisLimit, {
      x: deltaX,
      y: deltaY
    });
    
    get().setTempEntityPosition({
      x_cur: randomPosition.x,
      y_cur: randomPosition.y
    });
  },

  confirmAndApply: () => {
    const { tempVoterBuy, tempEntityPosition } = get();
    
    // 将临时状态提交到已确认状态
    set({ 
      voterBuy: { ...tempVoterBuy },
      entityPosition: { ...tempEntityPosition },
      isVoterAndEntityApplied: true 
    });
    
    get().updateCalculations();
  },

  discardChanges: () => {
    const { voterBuy, entityPosition } = get();
    
    // 将临时状态重置为已确认状态
    set({ 
      tempVoterBuy: { ...voterBuy },
      tempEntityPosition: { ...entityPosition }
    });
  },

  updateCalculations: () => {
    const { 
      voterBuy, 
      entityPosition, 
      allTriples, 
      allowUnilateralIncrement 
    } = get();
    
    // 计算投票者移动
    const voterMove = calculateVoterMove(
      { x: voterBuy.x1, y: voterBuy.y1 },
      { x: voterBuy.x2, y: voterBuy.y2 }
    );
    
    // 计算有效目标点 - 使用新的实体卖出逻辑
    
    const validTargets = allTriples
      .map(triple => {
        // 使用新的实体卖出有效性检查
        const isValid = isValidEntitySellMove(
          triple, // 实体卖出目标
          { x: entityPosition.x_cur, y: entityPosition.y_cur }, // 当前实体位置
          { deltaX: voterMove.deltaX, deltaY: voterMove.deltaY }, // 投票者持有量
          allowUnilateralIncrement,
          get().axisLimit
        );
        
        if (!isValid) {
          return null;
        }
        
        // 计算交易后的投票者持有量
        const entity_deltaX = entityPosition.x_cur - triple.x; // 实体释放的X代币
        const entity_deltaY = entityPosition.y_cur - triple.y; // 实体释放的Y代币
        const newXHolding = voterMove.deltaX - entity_deltaX; // 交易后X持有量
        const newYHolding = voterMove.deltaY - entity_deltaY; // 交易后Y持有量
        
        // 计算代币变化（实体收益）
        const tokenChange = entityPosition.C_cur - triple.C; // C_cur - Ct
        
        // 计算利润（扣除购买成本）
        const profit = entityPosition.C_cur - triple.C - voterMove.deltaC; // C_cur - Ct - deltaC
        
        const deltaRep = triple.Rep - entityPosition.Rep_cur;
        
        return {
          triple,
          voterHoldings: { X: newXHolding, Y: newYHolding }, // 交易后的持有量
          deltaX: entity_deltaX, // 实体释放的X代币
          deltaY: entity_deltaY, // 实体释放的Y代币
          tokenEarned: tokenChange, // 代币变化（实体收益）
          profit: profit, // 利润（扣除购买成本）
          deltaRep
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.tokenEarned || 0) - (a?.tokenEarned || 0)) as any[];
    
    set({
      voterMove,
      validTargets
    });
  },

  hasPendingEdits: () => {
    const { voterBuy, entityPosition, tempVoterBuy, tempEntityPosition } = get();
    
    // 检查voter buy是否有差异
    const voterBuyChanged = 
      voterBuy.x1 !== tempVoterBuy.x1 ||
      voterBuy.y1 !== tempVoterBuy.y1 ||
      voterBuy.x2 !== tempVoterBuy.x2 ||
      voterBuy.y2 !== tempVoterBuy.y2;
      
    // 检查entity position是否有差异
    const entityPosChanged = 
      entityPosition.x_cur !== tempEntityPosition.x_cur ||
      entityPosition.y_cur !== tempEntityPosition.y_cur;
      
    return voterBuyChanged || entityPosChanged;
  }
}));

export default useAppStore;
