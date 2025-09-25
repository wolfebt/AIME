/**
 * ==================================================================================
 * AIME Asset Import Logic (Mockup)
 * ==================================================================================
 * This script handles the UI for importing local asset files into the Asset Hub.
 * NOTE: File reading is mocked. A full implementation requires the FileReader API.
 * ==================================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const importBtn = document.getElementById('import-asset-btn');
    const fileInput = document.getElementById('asset-upload');
    const assetList = document.getElementById('asset-list');

    if (importBtn && fileInput && assetList) {
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (event) => {
            for (const file of event.target.files) {
                addAssetToList(file, assetList);
            }
        });
    }
});

function addAssetToList(file, assetList) {
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop();
    
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';
    assetItem.dataset.elementType = fileExtension;
    
    const mockContent = {
        Name: "Mocked Asset",
        Details: "File reading is not yet implemented.",
        SourceFile: fileName
    };
    assetItem.dataset.mockContent = JSON.stringify(mockContent);

    const assetInfo = document.createElement('div');
    assetInfo.className = 'asset-info';
    
    const assetName = document.createElement('span');
    assetName.className = 'asset-name';
    assetName.textContent = fileName;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-asset-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = () => assetItem.remove();

    assetInfo.appendChild(assetName);
    assetInfo.appendChild(removeBtn);

    const assetControls = document.createElement('div');
    assetControls.className = 'asset-controls';

    const importanceSelect = document.createElement('select');
    importanceSelect.className = 'importance-select';
    ['High', 'Typical', 'Low', 'Non-Informative'].forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = level;
        if (level === 'Typical') option.selected = true;
        importanceSelect.appendChild(option);
    });

    const noteInput = document.createElement('input');
    noteInput.type = 'text';
    noteInput.className = 'note-input';
    noteInput.placeholder = 'Add a note for context...';

    assetControls.appendChild(importanceSelect);
    assetControls.appendChild(noteInput);

    assetItem.appendChild(assetInfo);
    assetItem.appendChild(assetControls);
    
    assetList.appendChild(assetItem);
}
