# Jeopardy PRD

## Overview

Jeopardy is a competitive trivia game where players answer questions across various categories to earn points. The game simulates the classic TV show format in a digital environment.

## Game Setup

### Player Management
- Support 1-6 players per game
- Each player must have:
  - Unique display name
  - Current score (starting at 0)
  - Turn indicator
  - Avatar (optional)
- One player must be designated as the host/game master

### Board Configuration
ies displayed horizontally
- 5 questions per category displayed vertically
- Standard point values: $200, $400, $600, $800, $1000
- Visual indication for:
  - Available questions
  - Answered questions
  - Currently selected question

## Gameplay Mechanics

### Round Structure
1. **First Round**
   - Standard point values
   - Regular gameplay

2. **Double Jeopardy Round**
   - Point values doubled
   - Two "Daily Double" hidden questions
   - Same category/question structure as first round

3. **Final Jeopardy**
   - Single question for all players
   - Players wager current points
   - All players answer simultaneously

### Turn Management
- First player selected randomly
- Turns proceed clockwise
- Correct answer maintains control
- Incorrect answer opens question to other players
- 30-second timer for each answer




### Scoring System
- Correct answers: Add point value
- Incorrect answers: Subtract point value
- Daily Double:
  - Player can wager up to their total points
  - Minimum wager of $5
  - Maximum wager of $1000 (first round) or $2000 (second round)

## Technical Requirements

### Question Generation
- API Integration:
  - Fetch categories and questions from external API
  - Backup question database for offline play

### User Interface
- Responsive design for desktop/tablet
- Game board view
- Player scoreboard
- Timer display
- Answer input system:
  - Text input for answers
  - Fuzzy matching for answer validation
  - Support for multiple acceptable answers

### Game State Management
- Save/resume game functionality
- Track game statistics
- History of answers and scores
- Support for disconnection/reconnection

## Accessibility Requirements
- Keyboard navigation
- Adjustable timer settings
- Customizable text size

## Error Handling
- Connection loss recovery
- Invalid answer protection
- Score calculation verification
- Player dropout handling

## Audio/Visual Features
### Sound Effects
- Buzzer sounds for player responses
- Timer warning sound
- Daily Double reveal jingle
- Correct/incorrect answer sounds
- Final Jeopardy theme music
- Volume controls for all audio elements

### Visual Animations
- Question reveal animations
- Score change animations
- Daily Double reveal effect
- Timer countdown visualization
- Winner celebration effects
