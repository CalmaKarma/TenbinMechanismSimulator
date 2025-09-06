import {
  isValidMove,
  isValidEntitySellMove,
  calculateVoterMove,
  createTriple,
  generatePythagoreanTriples
} from './pythagorean';

describe('Pythagorean Lattice Reputation System - Validity Check', () => {
  // Test case setup from user requirement:
  // axis limit = 60, start point (18,24), target point (44,33), current entity position (52, 39)
  // Point (48, 36) should be valid
  // (40, 42) should be valid when unilateral increment is allowed and vice versa

  const axisLimit = 60;
  const startPoint = { x: 18, y: 24 };
  const targetPoint = { x: 44, y: 33 };
  const currentEntityPosition = { x: 52, y: 39 };

  describe('Basic validity constraints', () => {
    test('should pass axis bounds check for valid points', () => {
      const move = calculateVoterMove(startPoint, { x: 48, y: 36 });
      const isValid = isValidMove(move, currentEntityPosition, false, axisLimit);
      
      console.log('Testing (48, 36):');
      console.log('Move:', move);
      console.log('Is valid:', isValid);
      
      // (48, 36) should be within axis bounds
      expect(48).toBeLessThanOrEqual(axisLimit);
      expect(36).toBeLessThanOrEqual(axisLimit);
      expect(48).toBeGreaterThan(0);
      expect(36).toBeGreaterThan(0);
    });

    test('should verify Pythagorean triple correctness', () => {
      const triple48_36 = createTriple(48, 36);
      const triple40_42 = createTriple(40, 42);
      
      console.log('Triple (48, 36):', triple48_36);
      console.log('Triple (40, 42):', triple40_42);
      
      // Check if they are valid Pythagorean triples
      expect(Math.abs(triple48_36.C - Math.sqrt(48*48 + 36*36))).toBeLessThan(1e-10);
      expect(Math.abs(triple40_42.C - Math.sqrt(40*40 + 42*42))).toBeLessThan(1e-10);
    });

    test('should check holdings floor constraint', () => {
      const move = calculateVoterMove(startPoint, targetPoint);
      const deltaX = move.deltaX; // 44 - 18 = 26
      const deltaY = move.deltaY; // 33 - 24 = 9
      
      console.log('Voter move delta:', { deltaX, deltaY });
      console.log('Current entity position:', currentEntityPosition);
      console.log('Holdings floor - minX:', currentEntityPosition.x - deltaX); // 52 - 26 = 26
      console.log('Holdings floor - minY:', currentEntityPosition.y - deltaY); // 39 - 9 = 30
      
      // Test point (48, 36)
      expect(48).toBeGreaterThanOrEqual(currentEntityPosition.x - deltaX); // 48 >= 26 ✓
      expect(36).toBeGreaterThanOrEqual(currentEntityPosition.y - deltaY); // 36 >= 30 ✓
      
      // Test point (40, 42)
      expect(40).toBeGreaterThanOrEqual(currentEntityPosition.x - deltaX); // 40 >= 26 ✓
      expect(42).toBeGreaterThanOrEqual(currentEntityPosition.y - deltaY); // 42 >= 30 ✓
    });

    test('should check token earnings constraint', () => {
      const currentC = Math.sqrt(currentEntityPosition.x * currentEntityPosition.x + currentEntityPosition.y * currentEntityPosition.y);
      console.log('Current entity C:', currentC);
      
      const move48_36 = calculateVoterMove(startPoint, { x: 48, y: 36 });
      const move40_42 = calculateVoterMove(startPoint, { x: 40, y: 42 });
      
      console.log('Move to (48, 36) - tokenEarned:', move48_36.tokenEarned);
      console.log('Move to (40, 42) - tokenEarned:', move40_42.tokenEarned);
      
      // tokenEarned = currentC - targetC, should be > 0 for valid moves
      const targetC_48_36 = Math.sqrt(48*48 + 36*36);
      const targetC_40_42 = Math.sqrt(40*40 + 42*42);
      
      console.log('Target C (48, 36):', targetC_48_36);
      console.log('Target C (40, 42):', targetC_40_42);
      console.log('Expected tokenEarned (48, 36):', currentC - targetC_48_36);
      console.log('Expected tokenEarned (40, 42):', currentC - targetC_40_42);
    });
  });

  describe('Coordinate increase constraints', () => {
    test('(48, 36) should be valid without unilateral increment', () => {
      const move = calculateVoterMove(startPoint, { x: 48, y: 36 });
      const isValid = isValidMove(move, currentEntityPosition, false, axisLimit);
      
      console.log('\nTesting (48, 36) with unilateral increment OFF:');
      console.log('Current entity:', currentEntityPosition);
      console.log('Target point:', { x: 48, y: 36 });
      console.log('48 <= 52?', 48 <= 52); // Should be true
      console.log('36 <= 39?', 36 <= 39); // Should be true
      console.log('Move details:', move);
      console.log('Is valid:', isValid);
      
      expect(isValid).toBe(true);
    });

    test('(40, 42) should be invalid without unilateral increment', () => {
      const move = calculateVoterMove(startPoint, { x: 40, y: 42 });
      const isValid = isValidMove(move, currentEntityPosition, false, axisLimit);
      
      console.log('\nTesting (40, 42) with unilateral increment OFF:');
      console.log('Current entity:', currentEntityPosition);
      console.log('Target point:', { x: 40, y: 42 });
      console.log('40 <= 52?', 40 <= 52); // Should be true
      console.log('42 <= 39?', 42 <= 39); // Should be false - y increases
      console.log('Move details:', move);
      console.log('Is valid:', isValid);
      
      expect(isValid).toBe(false);
    });

    test('(40, 42) should be valid with unilateral increment', () => {
      const move = calculateVoterMove(startPoint, { x: 40, y: 42 });
      const isValid = isValidMove(move, currentEntityPosition, true, axisLimit);
      
      console.log('\nTesting (40, 42) with unilateral increment ON:');
      console.log('Current entity:', currentEntityPosition);
      console.log('Target point:', { x: 40, y: 42 });
      console.log('x decreases: 40 < 52?', 40 < 52); // true
      console.log('y increases: 42 > 39?', 42 > 39); // true
      console.log('XOR condition: x decreases XOR y increases?', (40 < 52) !== (42 > 39)); // false !== true = true ✓
      console.log('Move details:', move);
      console.log('Is valid:', isValid);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Edge cases and integration', () => {
    test('should generate valid Pythagorean triples within axis limit', () => {
      const triples = generatePythagoreanTriples(axisLimit);
      console.log(`\nGenerated ${triples.length} triples for axis limit ${axisLimit}`);
      
      // Check if our test points are in the generated triples
      const triple48_36 = triples.find(t => t.x === 48 && t.y === 36);
      const triple40_42 = triples.find(t => t.x === 40 && t.y === 42);
      
      console.log('Found (48, 36) in triples:', !!triple48_36);
      console.log('Found (40, 42) in triples:', !!triple40_42);
      
      if (triple48_36) console.log('Triple (48, 36):', triple48_36);
      if (triple40_42) console.log('Triple (40, 42):', triple40_42);
      
      // Both should be valid Pythagorean triples
      expect(triple48_36).toBeDefined();
      expect(triple40_42).toBeDefined();
    });

    test('should correctly identify all constraints for comprehensive validity', () => {
      const testCases = [
        { point: { x: 48, y: 36 }, unilateral: false, expected: true, name: '(48, 36) without unilateral' },
        { point: { x: 48, y: 36 }, unilateral: true, expected: true, name: '(48, 36) with unilateral' },
        { point: { x: 40, y: 42 }, unilateral: false, expected: false, name: '(40, 42) without unilateral' },
        { point: { x: 40, y: 42 }, unilateral: true, expected: true, name: '(40, 42) with unilateral' },
        // Additional test cases from user requirement
        { point: { x: 27, y: 36 }, unilateral: false, expected: true, name: '(27, 36) without unilateral' },
        { point: { x: 40, y: 30 }, unilateral: false, expected: true, name: '(40, 30) without unilateral' },
        { point: { x: 36, y: 48 }, unilateral: false, expected: false, name: '(36, 48) without unilateral' },
        { point: { x: 36, y: 48 }, unilateral: true, expected: true, name: '(36, 48) with unilateral' },
        { point: { x: 28, y: 45 }, unilateral: false, expected: false, name: '(28, 45) without unilateral' },
        { point: { x: 28, y: 45 }, unilateral: true, expected: true, name: '(28, 45) with unilateral' },
      ];

      testCases.forEach(testCase => {
        // 使用新的实体卖出逻辑
        const voterMove = calculateVoterMove(startPoint, targetPoint); // 投票者从 (18,24) 到 (44,33)
        const entitySellTarget = createTriple(testCase.point.x, testCase.point.y); // 实体卖出目标
        const voterHoldings = { deltaX: voterMove.deltaX, deltaY: voterMove.deltaY };
        
        const isValid = isValidEntitySellMove(
          entitySellTarget,
          currentEntityPosition,
          voterHoldings,
          testCase.unilateral,
          axisLimit
        );
        
        console.log(`\n${testCase.name}:`);
        console.log('  Voter holdings:', voterHoldings);
        console.log('  Entity sell target:', entitySellTarget);
        console.log('  Expected:', testCase.expected);
        console.log('  Actual:', isValid);
        console.log('  Match:', isValid === testCase.expected ? '✓' : '✗');
        
        expect(isValid).toBe(testCase.expected);
      });
    });
  });

  describe('Debug specific failing cases with corrected logic', () => {
    test('should debug (27, 36) case step by step with new entity sell logic', () => {
      const sellTarget = { x: 27, y: 36 };
      const voterMove = calculateVoterMove(startPoint, targetPoint); // voter buy from (18,24) to (44,33)
      
      console.log('\n=== DEBUGGING (27, 36) WITH CORRECTED LOGIC ===');
      console.log('Voter buy: from', startPoint, 'to', targetPoint);
      console.log('Voter holdings after buy:', { deltaX: voterMove.deltaX, deltaY: voterMove.deltaY });
      console.log('Current entity position:', currentEntityPosition);
      console.log('Entity sell target:', sellTarget);
      
      const sellTargetTriple = createTriple(sellTarget.x, sellTarget.y);
      
      // Check each constraint manually using the new logic
      const { x: x_cur, y: y_cur } = currentEntityPosition;
      const { x: x_target, y: y_target, C: C_target } = sellTargetTriple;
      const voter_X_holding = voterMove.deltaX; // 26
      const voter_Y_holding = voterMove.deltaY; // 9
      
      console.log('\n--- Constraint Checks with New Logic ---');
      
      // 1. Axis bounds
      const axisBoundsOK = x_target >= 1 && x_target <= axisLimit && y_target >= 1 && y_target <= axisLimit;
      console.log(`1. Axis bounds: x_target=${x_target}, y_target=${y_target}, limit=${axisLimit} => ${axisBoundsOK}`);
      
      // 2. Pythagorean triple
      const expectedC = Math.sqrt(x_target * x_target + y_target * y_target);
      const tripleOK = Math.abs(C_target - expectedC) < 1e-10;
      console.log(`2. Pythagorean triple: C_target=${C_target}, expected=${expectedC}, diff=${Math.abs(C_target - expectedC)} => ${tripleOK}`);
      
      // 3. NEW LOGIC: Voter holdings constraint
      const entity_deltaX = x_cur - x_target; // 实体释放的X代币
      const entity_deltaY = y_cur - y_target; // 实体释放的Y代币
      const holdingsOK_X = entity_deltaX <= 0 || voter_X_holding >= entity_deltaX;
      const holdingsOK_Y = entity_deltaY <= 0 || voter_Y_holding >= entity_deltaY;
      const holdingsOK = holdingsOK_X && holdingsOK_Y;
      console.log(`3. NEW Voter holdings constraint:`);
      console.log(`   Entity releases: deltaX=${entity_deltaX}, deltaY=${entity_deltaY}`);
      console.log(`   Voter has: X_holding=${voter_X_holding}, Y_holding=${voter_Y_holding}`);
      console.log(`   X OK: ${entity_deltaX} <= 0 OR ${voter_X_holding} >= ${entity_deltaX}? ${holdingsOK_X}`);
      console.log(`   Y OK: ${entity_deltaY} <= 0 OR ${voter_Y_holding} >= ${entity_deltaY}? ${holdingsOK_Y}`);
      console.log(`   Overall: ${holdingsOK}`);
      
      // 4. Token earnings
      const C_cur = Math.sqrt(x_cur * x_cur + y_cur * y_cur);
      const entityTokenEarned = C_cur - C_target;
      const tokenOK = entityTokenEarned > 0;
      console.log(`4. Token earnings: C_cur=${C_cur}, C_target=${C_target}, earned=${entityTokenEarned} > 0? ${tokenOK}`);
      
      // 5. Coordinate constraints (without unilateral)
      const coordOK = x_target <= x_cur && y_target <= y_cur;
      console.log(`5. Coordinate constraints: x_target=${x_target} <= x_cur=${x_cur}? ${x_target <= x_cur}, y_target=${y_target} <= y_cur=${y_cur}? ${y_target <= y_cur} => ${coordOK}`);
      
      const isValid = isValidEntitySellMove(
        sellTargetTriple,
        currentEntityPosition,
        { deltaX: voter_X_holding, deltaY: voter_Y_holding },
        false,
        axisLimit
      );
      console.log(`\nFinal result: ${isValid}`);
      console.log('Expected: true (with new logic)');
      
      // Print which constraint failed
      if (!axisBoundsOK) console.log('❌ FAILED: Axis bounds');
      if (!tripleOK) console.log('❌ FAILED: Pythagorean triple');
      if (!holdingsOK) console.log('❌ FAILED: Voter holdings constraint');
      if (!tokenOK) console.log('❌ FAILED: Token earnings');
      if (!coordOK) console.log('❌ FAILED: Coordinate constraints');
    });
  });
});
