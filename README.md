# Weather Control Panel

Um painel de controle meteorológico interativo construído com Flask, que exibe informações climáticas em tempo real usando a API OpenWeatherMap.

## 🚀 Funcionalidades

- **Consulta por Cidade**: Digite o nome de qualquer cidade para obter informações meteorológicas
- **Dados em Tempo Real**: Temperatura atual, umidade e condição climática
- **Gráficos Interativos**: Visualização de temperatura e umidade usando Chart.js
- **Previsão de 5 Dias**: Previsão meteorológica para os próximos 5 dias
- **Interface em Português**: Totalmente traduzido para português brasileiro
- **WebSocket**: Comunicação em tempo real para atualizações rápidas

## 🛠️ Tecnologias

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **WebSocket**: Flask-Sock
- **Gráficos**: Chart.js
- **API**: OpenWeatherMap

## 📋 Pré-requisitos

- Python 3.8+
- Chave da API OpenWeatherMap

## ⚙️ Instalação

1. Clone o repositório:

```bash
git clone https://github.com/mariac1995/WEATHER--CONTROL--PAINEL.git
cd WEATHER--CONTROL--PAINEL
```

2. Crie um ambiente virtual (opcional mas recomendado):

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. Instale as dependências:

```bash
pip install -r requirements.txt
```

4. Execute o aplicativo:

```bash
python app.py
```

5. Abra o navegador e vá para:

```
http://127.0.0.1:5000
```

## 📁 Estrutura do Projeto

```
weather-control-painel/
├── app.py                 # Aplicativo principal Flask
├── requirements.txt       # Dependências Python
├── templates/
│   └── index.html        # Página principal
└── static/
    ├── style.css         # Estilos CSS
    ├── script.js         # JavaScript do frontend
    └── images/           # Imagens
```

## 🔧 Configuração

A API Key do OpenWeatherMap está configurada no arquivo `app.py`. Para usar sua própria chave:

1. Obtenha uma chave gratuita em: https://openweathermap.org/api
2. Substitua o valor de `API_KEY` no arquivo `app.py`:

```python
API_KEY = "sua_chave_aqui"
```

## 📱 Como Usar

1. Na página inicial, digite o nome de uma cidade no campo de busca
2. Pressione Enter ou aguarde a consulta automática
3. Visualize os dados meteorológicos atuais
4. Observe os gráficos de temperatura e umidade
5. Veja a previsão para os próximos 5 dias

## 📄 Licença

Este projeto é apenas para fins educacionais.

## 👤 Autor

Maria C.
