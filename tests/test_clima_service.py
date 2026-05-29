import os
import unittest
from unittest.mock import Mock, patch

from services import clima_service


def fake_forecast_payload():
    items = []
    for index in range(8):
        items.append({
            "dt_txt": f"2026-05-29 {index * 3:02d}:00:00",
            "main": {
                "temp": 20 + index,
                "humidity": 70 + index,
            },
            "weather": [{
                "icon": "01d",
                "description": "ceu limpo",
            }],
        })

    items.append({
        "dt_txt": "2026-05-30 12:00:00",
        "main": {
            "temp": 25,
            "humidity": 65,
        },
        "weather": [{
            "icon": "02d",
            "description": "algumas nuvens",
        }],
    })

    return {
        "city": {"name": "Belo Horizonte"},
        "list": items,
    }


class ClimaServiceTest(unittest.TestCase):
    def setUp(self):
        os.environ["OPENWEATHER_API_KEY"] = "fake-key"
        clima_service._cache.clear()

    def test_pegar_clima_usa_cache_para_mesma_cidade(self):
        resposta = Mock()
        resposta.status_code = 200
        resposta.json.return_value = fake_forecast_payload()
        resposta.raise_for_status.return_value = None

        with patch("services.clima_service.requests.get", return_value=resposta) as get:
            primeiro_resultado = clima_service.pegar_clima("Belo Horizonte")
            segundo_resultado = clima_service.pegar_clima("belo horizonte")

        self.assertEqual("Belo Horizonte", primeiro_resultado["cidade"])
        self.assertEqual(primeiro_resultado, segundo_resultado)
        self.assertEqual(1, get.call_count)

    def test_pegar_clima_rejeita_cidade_vazia(self):
        with self.assertRaises(ValueError):
            clima_service.pegar_clima("   ")


if __name__ == "__main__":
    unittest.main()
