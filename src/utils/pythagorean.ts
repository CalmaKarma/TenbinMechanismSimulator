// 毕达哥拉斯三元组和声誉系统计算工具

export interface PythagoreanTriple {
  x: number; // 不信任票数
  y: number; // 信任票数
  C: number; // 斜边长度 sqrt(x^2 + y^2)
  Rep: number; // 声誉值 y^2 / (x^2 + y^2)
}

export interface VoterMove {
  from: PythagoreanTriple;
  to: PythagoreanTriple;
  deltaX: number; // 花费的X代币
  deltaY: number; // 花费的Y代币
  deltaC: number; // 代币成本差异
  tokenEarned: number; // 获得的代币（可能为负）
}

/**
 * 计算斜边长度和声誉值
 */
export function calculateCAndRep(x: number, y: number): { C: number; Rep: number } {
  const C = Math.sqrt(x * x + y * y);
  const Rep = y * y / (x * x + y * y);
  return { C, Rep };
}

/**
 * 创建毕达哥拉斯三元组
 */
export function createTriple(x: number, y: number): PythagoreanTriple {
  const { C, Rep } = calculateCAndRep(x, y);
  return { x, y, C, Rep };
}

/**
 * 使用欧几里得公式生成毕达哥拉斯三元组
 * 对于整数 m > n > 0:
 * x = m² - n²
 * y = 2mn
 * C = m² + n²
 * 同时包括交换形式 (y, x, C) 和所有倍数 k = 1, 2, 3...
 */
export function generatePythagoreanTriples(axisLimit: number): PythagoreanTriple[] {
  const triples: PythagoreanTriple[] = [];
  const seen = new Set<string>();
  
  // 使用欧几里得公式生成原始三元组
  // 增加搜索范围，因为我们现在允许C > axisLimit
  const maxM = axisLimit; // 更大的搜索范围
  for (let m = 2; m <= maxM; m++) {
    for (let n = 1; n < m; n++) {
      // 基本三元组
      const a = m * m - n * n;
      const b = 2 * m * n;
      // const c = m * m + n * n; // 不需要c值，因为我们只关心x和y
      
      // 生成所有倍数，只要x和y不超过轴限制（忽略C值）
      // 计算k的最大值，确保x和y都在范围内
      const maxKForA = a > 0 ? Math.floor(axisLimit / a) : axisLimit;
      const maxKForB = b > 0 ? Math.floor(axisLimit / b) : axisLimit;
      const maxK = Math.max(maxKForA, maxKForB);
      
      for (let k = 1; k <= maxK; k++) {
        const x1 = k * a;
        const y1 = k * b;
        const x2 = k * b;
        const y2 = k * a;
        
        // 添加 (a, b) 形式 - 只检查x和y是否在范围内
        if (x1 <= axisLimit && y1 <= axisLimit) {
          const key1 = `${x1},${y1}`;
          if (!seen.has(key1)) {
            seen.add(key1);
            triples.push(createTriple(x1, y1));
          }
        }
        
        // 添加 (b, a) 形式（如果不同） - 只检查x和y是否在范围内
        if (x2 <= axisLimit && y2 <= axisLimit && x1 !== x2) {
          const key2 = `${x2},${y2}`;
          if (!seen.has(key2)) {
            seen.add(key2);
            triples.push(createTriple(x2, y2));
          }
        }
      }
    }
  }
  
  // 注意：不添加退化情况（包含零坐标的点），因为我们只要严格正整数坐标
  
  return triples.sort((a, b) => {
    if (a.C !== b.C) return a.C - b.C;
    if (a.x !== b.x) return a.x - b.x;
    return a.y - b.y;
  });
}

/**
 * 检查是否为有效的毕达哥拉斯整数三元组
 */
export function isPythagoreanIntegerTriple(x: number, y: number): boolean {
  const cSquared = x * x + y * y;
  const c = Math.sqrt(cSquared);
  return c === Math.floor(c);
}

/**
 * 计算投票者移动的成本和收益
 */
export function calculateVoterMove(
  from: { x: number; y: number },
  to: { x: number; y: number }
): VoterMove {
  const fromTriple = createTriple(from.x, from.y);
  const toTriple = createTriple(to.x, to.y);
  
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const deltaC = toTriple.C - fromTriple.C;
  
  // 代币获得 = 负的成本差异
  const tokenEarned = -deltaC;
  
  return {
    from: fromTriple,
    to: toTriple,
    deltaX,
    deltaY,
    deltaC,
    tokenEarned
  };
}

/**
 * 检查实体卖出移动是否有效
 * 检查实体从当前位置 (x_cur, y_cur) 移动到卖出目标 (x_target, y_target) 是否有效
 */
export function isValidEntitySellMove(
  entitySellTarget: { x: number; y: number; C: number },
  currentEntity: { x: number; y: number },
  voterHoldings: { deltaX: number; deltaY: number }, // 投票者的持有量
  allowUnilateralIncrement: boolean = false,
  axisLimit: number = 20
): boolean {
  const { x: x_cur, y: y_cur } = currentEntity;
  const { x: x_target, y: y_target, C: C_target } = entitySellTarget;
  const { deltaX: voter_X_holding, deltaY: voter_Y_holding } = voterHoldings;
  // const Cc = Math.sqrt(x_cur * x_cur + y_cur * y_cur); // 暂时不需要
  
  // 1. 轴边界：1 ≤ x_target ≤ axisLimit 和 1 ≤ y_target ≤ axisLimit（严格正数，无零）
  if (x_target < 1 || x_target > axisLimit || y_target < 1 || y_target > axisLimit) {
    return false;
  }
  
  // 2. 三元组检查：(x_target, y_target, C_target) 是毕达哥拉斯三元组
  const expectedC = Math.sqrt(x_target * x_target + y_target * y_target);
  if (Math.abs(C_target - expectedC) > 1e-10) {
    return false;
  }
  
  // 3. 投票者持有量约束（投票者必须有足够的代币来支持这个卖出）
  // 实体卖出需要释放的代币：entity_deltaX = x_cur - x_target, entity_deltaY = y_cur - y_target  
  // 投票者必须有足够的代币来"购买"这些释放的代币
  // 要求：voter_X_holding ≥ (x_cur - x_target) 且 voter_Y_holding ≥ (y_cur - y_target)
  const entity_deltaX = x_cur - x_target; // 实体释放的X代币（如果为正）
  const entity_deltaY = y_cur - y_target; // 实体释放的Y代币（如果为正）
  
  // 只有当实体确实在释放代币时才需要投票者有足够的持有量
  if (entity_deltaX > 0 && voter_X_holding < entity_deltaX) {
    return false;
  }
  if (entity_deltaY > 0 && voter_Y_holding < entity_deltaY) {
    return false;
  }
  
  // 4. 代币收益必须为正（实体移动必须有利）
  // 实体从当前位置(x_cur, y_cur)移动到目标位置(x_target, y_target)的收益
  const C_cur = Math.sqrt(x_cur * x_cur + y_cur * y_cur);
  const entityTokenEarned = C_cur - C_target; // 实体移动的代币收益
  if (entityTokenEarned <= 0) {
    return false;
  }
  
  // 5. 根据单边增量设置的情况分支
  if (!allowUnilateralIncrement) {
    // 情况A - 单边增量禁用（复选框关闭）
    // 不允许坐标增加超过当前值：x_target ≤ x_cur 且 y_target ≤ y_cur
    if (x_target > x_cur || y_target > y_cur) {
      return false;
    }
  } else {
    // 情况B - 单边增量启用（复选框打开）
    // 恰好一个坐标可以增加，另一个不能增加，且必须满足XOR
    const xIncreases = x_target > x_cur;
    const yIncreases = y_target > y_cur;
    
    // 检查XOR：(x_target > x_cur) XOR (y_target > y_cur)
    const xorCondition = xIncreases !== yIncreases; // 严格XOR：一个增加，另一个不增加
    
    if (xIncreases || yIncreases) {
      // 如果有任何坐标增加，必须满足XOR条件
      if (!xorCondition) {
        return false;
      }
      // 当坐标增加时，投票者需要"卖出"代币给实体
      // 这种情况下entity_deltaX或entity_deltaY会是负数，上面的约束3会自动通过
    } else {
      // 两个坐标都没有增加，这在任何情况下都是允许的
      // （只要满足其他条件）
    }
  }
  
  return true;
}

/**
 * 旧的有效性检查函数，为了向后兼容保留
 * @deprecated 使用 isValidEntitySellMove 代替
 */
export function isValidMove(
  voterMove: VoterMove,
  currentEntity: { x: number; y: number },
  allowUnilateralIncrement: boolean = false,
  axisLimit: number = 20
): boolean {
  // 将旧的voterMove逻辑转换为新的实体卖出逻辑
  const entitySellTarget = {
    x: voterMove.to.x,
    y: voterMove.to.y,
    C: voterMove.to.C
  };
  
  const voterHoldings = {
    deltaX: voterMove.deltaX,
    deltaY: voterMove.deltaY
  };
  
  return isValidEntitySellMove(
    entitySellTarget,
    currentEntity,
    voterHoldings,
    allowUnilateralIncrement,
    axisLimit
  );
}

/**
 * 计算投票者在目标点的持有量
 */
export function calculateVoterHoldings(
  targetPoint: { x: number; y: number },
  currentEntity: { x: number; y: number },
  voterMove: VoterMove
): { X: number; Y: number } {
  const X = currentEntity.x - voterMove.deltaX;
  const Y = currentEntity.y - voterMove.deltaY;
  return { X, Y };
}

/**
 * 获取随机有效的移动（确保所有坐标 > 0）
 */
export function getRandomValidMove(
  axisLimit: number,
  currentEntity?: { x: number; y: number }
): { from: { x: number; y: number }; to: { x: number; y: number } } {
  const triples = generatePythagoreanTriples(axisLimit);
  // 过滤掉包含零坐标的三元组（虽然生成器已经不包含它们，但为了安全起见）
  const nonZeroTriples = triples.filter(t => t.x > 0 && t.y > 0);
  
  if (nonZeroTriples.length < 2) {
    // 如果没有足够的非零三元组，返回默认值
    return {
      from: { x: 3, y: 4 },
      to: { x: 5, y: 12 }
    };
  }
  
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const fromIndex = Math.floor(Math.random() * nonZeroTriples.length);
    let toIndex = Math.floor(Math.random() * nonZeroTriples.length);
    
    // 确保不是同一个点
    if (toIndex === fromIndex && nonZeroTriples.length > 1) {
      toIndex = (toIndex + 1) % nonZeroTriples.length;
    }
    
    const from = nonZeroTriples[fromIndex];
    const to = nonZeroTriples[toIndex];
    
    // 确保移动是有效的（非负增量且所有坐标 > 0）
    if (to.x >= from.x && to.y >= from.y && from.x > 0 && from.y > 0 && to.x > 0 && to.y > 0) {
      // 如果提供了当前实体位置，检查约束
      if (currentEntity) {
        const deltaX = to.x - from.x;
        const deltaY = to.y - from.y;
        if (currentEntity.x >= deltaX && currentEntity.y >= deltaY) {
          return {
            from: { x: from.x, y: from.y },
            to: { x: to.x, y: to.y }
          };
        }
      } else {
        return {
          from: { x: from.x, y: from.y },
          to: { x: to.x, y: to.y }
        };
      }
    }
    
    attempts++;
  }
  
  // 如果找不到随机的有效移动，返回一个简单的默认移动
  return {
    from: { x: 3, y: 4 },
    to: { x: 5, y: 12 }
  };
}

/**
 * 获取随机实体位置（确保是有效的毕达哥拉斯三元组且满足约束）
 */
export function getRandomEntityPosition(
  axisLimit: number,
  minDelta: { x: number; y: number } = { x: 0, y: 0 }
): { x: number; y: number } {
  const triples = generatePythagoreanTriples(axisLimit);
  // 过滤掉包含零坐标的三元组，并确保满足最小约束
  const validTriples = triples.filter(t => 
    t.x > 0 && 
    t.y > 0 && 
    t.x >= minDelta.x && 
    t.y >= minDelta.y
  );
  
  if (validTriples.length === 0) {
    // 如果没有找到有效三元组，返回满足最小约束的默认值
    const minX = Math.max(1, minDelta.x);
    const minY = Math.max(1, minDelta.y);
    return { x: minX, y: minY };
  }
  
  // 随机选择一个有效的三元组
  const randomIndex = Math.floor(Math.random() * validTriples.length);
  const selectedTriple = validTriples[randomIndex];
  
  return { x: selectedTriple.x, y: selectedTriple.y };
}
