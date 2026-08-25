# Catalyst AI Production Pipeline

## Overview
Catalyst Content OS orchestrates specialized Claude AI agents to produce editorial motion graphics from raw concepts without human intervention.

---

## Agent Hierarchy

### 1. `ContentDirector` (`src/lib/ai/claude/agents/ContentDirector.ts`)
- **Input**: User prompt, research report, brand voice.
- **Output**: 7-beat documentary script with hook, data surge, geographic context, and payoff.

### 2. `StoryboardDirector` (`src/lib/ai/claude/agents/StoryboardDirector.ts`)
- **Input**: Script and brand DNA.
- **Output**: 7 timed motion graphics scenes with camera directions, animations, and graphic layout props.

### 3. `ProductionAgent` (`src/lib/ai/claude/agents/ProductionAgent.ts`)
- **Input**: Storyboard scenes and script.
- **Actions**:
  1. Requests OpenAI TTS voiceover.
  2. Extracts Whisper word timestamps.
  3. Rescales scene frame lengths to match audio pacing.
  4. Validates and generates strict Zod `VideoSpec`.

### 4. `ProductionAssistant` (`src/lib/ai/claude/agents/ProductionAssistant.ts`)
- **Interactive Editing**:
  - `scene_update`: Modify props/text of a specific scene.
  - `scene_reorder`: Rearrange timeline structure.
  - `scene_add`: Insert newly generated scenes.
