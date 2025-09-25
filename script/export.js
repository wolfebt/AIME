/**
 * ==================================================================================
 * AIME Asset Export Logic
 * ==================================================================================
 * Handles functionality for exporting form data into a downloadable Markdown file.
 * NOTE: This is a placeholder and needs to be connected to a button if desired.
 * ==================================================================================
 */
function exportAsset(elementType, traitsData) {
    let markdownContent = '';
    let elementName = 'Untitled';

    for (const [key, value] of Object.entries(traitsData)) {
        if (value) {
            const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            markdownContent += `## ${title}\n${value}\n\n`;
            if (key.toLowerCase().includes('name')) {
                elementName = value;
            }
        }
    }
    
    const sanitizedElementName = elementName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${sanitizedElementName}.${elementType.toLowerCase()}`;
    const blob = new Blob([markdownContent.trim()], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
