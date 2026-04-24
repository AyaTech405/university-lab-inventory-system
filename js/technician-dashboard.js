// Technician Dashboard JavaScript

// ==================== Data Management ====================
const LABS_STORAGE_KEY = 'labsData';

function getLabsData() {
  const data = localStorage.getItem(LABS_STORAGE_KEY);
  if (data) return JSON.parse(data);
  
  // Sample data (same as admin)
  const sample = [
    {
      id: 1,
      name: 'Lab 1',
      location: 'Building A',
      capacity: 20,
      logiciel: 'Windows 11',
      pcs: [
        { id: 1, name: 'PC-001', type: 'PC', status: 'Functional', RAM: '8GB', GPU: 'Intel HD', CPU: 'Intel i3' },
        { id: 2, name: 'PC-002', type: 'PC', status: 'Functional', RAM: '16GB', GPU: 'NVIDIA GTX 1050', CPU: 'Intel i5' }
      ]
    },
    {
      id: 2,
      name: 'Lab 2',
      location: 'Building B',
      capacity: 15,
      logiciel: 'Ubuntu',
      pcs: [
        { id: 1, name: 'PC-101', type: 'PC', status: 'Maintenance', RAM: '32GB', GPU: 'NVIDIA RTX 3060', CPU: 'AMD Ryzen 7' }
      ]
    }
  ];
  localStorage.setItem(LABS_STORAGE_KEY, JSON.stringify(sample));
  return sample;
}

function setLabsData(data) {
  localStorage.setItem(LABS_STORAGE_KEY, JSON.stringify(data));
}

// ==================== Dashboard Stats ====================
function updateDashboardStats() {
  const labs = getLabsData();
  
  let totalDevices = 0;
  let workingDevices = 0;
  let repairDevices = 0;
  let oosDevices = 0;
  
  labs.forEach(lab => {
    if (lab.pcs) {
      lab.pcs.forEach(pc => {
        totalDevices++;
        if (pc.status === 'Functional') workingDevices++;
        else if (pc.status === 'Maintenance') repairDevices++;
        else if (pc.status === 'Out of Service') oosDevices++;
      });
    }
  });
  
  document.getElementById('total-devices').textContent = totalDevices;
  document.getElementById('working-devices').textContent = workingDevices;
  document.getElementById('repair-devices').textContent = repairDevices;
  document.getElementById('oos-devices').textContent = oosDevices;
  document.getElementById('total-labs').textContent = labs.length;
  
  // Update charts
  updateCharts(labs, workingDevices, repairDevices, oosDevices);
}

function updateCharts(labs, working, repair, oos) {
  // Bar Chart - Device Status
  const ctx = document.getElementById('devicesChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Working', 'Under Repair', 'Out of Service'],
      datasets: [{
        label: 'Devices Status',
        data: [working, repair, oos],
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
  
  // Doughnut Chart - Status Distribution
  const ctx2 = document.getElementById('statusChart').getContext('2d');
  new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['Working', 'Maintenance', 'Out of Service'],
      datasets: [{
        data: [working, repair, oos],
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
      }]
    },
    options: { responsive: true }
  });
  
  // Labs Chart
  const ctx3 = document.getElementById('labsChart').getContext('2d');
  new Chart(ctx3, {
    type: 'pie',
    data: {
      labels: labs.map(l => l.name),
      datasets: [{
        data: labs.map(l => l.pcs ? l.pcs.length : 0),
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0', '#00BCD4']
      }]
    },
    options: { responsive: true }
  });
}

// ==================== Labs View (Read-only) ====================
let selectedLabId = null;

function renderLabs() {
  const labs = getLabsData();
  const labsList = document.getElementById('labs-list');
  labsList.innerHTML = '';
  
  if (labs.length === 0) {
    labsList.innerHTML = '<p class="placeholder">No laboratories available</p>';
    return;
  }
  
  labs.forEach(lab => {
    const card = document.createElement('div');
    card.className = 'card' + (lab.id === selectedLabId ? ' selected' : '');
    card.onclick = () => selectLab(lab.id);
    card.innerHTML = `
      <div>
        <div class="card-title">${lab.name}</div>
        <div style="font-size:0.95em;color:#555;">Devices: ${lab.pcs ? lab.pcs.length : 0}</div>
        <div style="font-size:0.85em;color:#777;">${lab.location || 'No location'}</div>
      </div>
    `;
    labsList.appendChild(card);
  });
}

function renderDevices() {
  const devicesList = document.getElementById('devices-list');
  const devicesTitle = document.getElementById('devices-title');
  
  if (!selectedLabId) {
    devicesList.innerHTML = '<p class="placeholder">Select a laboratory to view devices</p>';
    return;
  }
  
  const labs = getLabsData();
  const lab = labs.find(l => l.id === selectedLabId);
  
  if (!lab || !lab.pcs || lab.pcs.length === 0) {
    devicesList.innerHTML = '<p class="placeholder">No devices in this lab</p>';
    devicesTitle.textContent = `${lab.name} - Devices`;
    return;
  }
  
  devicesTitle.textContent = `${lab.name} - Devices`;
  
  devicesList.innerHTML = '';
  lab.pcs.forEach(pc => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div>
        <div class="card-title">${pc.name}</div>
        <div style="font-size:0.95em;color:#555;">${pc.type} - ${pc.status}</div>
      </div>
    `;
    devicesList.appendChild(card);
  });
}

function selectLab(labId) {
  selectedLabId = labId;
  renderLabs();
  renderDevices();
}

// ==================== Maintenance Management ====================
function renderMaintenanceTable() {
  const labs = getLabsData();
  const tbody = document.getElementById('maintenance-body');
  tbody.innerHTML = '';
  
  labs.forEach(lab => {
    if (lab.pcs) {
      lab.pcs.forEach(pc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${pc.id}</td>
          <td>${pc.name}</td>
          <td>${pc.type}</td>
          <td>${lab.name}</td>
          <td><span class="status-badge ${pc.status}">${pc.status}</span></td>
          <td>
            <button class="action-btn" onclick="openStatusModal(${pc.id}, ${lab.id})">Update</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  });
}

function openStatusModal(deviceId, labId) {
  const labs = getLabsData();
  const lab = labs.find(l => l.id === labId);
  if (!lab || !lab.pcs) return;
  
  const pc = lab.pcs.find(p => p.id === deviceId);
  if (!pc) return;
  
  document.getElementById('new-status').value = pc.status;
  document.getElementById('status-device-id').value = deviceId;
  document.getElementById('status-lab-id').value = labId;
  document.getElementById('status-modal').classList.add('show');
}

document.getElementById('close-status-modal').onclick = () => {
  document.getElementById('status-modal').classList.remove('show');
};

document.getElementById('status-form').onsubmit = function(e) {
  e.preventDefault();
  
  const newStatus = document.getElementById('new-status').value;
  const deviceId = parseInt(document.getElementById('status-device-id').value);
  const labId = parseInt(document.getElementById('status-lab-id').value);
  
  let labs = getLabsData();
  const labIdx = labs.findIndex(l => l.id === labId);
  if (labIdx === -1) return;
  
  const pcIdx = labs[labIdx].pcs.findIndex(p => p.id === deviceId);
  if (pcIdx === -1) return;
  
  labs[labIdx].pcs[pcIdx].status = newStatus;
  setLabsData(labs);
  
  document.getElementById('status-modal').classList.remove('show');
  renderMaintenanceTable();
  updateDashboardStats();
  
  alert(`Device status updated to: ${newStatus}`);
};

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
  renderLabs();
  renderDevices();
  renderMaintenanceTable();
  updateDashboardStats();
  
  // Close modals on outside click
  window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
      event.target.classList.remove('show');
    }
  };
});
