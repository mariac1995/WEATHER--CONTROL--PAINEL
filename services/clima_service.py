import os
import time

import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


CACHE_TTL_SECONDS = 600
_cache = {}


def _cache_key(cidade):
    return cidade.strip().lower()


def _buscar_no_cache(cidade):
    item = _cache.get(_cache_key(cidade))
    if not item:
        return None

    expiracao, dados = item
    if time.time() > expiracao:
        del _cache[_cache_key(cidade)]
        return None

    return dados


def _salvar_no_cache(cidade, dados):
    _cache[_cache_key(cidade)] = (time.time() + CACHE_TTL_SECONDS, dados)


def pegar_clima(cidade):
    api_key = os.environ.get("OPENWEATHER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENWEATHER_API_KEY nao foi configurada.")

    cidade = cidade.strip()
    if not cidade:
        raise ValueError("Digite o nome de uma cidade.")

    dados_em_cache = _buscar_no_cache(cidade)
    if dados_em_cache:
        return dados_em_cache

    url = (
        "https://api.openweathermap.org/data/2.5/forecast"
        f"?q={cidade}&appid={api_key}&units=metric&lang=pt_br"
    )

    resposta = requests.get(url, timeout=10)
    if resposta.status_code == 404:
        raise ValueError("Cidade nao encontrada. Verifique o nome e tente novamente.")
    if resposta.status_code == 401:
        raise RuntimeError("Chave da OpenWeather invalida ou sem permissao.")
    resposta.raise_for_status()

    dados = resposta.json()
    if "list" not in dados:
        raise ValueError("Nao foi possivel encontrar previsao para essa cidade.")

    previsoes_horas = []
    previsao_5dias = []

    for item in dados["list"][:8]:
        previsoes_horas.append({
            "hora": item["dt_txt"][11:16],
            "temp": item["main"]["temp"],
            "umidade": item["main"]["humidity"],
        })

    for item in dados["list"]:
        if "12:00:00" in item["dt_txt"]:
            previsao_5dias.append({
                "dia": item["dt_txt"][:10],
                "temp": item["main"]["temp"],
                "icone": item["weather"][0]["icon"],
            })

    atual = dados["list"][0]

    clima = {
        "cidade": dados["city"]["name"],
        "temp": atual["main"]["temp"],
        "umidade": atual["main"]["humidity"],
        "icone": atual["weather"][0]["icon"],
        "condicao": atual["weather"][0]["description"],
        "horas": previsoes_horas,
        "dias": previsao_5dias[:5],
    }

    _salvar_no_cache(cidade, clima)
    return clima
