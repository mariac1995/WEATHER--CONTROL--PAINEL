const socketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const socketHost = ["5500", "5501"].includes(window.location.port)
  ? "localhost:5000"
  : window.location.host;
const socket = new WebSocket(`${socketProtocol}//${socketHost}/ws`);
const cidadeInput = document.getElementById("cidade");
const listaCidades = document.getElementById("lista-cidades");
const statusMessage = document.getElementById("status");
const tempElement = document.getElementById("temp");
const umidadeElement = document.getElementById("umidade");
const iconeElement = document.getElementById("icone");
const condicaoElement = document.getElementById("condicao");
const forecast = document.getElementById("forecast");

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
    responsive: true,
    maintainAspectRatio: false,
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
    responsive: true,
    maintainAspectRatio: false,
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
    showError(data.erro);
    return;
  }

  renderWeather(data);
};

socket.onopen = () => {
  buscarCidade("Belo Horizonte");
};

socket.onerror = () => {
  showError("Nao foi possivel conectar ao servidor Flask.");
};

socket.onclose = () => {
  showError("Conexao com o servidor encerrada.");
};

cidadeInput.addEventListener("change", () => {
  buscarCidade(cidadeInput.value);
});

function buscarCidade(cidade) {
  const cidadeLimpa = cidade.trim();

  if (!cidadeLimpa) {
    showError("Digite o nome de uma cidade.");
    return;
  }

  if (socket.readyState !== WebSocket.OPEN) {
    showError("Servidor ainda nao esta conectado. Tente novamente em alguns segundos.");
    return;
  }

  setLoading(cidadeLimpa);
  socket.send(cidadeLimpa);
}

function setLoading(cidade) {
  statusMessage.innerText = `Buscando previsao para ${cidade}...`;
  statusMessage.className = "loading";
  tempElement.innerText = "--";
  umidadeElement.innerText = "--";
  iconeElement.removeAttribute("src");
  iconeElement.removeAttribute("alt");
  condicaoElement.innerText = "Carregando...";
  forecast.innerHTML = '<p class="forecast-status">Carregando previsao...</p>';
}

function showError(message) {
  statusMessage.innerText = message;
  statusMessage.className = "error";
  tempElement.innerText = "--";
  umidadeElement.innerText = "--";
  iconeElement.removeAttribute("src");
  iconeElement.alt = "";
  condicaoElement.innerText = "Sem dados";
  forecast.innerHTML = '<p class="forecast-status">Nenhuma previsao disponivel.</p>';
  clearCharts();
}

function renderWeather(data) {
  statusMessage.innerText = `Dados atualizados para ${data.cidade}.`;
  statusMessage.className = "success";
  tempElement.innerText = data.temp + " °C";
  umidadeElement.innerText = data.umidade + " %";

  iconeElement.src =
    "https://openweathermap.org/img/wn/" + data.icone + "@2x.png";
  iconeElement.alt = data.condicao;
  condicaoElement.innerText = data.condicao;

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
}

function clearCharts() {
  tempChart.data.labels = [];
  tempChart.data.datasets[0].data = [];
  tempChart.update();

  humChart.data.labels = [];
  humChart.data.datasets[0].data = [];
  humChart.update();
}

fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((cidade) => {
      const option = document.createElement("option");
      option.value = cidade.nome;
      listaCidades.appendChild(option);
    });
  });
