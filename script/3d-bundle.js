/*
    File: 3d-bundle.js
    Reference: 3D Workshop Logic
    Creator: Wolfe.BT, TangentLLC
*/

// --- Resizable Columns ---
function initializeResizableColumns() {
    const workspace = document.querySelector('.workspace-layout');
    if (!workspace) return;

    const mainColumn = workspace.querySelector('.main-column');
    const sideColumn = workspace.querySelector('.side-column');
    const resizeHandle = workspace.querySelector('.resize-handle');

    let isResizing = false;

    if (!resizeHandle) return;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            if(resizeHandle) {
                resizeHandle.classList.remove('resizing');
            }
        });
        resizeHandle.classList.add('resizing');
    });

    function handleMouseMove(e) {
        if (!isResizing || !workspace || !mainColumn || !sideColumn) return;

        const containerRect = workspace.getBoundingClientRect();
        const newLeftWidth = e.clientX - containerRect.left;
        let newLeftPercent = (newLeftWidth / containerRect.width) * 100;

        newLeftPercent = Math.max(20, Math.min(80, newLeftPercent));

        mainColumn.style.width = `calc(${newLeftPercent}% - 6px)`;
        sideColumn.style.width = `calc(${100 - newLeftPercent}% - 6px)`;
    }
}


// --- Accordion Logic ---
function initializeAccordions() {
    document.querySelectorAll('.accordion .accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const accordion = header.parentElement;
            const content = accordion.querySelector('.accordion-content');
            const chevron = header.querySelector('.accordion-chevron');
            const isOpen = header.classList.toggle('active');

            if (chevron) {
                chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
            }

            if (isOpen) {
                content.style.maxHeight = content.scrollHeight + 48 + "px";
                content.style.padding = '1.5rem';
            } else {
                content.style.maxHeight = null;
                content.style.padding = '0 1.5rem';
            }
        });
    });
}

// --- Guidance Gems ---
function initializeGuidanceGems() {
    const container = document.getElementById('model-gems-container');
    if (!container) return;

    const gemsData = {
        "Polygon Count": ["Low-Poly", "Mid-Poly", "High-Poly"],
        "Texture Style": ["Stylized", "Hand-Painted", "PBR Realistic", "Cartoon"],
        "Render Style": ["Clay", "Toon-Shaded", "Photorealistic"]
    };

    let gemsHTML = '';
    for (const category in gemsData) {
        gemsHTML += `<div class="gem-category"><h4 class="gem-title">${category}</h4><div class="gem-options">`;
        gemsData[category].forEach(option => {
            gemsHTML += `<button class="gem-option" data-category="${category}">${option}</button>`;
        });
        gemsHTML += `</div></div>`;
    }
    container.innerHTML = gemsHTML;

    container.querySelectorAll('.gem-option').forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
        });
    });
}

// --- Asset Hub Importer ---
function initializeAssetImporter() {
    const importBtn = document.getElementById('import-asset-btn');
    const fileInput = document.getElementById('asset-upload');
    const assetList = document.getElementById('asset-list');

    if (!importBtn || !fileInput || !assetList) return;

    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (event) => {
        for (const file of event.target.files) {
            addAssetToList(file, assetList);
        }
        fileInput.value = '';
    });
}

function addAssetToList(file, assetList) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';

    const assetInfo = document.createElement('div');
    assetInfo.className = 'asset-info';

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = e.target.result;
            thumbnail.alt = file.name;
            thumbnail.className = 'asset-thumbnail';
            assetInfo.prepend(thumbnail);
        };
        reader.readAsDataURL(file);
    } else {
        const textIcon = document.createElement('div');
        textIcon.className = 'asset-icon-text';
        textIcon.textContent = 'TXT';
        assetInfo.prepend(textIcon);
    }

    const assetName = document.createElement('span');
    assetName.className = 'asset-name';
    assetName.textContent = file.name;
    assetInfo.appendChild(assetName);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-asset-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = () => assetItem.remove();

    assetItem.appendChild(assetInfo);
    assetItem.appendChild(removeBtn);
    assetList.appendChild(assetItem);
}


// --- 3D Viewer Logic ---
let scene, camera, renderer, model;
function initialize3DViewer() {
    const container = document.getElementById('model-viewer-container');
    if (!container || typeof THREE === 'undefined') {
        if(container) container.innerHTML = '<p class="placeholder-text">Error: three.js library not found.</p>';
        return;
    }
    container.innerHTML = ''; // Clear placeholder

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Initial model
    generateNewModel();

    // Mouse Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    container.addEventListener('mousedown', e => { isDragging = true; });
    container.addEventListener('mouseup', e => { isDragging = false; });
    container.addEventListener('mousemove', e => {
        if (isDragging && model) {
            const deltaMove = {
                x: e.offsetX - previousMousePosition.x,
                y: e.offsetY - previousMousePosition.y
            };
            model.rotation.y += deltaMove.x * 0.01;
            model.rotation.x += deltaMove.y * 0.01;
        }
        previousMousePosition = { x: e.offsetX, y: e.offsetY };
    });
    container.addEventListener('wheel', e => {
        camera.position.z += e.deltaY * 0.01;
    });


    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function generateNewModel() {
    if (model) {
        scene.remove(model);
    }
    const geometries = [
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.SphereGeometry(1.5, 32, 16),
        new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
        new THREE.IcosahedronGeometry(1.5),
    ];
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = new THREE.MeshStandardMaterial({ color: 0x5b21b6, metalness: 0.3, roughness: 0.5 });
    model = new THREE.Mesh(geometry, material);
    scene.add(model);
}

// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    initializeResizableColumns();
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();
    initialize3DViewer();
    // Add listener for our new generate button
    const genBtn = document.getElementById('generate-button');
    if (genBtn) {
        genBtn.addEventListener('click', generateNewModel);
    }
});

