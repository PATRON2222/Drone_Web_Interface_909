from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

PARAMS_DIR = "params"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/params/<filename>')
def serve_param(filename):
    return send_from_directory(PARAMS_DIR, filename)

@app.route('/static/js/script.js')
def script():
    return send_from_directory('static/js', 'script.js')

@app.route('/static/css/styles.css')
def styles():
    return send_from_directory('static/css', 'styles.css')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

PARAMS_DIR = os.path.join(os.getcwd(), "params")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/params/<filename>')
def serve_param(filename):
    return send_from_directory(PARAMS_DIR, filename)

@app.route('/static/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)