// Admin Dashboard JavaScript
import { updateDashboard } from "./dashboard.js";

// ==================== Data Management ====================
const LABS_STORAGE_KEY = 'labsData';
const USERS_STORAGE_KEY = 'usersData';

// Default users
const defaultUsers = [
  { id: 1, username: "Admin", password: "123", role: "admin", createdDate: "2024-01-01" },
  { id: 2, username: "Technician", password: "123", role: "user", createdDate: "2024-01-15" },
  

];

function getLabsData() {
  const data = localStorage.getItem(LABS_STORAGE_KEY);
  if (data) return JSON.parse(data);
  
  // Sample data
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

function getUsersData() {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (data) return JSON.parse(data);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function setUsersData(data) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data));
}

// ==================== Dashboard Stats ====================
function updateDashboardStats() {
  const labs = getLabsData();
  const users = getUsersData();
  
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
  document.getElementById('total-users').textContent = users.length;
  
  // Update charts
  updateCharts(labs, workingDevices, repairDevices, oosDevices);
}

function updateCharts(labs, working, repair, oos) {
  // Bar Chart - Device Status
  const ctx = document.getElementById('devicesChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Working', 'Under Repair', 'Out of Service', 'Available'],
      datasets: [{
        label: 'Devices Status',
        data: [working, repair, oos, working],
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336', '#2196F3'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
  
  // Doughnut Chart - Device Types
  const deviceTypes = {};
  labs.forEach(lab => {
    if (lab.pcs) {
      lab.pcs.forEach(pc => {
        const type = pc.type || 'Other';
        deviceTypes[type] = (deviceTypes[type] || 0) + 1;
      });
    }
  });
  
  const ctx2 = document.getElementById('deviceTypesChart').getContext('2d');
  new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: Object.keys(deviceTypes),
      datasets: [{
        data: Object.values(deviceTypes),
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0']
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

// ==================== Labs Management ====================
let selectedLabId = null;

function renderLabs() {
  const labs = getLabsData();
  const labsList = document.getElementById('labs-list');
  labsList.innerHTML = '';
  
  if (labs.length === 0) {
    labsList.innerHTML = '<p class="placeholder">No laboratories added yet</p>';
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
      <div class="card-actions" onclick="event.stopPropagation()">
        <button class="action-btn" onclick="editLab(event, ${lab.id})">Edit</button>
        <button class="action-btn delete" onclick="deleteLab(event, ${lab.id})">Delete</button>
      </div>
    `;
    labsList.appendChild(card);
  });
  
  // Update lab dropdown in device modal
  const deviceLabSelect = document.getElementById('device-lab');
  deviceLabSelect.innerHTML = labs.map(lab => `<option value="${lab.id}">${lab.name}</option>`).join('');
}

function renderDevices() {
  const devicesList = document.getElementById('devices-list');
  const addDeviceBtn = document.getElementById('add-device-btn');
  const devicesTitle = document.getElementById('devices-title');
  
  if (!selectedLabId) {
    devicesList.innerHTML = '<p class="placeholder">Select a laboratory to view devices</p>';
    addDeviceBtn.style.display = 'none';
    return;
  }
  
  const labs = getLabsData();
  const lab = labs.find(l => l.id === selectedLabId);
  
  if (!lab || !lab.pcs || lab.pcs.length === 0) {
    devicesList.innerHTML = '<p class="placeholder">No devices in this lab</p>';
    addDeviceBtn.style.display = 'inline-block';
    devicesTitle.textContent = `${lab.name} - Devices`;
    return;
  }
  
  devicesTitle.textContent = `${lab.name} - Devices`;
  addDeviceBtn.style.display = 'inline-block';
  
  devicesList.innerHTML = '';
  lab.pcs.forEach(pc => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div>
        <div class="card-title">${pc.name}</div>
        <div style="font-size:0.95em;color:#555;">${pc.type} - ${pc.status}</div>
      </div>
      <div class="card-actions">
        <button class="action-btn" onclick="editDevice(event, ${pc.id})">Edit</button>
        <button class="action-btn delete" onclick="deleteDevice(event, ${pc.id})">Delete</button>
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

// Lab CRUD
document.getElementById('add-lab-btn').onclick = () => {
  document.getElementById('lab-modal-title').textContent = 'Add Laboratory';
  document.getElementById('lab-form').reset();
  document.getElementById('lab-id').value = '';
  document.getElementById('lab-modal').classList.add('show');
};

document.getElementById('close-lab-modal').onclick = () => {
  document.getElementById('lab-modal').classList.remove('show');
};

document.getElementById('lab-form').onsubmit = function(e) {
  e.preventDefault();
  const name = document.getElementById('lab-name').value.trim();
  const location = document.getElementById('lab-location').value.trim();
  const logiciel = document.getElementById('lab-logiciel').value.trim();
  const capacity = parseInt(document.getElementById('lab-capacity').value) || 0;
  const id = document.getElementById('lab-id').value;
  
  let labs = getLabsData();
  
  if (id) {
    labs = labs.map(lab => lab.id == id ? { ...lab, name, location, logiciel, capacity } : lab);
  } else {
    const newId = labs.length ? Math.max(...labs.map(l => l.id)) + 1 : 1;
    labs.push({ id: newId, name, location, logiciel, capacity, pcs: [] });
  }
  
  setLabsData(labs);
  document.getElementById('lab-modal').classList.remove('show');
  renderLabs();
  updateDashboardStats();
};

window.editLab = function(event, labId) {
  event.stopPropagation();
  const labs = getLabsData();
  const lab = labs.find(l => l.id === labId);
  if (!lab) return;
  
  document.getElementById('lab-modal-title').textContent = 'Update Laboratory';
  document.getElementById('lab-name').value = lab.name;
  document.getElementById('lab-location').value = lab.location || '';
  document.getElementById('lab-logiciel').value = lab.logiciel || '';
  document.getElementById('lab-capacity').value = lab.capacity || 0;
  document.getElementById('lab-id').value = lab.id;
  document.getElementById('lab-modal').classList.add('show');
};

window.deleteLab = function(event, labId) {
  event.stopPropagation();
  if (!confirm('Delete this lab and all its devices?')) return;
  
  let labs = getLabsData();
  labs = labs.filter(l => l.id !== labId);
  setLabsData(labs);
  
  if (selectedLabId === labId) selectedLabId = null;
  renderLabs();
  renderDevices();
  updateDashboardStats();
};

// Device CRUD
document.getElementById('add-device-btn').onclick = () => {
  if (!selectedLabId) return;
  document.getElementById('device-modal-title').textContent = 'Add Device';
  document.getElementById('device-form').reset();
  document.getElementById('device-id').value = '';
  document.getElementById('device-modal').classList.add('show');
};

document.getElementById('add-device-global-btn').onclick = () => {
  document.getElementById('device-modal-title').textContent = 'Add Device';
  document.getElementById('device-form').reset();
  document.getElementById('device-id').value = '';
  document.getElementById('device-modal').classList.add('show');
};

document.getElementById('close-device-modal').onclick = () => {
  document.getElementById('device-modal').classList.remove('show');
};

document.getElementById('device-form').onsubmit = function(e) {
  e.preventDefault();
  const name = document.getElementById('device-name').value.trim();
  const type = document.getElementById('device-type').value.trim();
  const status = document.getElementById('device-status').value;
  const labId = document.getElementById('device-lab').value;
  const deviceId = document.getElementById('device-id').value;
  
  let labs = getLabsData();
  const labIdx = labs.findIndex(l => l.id == labId);
  if (labIdx === -1) return;
  
  let pcs = labs[labIdx].pcs || [];
  
  if (deviceId) {
    pcs = pcs.map(pc => pc.id == deviceId ? { ...pc, name, type, status } : pc);
  } else {
    const newId = pcs.length ? Math.max(...pcs.map(pc => pc.id)) + 1 : 1;
    pcs.push({ id: newId, name, type, status, RAM: '', GPU: '', CPU: '' });
  }
  
  labs[labIdx].pcs = pcs;
  setLabsData(labs);
  document.getElementById('device-modal').classList.remove('show');
  renderDevices();
  renderAllDevices();
  updateDashboardStats();
};

window.editDevice = function(event, deviceId) {
  event.stopPropagation();
  const labs = getLabsData();
  let device = null;
  let labId = null;
  
  for (const lab of labs) {
    if (lab.pcs) {
      const pc = lab.pcs.find(p => p.id === deviceId);
      if (pc) {
        device = pc;
        labId = lab.id;
        break;
      }
    }
  }
  
  if (!device) return;
  
  document.getElementById('device-modal-title').textContent = 'Update Device';
  document.getElementById('device-name').value = device.name;
  document.getElementById('device-type').value = device.type;
  document.getElementById('device-status').value = device.status;
  document.getElementById('device-lab').value = labId;
  document.getElementById('device-id').value = device.id;
  document.getElementById('device-modal').classList.add('show');
};

window.deleteDevice = function(event, deviceId) {
  event.stopPropagation();
  if (!confirm('Delete this device?')) return;
  
  let labs = getLabsData();
  labs.forEach(lab => {
    if (lab.pcs) {
      lab.pcs = lab.pcs.filter(pc => pc.id !== deviceId);
    }
  });
  
  setLabsData(labs);
  renderDevices();
  renderAllDevices();
  updateDashboardStats();
};

// ==================== Users Management ====================
function renderUsers() {
  const users = getUsersData();
  const tbody = document.getElementById('users-body');
  tbody.innerHTML = '';
  
  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.username}</td>
      <td><span class="role-badge ${user.role}">${user.role}</span></td>
      <td>${user.createdDate || 'N/A'}</td>
      <td>
        <button class="action-btn" onclick="editUser(event, ${user.id})">Edit</button>
        <button class="action-btn delete" onclick="deleteUser(event, ${user.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('add-user-btn').onclick = () => {
  document.getElementById('user-modal-title').textContent = 'Add User';
  document.getElementById('user-form').reset();
  document.getElementById('user-id').value = '';
  document.getElementById('user-modal').classList.add('show');
};

document.getElementById('close-user-modal').onclick = () => {
  document.getElementById('user-modal').classList.remove('show');
};

document.getElementById('user-form').onsubmit = function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const role = document.getElementById('user-role').value;
  const userId = document.getElementById('user-id').value;
  
  let users = getUsersData();
  
  if (userId) {
    users = users.map(u => u.id == userId ? { ...u, username, password, role } : u);
  } else {
    const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    users.push({ id: newId, username, password, role, createdDate: new Date().toISOString().split('T')[0] });
  }
  
  setUsersData(users);
  document.getElementById('user-modal').classList.remove('show');
  renderUsers();
  updateDashboardStats();
};

window.editUser = function(event, userId) {
  event.stopPropagation();
  const users = getUsersData();
  const user = users.find(u => u.id === userId);
  if (!user) return;
  
  document.getElementById('user-modal-title').textContent = 'Update User';
  document.getElementById('username').value = user.username;
  document.getElementById('password').value = user.password;
  document.getElementById('user-role').value = user.role;
  document.getElementById('user-id').value = user.id;
  document.getElementById('user-modal').classList.add('show');
};

window.deleteUser = function(event, userId) {
  event.stopPropagation();
  if (!confirm('Delete this user?')) return;
  
  let users = getUsersData();
  users = users.filter(u => u.id !== userId);
  setUsersData(users);
  renderUsers();
  updateDashboardStats();
};

// ==================== All Devices View ====================
function renderAllDevices() {
  const labs = getLabsData();
  const tbody = document.getElementById('all-devices-body');
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
            <button class="action-btn" onclick="editDevice(event, ${pc.id})">Edit</button>
            <button class="action-btn delete" onclick="deleteDevice(event, ${pc.id})">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  });
}

// ==================== Reports ====================
window.generateReport = function(type) {
  const labs = getLabsData();
  let content = '';
  let filename = '';
  
  switch(type) {
    case 'inventory':
      content = 'INVENTORY REPORT\n' + '='.repeat(40) + '\n\n';
      labs.forEach(lab => {
        content += `Lab: ${lab.name}\n`;
        content += `Location: ${lab.location || 'N/A'}\n`;
        content += `Capacity: ${lab.capacity || 0}\n`;
        if (lab.pcs) {
          lab.pcs.forEach(pc => {
            content += `  - ${pc.name} (${pc.type}): ${pc.status}\n`;
          });
        }
        content += '\n';
      });
      filename = 'inventory_report.txt';
      break;
    case 'status':
      content = 'DEVICE STATUS REPORT\n' + '='.repeat(40) + '\n\n';
      let total = 0, functional = 0, maintenance = 0, oos = 0;
      labs.forEach(lab => {
        if (lab.pcs) {
          lab.pcs.forEach(pc => {
            total++;
            if (pc.status === 'Functional') functional++;
            else if (pc.status === 'Maintenance') maintenance++;
            else if (pc.status === 'Out of Service') oos++;
          });
        }
      });
      content += `Total Devices: ${total}\n`;
      content += `Functional: ${functional}\n`;
      content += `Under Maintenance: ${maintenance}\n`;
      content += `Out of Service: ${oos}\n`;
      filename = 'status_report.txt';
      break;
    case 'labs':
      content = 'LABORATORY UTILIZATION REPORT\n' + '='.repeat(40) + '\n\n';
      labs.forEach(lab => {
        const deviceCount = lab.pcs ? lab.pcs.length : 0;
        const utilization = lab.capacity ? Math.round((deviceCount / lab.capacity) * 100) : 0;
        content += `Lab: ${lab.name}\n`;
        content += `Capacity: ${lab.capacity || 0}\n`;
        content += `Devices: ${deviceCount}\n`;
        content += `Utilization: ${utilization}%\n\n`;
      });
      filename = 'labs_report.txt';
      break;
    case 'maintenance':
      content = 'MAINTENANCE REPORT\n' + '='.repeat(40) + '\n\n';
      labs.forEach(lab => {
        if (lab.pcs) {
          lab.pcs.forEach(pc => {
            if (pc.status === 'Maintenance') {
              content += `Lab: ${lab.name}\n`;
              content += `Device: ${pc.name}\n`;
              content += `Type: ${pc.type}\n\n`;
            }
          });
        }
      });
      filename = 'maintenance_report.txt';
      break;
  }
  
  // Download file
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ==================== Settings ====================
window.exportData = function() {
  const data = {
    labs: getLabsData(),
    users: getUsersData(),
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'stockflow_backup.json';
  a.click();
  URL.revokeObjectURL(url);
};

window.importData = function(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.labs) setLabsData(data.labs);
      if (data.users) setUsersData(data.users);
      alert('Data imported successfully!');
      location.reload();
    } catch (err) {
      alert('Error importing data: ' + err.message);
    }
  };
  reader.readAsText(file);
};

window.resetData = function() {
  if (!confirm('Are you sure you want to reset all data? This cannot be undone.')) return;
  localStorage.removeItem(LABS_STORAGE_KEY);
  localStorage.removeItem(USERS_STORAGE_KEY);
  alert('Data reset successfully!');
  location.reload();
};

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
  renderLabs();
  renderDevices();
  renderUsers();
  renderAllDevices();
  updateDashboardStats();
  
  // Close modals on outside click
  window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
      event.target.classList.remove('show');
    }
  };
});
