from flask import Flask, render_template
from flask_sock import Sock
import requests
import json
import time

app = Flask(__name__, template_folder=".")
sock = Sock(app)

API_KEY = "74cb4ad5057ea96dff6d0bc51ea7323b"

@app.route("/")
def index():
    return render_template("index.html")


def pegar_clima(cidade):

    url = f"https://api.openweathermap.org/data/2.5/forecast?q={cidade}&appid={API_KEY}&units=metric&lang=pt_br"
    r = requests.get(url)
    dados = r.json()

    previsoes_horas = []
    previsao_5dias = []

    for item in dados["list"][:8]:
        previsoes_horas.append({
            "hora": item["dt_txt"][11:16],
            "temp": item["main"]["temp"],
            "umidade": item["main"]["humidity"]
        })

    for item in dados["list"]:
        if "12:00:00" in item["dt_txt"]:
            previsao_5dias.append({
                "dia": item["dt_txt"][:10],
                "temp": item["main"]["temp"],
                "icone": item["weather"][0]["icon"]
            })

    atual = dados["list"][0]

    return {
        "cidade": dados["city"]["name"],
        "temp": atual["main"]["temp"],
        "umidade": atual["main"]["humidity"],
        "icone": atual["weather"][0]["icon"],
        "condicao": atual["weather"][0]["description"],
        "horas": previsoes_horas,
        "dias": previsao_5dias[:5]
    }


@sock.route("/ws")
def ws(ws):
    while True:
        cidade = ws.receive()
        clima = pegar_clima(cidade)
        ws.send(json.dumps(clima))


if __name__ == "__main__":
    app.run(debug=True)
