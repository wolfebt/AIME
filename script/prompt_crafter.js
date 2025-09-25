/**
 * ==================================================================================
 * AIME Super-Prompt Crafting Function
 * ==================================================================================
 * This script contains the core logic for constructing the detailed "super-prompt".
 * ==================================================================================
 */

function craftSuperPrompt(elementData) {
    let prompt = '';
    prompt += `[ROLE] You are a world-class narrative AI, acting as an expert author. Your writing style is evocative, precise, and emotionally intelligent.\n\n`;
    prompt += `[TASK] Your task is to generate a single, compelling piece of narrative based *only* on the detailed context provided below.\n\n`;
    prompt += `[CONSTRAINT] You must adhere strictly to the provided data. Do NOT introduce new characters, settings, or plot elements not defined in the context. You are to expand upon, not invent.\n\n`;

    prompt += `<STYLE_GUIDE>\n`;
    for (const [key, value] of Object.entries(elementData.guidance)) {
        prompt += `- **${key}:** ${value}. Ensure this is a primary focus of the prose.\n`;
    }
    prompt += `</STYLE_GUIDE>\n\n`;

    prompt += `<CONTEXT_CORE>\n`;
    prompt += `  <PRIMARY_ELEMENT TYPE="${elementData.primaryElementType}">\n`;
    for (const [key, value] of Object.entries(elementData.traits)) {
        if (value) {
            prompt += `    - **${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:** ${value}\n`;
        }
    }
    prompt += `  </PRIMARY_ELEMENT>\n\n`;

    for (const asset of elementData.assets) {
        prompt += `  <LINKED_ASSET>\n`;
        prompt += `    - **File:** ${asset.fileName}\n`;
        prompt += `    - **Type:** ${asset.elementType}\n`;
        prompt += `    - **Importance:** ${asset.importance}\n`;
        prompt += `    - **Note:** "${asset.note}"\n`;
        prompt += `    <DATA>\n`;
        for (const [key, value] of Object.entries(asset.content)) {
            prompt += `      - **${key}:** ${value}\n`;
        }
        prompt += `    </DATA>\n`;
        prompt += `  </LINKED_ASSET>\n\n`;
    }
    prompt += `</CONTEXT_CORE>\n\n`;

    prompt += `[EXECUTION_COMMAND] Now, write the narrative for the Primary Element defined above. Synthesize all information from the Style Guide and Context Core to create a rich, consistent, and compelling result.`;
    return prompt;
}
