# AIME Application Analysis: Feature Overview and User Guide

## 1. High-Level Overview

### Philosophy: AI Craft over AI Slop

AIME (Artificial Intellect Musoikos Environ) is a web-based creative suite designed for writers and world-builders. Its core philosophy is to champion the human creator by providing a structured environment for **AI Craft**. This approach contrasts with generating generic, unedited "AI slop" from a single prompt. AIME enables a collaborative process where the creator directs the AI with a clear vision, ensuring that the final product remains uniquely and powerfully human.

### The AIME Ecosystem: Context is Everything

The application is built on the principle that narrative consistency is achieved through rich context. It consists of two main components:

1.  **The Element Forge**: A comprehensive suite of tools for building the foundational blocks of a fictional universe. Each "Element" (e.g., a character, a world, a faction) is a structured document that serves as a single source of truth for the AI.
2.  **The Story Weaver**: A multi-stage writing environment where creators use their pre-defined Elements as context to guide the AI in generating narrative content, from initial concepts to a full draft.

---

## 2. Core Modules: A Feature Overview

### 2.1. The Element Forge

The Element Forge is the starting point for any project in AIME. It allows the user to create a detailed "lore bible" that the AI uses as a reference for all creative tasks. This ensures consistency across all generated content. Each module provides a structured, tabbed interface to guide the user in defining a specific aspect of their world.

The Forge consists of the following modules, accessible from the **Elements Hub** (`pages/elements.html`):

#### 2.1.1. Universe Crucible
*   **Purpose**: To establish the highest-level framework of the fictional reality. This is the "constitution" of the story world, defining its fundamental laws and boundaries.
*   **Function**: Users define the core genres and themes, the cosmic scope (e.g., single galaxy, multiverse), the nature of its physical and metaphysical laws (e.g., hard or soft magic systems), and the overarching tone of the narrative. This element serves as the primary contextual document for all other elements.

#### 2.1.2. World Anvil
*   **Purpose**: To build a specific planet, realm, or plane of existence within the universe.
*   **Function**: Users detail the world's physical characteristics (geography, climate), its history and lore, the dominant cultures and societies, and its level of technological or magical development. This element provides a global context for settings, factions, and species.

#### 2.1.3. Setting Architect
*   **Purpose**: To design a specific, self-contained location within a world. This is where the actual events of a story often take place.
*   **Function**: This module allows for the detailed creation of a city, building, forest, or any other specific environment. Users can define its atmosphere, key landmarks, population, and its role within the larger world.

#### 2.1.4. Philosophy Scribe
*   **Purpose**: To define the belief systems, religions, and societal creeds that shape the cultures and characters of the world.
*   **Function**: Users can detail a philosophy's core tenets, its history and key figures, its organizational structure (e.g., hierarchical church, decentralized cults), and its influence on society. This adds depth to the motivations of characters and factions.

#### 2.1.5. Faction Shaper
*   **Purpose**: To create the organizations that drive conflict, cooperation, and plot progression.
*   **Function**: This module allows users to define a faction's ideology, governance, assets, and public perception. Whether it's a sprawling empire, a clandestine rebel group, or a mega-corporation, this element helps structure the political and social landscape of the story.

#### 2.1.6. Technology Forge
*   **Purpose**: To create specific technologies, from magical artifacts to advanced scientific inventions.
*   **Function**: Users can define a technology's function, its principles of operation, its history, its design aesthetic, and its societal impact. This ensures that the tools and devices in the story are well-defined and consistently applied.

#### 2.1.7. Species Creator
*   **Purpose**: To design the various intelligent (or non-intelligent) lifeforms that inhabit the world.
*   **Function**: This module guides the user through defining a species' biology, psychology, culture, and unique abilities. This is crucial for creating believable and distinct non-human characters and societies.

#### 2.1.8. Persona Maker
*   **Purpose**: To craft detailed, individual characters. This is one of the most in-depth and critical elements.
*   **Function**: Through a comprehensive multi-tab interface (including Overview, Profile, Backstory, Psychology, and Genre-Specific details), users can define a character's personality, motivations, fears, relationships, and their complete narrative arc. A well-defined Persona is a key asset for generating compelling dialogue and actions in the Story Weaver.

#### 2.1.9. Scene Builder
*   **Purpose**: To construct the smallest unit of a narrative: a single event that occurs at a specific time and place.
*   **Function**: Users define the scene's core elements, the setting and atmosphere, the characters involved, and the plot-related events that occur. This element can be used as a building block for more complex plots in the Story Weaver.

### 2.2. The Story Weaver (Writer)

The Story Weaver (`pages/writer.html`) is a comprehensive, three-stage writing environment that guides a narrative from concept to final draft. Its power lies in the **Asset Hub**, where a user can import the Elements they've created in the Forge to provide deep context for the AI. The workflow is designed to be sequential, moving from high-level ideas to a finished piece of prose.

#### 2.2.1. Stage 1: Brainstorm
*   **Purpose**: To generate and explore high-level story concepts from a single core idea. This stage is about discovering potential narrative directions.
*   **Function**: The user provides a core idea in the main prompt box. By importing high-level assets (like a `.universe` or `.world` file) and selecting stylistic **Guidance Gems**, they set the creative boundaries for the AI. Upon clicking "Generate," AIME produces several distinct story concepts, presented as "concept cards." Each card contains a title, a logline, and a summary paragraph, giving the user multiple creative paths to choose from.

#### 2.2.2. Stage 2: Outline
*   **Purpose**: To structure the chosen narrative concept into a coherent sequence of plot points. This stage is about building the architectural blueprint of the story.
*   **Function**: The user selects their favorite concept card and clicks "Develop Outline," which transitions them to this tab. AIME generates the initial plot points. The user can then import more specific assets, such as `.persona` files for the main characters, to ensure the plot is character-driven and consistent. The outline is fully interactive: users can edit text directly, drag-and-drop plot points to change their order, and click "Generate" again to have AIME intelligently suggest the next logical event based on the existing sequence.

#### 2.2.3. Stage 3: Draft
*   **Purpose**: To transform the structured outline into a complete, prose-written narrative. This is where the story is fleshed out with description, dialogue, and character emotion.
*   **Function**: After finalizing the outline, the user clicks "Create Draft." AIME uses the entire outline as a master prompt, expanding each plot point into a full scene or chapter. The generated text appears in a `contenteditable` canvas. The user can then act as an editor, using the **Floating Text Toolbar** to select any piece of text and apply AI-powered refinements like "Rephrase," "Expand," or "Shorten," ensuring the final prose matches their unique authorial voice.

---

## 3. AIME User Guide

### 3.1. Getting Started: Setting Your API Key

Before you can generate any content, you must provide your Google AI (Gemini) API key.

1.  Click the **gear icon** (⚙️) in the main header to open the **API Key Settings** modal.
2.  Enter your Gemini API key into the input field.
3.  Click **Save Key**. The key is stored securely in your browser's local storage and will be remembered for future sessions.

### 3.2. The Element Workflow (Example: Creating a Persona)

All Element pages share the same layout and functionality. This guide uses the **Persona Maker** as an example.

**Step 1: Fill Out the Prompt Fields**

*   Navigate through the tabs (e.g., Overview, Profile, Backstory) to define your character.
*   Fill in the text fields with as much detail as possible. The more information you provide, the more consistent and detailed the AI's output will be. Each field has a `data-field-id` that allows the system to save and load your prompts correctly.

**Step 2: Provide Context via the Side Column**

The side column contains three key tools for guiding the AI:

*   **Generation Controls**:
    *   **Generate**: Creates the main content based on your inputs.
    *   **Iterate / Update Instructions**: After generating, this allows you to refine the output by providing further instructions (e.g., "Make the backstory more tragic").
    *   **Save/Load Prompt**: Saves or loads the content of all the input fields to a `.personaprompt` JSON file.
    *   **Save/Load Content**: Saves or loads the entire element as a Markdown (`.persona`) file.
    *   **New**: Clears the entire workspace.

*   **Guidance Gems**:
    *   Click on a category (e.g., "Descriptive Tone") to open a modal.
    *   Select one or more "gems" (e.g., "Heroic & Grand") to give the AI stylistic direction. You can also add your own custom gems.

*   **Asset Hub**:
    *   Click **Import Asset(s)** to load other saved Elements (e.g., a `.world` file) or text files.
    *   These assets provide crucial context. For example, importing the character's homeworld will ensure the AI's description of their history is accurate to that world.

**Step 3: Generate and Refine**

1.  Click the **Generate** button. AIME will craft a "super prompt" combining your field inputs, guidance gems, and asset hub context, then generate a detailed persona in the main response container.
2.  The generated text is fully editable. You can also select portions of the text to activate a **Floating Text Toolbar** with quick actions like **Rephrase**, **Shorten**, and **Expand**.
3.  Use the **Iterate** button and the **Update Instructions** field to refine the generated content until it meets your vision.

### 3.3. The Story Weaver Workflow

**Stage 1: Brainstorm**

1.  In the **Prompt Box**, enter a core idea (e.g., "A private investigator who solves crimes in a magical city").
2.  In the **Asset Hub**, import relevant high-level Elements like your `.universe` and `.world` files.
3.  Select appropriate **Guidance Gems** (e.g., Genre: "Fantasy", Tone: "Noir").
4.  Click **Generate**. AIME will produce several distinct story concepts in the main area.

**Stage 2: Outline**

1.  Find a concept you like and click its **Develop Outline** button. This automatically switches you to the Outline tab.
2.  AIME generates the first few plot points.
3.  Import more specific assets, like the `.persona` files for your main characters.
4.  To add more to the story, click the main **Generate** button again. AIME will read the existing plot points and generate the next logical one.
5.  You can freely **edit** the text of any plot point or **drag-and-drop** them to re-order the narrative.

**Stage 3: Draft**

1.  Once your outline is complete, click the **Create Draft** button in the Outline tab's header. This switches you to the Draft tab.
2.  AIME will generate a full prose draft, expanding on each plot point from your outline while respecting the context from all imported assets.
3.  Use the **Floating Text Toolbar** to refine the prose, ensuring the final story has your unique authorial voice.

### 3.4. Global Features

*   **AIME User Guide**: Click the **open book icon** (📖) in the header to access a detailed user manual that explains the application's philosophy and workflow.
*   **AIME Chatbot (Under Construction)**: This feature is intended to provide a conversational AI assistant that can answer questions and help with creative tasks. It is not yet fully functional.