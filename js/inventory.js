import { updateDashboard, deviceCharts } from "./dashboard.js";

export function createInventoryCards(inventoryData) {
  const inventoryContainer = document.querySelector(
    ".dashboard .cards-container"
  );
  inventoryContainer.innerHTML = ""; // Clear old cards

  inventoryData.deviceTypes.forEach((device, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.innerHTML = `
      <h3>${device.name}</h3>
      <p>Total: ${device.working + device.underRepair + device.outOfService}</p>
      <canvas id="chart-${index}"></canvas>
    `;
    inventoryContainer.appendChild(cardDiv);

    // Doughnut chart
    const ctx = document.getElementById(`chart-${index}`).getContext("2d");
    const doughnut = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Working", "Under Repair", "Out of Service"],
        datasets: [
          {
            label: `${device.name} Status`,
            data: [device.working, device.underRepair, device.outOfService],
            backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });

    // Save chart reference for future updates
    deviceCharts[device.name] = doughnut;
  });

  // Update the main dashboard
  updateDashboard(inventoryData);
}
