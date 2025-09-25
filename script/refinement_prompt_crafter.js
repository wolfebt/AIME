/**
 * ==================================================================================
 * AIME Refinement Prompt Crafter
 * ==================================================================================
 * This script builds the "Refinement Prompt" for editing generated text.
 * ==================================================================================
 */

function craftRefinementPrompt(originalSuperPrompt, refinementData) {
    let prompt = '';
    prompt += `[ROLE] You are a master-class editor AI. Your task is to perform a precise, surgical refinement of a specific portion of text, following the user's command while maintaining the style and context of the surrounding narrative.\n\n`;
    prompt += `<ORIGINAL_CONTEXT>\nThis is the original prompt that generated the text. Use it to understand the full context, characters, and style guide.\n\n`;
    prompt += originalSuperPrompt;
    prompt += `\n</ORIGINAL_CONTEXT>\n\n`;
    prompt += `<FULL_TEXT_FOR_EDITING>\n${refinementData.fullText}\n</FULL_TEXT_FOR_EDITING>\n\n`;
    prompt += `<SELECTED_TEXT_TO_REFINE>\n${refinementData.selectedText}\n</SELECTED_TEXT_TO_REFINE>\n\n`;
    prompt += `[EXECUTION_COMMAND] Your task is to rewrite ONLY the content within <SELECTED_TEXT_TO_REFINE>. Apply the following command: **${refinementData.command.toUpperCase()}**.\n`;

    switch (refinementData.command) {
        case 'expand':
            prompt += `Add more descriptive language, sensory details, or internal monologue to make this section more vivid and detailed.`;
            break;
        case 'shorten':
            prompt += `Condense this section to its core meaning. Make it more concise and impactful without losing essential information.`;
            break;
        case 'rewrite':
            prompt += `Rephrase this section for better clarity, flow, or style. Maintain the original meaning but improve the prose.`;
            break;
        case 'change_tone':
            prompt += `Rewrite this section to have a **${refinementData.detail.toUpperCase()}** tone. Adjust the word choice, sentence structure, and focus to reflect this new tone.`;
            break;
    }
    prompt += `\nYour output should ONLY be the new, refined version of the selected text, ready to replace the original.`;
    return prompt;
}
