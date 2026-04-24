export const deviceCharts = {}; // Store chart references globally

export function updateDashboard(inventoryData) {
  // ===== Update Dashboard Cards =====
  const dashboardCards = document.querySelector(".dashboard .cards-container");
  dashboardCards.innerHTML = ""; // Clear previous cards

  const cards = [
    { title: "Total Devices", value: inventoryData.totalDevices },
    { title: "Working Devices", value: inventoryData.workingDevices },
    { title: "Out of Service", value: inventoryData.outOfService },
    { title: "Number of Labs", value: inventoryData.numberOfLabs },
  ];

  cards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.innerHTML = `<h3>${card.title}</h3><p>${card.value}</p>`;
    dashboardCards.appendChild(cardDiv);
  });

  // ===== Update Main Bar Chart =====
  const ctx = document.getElementById("devicesChart").getContext("2d");

  // Data for bar chart
 const totalUnderRepair = inventoryData.deviceTypes.reduce((a, d) => a + d.underRepair, 0);
const available =
  inventoryData.totalDevices - (inventoryData.workingDevices + inventoryData.outOfService + totalUnderRepair);

const barData = [
  inventoryData.workingDevices,
  inventoryData.outOfService,
  totalUnderRepair,
  available,
];

  if (deviceCharts.barChart) {
    // Update existing chart
    deviceCharts.barChart.data.datasets[0].data = barData;
    deviceCharts.barChart.update();
  } else {
    // Create new chart
    deviceCharts.barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Working", "Out of Service", "Under Repair", "Available"],
        datasets: [
          {
            label: "Devices Status",
            data: barData,
            backgroundColor: ["#4CAF50", "#F44336", "#FFC107", "#2196F3"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: "top" },
          tooltip: { enabled: true },
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 10 } },
        },
      },
    });
  }
}
