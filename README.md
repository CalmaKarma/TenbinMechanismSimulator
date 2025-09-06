# Pythagorean Lattice Reputation System Demo

This is an interactive frontend web application demonstrating a Pythagorean lattice-based reputation system mechanism.

## Features

- **Three-Column Layout**: Settings panel, interactive chart, analysis panel
- **Pythagorean Lattice Visualization**: Shows all valid lattice points using Euclid's formula
- **Interactive Chart**: D3.js-based scatter plot with hover details, zoom and pan support
- **Reputation Calculation**: Real-time calculation of reputation values, token costs and earnings
- **Constraint Validation**: Automatic validation of move validity
- **Randomization Functions**: Quick generation of valid test scenarios
- **Stock-Panel-Like Zooming**: Mouse wheel zoom and drag to pan functionality

## Tech Stack

- **React 18** + **TypeScript**
- **TailwindCSS** - Styling framework
- **D3.js** - Data visualization with zoom/pan support
- **Zustand** - State management

## Installation and Running

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Open browser and navigate to `http://localhost:3000`

## Usage Instructions

### 1. Settings Panel (Left)
- **Axis Limit**: Set chart coordinate range
- **Voter Buy**: Configure start position (x1,y1) and target position (x2,y2)
- **Entity Reputation Position**: Set current entity position (x_cur, y_cur)
- **Randomize Buttons**: Quickly generate valid configurations
- **Confirm + Apply**: Apply settings and update analysis

### 2. Chart Canvas (Center)
- **Scatter Plot**: Shows all valid Pythagorean triple points using Euclid's formula
- **Color Coding**:
  - 🔴 Red: Current entity position
  - 🔵 Blue: Voter start position
  - 🟣 Purple: Voter target position
  - 🟡 Gold: Valid target points
  - 🔵 Steel Blue: Regular lattice points
- **Overlays**: 
  - Gray areas: Invalid regions
  - Green circles: Reputation circles
  - Red areas: Forbidden regions
  - Dashed lines: Boundary lines
- **Interactions**: 
  - **Mouse wheel**: Zoom in/out
  - **Click and drag**: Pan around
  - **Hover**: Show detailed tooltip information

### 3. Analysis Panel (Right)
- **Current Status**: Display entity position and voter holdings
- **Unilateral Increment**: Enable special movement rules option
- **Valid Target Table**: List all profitable target points, sorted by earnings
- **Statistics**: Show max profit, average profit and other summary data

## Core Concepts

### Pythagorean Triples (using Euclid's Formula)
- Each lattice point (x,y) corresponds to a reputation position
- Generated using: x = m²-n², y = 2mn, C = m²+n² for integers m > n > 0
- x = Distrust votes, y = Trust votes
- C = √(x² + y²) = Hypotenuse length
- Rep = y² / (x² + y²) = Reputation value

### Voter Movement
- Voters can move from position (x1,y1) to (x2,y2)
- Movement cost ΔC = C2 - C1
- Constraints: x2 ≥ x1, y2 ≥ y1

### Entity Constraints
- Current entity position must satisfy: x_cur ≥ Δx, y_cur ≥ Δy
- This ensures voters have enough tokens to execute the move

### Valid Targets
- Target points must generate positive token earnings
- Optional unilateral increment rule to expand valid target range

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── SettingsPanel.tsx    # Settings panel
│   ├── ChartCanvas.tsx      # D3 chart with zoom/pan
│   └── AnalysisPanel.tsx    # Analysis panel
├── store/              # State management
│   └── useAppStore.ts       # Zustand store
├── utils/              # Utility functions
│   └── pythagorean.ts       # Core calculation logic
├── App.tsx             # Main application component
└── index.tsx           # Entry point
```

### Key APIs

#### Utility Functions
- `generatePythagoreanTriples(limit)`: Generate Pythagorean triples using Euclid's formula
- `calculateVoterMove(from, to)`: Calculate movement cost and earnings
- `isValidMove(move, entity, options)`: Validate movement validity
- `calculateVoterHoldings(target, entity, move)`: Calculate holdings

#### State Management
- Uses Zustand for global state management
- Automatic calculation of C values and Rep values
- Real-time updates of valid target lists

### Chart Interaction Features
- **Zoom**: Mouse wheel to zoom in/out (scale extent: 0.1x to 10x)
- **Pan**: Click and drag to move around the chart
- **Responsive**: All overlays and elements scale and move with zoom/pan
- **Clipping**: Chart content is properly clipped to prevent overflow

## Build and Deploy

```bash
# Build production version
npm run build

# Run tests
npm test
```

## Recent Updates

### ✅ Latest Fixes (v2.6):
1. **Major Conceptual Clarification**: Separated and properly distinguished two different target point concepts:
   - **Voter Buy Target Point**: Point where voter purchases tokens (x₂, y₂) in Settings Panel
   - **Entity Sell Target Point**: Points where entity can sell to (analyzed in Analysis Panel)
   - **Clear labeling**: Updated UI to explicitly distinguish these different concepts
2. **Logic Rewrite**: Completely rewrote validity checking with correct business logic:
   - **New function**: `isValidEntitySellMove()` for entity sell target validation
   - **Correct constraints**: Voter holdings must support entity's token release
   - **Entity perspective**: Analysis now properly focuses on entity's sell opportunities
   - **Backward compatibility**: Maintained old `isValidMove()` function as wrapper
3. **Enhanced Debugging**: Added detailed test cases with step-by-step constraint validation for the corrected logic

### ✅ Previous Fixes (v2.5):
1. **Academic Formula Styling**: Refactored variable naming to use proper academic notation:
   - **Subscripts**: x1 → x₁, y1 → y₁, C1 → C₁, Rep1 → Rep₁, etc.
   - **Italic formatting**: All mathematical variables now display in italics
   - **Holdings terminology**: Changed from "Δx, Δy" to "X_holding, Y_holding" for clarity
2. **Enhanced Unit Testing**: Added comprehensive test cases for edge scenarios:
   - **Additional test points**: (27,36), (40,30), (36,48), (28,45)
   - **Constraint debugging**: Detailed step-by-step validation of each constraint
   - **Holdings floor analysis**: Revealed potential issues with constraint logic
3. **UI Consistency**: Applied academic formatting throughout Settings Panel, Analysis Panel, and tooltips

### ✅ Previous Fixes (v2.4):
1. **Initialized Stage Display**: Fixed tooltips and analysis panel to show only coordinates and C values before "Confirm + Apply", with other fields showing "N/A"
2. **Validity Check Logic Debugging**: Complete rewrite and testing of target point validation:
   - **Fixed token earnings calculation**: Now correctly uses entity position movement (Cc - Ct) instead of voter movement
   - **Comprehensive unit tests**: Added extensive test suite with real-world scenarios
   - **XOR logic verification**: Proper handling of unilateral increment constraints
   - **All test cases pass**: (48,36) valid without unilateral, (40,42) invalid without but valid with unilateral increment
3. **Enhanced User Experience**: Analysis panel shows helpful "waiting" states when data not yet available
4. **Type Safety**: Added Jest type definitions and cleaned up unused variables

### ✅ Previous Fixes (v2.3):
1. **Red Discard Button**: "Discard Changes" button now has red destructive styling and is disabled when no pending edits
2. **Complete Validity Check Rewrite**: Implemented comprehensive target point validation with all business rules:
   - **Axis bounds**: 1 ≤ x,y ≤ axisLimit (strictly positive, no zeros)
   - **Pythagorean triple verification**: Ensures integer hypotenuse
   - **Holdings floor**: Cannot sell more than owned (respects dashed line boundaries)
   - **Positive token earnings**: Only profitable moves shown in analysis
   - **Unilateral increment logic**: Proper XOR handling when enabled
3. **Pending Edits Detection**: Discard button only enabled when there are uncommitted changes
4. **Cleaner Point Visualization**: Only gold points for valid targets (removed orange points as all valid targets now require positive earnings)

### ✅ Previous Fixes (v2.2):
1. **Settings Panel Buffering**: Changes are now buffered - chart only updates when "Confirm + Apply" is clicked
2. **Discard Changes**: Added "Discard Changes" button to reset temporary edits back to last confirmed state
3. **Validity Check Fix**: Corrected target point validity logic - now shows all valid target points in analysis panel
4. **Enhanced Point Visualization**: 
   - Gold points: Profitable moves (earn tokens)
   - Orange points: Valid moves that cost tokens
   - Improved legend and color coding

### ✅ Previous Fixes (v2.1):
1. **Chart Axis Fix**: Chart axes now stay fixed from 0 → axisLimit regardless of data points
2. **Pythagorean Point Generation**: Include all valid triples where x ≤ axisLimit and y ≤ axisLimit, even if C > axisLimit
3. **Hypotenuse Display**: C values now display as integers (rounded from floating point)
4. **Reputation Display**: Rep values now display as percentages (e.g., 47.6% instead of 0.476)
5. **Apply Button Behavior**: "Apply" now only shows scatter points; overlays appear after "Confirm + Apply"
6. **Zero Coordinates**: Excluded all points with x=0 or y=0 from generation

### ✅ Previous Fixes (v2.0):
1. **Settings Panel Layout**: Reorganized Voter Buy and Entity Position sections with each point's 4 attributes (x, y, C, Rep) displayed in a single row with visual separation
2. **Randomization Improvements**: 
   - All generated coordinates are now strictly > 0 (no zeros allowed)
   - Entity position randomization respects Δx/Δy constraints
   - Generated positions are guaranteed to be valid Pythagorean triples
3. **Chart Boundaries**: Zoom and pan are now constrained within [0, axis limit] range
4. **Responsive Design**: Chart canvas automatically resizes with window/container changes
5. **Enhanced Visuals**: 
   - Circles now have visible dashed borders (green outlines)
   - Gray constraint areas are darker and more visible
   - Better contrast for all overlay elements

### ✅ Previous Updates (v1.0):
1. **Language**: All UI text switched from Chinese to English
2. **Valid Points**: Uses Euclid's formula to generate only valid Pythagorean triples (x² + y² = C²)
3. **Chart Interaction**: Added stock-panel-like zoom and pan functionality with D3.js

### 📊 Chart Features:
- Mouse wheel zoom (0.5x to 10x scale) with bounded limits
- Click and drag to pan with coordinate constraints
- All elements (points, lines, circles, shading) respond to zoom/pan
- Proper axis updates and grid scaling
- Maintained tooltip functionality during interactions
- Responsive canvas that adapts to window resizing

## License

MIT License
