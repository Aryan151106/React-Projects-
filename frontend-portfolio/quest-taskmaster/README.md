# Quest Taskmaster ⚔️🎮

A gamified task manager with retro 8-bit pixel art RPG theme. Turn your daily tasks into epic monster battles!

## Features

### Core Gameplay
- **Tasks as Monsters**: Every task spawns a monster you must defeat by completing it
- **Dynamic Difficulty**: Easy → Medium → Hard → Boss levels with increasing rewards
- **AI Gamemaster**: Intelligent excuse analyzer that judges your reasons for failed tasks
- **Progress System**: Level up, earn gold, maintain streaks

### Game Modes
- **Solo Quest**: Personal productivity journey
- **Duo Partners**: Team up with an accountability partner
- **Squad Mode**: Form teams of up to 4 heroes

### Social Features
- Friend system with online status
- Real-time chat between party members
- Task sharing and tracking across team members

### Character Customization
- Unlock hats, outfits, and accessories
- Color palettes to personalize your hero

### AI Excuse Analyzer
The AI Gamemaster analyzes your excuses when you fail a task:
- **Legitimate excuses** (health, family, emergencies) → Reduced/no damage
- **Lazy excuses** ("didn't feel like it") → Critical hit from monster
- **Rest Day** option for valid personal/health reasons

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: TailwindCSS with custom RPG theme
- **State Management**: Zustand with persistence
- **Icons**: Lucide React
- **Real-time**: Socket.io client (ready for backend)
- **Assets**: PixelLab MCP integration

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
src/
├── components/
│   ├── PlayerHUD.jsx        # Player stats display
│   ├── MonsterBattle.jsx    # Task/monster battle card
│   ├── TaskCreator.jsx      # New task form
│   ├── ExcuseModal.jsx      # AI excuse analyzer modal
│   ├── ChatPanel.jsx        # Real-time chat UI
│   ├── PartyPanel.jsx       # Party/friends sidebar
│   ├── CharacterCustomizer.jsx
│   └── GameModeSelector.jsx
├── store/
│   ├── gameStore.js         # Player state & progression
│   ├── taskStore.js         # Tasks & monsters
│   └── socialStore.js       # Friends, parties, chat
├── utils/
│   └── excuseAnalyzer.js    # AI excuse analysis logic
├── App.jsx
├── index.css                # TailwindCSS + RPG theme
└── main.jsx
```

## Monster Types

| Difficulty | HP | Attack | EXP | Gold |
|------------|-----|--------|-----|------|
| Easy 🟢 | 30 | 5 | 25 | 10 |
| Medium 🟡 | 60 | 15 | 50 | 25 |
| Hard 🟠 | 100 | 30 | 100 | 50 |
| Boss 🔴 | 200 | 50 | 300 | 150 |

---

*Defeat your tasks. Level up your life.* ⚔️
