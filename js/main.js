import { updateDashboard } from "./dashboard.js";
import { createInventoryCards } from "./inventory.js";

const inventoryData = {
  totalDevices: 320,
  workingDevices: 278,
  outOfService: 42,
  numberOfLabs: 12,
  deviceTypes: [
    { name: "PCs", working: 100, underRepair: 15, outOfService: 5 },
    { name: "Printers", working: 25, underRepair: 3, outOfService: 2 },
    { name: "Projectors", working: 12, underRepair: 2, outOfService: 1 },
    { name: "Routers", working: 20, underRepair: 3, outOfService: 2 },
  ],
};

// Dashboard charts
updateDashboard(inventoryData);
createInventoryCards(inventoryData);
