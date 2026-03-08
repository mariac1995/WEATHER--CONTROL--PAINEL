# Weather Control Painel

Um painel de clima baseado em Flask que fornece informações meteorológicas em tempo real usando a API OpenWeatherMap.

## Funcionalidades

- Exibição do clima atual para qualquer cidade
- Previsão do tempo para 5 dias
- Previsão hourly para o dia atual
- Atualizações em tempo real via WebSocket
- Interface bonita e responsiva

## Pré-requisitos

- Python 3.8 ou superior
- Chave da API OpenWeatherMap

## Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd weather-control-painel
```

2. Crie um ambiente virtual (opcional, mas recomendado):

```bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

3. Instale as dependências:

```bash
pip install -r requirements.txt
```

4. Atualize a chave da API em `app.py`:

```python
API_KEY = "sua-chave-aqui"
```

## Uso

Execute a aplicação:

```bash
python app.py
```

Abra seu navegador e navegue até:

```
http://127.0.0.1:5000
```

Digite o nome de uma cidade para ver as informações climáticas.

## Estrutura do Projeto

```
weather-control-painel/
├── app.py
├── requirements.txt
├── .gitignore
├── README.md
├── static/
│   ├── script.js
│   └── style.css
├── images/
│   └── background.jpg
└── templates/
    └── index.html
```

## Tecnologias Utilizadas

- **Backend**: Flask, Flask-Sock, Python
- **Frontend**: HTML, CSS, JavaScript
- **API**: OpenWeatherMap

## Licença

Licença MIT
