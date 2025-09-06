# Pythagorean Lattice Reputation System

An interactive web application demonstrating a stake-based reputation mechanism using Pythagorean triples. This system models how entities can move between reputation positions by paying token costs, with real-time visualization and analysis.

## 🎯 Features

- **Interactive 3-Panel Layout**: Settings, Chart, and Analysis panels
- **D3.js Powered Visualization**: Interactive scatter plot with zoom/pan functionality
- **Pythagorean Triple Generation**: Uses Euclid's formula for accurate triple generation
- **Real-time Validity Checking**: Dynamic analysis of valid sell targets
- **Responsive Design**: Built with TailwindCSS for modern UI
- **TypeScript + React**: Type-safe development with modern React patterns

## 🚀 Live Demo

[View Live Demo on Vercel](https://tenbin-mechanism-simulator.vercel.app)

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS
- **Charts**: D3.js
- **State Management**: Zustand
- **Build Tool**: Create React App
- **Deployment**: Vercel

## 📊 How It Works

### Core Concept
- Each point `(x, y, C)` represents a **Pythagorean triple** where:
  - `x` = Distrust votes
  - `y` = Trust votes  
  - `C = √(x² + y²)` = Total tokens staked
  - **Reputation** = `y / C` (trust ratio)

### User Interaction
1. **Voter Buy**: Move from start point to target point (defines holdings)
2. **Entity Position**: Current reputation location of the entity
3. **Sell Analysis**: Analyze valid sell targets with profit calculations

### Key Calculations
- **Token Change**: `C_cur - Ct` (entity movement benefit)
- **Profit**: `C_cur - Ct - ΔC` (net profit after purchase costs)
- **Holdings**: Updated voter holdings after transactions

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/CalmaKarma/TenbinMechanismSimulator.git

# Navigate to project directory
cd TenbinMechanismSimulator

# Install dependencies
npm install

# Start development server
npm start
```

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 📁 Project Structure

```
src/
├── components/
│   ├── AnalysisPanel.tsx    # Analysis and results display
│   ├── ChartCanvas.tsx      # D3.js interactive chart
│   └── SettingsPanel.tsx    # Configuration inputs
├── store/
│   └── useAppStore.ts       # Zustand state management
├── utils/
│   ├── pythagorean.ts       # Core utility functions
│   └── pythagorean.test.ts  # Unit tests
└── App.tsx                  # Main application component
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

The project includes comprehensive unit tests for:
- Pythagorean triple generation
- Validity checking algorithms
- Profit calculations
- Edge cases and integration scenarios

## 🚀 Deployment

This project is configured for easy deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Create React App configuration
3. Deploy with zero configuration needed

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Contact

- GitHub: [@CalmaKarma](https://github.com/CalmaKarma)
- Repository: [TenbinMechanismSimulator](https://github.com/CalmaKarma/TenbinMechanismSimulator)