# AIME APPLICATION ANALYSIS: FEATURE OVERVIEW AND USER GUIDE

## 1. HIGH-LEVEL OVERVIEW

### Philosophy: AI Craft over AI Slop
AIME (Artificial Intellect Musoikos Environ) is a web-based creative suite for writers and world-builders. Its core philosophy is to champion the human creator by providing a structured environment for AI Craft, which is a collaborative process where the creator directs the AI with a clear vision, contrasting with generic, unedited "AI slop" from a single prompt.

### The AIME Ecosystem: Context is Everything
The application achieves narrative consistency through rich context and consists of two main components:

- **The Element Forge**: A comprehensive suite for building the foundational blocks of a fictional universe. Each "Element" (e.g., character, world, faction) is a structured document that serves as a single source of truth for the AI.
- **The Story Weaver**: A multi-stage writing environment where creators use their pre-defined Elements as context to guide the AI in generating narrative content, from initial concepts to a full draft.

## 2. CORE MODULES: A FEATURE OVERVIEW

### 2.1. THE ELEMENT FORGE
The Element Forge is the starting point for any project in AIME. It allows the user to create a detailed "lore bible" that the AI uses as a reference for all creative tasks. This ensures consistency across all generated content. Each module provides a structured, tabbed interface to guide the user in defining a specific aspect of their world.

The Forge consists of the following modules, accessible from the Elements Hub (pages/elements.html):

#### 2.1.1. Universe Crucible
To establish the highest-level framework of the fictional reality. This is the "constitution" of the story world, defining its fundamental laws and boundaries. Users define the core genres and themes, the cosmic scope (e.g., single galaxy, multiverse), the nature of its physical and metaphysical laws (e.g., hard or soft magic systems), and the overarching tone of the narrative. This element serves as the primary contextual document for all other elements.

#### 2.1.2. World Anvil
To build a specific planet, realm, or plane of existence within the universe. Users detail the world's physical characteristics (geography, climate), its history and lore, the dominant cultures and societies, and its level of technological or magical development. This element provides a global context for settings, factions, and species.

#### 2.1.3. Setting Architect
To design a specific, self-contained location within a world. This is where the actual events of a story often take place. This module allows for the detailed creation of a city, building, forest, or any other specific environment. Users can define its atmosphere, key landmarks, population, and its role within the larger world.

#### 2.1.4. Philosophy Scribe
To define the belief systems, religions, and societal creeds that shape the cultures and characters of the world. Users can detail a philosophy's core tenets, its history and key figures, its organizational structure (e.g., hierarchical church, decentralized cults), and its influence on society. This adds depth to the motivations of characters and factions.

#### 2.1.5. Faction Shaper
To create the organizations that drive conflict, cooperation, and plot progression. This module allows users to define a faction's ideology, governance, assets, and public perception. Whether it's a sprawling empire, a clandestine rebel group, or a mega-corporation, this element helps structure the political and social landscape of the story.

#### 2.1.6. Technology Forge
To create specific technologies, from magical artifacts to advanced scientific inventions. Users can define a technology's function, its principles of operation, its history, its design aesthetic, and its societal impact. This ensures that the tools and devices in the story are well-defined and consistently applied.

#### 2.1.7. Species Creator
To design the various intelligent (or non-intelligent) lifeforms that inhabit the world. This module guides the user through defining a species' biology, psychology, culture, and unique abilities. This is crucial for creating believable and distinct non-human characters and societies.

#### 2.1.8. Persona Maker
To craft detailed, individual characters. This is one of the most in-depth and critical elements. Through a comprehensive multi-tab interface (including Overview, Profile, Backstory, Psychology, and Genre-Specific details), users can define a character's personality, motivations, fears, relationships, and their complete narrative arc. A well-defined Persona is a key asset for generating compelling dialogue and actions in the Story Weaver.

#### 2.1.9. Scene Builder
To construct the smallest unit of a narrative: a single event that occurs at a specific time and place. Users define the scene's core elements, the setting and atmosphere, the characters involved, and the plot-related events that occur. This element can be used as a building block for more complex plots in the Story Weaver.

### 2.2. THE STORY WEAVER (WRITER)
The Story Weaver is a three-stage writing environment that guides a narrative from concept to final draft, utilizing the Elements created in the Forge as deep context.

- **Stage 1: Brainstorm**: To generate and explore high-level story concepts. User provides a core idea, imports high-level assets (like .universe or .world files), selects stylistic Guidance Gems, and clicks "Generate" to produce several distinct story concepts as "concept cards."
- **Stage 2: Outline**: To structure the chosen concept into a coherent sequence of plot points. User selects a concept card and clicks "Develop Outline." The user can then import specific assets like .persona files, edit plot points directly, drag-and-drop to re-order, and click "Generate" again to have AIME intelligently suggest the next logical event.
- **Stage 3: Draft**: To transform the structured outline into a complete, prose-written narrative. User clicks "Create Draft." AIME generates a full prose draft in an editable canvas. The user refines the text using the Floating Text Toolbar with actions like "Rephrase," "Expand," or "Shorten."

## 3. AIME User Guide

### 3.1. Getting Started: Setting Your API Key
1.  Click the gear icon (⚙️) in the main header to open the API Key Settings modal.
2.  Enter your Google AI (Gemini) API key into the input field.
3.  Click Save Key. The key is stored securely in your browser's local storage.

### 3.2. The Element Workflow (Example: Creating a Persona)
- **Step 1: Fill Out the Prompt Fields**: Navigate through the tabs (e.g., Overview, Profile, Backstory) and fill in the text fields with as much detail as possible.
- **Step 2: Provide Context via the Side Column**: The side column contains Generation Controls (Generate, Iterate/Update Instructions, Save/Load Prompt, Save/Load Content, New), Guidance Gems (stylistic direction for the AI), and the Asset Hub (to import other saved Elements like a .world file for context).
- **Step 3: Generate and Refine**: Click the Generate button. The generated text is fully editable, and you can use the Floating Text Toolbar to apply quick actions or the Iterate button to refine the content with further instructions.

### 3.4. Global Features
- **AIME User Guide**: Click the open book icon (📖) in the header to access the detailed user manual.
- **AIME Chatbot (Under Construction)**: Intended to provide a conversational AI assistant for creative tasks.
