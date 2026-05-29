from flask import Flask, render_template
from flask_sock import Sock
import json

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from services.clima_service import pegar_clima

app = Flask(__name__)
sock = Sock(app)

@app.route("/")
def index():
    return render_template("index.html")


@sock.route("/ws")
def ws(ws):
    while True:
        cidade = ws.receive()
        if cidade is None:
            break
        try:
            clima = pegar_clima(cidade)
            ws.send(json.dumps(clima))
        except Exception as erro:
            ws.send(json.dumps({"erro": str(erro)}))


if __name__ == "__main__":
    app.run(debug=True)
