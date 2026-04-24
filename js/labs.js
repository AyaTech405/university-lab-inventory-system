// --- Data Management ---
const STORAGE_KEY = 'labsData';

function getLabsData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
    // Sample data
    const sample = [
        {
            id: 1,
            name: 'Lab 1',
            pcTotal: 2,
            pcs: [
                {
                    id: 1,
                    RAM: '8GB',
                    GPU: 'Intel HD',
                    CPU: 'Intel i3',
                    software: ['Chrome', 'VS Code']
                },
                {
                    id: 2,
                    RAM: '16GB',
                    GPU: 'NVIDIA GTX 1050',
                    CPU: 'Intel i5',
                    software: ['Photoshop', 'MATLAB']
                }
            ]
        },
        {
            id: 2,
            name: 'Lab 2',
            pcTotal: 1,
            pcs: [
                {
                    id: 1,
                    RAM: '32GB',
                    GPU: 'NVIDIA RTX 3060',
                    CPU: 'AMD Ryzen 7',
                    software: ['Blender', 'Unity']
                }
            ]
        }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    return sample;
}

function setLabsData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// --- UI State ---
let selectedLabId = null;

// --- DOM Elements ---
const labsList = document.getElementById('labs-list');
const pcsList = document.getElementById('pcs-list');
const addLabBtn = document.getElementById('add-lab-btn');
const addPcBtn = document.getElementById('add-pc-btn');
const pcsTitle = document.getElementById('pcs-title');

// Modals
const labModal = document.getElementById('lab-modal');
const pcModal = document.getElementById('pc-modal');
const pcDetailsModal = document.getElementById('pc-details-modal');

// Forms
const labForm = document.getElementById('lab-form');
const pcForm = document.getElementById('pc-form');

// --- Render Functions ---
function renderLabs() {
    const labs = getLabsData();
    labsList.innerHTML = '';
    labs.forEach(lab => {
        const card = document.createElement('div');
        card.className = 'card' + (lab.id === selectedLabId ? ' selected' : '');
        card.onclick = () => selectLab(lab.id);
        card.innerHTML = `
            <div>
                <div class="card-title">${lab.name}</div>
                <div style="font-size:0.95em;color:#555;">PCs: ${lab.pcTotal}</div>
            </div>
            <div class="card-actions" onclick="event.stopPropagation()">
                <button class="action-btn" onclick="editLab(event, ${lab.id})">Edit</button>
                <button class="action-btn delete" onclick="deleteLab(event, ${lab.id})">Delete</button>
            </div>
        `;
        labsList.appendChild(card);
    });
}

function renderPCs() {
    pcsList.innerHTML = '';
    addPcBtn.style.display = selectedLabId ? 'inline-block' : 'none';
    if (!selectedLabId) return;
    const labs = getLabsData();
    const lab = labs.find(l => l.id === selectedLabId);
    pcsTitle.textContent = lab ? `PCs in ${lab.name}` : 'PCs';
    if (!lab) return;
    lab.pcs.forEach(pc => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => showPCDetails(pc);
        card.innerHTML = `
            <div>
                <div class="card-title">PC #${pc.id}</div>
                <div style="font-size:0.95em;color:#555;">${pc.CPU} / ${pc.RAM}</div>
            </div>
            <div class="card-actions" onclick="event.stopPropagation()">
                <button class="action-btn" onclick="editPC(event, ${pc.id})">Edit</button>
                <button class="action-btn delete" onclick="deletePC(event, ${pc.id})">Delete</button>
            </div>
        `;
        pcsList.appendChild(card);
    });
}

function selectLab(labId) {
    selectedLabId = labId;
    renderLabs();
    renderPCs();
}

// --- Lab CRUD ---
addLabBtn.onclick = () => {
    document.getElementById('lab-modal-title').textContent = 'Add Labo';
    labForm.reset();
    document.getElementById('lab-id').value = '';
    labModal.classList.add('show');
};

document.getElementById('close-lab-modal').onclick = () => {
    labModal.classList.remove('show');
};

labForm.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('lab-name').value.trim();
    const pcTotal = parseInt(document.getElementById('lab-pc-total').value);
    const id = document.getElementById('lab-id').value;
    let labs = getLabsData();
    if (id) {
        // Update
        labs = labs.map(lab => lab.id == id ? { ...lab, name, pcTotal } : lab);
    } else {
        // Add
        const newId = labs.length ? Math.max(...labs.map(l => l.id)) + 1 : 1;
        labs.push({ id: newId, name, pcTotal, pcs: [] });
    }
    setLabsData(labs);
    labModal.classList.remove('show');
    renderLabs();
    renderPCs();
};

window.editLab = function(event, labId) {
    event.stopPropagation();
    const labs = getLabsData();
    const lab = labs.find(l => l.id === labId);
    if (!lab) return;
    document.getElementById('lab-modal-title').textContent = 'Update Labo';
    document.getElementById('lab-name').value = lab.name;
    document.getElementById('lab-pc-total').value = lab.pcTotal;
    document.getElementById('lab-id').value = lab.id;
    labModal.classList.add('show');
};

window.deleteLab = function(event, labId) {
    event.stopPropagation();
    if (!confirm('Delete this lab and all its PCs?')) return;
    let labs = getLabsData();
    labs = labs.filter(l => l.id !== labId);
    setLabsData(labs);
    if (selectedLabId === labId) selectedLabId = null;
    renderLabs();
    renderPCs();
};

// --- PC CRUD ---
addPcBtn.onclick = () => {
    if (!selectedLabId) return;
    document.getElementById('pc-modal-title').textContent = 'Add PC';
    pcForm.reset();
    document.getElementById('pc-id').value = '';
    pcModal.classList.add('show');
};

document.getElementById('close-pc-modal').onclick = () => {
    pcModal.classList.remove('show');
};

pcForm.onsubmit = function(e) {
    e.preventDefault();
    const RAM = document.getElementById('pc-ram').value.trim();
    const GPU = document.getElementById('pc-gpu').value.trim();
    const CPU = document.getElementById('pc-cpu').value.trim();
    const software = document.getElementById('pc-software').value.split(',').map(s => s.trim()).filter(Boolean);
    const id = document.getElementById('pc-id').value;
    let labs = getLabsData();
    const labIdx = labs.findIndex(l => l.id === selectedLabId);
    if (labIdx === -1) return;
    let pcs = labs[labIdx].pcs;
    if (id) {
        // Update
        pcs = pcs.map(pc => pc.id == id ? { ...pc, RAM, GPU, CPU, software } : pc);
    } else {
        // Add
        const newId = pcs.length ? Math.max(...pcs.map(pc => pc.id)) + 1 : 1;
        pcs.push({ id: newId, RAM, GPU, CPU, software });
        labs[labIdx].pcTotal = pcs.length;
    }
    labs[labIdx].pcs = pcs;
    setLabsData(labs);
    pcModal.classList.remove('show');
    renderPCs();
    renderLabs();
};

window.editPC = function(event, pcId) {
    event.stopPropagation();
    const labs = getLabsData();
    const lab = labs.find(l => l.id === selectedLabId);
    if (!lab) return;
    const pc = lab.pcs.find(pc => pc.id === pcId);
    if (!pc) return;
    document.getElementById('pc-modal-title').textContent = 'Update PC';
    document.getElementById('pc-ram').value = pc.RAM;
    document.getElementById('pc-gpu').value = pc.GPU;
    document.getElementById('pc-cpu').value = pc.CPU;
    document.getElementById('pc-software').value = pc.software.join(', ');
    document.getElementById('pc-id').value = pc.id;
    pcModal.classList.add('show');
};

window.deletePC = function(event, pcId) {
    event.stopPropagation();
    let labs = getLabsData();
    const labIdx = labs.findIndex(l => l.id === selectedLabId);
    if (labIdx === -1) return;
    let pcs = labs[labIdx].pcs;
    pcs = pcs.filter(pc => pc.id !== pcId);
    labs[labIdx].pcs = pcs;
    labs[labIdx].pcTotal = pcs.length;
    setLabsData(labs);
    renderPCs();
    renderLabs();
};

// --- PC Details Modal ---
function showPCDetails(pc) {
    const content = document.getElementById('pc-details-content');
    content.innerHTML = `
        <p><strong>ID:</strong> ${pc.id}</p>
        <p><strong>RAM:</strong> ${pc.RAM}</p>
        <p><strong>GPU:</strong> ${pc.GPU}</p>
        <p><strong>CPU:</strong> ${pc.CPU}</p>
        <p><strong>Software:</strong> ${pc.software && pc.software.length ? pc.software.join(', ') : 'None'}</p>
    `;
    pcDetailsModal.classList.add('show');
}

document.getElementById('close-pc-details-modal').onclick = () => {
    pcDetailsModal.classList.remove('show');
};

// --- Modal Close on Outside Click ---
window.onclick = function(event) {
    [labModal, pcModal, pcDetailsModal].forEach(modal => {
        if (event.target === modal) modal.classList.remove('show');
    });
};

// --- Initial Render ---
renderLabs();
renderPCs(); 