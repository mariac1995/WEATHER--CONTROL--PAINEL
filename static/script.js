const socketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const socketHost = ["5500", "5501"].includes(window.location.port)
  ? "localhost:5000"
  : window.location.host;
const socketUrl = `${socketProtocol}//${socketHost}/ws`;
let socket = null;
let reconnectAttempts = 0;
let lastRequestedCity = "Belo Horizonte";
const cidadeInput = document.getElementById("cidade");
const buscarButton = document.getElementById("buscar");
const listaCidades = document.getElementById("lista-cidades");
const statusMessage = document.getElementById("status");
const tempElement = document.getElementById("temp");
const umidadeElement = document.getElementById("umidade");
const iconeElement = document.getElementById("icone");
const condicaoElement = document.getElementById("condicao");
const forecast = document.getElementById("forecast");
const chartTextStyle = {
  color: "white",
  font: { size: 14, weight: "bold" },
};

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
    layout: {
      padding: 12,
    },
    plugins: {
      legend: {
        labels: {
          ...chartTextStyle,
          boxWidth: 34,
          padding: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          ...chartTextStyle,
          autoSkip: true,
          maxTicksLimit: 5,
          maxRotation: 0,
          minRotation: 0,
        },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: {
          ...chartTextStyle,
          maxTicksLimit: 6,
        },
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
    layout: {
      padding: 12,
    },
    plugins: {
      legend: {
        labels: {
          ...chartTextStyle,
          boxWidth: 34,
          padding: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          ...chartTextStyle,
          autoSkip: true,
          maxTicksLimit: 5,
          maxRotation: 0,
          minRotation: 0,
        },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: {
          ...chartTextStyle,
          maxTicksLimit: 6,
        },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  },
});

function connectSocket() {
  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    reconnectAttempts = 0;
    buscarCidade(lastRequestedCity);
  };

  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);

    if (data.erro) {
      showError(data.erro);
      return;
    }

    renderWeather(data);
  };

  socket.onerror = () => {
    showError("Nao foi possivel conectar ao servidor Flask.");
  };

  socket.onclose = () => {
    scheduleReconnect();
  };
}

function scheduleReconnect() {
  reconnectAttempts += 1;
  const delay = Math.min(1000 * reconnectAttempts, 5000);

  statusMessage.innerText = `Conexao perdida. Tentando reconectar em ${delay / 1000}s...`;
  statusMessage.className = "error";

  setTimeout(connectSocket, delay);
}

cidadeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    buscarCidade(cidadeInput.value);
  }
});

buscarButton.addEventListener("click", () => {
  buscarCidade(cidadeInput.value);
});

function buscarCidade(cidade) {
  const cidadeLimpa = cidade.trim();

  if (!cidadeLimpa) {
    showError("Digite o nome de uma cidade.");
    return;
  }

  lastRequestedCity = cidadeLimpa;

  if (socket.readyState !== WebSocket.OPEN) {
    showError("Servidor ainda nao esta conectado. A busca sera refeita ao reconectar.");
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

connectSocket();

fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((cidade) => {
      const option = document.createElement("option");
      option.value = cidade.nome;
      listaCidades.appendChild(option);
    });
  });
