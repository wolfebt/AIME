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

The Element Forge is the starting point for any project in AIME. It allows the user to create a detailed "lore bible" that the AI uses as a reference for all creative tasks. This ensures consistency across all generated content.

The Forge consists of the following modules, accessible from the **Elements Hub** (`pages/elements.html`):

*   **Persona Maker**: Crafts detailed characters with unique personalities, backstories, motivations, and genre-specific traits.
*   **Species Creator**: Designs the biology, culture, and abilities of the various species that inhabit the world.
*   **Faction Shaper**: Defines the organizations (governments, corporations, guilds) that drive conflict and cooperation.
*   **Scene Builder**: Constructs individual narrative scenes with specific moods, settings, and sensory details.
*   **Setting Architect**: Designs a detailed location within a world, such as a city, a building, or a specific environment.
*   **World Anvil**: Builds a specific planet or realm with its own history, cultures, and societies.
*   **Technology Forge**: Creates specific technologies, from magical artifacts to advanced AI, and defines their impact.
*   **Philosophy Scribe**: Defines the religions, belief systems, and societal creeds that shape cultures.
*   **Universe Crucible**: Establishes the high-level framework: genres, themes, and the fundamental laws of the universe.

### 2.2. The Story Weaver (Writer)

The Story Weaver (`pages/writer.html`) is a comprehensive, three-stage writing environment that guides a narrative from concept to final draft. Its power lies in the **Asset Hub**, where a user can import the Elements they've created in the Forge to provide deep context for the AI.

The workflow is divided into three tabs:

1.  **Brainstorm**: Generates high-level story concepts based on a core idea and contextual assets. The output is a series of "concept cards," each with a title, logline, and summary.
2.  **Outline**: Develops a chosen concept into a structured plot outline. Users can generate plot points, edit them directly, and re-order them via drag-and-drop.
3.  **Draft**: Expands the finalized outline into a full prose draft. The generated text can be refined using a floating toolbar with AI-powered editing functions like "Rephrase," "Shorten," and "Expand."

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