from flask import Flask, render_template
from flask_sock import Sock
import os
import requests
import json

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__, template_folder=".")
sock = Sock(app)

API_KEY = os.environ.get("OPENWEATHER_API_KEY")

@app.route("/")
def index():
    return render_template("index.html")


def pegar_clima(cidade):
    if not API_KEY:
        raise RuntimeError("OPENWEATHER_API_KEY nao foi configurada.")

    cidade = cidade.strip()
    if not cidade:
        raise ValueError("Digite o nome de uma cidade.")

    url = f"https://api.openweathermap.org/data/2.5/forecast?q={cidade}&appid={API_KEY}&units=metric&lang=pt_br"
    r = requests.get(url, timeout=10)
    if r.status_code == 404:
        raise ValueError("Cidade nao encontrada. Verifique o nome e tente novamente.")
    if r.status_code == 401:
        raise RuntimeError("Chave da OpenWeather invalida ou sem permissao.")
    r.raise_for_status()
    dados = r.json()

    if "list" not in dados:
        raise ValueError("Nao foi possivel encontrar previsao para essa cidade.")

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
        try:
            clima = pegar_clima(cidade)
            ws.send(json.dumps(clima))
        except Exception as erro:
            ws.send(json.dumps({"erro": str(erro)}))


if __name__ == "__main__":
    app.run(debug=True)
