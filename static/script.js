const socketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const socketHost = ["5500", "5501"].includes(window.location.port)
  ? "localhost:5000"
  : window.location.host;
const socket = new WebSocket(`${socketProtocol}//${socketHost}/ws`);

const tempChart = new Chart(document.getElementById("tempChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Temperatura",
        data: [],
        borderColor: "#ffbc58",
        backgroundColor: "#ffbc58",
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
      },
    ],
  },
  options: {
    plugins: {
      legend: {
        labels: { color: "white", font: { size: 14, weight: "bold" } },
      },
    },
    scales: {
      x: {
        ticks: { color: "white", font: { weight: "bold" } },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "white", font: { weight: "bold" } },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  },
});

const humChart = new Chart(document.getElementById("humChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Umidade",
        data: [],
        borderColor: "#00ffcc",
        backgroundColor: "#00ffcc",
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
      },
    ],
  },
  options: {
    plugins: {
      legend: {
        labels: { color: "white", font: { size: 14, weight: "bold" } },
      },
    },
    scales: {
      x: {
        ticks: { color: "white", font: { weight: "bold" } },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "white", font: { weight: "bold" } },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  },
});

socket.onmessage = function (event) {
  const data = JSON.parse(event.data);

  if (data.erro) {
    document.getElementById("temp").innerText = "--";
    document.getElementById("umidade").innerText = "--";
    document.getElementById("condicao").innerText = data.erro;
    return;
  }

  document.getElementById("temp").innerText = data.temp + " °C";
  document.getElementById("umidade").innerText = data.umidade + " %";

  document.getElementById("icone").src =
    "https://openweathermap.org/img/wn/" + data.icone + "@2x.png";
  document.getElementById("icone").alt = data.condicao;
  document.getElementById("condicao").innerText = data.condicao;

  let labels = [];
  let temps = [];
  let hums = [];

  data.horas.forEach((h) => {
    labels.push(h.hora);
    temps.push(h.temp);
    hums.push(h.umidade);
  });

  tempChart.data.labels = labels;
  tempChart.data.datasets[0].data = temps;
  tempChart.update();

  humChart.data.labels = labels;
  humChart.data.datasets[0].data = hums;
  humChart.update();

  const forecast = document.getElementById("forecast");

  forecast.innerHTML = "";

  data.dias.forEach((d) => {
    forecast.innerHTML += `
<div class="day">

<p>${d.dia}</p>

<img src="https://openweathermap.org/img/wn/${d.icone}.png">

<p>${d.temp}°C</p>

</div>
`;
  });
};

const cidadeInput = document.getElementById("cidade");
const listaCidades = document.getElementById("lista-cidades");

socket.onopen = () => {
  socket.send("Belo Horizonte");
};

cidadeInput.addEventListener("change", () => {
  const cidade = cidadeInput.value;
  socket.send(cidade);
});

fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((cidade) => {
      const option = document.createElement("option");
      option.value = cidade.nome;
      listaCidades.appendChild(option);
    });
  });
