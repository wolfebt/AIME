/*
    File: 3d-bundle.js
    Reference: 3D Workshop Logic
    Creator: Wolfe.BT, TangentLLC
*/

// Using three.js library which is assumed to be imported in the HTML file

// --- Resizable Columns ---
function initializeResizableColumns() {
    const workspace = document.querySelector('.workspace-layout');
    if (!workspace) return;

    const mainColumn = workspace.querySelector('.main-column');
    const sideColumn = workspace.querySelector('.side-column');
    const resizeHandle = workspace.querySelector('.resize-handle');

    let isResizing = false;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            resizeHandle.classList.remove('resizing');
        });
        resizeHandle.classList.add('resizing');
    });

    function handleMouseMove(e) {
        if (!isResizing) return;
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
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        const content = accordion.querySelector('.accordion-content');
        const chevron = header.querySelector('.accordion-chevron');
        if (!header || !content || !chevron) return;

        header.addEventListener('click', () => {
            const isOpen = header.classList.toggle('active');
            chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
            if (isOpen) {
                content.style.padding = '1.5rem';
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
                content.style.padding = '0 1.5rem';
            }
        });
        if (header.classList.contains('active')) {
            content.style.padding = '1.5rem';
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}

// --- Guidance Gems ---
function initializeGuidanceGems() {
    const container = document.getElementById('guidance-gems-container');
    if (!container) return;
    const gemsData = {
        "Polygon Count": ["Low-Poly", "Mid-Poly", "High-Poly"],
        "Texture Style": ["Stylized", "Realistic", "PBR", "Hand-painted"],
        "Render Style": ["Solid", "Wireframe", "Solid + Wireframe"]
    };

    let html = '';
    for (const [title, options] of Object.entries(gemsData)) {
        html += `<div class="gem-category"><h4 class="gem-title">${title}</h4><div class="gem-options">`;
        options.forEach(option => {
            html += `<button class="gem-option">${option}</button>`;
        });
        html += `</div></div>`;
    }
    container.innerHTML = html;
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('gem-option')) {
            e.target.classList.toggle('active');
        }
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
    });
}

function addAssetToList(file, assetList) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';
    const fileURL = URL.createObjectURL(file);

    let assetInfoHtml = '';
    if (file.type.startsWith('image/')) {
        assetInfoHtml = `
            <div class="asset-info">
                <img src="${fileURL}" alt="${file.name}" class="asset-thumbnail">
                <span class="asset-name">${file.name}</span>
            </div>`;
    } else {
        assetInfoHtml = `
             <div class="asset-info">
                <span class="asset-icon-text">TXT</span>
                <span class="asset-name">${file.name}</span>
            </div>`;
    }

    assetItem.innerHTML = `${assetInfoHtml}<button class="remove-asset-btn">&times;</button>`;
    assetList.appendChild(assetItem);
    assetItem.querySelector('.remove-asset-btn').addEventListener('click', () => {
        URL.revokeObjectURL(fileURL);
        assetItem.remove();
    });
}


// --- 3D Viewer Logic (Three.js) ---
let scene, camera, renderer, controls, modelGroup;

function init3DViewer() {
    const container = document.getElementById('viewer-3d');
    if (!container || !window.THREE) {
        console.error("3D viewer container or Three.js not found.");
        return;
    }

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = ''; // Clear placeholder
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Controls
    if (window.OrbitControls) {
         controls = new THREE.OrbitControls(camera, renderer.domElement);
    } else {
        console.warn("OrbitControls not found. Make sure it's included in the HTML.");
    }

    // Model Group
    modelGroup = new THREE.Group();
    scene.add(modelGroup);
    
    // Handle Resize
    window.addEventListener('resize', onWindowResize, false);
    
    animate();
}

function onWindowResize() {
    const container = document.getElementById('viewer-3d');
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
}

function generateRandomModel() {
    // Clear previous model
    while (modelGroup.children.length > 0) {
        modelGroup.remove(modelGroup.children[0]);
    }

    const geometries = [
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.SphereGeometry(1.5, 32, 16),
        new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
        new THREE.ConeGeometry(1.5, 3, 32),
        new THREE.IcosahedronGeometry(1.5),
    ];
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = new THREE.MeshStandardMaterial({ 
        color: Math.random() * 0xffffff,
        roughness: 0.5,
        metalness: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    modelGroup.add(mesh);
}

function initializeGeneration() {
    const generateBtn = document.getElementById('generate-button');
    if(generateBtn) {
        generateBtn.addEventListener('click', () => {
            console.log("Generating new 3D model...");
            generateRandomModel();
        });
    }
}


// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    // initializeResizableColumns(); // Disabled for now
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();
    init3DViewer();
    initializeGeneration();
    generateRandomModel(); // Start with a default model
});

