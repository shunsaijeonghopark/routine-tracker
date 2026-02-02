const form = document.getElementById("routineForm");
const routineDateInput = document.getElementById("routineDate");
const routineNameInput = document.getElementById("routineName");
const routineScoreInput = document.getElementById("routineScore");
const scoreValue = document.getElementById("scoreValue");
const routineList = document.getElementById("routineList");
const selectedDateTitle = document.getElementById("selectedDateTitle");
const todayAverage = document.getElementById("todayAverage");
const todayCount = document.getElementById("todayCount");
const dateStats = document.getElementById("dateStats");

const STORAGE_KEY = "routineTrackerData";
let chart;

const today = new Date().toISOString().split("T")[0];
routineDateInput.value = today;

const loadData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { dates: {} };
  }
  return JSON.parse(saved);
};

const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const calculateStats = (entries = []) => {
  if (entries.length === 0) {
    return { total: 0, average: 0 };
  }
  const total = entries.reduce((sum, entry) => sum + entry.score, 0);
  return {
    total,
    average: Math.round(total / entries.length),
  };
};

const updateTodaySummary = (data) => {
  const entries = data.dates[today] || [];
  const stats = calculateStats(entries);
  todayAverage.textContent = stats.average;
  todayCount.textContent = entries.length;
};

const renderRoutineList = (data, selectedDate) => {
  const entries = data.dates[selectedDate] || [];
  routineList.innerHTML = "";
  selectedDateTitle.textContent = `${selectedDate} 루틴`;

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "아직 기록된 루틴이 없습니다.";
    empty.className = "chart-subtitle";
    routineList.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "routine-item";
    const name = document.createElement("strong");
    name.textContent = entry.name;
    const score = document.createElement("span");
    score.className = "routine-score";
    score.textContent = `${entry.score}점`;
    item.append(name, score);
    routineList.appendChild(item);
  });
};

const buildChartData = (data) => {
  const dates = Object.keys(data.dates).sort();
  const averages = dates.map((date) => calculateStats(data.dates[date]).average);
  return { dates, averages };
};

const renderStatsSummary = (data) => {
  const dates = Object.keys(data.dates);
  if (dates.length === 0) {
    dateStats.innerHTML = "";
    return;
  }

  const allScores = dates.flatMap((date) => data.dates[date].map((entry) => entry.score));
  const overallAverage = Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length);
  const highest = Math.max(...allScores);

  dateStats.innerHTML = "";
  const averageCard = document.createElement("div");
  averageCard.className = "stat-card";
  averageCard.innerHTML = `<span>전체 평균 점수</span><span>${overallAverage}점</span>`;
  const highCard = document.createElement("div");
  highCard.className = "stat-card";
  highCard.innerHTML = `<span>최고 점수</span><span>${highest}점</span>`;
  dateStats.append(averageCard, highCard);
};

const renderChart = (data) => {
  const { dates, averages } = buildChartData(data);
  const ctx = document.getElementById("scoreChart");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "평균 점수",
          data: averages,
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.15)",
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#4f46e5",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
};

const refreshUI = () => {
  const data = loadData();
  updateTodaySummary(data);
  renderRoutineList(data, routineDateInput.value);
  renderChart(data);
  renderStatsSummary(data);
};

routineScoreInput.addEventListener("input", (event) => {
  scoreValue.textContent = event.target.value;
});

routineDateInput.addEventListener("change", () => {
  refreshUI();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = loadData();
  const date = routineDateInput.value;
  const name = routineNameInput.value.trim();
  const score = Number(routineScoreInput.value);

  if (!data.dates[date]) {
    data.dates[date] = [];
  }

  data.dates[date].push({ name, score });
  saveData(data);

  routineNameInput.value = "";
  routineScoreInput.value = 70;
  scoreValue.textContent = 70;

  refreshUI();
});

refreshUI();
