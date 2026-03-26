# AIME: Application Architecture & Feature Analysis

## 1. Introduction & Philosophy

AIME (Artificial Intellect Musoikos Environ) is a web-based creative suite tailored for writers, world-builders, and Game Masters. Its core design philosophy is summarized as **"AI Craft over AI Slop."** This means AIME is explicitly not a single-prompt, one-click generator. Instead, it provides a highly structured environment where the human creator meticulously defines the foundational elements of their universe (the "Craft") and uses those elements as dense contextual anchors to guide the AI's outputs. The result is narrative consistency and highly personalized content that aligns with the creator's precise vision.

### Technical Architecture
AIME is built with a lightweight, privacy-focused architecture:
*   **Frontend**: Vanilla JavaScript, HTML5, and CSS3. The application is completely client-side, using standard DOM manipulation without heavy frameworks like React or Vue.
*   **Backend**: A simple Python Flask server (primarily for running tests and serving static files locally during development).
*   **AI Integration**: Direct-to-API client-side calls. AIME does not route prompts through a central proxy server. Users input their own Google Gemini API key via a local settings modal, and the frontend JS makes direct `fetch` requests to the Gemini API. This ensures maximum privacy for the creator's intellectual property.
*   **Storage**: AIME utilizes a local file system approach rather than a centralized database. Creations are saved directly to the user's machine as specialized text or JSON files, allowing creators full ownership and offline control of their assets.

---

## 2. The Writer Module

The Writer Module is AIME's flagship environment for novelists and world-builders. It consists of a central writing environment (The Composer) supported by a suite of structured world-building tools (The Element Forge).

### 2.1. The Writer Hub (`pages/writer.html`)
The hub serves as the central navigation point for the Writer Module. It presents a grid of "hub cards" linking to the Composer and the individual Element pages.

### 2.2. The Element Forge (World-Building Pages)
The Element Forge is where creators build the "lore bible" of their project. Each Element page features a comprehensive, multi-tabbed form designed to extract granular details about specific aspects of the fictional world.

The available Elements are:
*   **Universe Crucible (`universe.html`)**: Defines the highest-level realities—cosmology, metaphysics, universal laws, and overarching themes.
*   **World Anvil (`world.html`)**: Details specific planets or realms, including physical geography, global history, and dominant systems.
*   **Setting Architect (`setting.html`)**: Focuses on specific, localized environments (cities, forests, buildings) with tabs for atmosphere, local flora/fauna, and key locations.
*   **Philosophy Scribe (`philosophy.html`)**: Details belief systems, religions, epistemology, and socio-political doctrines.
*   **Faction Shaper (`faction.html`)**: Defines organizations, their ideologies, assets, foreign relations, and internal hierarchies.
*   **Technology Forge (`technology.html`)**: Outlines specific technologies, from magical artifacts to sci-fi machinery, covering mechanics, origin, and societal impact.
*   **Species Creator (`species.html`)**: Designs lifeforms, detailing their biology, psychology, ecology, and unique abilities.
*   **Persona Maker (`persona.html`)**: A deep dive into character creation, covering physical profile, psychological makeup, backstory, and narrative arcs.
*   **Scene Builder (`scene.html`)**: Constructs the specific narrative moments, detailing the immediate setting, sensory details, participating characters, and plot pacing.

**User Workflow on Element Pages:**
1.  The user fills out the highly specific input fields across various tabs.
2.  The user can select "Guidance Gems" (stylistic tags like "Dark Fantasy" or "Fast-Paced") to influence the AI's tone.
3.  Clicking "Generate" triggers the AI to synthesize the user's inputs into cohesive, descriptive prose, which populates the main editing canvas.
4.  The user can then use the "Iterate" function to refine the generated text with targeted instructions, or manually edit the canvas.
5.  Finally, the Element is saved locally as an Asset (e.g., a `.persona` or `.faction` file) to be referenced later.

### 2.3. The Composer (`pages/compose.html`)
The Composer is a multi-stage writing environment that leverages the Elements created in the Forge to write actual narratives. It guides the user through three stages:
1.  **Brainstorm**: The user inputs a core idea, imports relevant world-building Assets for context, and generates high-level concepts (Loglines and summaries).
2.  **Outline**: The user selects a concept and works with the AI to generate a sequence of structured plot points.
3.  **Draft**: The AI generates a full prose draft based on the structured outline and the imported contextual Assets.

---

## 3. The Scenario Module

The Scenario Module adapts AIME's core architecture specifically for Tabletop Roleplaying Game (TTRPG) Game Masters. It provides tools to design complete, playable adventures.

### 3.1. The Scenario Hub (`pages/sg-hub.html`)
Similar to the Writer Hub, this page provides navigation to the Scenario Composer and the specific TTRPG component builders.

### 3.2. Scenario Components
These pages function identically to the Writer's Element Forge but are tailored for RPG mechanics and scenario design:
*   **Story Arc (`sg-storyarc.html`)**: The overarching narrative of the campaign.
*   **Adventure (`sg-adventure.html`)**: A self-contained quest with specific hooks, stakes, and resolutions.
*   **NPC (`sg-npc.html`)**: Non-player characters with specific roles, secrets, and motivations.
*   **Location (`sg-location.html`)**: Playable areas with atmosphere, sights, and potential encounters.
*   **Group (`sg-group.html`)**: Factions and organizations specific to the adventure.
*   **Encounter (`sg-encounter.html`)**: Specific challenges (combat, social, puzzle) with tactical setups.
*   **Item (`sg-item.html`)**: Loot, artifacts, or mundane items with mechanical properties.
*   **Clue (`sg-clue.html`)**: Information pieces necessary for investigation, including where they are found.
*   **Map (`sg-map.html`)**: Spatial layouts linking to other components.
*   **Handout (`sg-handout.html`)**: Player-facing documents or images.

### 3.3. The Scenario Composer (`pages/sg-module.html`)
The Module Composer is where the GM assembles the individual components into a cohesive, playable document.
1.  **Brainstorm**: Generates high-level adventure concepts based on a core idea and imported lore.
2.  **Structure**: The GM works with the AI to outline the specific flow of the adventure (e.g., Scene 1: The Tavern Hook -> Scene 2: The Goblin Ambush).
3.  **Write**: Generates the detailed, descriptive text for the module, incorporating imported NPC stats, Location descriptions, and Encounter mechanics to create a final document ready for the table.

---

## 4. The Asset System Deep Dive

The true power of AIME lies in its Asset System, which solves the "blank page syndrome" and the AI "hallucination" problem by providing rigid, user-defined context.

### 4.1. Saving and Loading Formats
AIME uses two primary file formats for its local storage system, handled by the `element-bundle.js` and `writer-bundle.js` scripts:
*   **JSON Prompts (e.g., `.personaprompt`, `.writerprompt`)**: These files serialize the exact state of the UI form fields. When loaded, they repopulate the input boxes, allowing a user to pick up exactly where they left off in defining an element's traits.
*   **Markdown Content (e.g., `.persona`, `.faction`, `.draft`)**: These files save the final, generated (and user-edited) prose from the main canvas. These are the finalized "Assets" used as context for future generations.

### 4.2. Context Injection via `craftSuperPrompt`
When a user clicks "Generate" in the Composer (or while iterating on an Element), the JavaScript triggers the `craftSuperPrompt` function. This function dynamically constructs the prompt sent to the LLM by combining several elements:
1.  **System Prompt**: Establishes the AI's persona (e.g., "You are an AI creative partner specializing in storytelling...").
2.  **Task Instruction**: Tells the AI what specifically to do (e.g., "Generate a new plot point...").
3.  **Current Form Data**: Injects the user's specific inputs from the current page.
4.  **Guidance Gems**: Appends stylistic tags (e.g., "Tone: Dark, Pacing: Fast-paced").
5.  **Contextual Assets**: This is the critical step. The function iterates through the `loadedAssets` array (the `.persona`, `.world`, etc., files the user has imported via the side column). It reads the raw content of these files and appends them to the prompt under a `--- CONTEXTUAL ASSETS ---` header.

By injecting these Assets directly into the context window, the AI is forced to reference the user's pre-defined rules, character histories, and world logic, resulting in generations that are deeply integrated into the creator's bespoke universe. In the Scenario Module, users can even assign "Importance" weights or "Director's Notes" to specific assets, further fine-tuning how the AI interprets the injected lore.